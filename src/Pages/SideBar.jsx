import { useState, useEffect, useMemo } from "react"
import { Outlet, useNavigate, useLocation } from "react-router-dom"
import logoDark from "../images/logo.png"
import logo from "../images/logoDark.png"
import {
  Users,
  Calendar,
  UserCheck,
  ClipboardList,
  FileText,
  Bell,
  Building2,
  Phone,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Home,
  Settings,
  LogOut,
  Sun,
  Moon,
  User,
  Search,
  Menu,
  X,
  Shield,
} from "lucide-react"
import { useAuthStore } from "../stores/authStore"
import { useThemeStore } from "../stores/themeStore"

export default function Sidebar({ isCollapsed = false, onToggleCollapse }) {
  const [isMobile, setIsMobile] = useState(false)
  const { theme, toggleTheme } = useThemeStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  const { AdminUser, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  // Utilisation directe du thème depuis le store
  const isDarkMode = theme === "dark"

  // Détection responsive
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) setMobileOpen(false)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Menus
  const menuSections = useMemo(() => [
    {
      id: "main",
      label: "Principal",
      items: [
        { id: "dashboard", label: "Dashboard", icon: Home, path: "/admin/dashboard", description: "Vue d'ensemble" },
      ]
    },
    {
      id: "management",
      label: "Gestion",
      items: [
        { id: "users", label: "Utilisateurs", icon: Users, path: "/admin/users", description: "Gestion des utilisateurs" },
        { id: "events", label: "Événements", icon: Calendar, path: "/admin/events", description: "Planification" },
        { id: "Presence & absence", label: "Presence & absence", icon: UserCheck, path: "/admin/Presence&absence", description: "Suivi des inscriptions" },
      ]
    },
    {
      id: "operations",
      label: "Opérations",
      items: [
        { id: "cellules", label: "Cellules", icon: ClipboardList, path: "/admin/cellules", description: "Contrôle des présences" },
        { id: "documents", label: "Documents", icon: FileText, path: "/admin/documents", description: "Gestion documentaire" },
        { id: "announce", label: "Announce", icon: Building2, path: "/admin/announce", description: "Gestion des announce" },
      ]
    },
    {
      id: "communication",
      label: "Communication",
      items: [
        { id: "notifications", label: "Notifications", icon: Bell, path: "/admin/notifications", description: "Centre de notifications" },
        { id: "contact", label: "Contacts", icon: Phone, path: "/admin/contact", description: "Carnet d'adresses" },
        { id: "cellul", label: "Mobile", icon: Smartphone, path: "/admin/cellul", description: "Gestion mobile" },
      ]
    }
  ], [])

  const bottomMenuItems = [
    { id: "settings", label: "Paramètres", icon: Settings, path: "/admin/settings", description: "Configuration système" },
    { id: "logout", label: "Déconnexion", icon: LogOut, action: () => handleLogout(), description: "Se déconnecter" },
  ]

  // Filtrage des menus
  const filteredMenuSections = useMemo(() => {
    if (!searchQuery) return menuSections

    const query = searchQuery.toLowerCase()
    return menuSections
      .map(section => ({
        ...section,
        items: section.items.filter(item =>
          item.label.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
        )
      }))
      .filter(section => section.items.length > 0)
  }, [searchQuery, menuSections])

  // Handlers
  const handleItemClick = (item) => {
    if (item.action) {
      item.action()
    } else if (item.path) {
      navigate(item.path)
    }
    if (isMobile) setMobileOpen(false)
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/admin/login")
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
    }
  }

  const getActiveItem = () => {
    const currentPath = location.pathname
    const allItems = menuSections.flatMap(section => section.items)
    return allItems.find(item => currentPath.startsWith(item.path))?.id || "dashboard"
  }

  const activeItem = getActiveItem()

  // Composants
  const MenuItem = ({ item, isActive, showFull }) => {
    const Icon = item.icon
    return (
      <button
        onClick={() => handleItemClick(item)}
        className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${
          isActive
            ? "bg-blue-600 text-white shadow-lg"
            : isDarkMode
              ? "text-slate-300 hover:bg-slate-800 hover:text-white"
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        } ${showFull ? "" : "justify-center"}`}
        title={!showFull ? `${item.label} - ${item.description}` : undefined}
      >
        <Icon className={`h-4 w-4 flex-shrink-0 ${showFull ? "mr-3" : ""} ${
          isActive ? "" : "group-hover:scale-110 transition-transform"
        }`} />

        {showFull && (
          <div className="flex-1 text-left min-w-0">
            <span className="font-medium text-sm block truncate">{item.label}</span>
            <span className={`text-xs block truncate mt-0.5 ${
              isActive ? "text-blue-100" : isDarkMode ? "text-slate-500" : "text-gray-500"
            }`}>
              {item.description}
            </span>
          </div>
        )}
      </button>
    )
  }

  const MenuSection = ({ section, showFull }) => {
    if (!showFull && !isMobile) return null

    return (
      <div className="mb-4">
        {showFull && (
          <div className="px-3 mb-2">
            <span className={`text-xs font-semibold uppercase tracking-wider ${
              isDarkMode ? "text-slate-500" : "text-gray-500"
            }`}>
              {section.label}
            </span>
          </div>
        )}
        <div className="space-y-1">
          {section.items.map(item => (
            <MenuItem
              key={item.id}
              item={item}
              isActive={activeItem === item.id}
              showFull={showFull}
            />
          ))}
        </div>
      </div>
    )
  }

  // Header
  const HorizontalHeader = () => (
    <div className={`w-full border-b sticky top-0 z-40 ${
      isDarkMode ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"
    }`}>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Gauche */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`p-2 rounded-lg lg:hidden ${
                isDarkMode ? "hover:bg-slate-800 text-slate-300" : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            {!isMobile && (
              <button
                onClick={onToggleCollapse}
                className={`p-2 rounded-lg hidden lg:block ${
                  isDarkMode ? "hover:bg-slate-800 text-slate-300" : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
            )}

            <div className="flex items-center space-x-2">
              <img 
                src={isDarkMode ? logoDark : logo} 
                alt="Logo" 
                className="h-7 w-auto" 
              />
              {!isMobile && !isCollapsed && (
                <div className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  Admin Panel
                </div>
              )}
            </div>
          </div>

          {/* Droite */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? "hover:bg-slate-800 text-amber-400" : "hover:bg-gray-100 text-gray-600"
              }`}
              title={isDarkMode ? "Passer en mode clair" : "Passer en mode sombre"}
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <div className="flex items-center space-x-2">
              <div className="text-right hidden lg:block">
                <p className={`font-semibold text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {AdminUser?.first_name || "Admin"} {AdminUser?.last_name || "User"}
                </p>
                <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                  Administrateur
                </p>
              </div>
              <button
                className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-colors ${
                  isDarkMode ? "border-slate-600 bg-slate-800 hover:bg-slate-700" : "border-gray-300 bg-gray-100 hover:bg-gray-200"
                }`}
                onClick={() => navigate("/admin/profile")}
                title="Profil"
              >
                {AdminUser?.avatar ? (
                  <img src={AdminUser.avatar} alt="Profile" className="w-full h-full rounded-lg object-cover" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Sidebar
  const SidebarContent = () => {
    const showFull = !isCollapsed || isMobile
    
    return (
      <>
        {isMobile && mobileOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)} 
          />
        )}

        <div className={`h-full transition-all duration-300 flex flex-col ${
          isCollapsed && !isMobile ? "w-16" : "w-64" // Largeur réduite
        } ${
          isDarkMode ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"
        } ${
          isMobile ? "fixed inset-y-0 left-0 z-50 shadow-xl" : "sticky top-0 h-screen border-r"
        } ${isMobile && !mobileOpen ? "-translate-x-full" : "translate-x-0"}`}>

          {isMobile && (
            <div className={`p-4 border-b flex-shrink-0 ${
              isDarkMode ? "border-slate-700" : "border-gray-200"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <img src={isDarkMode ? logoDark : logo} alt="Logo" className="h-7 w-auto" />
                  <span className={`font-bold text-base ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    Admin Panel
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className={`p-2 rounded-lg ${
                    isDarkMode ? "hover:bg-slate-800 text-slate-300" : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-3">
              {filteredMenuSections.map(section => (
                <MenuSection
                  key={section.id}
                  section={section}
                  showFull={showFull}
                />
              ))}
            </nav>
          </div>

          <div className={`border-t p-3 space-y-1 flex-shrink-0 ${
            isDarkMode ? "border-slate-700" : "border-gray-200"
          }`}>
            {bottomMenuItems.map(item => (
              <MenuItem
                key={item.id}
                item={item}
                isActive={activeItem === item.id}
                showFull={showFull}
              />
            ))}
          </div>
        </div>
      </>
    )
  }

  return (
    <div className={`flex h-screen overflow-hidden ${
      isDarkMode ? "dark" : ""
    }`}>
      <SidebarContent />
      
      <div className="flex-1 flex flex-col min-w-0">
        <HorizontalHeader />
        
        <main className={`flex-1 overflow-y-auto transition-colors ${
          isDarkMode ? "bg-slate-950" : "bg-gray-50"
        }`}>
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}