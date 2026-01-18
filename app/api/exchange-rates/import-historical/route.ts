// app/api/exchange-rates/import-historical/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Parse request body for date range
    const body = await request.json();
    const { startDate, endDate, daysBack } = body;
    
    const apiKey = process.env.EXCHANGERATES_API_KEY;
    
    if (!apiKey) {
      throw new Error('EXCHANGERATES_API_KEY not configured');
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Calculate date range
    let dates: string[] = [];
    
    if (daysBack) {
      // Generate dates for the last N days
      const today = new Date();
      for (let i = 0; i < daysBack; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
      }
    } else if (startDate && endDate) {
      // Generate dates between startDate and endDate
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d).toISOString().split('T')[0]);
      }
    } else {
      throw new Error('Please provide either daysBack or startDate/endDate');
    }
    
    console.log(`Fetching historical rates for ${dates.length} dates...`);
    
    const results = {
      total: dates.length,
      successful: 0,
      failed: 0,
      errors: [] as string[]
    };
    
    // Fetch rates for each date
    for (const date of dates) {
      try {
        console.log(`Fetching rates for ${date}...`);
        
        // API endpoint for historical data
        const url = `http://api.exchangeratesapi.io/v1/${date}?access_key=${apiKey}&symbols=USD,GHS,GBP,EUR`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error?.info || 'API returned error');
        }
        
        // Get GHS rate relative to EUR
        const ghsToEurRate = data.rates.GHS as number;
        
        if (!ghsToEurRate) {
          throw new Error('GHS rate not found');
        }
        
        // Use a Map to prevent duplicates
        const ratesMap = new Map<string, any>();
        
        const addRate = (base: string, target: string, rate: number) => {
          const key = `${base}-${target}-${date}`;
          if (!ratesMap.has(key)) {
            ratesMap.set(key, {
              base_currency: base,
              target_currency: target,
              rate: rate,
              date: date
            });
          }
        };
        
        // Convert all rates to GHS base
        Object.entries(data.rates).forEach(([currency, eurRate]) => {
          if (currency !== 'GHS') {
            const ghsRate = (eurRate as number) / ghsToEurRate;
            addRate('GHS', currency, ghsRate);
            addRate(currency, 'GHS', 1 / ghsRate);
          }
        });
        
        addRate('GHS', 'GHS', 1);
        
        // Add cross rates
        const currencies = Object.keys(data.rates);
        currencies.forEach(fromCurrency => {
          currencies.forEach(toCurrency => {
            if (fromCurrency !== toCurrency) {
              const fromToEurRate = data.rates[fromCurrency] as number;
              const toToEurRate = data.rates[toCurrency] as number;
              const crossRate = toToEurRate / fromToEurRate;
              addRate(fromCurrency, toCurrency, crossRate);
            }
          });
        });
        
        const allRates = Array.from(ratesMap.values());
        
        // Insert rates
        const { error } = await supabase
          .from('exchange_rates')
          .upsert(allRates, {
            onConflict: 'base_currency,target_currency,date',
            ignoreDuplicates: false
          });
        
        if (error) throw error;
        
        results.successful++;
        console.log(`✓ ${date}: Inserted ${allRates.length} rates`);
        
        // Add delay to avoid rate limiting (free tier has limits)
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        
      } catch (error: any) {
        results.failed++;
        results.errors.push(`${date}: ${error.message}`);
        console.error(`✗ ${date}: ${error.message}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Historical import completed',
      results
    });
    
  } catch (error: any) {
    console.error('Historical import error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}