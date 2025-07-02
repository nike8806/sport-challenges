import React, { useState, useEffect } from 'react';
import { Users, Trophy, Calendar, Plus, Award, Flame, Wind, Droplets } from 'lucide-react';

// Tipos TypeScript
interface Participant {
  id: string;
  name: string;
  team: 'Agua' | 'Fuego' | 'Viento';
  totalPoints: number;
}

interface Activity {
  id: string;
  type: 'riding' | 'lab' | 'doblete' | 'salida_equipo' | 'plancha' | 'montana' | 'despensa' | 'reel';
  name: string;
  points: number;
  requiresEvidence: boolean;
}

interface Entry {
  id: string;
  participantId: string;
  activityId: string;
  date: string;
  hasEvidence: boolean;
  verifiedBy: string;
  notes?: string;
  groupSize?: number; // Para salidas con equipo
}

const SoulContestApp: React.FC = () => {
  // Estados
  const [isStaff, setIsStaff] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([
    // Datos de ejemplo
    { id: '1', name: 'Ana García', team: 'Agua', totalPoints: 0 },
    { id: '2', name: 'Carlos López', team: 'Fuego', totalPoints: 0 },
    { id: '3', name: 'María Rodríguez', team: 'Viento', totalPoints: 0 },
  ]);

  const [staffMembers] = useState([
    { id: '1', name: 'Marian' },
    { id: '2', name: 'Brenda' },
    { id: '3', name: 'MariLu' },
  ]);

  const [activities] = useState<Activity[]>([
    { id: '1', type: 'riding', name: '1 clase de riding', points: 2, requiresEvidence: false },
    { id: '2', type: 'lab', name: '1 clase de lab', points: 2, requiresEvidence: false },
    { id: '3', type: 'doblete', name: 'Doblete', points: 1, requiresEvidence: false },
    { id: '4', type: 'salida_equipo', name: 'Salida con equipo', points: 2, requiresEvidence: true },
    { id: '5', type: 'plancha', name: '2 min de plancha', points: 2, requiresEvidence: true },
    { id: '6', type: 'montana', name: '2 min de montaña', points: 2, requiresEvidence: true },
    { id: '7', type: 'despensa', name: 'Traer despensa para donar', points: 2, requiresEvidence: true },
    { id: '8', type: 'reel', name: 'Reel de estilo de vida en Soul', points: 2, requiresEvidence: true },
  ]);

  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<string>('');
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [hasEvidence, setHasEvidence] = useState(false);
  const [verifiedBy, setVerifiedBy] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [groupSize, setGroupSize] = useState(1);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'register'>('dashboard');

  // Calcular puntos totales por participante
  useEffect(() => {
    const updatedParticipants = participants.map(participant => {
      const participantEntries = entries.filter(entry => entry.participantId === participant.id);
      const totalPoints = participantEntries.reduce((sum, entry) => {
        const activity = activities.find(a => a.id === entry.activityId);
        let points = activity?.points || 0;
        
        // Para salidas con equipo, multiplicar por número de personas
        if (activity?.type === 'salida_equipo' && entry.groupSize) {
          points *= entry.groupSize;
        }
        
        return sum + points;
      }, 0);
      
      return { ...participant, totalPoints };
    });
    
    setParticipants(updatedParticipants);
  }, [entries]);

  // Mostrar toast
  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Registrar nueva entrada
  const handleSubmitEntry = () => {
    if (!selectedParticipant || !selectedActivity || !verifiedBy || !selectedDate) {
      showToastMessage('Por favor completa todos los campos requeridos');
      return;
    }

    const activity = activities.find(a => a.id === selectedActivity);
    if (activity?.requiresEvidence && !hasEvidence) {
      showToastMessage('Esta actividad requiere evidencia en redes sociales');
      return;
    }

    const newEntry: Entry = {
      id: Date.now().toString(),
      participantId: selectedParticipant,
      activityId: selectedActivity,
      date: selectedDate,
      hasEvidence,
      verifiedBy,
      notes,
      groupSize: activity?.type === 'salida_equipo' ? groupSize : undefined,
    };

    setEntries([...entries, newEntry]);
    
    // Limpiar formulario
    setSelectedParticipant('');
    setSelectedActivity('');
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setHasEvidence(false);
    setVerifiedBy('');
    setNotes('');
    setGroupSize(1);
    
    const participantName = participants.find(p => p.id === selectedParticipant)?.name;
    const activityName = activities.find(a => a.id === selectedActivity)?.name;
    showToastMessage(`✅ Actividad registrada: ${activityName} para ${participantName}`);
  };

  // Calcular puntos por equipo
  const getTeamStats = () => {
    const teams = ['Agua', 'Fuego', 'Viento'] as const;
    return teams.map(team => {
      const teamParticipants = participants.filter(p => p.team === team);
      const totalPoints = teamParticipants.reduce((sum, p) => sum + p.totalPoints, 0);
      const avgPoints = teamParticipants.length > 0 ? totalPoints / teamParticipants.length : 0;
      
      return {
        name: team,
        totalPoints,
        avgPoints: Math.round(avgPoints * 100) / 100,
        participants: teamParticipants.length,
      };
    }).sort((a, b) => b.totalPoints - a.totalPoints);
  };

  const getTeamIcon = (team: string) => {
    switch (team) {
      case 'Agua': return <Droplets className="w-5 h-5 text-blue-500" />;
      case 'Fuego': return <Flame className="w-5 h-5 text-red-500" />;
      case 'Viento': return <Wind className="w-5 h-5 text-green-500" />;
      default: return <Users className="w-5 h-5" />;
    }
  };

//   const getTeamColor = (team: string) => {
//     switch (team) {
//       case 'Agua': return 'from-blue-500 to-blue-600';
//       case 'Fuego': return 'from-red-500 to-red-600';
//       case 'Viento': return 'from-green-500 to-green-600';
//       default: return 'from-gray-500 to-gray-600';
//     }
//   };

  const teamStats = getTeamStats();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-pulse">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Staff Login */}
      {!isStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-center mb-6">Soul Contest</h2>
            <div className="space-y-4">
              <button
                onClick={() => setIsStaff(true)}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition-colors font-semibold"
              >
                Acceso Staff
              </button>
              <button
                onClick={() => {
                  setIsStaff(false);
                  setActiveTab('dashboard');
                }}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 transition-colors font-semibold"
              >
                Vista Pública
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Trophy className="w-8 h-8" />
              <div>
                <h1 className="text-3xl font-bold">Soul Contest</h1>
                <p className="text-purple-100">Sistema de Gestión de Concurso</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4" />
                <span>Duración: 2 meses</span>
              </div>
              {isStaff && (
                <button
                  onClick={() => setIsStaff(false)}
                  className="bg-purple-700 hover:bg-purple-800 px-3 py-1 rounded text-sm transition-colors"
                >
                  Cerrar Sesión
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-4 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Clasificación</span>
            </button>
            {isStaff && (
              <button
                onClick={() => setActiveTab('register')}
                className={`flex items-center space-x-2 px-4 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'register'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Actividad</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard/Clasificación */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Clasificación por Equipos */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Clasificación por Equipos</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {teamStats.map((team, index) => (
                    <div key={team.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full font-bold">
                          {index + 1}
                        </div>
                        <div className="flex items-center space-x-2">
                          {getTeamIcon(team.name)}
                          <span className="font-semibold">Equipo {team.name}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{team.totalPoints} puntos</div>
                        <div className="text-sm text-gray-500">{team.participants} participantes</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top 10 Individual */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Top 10 Individual</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {participants
                    .sort((a, b) => b.totalPoints - a.totalPoints)
                    .slice(0, 10)
                    .map((participant, index) => (
                      <div key={participant.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                  </div>

                  <div>
                            <span className="font-medium">{participant.name}</span>
                            <div className="flex items-center space-x-1 text-sm">
                              {getTeamIcon(participant.team)}
                              <span className="text-gray-500">{participant.team}</span>
                            </div>
                          </div>
                        </div>
                        <div className="font-bold">{participant.totalPoints} pts</div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Actividades del Concurso */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Actividades del Concurso</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activities.map(activity => (
                    <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <span className="font-medium">{activity.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm font-semibold">
                          {activity.points} pts
                        </span>
                        {activity.requiresEvidence && (
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                            Requiere evidencia
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Registrar Actividad */}
        {activeTab === 'register' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Registrar Nueva Actividad</h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Participante *
                    </label>
                    <select
                      value={selectedParticipant}
                      onChange={(e) => setSelectedParticipant(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      <option value="">Seleccionar participante</option>
                      {participants.map(participant => (
                        <option key={participant.id} value={participant.id}>
                          {participant.name} - {participant.team}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Actividad *
                    </label>
                    <select
                      value={selectedActivity}
                      onChange={(e) => setSelectedActivity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      <option value="">Seleccionar actividad</option>
                      {activities.map(activity => (
                        <option key={activity.id} value={activity.id}>
                          {activity.name} ({activity.points} pts)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedActivity && activities.find(a => a.id === selectedActivity)?.type === 'salida_equipo' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de personas en la salida
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={groupSize}
                      onChange={(e) => setGroupSize(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Puntos a otorgar: {activities.find(a => a.id === selectedActivity)?.points || 0} × {groupSize} = {(activities.find(a => a.id === selectedActivity)?.points || 0) * groupSize}
                    </p>
                  </div>
                )}

                {selectedActivity && activities.find(a => a.id === selectedActivity)?.requiresEvidence && (
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={hasEvidence}
                        onChange={(e) => setHasEvidence(e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Subió evidencia a redes sociales *
                      </span>
                    </label>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verificado por (Staff) *
                  </label>
                  <select
                    value={verifiedBy}
                    onChange={(e) => setVerifiedBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Seleccionar staff</option>
                    {staffMembers.map(staff => (
                      <option key={staff.id} value={staff.name}>
                        {staff.name}
                      </option>
                    ))}
                  </select>
                </div>
<div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de la actividad *
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
</div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas adicionales
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Observaciones opcionales..."
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSubmitEntry}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-md hover:from-purple-700 hover:to-pink-700 transition-colors font-semibold"
                >
                  Registrar Actividad
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* export default SoulContestApp; */

export default function Home() {
  return (
    <SoulContestApp />
  );
}