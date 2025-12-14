import { useEffect, useState } from "react"
import { useUserStore } from "../stores/useUserStore"
import { Search, Check, X, Trash2, UserCheck, UserX, AlertCircle, Phone, Calendar, GraduationCap, Shield, Crown, Users, Edit, Save, XCircle } from "lucide-react"
import toast from "react-hot-toast"

const User = () => {
  const { users, loading, fetchUsers, acceptUser, rejectUser, deleteUser, changeRole } = useUserStore()

  const [rejectReason, setRejectReason] = useState("")
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterRole, setFilterRole] = useState("all")
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)
  const [editingRoleId, setEditingRoleId] = useState(null)
  const [selectedRole, setSelectedRole] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleAccept = async (userId) => {
    setActionLoading(userId)
    await acceptUser(userId)
    await fetchUsers()
    setActionLoading(null)
    toast.success("Utilisateur accepté")
  }

  const handleReject = async (userId) => {
    if (!rejectReason.trim()) {
      alert("Veuillez saisir une raison de rejet")
      return
    }
    setActionLoading(userId)
    await rejectUser(userId, rejectReason)
    setRejectReason("")
    setSelectedUserId(null)
    setShowRejectModal(false)
    setActionLoading(null)
    fetchUsers()
    toast.error("Utilisateur rejeté")
  }

  const handleDelete = async (userId) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
      setActionLoading(userId)
      await deleteUser(userId)
      setActionLoading(null)
      fetchUsers()
    }
  }

  const handleRoleChange = async (userId) => {
    if (!selectedRole) {
      toast.error("Veuillez sélectionner un rôle")
      return
    }

    setActionLoading(userId)
    try {
      // Convertir le nom du rôle en ID
      const roleMap = {
        "Membre": 1,
        "Admin": 2,
        "Président": 3
      }
      
      const roleId = roleMap[selectedRole]
      await changeRole(userId, roleId)
      
      toast.success("Rôle modifié avec succès")
      setShowRoleModal(false)
      setSelectedRole("")
      setEditingRoleId(null)
      fetchUsers()
    } catch (error) {
      toast.error("Erreur lors du changement de rôle")
    } finally {
      setActionLoading(null)
    }
  }

  const openRejectModal = (userId) => {
    setSelectedUserId(userId)
    setShowRejectModal(true)
    setRejectReason("")
  }

  const openRoleModal = (userId, currentRole) => {
    setSelectedUserId(userId)
    setSelectedRole(getRoleName(currentRole))
    setShowRoleModal(true)
  }

  const closeRejectModal = () => {
    setShowRejectModal(false)
    setSelectedUserId(null)
    setRejectReason("")
  }

  const closeRoleModal = () => {
    setShowRoleModal(false)
    setSelectedUserId(null)
    setSelectedRole("")
  }

  const startRoleEditing = (userId, currentRole) => {
    setEditingRoleId(userId)
    setSelectedRole(getRoleName(currentRole))
  }

  const cancelRoleEditing = () => {
    setEditingRoleId(null)
    setSelectedRole("")
  }

  const getRoleName = (roleId) => {
    switch (roleId) {
      case 1: return "Membre"
      case 2: return "Admin"
      case 3: return "Président"
      default: return "Membre"
    }
  }

  const getRoleBadge = (roleId) => {
    switch (roleId) {
      case 1:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Users className="h-3 w-3 mr-1" />
            Membre
          </span>
        )
      case 2:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <Shield className="h-3 w-3 mr-1" />
            Admin
          </span>
        )
      case 3:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <Crown className="h-3 w-3 mr-1" />
            Président
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Users className="h-3 w-3 mr-1" />
            Membre
          </span>
        )
    }
  }

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase()
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.specialty && user.specialty.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "allowed" && user.status === "allowed") ||
      (filterStatus === "pending" && user.status === "pending") ||
      (filterStatus === "denied" && user.status === "denied")

    const matchesRole =
      filterRole === "all" ||
      (filterRole === "member" && user.role_id === 1) ||
      (filterRole === "admin" && user.role_id === 2) ||
      (filterRole === "president" && user.role_id === 3)

    return matchesSearch && matchesStatus && matchesRole
  })

  const stats = {
    total: users.length,
    allowed: users.filter((u) => u.status === "allowed").length,
    pending: users.filter((u) => u.status === "pending").length,
    denied: users.filter((u) => u.status === "denied").length,
    members: users.filter((u) => u.role_id === 1).length,
    admins: users.filter((u) => u.role_id === 2).length,
    presidents: users.filter((u) => u.role_id === 3).length,
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "allowed":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <span className="h-1.5 w-1.5 rounded-full bg-green-600 mr-2"></span>
            Accepté
          </span>
        )
      case "pending":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-600 mr-2"></span>
            En attente
          </span>
        )
      case "denied":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <span className="h-1.5 w-1.5 rounded-full bg-red-600 mr-2"></span>
            Rejeté
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-600 mr-2"></span>
            Inconnu
          </span>
        )
    }
  }

  const canShowActions = (user) => {
    // Afficher les actions seulement pour les utilisateurs en attente
    return user.status === "pending"
  }

  const canChangeRole = (user) => {
    // Seuls les utilisateurs acceptés peuvent changer de rôle
    return user.status === "allowed"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Chargement des utilisateurs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des utilisateurs</h1>
        <p className="text-gray-600">Gérez les demandes d'inscription, les comptes utilisateurs et leurs rôles</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{stats.admins}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Membres</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.members}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{stats.pending}</p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou spécialité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tous statuts
            </button>
            <button
              onClick={() => setFilterStatus("allowed")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === "allowed" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Acceptés
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === "pending" ? "bg-orange-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              En attente
            </button>
          </div>

          {/* Role Filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterRole("all")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterRole === "all" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tous rôles
            </button>
            <button
              onClick={() => setFilterRole("member")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterRole === "member" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Membres
            </button>
            <button
              onClick={() => setFilterRole("admin")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterRole === "admin" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Admins
            </button>
            <button
              onClick={() => setFilterRole("president")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterRole === "president" ? "bg-amber-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Présidents
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <UserX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== "all" || filterRole !== "all"
                ? "Essayez de modifier vos critères de recherche"
                : "Aucun utilisateur dans le système"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Formation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.user_id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.profile_image_url ? (
                          <img
                            src={user.profile_image_url || "/placeholder.svg"}
                            alt={`${user.first_name} ${user.last_name}`}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {user.first_name?.charAt(0).toUpperCase()}
                            {user.last_name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.gender} • ID: {user.user_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      {user.phone_number && (
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <Phone className="h-3 w-3 mr-1" />
                          {user.phone_number}
                        </div>
                      )}
                      {user.birth_date && (
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(user.birth_date).toLocaleDateString("fr-FR")}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 flex items-center">
                        <GraduationCap className="h-4 w-4 mr-1 text-blue-600" />
                        {user.level}
                      </div>
                      {user.specialty && <div className="text-sm text-gray-500 mt-1">{user.specialty}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingRoleId === user.user_id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          >
                            <option value="Membre">Membre</option>
                            <option value="Admin">Admin</option>
                            <option value="Président">Président</option>
                          </select>
                          <button
                            onClick={() => handleRoleChange(user.user_id)}
                            disabled={actionLoading === user.user_id}
                            className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={cancelRoleEditing}
                            className="p-1 text-red-600 hover:text-red-800"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {getRoleBadge(user.role_id)}
                          {canChangeRole(user) && (
                            <button
                              onClick={() => startRoleEditing(user.user_id, user.role_id)}
                              className="p-1 text-gray-500 hover:text-blue-600 transition"
                              title="Modifier le rôle"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {canShowActions(user) && (
                          <>
                            <button
                              onClick={() => handleAccept(user.user_id)}
                              disabled={actionLoading === user.user_id}
                              className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Accepter
                            </button>
                            <button
                              onClick={() => openRejectModal(user.user_id)}
                              disabled={actionLoading === user.user_id}
                              className="inline-flex items-center px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Rejeter
                            </button>
                          </>
                        )}
                    
                        <button
                          onClick={() => handleDelete(user.user_id)}
                          disabled={actionLoading === user.user_id}
                          className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Rejeter l'utilisateur</h3>
              <button onClick={closeRejectModal} className="text-gray-400 hover:text-gray-600 transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Veuillez indiquer la raison du rejet de cet utilisateur. Cette information sera enregistrée.
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Saisir la raison du rejet..."
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition resize-none"
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeRejectModal}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                Annuler
              </button>
              <button
                onClick={() => handleReject(selectedUserId)}
                disabled={!rejectReason.trim() || actionLoading === selectedUserId}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmer le rejet
              </button>
            </div>
          </div>
        </div>
      )}

     
    </div>
  )
}

export default User
