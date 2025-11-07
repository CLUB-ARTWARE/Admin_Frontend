"use client"

import { useState, useEffect } from "react"
import CreateEventModal from "../Component/CreateEvent"
import EditEventModal from "../Component/EditEvent"
import RegistrationsModal from "../Component/Registration"
import { useEventStore } from "../stores/eventStore"
import { useAuthStore } from "../stores/authStore"
import { useThemeStore } from "../stores/themeStore"

export default function Events() {
  const { events, loading, fetchEvents, createEvent, updateEvent, deleteEvent, fetchRegistrations } = useEventStore()
  const { theme } = useThemeStore()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showRegistrationsModal, setShowRegistrationsModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const handleCreateEvent = async (formData) => {
    try {
      await createEvent(formData)
      setShowCreateModal(false)
      fetchEvents()
    } catch (error) {
      console.error("Error creating event:", error)
      throw error
    }
  }

  const handleUpdateEvent = async (eventId, formData) => {
    try {
      await updateEvent(eventId, formData)
      setShowEditModal(false)
      fetchEvents()
    } catch (error) {
      console.error("Error updating event:", error)
      throw error
    }
  }

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) {
      try {
        await deleteEvent(eventId)
        fetchEvents()
      } catch (error) {
        console.error("Error deleting event:", error)
      }
    }
  }

  const handleViewRegistrations = async (eventId) => {
    try {
      const registrationsData = await fetchRegistrations(eventId)
      setRegistrations(registrationsData || [])
      setSelectedEvent(events.find((event) => event.id === eventId))
      setShowRegistrationsModal(true)
    } catch (error) {
      console.error("Error fetching registrations:", error)
    }
  }

  const openEditModal = (event) => {
    setSelectedEvent(event)
    setShowEditModal(true)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const formatTime = (timeString) => {
    return timeString?.substring(0, 5) || ""
  }

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  // Classes CSS pour les thèmes
  const themeClasses = {
    light: {
      background: "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50",
      text: {
        primary: "text-slate-900",
        secondary: "text-slate-600",
        muted: "text-slate-500"
      },
      card: "bg-white border-slate-200",
      input: "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-blue-500 focus:border-transparent"
    },
    dark: {
      background: "bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900",
      text: {
        primary: "text-white",
        secondary: "text-slate-300",
        muted: "text-slate-400"
      },
      card: "bg-slate-800 border-slate-700",
      input: "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-blue-500 focus:border-transparent"
    }
  }

  const currentTheme = themeClasses[theme] || themeClasses.light

  return (
    <div className={`min-h-screen transition-colors duration-300 ${currentTheme.background}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className={`text-4xl lg:text-5xl font-bold tracking-tight ${currentTheme.text.primary}`}>
                Événements
              </h1>
              <p className={`text-lg max-w-2xl ${currentTheme.text.secondary}`}>
                Découvrez et gérez tous vos événements en un seul endroit
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-200"
            >
              <svg
                className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Créer un événement
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Rechercher un événement..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-12 pr-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 shadow-sm transition-all ${currentTheme.input}`}
              />
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              <div className={`w-16 h-16 border-4 rounded-full ${
                theme === 'dark' ? 'border-blue-800' : 'border-blue-200'
              }`}></div>
              <div className="w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
            </div>
            <p className={`mt-6 font-medium ${currentTheme.text.secondary}`}>Chargement des événements...</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={() => openEditModal(event)}
                onViewRegistrations={() => handleViewRegistrations(event.id)}
                onDelete={() => handleDeleteEvent(event.id)}
                formatDate={formatDate}
                formatTime={formatTime}
                theme={theme}
              />
            ))}
          </div>
        ) : (
          <EmptyEventsState 
            searchQuery={searchQuery} 
            theme={theme}
          />
        )}
      </div>

      {/* Modals */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateEvent}
      />

      <EditEventModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdateEvent}
        event={selectedEvent}
      />

      <RegistrationsModal
        isOpen={showRegistrationsModal}
        onClose={() => setShowRegistrationsModal(false)}
        event={selectedEvent}
        registrations={registrations}
      />
    </div>
  )
}

