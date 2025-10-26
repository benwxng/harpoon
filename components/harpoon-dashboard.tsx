"use client";

import { useState, useEffect } from "react";
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
    high: 6,
    medium: 10,
    low: 32,
  },
};

const mockMarkets = [
  {
    id: 1,
    title: "NEW YORK MAYORAL ELECTION",
    candidates: [
      { name: "ZOHRAN MAMDANI", percentage: 97 },
      { name: "ANDREW CUOMO", percentage: 3 },
    ],
    volume: "$288,300,323",
    flag: "🇺🇸",
  },
  {
    id: 2,
    title: "NEW YORK MAYORAL ELECTION",
    candidates: [
      { name: "ZOHRAN MAMDANI", percentage: 97 },
      { name: "ANDREW CUOMO", percentage: 3 },
    ],
    volume: "$288,300,323",
    flag: "🇺🇸",
  },
  {
    id: 3,
    title: "NEW YORK MAYORAL ELECTION",
    candidates: [
      { name: "ZOHRAN MAMDAMI", percentage: 97 },
      { name: "ANDREW CUOMO", percentage: 3 },
    ],
    volume: "$288,300,323",
    flag: "🇺🇸",
  },
  {
    id: 4,
    title: "NEW YORK MAYORAL ELECTION",
    candidates: [
      { name: "ZOHRAN MAMDAMI", percentage: 97 },
      { name: "ANDREW CUOMO", percentage: 3 },
    ],
    volume: "$288,300,323",
    flag: "🇺🇸",
  },
  {
    id: 5,
    title: "NEW YORK MAYORAL ELECTION",
    candidates: [
      { name: "ZOHRAN MAMDAMI", percentage: 97 },
      { name: "ANDREW CUOMO", percentage: 3 },
    ],
    volume: "$288,300,323",
    flag: "🇺🇸",
  },
  {
    id: 6,
    title: "NEW YORK MAYORAL ELECTION",
    candidates: [
      { name: "ZOHRAN MAMDAMI", percentage: 97 },
      { name: "ANDREW CUOMO", percentage: 3 },
    ],
    volume: "$288,300,323",
    flag: "🇺🇸",
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
];

export default function HarpoonDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [connectionStrength, setConnectionStrength] = useState("STRONG");
  const [showTransactions, setShowTransactions] = useState(false);
  const [whaleTrades, setWhaleTrades] = useState(mockTransactions);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real whale trades
  useEffect(() => {
    const fetchWhaleTrades = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/whale-trades");
        if (response.ok) {
          const data = await response.json();
          if (data.trades && data.trades.length > 0) {
            // Transform API data to match our UI format
            const formattedTrades = data.trades.map((trade: any) => ({
              id: trade.id,
              market: trade.market,
              date: new Date(trade.timestamp * 1000).toLocaleString(),
              position: trade.outcome,
              probability: parseFloat(trade.price) * 100,
              type: trade.side,
              price: `$${trade.tradeValue.toLocaleString()}`,
              shares: Math.round(parseFloat(trade.size)),
              trader: trade.maker.slice(0, 10),
            }));
            setWhaleTrades(formattedTrades);
            setConnectionStrength("STRONG");
          }
        }
      } catch (error) {
        console.error("Failed to fetch whale trades:", error);
        setConnectionStrength("WEAK");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWhaleTrades();
    // Refresh every 60 seconds
    const interval = setInterval(fetchWhaleTrades, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${month}-${day}-${year} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="h-[calc(100vh-40px)] bg-[#0a0a0a] text-[#c0c0c0] font-mono m-5 relative border border-[#333] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="pt-4 px-4">
        <h1 className="text-lg font-extralight tracking-tight text-white ml-1">
          HARPOON
        </h1>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6 flex-1 p-4 min-h-0">
        {/* Left Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="col-span-3 overflow-y-auto"
        >
          <div className="border border-[#333] bg-[#0f0f0f] p-4 space-y-6 h-full">
            {/* Last Whale Trade */}
            <div>
              <h2 className="text-sm mb-3 text-white">LAST WHALE TRADE</h2>
              <div className="space-y-1 text-xs">
                <div className="flex items-start">
                  <span className="text-[#888]">&gt;&gt; WHALE ID:</span>
                </div>
                <div className="flex items-start">
                  <span className="text-[#888]">&gt;&gt; TXN #:</span>
                </div>
                <div className="flex items-start">
                  <span className="text-[#888]">&gt;&gt; VALUE:</span>
                </div>
              </div>
            </div>

            {/* Top Value Trade */}
            <div>
              <h2 className="text-sm mb-3 text-white">TOP VALUE TRADE</h2>
              <div className="space-y-1 text-xs">
                <div className="flex items-start">
                  <span className="text-[#888]">&gt;&gt; WHALE ID:</span>
                </div>
                <div className="flex items-start">
                  <span className="text-[#888]">&gt;&gt; TXN #:</span>
                </div>
                <div className="flex items-start">
                  <span className="text-[#888]">&gt;&gt; VALUE:</span>
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
                  <span className="text-[#888]">VOL INDEX</span>
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
                  <span className="text-[#888]">VOL INDEX</span>
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
                  <span className="text-[#888]">VOL INDEX</span>
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

            {/* Lorem Ipsum Globe */}
            <div className="flex flex-col">
              <div className="text-xs text-[#888] text-left mb-2">
                LOREM IPSUM
              </div>
              <img
                src="/globe.svg"
                alt="Globe"
                className="w-32 h-32 mx-auto text-[#777]"
                style={{
                  filter:
                    "invert(48%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(91%) contrast(88%)",
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Center Content */}
        <motion.div
          initial={{ opacity: 1, y: 0, scale: 1 }}
          className="col-span-6 flex flex-col overflow-hidden"
        >
          <div
            className={`flex-1 flex flex-col relative min-h-0 overflow-hidden ${
              showTransactions ? "px-4 py-8" : "p-4 items-center justify-center"
            }`}
          >
            {/* Connection Status */}
            <div className="absolute top-4 right-4 flex items-center gap-2 text-xs z-10">
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
                  {/* Back Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.02 }}
                    className="mb-4 px-4 py-2 border border-[#333] text-xs hover:bg-[#1a1a1a] transition-colors self-start"
                    onClick={() => setShowTransactions(false)}
                  >
                    ← BACK
                  </motion.button>

                  {/* Transactions List */}
                  <div className="space-y-4 flex-1 overflow-y-auto min-h-0 pr-2">
                    {whaleTrades.map((txn) => (
                      <motion.div
                        key={txn.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border border-[#333] bg-[#0f0f0f] p-4"
                      >
                        <div className="flex gap-4">
                          {/* Chart Icon */}
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-white flex items-center justify-center">
                              <svg
                                className="w-8 h-8"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                              </svg>
                            </div>
                          </div>

                          {/* Market Info */}
                          <div className="flex-1">
                            <h3 className="text-sm text-white font-bold mb-1">
                              {txn.market}
                            </h3>
                            <div className="text-xs text-[#888] mb-2">
                              {txn.date} • VIEW MARKET »
                            </div>
                            <div
                              className={`text-xs font-bold ${
                                txn.position === "YES"
                                  ? "text-green-500"
                                  : "text-red-500"
                              }`}
                            >
                              {txn.position} @ {txn.probability}% PROBABILITY
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
                            <div className="text-xs text-[#888]">
                              SHARES: {txn.shares}
                            </div>
                            <div className="text-xs text-[#888]">
                              TRADER: {txn.trader}
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
          className="col-span-3 space-y-4 overflow-y-auto"
        >
          <div className="text-xs text-[#888] mb-2">
            &gt;&gt; TOP VOLATILITY
          </div>
          {mockMarkets.map((market) => (
            <div
              key={market.id}
              className="border border-[#333] p-3 bg-[#0f0f0f]"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-xs text-white font-bold flex-1">
                  {market.title}
                </div>
                <div className="text-lg ml-2">{market.flag}</div>
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
                <span className="text-[#777]">{market.volume} vol</span>
                <button className="text-white hover:text-[#888] transition-colors">
                  VIEW
                </button>
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
