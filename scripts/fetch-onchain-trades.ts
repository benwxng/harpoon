import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// Polygon RPC endpoint (using Ankr's free tier which has better limits)
const POLYGON_RPC = "https://rpc.ankr.com/polygon";
const GAMMA_API = "https://gamma-api.polymarket.com";

// Polymarket CTF Exchange contract on Polygon
const CTF_EXCHANGE_ADDRESS = "0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E";

interface OnChainTrade {
  id: string;
  market: string;
  marketId: string;
  traderAddress: string;
  side: "BUY" | "SELL";
  shares: string;
  price: string;
  dollarAmount: number;
  tokenId: string;
  timestamp: number;
  blockNumber: number;
  transactionHash: string;
  polygonScanUrl: string;
}

async function fetchOnChainTrades() {
  console.log("⛓️  Fetching on-chain trades from Polygon...\n");

  try {
    // Step 1: Get current block number
    console.log("📦 Getting current block number...");
    const currentBlockResponse = await fetch(POLYGON_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_blockNumber",
        params: [],
        id: 1,
      }),
    });

    const currentBlockData = await currentBlockResponse.json();
    const currentBlock = parseInt(currentBlockData.result, 16);
    console.log(`✅ Current block: ${currentBlock.toLocaleString()}\n`);

    // Step 2: Query logs for OrderFilled events (last ~50 blocks = ~1-2 minutes on Polygon)
    const fromBlock = currentBlock - 50;
    console.log(
      `🔍 Querying trades from block ${fromBlock.toLocaleString()} to ${currentBlock.toLocaleString()}...`
    );
    console.log("(Approximately last 3-5 minutes of trading)\n");

    // OrderFilled event signature
    // event OrderFilled(bytes32 indexed orderHash, address indexed maker, address indexed taker, uint256 makerAssetId, uint256 takerAssetId, uint256 makerAmountFilled, uint256 takerAmountFilled, uint256 fee)
    const orderFilledTopic =
      "0xd0a08e8c493f9c94f29311604c9de1b4e8c8d4c06bd0c789af57f2d65bfec0f6";

    const logsResponse = await fetch(POLYGON_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getLogs",
        params: [
          {
            fromBlock: "0x" + fromBlock.toString(16),
            toBlock: "0x" + currentBlock.toString(16),
            address: CTF_EXCHANGE_ADDRESS,
            topics: [orderFilledTopic],
          },
        ],
        id: 2,
      }),
    });

    const logsData = await logsResponse.json();

    if (logsData.error) {
      console.error("❌ RPC Error:", logsData.error);
      throw new Error(logsData.error.message);
    }

    const logs = logsData.result || [];
    console.log(`📊 Found ${logs.length} trades in the last ~3-5 minutes\n`);

    if (logs.length === 0) {
      console.log("⚠️  No recent trades found. This could mean:");
      console.log("   - Trading volume is low right now");
      console.log("   - Try running the script again in a few minutes");
      console.log("   - Peak trading times will have more activity\n");
    }

    // Step 3: Fetch active markets to map token IDs to market names
    console.log("📊 Fetching market data...");
    const marketsResponse = await fetch(
      `${GAMMA_API}/markets?closed=false&limit=500`
    );
    const markets = await marketsResponse.json();

    // Build token ID to market mapping
    const tokenIdToMarket = new Map();
    for (const market of markets) {
      if (market.clobTokenIds) {
        let tokenIds: string[] = [];
        if (typeof market.clobTokenIds === "string") {
          try {
            tokenIds = JSON.parse(market.clobTokenIds);
          } catch (e) {
            continue;
          }
        } else if (Array.isArray(market.clobTokenIds)) {
          tokenIds = market.clobTokenIds;
        }

        tokenIds.forEach((tokenId: string) => {
          tokenIdToMarket.set(tokenId, market);
        });
      }
    }
    console.log(`✅ Mapped ${tokenIdToMarket.size} token IDs to markets\n`);

    // Step 4: Parse trades
    console.log("🔍 Parsing trade data...\n");
    const trades: OnChainTrade[] = [];

    for (const log of logs.slice(0, 100)) {
      // Limit to 100 most recent
      try {
        const blockNumber = parseInt(log.blockNumber, 16);
        const txHash = log.transactionHash;

        // Parse log data (non-indexed parameters)
        const data = log.data;

        // Extract maker and taker from indexed topics
        const maker = "0x" + log.topics[1].slice(26); // Remove leading zeros
        const taker = "0x" + log.topics[2].slice(26);

        // Parse the data field (this contains amounts)
        // The data contains: makerAssetId, takerAssetId, makerAmountFilled, takerAmountFilled, fee
        const dataWithoutPrefix = data.slice(2);

        // Each parameter is 32 bytes (64 hex chars)
        const makerAssetId = "0x" + dataWithoutPrefix.slice(0, 64);
        const takerAssetId = "0x" + dataWithoutPrefix.slice(64, 128);
        const makerAmountHex = dataWithoutPrefix.slice(128, 192);
        const takerAmountHex = dataWithoutPrefix.slice(192, 256);
        const feeHex = dataWithoutPrefix.slice(256, 320);

        const makerAmount = parseInt(makerAmountHex, 16);
        const takerAmount = parseInt(takerAmountHex, 16);

        // Polymarket uses 6 decimals for USDC
        const makerAmountUSDC = makerAmount / 1e6;
        const takerAmountUSDC = takerAmount / 1e6;

        // The taker is buying, maker is selling
        // Dollar amount is typically the USDC side of the trade
        const dollarAmount = Math.max(makerAmountUSDC, takerAmountUSDC);

        // Get block timestamp
        const blockResponse = await fetch(POLYGON_RPC, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_getBlockByNumber",
            params: ["0x" + blockNumber.toString(16), false],
            id: 3,
          }),
        });

        const blockData = await blockResponse.json();
        const timestamp = parseInt(blockData.result?.timestamp || "0", 16);

        // Find market for this token
        const makerAssetIdDecimal = BigInt(makerAssetId).toString();
        const takerAssetIdDecimal = BigInt(takerAssetId).toString();

        const market =
          tokenIdToMarket.get(makerAssetIdDecimal) ||
          tokenIdToMarket.get(takerAssetIdDecimal);

        if (dollarAmount >= 100) {
          // Only trades >= $100
          trades.push({
            id: `${txHash}-${log.logIndex}`,
            market: market?.question || "Unknown Market",
            marketId: market?.id || "unknown",
            traderAddress: taker, // The taker is the one placing the order
            side: "BUY", // Taker is buying from maker
            shares: (takerAmountUSDC / dollarAmount).toFixed(4),
            price: (
              dollarAmount / Math.max(takerAmountUSDC, makerAmountUSDC)
            ).toFixed(4),
            dollarAmount: Math.round(dollarAmount * 100) / 100,
            tokenId: takerAssetIdDecimal,
            timestamp,
            blockNumber,
            transactionHash: txHash,
            polygonScanUrl: `https://polygonscan.com/tx/${txHash}`,
          });

          console.log(
            `  💰 $${dollarAmount.toFixed(2)} trade on: ${
              market?.question?.slice(0, 50) || "Unknown"
            }...`
          );
          console.log(`     Trader: ${taker}`);
          console.log(`     Tx: ${txHash}`);
          console.log();
        }
      } catch (error) {
        console.error(`  ⚠️  Error parsing log:`, error);
      }
    }

    // Sort by dollar amount
    const sortedTrades = trades
      .sort((a, b) => b.dollarAmount - a.dollarAmount)
      .slice(0, 50);

    // Save to file
    const dataDir = join(process.cwd(), "data");
    mkdirSync(dataDir, { recursive: true });

    const outputPath = join(dataDir, "onchain-trades.json");
    const output = {
      trades: sortedTrades,
      count: sortedTrades.length,
      lastUpdated: new Date().toISOString(),
      blockRange: {
        from: fromBlock,
        to: currentBlock,
        blocksScanned: currentBlock - fromBlock,
      },
      summary: {
        totalVolume: sortedTrades.reduce((sum, t) => sum + t.dollarAmount, 0),
        largestTrade: sortedTrades[0],
      },
      note: "Real on-chain trades from Polygon blockchain. Verify any trade using the polygonScanUrl.",
    };

    writeFileSync(outputPath, JSON.stringify(output, null, 2));

    console.log(
      `\n✅ Successfully fetched ${sortedTrades.length} on-chain trades`
    );
    console.log(`📁 Saved to: ${outputPath}`);
    console.log(
      `💵 Total volume: $${output.summary.totalVolume.toLocaleString()}`
    );
    if (output.summary.largestTrade) {
      console.log(
        `🐋 Largest trade: $${output.summary.largestTrade.dollarAmount.toLocaleString()} by ${
          output.summary.largestTrade.traderAddress
        }`
      );
      console.log(
        `   🔗 Verify: ${output.summary.largestTrade.polygonScanUrl}`
      );
    }
  } catch (error) {
    console.error("❌ Error fetching on-chain trades:", error);
    process.exit(1);
  }
}

// Run the script
fetchOnChainTrades();
