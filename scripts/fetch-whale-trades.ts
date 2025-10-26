import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const GAMMA_API = "https://gamma-api.polymarket.com";

interface WhaleTrade {
  id: string;
  market: string;
  marketId: string;
  outcome: string; // "Yes" or "No" or outcome name
  side: "BUY" | "SELL";
  dollarAmount: number; // Actual 24hr volume, not estimated
  currentPrice: number;
  priceChange1hr: number;
  priceChange24hr: number;
  timestamp: string;
  marketUrl: string;
  outcomes: string[]; // All possible outcomes for this market
  outcomePrices: number[]; // Current prices for each outcome
}

async function fetchWhaleActivity() {
  console.log("🐋 Fetching whale activity from Polymarket...\n");

  try {
    // Fetch all active markets (prioritize high volume)
    console.log("📊 Fetching active markets...");
    const marketsResponse = await fetch(
      `${GAMMA_API}/markets?closed=false&limit=300`
    );

    if (!marketsResponse.ok) {
      throw new Error(`Failed to fetch markets: ${marketsResponse.status}`);
    }

    const allMarkets = await marketsResponse.json();

    // Filter for politics + high-profile markets
    const markets = allMarkets.filter((m: any) => {
      const question = (m.question || "").toLowerCase();
      const tags = JSON.stringify(m.tags || []).toLowerCase();
      const volume24hr = parseFloat(m.volume24hr || "0");

      const isPolitics =
        tags.includes("politics") ||
        question.includes("trump") ||
        question.includes("harris") ||
        question.includes("kamala") ||
        question.includes("election") ||
        question.includes("president") ||
        question.includes("senate") ||
        question.includes("congress") ||
        question.includes("democrat") ||
        question.includes("republican") ||
        question.includes("biden") ||
        question.includes("elon") ||
        question.includes("musk");

      // Include politics markets OR high-volume markets (>$10k/day)
      return isPolitics || volume24hr > 10000;
    });

    console.log(
      `✅ Found ${markets.length} markets (from ${allMarkets.length} total)\n`
    );

    // Identify "whale activity" based on high volume and significant price changes
    const whaleActivity: WhaleTrade[] = [];
    const HIGH_VOLUME_THRESHOLD = 5000; // $5k+ in 24hr volume (lowered for testing)
    const SIGNIFICANT_PRICE_CHANGE = 0.01; // 1%+ price change (lowered for testing)

    console.log("🔍 Analyzing markets for whale activity...\n");
    console.log(
      `Thresholds: Volume > $${HIGH_VOLUME_THRESHOLD.toLocaleString()}, Price change > ${
        SIGNIFICANT_PRICE_CHANGE * 100
      }%\n`
    );

    for (const market of markets) {
      const volume24hr = parseFloat(market.volume24hr || "0");
      const priceChange1hr = Math.abs(
        parseFloat(market.oneHourPriceChange || "0")
      );
      const priceChange24hr = Math.abs(
        parseFloat(market.oneDayPriceChange || "0")
      );
      const lastPrice = parseFloat(
        market.lastTradePrice || market.outcomePrices?.[0] || "0.5"
      );

      console.log(`  Checking: ${market.question.slice(0, 50)}...`);
      console.log(
        `    Volume: $${Math.round(volume24hr)}, Price changes: 1hr=${(
          priceChange1hr * 100
        ).toFixed(2)}%, 24hr=${(priceChange24hr * 100).toFixed(2)}%`
      );

      // Detect whale activity
      const hasHighVolume = volume24hr >= HIGH_VOLUME_THRESHOLD;
      const hasSignificantMove =
        priceChange1hr >= SIGNIFICANT_PRICE_CHANGE ||
        priceChange24hr >= SIGNIFICANT_PRICE_CHANGE;

      if (hasHighVolume || hasSignificantMove) {
        // Parse outcomes - might be string or array
        let outcomes: string[] = ["Yes", "No"];
        if (market.outcomes) {
          if (typeof market.outcomes === "string") {
            try {
              const parsed = JSON.parse(market.outcomes);
              outcomes = Array.isArray(parsed) ? parsed : ["Yes", "No"];
            } catch {
              outcomes = ["Yes", "No"];
            }
          } else if (Array.isArray(market.outcomes)) {
            outcomes = market.outcomes;
          }
        }

        // Parse outcome prices - they might be string or array
        let outcomePrices: number[] = [];
        if (market.outcomePrices) {
          if (typeof market.outcomePrices === "string") {
            try {
              const parsed = JSON.parse(market.outcomePrices);
              outcomePrices = Array.isArray(parsed)
                ? parsed.map((p: any) => parseFloat(p))
                : [lastPrice, 1 - lastPrice];
            } catch {
              outcomePrices = [lastPrice, 1 - lastPrice];
            }
          } else if (Array.isArray(market.outcomePrices)) {
            outcomePrices = market.outcomePrices.map((p: any) => parseFloat(p));
          } else {
            outcomePrices = [lastPrice, 1 - lastPrice];
          }
        } else {
          outcomePrices = [lastPrice, 1 - lastPrice];
        }

        // Determine dominant side based on price changes
        const isPriceUp =
          (market.oneDayPriceChange || 0) > 0 ||
          (market.oneHourPriceChange || 0) > 0;
        const side: "BUY" | "SELL" = isPriceUp ? "BUY" : "SELL";

        // Determine which outcome (Yes/No) based on which price moved more
        let dominantOutcome = outcomes[0] || "Yes";

        // If price went up, "Yes" is being bought; if down, "Yes" is being sold (or "No" bought)
        if (!isPriceUp && outcomes.length >= 2) {
          dominantOutcome = outcomes[1] || "No";
        }

        const marketUrl = `https://polymarket.com/event/${market.slug}`;

        whaleActivity.push({
          id: `${market.id}-${Date.now()}`,
          market: market.question,
          marketId: market.id,
          outcome: dominantOutcome,
          side,
          dollarAmount: Math.round(volume24hr),
          currentPrice: lastPrice,
          priceChange1hr: priceChange1hr,
          priceChange24hr: priceChange24hr,
          timestamp: new Date().toISOString(),
          marketUrl,
          outcomes,
          outcomePrices,
        });

        console.log(`  💰 ${market.question.slice(0, 60)}...`);
        console.log(
          `     ${side} ${dominantOutcome} - $${Math.round(
            volume24hr
          ).toLocaleString()} volume`
        );
        console.log(
          `     Price changes: 1hr=${(priceChange1hr * 100).toFixed(
            2
          )}%, 24hr=${(priceChange24hr * 100).toFixed(2)}%`
        );
        console.log(`     🔗 ${marketUrl}`);
      }
    }

    // Sort by dollar amount (volume)
    const sortedActivity = whaleActivity
      .sort((a, b) => b.dollarAmount - a.dollarAmount)
      .slice(0, 50);

    // Write to JSON
    const dataDir = join(process.cwd(), "data");
    mkdirSync(dataDir, { recursive: true });

    const outputPath = join(dataDir, "whale-trades.json");
    const output = {
      trades: sortedActivity,
      count: sortedActivity.length,
      lastUpdated: new Date().toISOString(),
      summary: {
        totalVolume: sortedActivity.reduce((sum, t) => sum + t.dollarAmount, 0),
        largestActivity: sortedActivity[0],
      },
      note: "Data shows markets with high 24hr volume (>$5k) or significant price changes (>1%). Use the marketUrl to verify trades on Polymarket. This represents market-level activity, not individual trades.",
    };

    writeFileSync(outputPath, JSON.stringify(output, null, 2));

    console.log(
      `\n✅ Successfully identified ${sortedActivity.length} whale activity indicators`
    );
    console.log(`📁 Saved to: ${outputPath}`);
    console.log(
      `💵 Total volume: $${output.summary.totalVolume.toLocaleString()}`
    );
    if (output.summary.largestActivity) {
      console.log(
        `🐋 Largest activity: $${output.summary.largestActivity.dollarAmount.toLocaleString()} (${
          output.summary.largestActivity.side
        } ${
          output.summary.largestActivity.outcome
        }) on "${output.summary.largestActivity.market.slice(0, 50)}..."`
      );
      console.log(
        `   🔗 Verify at: ${output.summary.largestActivity.marketUrl}`
      );
    }
  } catch (error) {
    console.error("❌ Error fetching whale activity:", error);
    process.exit(1);
  }
}

// Run the script
fetchWhaleActivity();
