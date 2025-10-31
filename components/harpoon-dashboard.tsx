"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from "motion/react";

// Mock data
const mockWhaleData = {
  lastTrade: {
    whaleId: "0x742d...35a9",
    txnNumber: "#2847",
    value: "$1,240,000",
  },
  topValueTrade: {
    whaleId: "0x8f3c...91b2",
    txnNumber: "#2839",
    value: "$2,100,000",
  },
  todaysActivity: {
    high: 12,
    medium: 26,
    low: 54,
  },
};

// Helper function to get emoji for market
function getMarketEmoji(title: string): string {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes("fed") || lowerTitle.includes("interest rate"))
    return "📊";
  if (
    lowerTitle.includes("election") ||
    lowerTitle.includes("mayor") ||
    lowerTitle.includes("president")
  )
    return "🗳️";
  if (lowerTitle.includes("war") || lowerTitle.includes("conflict"))
    return "⚔️";
  if (
    lowerTitle.includes("tech") ||
    lowerTitle.includes("ai") ||
    lowerTitle.includes("bitcoin") ||
    lowerTitle.includes("crypto")
  )
    return "💻";
  if (
    lowerTitle.includes("health") ||
    lowerTitle.includes("pandemic") ||
    lowerTitle.includes("vaccine")
  )
    return "💉";
  if (
    lowerTitle.includes("sports") ||
    lowerTitle.includes("nfl") ||
    lowerTitle.includes("nba")
  )
    return "🏈";
  if (lowerTitle.includes("weather") || lowerTitle.includes("climate"))
    return "🌍";
  if (
    lowerTitle.includes("economy") ||
    lowerTitle.includes("market") ||
    lowerTitle.includes("stock")
  )
    return "📈";
  if (
    lowerTitle.includes("court") ||
    lowerTitle.includes("trial") ||
    lowerTitle.includes("guilty")
  )
    return "⚖️";
  return "🎯";
}

const mockMarkets = [
  {
    id: 1,
    title: "LOADING MARKETS...",
    candidates: [
      { name: "YES", percentage: 50 },
      { name: "NO", percentage: 50 },
    ],
    volume: "$0",
    flag: "⏳",
    polymarket_url: "#",
  },
];

const mockVolumeData = [
  10, 17.5, 42.5, 22.5, 27.5, 32.5, 19, 37.5, 47.5, 42.5, 27.5, 22.5, 47.5, 40,
  32.5, 22.5, 37.5, 47.5, 25, 42.5, 47.5,
];

