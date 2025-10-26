import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();

    // Query all trades from the trades table, ordered by size descending
    const { data: trades, error } = await supabase
      .from("trades")
      .select("*")
      .order("size", { ascending: false });

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json(
        {
          error: "Failed to fetch trades from database",
          details: error.message,
        },
        { status: 500 }
      );
    }

    if (!trades || trades.length === 0) {
      return NextResponse.json(
        { message: "No trades found in database", trades: [], count: 0 },
        { status: 200 }
      );
    }

    // Filter out college football and sports bets (those with "VS." in the title)
    const filteredTrades = trades.filter((trade) => {
      const title = trade.platform_data?.title || trade.market_question || "";
      return !title.toUpperCase().includes("VS.");
    });

    console.log(
      `📊 Filtered ${
        trades.length - filteredTrades.length
      } sports bets (with "VS.")`
    );

    // Prepare output with metadata
    const output = {
      trades: filteredTrades,
      count: filteredTrades.length,
      lastUpdated: new Date().toISOString(),
      summary: {
        totalVolume: filteredTrades.reduce(
          (sum, t) => sum + (parseFloat(t.size) || 0),
          0
        ),
        largestTrade: filteredTrades[0],
        averageTradeSize:
          filteredTrades.reduce(
            (sum, t) => sum + (parseFloat(t.size) || 0),
            0
          ) / filteredTrades.length,
        uniqueMarkets: new Set(filteredTrades.map((t) => t.market_id)).size,
        uniqueTraders: new Set(
          filteredTrades
            .map((t) => t.trader_wallet || t.taker_address)
            .filter(Boolean)
        ).size,
      },
      note: "Real whale trades from Polymarket via Supabase. All trades >= $10k. ",
    };

    // Write to JSON file in public folder so it's accessible
    try {
      const publicDir = join(process.cwd(), "public", "data");
      mkdirSync(publicDir, { recursive: true });
      const filePath = join(publicDir, "trades.json");
      writeFileSync(filePath, JSON.stringify(output, null, 2));
      console.log(`✅ Wrote ${filteredTrades.length} trades to ${filePath}`);
    } catch (fileError) {
      console.error("Error writing to file:", fileError);
      // Don't fail the API request if file write fails
    }

    return NextResponse.json(output);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
