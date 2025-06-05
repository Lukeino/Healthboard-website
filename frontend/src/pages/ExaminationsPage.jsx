import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Eye, 
  Edit,
  User,
  Calendar,
  Activity,
  Download,
  AlertCircle
} from 'lucide-react';
import { api } from '../utils/api';
import './ExaminationsPage.css';

const ExaminationsPage = () => {
  const [examinations, setExaminations] = useState([]);
  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedExamination, setSelectedExamination] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);  const fetchData = async () => {
    try {
      setLoading(true);
      // Since we don't have examinations endpoint yet, we'll simulate data
      const [patientsRes, visitsRes] = await Promise.all([
        api.patients.getAll(),
        api.visits.getAll()
      ]);
      
      const patientsData = Array.isArray(patientsRes.data) ? patientsRes.data : [];
      const visitsData = Array.isArray(visitsRes.data) ? visitsRes.data : [];
      
      setPatients(patientsData);
      setVisits(visitsData);
      
      // Simulate examinations data
      const mockExaminations = generateMockExaminations(patientsData, visitsData);
      setExaminations(mockExaminations);
    } catch (error) {
      console.error('Error fetching data:', error);
      setPatients([]);
      setVisits([]);
      setExaminations([]);
    } finally {
      setLoading(false);
    }
  };
  const generateMockExaminations = (patients, visits) => {
    // Ensure patients and visits are arrays
    if (!Array.isArray(patients) || !Array.isArray(visits)) {
      return [];
    }
    
    const examTypes = [
      'Analisi del Sangue',
      'Radiografia',
      'Ecografia',
      'TAC',
      'Risonanza Magnetica',
      'Elettrocardiogramma',
      'Spirometria',
      'Endoscopia'
    ];
    
    const statuses = ['Completato', 'In Attesa', 'In Corso'];
    
    return patients.slice(0, 10).map((patient, index) => ({
      id: index + 1,
      patient_id: patient.id,
      visit_id: visits.find(v => v.patient_id === patient.id)?.id || null,
      examination_type: examTypes[index % examTypes.length],
      status: statuses[index % statuses.length],
      requested_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      completed_date: index % 3 === 0 ? new Date().toISOString() : null,
      results: index % 3 === 0 ? `Risultati per ${examTypes[index % examTypes.length]} - Valori nella norma` : null,
      notes: `Note per esame ${examTypes[index % examTypes.length]} del paziente ${patient.first_name} ${patient.last_name}`,
      created_at: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    }));
  };  // Create maps for quick lookup
  const patientsMap = Array.isArray(patients) ? patients.reduce((map, patient) => {
    map[patient.id] = patient;
    return map;
  }, {}) : {};

  const visitsMap = Array.isArray(visits) ? visits.reduce((map, visit) => {
    map[visit.id] = visit;
    return map;
  }, {}) : {};

  const filteredExaminations = Array.isArray(examinations) ? examinations.filter(exam => {
    const patient = patientsMap[exam.patient_id];
    const patientName = patient ? `${patient.first_name} ${patient.last_name}` : '';
    
    const matchesSearch = 
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.examination_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exam.notes && exam.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterStatus === 'all' || exam.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  }) : [];

  const handleViewDetails = (examination) => {
    setSelectedExamination(examination);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Completato': '#10B981',
      'In Corso': '#F59E0B',
      'In Attesa': '#6B7280'
    };
    return colors[status] || '#6B7280';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completato':
        return <Activity size={16} />;
      case 'In Corso':
        return <AlertCircle size={16} />;
      case 'In Attesa':
        return <Calendar size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  const ExaminationCard = ({ examination }) => {
    const patient = patientsMap[examination.patient_id];
    const visit = examination.visit_id ? visitsMap[examination.visit_id] : null;
    
    return (
      <div className="examination-card">
        <div className="examination-header">
          <div className="examination-type">
            <FileText size={20} />
            <h3>{examination.examination_type}</h3>
          </div>
          <div className="examination-status" style={{ color: getStatusColor(examination.status) }}>
            {getStatusIcon(examination.status)}
            {examination.status}
          </div>
        </div>

        <div className="examination-content">
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

          <div className="examination-dates">
            <div className="date-info">
              <Calendar size={16} />
              <span>Richiesto: {new Date(examination.requested_date).toLocaleDateString('it-IT')}</span>
            </div>
            {examination.completed_date && (
              <div className="date-info">
                <Activity size={16} />
                <span>Completato: {new Date(examination.completed_date).toLocaleDateString('it-IT')}</span>
              </div>
            )}
          </div>

          {examination.results && (
            <div className="examination-results">
              <strong>Risultati disponibili</strong>
              <p>{examination.results.substring(0, 100)}...</p>
            </div>
          )}

          <div className="examination-actions">
            <button 
              className="btn-outline"
              onClick={() => handleViewDetails(examination)}
            >
              <Eye size={16} />
              Dettagli
            </button>
            {examination.results && (
              <button className="btn-outline">
                <Download size={16} />
                Scarica
              </button>
            )}
            <button className="btn-outline">
              <Edit size={16} />
              Modifica
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ExaminationDetailsModal = () => (
    <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Dettagli Esame</h2>
          <button 
            className="btn-close"
            onClick={() => setShowDetailsModal(false)}
          >
            ×
          </button>
        </div>
        
        {selectedExamination && (
          <div className="examination-full-details">
            <div className="details-section">
              <h3>Informazioni Esame</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <label>Tipo Esame:</label>
                  <span>{selectedExamination.examination_type}</span>
                </div>
                <div className="detail-item">
                  <label>Stato:</label>
                  <span 
                    className="status-inline" 
                    style={{ color: getStatusColor(selectedExamination.status) }}
                  >
                    {selectedExamination.status}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Data Richiesta:</label>
                  <span>{new Date(selectedExamination.requested_date).toLocaleString('it-IT')}</span>
                </div>
                {selectedExamination.completed_date && (
                  <div className="detail-item">
                    <label>Data Completamento:</label>
                    <span>{new Date(selectedExamination.completed_date).toLocaleString('it-IT')}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="details-section">
              <h3>Paziente</h3>
              {patientsMap[selectedExamination.patient_id] && (
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Nome:</label>
                    <span>
                      {patientsMap[selectedExamination.patient_id].first_name} {patientsMap[selectedExamination.patient_id].last_name}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{patientsMap[selectedExamination.patient_id].email}</span>
                  </div>
                  <div className="detail-item">
                    <label>Età:</label>
                    <span>
                      {new Date().getFullYear() - new Date(patientsMap[selectedExamination.patient_id].birth_date).getFullYear()} anni
                    </span>
                  </div>
                </div>
              )}
            </div>

            {selectedExamination.visit_id && visitsMap[selectedExamination.visit_id] && (
              <div className="details-section">
                <h3>Visita Associata</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Tipo Visita:</label>
                    <span>{visitsMap[selectedExamination.visit_id].visit_type}</span>
                  </div>
                  <div className="detail-item">
                    <label>Data Visita:</label>
                    <span>{new Date(visitsMap[selectedExamination.visit_id].visit_date).toLocaleString('it-IT')}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="details-section">
              <h3>Risultati</h3>
              <div className="results-content">
                {selectedExamination.results ? (
                  <div>
                    <p>{selectedExamination.results}</p>
                    <button className="btn-primary">
                      <Download size={16} />
                      Scarica Referto Completo
                    </button>
                  </div>
                ) : (
                  <p className="no-results">
                    {selectedExamination.status === 'Completato' 
                      ? "Risultati non ancora disponibili."
                      : "Esame non ancora completato."}
                  </p>
                )}
              </div>
            </div>

            <div className="details-section">
              <h3>Note</h3>
              <div className="notes-content">
                {selectedExamination.notes ? (
                  <p>{selectedExamination.notes}</p>
                ) : (
                  <p className="no-notes">Nessuna nota registrata per questo esame.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const statuses = ['Completato', 'In Corso', 'In Attesa'];

  if (loading) {
    return (
      <div className="examinations-loading">
        <div className="loading-spinner"></div>
        <p>Caricamento esami...</p>
      </div>
    );
  }

  return (
    <div className="examinations-page">
      <div className="examinations-header">
        <div className="header-content">
          <h1>
            <FileText size={28} />
            Gestione Esami
          </h1>
          <p>Gestisci gli esami medici e i referti dei tuoi pazienti</p>
        </div>
        <button className="btn-primary">
          <Plus size={20} />
          Nuovo Esame
        </button>
      </div>

      <div className="examinations-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Cerca per paziente, tipo esame o note..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tutti gli Stati</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="examinations-stats">
          <span className="stat">
            {filteredExaminations.length} di {examinations.length} esami
          </span>
        </div>
      </div>

      <div className="examinations-grid">
        {filteredExaminations.length > 0 ? (
          filteredExaminations
            .sort((a, b) => new Date(b.requested_date) - new Date(a.requested_date))
            .map(examination => (
              <ExaminationCard key={examination.id} examination={examination} />
            ))
        ) : (
          <div className="no-examinations">
            <FileText size={48} />
            <h3>Nessun esame trovato</h3>
            <p>
              {examinations.length === 0 
                ? "Non hai ancora registrato nessun esame." 
                : "Nessun esame corrisponde ai criteri di ricerca."}
            </p>
            {examinations.length === 0 && (
              <button className="btn-primary">
                <Plus size={20} />
                Registra Primo Esame
              </button>
            )}
          </div>
        )}
      </div>

      {showDetailsModal && <ExaminationDetailsModal />}
    </div>
  );
};

export default ExaminationsPage;
