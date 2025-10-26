import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('filter') || 'volume';
  const minVolume = parseInt(searchParams.get('minVolume') || '1000000');
  try {
    // Fetch ALL political market data - start with most recent and get everything
    const { data, error } = await supabase
      .from('active_week_data')
      .select('*')
      .order('snapshot_time', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ markets: [] });
    }

    // Get unique markets (most recent snapshot per market)
    const uniqueMarkets = new Map();
    for (const snapshot of data) {
      if (!uniqueMarkets.has(snapshot.market_id)) {
        uniqueMarkets.set(snapshot.market_id, snapshot);
      }
    }

    // Apply filters based on the filter parameter
    let filteredMarkets = Array.from(uniqueMarkets.values())
      .filter(m => {
        const volume = m.volume_24h || 0;
        const yesPrice = (m.yes_price || 0) * 100;
        const noPrice = (m.no_price || 0) * 100;
        
        // Base filter: minimum volume (500k for competitive, 1M for others)
        const volumeThreshold = filter === 'competitive' ? 500000 : minVolume;
        if (volume < volumeThreshold) return false;
        
        // Apply specific filters
        switch (filter) {
          case 'competitive':
            // For competitive, we'll filter by volume first, then sort by competitiveness
            return true; // All $1M+ markets are candidates
          case 'volatile':
            // High price change (if available) - lower threshold since data might be sparse
            const priceChange = Math.abs(m.price_change_1h || 0) * 100;
            return priceChange >= 1; // 1%+ change in 1 hour (lowered threshold)
          case 'volume':
          default:
            // Just volume-based (no additional filter)
            return true;
        }
      });

    // Sort based on filter type
    switch (filter) {
      case 'competitive':
        // Sort by competitiveness: markets closest to 50/50 are most competitive
        filteredMarkets.sort((a, b) => {
          const aYesPrice = (a.yes_price || 0) * 100;
          const aNoPrice = (a.no_price || 0) * 100;
          const bYesPrice = (b.yes_price || 0) * 100;
          const bNoPrice = (b.no_price || 0) * 100;
          
          // Calculate how far from 50/50 each market is
          const aDistanceFrom50 = Math.abs(aYesPrice - 50);
          const bDistanceFrom50 = Math.abs(bYesPrice - 50);
          
          // Markets closer to 50/50 are more competitive (lower distance = higher rank)
          return aDistanceFrom50 - bDistanceFrom50;
        });
        break;
      case 'volatile':
        filteredMarkets.sort((a, b) => {
          const aChange = Math.abs(a.price_change_1h || 0);
          const bChange = Math.abs(b.price_change_1h || 0);
          return bChange - aChange;
        });
        break;
      case 'volume':
      default:
        filteredMarkets.sort((a, b) => (b.volume_24h || 0) - (a.volume_24h || 0));
        break;
    }

    const topMarkets = filteredMarkets.slice(0, 6);

    // Fetch slugs and images from Polymarket API
    const marketsWithData = await Promise.all(
      topMarkets.map(async (m) => {
        let slug = '';
        let imageUrl = '';
        try {
          const response = await fetch(`https://gamma-api.polymarket.com/markets/${m.market_id}`);
          if (response.ok) {
            const apiData = await response.json();
            slug = apiData.slug || '';
            imageUrl = apiData.image || apiData.icon || '';
          }
        } catch (e) {
          console.error(`Failed to fetch data for market ${m.market_id}`);
        }

        return {
          id: m.market_id,
          event_id: m.event_id,
          title: m.market_question || 'Unknown Market',
          yes_price: Math.round((m.yes_price || 0) * 1000) / 10,
          no_price: Math.round((m.no_price || 0) * 1000) / 10,
          volume: m.volume_24h || 0,
          last_updated: m.snapshot_time,
          polymarket_url: slug ? `https://polymarket.com/market/${slug}` : '#',
          image_url: imageUrl,
          price_change_1h: m.price_change_1h ? Math.round(m.price_change_1h * 1000) / 10 : 0,
        };
      })
    );

    return NextResponse.json({ markets: marketsWithData });
  } catch (error) {
    console.error('Error fetching markets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

