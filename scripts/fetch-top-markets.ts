import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const GAMMA_API = "https://gamma-api.polymarket.com";

interface TopMarket {
  id: string;
  question: string;
  slug: string;
  volume24hr: number;
  volume7d: number;
  volumeTotal: number;
  liquidity: number;
  outcomes: string[];
  outcomePrices: number[];
  priceChange24hr: number;
  marketUrl: string;
  active: boolean;
  closed: boolean;
}

async function fetchTopMarkets() {
  console.log("📊 Fetching top markets by volume from Polymarket...\n");

  try {
    // Fetch all active markets
    console.log("Fetching active markets...");
    const marketsResponse = await fetch(
      `${GAMMA_API}/markets?closed=false&limit=500`
    );

    if (!marketsResponse.ok) {
      throw new Error(`Failed to fetch markets: ${marketsResponse.status}`);
    }

    const allMarkets = await marketsResponse.json();
    console.log(`✅ Found ${allMarkets.length} active markets\n`);

    // Parse and sort by 24hr volume
    const marketsWithVolume = allMarkets
      .map((m: any) => {
        // Parse outcomes
        let outcomes: string[] = ["Yes", "No"];
        if (m.outcomes) {
          if (typeof m.outcomes === "string") {
            try {
              const parsed = JSON.parse(m.outcomes);
              outcomes = Array.isArray(parsed) ? parsed : ["Yes", "No"];
            } catch {
              outcomes = ["Yes", "No"];
            }
          } else if (Array.isArray(m.outcomes)) {
            outcomes = m.outcomes;
          }
        }

        // Parse outcome prices
        let outcomePrices: number[] = [];
        if (m.outcomePrices) {
          if (typeof m.outcomePrices === "string") {
            try {
              const parsed = JSON.parse(m.outcomePrices);
              outcomePrices = Array.isArray(parsed)
                ? parsed.map((p: any) => parseFloat(p))
                : [];
            } catch {
              outcomePrices = [];
            }
          } else if (Array.isArray(m.outcomePrices)) {
            outcomePrices = m.outcomePrices.map((p: any) => parseFloat(p));
          }
        }

        return {
          id: m.id,
          question: m.question,
          slug: m.slug,
          volume24hr: parseFloat(m.volume24hr || "0"),
          volume7d: parseFloat(m.volume7d || m.volume1wk || "0"),
          volumeTotal: parseFloat(m.volume || "0"),
          liquidity: parseFloat(m.liquidity || "0"),
          outcomes,
          outcomePrices,
          priceChange24hr: parseFloat(m.oneDayPriceChange || "0"),
          marketUrl: `https://polymarket.com/event/${m.slug}`,
          active: m.active === true,
          closed: m.closed === true,
        };
      })
      .filter((m: any) => m.volume24hr > 0) // Only markets with volume
      .sort((a: any, b: any) => b.volume24hr - a.volume24hr) // Sort by 24hr volume
      .slice(0, 10); // Top 10

    // Display results
    console.log("🔥 TOP 10 MARKETS BY 24HR VOLUME:\n");
    marketsWithVolume.forEach((market: TopMarket, index: number) => {
      console.log(`${index + 1}. ${market.question}`);
      console.log(`   💰 24hr Volume: $${market.volume24hr.toLocaleString()}`);
      console.log(`   📈 7d Volume: $${market.volume7d.toLocaleString()}`);
      console.log(`   💧 Liquidity: $${market.liquidity.toLocaleString()}`);
      console.log(
        `   📊 Price Change (24hr): ${(market.priceChange24hr * 100).toFixed(
          2
        )}%`
      );
      console.log(`   🔗 ${market.marketUrl}`);
      console.log();
    });

    // Write to JSON
    const dataDir = join(process.cwd(), "data");
    mkdirSync(dataDir, { recursive: true });

    const outputPath = join(dataDir, "top-markets.json");
    const output = {
      markets: marketsWithVolume,
      count: marketsWithVolume.length,
      lastUpdated: new Date().toISOString(),
      summary: {
        totalVolume24hr: marketsWithVolume.reduce(
          (sum, m) => sum + m.volume24hr,
          0
        ),
        avgVolume24hr:
          marketsWithVolume.reduce((sum, m) => sum + m.volume24hr, 0) /
          marketsWithVolume.length,
        topMarket: marketsWithVolume[0],
      },
    };

    writeFileSync(outputPath, JSON.stringify(output, null, 2));

    console.log(`✅ Saved to: ${outputPath}`);
    console.log(
      `💵 Combined 24hr volume: $${output.summary.totalVolume24hr.toLocaleString()}`
    );
    console.log(
      `📊 Average volume: $${Math.round(
        output.summary.avgVolume24hr
      ).toLocaleString()}`
    );
  } catch (error) {
    console.error("❌ Error fetching top markets:", error);
    process.exit(1);
  }
}

// Run the script
fetchTopMarkets();
