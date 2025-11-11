import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users,
  Calendar,
  FileText,
  Microscope,
  TrendingUp,
  Download,
  Bell,
  BarChart3,
  PieChartIcon,
  Clock,
  MapPin,
  User,
  Activity,
  Venus,
  Mars,
  UserCheck,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  Sparkles,
} from "lucide-react"
import { useAnnouncementStore } from "../stores/announceStore"
import { useAttendanceStore } from "../stores/attendaceStore"
import { useCelluleStore } from "../stores/cellulesStore"
import useDocumentStore from "../stores/documentStore"
import { useEventStore } from "../stores/eventStore"
import { useUserStore } from "../stores/useUserStore"

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#84CC16", "#F97316"]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
}

export default function Dashboard() {
  const { fetchAnnouncements, announcements } = useAnnouncementStore()
  const { fetchAttendance, attendance } = useAttendanceStore()
  const { fetchCellules, cellules } = useCelluleStore()
  const { getDocuments, documents } = useDocumentStore()
  const { events, fetchEvents } = useEventStore()
  const { fetchUsers, users } = useUserStore()

  const [selectedEventId, setSelectedEventId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("month")

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        await Promise.all([fetchAnnouncements(), fetchCellules(), getDocuments(), fetchEvents(), fetchUsers()])
      } catch (error) {
        console.error("[v0] Error loading dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    if (selectedEventId) {
      fetchAttendance(selectedEventId)
    }
  }, [selectedEventId, fetchAttendance])

  // Statistiques calculées
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((user) => user.is_active).length,
    totalEvents: events.length,
    upcomingEvents: events.filter((event) => new Date(event.date) > new Date()).length,
    totalDocuments: documents.length,
    totalCellules: cellules.length,
    totalAnnouncements: announcements.length,
  }



  // Données pour les graphiques
  const eventTypeData = events.reduce((acc, event) => {
    const type = event.type || "Non spécifié"
    const existing = acc.find((item) => item.name === type)
    if (existing) {
      existing.value += 1
    } else {
      acc.push({
        name: type,
        value: 1,
        color: COLORS[acc.length % COLORS.length],
      })
    }
    return acc
  }, [])

  const genderData = users.reduce((acc, user) => {
    const gender = user.gender || "Non spécifié"
    const existing = acc.find((item) => item.name === gender)
    if (existing) {
      existing.value += 1
    } else {
      acc.push({
        name: gender,
        value: 1,
        color: gender === "male" ? "#3B82F6" : gender === "female" ? "#EC4899" : "#6B7280",
      })
    }
    return acc
  }, [])

  // CORRECTION : Graphique des niveaux d'utilisateurs amélioré
  const userLevelData = users
    .reduce((acc, user) => {
      const level = user.level || "Non spécifié"
      const existing = acc.find((item) => item.level === level)
      if (existing) {
        existing.count += 1
      } else {
        acc.push({ 
          level, 
          count: 1,
          color: COLORS[acc.length % COLORS.length]
        })
      }
      return acc
    }, [])
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  const monthlyEventData = events
    .reduce((acc, event) => {
      const month = new Date(event.date).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })
      const existing = acc.find((item) => item.month === month)
      if (existing) {
        existing.events += 1
      } else {
        acc.push({ month, events: 1 })
      }
      return acc
    }, [])
    .slice(-6)

  const upcomingEvents = events
    .filter((event) => new Date(event.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)

  const recentDocuments = documents.slice(0, 5)

  const eventAttendance = selectedEventId ? attendance.filter((a) => a.event_id === selectedEventId) : []
  const presentCount = eventAttendance.filter((a) => a.status === "present").length
  const attendanceRate = eventAttendance.length > 0 ? Math.round((presentCount / eventAttendance.length) * 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center space-y-6"
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-gray-900 mb-1">Chargement du tableau de bord</div>
            <div className="text-sm text-gray-500">Veuillez patienter un instant...</div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      {/* En-tête moderne avec effet glassmorphism */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="sticky top-0  z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-sm"
      >
        <div className="px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                  Tableau de Bord
                </h1>
                <p className="text-sm text-gray-600 mt-0.5">Vue d'ensemble des activités et statistiques</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm"
              >
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="quarter">Ce trimestre</option>
                <option value="year">Cette année</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Cartes de statistiques modernisées */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {[
            {
              title: "Utilisateurs Totaux",
              value: stats.totalUsers,
              subtitle: `${stats.activeUsers} actifs`,
              icon: <Users className="h-5 w-5" />,
              gradient: "from-blue-500 to-blue-600",
              bgGradient: "from-blue-50 to-blue-100/50",
              iconBg: "bg-blue-500",
            
            },
            {
              title: "Événements",
              value: stats.totalEvents,
              subtitle: `${stats.upcomingEvents} à venir`,
              icon: <Calendar className="h-5 w-5" />,
              gradient: "from-emerald-500 to-emerald-600",
              bgGradient: "from-emerald-50 to-emerald-100/50",
              iconBg: "bg-emerald-500",
              
            },
            {
              title: "Documents",
              value: stats.totalDocuments,
              subtitle: "Ressources partagées",
              icon: <FileText className="h-5 w-5" />,
              gradient: "from-purple-500 to-purple-600",
              bgGradient: "from-purple-50 to-purple-100/50",
              iconBg: "bg-purple-500",
            
            },
            {
              title: "Cellules",
              value: stats.totalCellules,
              subtitle: "Groupes d'activités",
              icon: <Microscope className="h-5 w-5" />,
              gradient: "from-orange-500 to-orange-600",
              bgGradient: "from-orange-50 to-orange-100/50",
              iconBg: "bg-orange-500",
           
            },
          ].map((stat, index) => (
            <motion.div key={stat.title} variants={itemVariants}>
              <ModernStatCard {...stat} />
            </motion.div>
          ))}
        </motion.div>

        {/* Graphiques principaux avec design amélioré */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Graphique des types d'événements */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <PieChartIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  Répartition des Événements
                </h3>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {events.length} événements
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="h-80">
                {eventTypeData.length > 0 ? (
                  <EnhancedPieChart data={eventTypeData} />
                ) : (
                  <EmptyState icon={<PieChartIcon className="h-12 w-12" />} message="Aucune donnée disponible" />
                )}
              </div>
            </div>
          </motion.div>

          {/* Statistiques de participation */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                </div>
                Participation
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <select
                value={selectedEventId || ""}
                onChange={(e) => setSelectedEventId(e.target.value ? Number.parseInt(e.target.value) : null)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">Sélectionner un événement</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title} - {new Date(event.date).toLocaleDateString("fr-FR")}
                  </option>
                ))}
              </select>

              <AnimatePresence mode="wait">
                {selectedEventId ? (
                  <motion.div
                    key="stats"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    <MetricCard
                      value={presentCount}
                      label="Présences confirmées"
                      gradient="from-blue-500 to-blue-600"
                      icon={<UserCheck className="h-5 w-5" />}
                    />
                    <MetricCard
                      value={eventAttendance.length}
                      label="Total participants"
                      gradient="from-gray-500 to-gray-600"
                      icon={<Users className="h-5 w-5" />}
                    />
                    <MetricCard
                      value={`${attendanceRate}%`}
                      label="Taux de participation"
                      gradient="from-green-500 to-green-600"
                      icon={<TrendingUp className="h-5 w-5" />}
                    />
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <EmptyState
                      icon={<BarChart3 className="h-12 w-12" />}
                      message="Sélectionnez un événement"
                      subtext="pour voir les statistiques"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Graphiques des utilisateurs - CORRIGÉ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard
            title="Utilisateurs par Niveau"
            icon={<UserCheck className="h-5 w-5 text-blue-600" />}
            iconBg="bg-blue-100"
            count={users.length}
          >
            <div className="h-64">
              {userLevelData.length > 0 ? (
                <ModernBarChart data={userLevelData} />
              ) : (
                <EmptyState icon={<BarChart3 className="h-12 w-12" />} message="Aucune donnée" />
              )}
            </div>
          </ChartCard>

          <ChartCard
            title="Événements par Mois"
            icon={<Calendar className="h-5 w-5 text-purple-600" />}
            iconBg="bg-purple-100"
            count={monthlyEventData.reduce((sum, item) => sum + item.events, 0)}
          >
            <div className="h-64">
              {monthlyEventData.length > 0 ? (
                <ModernLineChart data={monthlyEventData} />
              ) : (
                <EmptyState icon={<Calendar className="h-12 w-12" />} message="Aucune donnée" />
              )}
            </div>
          </ChartCard>

          <ChartCard
            title="Répartition par Genre"
            icon={<Users className="h-5 w-5 text-pink-600" />}
            iconBg="bg-pink-100"
            count={users.length}
          >
            <div className="h-64">
              {genderData.length > 0 ? (
                <ModernGenderChart data={genderData} />
              ) : (
                <EmptyState icon={<Users className="h-12 w-12" />} message="Aucune donnée" />
              )}
            </div>
          </ChartCard>
        </div>

        {/* Vue d'ensemble et événements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Statistiques globales */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                Vue d'Ensemble
              </h3>
            </div>
            <div className="p-6 space-y-3">
              <OverviewMetric
                label="Taux d'activité"
                value={`${stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%`}
                color="green"
              />
              <OverviewMetric
                label="Événements passés"
                value={stats.totalEvents - stats.upcomingEvents}
                color="orange"
              />
              <OverviewMetric
                label="Moyenne participants"
                value={events.length > 0 ? Math.round(attendance.length / events.length) : 0}
                color="purple"
              />
              <OverviewMetric label="Annonces actives" value={stats.totalAnnouncements} color="blue" />
            </div>
          </motion.div>

          {/* Événements à venir */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                Événements à Venir
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event, index) => <EventCard key={event.id} event={event} index={index} />)
                ) : (
                  <EmptyState icon={<Calendar className="h-12 w-12" />} message="Aucun événement à venir" />
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Dernières activités */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dernières annonces */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Bell className="h-5 w-5 text-orange-600" />
                </div>
                Dernières Annonces
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {announcements.length > 0 ? (
                  announcements
                    .slice(0, 5)
                    .map((announcement, index) => (
                      <AnnouncementCard key={announcement.id} announcement={announcement} index={index} />
                    ))
                ) : (
                  <EmptyState icon={<Bell className="h-12 w-12" />} message="Aucune annonce" />
                )}
              </div>
            </div>
          </motion.div>

          {/* Derniers documents */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                Derniers Documents
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {recentDocuments.length > 0 ? (
                  recentDocuments.map((doc, index) => <DocumentCard key={doc.id} document={doc} index={index} />)
                ) : (
                  <EmptyState icon={<FileText className="h-12 w-12" />} message="Aucun document" />
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// Composants utilitaires modernisés

function ModernStatCard({ title, value, subtitle, icon, gradient, bgGradient, iconBg, trend }) {
  const isPositive = trend > 0

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${bgGradient} border border-gray-200/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 group`}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`p-3 rounded-xl ${iconBg} shadow-lg text-white group-hover:scale-110 transition-transform duration-300`}
          >
            {icon}
          </div>
          {trend !== undefined && (
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
                isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
          <p className="text-sm font-medium text-gray-500 mt-2">{subtitle}</p>
        </div>
      </div>
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
    </div>
  )
}

function MetricCard({ value, label, gradient, icon }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative overflow-hidden bg-gradient-to-br ${gradient} p-4 rounded-xl shadow-lg`}
    >
      <div className="flex items-center justify-between text-white">
        <div>
          <div className="text-2xl font-bold mb-1">{value}</div>
          <div className="text-sm font-medium opacity-90">{label}</div>
        </div>
        <div className="opacity-20">{icon}</div>
      </div>
      <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
    </motion.div>
  )
}

function ChartCard({ title, icon, iconBg, count, children }) {
  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <div className={`p-2 ${iconBg} rounded-lg`}>{icon}</div>
            {title}
          </h3>
          {count > 0 && (
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{count}</span>
          )}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  )
}

function OverviewMetric({ label, value, color }) {
  const colorClasses = {
    green: "bg-green-50 border-green-200 text-green-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
  }

  return (
    <div
      className={`flex justify-between items-center p-4 rounded-xl border ${colorClasses[color]} transition-all duration-200 hover:shadow-md`}
    >
      <span className="font-medium">{label}</span>
      <span className="text-xl font-bold">{value}</span>
    </div>
  )
}

function EventCard({ event, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, x: 4 }}
      className="group flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer"
    >
      {event.image_url && (
        <img
          src={event.image_url || "/placeholder.svg"}
          alt={event.title}
          className="w-16 h-16 rounded-lg object-cover shadow-md"
        />
      )}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
          {event.title}
        </h4>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{event.description}</p>
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {new Date(event.date).toLocaleDateString("fr-FR")}
          </div>
          {event.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2">
          {event.type && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
              {event.type}
            </span>
          )}
          {event.responsable && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
              <User className="h-3 w-3" />
              {event.responsable}
            </span>
          )}
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
    </motion.div>
  )
}

function AnnouncementCard({ announcement, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="group flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50/50 transition-all duration-200 cursor-pointer"
    >
      <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-2 group-hover:scale-150 transition-transform"></div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
          {announcement.title}
        </h4>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{announcement.subtitle}</p>
        <span className="text-xs text-gray-500 mt-2 inline-block">
          {new Date(announcement.published_at).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>
    </motion.div>
  )
}

function DocumentCard({ document, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="group flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center shadow-sm">
          <FileText className="h-5 w-5 text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">
            {document.title}
          </h4>
          <span className="text-xs text-gray-500">{new Date(document.created_at).toLocaleDateString("fr-FR")}</span>
        </div>
      </div>
      <a
        href={document.file_path}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-4 px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg flex-shrink-0"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Télécharger</span>
      </a>
    </motion.div>
  )
}

function EmptyState({ icon, message, subtext }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 text-gray-400">
      {icon}
      <p className="mt-3 text-sm font-medium text-gray-500">{message}</p>
      {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
  )
}

// Graphiques modernisés avec animations

function EnhancedPieChart({ data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  let currentAngle = 0
  const radius = 90
  const center = 120

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center h-full gap-8">
      <motion.svg
        width="240"
        height="240"
        viewBox="0 0 240 240"
        className="transform -rotate-90"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {data.map((item, index) => {
          const percentage = item.value / total
          const angle = percentage * 360
          const largeArcFlag = angle > 180 ? 1 : 0

          const x1 = center + radius * Math.cos((currentAngle * Math.PI) / 180)
          const y1 = center + radius * Math.sin((currentAngle * Math.PI) / 180)

          const x2 = center + radius * Math.cos(((currentAngle + angle) * Math.PI) / 180)
          const y2 = center + radius * Math.sin(((currentAngle + angle) * Math.PI) / 180)

          const pathData = [
            `M ${center} ${center}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            `Z`,
          ].join(" ")

          currentAngle += angle

          return (
            <motion.g
              key={item.name}
              transform="rotate(90 120 120)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <path
                d={pathData}
                fill={item.color || COLORS[index % COLORS.length]}
                stroke="white"
                strokeWidth="3"
                className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}
              />
            </motion.g>
          )
        })}
        <circle cx={center} cy={center} r="50" fill="white" />
        <text x={center} y={center - 5} textAnchor="middle" className="text-2xl font-bold fill-gray-900">
          {total}
        </text>
        <text x={center} y={center + 15} textAnchor="middle" className="text-xs fill-gray-500">
          Total
        </text>
      </motion.svg>

      <div className="flex-1 space-y-2">
        {data.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className="w-4 h-4 rounded-full shadow-sm group-hover:scale-110 transition-transform flex-shrink-0"
                style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }}
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors truncate">
                {item.name}
              </span>
            </div>
            <div className="text-right ml-2">
              <div className="text-sm font-bold text-gray-900">{item.value}</div>
              <div className="text-xs text-gray-500">{Math.round((item.value / total) * 100)}%</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function ModernGenderChart({ data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  const getGenderIcon = (gender) => {
    switch (gender.toLowerCase()) {
      case "male":
        return <Mars className="h-4 w-4" />
      case "female":
        return <Venus className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getGenderLabel = (gender) => {
    switch (gender.toLowerCase()) {
      case "male":
        return "Hommes"
      case "female":
        return "Femmes"
      default:
        return "Non spécifié"
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6">
      <div className="w-full max-w-sm">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="mb-6 last:mb-0"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
                    {getGenderIcon(item.name)}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{getGenderLabel(item.name)}</span>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-gray-900">{item.value}</div>
                  <div className="text-xs text-gray-500">{Math.round(percentage)}%</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: index * 0.2, ease: "easeOut" }}
                  className="h-full rounded-full shadow-sm"
                  style={{
                    backgroundColor: item.color,
                    background: `linear-gradient(90deg, ${item.color} 0%, ${item.color}dd 100%)`,
                  }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// CORRECTION : Graphique à barres amélioré pour les niveaux d'utilisateurs
function ModernBarChart({ data }) {
  const maxValue = Math.max(...data.map((item) => item.count), 1)

  return (
    <div className="flex flex-col h-full px-4">
      {/* Graphique principal */}
      <div className="flex items-end justify-between gap-3 h-48 mt-4">
        {data.map((item, index) => {
          const heightPercentage = Math.max((item.count / maxValue) * 80, 10) // Minimum 10% de hauteur
          
          return (
            <div key={item.level} className="flex flex-col items-center flex-1 h-full">
              {/* Barre avec animation */}
              <div className="flex flex-col items-center justify-end h-full w-full">
                <motion.div
                  className="w-full rounded-t-lg shadow-lg relative group"
                  style={{ 
                    backgroundColor: item.color,
                    background: `linear-gradient(0deg, ${item.color} 0%, ${item.color}dd 100%)`
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPercentage}%` }}
                  transition={{ 
                    duration: 0.8, 
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    backgroundColor: `${item.color}dd`
                  }}
                >
                  {/* Tooltip au survol */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs font-medium px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                    {item.count} utilisateurs
                  </div>
                </motion.div>
              </div>

              {/* Valeur au-dessus de la barre */}
              <motion.div 
                className="text-xs font-bold text-gray-700 mb-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.5 }}
              >
                {item.count}
              </motion.div>

              {/* Label du niveau */}
              <div className="text-xs text-gray-600 text-center leading-tight min-h-[2.5rem] flex items-center justify-center px-1">
                {item.level}
              </div>
            </div>
          )
        })}
      </div>

      {/* Légende et statistiques */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Total: {data.reduce((sum, i) => sum + i.count, 0)} utilisateurs</span>
          <span>Max: {maxValue} utilisateurs</span>
        </div>
      </div>
    </div>
  )
}

function ModernLineChart({ data }) {
  const maxValue = Math.max(...data.map((item) => item.events), 1)
  const padding = { top: 30, right: 30, bottom: 50, left: 50 }
  const width = 500
  const height = 250
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const points = data.map((item, index) => ({
    x: padding.left + (index / (data.length - 1 || 1)) * chartWidth,
    y: padding.top + chartHeight - (item.events / maxValue) * chartHeight,
    value: item.events,
    label: item.month,
  }))

  const pathData = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ")
  const areaPath = `M ${padding.left},${padding.top + chartHeight} ${pathData} L ${points[points.length - 1]?.x || padding.left + chartWidth},${padding.top + chartHeight} Z`

  return (
    <div className="h-full flex items-center justify-center">
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Grille */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={padding.top + chartHeight * (1 - ratio)}
              x2={padding.left + chartWidth}
              y2={padding.top + chartHeight * (1 - ratio)}
              stroke="#E5E7EB"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
            <text
              x={padding.left - 10}
              y={padding.top + chartHeight * (1 - ratio) + 4}
              textAnchor="end"
              className="text-xs fill-gray-500"
            >
              {Math.round(maxValue * ratio)}
            </text>
          </g>
        ))}

        {/* Zone de remplissage */}
        <motion.path
          d={areaPath}
          fill="url(#areaGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Ligne principale */}
        <motion.path
          d={pathData}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#shadow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {/* Points */}
        {points.map((point, index) => (
          <g key={index}>
            <motion.circle
              cx={point.x}
              cy={point.y}
              r="6"
              fill="white"
              stroke="#3B82F6"
              strokeWidth="3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 0.5, type: "spring" }}
              className="cursor-pointer hover:r-8 transition-all"
              filter="url(#shadow)"
            />
            <motion.text
              x={point.x}
              y={point.y - 15}
              textAnchor="middle"
              className="text-xs font-bold fill-gray-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.8 }}
            >
              {point.value}
            </motion.text>
          </g>
        ))}

        {/* Labels des mois */}
        {points.map((point, index) => (
          <text
            key={index}
            x={point.x}
            y={padding.top + chartHeight + 25}
            textAnchor="middle"
            className="text-xs font-medium fill-gray-600"
          >
            {point.label}
          </text>
        ))}
      </svg>
    </div>
  )
}
