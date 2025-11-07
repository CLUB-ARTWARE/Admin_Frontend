import { useState, useEffect, useRef } from "react"
import { useThemeStore } from "../stores/themeStore"

// Icônes réutilisables
const Icons = {
  close: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  loading: (
    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
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
  trash: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  ),
}

export default function CreateEventModal({ isOpen, onClose, onSubmit }) {
  const { theme } = useThemeStore()
  const fileInputRef = useRef(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "conference",
    date: "",
    time_start: "",
    time_end: "",
    location: "",
    responsable: "",
    cellule_name: "",
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [imagePreview, setImagePreview] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Configuration des thèmes
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
      inputError: "border-red-300 focus:ring-red-500/20 focus:border-red-500",
      buttonPrimary:
        "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40",
      buttonSecondary: "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300",
      errorText: "text-red-600",
      errorBackground: "bg-red-50 border-red-200",
      successBackground: "bg-green-50 border-green-200 text-green-700",
      backdrop: "bg-black/50",
      headerGradient: "from-blue-600 to-indigo-600",
      uploadZone: "bg-gray-50 border-gray-300 hover:bg-gray-100",
      uploadZoneActive: "bg-blue-50 border-blue-400",
      cardBackground: "bg-gray-50",
      divider: "border-gray-200",
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
      inputBorder: "border-gray-600",
      inputFocus: "focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400",
      inputError: "border-red-500 focus:ring-red-400/20 focus:border-red-400",
      buttonPrimary:
        "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30",
      buttonSecondary: "bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600",
      errorText: "text-red-400",
      errorBackground: "bg-red-900/20 border-red-700",
      successBackground: "bg-green-900/20 border-green-700 text-green-300",
      backdrop: "bg-black/70",
      headerGradient: "from-blue-700 to-indigo-700",
      uploadZone: "bg-gray-900/50 border-gray-600 hover:bg-gray-900",
      uploadZoneActive: "bg-blue-900/30 border-blue-500",
      cardBackground: "bg-gray-900/50",
      divider: "border-gray-700",
    },
  }

  const currentTheme = themeConfig[theme] || themeConfig.light

  // Types d'événements avec icônes
  const eventTypes = [
    { value: "conference", label: "Conférence", icon: "🎤" },
    { value: "training", label: "Formation", icon: "📚" },
    { value: "presentation", label: "Présentation", icon: "📊" },
    { value: "workshop", label: "Atelier", icon: "🛠️" },
    { value: "meeting", label: "Réunion", icon: "👥" },
    { value: "seminar", label: "Séminaire", icon: "🎓" },
    { value: "webinar", label: "Webinaire", icon: "💻" },
  ]

  // Validation en temps réel
  const validateField = (name, value) => {
    const newErrors = { ...errors }

    switch (name) {
      case "title":
        if (!value.trim()) {
          newErrors.title = "Le titre est requis"
        } else if (value.length < 3) {
          newErrors.title = "Le titre doit contenir au moins 3 caractères"
        } else if (value.length > 100) {
          newErrors.title = "Le titre ne peut pas dépasser 100 caractères"
        } else {
          delete newErrors.title
        }
        break

      case "description":
        if (!value.trim()) {
          newErrors.description = "La description est requise"
        } else if (value.length < 10) {
          newErrors.description = "La description doit contenir au moins 10 caractères"
        } else if (value.length > 1000) {
          newErrors.description = "La description ne peut pas dépasser 1000 caractères"
        } else {
          delete newErrors.description
        }
        break

      case "date":
        if (!value) {
          newErrors.date = "La date est requise"
        } else {
          const selectedDate = new Date(value)
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          if (selectedDate < today) {
            newErrors.date = "La date ne peut pas être dans le passé"
          } else {
            delete newErrors.date
          }
        }
        break

      case "time_start":
        if (!value) {
          newErrors.time_start = "L'heure de début est requise"
        } else {
          delete newErrors.time_start
          // Vérifier aussi time_end si déjà rempli
          if (formData.time_end && value >= formData.time_end) {
            newErrors.time_end = "L'heure de fin doit être après l'heure de début"
          } else if (formData.time_end) {
            delete newErrors.time_end
          }
        }
        break

      case "time_end":
        if (!value) {
          newErrors.time_end = "L'heure de fin est requise"
        } else if (formData.time_start && value <= formData.time_start) {
          newErrors.time_end = "L'heure de fin doit être après l'heure de début"
        } else {
          delete newErrors.time_end
        }
        break

      case "location":
        if (!value.trim()) {
          newErrors.location = "Le lieu est requis"
        } else if (value.length < 3) {
          newErrors.location = "Le lieu doit contenir au moins 3 caractères"
        } else {
          delete newErrors.location
        }
        break

      case "responsable":
        if (!value.trim()) {
          newErrors.responsable = "Le responsable est requis"
        } else if (value.length < 2) {
          newErrors.responsable = "Le nom doit contenir au moins 2 caractères"
        } else {
          delete newErrors.responsable
        }
        break

      case "cellule_name":
        if (!value.trim()) {
          newErrors.cellule_name = "La cellule est requise"
        } else if (value.length < 2) {
          newErrors.cellule_name = "Le nom de la cellule doit contenir au moins 2 caractères"
        } else {
          delete newErrors.cellule_name
        }
        break

      default:
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Fermeture avec la touche Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        handleClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, isSubmitting])

  // Bloquer le scroll du body quand le modal est ouvert
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

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Valider tous les champs
    const allFieldsValid = Object.keys(formData).every((key) => {
      return validateField(key, formData[key])
    })

    // Marquer tous les champs comme touchés
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {})
    setTouched(allTouched)

    if (!allFieldsValid) {
      return
    }

    setIsSubmitting(true)

    try {
      // Créer FormData pour envoyer les données avec le fichier
      const submitData = new FormData()
      
      // Ajouter tous les champs du formulaire
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key])
      })
      
      // Ajouter le fichier image s'il existe
      if (selectedFile) {
        submitData.append("event_image", selectedFile)
      }

      await onSubmit(submitData)
      setShowSuccess(true)

      // Attendre un peu avant de fermer pour montrer le succès
      setTimeout(() => {
        resetForm()
        setShowSuccess(false)
      }, 1500)
    } catch (err) {
      setErrors({ submit: err.message || "Une erreur est survenue lors de la création" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Valider le champ si déjà touché
    if (touched[name]) {
      validateField(name, value)
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    validateField(name, value)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      handleImageFile(file)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleImageFile(file)
    }
  }

  const handleImageFile = (file) => {
    // Stocker le fichier pour l'envoi
    setSelectedFile(file)
    
    // Créer une preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImagePreview("")
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "conference",
      date: "",
      time_start: "",
      time_end: "",
      location: "",
      responsable: "",
      cellule_name: "",
    })
    setSelectedFile(null)
    setImagePreview("")
    setErrors({})
    setTouched({})
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm()
      onClose()
    }
  }

  if (!isOpen) return null

  const hasErrors = Object.keys(errors).length > 0
  const isFormValid = !hasErrors && Object.keys(touched).length > 0

  return (
    <div
      className={`fixed inset-0 ${currentTheme.backdrop} backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200`}
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-4xl max-h-[90vh] overflow-hidden ${currentTheme.modalBackground} rounded-2xl shadow-2xl transform animate-in zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header avec gradient */}
        <div
          className={`sticky top-0 z-20 flex items-center justify-between px-8 py-6 bg-gradient-to-r ${currentTheme.headerGradient} text-white shadow-lg`}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Créer un événement</h2>
              <p className="text-blue-100 text-sm mt-1">Remplissez les détails de votre nouvel événement</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
            aria-label="Fermer"
          >
            {Icons.close}
          </button>
        </div>

        {/* Formulaire avec scroll */}
        <div className="overflow-y-auto max-h-[calc(90vh-88px)] custom-scrollbar">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Message de succès */}
            {showSuccess && (
              <div
                className={`p-4 rounded-xl border flex items-center gap-3 ${currentTheme.successBackground} animate-in slide-in-from-top duration-300`}
              >
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                  {Icons.check}
                </div>
                <div>
                  <p className="font-semibold">Événement créé avec succès!</p>
                  <p className="text-sm opacity-90">Redirection en cours...</p>
                </div>
              </div>
            )}

            {/* Message d'erreur global */}
            {errors.submit && (
              <div
                className={`p-4 rounded-xl border ${currentTheme.errorBackground} animate-in slide-in-from-top duration-300`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 ${currentTheme.errorText}`}>{Icons.alert}</div>
                  <div>
                    <p className="font-semibold">Erreur lors de la création</p>
                    <p className="text-sm mt-1">{errors.submit}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Section: Informations générales */}
            <div className={`p-6 rounded-xl border ${currentTheme.border} ${currentTheme.cardBackground} space-y-6`}>
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className={`p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className={`text-lg font-bold ${currentTheme.text}`}>Informations générales</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Titre */}
                <div className="md:col-span-2 space-y-2">
                  <label className={`block text-sm font-semibold ${currentTheme.text}`}>
                    Titre de l'événement <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 ${currentTheme.inputBackground} border ${touched.title && errors.title ? currentTheme.inputError : currentTheme.inputBorder} rounded-xl focus:outline-none ${currentTheme.inputFocus} transition-all duration-200 ${currentTheme.text}`}
                    placeholder="Ex: Conférence sur l'Intelligence Artificielle"
                  />
                  {touched.title && errors.title && (
                    <p
                      className={`text-sm ${currentTheme.errorText} flex items-center gap-1 animate-in slide-in-from-top duration-200`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {errors.title}
                    </p>
                  )}
                  <p className={`text-xs ${currentTheme.textMuted}`}>{formData.title.length}/100 caractères</p>
                </div>

                {/* Description */}
                <div className="md:col-span-2 space-y-2">
                  <label className={`block text-sm font-semibold ${currentTheme.text}`}>
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    rows={4}
                    className={`w-full px-4 py-3 ${currentTheme.inputBackground} border ${touched.description && errors.description ? currentTheme.inputError : currentTheme.inputBorder} rounded-xl focus:outline-none ${currentTheme.inputFocus} transition-all duration-200 resize-none ${currentTheme.text}`}
                    placeholder="Décrivez votre événement en détail..."
                  />
                  {touched.description && errors.description && (
                    <p
                      className={`text-sm ${currentTheme.errorText} flex items-center gap-1 animate-in slide-in-from-top duration-200`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {errors.description}
                    </p>
                  )}
                  <p className={`text-xs ${currentTheme.textMuted}`}>{formData.description.length}/1000 caractères</p>
                </div>

                {/* Type d'événement */}
                <div className="md:col-span-2 space-y-2">
                  <label className={`block text-sm font-semibold ${currentTheme.text}`}>
                    Type d'événement <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {eventTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, type: type.value }))
                          setTouched((prev) => ({ ...prev, type: true }))
                        }}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          formData.type === type.value
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : `${currentTheme.border} ${currentTheme.inputBackground} ${currentTheme.borderHover}`
                        }`}
                      >
                        <div className="text-2xl mb-2">{type.icon}</div>
                        <div
                          className={`text-sm font-medium ${formData.type === type.value ? "text-blue-600 dark:text-blue-400" : currentTheme.text}`}
                        >
                          {type.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Date et heure */}
            <div className={`p-6 rounded-xl border ${currentTheme.border} ${currentTheme.cardBackground} space-y-6`}>
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className={`p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white`}>
                  {Icons.calendar}
                </div>
                <h3 className={`text-lg font-bold ${currentTheme.text}`}>Date et horaires</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      onChange={handleChange}
                      onBlur={handleBlur}
                      min={new Date().toISOString().split("T")[0]}
                      className={`w-full pl-10 pr-4 py-3 ${currentTheme.inputBackground} border ${touched.date && errors.date ? currentTheme.inputError : currentTheme.inputBorder} rounded-xl focus:outline-none ${currentTheme.inputFocus} transition-all duration-200 ${currentTheme.text}`}
                    />
                  </div>
                  {touched.date && errors.date && (
                    <p
                      className={`text-sm ${currentTheme.errorText} flex items-center gap-1 animate-in slide-in-from-top duration-200`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {errors.date}
                    </p>
                  )}
                </div>

                {/* Heure de début */}
                <div className="space-y-2">
                  <label className={`block text-sm font-semibold ${currentTheme.text}`}>
                    Heure de début <span className="text-red-500">*</span>
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
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full pl-10 pr-4 py-3 ${currentTheme.inputBackground} border ${touched.time_start && errors.time_start ? currentTheme.inputError : currentTheme.inputBorder} rounded-xl focus:outline-none ${currentTheme.inputFocus} transition-all duration-200 ${currentTheme.text}`}
                    />
                  </div>
                  {touched.time_start && errors.time_start && (
                    <p
                      className={`text-sm ${currentTheme.errorText} flex items-center gap-1 animate-in slide-in-from-top duration-200`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {errors.time_start}
                    </p>
                  )}
                </div>

                {/* Heure de fin */}
                <div className="space-y-2">
                  <label className={`block text-sm font-semibold ${currentTheme.text}`}>
                    Heure de fin <span className="text-red-500">*</span>
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
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full pl-10 pr-4 py-3 ${currentTheme.inputBackground} border ${touched.time_end && errors.time_end ? currentTheme.inputError : currentTheme.inputBorder} rounded-xl focus:outline-none ${currentTheme.inputFocus} transition-all duration-200 ${currentTheme.text}`}
                    />
                  </div>
                  {touched.time_end && errors.time_end && (
                    <p
                      className={`text-sm ${currentTheme.errorText} flex items-center gap-1 animate-in slide-in-from-top duration-200`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {errors.time_end}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section: Lieu et organisation */}
            <div className={`p-6 rounded-xl border ${currentTheme.border} ${currentTheme.cardBackground} space-y-6`}>
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className={`p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white`}>
                  {Icons.location}
                </div>
                <h3 className={`text-lg font-bold ${currentTheme.text}`}>Lieu et organisation</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Lieu */}
                <div className="md:col-span-2 space-y-2">
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
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full pl-10 pr-4 py-3 ${currentTheme.inputBackground} border ${touched.location && errors.location ? currentTheme.inputError : currentTheme.inputBorder} rounded-xl focus:outline-none ${currentTheme.inputFocus} transition-all duration-200 ${currentTheme.text}`}
                      placeholder="Ex: Salle de conférence A, 123 Rue de l'Innovation"
                    />
                  </div>
                  {touched.location && errors.location && (
                    <p
                      className={`text-sm ${currentTheme.errorText} flex items-center gap-1 animate-in slide-in-from-top duration-200`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {errors.location}
                    </p>
                  )}
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
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full pl-10 pr-4 py-3 ${currentTheme.inputBackground} border ${touched.responsable && errors.responsable ? currentTheme.inputError : currentTheme.inputBorder} rounded-xl focus:outline-none ${currentTheme.inputFocus} transition-all duration-200 ${currentTheme.text}`}
                      placeholder="Nom du responsable"
                    />
                  </div>
                  {touched.responsable && errors.responsable && (
                    <p
                      className={`text-sm ${currentTheme.errorText} flex items-center gap-1 animate-in slide-in-from-top duration-200`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {errors.responsable}
                    </p>
                  )}
                </div>

                {/* Cellule */}
                <div className="space-y-2">
                  <label className={`block text-sm font-semibold ${currentTheme.text}`}>
                    Cellule <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="cellule_name"
                    value={formData.cellule_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 ${currentTheme.inputBackground} border ${touched.cellule_name && errors.cellule_name ? currentTheme.inputError : currentTheme.inputBorder} rounded-xl focus:outline-none ${currentTheme.inputFocus} transition-all duration-200 ${currentTheme.text}`}
                    placeholder="Nom de la cellule"
                  />
                  {touched.cellule_name && errors.cellule_name && (
                    <p
                      className={`text-sm ${currentTheme.errorText} flex items-center gap-1 animate-in slide-in-from-top duration-200`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {errors.cellule_name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section: Image */}
            <div className={`p-6 rounded-xl border ${currentTheme.border} ${currentTheme.cardBackground} space-y-6`}>
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className={`p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 text-white`}>
                  {Icons.image}
                </div>
                <h3 className={`text-lg font-bold ${currentTheme.text}`}>Image de l'événement</h3>
                <span className={`ml-auto text-sm ${currentTheme.textMuted}`}>(Optionnel)</span>
              </div>

              {!imagePreview ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                    isDragging ? currentTheme.uploadZoneActive : currentTheme.uploadZone
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <div className="space-y-4">
                    <div
                      className={`mx-auto w-16 h-16 rounded-full ${isDragging ? "bg-blue-100 dark:bg-blue-900/30" : "bg-gray-100 dark:bg-gray-800"} flex items-center justify-center transition-colors duration-200`}
                    >
                      <div className={isDragging ? "text-blue-500" : currentTheme.textMuted}>{Icons.upload}</div>
                    </div>

                    <div>
                      <p className={`text-lg font-semibold ${currentTheme.text} mb-1`}>
                        {isDragging ? "Déposez l'image ici" : "Glissez-déposez une image"}
                      </p>
                      <p className={`text-sm ${currentTheme.textMuted}`}>ou</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${currentTheme.buttonSecondary}`}
                    >
                      Parcourir les fichiers
                    </button>

                    <p className={`text-xs ${currentTheme.textMuted}`}>PNG, JPG, GIF jusqu'à 10MB</p>
                  </div>

                  <div className={`mt-6 pt-6 border-t ${currentTheme.divider}`}>
                    <p className={`text-sm font-medium ${currentTheme.text} mb-2`}>Ou entrez une URL d'image</p>
                    <input
                      type="url"
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-2.5 ${currentTheme.inputBackground} border ${touched.image_url && errors.image_url ? currentTheme.inputError : currentTheme.inputBorder} rounded-xl focus:outline-none ${currentTheme.inputFocus} transition-all duration-200 ${currentTheme.text}`}
                      placeholder="https://example.com/image.jpg"
                    />
                    {touched.image_url && errors.image_url && (
                      <p
                        className={`text-sm ${currentTheme.errorText} flex items-center gap-1 mt-2 animate-in slide-in-from-top duration-200`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {errors.image_url}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative group">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Aperçu"
                      className="w-full h-64 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-700"
                      onError={() => {
                        setImagePreview("")
                        setFormData((prev) => ({ ...prev, image_url: "" }))
                      }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center">
                      <button
                        type="button"
                        onClick={removeImage}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                      >
                        {Icons.trash}
                        Supprimer l'image
                      </button>
                    </div>
                  </div>
                  <p className={`text-sm ${currentTheme.textSecondary} text-center`}>
                    Survolez l'image pour la supprimer
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className={`flex gap-4 pt-6 border-t ${currentTheme.divider}`}>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className={`flex-1 px-6 py-3.5 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${currentTheme.buttonSecondary}`}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting || (Object.keys(touched).length > 0 && hasErrors)}
                className={`flex-1 px-6 py-3.5 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${currentTheme.buttonPrimary}`}
              >
                {isSubmitting ? (
                  <>
                    {Icons.loading}
                    Création en cours...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Créer l'événement
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
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
      `}</style>
    </div>
  )
}
