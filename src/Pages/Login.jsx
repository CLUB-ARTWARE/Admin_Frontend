import { useState, useEffect } from "react"
import { Eye, EyeOff, Mail, ArrowRight, Shield, Sun, Moon } from "lucide-react"

import logoDark from "../images/logo.png"
import logo from "../images/logoDark.png"
import { useAuthStore } from "../stores/authStore"
import { useNavigate } from "react-router-dom"
import { useThemeStore } from "../stores/themeStore"

export default function AdminLogin() {
  const { theme, toggleTheme } = useThemeStore()
  const [showPassword, setShowPassword] = useState(false)
  const { loginAdmin, loading, error } = useAuthStore()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [localError, setLocalError] = useState("") // Erreur locale pour l'affichage

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    if (theme === null) {
      toggleTheme(prefersDark ? 'dark' : 'light')
    }
  }, [theme, toggleTheme])

  // Réinitialiser l'erreur locale quand les champs changent
  useEffect(() => {
    if (formData.email || formData.password) {
      setLocalError("")
      useAuthStore.getState().error = null // Réinitialiser l'erreur du store
    }
  }, [formData.email, formData.password])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError("") // Réinitialiser l'erreur locale avant la tentative
    
    try {
      await loginAdmin(formData)
      navigate("/admin/dashboard") 
    } catch (err) {
      console.error("Erreur de connexion:", err)
      
      // Gérer l'erreur pour l'affichage
      const errorMessage = err.response?.data?.message 
        || err.response?.data 
        || err.message 
        || "Email ou mot de passe incorrect";
      
      setLocalError(errorMessage)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const isDarkMode = theme === 'dark'

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900"
          : "bg-gradient-to-br from-purple-300 via-white to-gray-300"
      }`}
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div
            className={`rounded-3xl shadow-2xl border-0 ${
              isDarkMode
                ? "bg-gray-800/95 backdrop-blur-md shadow-purple-900/30"
                : "bg-white/95 backdrop-blur-md shadow-purple-100/50"
            } transform transition-all duration-500 hover:scale-[1.02]`}
          >
            {/* Header */}
            <div className="p-8 pb-6">
              <div className="relative mb-6">
                <div
                  className={`absolute inset-0 rounded-2xl blur-lg opacity-30 ${
                    isDarkMode ? "bg-[#9112BC]" : "bg-[#9112BC]"
                  }`}
                ></div>
                <div
                  className={`relative flex justify-center p-4 rounded-2xl border ${
                    isDarkMode
                      ? "bg-gradient-to-r from-gray-800 to-gray-700 border-purple-900/50"
                      : "bg-gradient-to-r from-purple-50 to-white border-purple-100"
                  }`}
                >
                  <img
                    src={isDarkMode ? logoDark : logo}
                    alt="Company Logo"
                    className="h-16 w-auto transform transition-transform duration-300 hover:scale-110"
                  />
                </div>
              </div>

              <div className="text-center space-y-3">
                <h1
                  className={`text-3xl font-bold bg-gradient-to-r ${
                    isDarkMode
                      ? "from-[#9112BC] to-purple-300"
                      : "from-[#9112BC] to-purple-500"
                  } bg-clip-text text-transparent`}
                >
                  Connexion Admin
                </h1>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Accédez à votre espace administrateur sécurisé
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className={`block text-sm font-medium mb-3 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Email professionnel
                </label>
                <div className="relative group">
                  <div
                    className={`absolute inset-y-0 left-0 pl-3 flex items-center transition-colors duration-200 ${
                      isDarkMode
                        ? "group-focus-within:text-[#9112BC] text-gray-500"
                        : "group-focus-within:text-[#9112BC] text-gray-400"
                    }`}
                  >
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 ${
                      isDarkMode
                        ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-500 focus:border-[#9112BC] focus:ring-[#9112BC]/20"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#9112BC] focus:ring-[#9112BC]/20"
                    } ${localError ? "border-red-500 focus:border-red-500" : ""}`}
                    placeholder="admin@entreprise.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className={`block text-sm font-medium mb-3 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Mot de passe
                </label>
                <div className="relative group">
                  <div
                    className={`absolute inset-y-0 left-0 pl-3 flex items-center transition-colors duration-200 ${
                      isDarkMode
                        ? "group-focus-within:text-[#9112BC] text-gray-500"
                        : "group-focus-within:text-[#9112BC] text-gray-400"
                    }`}
                  >
                    <Shield className="h-5 w-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-12 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 ${
                      isDarkMode
                        ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-500 focus:border-[#9112BC] focus:ring-[#9112BC]/20"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#9112BC] focus:ring-[#9112BC]/20"
                    } ${localError ? "border-red-500 focus:border-red-500" : ""}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors duration-200 ${
                      isDarkMode
                        ? "text-gray-400 hover:text-[#9112BC]"
                        : "text-gray-400 hover:text-[#9112BC]"
                    }`}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Message d'erreur avec espacement */}
              {localError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 animate-fade-in">
                  <p className="text-red-600 text-sm text-center">
                    {localError}
                  </p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 group ${
                  loading
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:shadow-lg transform hover:-translate-y-1"
                } ${
                  isDarkMode
                    ? "bg-gradient-to-r from-[#9112BC] to-purple-600 hover:from-[#7A0F9D] hover:to-purple-700 text-white"
                    : "bg-gradient-to-r from-[#9112BC] to-purple-600 hover:from-[#7A0F9D] hover:to-purple-700 text-white"
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Connexion...</span>
                  </>
                ) : (
                  <>
                    <span>Se connecter</span>
                    <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </button>
            </form>

            <div
              className={`px-8 py-4 border-t ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <p
                className={`text-center text-xs ${
                  isDarkMode ? "text-gray-500" : "text-gray-400"
                }`}
              >
                © 2025 Votre Entreprise. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className={`fixed top-6 right-6 p-3 rounded-2xl transition-all duration-300 group ${
          isDarkMode
            ? "bg-gradient-to-br from-gray-700 to-gray-800 text-yellow-300 hover:shadow-lg hover:shadow-yellow-500/20"
            : "bg-gradient-to-br from-white to-gray-50 text-[#9112BC] shadow-md hover:shadow-lg"
        } hover:scale-110`}
      >
        {isDarkMode ? (
          <Sun className="h-5 w-5 transform group-hover:rotate-180 transition-transform duration-500" />
        ) : (
          <Moon className="h-5 w-5 transform group-hover:rotate-12 transition-transform duration-500" />
        )}
      </button>
    </div>
  )
}
