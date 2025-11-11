import { useState, useEffect, useRef } from "react"
import { useEventStore } from "../stores/eventStore"
import { useCelluleStore } from "../stores/cellulesStore"

export default function CreateEventModal({ isOpen, onClose }) {
  const { createEvent, loading } = useEventStore()
  const { fetchCellules, cellules } = useCelluleStore()
  const fileInputRef = useRef(null)
  const modalRef = useRef(null)

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
  const [imagePreview, setImagePreview] = useState("")
  const [errors, setErrors] = useState({})
  const [isDragging, setIsDragging] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  // Liste enrichie de types d'événements
  const eventTypes = [
    { value: "conference", label: "Conférence", icon: "🎤" },
    { value: "training", label: "Formation", icon: "📚" },
    { value: "workshop", label: "Atelier", icon: "🔧" },
    { value: "meeting", label: "Réunion", icon: "👥" },
    { value: "seminar", label: "Séminaire", icon: "🏛️" },
    { value: "webinar", label: "Webinaire", icon: "💻" },
    { value: "networking", label: "Réseautage", icon: "🤝" },
    { value: "ceremony", label: "Cérémonie", icon: "🏆" },
    { value: "competition", label: "Compétition", icon: "⚡" },
    { value: "other", label: "Autre", icon: "📅" },
  ]

  // Charger les cellules dès l'ouverture du modal
  useEffect(() => {
    if (isOpen) {
      fetchCellules()
      document.body.style.overflow = 'hidden'
      setIsClosing(false)
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Fermeture avec Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) handleClose()
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen])

  // Animation de fermeture
  const handleClose = () => {
    if (!loading) {
      setIsClosing(true)
      setTimeout(() => {
        resetForm()
        onClose()
        setIsClosing(false)
      }, 300)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) newErrors.title = "Titre requis"
    if (!formData.description.trim()) newErrors.description = "Description requise"
    if (!formData.date) newErrors.date = "Date requise"
    if (!formData.time_start) newErrors.time_start = "Heure de début requise"
    if (!formData.time_end) newErrors.time_end = "Heure de fin requise"
    if (!formData.location.trim()) newErrors.location = "Lieu requis"
    if (!formData.responsable.trim()) newErrors.responsable = "Responsable requis"
    if (!formData.cellule_name) newErrors.cellule_name = "Cellule requise"

    if (formData.time_start && formData.time_end && formData.time_start >= formData.time_end) {
      newErrors.time_end = "L'heure de fin doit être après l'heure de début"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      const submitData = new FormData()
      Object.keys(formData).forEach((key) => submitData.append(key, formData[key]))
      if (selectedFile) submitData.append("event_image", selectedFile)

      await createEvent(submitData)
      resetForm()
      onClose()
    } catch (error) {
      setErrors({ submit: error.message || "Erreur lors de la création" })
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }))
  }

  // Gestion du drag & drop
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
    if (file && file.type.startsWith("image/")) handleImageFile(file)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) handleImageFile(file)
  }

  const handleImageFile = (file) => {
    if (file.size > 10 * 1024 * 1024) {
      setErrors({ image: "L'image ne peut pas dépasser 10MB" })
      return
    }
    setSelectedFile(file)

    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)

    if (errors.image) setErrors((prev) => ({ ...prev, image: "" }))
  }

  const removeImage = () => {
    setImagePreview("")
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
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
    setIsDragging(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  if (!isOpen && !isClosing) return null

  return (
    <div 
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Créer un nouvel événement</h2>
              <p className="text-blue-100 mt-1">Remplissez les détails de votre événement</p>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/20 p-2 rounded-full transition-colors duration-200"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.submit}
            </div>
          )}

          {/* Champs texte généraux */}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Titre de l'événement *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full p-3 border-2 rounded-xl transition-colors ${
                  errors.title 
                    ? "border-red-500 focus:border-red-500" 
                    : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                }`}
                placeholder="Ex: Conférence sur l'innovation technologique"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`w-full p-3 border-2 rounded-xl transition-colors resize-none ${
                  errors.description 
                    ? "border-red-500 focus:border-red-500" 
                    : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                }`}
                placeholder="Décrivez votre événement en détail..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.description}
                </p>
              )}
            </div>
          </div>

          {/* Type d'événement */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Type d'événement *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {eventTypes.map((type) => (
                <label
                  key={type.value}
                  className={`relative flex flex-col items-center p-3 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.type === type.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={type.value}
                    checked={formData.type === type.value}
                    onChange={handleChange}
                    className="absolute opacity-0"
                  />
                  <span className="text-2xl mb-2">{type.icon}</span>
                  <span className="text-sm font-medium text-center">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date et heures */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
              <div className="relative">
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className={`w-full p-3 border-2 rounded-xl transition-colors ${
                    errors.date 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  }`}
                />
                <svg className="absolute right-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              {errors.date && <p className="text-red-500 text-sm mt-2">{errors.date}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Heure début *</label>
              <div className="relative">
                <input
                  type="time"
                  name="time_start"
                  value={formData.time_start}
                  onChange={handleChange}
                  className={`w-full p-3 border-2 rounded-xl transition-colors ${
                    errors.time_start 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  }`}
                />
                <svg className="absolute right-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Heure fin *</label>
              <div className="relative">
                <input
                  type="time"
                  name="time_end"
                  value={formData.time_end}
                  onChange={handleChange}
                  className={`w-full p-3 border-2 rounded-xl transition-colors ${
                    errors.time_end 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  }`}
                />
                <svg className="absolute right-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              {errors.time_end && (
                <p className="text-red-500 text-sm mt-2">{errors.time_end}</p>
              )}
            </div>
          </div>

          {/* Lieu et responsable */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Lieu *</label>
              <div className="relative">
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`w-full p-3 border-2 rounded-xl transition-colors ${
                    errors.location 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  }`}
                  placeholder="Ex: Salle de conférence A"
                />
                <svg className="absolute right-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Responsable *</label>
              <div className="relative">
                <input
                  type="text"
                  name="responsable"
                  value={formData.responsable}
                  onChange={handleChange}
                  className={`w-full p-3 border-2 rounded-xl transition-colors ${
                    errors.responsable 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  }`}
                  placeholder="Nom du responsable"
                />
                <svg className="absolute right-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Sélection de la cellule */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Cellule *</label>
            <select
              name="cellule_name"
              value={formData.cellule_name}
              onChange={handleChange}
              className={`w-full p-3 border-2 rounded-xl transition-colors appearance-none ${
                errors.cellule_name 
                  ? "border-red-500 focus:border-red-500" 
                  : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              }`}
            >
              <option value="">Sélectionner une cellule</option>
              {cellules?.map((c) => (
                <option key={c.id} value={c.abreviation}>
                  {c.abbreviation}
                </option>
              ))}
            </select>
            {errors.cellule_name && (
              <p className="text-red-500 text-sm mt-2">{errors.cellule_name}</p>
            )}
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Image de l'événement <span className="text-gray-500 font-normal">(Optionnel)</span>
            </label>

            {!imagePreview ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  isDragging 
                    ? "border-blue-500 bg-blue-50 scale-[1.02]" 
                    : "border-gray-300 bg-gray-50 hover:border-gray-400"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="flex flex-col items-center">
                  <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600 mb-2">
                    {isDragging ? "Déposez l'image ici" : "Glissez-déposez une image ou"}
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                  >
                    Parcourir les fichiers
                  </button>
                  <p className="text-xs text-gray-500 mt-3">PNG, JPG, GIF jusqu'à 10MB</p>
                </div>
              </div>
            ) : (
              <div className="relative group">
                <img
                  src={imagePreview}
                  alt="Aperçu"
                  className="w-full h-64 object-cover rounded-xl border-2 border-gray-200 group-hover:brightness-90 transition-all"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="absolute bottom-3 left-3 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  Image sélectionnée
                </div>
              </div>
            )}
          </div>

          {/* Boutons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-md hover:shadow-lg font-semibold flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Création en cours...
                </>
              ) : (
                "Créer l'événement"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
