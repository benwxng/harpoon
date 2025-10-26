import { NextResponse } from "next/server";

const GAMMA_API = "https://gamma-api.polymarket.com";
const CLOB_API = "https://clob.polymarket.com";

interface Trade {
  id: string;
  market: string;
  side: "BUY" | "SELL";
  size: string;
  price: string;
  timestamp: number;
  outcome: string;
}

export async function GET() {
  try {
    // 1. Fetch politics markets from Gamma API
    const marketsResponse = await fetch(
      `${GAMMA_API}/markets?tag=Politics&active=true&closed=false&limit=50`,
      {
        next: { revalidate: 3600 }, // Cache for 1 minute
      }
    );

    if (!marketsResponse.ok) {
      throw new Error("Failed to fetch markets");
    }

    const markets = await marketsResponse.json();

    // 2. Get trades for each market and filter for whales
    const whaleTrades = [];
    const oneDayAgo = Math.floor(Date.now() / 1000) - 24 * 60 * 60;
    const WHALE_THRESHOLD = 10000; // $10k+ trades

    for (const market of markets.slice(0, 20)) {
      // Limit to top 20 markets for performance
      try {
        const tradesResponse = await fetch(
          `${CLOB_API}/trades?market=${market.condition_id}&start_ts=${oneDayAgo}`,
          {
            next: { revalidate: 30 }, // Cache for 30 seconds
          }
        );

        if (tradesResponse.ok) {
          const trades = await tradesResponse.json();

          // Filter for whale trades (large dollar amounts)
          const marketWhaleTrades = trades
            .filter((trade: any) => {
              const tradeValue =
                parseFloat(trade.size) * parseFloat(trade.price);
              return tradeValue >= WHALE_THRESHOLD;
            })
            .map((trade: any) => ({
              id: trade.id,
              market: market.question,
              marketId: market.condition_id,
              side: trade.side,
              size: trade.size,
              price: trade.price,
              tradeValue: parseFloat(trade.size) * parseFloat(trade.price),
              timestamp: trade.timestamp,
              outcome: trade.outcome,
              maker: trade.maker_address,
            }));

          whaleTrades.push(...marketWhaleTrades);
        }
      } catch (error) {
        console.error(
          `Error fetching trades for market ${market.condition_id}:`,
          error
        );
        // Continue with next market
      }
    }

    // 3. Sort by trade value (biggest first) and limit results
    const sortedWhaleTrades = whaleTrades
      .sort((a, b) => b.tradeValue - a.tradeValue)
      .slice(0, 50); // Top 50 whale trades

    return NextResponse.json({
      trades: sortedWhaleTrades,
      count: sortedWhaleTrades.length,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching whale trades:", error);
    return NextResponse.json(
      { error: "Failed to fetch whale trades" },
      { status: 500 }
    );
  }
}