// Animated Counter Component
function AnimatedCounter({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(() => Math.round(count.get()));

  useEffect(() => {
    const controls = animate(count, value, { duration: 0.5, delay: 0.4 });
    return () => controls.stop();
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
}

const mockTransactions = [
  {
    id: 1,
    market: "WILL BTC HIT 140,000 IN DECEMBER?",
    date: "10/24/25, 08:48:32",
    position: "NO",
    probability: 77.8,
    type: "BUY",
    price: "$19,000",
    shares: 1203,
    trader: "LOREM",
  },
  {
    id: 2,
    market: "WILL BTC HIT 140,000 IN DECEMBER?",
    date: "10/24/25, 08:48:32",
    position: "YES",
    probability: 77.8,
    type: "BUY",
    price: "$32,039",
    shares: 1203,
    trader: "LOREM",
  },
  {
    id: 3,
    market: "WILL BTC HIT 140,000 IN DECEMBER?",
    date: "10/24/25, 08:48:32",
    position: "NO",
    probability: 77.8,
    type: "SELL",
    price: "$59,090",
    shares: 1203,
    trader: "LOREM",
  },
  {
    id: 4,
    market: "WILL BTC HIT 140,000 IN DECEMBER?",
    date: "10/24/25, 08:48:32",
    position: "YES",
    probability: 77.8,
    type: "BUY",
    price: "$32,039",
    shares: 1203,
    trader: "LOREM",
  },
  {
    id: 5,
    market: "WILL BTC HIT 140,000 IN DECEMBER?",
    date: "10/24/25, 08:48:32",
    position: "NO",
    probability: 77.8,
    type: "SELL",
    price: "$59,090",
    shares: 1203,
    trader: "LOREM",
  },
  {
    id: 6,
    market: "WILL BTC HIT 140,000 IN DECEMBER?",
    date: "10/24/25, 08:48:32",
    position: "YES",
    probability: 77.8,
    type: "BUY",
    price: "$32,039",
    shares: 1203,
    trader: "LOREM",
  },
  {
    id: 7,
    market: "WILL BTC HIT 140,000 IN DECEMBER?",
    date: "10/24/25, 08:48:32",
    position: "NO",
    probability: 77.8,
    type: "SELL",
    price: "$59,090",
    shares: 1203,
    trader: "LOREM",
  },
].map((txn) => ({
  ...txn,
  icon: "/ditherharpoon.svg",
  marketUrl: "#",
  traderUrl: "#",
}));

export default function HarpoonDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [connectionStrength, setConnectionStrength] = useState("STRONG");
  const [showTransactions, setShowTransactions] = useState(false);
  const [whaleTrades, setWhaleTrades] = useState(mockTransactions);
  const [isLoading, setIsLoading] = useState(false);
  const [markets, setMarkets] = useState(mockMarkets);
  const [filter, setFilter] = useState("volume");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<"recent" | "largest" | "impact">(
    "recent"
  );
  const [aiOpportunities, setAiOpportunities] = useState<any[]>([]);
  const [currentOpportunityIndex, setCurrentOpportunityIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load AI opportunities from JSON
  useEffect(() => {
    const loadAiOpportunities = async () => {
      try {
        const response = await fetch("/data/ai_opportunities.json");
        if (response.ok) {
          const data = await response.json();
          if (data.opportunities && data.opportunities.length > 0) {
            setAiOpportunities(data.opportunities);
          }
        }
      } catch (error) {
        console.error("Error loading AI opportunities:", error);
      }
    };

    loadAiOpportunities();
  }, []);

  // Load trades from trades.json file
  useEffect(() => {
    const loadTrades = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching trades from /data/trades.json...");
        const response = await fetch("/data/trades.json");
        console.log("Response status:", response.status, response.ok);
        if (response.ok) {
          const data = await response.json();
          console.log("Loaded trades:", data.trades?.length);
          if (data.trades && data.trades.length > 0) {
            // Transform Supabase data to match our UI format
            const formattedTrades = data.trades.map((trade: any) => {
              // Extract title, icon, and slug from platform_data
              let title = "Unknown Market";
              let icon = "/ditherharpoon.svg"; // fallback
              let slug = "";

              if (
                trade.platform_data &&
                typeof trade.platform_data === "object"
              ) {
                title =
                  trade.platform_data.title ||
                  trade.market_question ||
                  "Unknown Market";
                icon = trade.platform_data.icon || icon;
                slug = trade.platform_data.slug || "";
              } else if (trade.market_question) {
                title = trade.market_question;
              }

              // Construct Polymarket URL
              const marketUrl = slug
                ? `https://polymarket.com/event/${slug}`
                : "#";

              // Format timestamp
              const date = new Date(trade.timestamp);
              const formattedDate = `${String(date.getMonth() + 1).padStart(
                2,
                "0"
              )}/${String(date.getDate()).padStart(2, "0")}/${String(
                date.getFullYear()
              ).slice(-2)}, ${String(date.getHours()).padStart(
                2,
                "0"
              )}:${String(date.getMinutes()).padStart(2, "0")}:${String(
                date.getSeconds()
              ).padStart(2, "0")}`;

              const traderUsername = trade.trader_username;
              // Truncate long usernames (which are actually wallet addresses) with ellipses
              let traderDisplay = traderUsername || "UNKNOWN";
              if (traderDisplay !== "UNKNOWN" && traderDisplay.length > 10) {
                traderDisplay = `${traderDisplay.slice(0, 6)}...`;
              }
              // Only create a working profile link if there's an actual username
              const traderUrl = traderUsername
                ? `https://polymarket.com/@${traderUsername}`
                : "#";

              return {
                id: trade.id,
                market: title.toUpperCase(),
                date: formattedDate,
                position: (trade.outcome || "YES").toUpperCase(),
                probability: parseFloat(trade.price) * 100,
                type: (trade.side || "BUY").toUpperCase(),
                price: `$${Math.round(
                  parseFloat(trade.size || 0)
                ).toLocaleString()}`,
                shares: Math.round(parseFloat(trade.shares || 0)),
                trader: traderDisplay,
                traderUrl,
                icon,
                marketUrl,
              };
            });
            setWhaleTrades(formattedTrades);
            setConnectionStrength("STRONG");
          }
        } else {
          console.error(
            "Failed to fetch trades.json, status:",
            response.status
          );
        }
      } catch (error) {
        console.error("Error loading trades:", error);
        setConnectionStrength("ERROR");
      } finally {
        setIsLoading(false);
      }
    };

    loadTrades();
  }, []);

  // Fetch top markets with live data
  const fetchTopMarkets = useCallback(
    async (filterType = filter) => {
      try {
        setIsRefreshing(true);
        const response = await fetch(
          `/api/top-markets?filter=${filterType}&minVolume=1000000`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.markets && data.markets.length > 0) {
            // Transform API data to match our UI format
            const formattedMarkets = data.markets.map(
              (market: any, idx: number) => ({
                id: idx + 1,
                title: market.title.toUpperCase(),
                candidates: [
                  { name: "YES", percentage: market.yes_price },
                  { name: "NO", percentage: market.no_price },
                ],
                volume: `$${Math.round(market.volume).toLocaleString()}`,
                flag: market.image_url || getMarketEmoji(market.title),
                polymarket_url: market.polymarket_url,
                price_change_1h: market.price_change_1h,
                last_updated: market.last_updated,
              })
            );
            setMarkets(formattedMarkets);
            setConnectionStrength("STRONG");

            // Cache to localStorage
            try {
              localStorage.setItem(
                `markets-${filterType}`,
                JSON.stringify(formattedMarkets)
              );
            } catch (e) {
              console.error("Failed to cache markets:", e);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch top markets:", error);
        setConnectionStrength("WEAK");
      } finally {
        setIsRefreshing(false);
      }
    },
    [filter]
  );

  // Refresh trades by calling API to regenerate trades.json
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/supabase-trades");
      if (response.ok) {
        // Reload the page to get fresh data
        window.location.reload();
      }
    } catch (error) {
      console.error("Error refreshing trades:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Load from cache immediately
    try {
      const cached = localStorage.getItem(`markets-${filter}`);
      if (cached) {
        setMarkets(JSON.parse(cached));
      }
    } catch (e) {
      console.error("Failed to load cached markets:", e);
    }

    // Then fetch fresh data
    fetchTopMarkets(filter);

    // Refresh every 5 minutes (300 seconds)
    const interval = setInterval(() => fetchTopMarkets(filter), 300000);
    return () => clearInterval(interval);
  }, [filter, fetchTopMarkets]);

  // Sort trades based on selected filter
  const sortedTrades = [...whaleTrades].sort((a, b) => {
    if (sortBy === "largest") {
      // Sort by dollar amount (remove $ and commas, then parse)
      const aAmount = parseFloat(a.price.replace(/[$,]/g, ""));
      const bAmount = parseFloat(b.price.replace(/[$,]/g, ""));
      return bAmount - aAmount; // Descending order (largest first)
    } else if (sortBy === "impact") {
      // Sort by lowest probability (most contrarian/impactful bets)
      return a.probability - b.probability; // Ascending order (lowest first)
    } else {
      // Sort by most recent - parse date strings (format: MM/DD/YY, HH:MM:SS)
      const parseDate = (dateStr: string) => {
        const [datePart, timePart] = dateStr.split(", ");
        const [month, day, year] = datePart.split("/");
        const [hours, minutes, seconds] = timePart.split(":");
        return new Date(
          2000 + parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hours),
          parseInt(minutes),
          parseInt(seconds)
        ).getTime();
      };

      const aTime = parseDate(a.date);
      const bTime = parseDate(b.date);
      return bTime - aTime; // Descending order (most recent first)
    }
  });

  const formatTime = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${month}-${day}-${year} ${hours}:${minutes}:${seconds}`;
  };

  // Get the most recent trade (last whale trade)
  const lastWhaleTrade =
    whaleTrades.length > 0
      ? (() => {
          const parseDate = (dateStr: string) => {
            const [datePart, timePart] = dateStr.split(", ");
            const [month, day, year] = datePart.split("/");
            const [hours, minutes, seconds] = timePart.split(":");
            return new Date(
              2000 + parseInt(year),
              parseInt(month) - 1,
              parseInt(day),
              parseInt(hours),
              parseInt(minutes),
              parseInt(seconds)
            ).getTime();
          };
          return [...whaleTrades].sort(
            (a, b) => parseDate(b.date) - parseDate(a.date)
          )[0];
        })()
      : null;

  // Get the largest trade by dollar amount
  const largestTrade =
    whaleTrades.length > 0
      ? [...whaleTrades].sort((a, b) => {
          const aAmount = parseFloat(a.price.replace(/[$,]/g, ""));
          const bAmount = parseFloat(b.price.replace(/[$,]/g, ""));
          return bAmount - aAmount;
        })[0]
      : null;

  return (
    <div className="h-[calc(100vh-10px)] md:h-[calc(100vh-40px)] bg-[#0a0a0a] text-[#c0c0c0] font-mono m-1 md:m-5 relative border border-[#333] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="pt-4 px-4 flex items-center gap-2">
        <h1 className="text-2xl font-extralight tracking-tight text-white ml-3 mt-1">
          HARPOON
        </h1>
        <img src="/whitepoon.svg" alt="Harpoon" className="w-8 h-8 mt-2" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-2 md:gap-6 flex-1 p-2 md:p-6 min-h-0">
        {/* Left Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hidden md:block col-span-3 overflow-y-auto"
        >
          <div className="border border-[#333] bg-[#0f0f0f] p-4 space-y-6 h-full">
            {/* Last Whale Trade */}
            <div>
              <h2 className="text-sm mb-3 text-white">LAST WHALE TRADE</h2>
              <div className="space-y-1 text-xs">
                <div className="flex items-start">
                  <span className="text-[#888]">&gt;&gt; WHALE: </span>
                  <span className="text-white ml-1">
                    {lastWhaleTrade?.trader || "..."}
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="text-[#888]">&gt;&gt; SIZE: </span>
                  <span className="text-white ml-1">
                    {lastWhaleTrade?.price || "..."}
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="text-[#888]">&gt;&gt; POS: </span>
                  <span className="text-white ml-1">
                    {lastWhaleTrade
                      ? `${
                          lastWhaleTrade.position
                        } @ ${lastWhaleTrade.probability.toFixed(1)}%`
                      : "..."}
                  </span>
                </div>
              </div>
            </div>

            {/* Largest Trade */}
            <div>
              <h2 className="text-sm mb-3 text-white">LARGEST TRADE</h2>
              <div className="space-y-1 text-xs">
                <div className="flex items-start">
                  <span className="text-[#888]">&gt;&gt; WHALE: </span>
                  <span className="text-white ml-1">
                    {largestTrade?.trader || "..."}
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="text-[#888]">&gt;&gt; SIZE: </span>
                  <span className="text-white ml-1">
                    {largestTrade?.price || "..."}
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="text-[#888]">&gt;&gt; POS: </span>
                  <span className="text-white ml-1">
                    {largestTrade
                      ? `${
                          largestTrade.position
                        } @ ${largestTrade.probability.toFixed(1)}%`
                      : "..."}
                  </span>
                </div>
              </div>
            </div>

            {/* Today's Activity */}
            <div>
              <h2 className="text-sm mb-2 text-white">TODAY&apos;S ACTIVITY</h2>
              <div className="text-xs text-[#888] mb-3">IMPACT TRADES</div>
              <div className="flex justify-between items-end">
                <div className="flex flex-col items-start">
                  <div className="text-xs text-[#888] mb-1 flex items-center gap-1">
                    HIGH
                    <img
                      src="/downarrow.svg"
                      alt="Down arrow"
                      className="w-3 h-3 inline-block text-[#888]"
                    />
                  </div>
                  <div className="text-2xl font-medium text-white">
                    <AnimatedCounter
                      value={mockWhaleData.todaysActivity.high}
                    />
                  </div>
                </div>
                <div className="flex flex-col items-start">
                  <div className="text-xs text-[#888] mb-1 flex items-center gap-1">
                    MEDIUM
                    <img
                      src="/downarrow.svg"
                      alt="Down arrow"
                      className="w-3 h-3 inline-block text-[#888]"
                    />
                  </div>
                  <div className="text-2xl font-medium text-white">
                    <AnimatedCounter
                      value={mockWhaleData.todaysActivity.medium}
                    />
                  </div>
                </div>
                <div className="flex flex-col items-start">
                  <div className="text-xs text-[#888] mb-1 flex items-center gap-1">
                    LOW
                    <img
                      src="/downarrow.svg"
                      alt="Down arrow"
                      className="w-3 h-3 inline-block text-[#888]"
                    />
                  </div>
                  <div className="text-2xl font-medium text-white">
                    <AnimatedCounter value={mockWhaleData.todaysActivity.low} />
                  </div>
                </div>
              </div>
            </div>

            {/* Volume Index */}
            <div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[#888] w-28">VOL INDEX</span>
                  <div className="flex gap-1">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.1, delay: 0.4 }}
                      className="w-3 h-3 bg-[#457892]"
                    ></motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.1, delay: 0.5 }}
                      className="w-3 h-3 bg-[#457892]"
                    ></motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.1, delay: 0.6 }}
                      className="w-3 h-3 bg-[#457892]"
                    ></motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.1, delay: 0.7 }}
                      className="w-3 h-3 bg-[#333]"
                    ></motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.1, delay: 0.8 }}
                      className="w-3 h-3 bg-[#333]"
                    ></motion.div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#888] w-28">SENTIMENT</span>
                  <div className="flex gap-1">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.1, delay: 0.4 }}
                      className="w-3 h-3 bg-[#457892]"
                    ></motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.1, delay: 0.5 }}
                      className="w-3 h-3 bg-[#457892]"
                    ></motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.1, delay: 0.6 }}
                      className="w-3 h-3 bg-[#457892]"
                    ></motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.1, delay: 0.7 }}
                      className="w-3 h-3 bg-[#457892]"
                    ></motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.1, delay: 0.8 }}
                      className="w-3 h-3 bg-[#333]"
                    ></motion.div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#888] w-28">WHALE ACTIVITY</span>
                  <div className="flex gap-1">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.1, delay: 0.4 }}
                      className="w-3 h-3 bg-[#457892]"
                    ></motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.1, delay: 0.5 }}
                      className="w-3 h-3 bg-[#457892]"
                    ></motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.1, delay: 0.6 }}
                      className="w-3 h-3 bg-[#333]"
                    ></motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.1, delay: 0.7 }}
                      className="w-3 h-3 bg-[#333]"
                    ></motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.1, delay: 0.8 }}
                      className="w-3 h-3 bg-[#333]"
                    ></motion.div>
                  </div>
                </div>
              </div>
            </div>

            {/* Harpoon AI Opportunities */}
            <div className="flex flex-col">
              <div className="text-sm text-white text-left mb-8">
                HARPOON AI
              </div>

              {/* AI Opportunity Carousel */}
              {aiOpportunities.length > 0 && (
                <div
                  className="border border-[#333] bg-[#0a0a0a] p-3 mb-8 cursor-pointer hover:bg-[#1a1a1a] transition-colors"
                  onClick={() =>
                    setCurrentOpportunityIndex(
                      (prev) => (prev + 1) % aiOpportunities.length
                    )
                  }
                >
                  <div className="space-y-2">
                    {/* Question */}
                    <div className="text-xs text-white font-medium leading-tight">
                      {aiOpportunities[currentOpportunityIndex].question}
                    </div>

                    {/* Action */}
                    <div className="text-xs">
                      <span className="text-[#888]">ACTION: </span>
                      <span
                        className={`font-bold ${
                          aiOpportunities[currentOpportunityIndex].tradeDetails
                            .position === "YES"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {aiOpportunities[currentOpportunityIndex].action}
                      </span>
                    </div>

                    {/* Current Price */}
                    <div className="text-xs">
                      <span className="text-[#888]">PRICE: </span>
                      <span className="text-white">
                        {
                          aiOpportunities[currentOpportunityIndex].tradeDetails
                            .currentPrice
                        }
                        %
                      </span>
                    </div>

                    {/* AI Confidence */}
                    <div className="text-xs">
                      <span className="text-[#888]">AI CONFIDENCE: </span>
                      <span className="text-[#457892] font-bold">
                        {
                          aiOpportunities[currentOpportunityIndex].tradeDetails
                            .aiConfidence
                        }
                        %
                      </span>
                    </div>

                    {/* Carousel Indicator */}
                    <div className="flex gap-1 justify-center pt-2">
                      {aiOpportunities.map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-1.5 h-1.5 rounded-full ${
                            idx === currentOpportunityIndex
                              ? "bg-[#457892]"
                              : "bg-[#333]"
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="flex gap-2 justify-center">
                <a
                  href="https://polygonscan.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 border border-[#333] text-xs hover:bg-[#1a1a1a] transition-colors text-center flex-1"
                >
                  POLYSCAN
                </a>
                <a
                  href="https://polygonscan.com/token/0x2791bca1f2de4661ed88a30c99a7a9449aa84174?a=0xc5d563a36ae78145c45a50134d48a1215220f80a"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 border border-[#333] text-xs hover:bg-[#1a1a1a] transition-colors text-center flex-1"
                >
                  POLYMARKET
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Center Content */}
        <motion.div
          initial={{ opacity: 1, y: 0, scale: 1 }}
          className="col-span-12 md:col-span-6 flex flex-col overflow-hidden"
        >
          <div
            className={`flex-1 flex flex-col relative min-h-0 overflow-hidden ${
              showTransactions ? "px-4 py-8" : "p-4 items-center justify-center"
            }`}
          >
            {/* Connection Status */}
            <div className="absolute top-10 right-9 flex items-center gap-2 text-xs z-10">
              <div className="w-2 h-2 rounded-full bg-[#457892]"></div>
              <span className="text-[#888]">
                CONNECTION:{" "}
                <span className="text-white">{connectionStrength}</span>
              </span>
            </div>

            <AnimatePresence mode="wait">
              {!showTransactions ? (
                // Whale View
                <motion.div
                  key="whale-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  className="w-full h-full flex flex-col items-center justify-center"
                >
                  {/* Dithered Whale */}
                  <div className="mb-8 pb-8">
                    <Image
                      src="/ditherwhale.png"
                      alt="Whale"
                      width={400}
                      height={400}
                      className="opacity-80 hover:scale-105 transition-transform duration-300 cursor-pointer"
                      priority
                      onClick={() => setShowTransactions(true)}
                    />
                  </div>

                  {/* Timestamp and View Txns - Between whale and chart */}
                  <div className="w-full flex justify-between items-center mb-4 px-4">
                    <div className="text-xs text-[#888]">
                      {formatTime(currentTime)}
                    </div>
                    <button
                      className="px-4 py-2 border border-[#333] text-xs hover:bg-[#1a1a1a] transition-colors"
                      onClick={() => setShowTransactions(true)}
                    >
                      VIEW TXNS
                    </button>
                  </div>

                  {/* Volume Chart - Pinned to bottom */}
                  <div className="absolute bottom-0 left-0 right-0 pb-4">
                    <div className="flex items-end justify-between h-28 gap-1 px-8">
                      {mockVolumeData.map((height, idx) => (
                        <div
                          key={idx}
                          className="bg-[#555] flex-1"
                          style={{ height: `${height}%` }}
                        ></div>
                      ))}
                    </div>
                    <div className="text-xs text-[#777] text-center mt-2">
                      VOLUME
                    </div>
                  </div>
                </motion.div>
              ) : (
                // Transactions View
                <motion.div
                  key="transactions-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.02 }}
                  className="w-full flex-1 flex flex-col min-h-0"
                >
                  {/* Back, Refresh, and Filter Controls */}
                  <div className="flex gap-2 mb-4 items-center">
                    <motion.button
                      initial={{ opacity: 0, y: 0 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.1 }}
                      className="px-4 py-2 border border-[#333] text-xs hover:bg-[#1a1a1a] transition-colors"
                      onClick={() => setShowTransactions(false)}
                      disabled={isRefreshing}
                    >
                      ← BACK
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0, y: 0 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.1, delay: 0 }}
                      className="px-4 py-2 border border-[#333] text-xs hover:bg-[#1a1a1a] transition-colors disabled:opacity-50"
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                    >
                      {isRefreshing ? "REFRESHING..." : "🔄 REFRESH"}
                    </motion.button>

                    {/* Filter Dropdown */}
                    <motion.select
                      initial={{ opacity: 0, y: 0 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.1, delay: 0 }}
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(
                          e.target.value as "recent" | "largest" | "impact"
                        )
                      }
                      className="px-4 py-2 border border-[#333] bg-[#0a0a0a] text-xs hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                    >
                      <option value="recent">MOST RECENT</option>
                      <option value="largest">LARGEST</option>
                      <option value="impact">IMPACT</option>
                    </motion.select>
                  </div>

                  {/* Transactions List */}
                  <div className="space-y-4 flex-1 overflow-y-auto min-h-0 pr-2">
                    {sortedTrades.map((txn) => (
                      <motion.div
                        key={txn.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border border-[#333] bg-[#0f0f0f] p-4"
                      >
                        <div className="flex gap-4 items-center">
                          {/* Market Icon */}
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 flex items-center justify-center p-1">
                              <Image
                                src={txn.icon || "/ditherharpoon.svg"}
                                alt="Market Icon"
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>

                          {/* Market Info */}
                          <div className="flex-1">
                            <h3 className="text-sm text-white font-semi-bold mb-1">
                              {txn.market}
                            </h3>
                            <div className="text-xs text-[#888] mb-2">
                              {txn.date} •{" "}
                              <a
                                href={txn.marketUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white transition-colors"
                              >
                                VIEW MARKET »
                              </a>
                            </div>
                            <div
                              className={`text-xs font-bold ${
                                txn.position === "YES"
                                  ? "text-green-500"
                                  : "text-red-500"
                              }`}
                            >
                              {txn.position} @ {txn.probability.toFixed(1)}%
                              PROBABILITY
                            </div>
                          </div>

                          {/* Trade Info */}
                          <div className="flex-shrink-0 text-right">
                            <div
                              className={`text-sm font-bold mb-1 ${
                                txn.type === "BUY"
                                  ? "text-green-500"
                                  : "text-red-500"
                              }`}
                            >
                              {txn.type} {txn.price}
                            </div>
                            <div className="text-xs text-[#888] mb-1">
                              {txn.shares.toLocaleString()} SHARES
                            </div>
                            <div className="text-xs text-[#888]">
                              TRADER:{" "}
                              <a
                                href={txn.traderUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white transition-colors"
                              >
                                {txn.trader}
                              </a>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Right Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hidden md:block col-span-3 space-y-4 overflow-y-auto"
        >
          <div className="text-xs text-[#888] mb-2">
            &gt;&gt;{" "}
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                fetchTopMarkets(e.target.value);
              }}
              className="bg-transparent border-none text-[#888] hover:text-white transition-colors cursor-pointer outline-none appearance-none w-28"
              style={{
                textDecoration: "underline",
                textDecorationStyle: "dotted",
              }}
            >
              <option value="volume">DAILY VOLUME</option>
              <option value="competitive">COMPETITIVE</option>
              <option value="volatile">MOST VOLATILE</option>
            </select>{" "}
            MARKETS ({filter === "competitive" ? "$500K+" : "$1M+"})
          </div>
          {markets.map((market) => (
            <div
              key={market.id}
              className="border border-[#333] p-3 bg-[#0f0f0f]"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-xs text-white font-medium flex-1">
                  {market.title}
                </div>
                <div className="ml-2">
                  {market.flag.startsWith("http") ? (
                    <img
                      src={market.flag}
                      alt="Market"
                      className="w-6 h-6 rounded object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const nextEl = e.currentTarget
                          .nextElementSibling as HTMLElement;
                        if (nextEl) nextEl.style.display = "block";
                      }}
                    />
                  ) : null}
                  <div
                    className="text-lg"
                    style={{
                      display: market.flag.startsWith("http")
                        ? "none"
                        : "block",
                    }}
                  >
                    {market.flag}
                  </div>
                </div>
              </div>
              <div className="space-y-1 text-xs mb-2">
                {market.candidates.map((candidate, idx) => (
                  <div key={idx} className="flex justify-between text-[#888]">
                    <span>{candidate.name}</span>
                    <span className="text-white">{candidate.percentage}%</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#457892]">{market.volume} vol</span>
                <a
                  href={market.polymarket_url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#777] hover:text-[#888] transition-colors"
                >
                  VIEW
                </a>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Corner Brackets */}
      <div className="fixed top-4 left-4 w-4 h-4 border-l-4 border-t-4 border-[#C9C9C9]"></div>
      <div className="fixed top-4 right-4 w-4 h-4 border-r-4 border-t-4 border-[#C9C9C9]"></div>
      <div className="fixed bottom-4 left-4 w-4 h-4 border-l-4 border-b-4 border-[#C9C9C9]"></div>
      <div className="fixed bottom-4 right-4 w-4 h-4 border-r-4 border-b-4 border-[#C9C9C9]"></div>
    </div>
  );
}
