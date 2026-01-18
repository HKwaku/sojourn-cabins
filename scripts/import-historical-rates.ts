// scripts/import-historical-rates.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const API_KEY = process.env.EXCHANGERATES_API_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function importHistoricalRates(daysBack: number) {
  console.log(`Importing ${daysBack} days of historical rates...`);
  
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = 0; i < daysBack; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  let successful = 0;
  let failed = 0;
  
  for (const date of dates) {
    try {
      console.log(`\nFetching ${date}...`);
      
      const url = `http://api.exchangeratesapi.io/v1/${date}?access_key=${API_KEY}&symbols=USD,GHS,GBP,EUR`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error?.info || 'API error');
      }
      
      const ghsToEurRate = data.rates.GHS as number;
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
      
      // Convert to GHS base
      Object.entries(data.rates).forEach(([currency, eurRate]) => {
        if (currency !== 'GHS') {
          const ghsRate = (eurRate as number) / ghsToEurRate;
          addRate('GHS', currency, ghsRate);
          addRate(currency, 'GHS', 1 / ghsRate);
        }
      });
      
      addRate('GHS', 'GHS', 1);
      
      // Cross rates
      const currencies = Object.keys(data.rates);
      currencies.forEach(fromCurrency => {
        currencies.forEach(toCurrency => {
          if (fromCurrency !== toCurrency) {
            const fromRate = data.rates[fromCurrency] as number;
            const toRate = data.rates[toCurrency] as number;
            addRate(fromCurrency, toCurrency, toRate / fromRate);
          }
        });
      });
      
      const allRates = Array.from(ratesMap.values());
      
      const { error } = await supabase
        .from('exchange_rates')
        .upsert(allRates, {
          onConflict: 'base_currency,target_currency,date',
          ignoreDuplicates: false
        });
      
      if (error) throw error;
      
      console.log(`✓ Inserted ${allRates.length} rates`);
      successful++;
      
      // Delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error: any) {
      console.error(`✗ Failed: ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n=== Complete ===`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
}

// Run with: node --loader ts-node/esm scripts/import-historical-rates.ts
const daysToImport = parseInt(process.argv[2]) || 30; // Default 30 days
importHistoricalRates(daysToImport);

