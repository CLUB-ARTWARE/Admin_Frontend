import { useEffect, useState } from "react";
import { useAnnouncementStore } from "../stores/announceStore";
import { useAttendanceStore } from "../stores/attendaceStore";
import { useCelluleStore } from "../stores/cellulesStore";
import useDocumentStore from "../stores/documentStore";
import { useEventStore } from "../stores/eventStore";
import { useUserStore } from "../stores/useUserStore";

export default function Dashboard() {
  const { fetchAnnouncements, announcements } = useAnnouncementStore();
  const { fetchAttendance, attendance } = useAttendanceStore();
  const { fetchCellules, cellules } = useCelluleStore();
  const { getDocuments, documents } = useDocumentStore();
  const { events, fetchEvents } = useEventStore();
  const { fetchUsers, users } = useUserStore();

  const [selectedEventId, setSelectedEventId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchAnnouncements(),
          fetchCellules(),
          getDocuments(),
          fetchEvents(),
          fetchUsers()
        ]);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchAttendance(selectedEventId);
    }
  }, [selectedEventId]);

  // Statistiques calculées
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(user => user.is_active).length,
    totalEvents: events.length,
    upcomingEvents: events.filter(event => new Date(event.date) > new Date()).length,
    totalDocuments: documents.length,
    totalCellules: cellules.length,
    totalAnnouncements: announcements.length,
  };

  // Données pour les graphiques
  const eventTypeData = events.reduce((acc, event) => {
    const type = event.type || 'other';
    const existing = acc.find(item => item.name === type);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: type, value: 1 });
    }
    return acc;
  }, []);

  const userLevelData = users.reduce((acc, user) => {
    const level = user.level || 'unknown';
    const existing = acc.find(item => item.name === level);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ name: level, count: 1 });
    }
    return acc;
  }, []);

  const monthlyEventData = events.reduce((acc, event) => {
    const month = new Date(event.date).toLocaleDateString('fr-FR', { month: 'short' });
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.events += 1;
    } else {
      acc.push({ month, events: 1 });
    }
    return acc;
  }, []);

  // Couleurs pour les graphiques
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Chargement des données...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
        <p className="text-gray-600 mt-2">
          Vue d'ensemble des activités et statistiques de la plateforme
        </p>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Utilisateurs Totaux"
          value={stats.totalUsers}
          subtitle={`${stats.activeUsers} actifs`}
          color="blue"
          icon="👥"
        />
        <StatCard
          title="Événements"
          value={stats.totalEvents}
          subtitle={`${stats.upcomingEvents} à venir`}
          color="green"
          icon="📅"
        />
        <StatCard
          title="Documents"
          value={stats.totalDocuments}
          subtitle="Ressources partagées"
          color="purple"
          icon="📚"
        />
        <StatCard
          title="Cellules"
          value={stats.totalCellules}
          subtitle="Groupes d'activités"
          color="orange"
          icon="🔬"
        />
      </div>

      {/* Graphiques et statistiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique des types d'événements */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Répartition des Événements par Type
          </h3>
          <div className="flex flex-wrap gap-4">
            {eventTypeData.map((item, index) => (
              <div key={item.name} className="flex items-center">
                <div
                  className="w-4 h-4 rounded-full mr-2"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-sm text-gray-700">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center items-center h-48">
            <PieChart data={eventTypeData} colors={COLORS} />
          </div>
        </div>

        {/* Graphique des utilisateurs par niveau */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Utilisateurs par Niveau
          </h3>
          <div className="h-64">
            <BarChart data={userLevelData} />
          </div>
        </div>
      </div>

      {/* Section Événements et Participation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sélecteur d'événement pour l'attendance */}
        <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-1">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Participation aux Événements
          </h3>
          <select
            value={selectedEventId || ""}
            onChange={(e) => setSelectedEventId(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Sélectionner un événement</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>
                {event.title} - {new Date(event.date).toLocaleDateString('fr-FR')}
              </option>
            ))}
          </select>

          {selectedEventId && (
            <div className="space-y-3">
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-green-800 font-semibold">
                  Présences: {attendance.filter(a => a.status === 'present').length}
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-blue-800 font-semibold">
                  Total des participants: {attendance.length}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Graphique des événements par mois */}
        <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Événements par Mois
          </h3>
          <div className="h-64">
            <LineChart data={monthlyEventData} />
          </div>
        </div>
      </div>

      {/* Dernières annonces et documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dernières annonces */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Dernières Annonces
          </h3>
          <div className="space-y-3">
            {announcements.slice(0, 5).map(announcement => (
              <div key={announcement.id} className="border-l-4 border-blue-500 pl-4 py-2 hover:bg-gray-50 rounded">
                <h4 className="font-medium text-gray-900">{announcement.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{announcement.subtitle}</p>
                <span className="text-xs text-gray-500">
                  {new Date(announcement.published_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Derniers documents */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Derniers Documents
          </h3>
          <div className="space-y-3">
            {documents.slice(0, 5).map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 truncate">{doc.title}</h4>
                  <span className="text-xs text-gray-500">
                    Ajouté le {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <a
                  href={doc.file_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  Télécharger
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statistiques détaillées */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Statistiques Détaillées
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{stats.totalAnnouncements}</div>
            <div className="text-sm text-gray-600">Annonces</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {users.filter(user => user.gender === 'male').length}
            </div>
            <div className="text-sm text-gray-600">Hommes</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {users.filter(user => user.gender === 'female').length}
            </div>
            <div className="text-sm text-gray-600">Femmes</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {Math.round((stats.activeUsers / stats.totalUsers) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Taux d'activation</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant pour les cartes de statistiques
function StatCard({ title, value, subtitle, color, icon }) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600'
  };

  return (
    <div className={`border-2 rounded-xl p-6 ${colorClasses[color]} transition-transform hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
          <p className="text-3xl font-bold mb-1">{value}</p>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}

// Composant graphique camembert simple
function PieChart({ data, colors }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  return (
    <svg width="200" height="200" viewBox="0 0 200 200">
      {data.map((item, index) => {
        const percentage = (item.value / total) * 100;
        const angle = (percentage / 100) * 360;
        const largeArcFlag = angle > 180 ? 1 : 0;
        
        const x1 = 100 + 80 * Math.cos(currentAngle * Math.PI / 180);
        const y1 = 100 + 80 * Math.sin(currentAngle * Math.PI / 180);
        
        const x2 = 100 + 80 * Math.cos((currentAngle + angle) * Math.PI / 180);
        const y2 = 100 + 80 * Math.sin((currentAngle + angle) * Math.PI / 180);

        const pathData = [
          `M 100 100`,
          `L ${x1} ${y1}`,
          `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
          `Z`
        ].join(' ');

        currentAngle += angle;

        return (
          <path
            key={item.name}
            d={pathData}
            fill={colors[index % colors.length]}
            stroke="white"
            strokeWidth="2"
          />
        );
      })}
      <circle cx="100" cy="100" r="40" fill="white" />
    </svg>
  );
}

// Composant graphique en barres simple
function BarChart({ data }) {
  const maxValue = Math.max(...data.map(item => item.count));
  
  return (
    <div className="flex items-end justify-between h-48 gap-2 pt-4">
      {data.map((item, index) => {
        const height = (item.count / maxValue) * 100;
        return (
          <div key={item.name} className="flex flex-col items-center flex-1">
            <div
              className="bg-blue-500 rounded-t w-full transition-all hover:bg-blue-600"
              style={{ height: `${height}%` }}
            ></div>
            <div className="text-xs text-gray-600 mt-2 text-center">
              {item.name}
            </div>
            <div className="text-sm font-semibold text-gray-900">
              {item.count}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Composant graphique en ligne simple
function LineChart({ data }) {
  const maxValue = Math.max(...data.map(item => item.events));
  
  return (
    <div className="relative h-48">
      <svg width="100%" height="100%" viewBox="0 0 400 200">
        {/* Grille */}
        {[0, 25, 50, 75, 100].map((percent, index) => (
          <line
            key={index}
            x1="0"
            y1={percent * 2}
            x2="400"
            y2={percent * 2}
            stroke="#f3f4f6"
            strokeWidth="1"
          />
        ))}
        
        {/* Ligne */}
        <polyline
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          points={data.map((item, index) => 
            `${(index / (data.length - 1)) * 380 + 10},${200 - (item.events / maxValue) * 180 - 10}`
          ).join(' ')}
        />
        
        {/* Points */}
        {data.map((item, index) => (
          <circle
            key={index}
            cx={(index / (data.length - 1)) * 380 + 10}
            cy={200 - (item.events / maxValue) * 180 - 10}
            r="4"
            fill="#3b82f6"
          />
        ))}
        
        {/* Labels */}
        {data.map((item, index) => (
          <text
            key={index}
            x={(index / (data.length - 1)) * 380 + 10}
            y="195"
            textAnchor="middle"
            fontSize="10"
            fill="#6b7280"
          >
            {item.month}
          </text>
        ))}
      </svg>
    </div>
  );
}