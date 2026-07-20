import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Trophy, Medal, Star, TrendingUp,
  BookOpen, Award, Crown,
} from 'lucide-react'
import { leaderboardService } from '../services/courseService'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Navigation from '../components/Navigation'

interface LeaderboardEntry {
  rank: number
  userId: string
  userName: string
  userAvatar?: string
  quizzesTaken: number
  avgScore: number
  bestScore: number
  isCurrentUser: boolean
}

const rankConfig: Record<number, { icon: React.ReactNode; color: string; bg: string }> = {
  1: {
    icon: <Crown className="w-5 h-5" />,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10 border-yellow-500/30',
  },
  2: {
    icon: <Medal className="w-5 h-5" />,
    color: 'text-slate-400',
    bg: 'bg-slate-400/10 border-slate-400/30',
  },
  3: {
    icon: <Medal className="w-5 h-5" />,
    color: 'text-amber-600',
    bg: 'bg-amber-600/10 border-amber-600/30',
  },
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 90 ? 'bg-green-500' : score >= 70 ? 'bg-blue-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-sm font-bold tabular-nums">{score}%</span>
    </div>
  )
}

function AvatarFallback({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  const colors = [
    'from-purple-500 to-blue-500',
    'from-pink-500 to-rose-500',
    'from-green-500 to-teal-500',
    'from-orange-500 to-yellow-500',
    'from-cyan-500 to-blue-500',
  ]
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
      {initials}
    </div>
  )
}

export default function LeaderboardPage() {
  const { data: entries = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard'],
    queryFn: leaderboardService.getLeaderboard,
    staleTime: 60_000,
  })

  const topThree = entries.slice(0, 3)
  const currentUser = entries.find((e) => e.isCurrentUser)

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero */}
      <div className="bg-gradient-to-br from-primary/20 via-background to-background border-b border-border">
        <div className="container mx-auto px-4 py-12 text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}>
            <Trophy className="w-14 h-14 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-4xl font-extrabold mb-2">Quiz Leaderboard</h1>
            <p className="text-muted-foreground text-lg">Top performers across all courses</p>
          </motion.div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-4xl">

        {/* Current User's Rank */}
        {currentUser && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <Card className="border-primary/40 bg-primary/5">
              <CardContent className="p-4 flex items-center gap-4">
                <Star className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Your ranking</p>
                  <p className="font-bold text-lg">
                    #{currentUser.rank} — {currentUser.avgScore}% avg score
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Quizzes taken</p>
                  <p className="font-bold text-xl text-primary">{currentUser.quizzesTaken}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {entries.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <h2 className="text-xl font-semibold mb-2">No scores yet</h2>
            <p className="text-sm mb-6">Be the first to complete a quiz and claim the top spot!</p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <BookOpen className="w-4 h-4" /> Go to Dashboard
            </Link>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {topThree.length >= 1 && (
              <div className="grid grid-cols-3 gap-3 mb-8 items-end">
                {/* 2nd place */}
                {topThree[1] ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`rounded-2xl border p-4 text-center ${rankConfig[2].bg}`}
                  >
                    <Medal className={`w-7 h-7 mx-auto mb-2 ${rankConfig[2].color}`} />
                    <AvatarFallback name={topThree[1].userName} />
                    <p className="font-bold mt-2 truncate text-sm">{topThree[1].userName}</p>
                    <p className={`text-2xl font-extrabold ${rankConfig[2].color}`}>{topThree[1].avgScore}%</p>
                    <p className="text-xs text-muted-foreground">{topThree[1].quizzesTaken} quizzes</p>
                  </motion.div>
                ) : <div />}

                {/* 1st place */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.0 }}
                  className={`rounded-2xl border p-5 text-center ${rankConfig[1].bg} scale-105 shadow-lg`}
                >
                  <Crown className={`w-8 h-8 mx-auto mb-2 ${rankConfig[1].color}`} />
                  <AvatarFallback name={topThree[0].userName} />
                  <p className="font-bold mt-2 truncate">{topThree[0].userName}</p>
                  <p className={`text-3xl font-extrabold ${rankConfig[1].color}`}>{topThree[0].avgScore}%</p>
                  <p className="text-xs text-muted-foreground">{topThree[0].quizzesTaken} quizzes</p>
                </motion.div>

                {/* 3rd place */}
                {topThree[2] ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`rounded-2xl border p-4 text-center ${rankConfig[3].bg}`}
                  >
                    <Medal className={`w-7 h-7 mx-auto mb-2 ${rankConfig[3].color}`} />
                    <AvatarFallback name={topThree[2].userName} />
                    <p className="font-bold mt-2 truncate text-sm">{topThree[2].userName}</p>
                    <p className={`text-2xl font-extrabold ${rankConfig[3].color}`}>{topThree[2].avgScore}%</p>
                    <p className="text-xs text-muted-foreground">{topThree[2].quizzesTaken} quizzes</p>
                  </motion.div>
                ) : <div />}
              </div>
            )}

            {/* Full Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="w-4 h-4 text-primary" /> Full Rankings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground w-12">Rank</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Learner</th>
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Quizzes</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground w-44">Avg Score</th>
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Best</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry, i) => (
                        <motion.tr
                          key={entry.userId}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className={`border-b border-border last:border-0 transition-colors ${
                            entry.isCurrentUser
                              ? 'bg-primary/5 font-semibold'
                              : 'hover:bg-muted/30'
                          }`}
                        >
                          <td className="px-4 py-3">
                            {rankConfig[entry.rank] ? (
                              <span className={rankConfig[entry.rank].color}>
                                {rankConfig[entry.rank].icon}
                              </span>
                            ) : (
                              <span className="text-muted-foreground font-mono">#{entry.rank}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <AvatarFallback name={entry.userName} />
                              <div>
                                <p className="font-medium leading-tight">{entry.userName}</p>
                                {entry.isCurrentUser && (
                                  <span className="text-xs text-primary font-semibold">You</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary rounded-full text-xs font-medium">
                              <BookOpen className="w-3 h-3" />
                              {entry.quizzesTaken}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <ScoreBadge score={entry.avgScore} />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center gap-1 text-green-500 font-bold">
                              <Award className="w-3.5 h-3.5" />
                              {entry.bestScore}%
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}
