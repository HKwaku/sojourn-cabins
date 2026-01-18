// app/api/exchange-rates/update/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Only enforce auth in production
    if (process.env.NODE_ENV === 'production') {
      const authHeader = request.headers.get('authorization');
      const cronSecret = process.env.CRON_SECRET;
      const vercelCron = request.headers.get('x-vercel-cron');
      
      if (!vercelCron && (!cronSecret || authHeader !== `Bearer ${cronSecret}`)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const apiKey = process.env.EXCHANGERATES_API_KEY;
    
    if (!apiKey) {
      throw new Error('EXCHANGERATES_API_KEY not configured');
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const url = `http://api.exchangeratesapi.io/v1/latest?access_key=${apiKey}&symbols=USD,GHS,GBP,EUR`;
    console.log('Fetching exchange rates...');
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.info || data.error?.type || 'API returned error');
    }
    
    const today = new Date().toISOString().split('T')[0];
    const apiBase = data.base; // EUR (from API)
    
    // Get GHS rate relative to EUR
    const ghsToEurRate = data.rates.GHS as number;
    
    if (!ghsToEurRate) {
      throw new Error('GHS rate not found in API response');
    }
    
    console.log(`EUR to GHS rate: ${ghsToEurRate}`);
    console.log('Converting all rates to GHS base...');
    
    // Use a Map to prevent duplicates
    const ratesMap = new Map<string, any>();
    
    // Helper function to add rate to map (prevents duplicates)
    const addRate = (base: string, target: string, rate: number) => {
      const key = `${base}-${target}-${today}`;
      if (!ratesMap.has(key)) {
        ratesMap.set(key, {
          base_currency: base,
          target_currency: target,
          rate: rate,
          date: today
        });
      }
    };
    
    // Convert all rates to GHS base
    // Formula: If EUR -> Currency is X, and EUR -> GHS is Y
    // Then GHS -> Currency = X / Y
    Object.entries(data.rates).forEach(([currency, eurRate]) => {
      if (currency !== 'GHS') {
        const ghsRate = (eurRate as number) / ghsToEurRate;
        
        // GHS to other currency
        addRate('GHS', currency, ghsRate);
        // Other currency to GHS (inverse)
        addRate(currency, 'GHS', 1 / ghsRate);
      }
    });
    
    // GHS to GHS = 1
    addRate('GHS', 'GHS', 1);
    
    // Also add cross rates between other currencies for convenience
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
    
    // Convert Map to array
    const allRates = Array.from(ratesMap.values());
    
    console.log(`Upserting ${allRates.length} unique exchange rates for ${today} (GHS base)`);
    
    // Show sample GHS rates
    const ghsRates = allRates.filter(r => r.base_currency === 'GHS');
    console.log('Sample GHS rates:', ghsRates.slice(0, 5));
    
    // Insert rates in batches
    const batchSize = 50;
    let totalInserted = 0;
    
    for (let i = 0; i < allRates.length; i += batchSize) {
      const batch = allRates.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('exchange_rates')
        .upsert(batch, {
          onConflict: 'base_currency,target_currency,date',
          ignoreDuplicates: false
        });
      
      if (error) {
        console.error('Batch error:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      totalInserted += batch.length;
    }
    
    console.log(`Success! Total rates inserted/updated: ${totalInserted}`);
    
    return NextResponse.json({
      success: true,
      message: 'Exchange rates updated successfully (GHS base)',
      date: today,
      ratesCount: totalInserted,
      ghsRates: {
        'GHS to USD': allRates.find(r => r.base_currency === 'GHS' && r.target_currency === 'USD')?.rate,
        'GHS to EUR': allRates.find(r => r.base_currency === 'GHS' && r.target_currency === 'EUR')?.rate,
        'GHS to GBP': allRates.find(r => r.base_currency === 'GHS' && r.target_currency === 'GBP')?.rate,
      }
    });
    
  } catch (error: any) {
    console.error('Exchange rate update error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('exchange_rates')
      .select('*')
      .order('date', { ascending: false })
      .order('base_currency', { ascending: true })
      .limit(100);
    
    if (error) throw error;
    
    const groupedByDate: Record<string, any[]> = {};
    data.forEach((rate: any) => {
      if (!groupedByDate[rate.date]) {
        groupedByDate[rate.date] = [];
      }
      groupedByDate[rate.date].push(rate);
    });
    
    return NextResponse.json({ 
      success: true, 
      rates: data,
      groupedByDate,
      totalRecords: data.length
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}