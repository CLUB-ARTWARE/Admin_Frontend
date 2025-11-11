import { useEffect, useState, useMemo } from "react"
import { useAuthStore } from "../stores/authStore"
import { useEventStore } from "../stores/eventStore"
import { 
  Search, 
  Check, 
  X, 
  Users, 
  UserCheck, 
  UserX, 
  Calendar, 
  MapPin, 
  Clock,
  Phone,
  Mail,
  GraduationCap,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Building,
  Crown,
  UserPlus,
  ListTodo
} from "lucide-react"
import toast from "react-hot-toast"

export default function Presence() {

  const {
    events,
    loading,
    fetchEvents,
    presentUsers,
    absentUsers,
    fetchPresentUsers,
    fetchAbsentUsers,
    fetchRegistrations,
    setUserPresent,
    clearUsers,
  } = useEventStore()

  const [selectedEvent, setSelectedEvent] = useState(null)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)
  const [registrations, setRegistrations] = useState([])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const handleSelectEvent = async (eventId) => {
    clearUsers()
    setSelectedEvent(eventId)
    setSearchTerm("")
    setActiveTab("all")
    setLoadingUsers(true)
    
    try {
      const [presentData, absentData, registrationsData] = await Promise.all([
        fetchPresentUsers(eventId),
        fetchAbsentUsers(eventId),
        fetchRegistrations(eventId)
      ])
      
      // Correction: accéder à la propriété registrations de l'objet
      setRegistrations(registrationsData?.registrations || [])
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Erreur lors du chargement des participants")
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleRefresh = async () => {
    if (!selectedEvent) return
    
    setRefreshing(true)
    try {
      const [presentData, absentData, registrationsData] = await Promise.all([
        fetchPresentUsers(selectedEvent),
        fetchAbsentUsers(selectedEvent),
        fetchRegistrations(selectedEvent)
      ])
      
      // Correction: accéder à la propriété registrations de l'objet
      setRegistrations(registrationsData?.registrations || [])
      toast.success("Liste actualisée")
    } catch (error) {
      console.error("Error refreshing data:", error)
      toast.error("Erreur lors de l'actualisation")
    } finally {
      setRefreshing(false)
    }
  }

  const handleSetUserPresent = async (userId) => {
    if (!selectedEvent) return
    
    setActionLoading(userId)
    try {
      await setUserPresent(selectedEvent, userId)
      toast.success("Utilisateur marqué comme présent")
    } catch (error) {
      console.error("Error setting user present:", error)
      toast.error("Erreur lors de la mise à jour")
    } finally {
      setActionLoading(null)
    }
  }

  const getEventDetails = () => {
    return events.find(event => event.id === selectedEvent)
  }

  const formatTime = (timeString) => {
    return timeString?.substring(0, 5)
  }

  const getStatusBadge = (user) => {
    const statusConfig = {
      allowed: { 
        label: "Autorisé", 
        color: "bg-green-100 text-green-800 border border-green-200",
        icon: CheckCircle2
      },
      pending: { 
        label: "En attente", 
        color: "bg-orange-100 text-orange-800 border border-orange-200",
        icon: AlertCircle
      },
      blocked: { 
        label: "Bloqué", 
        color: "bg-red-100 text-red-800 border border-red-200",
        icon: X
      }
    }
    
    const config = statusConfig[user.user_status] || statusConfig.pending
    const IconComponent = config.icon
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent size={12} />
        {config.label}
      </span>
    )
  }

  const getRegistrationStatusBadge = (registration) => {
    const statusConfig = {
      registered: { 
        label: "Inscrit", 
        color: "bg-blue-100 text-blue-800 border border-blue-200",
        icon: UserPlus
      },
      present: { 
        label: "Présent", 
        color: "bg-green-100 text-green-800 border border-green-200",
        icon: CheckCircle2
      },
      absent: { 
        label: "Absent", 
        color: "bg-red-100 text-red-800 border border-red-200",
        icon: UserX
      },
      cancelled: { 
        label: "Annulé", 
        color: "bg-gray-100 text-gray-800 border border-gray-200",
        icon: X
      }
    }
    
    const config = statusConfig[registration.status] || statusConfig.registered
    const IconComponent = config.icon
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent size={12} />
        {config.label}
      </span>
    )
  }

  const getLevelBadge = (level) => {
    const levelMap = {
      ci: { label: "CI", color: "bg-blue-100 text-blue-800 border border-blue-200" },
      cc: { label: "DEUST", color: "bg-purple-100 text-purple-800 border border-purple-200" },
      ct: { label: "LST", color: "bg-indigo-100 text-indigo-800 border border-indigo-200" },
      cs: { label: "MST", color: "bg-cyan-100 text-cyan-800 border border-cyan-200" }
    }
    
    const config = levelMap[level] || { label: level, color: "bg-gray-100 text-gray-800 border border-gray-200" }
    return (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    )
  }

  // Filter users with useMemo for better performance
  const filteredPresentUsers = useMemo(() => 
    presentUsers.filter(user =>
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [presentUsers, searchTerm]
  )

  const filteredAbsentUsers = useMemo(() => 
    absentUsers.filter(user =>
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [absentUsers, searchTerm]
  )

  // Correction: accéder directement au tableau registrations
  const filteredRegistrations = useMemo(() => 
    registrations.filter(registration =>
      `${registration.user?.first_name} ${registration.user?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.user?.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [registrations, searchTerm]
  )

  // Get registration users who are not in present or absent lists
  const getPendingRegistrations = useMemo(() => {
    const presentUserIds = new Set(presentUsers.map(user => user.user_id))
    const absentUserIds = new Set(absentUsers.map(user => user.user_id))
    
    return filteredRegistrations.filter(registration => {
      // Correction: extraire l'ID utilisateur correctement depuis l'objet registration
      const userId = registration.user?.user_id || registration.user_id
      return !presentUserIds.has(userId) && !absentUserIds.has(userId)
    })
  }, [filteredRegistrations, presentUsers, absentUsers])

  const getEventStats = () => {
    // Correction: utiliser le tableau registrations directement
    const totalRegistrations = registrations.length
    const presentCount = presentUsers.length
    const absentCount = absentUsers.length
    const pendingCount = getPendingRegistrations.length
    
    const presentPercentage = totalRegistrations > 0 ? (presentCount / totalRegistrations) * 100 : 0
    const absentPercentage = totalRegistrations > 0 ? (absentCount / totalRegistrations) * 100 : 0
    const pendingPercentage = totalRegistrations > 0 ? (pendingCount / totalRegistrations) * 100 : 0
    
    return { 
      totalRegistrations,
      presentPercentage, 
      absentPercentage,
      pendingPercentage,
      presentCount,
      absentCount,
      pendingCount
    }
  }

  const stats = getEventStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Chargement des événements...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion de présence</h1>
        <p className="text-gray-600">Suivez et gérez les présences aux événements en temps réel</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar des événements */}
        <div className={`flex flex-col transition-all duration-300 ${
          sidebarOpen ? "w-80" : "w-20"
        } bg-white rounded-lg shadow-sm border border-gray-200`}>
          
          {/* Header Sidebar */}
          <div className="p-6 border-b border-gray-200">
            <div className={`flex items-center ${sidebarOpen ? "justify-between" : "justify-center"}`}>
              {sidebarOpen && (
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Événements
                </h2>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition"
              >
                {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Liste des événements */}
          <div className="flex-1 overflow-y-auto p-4">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => handleSelectEvent(event.id)}
                className={`cursor-pointer rounded-lg p-4 transition-all duration-200 border ${
                  selectedEvent === event.id
                    ? "border-blue-500 bg-blue-50 shadow-sm"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                } mb-3`}
              >
                {sidebarOpen ? (
                  <>
                    <h3 className="font-medium text-sm mb-2 line-clamp-2">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                      <MapPin className="h-3 w-3" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(event.date).toLocaleDateString('fr-FR')} • {formatTime(event.time_start)}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
                      <Users className="h-3 w-3" />
                      <span>{event.registration_count || 0} inscrits</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center">
                    <Calendar className="h-5 w-5 text-blue-600 mb-1" />
                    <div className="text-xs text-center font-medium line-clamp-2">
                      {event.title.split(' ').map(word => word[0]).join('').toUpperCase()}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-1">
          {selectedEvent ? (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total inscriptions</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalRegistrations}</p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Présents</p>
                      <p className="text-3xl font-bold text-green-600 mt-1">{stats.presentCount}</p>
                      <p className="text-xs text-gray-500 mt-1">{stats.presentPercentage.toFixed(1)}%</p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <UserCheck className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Absents</p>
                      <p className="text-3xl font-bold text-red-600 mt-1">{stats.absentCount}</p>
                      <p className="text-xs text-gray-500 mt-1">{stats.absentPercentage.toFixed(1)}%</p>
                    </div>
                    <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <UserX className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">En attente</p>
                      <p className="text-3xl font-bold text-orange-600 mt-1">{stats.pendingCount}</p>
                      <p className="text-xs text-gray-500 mt-1">{stats.pendingPercentage.toFixed(1)}%</p>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <UserPlus className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Taux de présence</p>
                      <p className="text-3xl font-bold text-blue-600 mt-1">
                        {stats.totalRegistrations > 0 ? ((stats.presentCount / stats.totalRegistrations) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Détails de l'événement */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start gap-6">
                  {getEventDetails()?.image_url && (
                    <img
                      src={getEventDetails().image_url}
                      alt={getEventDetails().title}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2">
                      {getEventDetails()?.title}
                    </h2>
                    <p className="text-gray-600 text-sm mb-4">
                      {getEventDetails()?.description}
                    </p>
                    <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{getEventDetails()?.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(getEventDetails()?.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(getEventDetails()?.time_start)} - {formatTime(getEventDetails()?.time_end)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{stats.totalRegistrations} inscrits</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Barre de contrôle */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex-1 w-full">
                    <div className="relative max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Rechercher un membre par nom, email ou spécialité..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                      {[
                        { key: "all", label: "Tous", icon: Users, count: stats.totalRegistrations },
                        { key: "present", label: "Présents", icon: UserCheck, count: stats.presentCount },
                        { key: "absent", label: "Absents", icon: UserX, count: stats.absentCount },
                        { key: "registrations", label: "Inscrits", icon: UserPlus, count: stats.pendingCount }
                      ].map(({ key, label, icon: Icon, count }) => (
                        <button
                          key={key}
                          onClick={() => setActiveTab(key)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                            activeTab === key
                              ? "bg-white text-gray-900 shadow-sm"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{label}</span>
                          <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                            activeTab === key 
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-200 text-gray-600"
                          }`}>
                            {count}
                          </span>
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-50"
                    >
                      <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                    </button>

                    <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Liste des participants */}
              <div className="space-y-6">
                {loadingUsers ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                      <p className="mt-4 text-gray-600">Chargement des participants...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Présents */}
                    {(activeTab === "all" || activeTab === "present") && (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <h3 className="font-semibold flex items-center gap-2">
                              <UserCheck className="h-5 w-5" />
                              Membres Présents ({filteredPresentUsers.length})
                            </h3>
                          </div>
                        </div>

                        <div className="p-6">
                          {filteredPresentUsers.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                              <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-600 font-medium">Aucun membre présent</p>
                              <p className="text-sm text-gray-500 mt-1">
                                Les membres marqués comme présents apparaîtront ici
                              </p>
                            </div>
                          ) : (
                            <div className="grid gap-4">
                              {filteredPresentUsers.map((user) => (
                                <div
                                  key={user.user_id}
                                  className="flex items-center gap-4 p-4 rounded-lg border border-green-200 bg-green-50"
                                >
                                  <div className="relative">
                                    <img
                                      src={user.profile_image_url || "/placeholder.svg"}
                                      alt={`${user.first_name} ${user.last_name}`}
                                      className="w-12 h-12 rounded-lg object-cover"
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                      <Check className="h-3 w-3 text-white" />
                                    </div>
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                      <p className="font-semibold text-sm">
                                        {user.first_name} {user.last_name}
                                      </p>
                                      {getStatusBadge(user)}
                                    </div>
                                    
                                    <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                                      <div className="flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        <span>{user.email}</span>
                                      </div>
                                      {user.phone_number && (
                                        <div className="flex items-center gap-1">
                                          <Phone className="h-3 w-3" />
                                          <span>{user.phone_number}</span>
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      {getLevelBadge(user.level)}
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                                        <BookOpen className="h-3 w-3" />
                                        {user.specialty}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <CheckCircle2 className="text-green-600 h-5 w-5" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Absents */}
                    {(activeTab === "all" || activeTab === "absent") && (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <h3 className="font-semibold flex items-center gap-2">
                              <UserX className="h-5 w-5" />
                              Membres Absents ({filteredAbsentUsers.length})
                            </h3>
                          </div>
                        </div>

                        <div className="p-6">
                          {filteredAbsentUsers.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                              <UserCheck className="h-12 w-12 text-green-400 mx-auto mb-4" />
                              <p className="text-gray-600 font-medium">Tous les membres sont présents</p>
                              <p className="text-sm text-gray-500 mt-1">Excellente participation !</p>
                            </div>
                          ) : (
                            <div className="grid gap-4">
                              {filteredAbsentUsers.map((user) => (
                                <div
                                  key={user.user_id}
                                  className="flex items-center justify-between p-4 rounded-lg border border-red-200 bg-red-50"
                                >
                                  <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <img
                                      src={user.profile_image_url || "/placeholder.svg"}
                                      alt={`${user.first_name} ${user.last_name}`}
                                      className="w-12 h-12 rounded-lg object-cover grayscale opacity-80"
                                    />
                                    
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-2">
                                        <p className="font-semibold text-sm">
                                          {user.first_name} {user.last_name}
                                        </p>
                                        {getStatusBadge(user)}
                                      </div>
                                      
                                      <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                                        <div className="flex items-center gap-1">
                                          <Mail className="h-3 w-3" />
                                          <span>{user.email}</span>
                                        </div>
                                        {user.phone_number && (
                                          <div className="flex items-center gap-1">
                                            <Phone className="h-3 w-3" />
                                            <span>{user.phone_number}</span>
                                          </div>
                                        )}
                                      </div>
                                      
                                      <div className="flex items-center gap-2">
                                        {getLevelBadge(user.level)}
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                                          <BookOpen className="h-3 w-3" />
                                          {user.specialty}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <button
                                    onClick={() => handleSetUserPresent(user.user_id)}
                                    disabled={actionLoading === user.user_id}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <Check className="h-4 w-4" />
                                    Présent
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Inscriptions en attente */}
                    {(activeTab === "all" || activeTab === "registrations") && (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                            <h3 className="font-semibold flex items-center gap-2">
                              <UserPlus className="h-5 w-5" />
                              Inscriptions en attente ({getPendingRegistrations.length})
                            </h3>
                          </div>
                        </div>

                        <div className="p-6">
                          {getPendingRegistrations.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                              <ListTodo className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-600 font-medium">Aucune inscription en attente</p>
                              <p className="text-sm text-gray-500 mt-1">
                                Tous les inscrits ont été marqués comme présents ou absents
                              </p>
                            </div>
                          ) : (
                            <div className="grid gap-4">
                              {getPendingRegistrations.map((registration) => {
                                // Correction: extraire l'utilisateur depuis registration.user
                                const user = registration.user
                                const userId = user?.user_id || registration.id
                                
                                return (
                                  <div
                                    key={registration.id}
                                    className="flex items-center justify-between p-4 rounded-lg border border-orange-200 bg-orange-50"
                                  >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                      <img
                                        src={user?.profile_image_url || "/placeholder.svg"}
                                        alt={`${user?.first_name} ${user?.last_name}`}
                                        className="w-12 h-12 rounded-lg object-cover"
                                      />
                                      
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                          <p className="font-semibold text-sm">
                                            {user?.first_name} {user?.last_name}
                                          </p>
                                          {getRegistrationStatusBadge(registration)}
                                        </div>
                                        
                                        <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                                          <div className="flex items-center gap-1">
                                            <Mail className="h-3 w-3" />
                                            <span>{user?.email}</span>
                                          </div>
                                          {user?.phone_number && (
                                            <div className="flex items-center gap-1">
                                              <Phone className="h-3 w-3" />
                                              <span>{user?.phone_number}</span>
                                            </div>
                                          )}
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                          {getLevelBadge(user?.level)}
                                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                                            <BookOpen className="h-3 w-3" />
                                            {user?.specialty}
                                          </span>
                                        </div>

                                        <div className="mt-2 text-xs text-gray-500">
                                          Inscrit le {new Date(registration.registered_at).toLocaleDateString('fr-FR')}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <button
                                      onClick={() => handleSetUserPresent(userId)}
                                      disabled={actionLoading === userId}
                                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <Check className="h-4 w-4" />
                                      Présent
                                    </button>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            /* État vide - Aucun événement sélectionné */
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun événement sélectionné</h3>
              <p className="text-gray-600">
                Sélectionnez un événement dans la sidebar pour gérer les présences
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
