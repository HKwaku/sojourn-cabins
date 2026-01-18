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

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Request EUR-based rates for GHS, USD, GBP
    const url = `http://api.exchangeratesapi.io/v1/latest?access_key=${apiKey}&symbols=GHS,USD,GBP`;
    console.log('Fetching EUR-based rates from API...');
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.info || data.error?.type || 'API returned error');
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    console.log(`API returned 3 EUR-based rates`);
    
    const eurToGhs = data.rates.GHS as number;
    const eurToUsd = data.rates.USD as number;
    const eurToGbp = data.rates.GBP as number;
    
    if (!eurToGhs || !eurToUsd || !eurToGbp) {
      throw new Error('Missing required rates from API');
    }
    
    console.log(`Calculating 6 rates with GHS as base...`);
    
    // Calculate the 6 rates with GHS as base
    const rates = [
      {
        base_currency: 'GHS',
        target_currency: 'GBP',
        rate: eurToGbp / eurToGhs,
        date: today,
        description: 'GHS to GBP - calculated from API'
      },
      {
        base_currency: 'GHS',
        target_currency: 'USD',
        rate: eurToUsd / eurToGhs,
        date: today,
        description: 'GHS to USD - calculated from API'
      },
      {
        base_currency: 'GHS',
        target_currency: 'EUR',
        rate: 1 / eurToGhs,
        date: today,
        description: 'GHS to EUR - calculated from API'
      },
      {
        base_currency: 'GBP',
        target_currency: 'EUR',
        rate: 1 / eurToGbp,
        date: today,
        description: 'GBP to EUR - calculated from API'
      },
      {
        base_currency: 'GBP',
        target_currency: 'USD',
        rate: eurToUsd / eurToGbp,
        date: today,
        description: 'GBP to USD - calculated from API'
      },
      {
        base_currency: 'EUR',
        target_currency: 'USD',
        rate: eurToUsd,
        date: today,
        description: 'EUR to USD - from API'
      }
    ];
    
    console.log(`Upserting ${rates.length} exchange rates for ${today}`);
    
    // Insert all rates
    const { error } = await supabase
      .from('exchange_rates')
      .upsert(rates, {
        onConflict: 'base_currency,target_currency,date',
        ignoreDuplicates: false
      });
    
    if (error) {
      console.error('Database error:', error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    console.log(`Success! Inserted/updated ${rates.length} rates`);
    
    return NextResponse.json({
      success: true,
      message: 'Exchange rates updated successfully (GHS base)',
      date: today,
      ratesCount: rates.length,
      apiCallsUsed: 1,
      rates: {
        'GHS to GBP': rates[0].rate,
        'GHS to USD': rates[1].rate,
        'GHS to EUR': rates[2].rate,
        'GBP to EUR': rates[3].rate,
        'GBP to USD': rates[4].rate,
        'EUR to USD': rates[5].rate
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