function EventCard({ event, onEdit, onViewRegistrations, onDelete, formatDate, formatTime, theme }) {
  const [isHovered, setIsHovered] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const typeConfig = {
    training: {
      gradient: "from-emerald-500 to-teal-600",
      bg: theme === 'dark' ? "bg-emerald-900" : "bg-emerald-50",
      text: theme === 'dark' ? "text-emerald-300" : "text-emerald-700",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
    },
    presentation: {
      gradient: "from-purple-500 to-pink-600",
      bg: theme === 'dark' ? "bg-purple-900" : "bg-purple-50",
      text: theme === 'dark' ? "text-purple-300" : "text-purple-700",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
          />
        </svg>
      ),
    },
    conference: {
      gradient: "from-blue-500 to-cyan-600",
      bg: theme === 'dark' ? "bg-blue-900" : "bg-blue-50",
      text: theme === 'dark' ? "text-blue-300" : "text-blue-700",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </svg>
      ),
    },
  }

  const config = typeConfig[event.type] || typeConfig.conference

  // Classes pour le thème
  const cardClass = theme === 'dark' 
    ? "bg-slate-800 border-slate-700" 
    : "bg-white border-slate-200"
  
  const textClass = theme === 'dark' 
    ? "text-white" 
    : "text-slate-900"
  
  const textSecondaryClass = theme === 'dark' 
    ? "text-slate-300" 
    : "text-slate-600"
  
  const borderClass = theme === 'dark' 
    ? "border-slate-700" 
    : "border-slate-100"

  const actionButtonClass = theme === 'dark'
    ? "bg-slate-700 hover:bg-slate-600 text-white"
    : "bg-white/90 hover:bg-white text-slate-700"

  const dropdownClass = theme === 'dark'
    ? "bg-slate-700 border-slate-600"
    : "bg-white border-slate-200"

  const dropdownItemClass = theme === 'dark'
    ? "hover:bg-slate-600 text-slate-200"
    : "hover:bg-slate-50 text-slate-700"

  return (
    <div
      className={`group relative rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border ${cardClass}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
        {event.image_url ? (
          <img
            src={event.image_url || "/placeholder.svg"}
            alt={event.title}
            className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? "scale-110" : "scale-100"}`}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
            <svg className="w-16 h-16 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

        {/* Type Badge */}
        <div className="absolute top-4 left-4">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${config.bg} backdrop-blur-sm border border-white/20 shadow-lg`}
          >
            {config.icon}
            <span className={`text-xs font-semibold ${config.text} capitalize`}>
              {event.type === "training" ? "Formation" : event.type === "presentation" ? "Présentation" : "Conférence"}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div
          className={`absolute top-4 right-4 transition-all duration-300 ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowActions(!showActions)
            }}
            className={`p-2 rounded-full shadow-lg transition-colors ${actionButtonClass}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>

          {showActions && (
            <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-xl border overflow-hidden z-10 ${dropdownClass}`}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                  setShowActions(false)
                }}
                className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors ${dropdownItemClass}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Modifier
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                  setShowActions(false)
                }}
                className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Supprimer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <h3 className={`text-xl font-bold line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors ${textClass}`}>
          {event.title}
        </h3>

        {/* Description */}
        <p className={`text-sm line-clamp-2 leading-relaxed ${textSecondaryClass}`}>
          {event.description}
        </p>

        {/* Details Grid */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-3 text-sm">
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
              theme === 'dark' ? 'bg-blue-900' : 'bg-blue-50'
            }`}>
              <svg className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span className={`font-medium ${textClass}`}>{formatDate(event.date)}</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
              theme === 'dark' ? 'bg-purple-900' : 'bg-purple-50'
            }`}>
              <svg className={`w-4 h-4 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span className={`font-medium ${textClass}`}>
              {formatTime(event.time_start)} - {formatTime(event.time_end)}
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
              theme === 'dark' ? 'bg-emerald-900' : 'bg-emerald-50'
            }`}>
              <svg className={`w-4 h-4 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <span className={`font-medium line-clamp-1 ${textClass}`}>{event.location}</span>
          </div>
        </div>

        {/* Footer */}
        <div className={`pt-4 border-t flex items-center justify-between ${borderClass}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {event.responsable?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex flex-col mr-5">
              <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                Responsable
              </span>
              <span className={`text-sm font-semibold ${textClass}`}>
                {event.responsable}
              </span>
            </div>
          </div>

          <button
            onClick={onViewRegistrations}
            className="group/btn flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200"
          >
            <span className="group-hover/btn:translate-x-0.5 transition-transform">Participants</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function EmptyEventsState({ searchQuery, theme }) {
  const textClass = theme === 'dark' ? "text-white" : "text-slate-900"
  const textSecondaryClass = theme === 'dark' ? "text-slate-300" : "text-slate-600"
  const buttonClass = theme === 'dark' 
    ? "bg-slate-700 hover:bg-slate-600 text-white" 
    : "bg-slate-100 hover:bg-slate-200 text-slate-700"

  return (
    <div className="flex flex-col items-center justify-center py-24 px-4">
      <div className="relative">
        <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
          theme === 'dark' 
            ? 'bg-gradient-to-br from-blue-900 to-indigo-900' 
            : 'bg-gradient-to-br from-blue-100 to-indigo-100'
        }`}>
          <svg className={`w-16 h-16 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-yellow-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </div>

      <h3 className={`mt-8 text-2xl font-bold ${textClass}`}>
        {searchQuery ? "Aucun résultat trouvé" : "Aucun événement"}
      </h3>

      <p className={`mt-3 text-center max-w-md ${textSecondaryClass}`}>
        {searchQuery
          ? "Essayez de modifier vos critères de recherche."
          : "Commencez par créer votre premier événement pour rassembler votre communauté."}
      </p>

      {searchQuery && (
        <button
          onClick={() => {
            window.location.reload()
          }}
          className={`mt-6 px-6 py-3 font-medium rounded-xl transition-colors ${buttonClass}`}
        >
          Réinitialiser la recherche
        </button>
      )}
    </div>
  )
}