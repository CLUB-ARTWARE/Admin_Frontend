import React, { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Edit, X, ExternalLink } from "lucide-react";
import { useAnnouncementStore } from "../stores/announceStore";

const Announcement = () => {
  const {
    announcements,
    fetchAnnouncements,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    loading,
    error,
  } = useAnnouncementStore();

  const [form, setForm] = useState({ title: "", subtitle: "", url: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const validateForm = () => {
    const errors = {};
    
    if (!form.title.trim()) {
      errors.title = "Le titre est obligatoire";
    } else if (form.title.length < 3) {
      errors.title = "Le titre doit contenir au moins 3 caractères";
    }
    
    if (!form.subtitle.trim()) {
      errors.subtitle = "Le sous-titre est obligatoire";
    }
    
    if (!form.url.trim()) {
      errors.url = "L'URL est obligatoire";
    } else if (!isValidUrl(form.url)) {
      errors.url = "Veuillez entrer une URL valide";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (isEditing) {
        await updateAnnouncement(editId, form);
      } else {
        await addAnnouncement(form);
      }
      resetForm();
      closeModal();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setForm({ title: "", subtitle: "", url: "" });
    setFormErrors({});
    setIsEditing(false);
    setEditId(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (announcement) => {
    setForm({
      title: announcement.title,
      subtitle: announcement.subtitle,
      url: announcement.url,
    });
    setIsEditing(true);
    setEditId(announcement.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(resetForm, 300); // Delay reset to allow animation
  };

  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette annonce ?")) {
      await deleteAnnouncement(id);
    }
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Annonces</h1>
              <p className="text-gray-600 mt-2">
                Gérez et organisez vos annonces publicitaires
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Nouvelle Annonce
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-gray-900">{announcements.length}</div>
            <div className="text-gray-600 text-sm">Annonces totales</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-green-600">
              {announcements.filter(a => a.isActive).length}
            </div>
            <div className="text-gray-600 text-sm">Annonces actives</div>
          </div>
        </div>

        {/* Announcements Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading && announcements.length === 0 ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Chargement des annonces...</span>
            </div>
          ) : announcements.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="text-gray-400 text-lg mb-2">Aucune annonce disponible</div>
              <button
                onClick={openAddModal}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Créer votre première annonce
              </button>
            </div>
          ) : (
            announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden group"
              >
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                      {announcement.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {announcement.subtitle}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <a
                      href={announcement.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Voir le lien
                    </a>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                  <button
                    onClick={() => openEditModal(announcement)}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-sm">Modifier</span>
                  </button>
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="flex items-center gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm">Supprimer</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div 
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {isEditing ? "Modifier l'annonce" : "Nouvelle annonce"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="Entrez le titre de l'annonce"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        formErrors.title ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {formErrors.title && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sous-titre *
                    </label>
                    <textarea
                      name="subtitle"
                      value={form.subtitle}
                      onChange={handleChange}
                      placeholder="Entrez le sous-titre de l'annonce"
                      rows="3"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                        formErrors.subtitle ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {formErrors.subtitle && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.subtitle}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL *
                    </label>
                    <input
                      type="url"
                      name="url"
                      value={form.url}
                      onChange={handleChange}
                      placeholder="https://example.com"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        formErrors.url ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {formErrors.url && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.url}</p>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {/* Modal Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isEditing ? (
                      <>
                        <Edit className="w-5 h-5" />
                        Modifier l'annonce
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        Créer l'annonce
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcement;
