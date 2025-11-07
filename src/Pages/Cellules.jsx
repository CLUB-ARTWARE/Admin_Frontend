import React, { useEffect, useState, useCallback } from "react";
import { useCelluleStore } from "../stores/cellulesStore";
import { 
  Loader2, 
  Trash2, 
  Edit3, 
  Users, 
  PlusCircle, 
  X, 
  UserX, 
  Image as ImageIcon, 
  Upload,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Download,
  Shield,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const CellulesAdmin = () => {
  const {
    cellules,
    loading,
    error,
    fetchCellules,
    addCellule,
    updateCellule,
    deleteCellule,
    getAllUsersInCell,
    removeUserFromCell,
  } = useCelluleStore();

  // États pour les modales
  const [modalState, setModalState] = useState({
    showForm: false,
    showUsers: false,
    showImagePreview: false,
    showDeleteConfirm: false,
  });

  const [formData, setFormData] = useState({
    name: "",
    abbreviation: "",
    domain: "",
    cell_image_url: null,
  });

  const [editingCellId, setEditingCellId] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedCellForUsers, setSelectedCellForUsers] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImageForPreview, setSelectedImageForPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [selectedCellForDelete, setSelectedCellForDelete] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  // 🔹 Notification system
  const showNotification = useCallback((message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 4000);
  }, []);

  useEffect(() => {
    fetchCellules();
  }, [fetchCellules]);

  // 🔹 Filtrage des cellules
  const filteredCellules = cellules.filter(cellule => {
    const matchesSearch = cellule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cellule.abbreviation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cellule.domain?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDomain = selectedDomain === "all" || cellule.domain === selectedDomain;
    
    return matchesSearch && matchesDomain;
  });

  // 🔹 Domaines uniques pour le filtre
  const domains = ["all", ...new Set(cellules.map(cell => cell.domain).filter(Boolean))];

  // 🔹 Gestion des modales
  const openModal = (modalName) => {
    setModalState(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName) => {
    setModalState(prev => ({ ...prev, [modalName]: false }));
  };

  const closeAllModals = () => {
    setModalState({ 
      showForm: false, 
      showUsers: false, 
      showImagePreview: false,
      showDeleteConfirm: false 
    });
    resetForm();
  };

  // 🔹 Gestion du formulaire
  const resetForm = () => {
    setFormData({
      name: "",
      abbreviation: "",
      domain: "",
      cell_image_url: null,
    });
    setEditingCellId(null);
    setImagePreview(null);
    setIsSubmitting(false);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === "cell_image_url" && files && files[0]) {
      const file = files[0];
      
      // Validation du fichier
      if (!file.type.startsWith('image/')) {
        showNotification("Veuillez sélectionner un fichier image valide", "error");
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        showNotification("L'image ne doit pas dépasser 5MB", "error");
        return;
      }
      
      setFormData(prev => ({ ...prev, [name]: file }));
      
      // Prévisualisation de l'image
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageRemove = () => {
    setFormData(prev => ({ ...prev, cell_image_url: null }));
    setImagePreview(null);
    
    // Reset file input
    const fileInput = document.querySelector('input[name="cell_image_url"]');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.abbreviation.trim()) {
      showNotification("Le nom et l'abréviation de la cellule sont requis", "error");
      return;
    }

    setIsSubmitting(true);

    const data = new FormData();
    data.append("name", formData.name.trim());
    data.append("abbreviation", formData.abbreviation.trim());
    data.append("domain", formData.domain.trim());
    
    if (formData.cell_image_url) {
      if (editingCellId) {
        data.append("uploaded_cell_image", formData.cell_image_url);
      } else {
        data.append("cell_image_url", formData.cell_image_url);
      }
    }

    try {
      if (editingCellId) {
        await updateCellule(editingCellId, data);
        showNotification("Cellule mise à jour avec succès");
      } else {
        await addCellule(data);
        showNotification("Cellule créée avec succès");
      }

      closeAllModals();
    } catch (err) {
      console.error("Erreur lors de la soumission:", err);
      showNotification(err.response?.data?.message || "Une erreur est survenue", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (cell) => {
    setEditingCellId(cell.id);
    setFormData({
      name: cell.name || "",
      abbreviation: cell.abbreviation || "",
      domain: cell.domain || "",
      cell_image_url: null,
    });
    setImagePreview(cell.image_cell || null);
    openModal("showForm");
  };

  const handleDeleteClick = (cell) => {
    setSelectedCellForDelete(cell);
    openModal("showDeleteConfirm");
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCellForDelete) return;

    try {
      await deleteCellule(selectedCellForDelete.id);
      showNotification("Cellule supprimée avec succès");
      closeModal("showDeleteConfirm");
      setSelectedCellForDelete(null);
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      showNotification(err.response?.data?.message || "Erreur lors de la suppression", "error");
    }
  };

  const handleViewUsers = async (cellId) => {
    try {
      const usersInCell = await getAllUsersInCell(cellId);
      setUsers(usersInCell);
      setSelectedCellForUsers(cellId);
      openModal("showUsers");
    } catch (err) {
      console.error("Erreur lors du chargement des utilisateurs:", err);
      setUsers([]);
      showNotification("Erreur lors du chargement des membres", "error");
    }
  };

  const handleRemoveUser = async (userId) => {
    if (!selectedCellForUsers) return;
    
    try {
      await removeUserFromCell(selectedCellForUsers, userId);
      const updatedUsers = await getAllUsersInCell(selectedCellForUsers);
      setUsers(updatedUsers);
      showNotification("Membre retiré avec succès");
    } catch (err) {
      console.error("Erreur lors du retrait de l'utilisateur:", err);
      showNotification(err.response?.data?.message || "Erreur lors du retrait du membre", "error");
    }
  };

  const handleImagePreview = (imageUrl) => {
    setSelectedImageForPreview(imageUrl);
    openModal("showImagePreview");
  };

  // 🔹 Composant Modal réutilisable
  const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
    if (!isOpen) return null;

    const sizeClasses = {
      sm: "max-w-md",
      md: "max-w-2xl",
      lg: "max-w-4xl",
      xl: "max-w-6xl"
    };

    return (
      <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
        <div 
          className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden animate-scaleIn`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition p-2 rounded-lg hover:bg-gray-200"
            >
              <X size={20} />
            </button>
          </div>
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            {children}
          </div>
        </div>
      </div>
    );
  };

  // 🔹 Composant pour l'upload d'image
  const ImageUploadArea = () => (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Image de la cellule
      </label>
      
      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-blue-400 transition-colors bg-gray-50/50">
        {imagePreview ? (
          <div className="space-y-4">
            <div className="relative inline-block group">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-40 w-40 object-cover rounded-xl shadow-md cursor-pointer transition-transform group-hover:scale-105"
                onClick={() => handleImagePreview(imagePreview)}
              />
              <button
                type="button"
                onClick={handleImageRemove}
                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition shadow-lg"
              >
                <X size={16} />
              </button>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition rounded-xl" />
            </div>
            <p className="text-sm text-green-600 font-medium flex items-center justify-center gap-1">
              <CheckCircle size={16} />
              Image sélectionnée
            </p>
            {editingCellId && (
              <p className="text-xs text-blue-600">
                {formData.cell_image_url 
                  ? "Nouvelle image sera uploadée" 
                  : "Image actuelle conservée"
                }
              </p>
            )}
          </div>
        ) : (
          <div className="py-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="text-blue-600" size={24} />
            </div>
            <p className="text-sm text-gray-600 mb-2 font-medium">
              Glissez-déposez une image ou cliquez pour parcourir
            </p>
            <p className="text-xs text-gray-500 mb-6">
              PNG, JPG, JPEG jusqu'à 5MB
            </p>
            <label className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition cursor-pointer shadow-lg hover:shadow-xl">
              <ImageIcon size={18} />
              Choisir une image
              <input
                type="file"
                name="cell_image_url"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );

  // 🔹 Composant de notification
  const Notification = () => {
    if (!notification.show) return null;

    const bgColor = notification.type === "error" ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200";
    const textColor = notification.type === "error" ? "text-red-800" : "text-green-800";
    const icon = notification.type === "error" ? <AlertCircle size={20} /> : <CheckCircle size={20} />;

    return (
      <div className={`fixed top-4 right-4 border rounded-xl p-4 shadow-lg z-50 animate-in slide-in-from-right ${bgColor} ${textColor}`}>
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-medium">{notification.message}</span>
          <button
            onClick={() => setNotification({ show: false, message: "", type: "" })}
            className="ml-2 hover:opacity-70 transition"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6">
      <Notification />
      
      <div className="max-w-7xl mx-auto">
        {/* En-tête amélioré */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Gestion des Cellules</h1>
              <p className="text-gray-600 text-lg">Administrez les cellules et leurs membres avec précision</p>
            </div>
            <button
              onClick={() => openModal("showForm")}
              className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-2xl hover:shadow-3xl hover:scale-105 font-semibold group"
            >
              <PlusCircle size={22} className="group-hover:scale-110 transition" />
              Nouvelle Cellule
            </button>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher une cellule..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              
              <div className="flex gap-3">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none bg-white"
                  >
                    <option value="all">Tous les domaines</option>
                    {domains.filter(domain => domain !== "all").map(domain => (
                      <option key={domain} value={domain}>{domain}</option>
                    ))}
                  </select>
                </div>
                
                <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-xl font-medium flex items-center gap-2">
                  <Shield size={18} />
                  {filteredCellules.length} Cellule(s)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modale d'ajout/édition */}
        <Modal
          isOpen={modalState.showForm}
          onClose={closeAllModals}
          title={editingCellId ? "Modifier la Cellule" : "Créer une Nouvelle Cellule"}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom de la cellule *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                    placeholder="Ex: Cellule Innovation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Abréviation *
                  </label>
                  <input
                    type="text"
                    name="abbreviation"
                    value={formData.abbreviation}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                    placeholder="Ex: INNOV"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Domaine
                  </label>
                  <input
                    type="text"
                    name="domain"
                    value={formData.domain}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                    placeholder="Ex: Technologie, Innovation, etc."
                  />
                </div>
              </div>

              <div>
                <ImageUploadArea />
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    {editingCellId ? "Mise à jour..." : "Création..."}
                  </span>
                ) : editingCellId ? (
                  "Mettre à jour la cellule"
                ) : (
                  "Créer la cellule"
                )}
              </button>
              <button
                type="button"
                onClick={closeAllModals}
                className="px-6 py-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium"
              >
                Annuler
              </button>
            </div>
          </form>
        </Modal>

        {/* Modale de confirmation de suppression */}
        <Modal
          isOpen={modalState.showDeleteConfirm}
          onClose={() => closeModal("showDeleteConfirm")}
          title="Confirmer la suppression"
          size="sm"
        >
          <div className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-red-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Supprimer la cellule
              </h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer la cellule <strong>"{selectedCellForDelete?.name}"</strong> ? 
                Cette action est irréversible et supprimera toutes les données associées.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-600 text-white py-3 px-6 rounded-xl hover:bg-red-700 transition font-semibold"
              >
                Supprimer
              </button>
              <button
                onClick={() => closeModal("showDeleteConfirm")}
                className="flex-1 border border-gray-300 py-3 px-6 rounded-xl hover:bg-gray-50 transition font-medium"
              >
                Annuler
              </button>
            </div>
          </div>
        </Modal>

        {/* Modale de prévisualisation d'image */}
        <Modal
          isOpen={modalState.showImagePreview}
          onClose={() => closeModal("showImagePreview")}
          title="Aperçu de l'image"
          size="md"
        >
          <div className="p-6">
            {selectedImageForPreview && (
              <img
                src={selectedImageForPreview}
                alt="Preview full size"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            )}
          </div>
        </Modal>

        {/* Modale des utilisateurs */}
        <Modal
          isOpen={modalState.showUsers}
          onClose={() => closeModal("showUsers")}
          title={`Membres de la Cellule - ${users.length} membre(s)`}
          size="xl"
        >
          <div className="p-6">
            {users.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users size={64} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium text-gray-600">Aucun utilisateur dans cette cellule</p>
                <p className="text-sm text-gray-500 mt-2">Les utilisateurs apparaîtront ici une fois ajoutés à la cellule</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Utilisateur</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Niveau</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Spécialité</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {users.map((user) => (
                      <tr key={user.user_id} className="hover:bg-gray-50 transition group">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-12 w-12 flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                              {user.profile_image_url ? (
                                <img
                                  src={user.profile_image_url}
                                  alt={`${user.first_name} ${user.last_name}`}
                                  className="h-12 w-12 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-semibold text-sm">
                                  {user.first_name?.[0]}{user.last_name?.[0]}
                                </span>
                              )}
                            </div>
                            <div className="ml-4">
                              <p className="font-semibold text-gray-900">
                                {user.first_name} {user.last_name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {user.phone_number || "Non renseigné"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {user.level || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 capitalize">
                          {user.specialty || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleRemoveUser(user.user_id)}
                            className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-xl transition font-medium opacity-0 group-hover:opacity-100"
                            title="Retirer de la cellule"
                          >
                            <UserX size={16} />
                            Retirer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Modal>

        {/* Contenu principal */}
        {loading && cellules.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="animate-spin text-blue-600" size={32} />
              </div>
              <p className="text-gray-600 font-medium">Chargement des cellules...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="text-red-600" size={32} />
            </div>
            <p className="text-red-600 font-semibold text-lg mb-2">{error}</p>
            <button
              onClick={fetchCellules}
              className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition font-medium shadow-lg"
            >
              Réessayer
            </button>
          </div>
        ) : filteredCellules.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
            <Users size={80} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">Aucune cellule trouvée</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedDomain !== "all" 
                ? "Aucune cellule ne correspond à vos critères de recherche" 
                : "Commencez par créer votre première cellule"
              }
            </p>
            <button
              onClick={() => openModal("showForm")}
              className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition font-semibold shadow-lg hover:shadow-xl"
            >
              Créer une cellule
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCellules.map((cell) => (
              <div
                key={cell.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group"
              >
                {/* Image de la cellule */}
                <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden">
                  {cell.image_cell ? (
                    <>
                      <img
                        src={cell.image_cell}
                        alt={cell.name}
                        className="h-full w-full object-cover group-hover:scale-110 transition duration-500 cursor-pointer"
                        onClick={() => handleImagePreview(cell.image_cell)}
                      />
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                    </>
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                      <Users size={48} className="text-blue-300" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1 shadow-lg">
                    <span className="text-sm font-bold text-gray-800">
                      {cell.abbreviation}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      cell.isInCell 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      {cell.isInCell ? '🟢 Active' : '⚪ Inactive'}
                    </span>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition">
                    {cell.name}
                  </h3>
                  
                  {cell.domain && (
                    <p className="text-blue-600 font-semibold text-sm mb-3 line-clamp-1">
                      {cell.domain}
                    </p>
                  )}

                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Users size={16} className="mr-2" />
                    <span>{users.length} membre(s)</span>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleViewUsers(cell.id)}
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition font-medium group"
                    >
                      <Eye size={18} />
                      <span>Voir membres</span>
                    </button>
                    
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(cell)}
                        className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-xl transition"
                        title="Modifier"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(cell)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CellulesAdmin;