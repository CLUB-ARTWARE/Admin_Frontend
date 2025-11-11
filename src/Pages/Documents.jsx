import React, { useEffect, useState, useRef } from "react";
import { useDocumentStore } from "../stores/documentStore";
import { useEventStore } from "../stores/eventStore"
import { 
  FileText, 
  Image, 
  File, 
  Video, 
  Music, 
  Archive, 
  Download, 
  Eye, 
  Trash2, 
  X, 
  Upload, 
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileCode } from "react-icons/fa";


// Composant Loader amélioré
function Loader({ size = "medium" }) {
  const sizes = {
    small: "w-5 h-5",
    medium: "w-8 h-8",
    large: "w-12 h-12"
  };

  return (
    <div className="flex items-center justify-center w-full py-10">
      <Loader2 className={`${sizes[size]} text-blue-600 animate-spin`} />
    </div>
  );
}

// Composant de carte de document
function DocumentCard({ document, onView, onDelete, isDeleting }) {
  const getFileIcon = (filename, mimeType) => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    const mime = mimeType?.toLowerCase();

    // PDF
    if (ext === 'pdf' || mime?.includes('pdf')) {
      return <FaFilePdf className="w-8 h-8 text-red-500" />;
    }
    
    // Word
    if (['doc', 'docx'].includes(ext) || mime?.includes('word')) {
      return <FaFileWord className="w-8 h-8 text-blue-600" />;
    }
    
    // Excel
    if (['xls', 'xlsx', 'csv'].includes(ext) || mime?.includes('excel') || mime?.includes('spreadsheet')) {
      return <SiMicrosoftexcel className="w-8 h-8 text-green-600" />;
    }
    
    // PowerPoint
    if (['ppt', 'pptx'].includes(ext) || mime?.includes('powerpoint') || mime?.includes('presentation')) {
      return <FaFilePowerpoint className="w-8 h-8 text-orange-500" />;
    }
    
    // Images
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext) || mime?.includes('image')) {
      return <Image className="w-8 h-8 text-purple-500" />;
    }
    
    // Vidéos
    if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(ext) || mime?.includes('video')) {
      return <Video className="w-8 h-8 text-pink-500" />;
    }
    
    // Audio
    if (['mp3', 'wav', 'ogg', 'flac'].includes(ext) || mime?.includes('audio')) {
      return <Music className="w-8 h-8 text-green-500" />;
    }
    
    // Archive
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) || mime?.includes('archive')) {
      return <Archive className="w-8 h-8 text-yellow-600" />;
    }
    
    // Code
    if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'py', 'java', 'cpp', 'c', 'php'].includes(ext)) {
      return <FaFileCode className="w-8 h-8 text-gray-600" />;
    }
    
    // Document texte
    if (['txt', 'rtf'].includes(ext) || mime?.includes('text')) {
      return <FileText className="w-8 h-8 text-blue-500" />;
    }
    
    // Par défaut
    return <File className="w-8 h-8 text-gray-400" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-6 group">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1 min-w-0">
          <div className="flex-shrink-0">
            {getFileIcon(document.filename, document.mimeType)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate text-lg">
              {document.title}
            </h3>
            {document.eventTitle && (
              <div className="flex items-center mt-1">
                <Calendar className="w-3 h-3 text-gray-400 mr-1" />
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {document.eventTitle}
                </span>
              </div>
            )}
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              {document.filename && (
                <span className="truncate">{document.filename}</span>
              )}
              {document.fileSize && (
                <span className="flex-shrink-0">{formatFileSize(document.fileSize)}</span>
              )}
            </div>
            <div className="flex items-center space-x-4 mt-1">
              {document.uploadDate && (
                <span className="text-xs text-gray-400">
                  {formatDate(document.uploadDate)}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2 ml-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={onView}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            title="Voir le document"
          >
            <Eye className="w-4 h-4 mr-2" />
            Voir
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            title="Supprimer le document"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            {isDeleting ? "..." : "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Composant de dropzone pour upload
function FileDropzone({ onFileSelect, selectedFile, isUploading }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = () => {
    if (!selectedFile) return <Upload className="w-12 h-12 text-gray-400" />;
    
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FaFilePdf className="w-12 h-12 text-red-500" />;
    if (['doc', 'docx'].includes(ext)) return <FaFileWord className="w-12 h-12 text-blue-600" />;
    if (['xls', 'xlsx'].includes(ext)) return <SiMicrosoftexcel className="w-12 h-12 text-green-600" />;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return <Image className="w-12 h-12 text-purple-500" />;
    
    return <File className="w-12 h-12 text-gray-400" />;
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
        isDragging
          ? "border-blue-500 bg-blue-50"
          : isUploading
          ? "border-gray-300 bg-gray-50"
          : "border-gray-300 hover:border-gray-400 bg-gray-50/50"
      } ${isUploading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={isUploading ? undefined : handleDrop}
      onClick={isUploading ? undefined : handleClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => onFileSelect(e.target.files[0])}
        className="hidden"
        disabled={isUploading}
      />
      
      <div className="space-y-4">
        <div className="flex justify-center">
          {isUploading ? (
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          ) : (
            getFileIcon()
          )}
        </div>
        
        <div>
          {isUploading ? (
            <>
              <p className="font-semibold text-gray-900">Upload en cours...</p>
              <p className="text-sm text-gray-500 mt-1">Veuillez patienter</p>
            </>
          ) : selectedFile ? (
            <>
              <p className="font-semibold text-gray-900">Fichier sélectionné</p>
              <p className="text-sm text-gray-600 mt-1 truncate">{selectedFile.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-gray-900">Glissez-déposez votre fichier ici</p>
              <p className="text-sm text-gray-500 mt-1">ou cliquez pour parcourir</p>
              <p className="text-xs text-gray-400 mt-2">
                Supports: PDF, Word, Excel, Images, et plus...
              </p>
            </>
          )}
        </div>
        
        {selectedFile && !isUploading && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFileSelect(null);
            }}
            className="text-sm text-red-600 hover:text-red-700 inline-flex items-center"
          >
            <X className="w-4 h-4 mr-1" />
            Changer de fichier
          </button>
        )}
      </div>
    </div>
  );
}

// Composant de notification
function Notification({ type, message, onClose }) {
  const icons = {
    error: <AlertCircle className="w-5 h-5 text-red-600" />,
    success: <CheckCircle2 className="w-5 h-5 text-green-600" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-600" />
  };

  const styles = {
    error: "bg-red-50 border-red-200 text-red-800",
    success: "bg-green-50 border-green-200 text-green-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800"
  };

  return (
    <div className={`border rounded-lg p-4 flex items-center justify-between ${styles[type]}`}>
      <div className="flex items-center space-x-3">
        {icons[type]}
        <span className="font-medium">{message}</span>
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

export default function Documents() {
  const {
    documents,
    loading,
    error,
    getDocuments,
    uploadDocument,
    displayDocument,
    deleteDocument,
    currentDocument,
    closeDocument,
    clearError,
  } = useDocumentStore();

  const { events, fetchEvents, loading: eventsLoading } = useEventStore();

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    getDocuments();
    fetchEvents();
  }, [getDocuments, fetchEvents]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title.trim()) {
      alert("Veuillez ajouter un titre et sélectionner un fichier.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("uploaded_document", file);
    
    // Ajouter l'event_id seulement si un événement est sélectionné
    if (selectedEventId) {
      formData.append("event_id", selectedEventId);
    }

    const success = await uploadDocument(formData);
    
    if (success) {
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 5000);
   
      // Réinitialiser le formulaire
      setFile(null);
      setTitle("");
      setSelectedEventId("");
    }
    
    setIsUploading(false);
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      return;
    }

    setDeletingId(documentId);
    await deleteDocument(documentId);
    setDeletingId(null);
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.eventTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Enrichir les documents avec les titres d'événements
  const documentsWithEventTitles = documents.map(doc => {
    if (doc.event_id && events.length > 0) {
      const event = events.find(evt => evt.id === doc.event_id || evt._id === doc.event_id);
      return {
        ...doc,
        eventTitle: event ? event.title : 'Événement inconnu'
      };
    }
    return doc;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
                <p className="text-gray-600 mt-2">
                  Gérez et consultez tous vos documents en un seul endroit
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section Upload */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Upload className="w-5 h-5 mr-2 text-blue-600" />
            Ajouter un nouveau document
          </h2>

          {error && (
            <Notification
              type="error"
              message={error}
              onClose={clearError}
            />
          )}

          {uploadSuccess && (
            <Notification
              type="success"
              message="Document uploadé avec succès !"
              onClose={() => setUploadSuccess(false)}
            />
          )}

          <form onSubmit={handleUpload} className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre du document *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Rapport annuel 2024"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  required
                  disabled={isUploading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Associer à un événement
                </label>
                <div className="relative">
                  {eventsLoading ? (
                    <div className="flex items-center justify-center border border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
                      <Loader2 className="w-4 h-4 text-gray-400 animate-spin mr-2" />
                      <span className="text-gray-500">Chargement des événements...</span>
                    </div>
                  ) : (
                    <>
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <select
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 appearance-none bg-white"
                        disabled={isUploading}
                      >
                        <option value="">Sélectionner un événement </option>
                        {events.map((event) => (
                          <option key={event.id || event._id} value={event.id || event._id}>
                            {event.title}
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fichier *
                </label>
                <FileDropzone 
                  onFileSelect={setFile} 
                  selectedFile={file}
                  isUploading={isUploading}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isUploading || !file || !title.trim()}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Upload en cours...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Uploader le document
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Section Liste des documents */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-600" />
                Mes documents ({filteredDocuments.length})
              </h2>
              
              <div className="w-full sm:w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Rechercher un document..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <Loader />
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? "Aucun document trouvé" : "Aucun document"}
                </h3>
                <p className="text-gray-500">
                  {searchTerm
                    ? "Essayez de modifier votre recherche"
                    : "Commencez par uploader votre premier document"}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {documentsWithEventTitles
                  .filter(doc =>
                    doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    doc.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    doc.eventTitle?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((doc) => (
                  <DocumentCard
                    key={doc.id || doc._id}
                    document={doc}
                    onView={() => displayDocument(doc.id || doc._id)}
                    onDelete={() => handleDelete(doc.id || doc._id)}
                    isDeleting={deletingId === (doc.id || doc._id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modale d'affichage améliorée */}
      {currentDocument && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-6xl h-[95vh] flex flex-col transform transition-all duration-300 scale-100">
            {/* Header de la modale */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {currentDocument.title}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {currentDocument.filename}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <a
                  href={currentDocument.fileUrl}
                  download
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger
                </a>
                <button
                  onClick={closeDocument}
                  className="inline-flex items-center justify-center w-10 h-10 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contenu de la modale */}
            <div className="flex-1 p-6 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader size="large" />
                </div>
              ) : (
                <iframe
                  src={currentDocument.fileUrl}
                  className="w-full h-full border-0 rounded-lg shadow-inner"
                  title={currentDocument.title}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
