"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "../stores/authStore"
import { useUserStore } from "../stores/useUserStore"
import { Search, Check, X, Trash2, UserCheck, UserX, AlertCircle, Phone, Calendar, GraduationCap } from "lucide-react"
import toast from "react-hot-toast"

const User = () => {
  const { users, loading, fetchUsers, acceptUser, rejectUser, deleteUser } = useUserStore()


  const [rejectReason, setRejectReason] = useState("")
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleAccept = async (userId) => {
    setActionLoading(userId)
    await acceptUser(userId )
    await  fetchUsers()
    setActionLoading(null)
    toast.success("l'utilisateur accepte")
  }

  const handleReject = async (userId) => {
    if (!rejectReason.trim()) {
      alert("Veuillez saisir une raison de rejet")
      return
    }
    setActionLoading(userId)
    await rejectUser(userId, rejectReason )
    setRejectReason("")
    setSelectedUserId(null)
    setShowRejectModal(false)
    setActionLoading(null)
    fetchUsers()
    toast.error("l'utilisatuer est rejeter")
  }

  const handleDelete = async (userId) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
      setActionLoading(userId)
      await deleteUser(userId )
      setActionLoading(null)
      fetchUsers()
    }
  }

  const openRejectModal = (userId) => {
    setSelectedUserId(userId)
    setShowRejectModal(true)
    setRejectReason("")
  }

  const closeRejectModal = () => {
    setShowRejectModal(false)
    setSelectedUserId(null)
    setRejectReason("")
  }

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase()
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.specialty && user.specialty.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "allowed" && user.status === "allowed") ||
      (filterStatus === "pending" && user.status === "pending") ||
      (filterStatus === "denied" && user.status === "denied")

    return matchesSearch && matchesFilter
  })

  const stats = {
    total: users.length,
    allowed: users.filter((u) => u.status === "allowed").length,
    pending: users.filter((u) => u.status === "pending").length,
    denied: users.filter((u) => u.status === "denied").length,
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
        <p className="text-gray-600">Gérez les demandes d'inscription et les comptes utilisateurs</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
              <p className="text-sm font-medium text-gray-600">Acceptés</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.allowed}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600" />
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

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejetés</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.denied}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <X className="h-6 w-6 text-red-600" />
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

          {/* Filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tous
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
            <button
              onClick={() => setFilterStatus("denied")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === "denied" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Rejetés
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
              {searchTerm
                ? "Essayez de modifier vos critères de recherche"
                : "Aucun utilisateur ne correspond aux filtres sélectionnés"}
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