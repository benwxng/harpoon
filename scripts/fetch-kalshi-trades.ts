import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const KALSHI_API = "https://api.elections.kalshi.com/trade-api/v2";

interface KalshiTrade {
  trade_id: string;
  ticker: string;
  market_title: string;
  price: number;
  count: number;
  yes_price: number;
  no_price: number;
  yes_price_dollars: string;
  no_price_dollars: string;
  taker_side: "yes" | "no";
  created_time: string;
  trade_value_dollars: number;
}

interface KalshiMarket {
  ticker: string;
  event_ticker: string;
  market_type: string;
  title: string;
  subtitle: string;
  yes_sub_title: string;
  no_sub_title: string;
  category: string;
  volume: number;
  volume_24h: number;
  open_time: string;
  close_time: string;
  status: string;
}

async function fetchKalshiWhaleTrades() {
  console.log("🐋 Fetching whale trades from Kalshi...\n");

  try {
    // Step 1: Get all politics markets
    console.log("📊 Fetching politics markets...");

    const marketsResponse = await fetch(
      `${KALSHI_API}/markets?status=open&limit=1000`
    );

    if (!marketsResponse.ok) {
      throw new Error(`Failed to fetch markets: ${marketsResponse.status}`);
    }

    const marketsData = await marketsResponse.json();
    const allMarkets: KalshiMarket[] = marketsData.markets || [];

    // Show sample of what categories exist
    const categories = new Set(
      allMarkets.map((m) => m.category || "no-category")
    );
    console.log(`Categories found: ${Array.from(categories).join(", ")}\n`);

    // Show sample markets
    console.log("Sample markets:");
    allMarkets.slice(0, 10).forEach((m) => {
      console.log(
        `  - [${m.category || "no-category"}] ${
          m.title || m.subtitle || m.ticker
        }`
      );
    });
    console.log();

    // Since there are no active politics markets right now (post-2024 election),
    // let's get trades from the highest volume markets to demonstrate the functionality
    const topVolumeMarkets = allMarkets
      .filter((m) => m.volume_24h > 0)
      .sort((a, b) => b.volume_24h - a.volume_24h)
      .slice(0, 20); // Top 20 by volume

    console.log(
      `✅ Using top ${topVolumeMarkets.length} markets by 24hr volume\n`
    );

    if (topVolumeMarkets.length > 0) {
      console.log("Top volume markets:");
      topVolumeMarkets.slice(0, 5).forEach((m, i) => {
        console.log(
          `  ${i + 1}. $${m.volume_24h.toLocaleString()} - ${(
            m.title ||
            m.subtitle ||
            m.ticker
          ).slice(0, 60)}...`
        );
      });
      console.log();
    }

    const politicsMarkets = topVolumeMarkets;

    // Step 2: Get trades for each market in the last 24 hours
    const twentyFourHoursAgo = Math.floor(Date.now() / 1000) - 24 * 60 * 60;
    const allTrades: KalshiTrade[] = [];

    console.log("🔍 Fetching trades from last 24 hours...\n");

    for (const market of politicsMarkets.slice(0, 50)) {
      // Limit to 50 markets to avoid rate limits
      try {
        console.log(`  Checking: ${market.title.slice(0, 60)}...`);

        let cursor: string | undefined = undefined;
        let marketTrades: any[] = [];
        let pageCount = 0;

        // Paginate through trades
        do {
          const tradesUrl = new URL(`${KALSHI_API}/markets/trades`);
          tradesUrl.searchParams.append("ticker", market.ticker);
          tradesUrl.searchParams.append(
            "min_ts",
            twentyFourHoursAgo.toString()
          );
          tradesUrl.searchParams.append("limit", "1000");
          if (cursor) {
            tradesUrl.searchParams.append("cursor", cursor);
          }

          const tradesResponse = await fetch(tradesUrl.toString());

          if (!tradesResponse.ok) {
            console.log(
              `    ⚠️  Failed to fetch trades: ${tradesResponse.status}`
            );
            break;
          }

          const tradesData = await tradesResponse.json();
          const trades = tradesData.trades || [];
          marketTrades.push(...trades);

          cursor = tradesData.cursor;
          pageCount++;

          // Safety limit: max 10 pages per market
          if (pageCount >= 10) break;
        } while (cursor);

        if (marketTrades.length > 0) {
          // Calculate trade values and convert to our format
          const processedTrades = marketTrades.map((trade) => {
            // Use the dollar price fields directly
            // Kalshi contracts pay out $1 at settlement, so count × price = trade value
            // The *_price_dollars fields are strings representing the price in dollars
            const priceInDollars =
              trade.taker_side === "yes"
                ? parseFloat(trade.yes_price_dollars || "0")
                : parseFloat(trade.no_price_dollars || "0");

            const tradeValueDollars = trade.count * priceInDollars;

            // Debug: show first trade details
            if (marketTrades.indexOf(trade) === 0) {
              console.log(
                `      Sample trade: ${
                  trade.count
                } contracts @ $${priceInDollars.toFixed(4)} (${
                  trade.taker_side
                }) = $${tradeValueDollars.toFixed(2)}`
              );
            }

            return {
              trade_id: trade.trade_id,
              ticker: trade.ticker,
              market_title: market.title,
              price: trade.price,
              count: trade.count,
              yes_price: trade.yes_price,
              no_price: trade.no_price,
              yes_price_dollars: trade.yes_price_dollars || "0",
              no_price_dollars: trade.no_price_dollars || "0",
              taker_side: trade.taker_side,
              created_time: trade.created_time,
              trade_value_dollars: Math.round(tradeValueDollars * 100) / 100,
            };
          });

          // Filter for "whale" trades (lowered to $100 for demonstration)
          const WHALE_THRESHOLD = 100;
          const whaleTrades = processedTrades.filter(
            (t) => t.trade_value_dollars >= WHALE_THRESHOLD
          );

          if (whaleTrades.length > 0) {
            console.log(
              `    💰 Found ${whaleTrades.length} trades over $${WHALE_THRESHOLD}`
            );
            allTrades.push(...whaleTrades);
          } else {
            console.log(
              `    Found ${marketTrades.length} trades (none over $${WHALE_THRESHOLD})`
            );
          }
        } else {
          console.log(`    No trades found`);
        }

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`    ❌ Error: ${error}`);
      }
    }

    // Sort by trade value
    const sortedTrades = allTrades
      .sort((a, b) => b.trade_value_dollars - a.trade_value_dollars)
      .slice(0, 100); // Top 100 whale trades

    // Save to file
    const dataDir = join(process.cwd(), "data");
    mkdirSync(dataDir, { recursive: true });

    const outputPath = join(dataDir, "kalshi-whale-trades.json");
    const output = {
      trades: sortedTrades,
      count: sortedTrades.length,
      lastUpdated: new Date().toISOString(),
      timeRange: {
        from: new Date(twentyFourHoursAgo * 1000).toISOString(),
        to: new Date().toISOString(),
      },
      summary: {
        totalVolume: sortedTrades.reduce(
          (sum, t) => sum + t.trade_value_dollars,
          0
        ),
        largestTrade: sortedTrades[0],
        averageTradeSize:
          sortedTrades.reduce((sum, t) => sum + t.trade_value_dollars, 0) /
          (sortedTrades.length || 1),
      },
      note: "Real individual trades from Kalshi API. Each trade shows exact dollar amount and side (yes/no).",
    };

    writeFileSync(outputPath, JSON.stringify(output, null, 2));

    console.log(
      `\n✅ Successfully fetched ${sortedTrades.length} whale trades from Kalshi`
    );
    console.log(`📁 Saved to: ${outputPath}`);
    console.log(
      `💵 Total volume: $${output.summary.totalVolume.toLocaleString()}`
    );
    console.log(
      `📊 Average trade size: $${Math.round(
        output.summary.averageTradeSize
      ).toLocaleString()}`
    );

    if (output.summary.largestTrade) {
      console.log(
        `🐋 Largest trade: $${output.summary.largestTrade.trade_value_dollars.toLocaleString()} on "${output.summary.largestTrade.market_title.slice(
          0,
          50
        )}..."`
      );
      console.log(
        `   ${output.summary.largestTrade.count.toLocaleString()} contracts @ $${(
          output.summary.largestTrade.price / 100
        ).toFixed(2)} (${output.summary.largestTrade.taker_side})`
      );
    }
  } catch (error) {
    console.error("❌ Error fetching Kalshi trades:", error);
    process.exit(1);
  }
}

// Run the script
fetchKalshiWhaleTrades();
