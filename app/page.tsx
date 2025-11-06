"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PixelGrid } from "@/components/ui/pixel-grid"

interface LeaderboardEntry {
  referral: string
  totalFeesUSD: number
}

interface ChartDataPoint {
  date: string
  cumulativeFees: number
  dailyFees: number
}

interface ProcessedData {
  leaderboard: LeaderboardEntry[]
  chartData: ChartDataPoint[]
  totalFees: number
  totalReferrals: number
  lastUpdated: string
}

export default function Dashboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [totalFees, setTotalFees] = useState(0)
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(
          "https://thvomwknsgnklfce.public.blob.vercel-storage.com/referral-fees-processed-RXiZXdAUmbl5B3edT0vh02Ht8vzMir.json",
        )
        const data: ProcessedData = await response.json()

        setLeaderboard(data.leaderboard)
        setTotalFees(data.totalFees)

        const formattedChartData = data.chartData.map((item) => ({
          month: new Date(item.date).toLocaleDateString("en-US", { month: "short" }),
          revenue: item.cumulativeFees,
        }))

        setChartData(formattedChartData)
        setLoading(false)
      } catch (error) {
        console.error("[Dashboard] Error loading data:", error)
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value.toFixed(2)}`
  }

  const formatLargeCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (loading) {
    return (
      <>
        <PixelGrid 
          className="z-[-1]" 
          bgColor="#0a0a0a" 
          pixelColor="#252525"
          pixelSize={2}
          pixelSpacing={4}
        />
        <div className="min-h-screen bg-transparent flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <div className="text-white/60 text-sm">Loading data...</div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <PixelGrid 
        className="z-[-1]" 
        bgColor="#0a0a0a" 
        pixelColor="#252525"
        pixelSize={2}
        pixelSpacing={4}
      />
      <div className="min-h-screen bg-transparent text-white py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <h1 className="text-5xl font-medium tracking-tight text-white">Near Intents Fee Leaderboard</h1>
            <p className="text-[#888888] text-lg">Track referral fees for for 1 click api apps</p>
          </div>
          <a
            href="https://x.com/surgecodes"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a]/70 hover:bg-[#0a0a0a]/90 backdrop-blur-sm border border-[#1a1a1a] rounded-lg transition-colors group"
          >
            <img
              src="https://pbs.twimg.com/profile_images/1957926435001163776/5fkiQIBz_400x400.jpg"
              alt="surgecodes"
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm text-[#888888] group-hover:text-white transition-colors">
              Built by @surgecodes
            </span>
          </a>
        </div>
        
        {/* Top Section - Chart */}
        <Card className="bg-[#0a0a0a]/80 backdrop-blur-sm border-[#1a1a1a] overflow-hidden">
          <CardHeader className="pb-8">
            <div>
              <CardDescription className="text-[#888888] text-sm font-normal mb-2">Total Fees</CardDescription>
              <CardTitle className="text-5xl font-semibold text-white">{formatCurrency(totalFees)}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0 pb-8">
            <ChartContainer
              config={{
                revenue: {
                  label: "Total Fees",
                  color: "#ffffff",
                },
              }}
              className="h-[320px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                  <XAxis
                    dataKey="month"
                    stroke="transparent"
                    tick={{ fill: "#666666", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="transparent"
                    tick={{ fill: "#666666", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#ffffff"
                    strokeWidth={2}
                    dot={false}
                    activeDot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Bottom Section - Leaderboard */}
        <Card className="bg-[#0a0a0a]/80 backdrop-blur-sm border-[#1a1a1a] overflow-hidden">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-medium text-white">Leaderboard</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[#151515]">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.referral}
                  className="grid grid-cols-[auto_1fr_auto] gap-6 px-6 py-5 hover:bg-[#0f0f0f] transition-colors"
                >
                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                        index === 0
                          ? "bg-yellow-400/10 text-yellow-400"
                          : index === 1
                            ? "bg-slate-300/10 text-slate-300"
                            : index === 2
                              ? "bg-orange-400/10 text-orange-400"
                              : "text-[#666666]"
                      }`}
                    >
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex items-center text-white font-normal truncate">{entry.referral}</div>
                  <div className={`flex items-center font-mono text-sm ${entry.totalFeesUSD === 0 ? 'text-[#666666]' : 'text-white'}`}>
                    {formatLargeCurrency(entry.totalFeesUSD)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </>
  )
}
