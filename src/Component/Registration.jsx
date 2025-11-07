import { useThemeStore } from "../stores/themeStore";
import { useState } from "react";

export default function RegistrationsModal({ isOpen, onClose, event, registrations }) {
    if (!isOpen) return null;
    const { theme } = useThemeStore();
    const [searchTerm, setSearchTerm] = useState("");
    
    const registrationList = registrations?.registrations || [];

    // Filtrer les inscriptions basé sur la recherche
    const filteredRegistrations = registrationList.filter(registration => 
        `${registration.user.first_name} ${registration.user.last_name}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
        registration.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registration.user.phone_number?.includes(searchTerm)
    );

    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    const getLevelColor = (level) => {
        const colors = {
            'débutant': 'bg-blue-100 text-blue-800',
            'intermédiaire': 'bg-green-100 text-green-800',
            'avancé': 'bg-purple-100 text-purple-800',
            'expert': 'bg-red-100 text-red-800'
        };
        return colors[level] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                Participants à l'événement
                            </h2>
                            <p className="text-blue-100 mt-1">{event?.title}</p>
                            <div className="flex items-center mt-2">
                                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                                    {registrationList.length} participant{registrationList.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition-colors duration-200 p-2 hover:bg-white/10 rounded-lg"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="p-6 border-b border-gray-100">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher un participant par nom, email ou téléphone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {filteredRegistrations.length > 0 ? (
                        <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50/80 backdrop-blur-sm">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Participant
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Contact
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Niveau
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Date d'inscription
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {filteredRegistrations.map((registration) => (
                                            <tr 
                                                key={registration.id}
                                                className="hover:bg-gray-50/80 transition-colors duration-150"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            {registration.user.profile_image_url ? (
                                                                <img
                                                                    className="h-10 w-10 rounded-full object-cover border border-gray-200"
                                                                    src={registration.user.profile_image_url}
                                                                    alt={`${registration.user.first_name} ${registration.user.last_name}`}
                                                                />
                                                            ) : (
                                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                                                                    {getInitials(registration.user.first_name, registration.user.last_name)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {registration.user.first_name} {registration.user.last_name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 font-medium">
                                                        {registration.user.email}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {registration.user.phone_number || 'Non renseigné'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(registration.user.level)}`}>
                                                        {registration.user.level || 'Non spécifié'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {new Date(registration.registered_at).toLocaleDateString('fr-FR', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric'
                                                        })}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        à {new Date(registration.registered_at).toLocaleTimeString('fr-FR', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-gray-900">
                                {searchTerm ? "Aucun participant trouvé" : "Aucun participant"}
                            </h3>
                            <p className="mt-2 text-gray-500 max-w-md mx-auto">
                                {searchTerm 
                                    ? "Aucun participant ne correspond à votre recherche. Essayez avec d'autres termes."
                                    : "Aucune inscription pour cet événement pour le moment."
                                }
                            </p>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm"
                                >
                                    Voir tous les participants
                                </button>
                            )}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-6">
                        <div className="text-sm text-gray-500">
                            {filteredRegistrations.length} participant{filteredRegistrations.length !== 1 ? 's' : ''} affiché{filteredRegistrations.length !== 1 ? 's' : ''}
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}