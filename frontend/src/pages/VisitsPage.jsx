import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Search, 
  Eye, 
  Edit,
  User,
  Clock,
  FileText,
  Activity
} from 'lucide-react';
import { api } from '../utils/api';
import './VisitsPage.css';

const VisitsPage = () => {
  const [visits, setVisits] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      setLoading(true);
      const [visitsRes, patientsRes] = await Promise.all([
        api.visits.getAll(),
        api.patients.getAll()
      ]);
      setVisits(visitsRes.data);
      setPatients(patientsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create a map of patient ID to patient data for quick lookup
  const patientsMap = patients.reduce((map, patient) => {
    map[patient.id] = patient;
    return map;
  }, {});

  const filteredVisits = visits.filter(visit => {
    const patient = patientsMap[visit.patient_id];
    const patientName = patient ? `${patient.first_name} ${patient.last_name}` : '';
    
    const matchesSearch = 
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.visit_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (visit.notes && visit.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterType === 'all' || visit.visit_type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const handleViewDetails = (visit) => {
    setSelectedVisit(visit);
    setShowDetailsModal(true);
  };

  const getVisitTypeColor = (type) => {
    const colors = {
      'Controllo': '#10B981', // Green
      'Visita': '#3B82F6',    // Blue
      'Emergenza': '#EF4444', // Red
      'Follow-up': '#F59E0B', // Yellow
      'Consultazione': '#8B5CF6' // Purple
    };
    return colors[type] || '#6B7280';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const VisitCard = ({ visit }) => {
    const patient = patientsMap[visit.patient_id];
    
    return (
      <div className="visit-card">
        <div className="visit-header">
          <div className="visit-type-badge" style={{ backgroundColor: getVisitTypeColor(visit.visit_type) }}>
            <Activity size={16} />
            {visit.visit_type}
          </div>
          <div className="visit-date">
            <Clock size={16} />
            {formatDate(visit.visit_date)}
          </div>
        </div>

        <div className="visit-content">
          <div className="patient-info">
            <User size={18} />
            <div>
              <strong>
                {patient ? `${patient.first_name} ${patient.last_name}` : 'Paziente non trovato'}
              </strong>
              {patient && (
                <span className="patient-details">
                  {patient.email} • {new Date().getFullYear() - new Date(patient.birth_date).getFullYear()} anni
                </span>
              )}
            </div>
          </div>

          {visit.notes && (
            <div className="visit-notes">
              <FileText size={16} />
              <p>{visit.notes.length > 100 ? `${visit.notes.substring(0, 100)}...` : visit.notes}</p>
            </div>
          )}

          <div className="visit-actions">
            <button 
              className="btn-outline"
              onClick={() => handleViewDetails(visit)}
            >
              <Eye size={16} />
              Dettagli
            </button>
            <button className="btn-outline">
              <Edit size={16} />
              Modifica
            </button>
          </div>
        </div>
      </div>
    );
  };

  const VisitDetailsModal = () => (
    <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Dettagli Visita</h2>
          <button 
            className="btn-close"
            onClick={() => setShowDetailsModal(false)}
          >
            ×
          </button>
        </div>
        
        {selectedVisit && (
          <div className="visit-full-details">
            <div className="details-section">
              <h3>Informazioni Visita</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <label>Tipo Visita:</label>
                  <span className="visit-type-inline" style={{ color: getVisitTypeColor(selectedVisit.visit_type) }}>
                    {selectedVisit.visit_type}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Data e Ora:</label>
                  <span>{formatDate(selectedVisit.visit_date)}</span>
                </div>
                <div className="detail-item">
                  <label>Durata:</label>
                  <span>{selectedVisit.duration || 'Non specificata'} minuti</span>
                </div>
              </div>
            </div>

            <div className="details-section">
              <h3>Paziente</h3>
              {patientsMap[selectedVisit.patient_id] && (
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Nome:</label>
                    <span>
                      {patientsMap[selectedVisit.patient_id].first_name} {patientsMap[selectedVisit.patient_id].last_name}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{patientsMap[selectedVisit.patient_id].email}</span>
                  </div>
                  <div className="detail-item">
                    <label>Età:</label>
                    <span>
                      {new Date().getFullYear() - new Date(patientsMap[selectedVisit.patient_id].birth_date).getFullYear()} anni
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="details-section">
              <h3>Note e Osservazioni</h3>
              <div className="notes-content">
                {selectedVisit.notes ? (
                  <p>{selectedVisit.notes}</p>
                ) : (
                  <p className="no-notes">Nessuna nota registrata per questa visita.</p>
                )}
              </div>
            </div>

            <div className="details-section">
              <h3>Sistema</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <label>Creata:</label>
                  <span>{new Date(selectedVisit.created_at).toLocaleString('it-IT')}</span>
                </div>
                <div className="detail-item">
                  <label>Aggiornata:</label>
                  <span>{new Date(selectedVisit.updated_at).toLocaleString('it-IT')}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const visitTypes = [...new Set(visits.map(visit => visit.visit_type))];

  if (loading) {
    return (
      <div className="visits-loading">
        <div className="loading-spinner"></div>
        <p>Caricamento visite...</p>
      </div>
    );
  }

  return (
    <div className="visits-page">
      <div className="visits-header">
        <div className="header-content">
          <h1>
            <Calendar size={28} />
            Gestione Visite
          </h1>
          <p>Gestisci le visite mediche dei tuoi pazienti</p>
        </div>
        <button className="btn-primary">
          <Plus size={20} />
          Nuova Visita
        </button>
      </div>

      <div className="visits-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Cerca per paziente, tipo visita o note..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tutti i Tipi</option>
            {visitTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="visits-stats">
          <span className="stat">
            {filteredVisits.length} di {visits.length} visite
          </span>
        </div>
      </div>

      <div className="visits-grid">
        {filteredVisits.length > 0 ? (
          filteredVisits
            .sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date))
            .map(visit => (
              <VisitCard key={visit.id} visit={visit} />
            ))
        ) : (
          <div className="no-visits">
            <Calendar size={48} />
            <h3>Nessuna visita trovata</h3>
            <p>
              {visits.length === 0 
                ? "Non hai ancora registrato nessuna visita." 
                : "Nessuna visita corrisponde ai criteri di ricerca."}
            </p>
            {visits.length === 0 && (
              <button className="btn-primary">
                <Plus size={20} />
                Registra Prima Visita
              </button>
            )}
          </div>
        )}
      </div>

      {showDetailsModal && <VisitDetailsModal />}
    </div>
  );
};

export default VisitsPage;
