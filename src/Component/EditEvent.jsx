

import { useState, useEffect, useRef } from "react"
import { useThemeStore } from "../stores/themeStore"

// Icônes SVG optimisées
const Icons = {
  close: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  calendar: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  ),
  clock: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  location: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  user: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  ),
  upload: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
      />
    </svg>
  ),
  image: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  ),
  check: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  alert: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  ),
  spinner: (
    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  ),
}

export default function EditEventModal({ isOpen, onClose, onSubmit, event }) {
  const { theme } = useThemeStore()
  const fileInputRef = useRef(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    responsable: "",
    cellule_name: "",
    type: "event",
    date: "",
    time_start: "",
    time_end: "",
    location: "",
    image: null,
  })
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [showSuccess, setShowSuccess] = useState(false)

  // Configuration des thèmes améliorée
  const themeConfig = {
    light: {
      background: "bg-white",
      text: "text-gray-900",
      textSecondary: "text-gray-600",
      textMuted: "text-gray-500",
      border: "border-gray-200",
      borderHover: "hover:border-gray-300",
      modalBackground: "bg-white",
      inputBackground: "bg-gray-50",
      inputBorder: "border-gray-300",
      inputFocus: "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
      buttonPrimary:
        "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40",
      buttonSecondary: "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300",
      backdrop: "bg-black/60",
      dragActive: "border-blue-500 bg-blue-50",
      dragInactive: "border-gray-300 bg-gray-50",
      success: "bg-green-50 border-green-200 text-green-800",
      error: "bg-red-50 border-red-200 text-red-600",
    },
    dark: {
      background: "bg-gray-900",
      text: "text-white",
      textSecondary: "text-gray-300",
      textMuted: "text-gray-400",
      border: "border-gray-700",
      borderHover: "hover:border-gray-600",
      modalBackground: "bg-gray-800",
      inputBackground: "bg-gray-900/50",
      inputBorder: "border-gray-700",
      inputFocus: "focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500",
      buttonPrimary:
        "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30",
      buttonSecondary: "bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600",
      backdrop: "bg-black/80",
      dragActive: "border-blue-500 bg-blue-900/20",
      dragInactive: "border-gray-700 bg-gray-900/50",
      success: "bg-green-900/30 border-green-700 text-green-300",
      error: "bg-red-900/30 border-red-700 text-red-300",
    },
  }

  const currentTheme = themeConfig[theme] || themeConfig.light

  const formatDateForInput = (isoDateString) => {
    if (!isoDateString) return ""
    const date = new Date(isoDateString)
    return date.toISOString().split("T")[0]
  }

  const formatTimeFromISO = (isoDateString) => {
    if (!isoDateString) return ""
    const date = new Date(isoDateString)
    return date.toTimeString().split(" ")[0].substring(0, 5)
  }

  // Validation des champs
  const validateField = (name, value) => {
    switch (name) {
      case "title":
        return value.trim().length < 3 ? "Le titre doit contenir au moins 3 caractères" : ""
      case "description":
        return value.trim().length < 10 ? "La description doit contenir au moins 10 caractères" : ""
      case "time_end":
        if (formData.time_start && value && value <= formData.time_start) {
          return "L'heure de fin doit être après l'heure de début"
        }
        return ""
      case "date":
        if (value) {
          const selectedDate = new Date(value)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          if (selectedDate < today) {
            return "La date ne peut pas être dans le passé"
          }
        }
        return ""
      default:
        return ""
    }
  }

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || "",
        description: event.description || "",
        responsable: event.responsable || "",
        cellule_name: event.cellule_name || "",
        type: event.type || "event",
        date: formatDateForInput(event.date) || "",
        time_start: event.time_start ? formatTimeFromISO(`1970-01-01T${event.time_start}`) : "",
        time_end: event.time_end ? formatTimeFromISO(`1970-01-01T${event.time_end}`) : "",
        location: event.location || "",
        image: null,
      })

      if (event.image_url) {
        setImagePreview(event.image_url)
      }
      setErrors({})
      setTouched({})
    }
  }, [event])

  const handleInputChange = (e) => {
    const { name, value, files } = e.target

    if (name === "image" && files[0]) {
      handleImageFile(files[0])
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))

      // Validation en temps réel pour les champs touchés
      if (touched[name]) {
        const error = validateField(name, value)
        setErrors((prev) => ({ ...prev, [name]: error }))
      }
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    const error = validateField(name, value)
    setErrors((prev) => ({ ...prev, [name]: error }))
  }

  const handleImageFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: "L'image ne doit pas dépasser 5MB" }))
        return
      }

      setFormData((prev) => ({ ...prev, image: file }))
      setErrors((prev) => ({ ...prev, image: "" }))

      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(file)
    } else {
      setErrors((prev) => ({ ...prev, image: "Veuillez sélectionner une image valide" }))
    }
  }

  // Gestion du drag and drop
  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleImageFile(files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!event) return

    // Valider tous les champs
    const newErrors = {}
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key])
      if (error) newErrors[key] = error
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}))
      return
    }

    setLoading(true)
    try {
      const submitData = {
        ...formData,
        date: formData.date ? new Date(formData.date).toISOString() : event.date,
      }

      await onSubmit(event.id, submitData)
      setShowSuccess(true)

      // Fermer après un court délai pour montrer le succès
      setTimeout(() => {
        resetForm()
        onClose()
        setShowSuccess(false)
      }, 1500)
    } catch (error) {
      console.error("Error updating event:", error)
      setErrors({ submit: "Une erreur est survenue lors de la modification" })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      responsable: "",
      cellule_name: "",
      type: "event",
      date: "",
      time_start: "",
      time_end: "",
      location: "",
      image: null,
    })
    setImagePreview(null)
    setErrors({})
    setTouched({})
  }

  const handleClose = () => {
    if (!loading) {
      resetForm()
      onClose()
    }
  }

  // Fermer avec la touche Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen && !loading) {
        handleClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, loading])

  // Empêcher le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen || !event) return null

  return (
    <div
      className={`fixed inset-0 ${currentTheme.backdrop} backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200`}
      onClick={handleClose}
    >
      <div
        className={`${currentTheme.modalBackground} rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden transform animate-in zoom-in-95 slide-in-from-bottom-4 duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header avec gradient */}
        <div
          className={`relative p-6 border-b ${currentTheme.border} bg-gradient-to-r from-blue-600/5 to-purple-600/5`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className={`text-2xl font-bold ${currentTheme.text} mb-1`}>Modifier l'Événement</h2>
              <p className={`text-sm ${currentTheme.textSecondary}`}>
                Mettez à jour les informations de votre événement
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className={`p-2.5 rounded-xl ${currentTheme.buttonSecondary} transition-all duration-200 disabled:opacity-50 hover:scale-105 active:scale-95`}
              aria-label="Fermer"
            >
              {Icons.close}
            </button>
          </div>

          {/* Barre de progression visuelle */}
          {loading && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"
                style={{ width: "60%" }}
              ></div>
            </div>
          )}
        </div>

        {/* Message de succès */}
        {showSuccess && (
          <div
            className={`mx-6 mt-6 p-4 rounded-xl border ${currentTheme.success} flex items-center gap-3 animate-in slide-in-from-top-2 duration-300`}
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
              {Icons.check}
            </div>
            <div>
              <p className="font-semibold">Événement modifié avec succès !</p>
              <p className="text-sm opacity-90">Les modifications ont été enregistrées.</p>
            </div>
          </div>
        )}

        {/* Message d'erreur global */}
        {errors.submit && (
          <div className={`mx-6 mt-6 p-4 rounded-xl border ${currentTheme.error} flex items-center gap-3`}>
            <div className="flex-shrink-0">{Icons.alert}</div>
            <p className="text-sm font-medium">{errors.submit}</p>
          </div>
        )}

        {/* Form avec scroll personnalisé */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)] custom-scrollbar"
        >
          {/* Section Informations principales */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2">
              <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              <h3 className={`text-lg font-semibold ${currentTheme.text}`}>Informations principales</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Titre */}
              <div className="md:col-span-2 space-y-2">
                <label className={`block text-sm font-semibold ${currentTheme.text}`}>
                  Titre de l'événement <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  required
                  className={`w-full px-4 py-3 ${currentTheme.inputBackground} border ${errors.title && touched.title ? "border-red-500" : currentTheme.inputBorder} rounded-xl ${currentTheme.inputFocus} transition-all duration-200 ${currentTheme.text}`}
                  placeholder="Ex: Conférence annuelle 2025"
                />
                {errors.title && touched.title && (
                  <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                    <span className="text-xs">{Icons.alert}</span>
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Type */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold ${currentTheme.text}`}>
                  Type d'événement <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 ${currentTheme.inputBackground} border ${currentTheme.inputBorder} rounded-xl ${currentTheme.inputFocus} transition-all duration-200 ${currentTheme.text} cursor-pointer`}
                >
                  <option value="event">📅 Événement</option>
                  <option value="training">🎓 Formation</option>
                  <option value="presentation">🎤 Présentation</option>
                </select>
              </div>

              {/* Cellule */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold ${currentTheme.text}`}>
                  Cellule organisatrice <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="cellule_name"
                  value={formData.cellule_name}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 ${currentTheme.inputBackground} border ${currentTheme.inputBorder} rounded-xl ${currentTheme.inputFocus} transition-all duration-200 ${currentTheme.text}`}
                  placeholder="Ex: Cellule Communication"
                />
              </div>
            </div>
          </div>

          {/* Section Date et Horaires */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2">
              <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              <h3 className={`text-lg font-semibold ${currentTheme.text}`}>Date et horaires</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Date */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold ${currentTheme.text}`}>
                  Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div
                    className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${currentTheme.textMuted}`}
                  >
                    {Icons.calendar}
                  </div>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full pl-11 pr-4 py-3 ${currentTheme.inputBackground} border ${errors.date && touched.date ? "border-red-500" : currentTheme.inputBorder} rounded-xl ${currentTheme.inputFocus} transition-all duration-200 ${currentTheme.text}`}
                  />
                </div>
                {errors.date && touched.date && (
                  <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                    <span className="text-xs">{Icons.alert}</span>
                    {errors.date}
                  </p>
                )}
              </div>

              {/* Heure de début */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold ${currentTheme.text}`}>
                  Début <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div
                    className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${currentTheme.textMuted}`}
                  >
                    {Icons.clock}
                  </div>
                  <input
                    type="time"
                    name="time_start"
                    value={formData.time_start}
                    onChange={handleInputChange}
                    required
                    className={`w-full pl-11 pr-4 py-3 ${currentTheme.inputBackground} border ${currentTheme.inputBorder} rounded-xl ${currentTheme.inputFocus} transition-all duration-200 ${currentTheme.text}`}
                  />
                </div>
              </div>

              {/* Heure de fin */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold ${currentTheme.text}`}>
                  Fin <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div
                    className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${currentTheme.textMuted}`}
                  >
                    {Icons.clock}
                  </div>
                  <input
                    type="time"
                    name="time_end"
                    value={formData.time_end}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full pl-11 pr-4 py-3 ${currentTheme.inputBackground} border ${errors.time_end && touched.time_end ? "border-red-500" : currentTheme.inputBorder} rounded-xl ${currentTheme.inputFocus} transition-all duration-200 ${currentTheme.text}`}
                  />
                </div>
                {errors.time_end && touched.time_end && (
                  <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                    <span className="text-xs">{Icons.alert}</span>
                    {errors.time_end}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section Lieu et Responsable */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2">
              <div className="h-1 w-8 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full"></div>
              <h3 className={`text-lg font-semibold ${currentTheme.text}`}>Lieu et responsable</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Lieu */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold ${currentTheme.text}`}>
                  Lieu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div
                    className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${currentTheme.textMuted}`}
                  >
                    {Icons.location}
                  </div>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className={`w-full pl-11 pr-4 py-3 ${currentTheme.inputBackground} border ${currentTheme.inputBorder} rounded-xl ${currentTheme.inputFocus} transition-all duration-200 ${currentTheme.text}`}
                    placeholder="Ex: Salle de conférence A"
                  />
                </div>
              </div>

              {/* Responsable */}
              <div className="space-y-2">
                <label className={`block text-sm font-semibold ${currentTheme.text}`}>
                  Responsable <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div
                    className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${currentTheme.textMuted}`}
                  >
                    {Icons.user}
                  </div>
                  <input
                    type="text"
                    name="responsable"
                    value={formData.responsable}
                    onChange={handleInputChange}
                    required
                    className={`w-full pl-11 pr-4 py-3 ${currentTheme.inputBackground} border ${currentTheme.inputBorder} rounded-xl ${currentTheme.inputFocus} transition-all duration-200 ${currentTheme.text}`}
                    placeholder="Ex: Jean Dupont"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className={`block text-sm font-semibold ${currentTheme.text}`}>
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              onBlur={handleBlur}
              required
              rows={4}
              className={`w-full px-4 py-3 ${currentTheme.inputBackground} border ${errors.description && touched.description ? "border-red-500" : currentTheme.inputBorder} rounded-xl ${currentTheme.inputFocus} transition-all duration-200 resize-none ${currentTheme.text}`}
              placeholder="Décrivez votre événement en détail..."
            />
            <div className="flex items-center justify-between">
              {errors.description && touched.description ? (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <span className="text-xs">{Icons.alert}</span>
                  {errors.description}
                </p>
              ) : (
                <p className={`text-xs ${currentTheme.textMuted}`}>Minimum 10 caractères</p>
              )}
              <p className={`text-xs ${currentTheme.textMuted}`}>{formData.description.length} caractères</p>
            </div>
          </div>

          {/* Image avec drag and drop */}
          <div className="space-y-3">
            <label className={`block text-sm font-semibold ${currentTheme.text}`}>Image de l'événement</label>

            {/* Zone de drag and drop */}
            <div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragging ? currentTheme.dragActive : currentTheme.dragInactive
              } ${currentTheme.borderHover} hover:scale-[1.02]`}
            >
              <input
                ref={fileInputRef}
                type="file"
                name="image"
                onChange={handleInputChange}
                accept="image/*"
                className="hidden"
              />

              <div className="flex flex-col items-center gap-3">
                <div
                  className={`p-4 rounded-full ${isDragging ? "bg-blue-100 dark:bg-blue-900/30" : "bg-gray-100 dark:bg-gray-800"} transition-colors duration-300`}
                >
                  {Icons.upload}
                </div>
                <div>
                  <p className={`font-semibold ${currentTheme.text} mb-1`}>
                    {isDragging ? "Déposez l'image ici" : "Cliquez ou glissez une image"}
                  </p>
                  <p className={`text-sm ${currentTheme.textMuted}`}>PNG, JPG, GIF jusqu'à 5MB</p>
                </div>
              </div>
            </div>

            {errors.image && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <span className="text-xs">{Icons.alert}</span>
                {errors.image}
              </p>
            )}

            {/* Preview d'image amélioré */}
            {imagePreview && (
              <div className="relative group">
                <div className="relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700">
                  <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="w-full h-48 object-cover" />
                  {formData.image && (
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1.5 bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                        {Icons.check}
                        Nouvelle image
                      </span>
                    </div>
                  )}

                  {/* Overlay au hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        fileInputRef.current?.click()
                      }}
                      className="px-4 py-2 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
                    >
                      Changer l'image
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions avec design amélioré */}
          <div className={`flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t ${currentTheme.border}`}>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 hover:scale-105 active:scale-95 ${currentTheme.buttonSecondary}`}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 ${currentTheme.buttonPrimary}`}
            >
              {loading ? (
                <>
                  {Icons.spinner}
                  <span>Modification en cours...</span>
                </>
              ) : (
                <>
                  {Icons.check}
                  <span>Enregistrer les modifications</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.7);
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes zoom-in-95 {
          from {
            transform: scale(0.95);
          }
          to {
            transform: scale(1);
          }
        }
        
        @keyframes slide-in-from-bottom-4 {
          from {
            transform: translateY(1rem);
          }
          to {
            transform: translateY(0);
          }
        }
        
        @keyframes slide-in-from-top-2 {
          from {
            transform: translateY(-0.5rem);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-in {
          animation-fill-mode: both;
        }
        
        .fade-in {
          animation: fade-in 0.2s ease-out;
        }
        
        .zoom-in-95 {
          animation: zoom-in-95 0.3s ease-out;
        }
        
        .slide-in-from-bottom-4 {
          animation: slide-in-from-bottom-4 0.3s ease-out;
        }
        
        .slide-in-from-top-2 {
          animation: slide-in-from-top-2 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
