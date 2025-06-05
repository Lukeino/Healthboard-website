import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Search, 
  Eye, 
  Edit,
  Trash2,
  User,
  Clock,
  FileText,
  Activity
} from 'lucide-react';
import { api } from '../utils/api';
import './VisitsPage.css';

// Componente per la card della visita
const VisitCard = ({ visit, patientsMap, onViewDetails, onEditVisit, onDeleteVisit, getVisitTypeColor, formatDate }) => {
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
              {patient ? `${patient.nome} ${patient.cognome}` : 'Paziente non trovato'}
            </strong>
            {patient && (
              <span className="patient-details">
                {patient.codice_fiscale} • {patient.telefono || 'N/A'}
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
            onClick={() => onViewDetails(visit)}
          >
            <Eye size={16} />
            Dettagli
          </button>
          <button 
            className="btn-outline"
            onClick={() => onEditVisit(visit)}
          >
            <Edit size={16} />
            Modifica
          </button>
          <button 
            className="btn-danger"
            onClick={() => onDeleteVisit(visit)}
          >
            <Trash2 size={16} />
            Elimina
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente per i dettagli della visita
const VisitDetailsModal = ({ selectedVisit, patientsMap, onClose, getVisitTypeColor, formatDate }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h2>Dettagli Visita</h2>
        <button className="btn-close" onClick={onClose}>×</button>
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
                <label>Motivo:</label>
                <span>{selectedVisit.motivo || 'Non specificato'}</span>
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
                    {patientsMap[selectedVisit.patient_id].nome} {patientsMap[selectedVisit.patient_id].cognome}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Codice Fiscale:</label>
                  <span>{patientsMap[selectedVisit.patient_id].codice_fiscale}</span>
                </div>
                {patientsMap[selectedVisit.patient_id].telefono && (
                  <div className="detail-item">
                    <label>Telefono:</label>
                    <span>{patientsMap[selectedVisit.patient_id].telefono}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="details-section">
            <h3>Dettagli Clinici</h3>
            <div className="clinical-details">
              {selectedVisit.anamnesi && (
                <div className="clinical-item">
                  <label>Anamnesi:</label>
                  <p>{selectedVisit.anamnesi}</p>
                </div>
              )}
              {selectedVisit.esame_obiettivo && (
                <div className="clinical-item">
                  <label>Esame Obiettivo:</label>
                  <p>{selectedVisit.esame_obiettivo}</p>
                </div>
              )}
              {selectedVisit.diagnosi && (
                <div className="clinical-item">
                  <label>Diagnosi:</label>
                  <p>{selectedVisit.diagnosi}</p>
                </div>
              )}
              {selectedVisit.terapia && (
                <div className="clinical-item">
                  <label>Terapia:</label>
                  <p>{selectedVisit.terapia}</p>
                </div>
              )}
              {selectedVisit.note && (
                <div className="clinical-item">
                  <label>Note:</label>
                  <p>{selectedVisit.note}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);

// Componente per selezionare pazienti
const PatientSelectorModal = ({ patients, patientSearchTerm, onPatientSearchChange, onSelectPatient, onClose }) => {
  const filteredPatients = Array.isArray(patients) ? patients.filter(patient => {
    const searchLower = patientSearchTerm.toLowerCase();
    return (
      patient.nome.toLowerCase().includes(searchLower) ||
      patient.cognome.toLowerCase().includes(searchLower) ||
      patient.codice_fiscale.toLowerCase().includes(searchLower) ||
      (patient.telefono && patient.telefono.toLowerCase().includes(searchLower)) ||
      (patient.email && patient.email.toLowerCase().includes(searchLower))
    );
  }) : [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content patient-selector-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Seleziona Paziente</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        
        <div className="patient-search-section">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Cerca per nome, cognome, codice fiscale, telefono o email..."
              value={patientSearchTerm}
              onChange={(e) => onPatientSearchChange(e.target.value)}
              autoFocus
            />
          </div>
          <div className="search-results-count">
            {filteredPatients.length} pazienti trovati
          </div>
        </div>

        <div className="patients-list">
          {filteredPatients.length > 0 ? (
            filteredPatients.map(patient => (
              <div 
                key={patient.id} 
                className="patient-item"
                onClick={() => onSelectPatient(patient)}
              >
                <div className="patient-main-info">
                  <div className="patient-name">
                    <User size={18} />
                    <strong>{patient.nome} {patient.cognome}</strong>
                  </div>
                  <div className="patient-details">
                    <span className="patient-cf">CF: {patient.codice_fiscale}</span>
                    {patient.data_nascita && (
                      <span className="patient-age">
                        {new Date().getFullYear() - new Date(patient.data_nascita).getFullYear()} anni
                      </span>
                    )}
                  </div>
                </div>
                <div className="patient-contact-info">
                  {patient.telefono && (
                    <div className="contact-item">
                      <strong>Tel:</strong> {patient.telefono}
                    </div>
                  )}
                  {patient.email && (
                    <div className="contact-item">
                      <strong>Email:</strong> {patient.email}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-patients-found">
              <User size={48} />
              <h3>Nessun paziente trovato</h3>
              <p>
                {patientSearchTerm 
                  ? "Nessun paziente corrisponde ai criteri di ricerca." 
                  : "Non ci sono pazienti nel database."}
              </p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-outline" onClick={onClose}>
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente per conferma eliminazione
const DeleteConfirmationModal = ({ visitToDelete, patientsMap, deleteLoading, onConfirm, onCancel, formatDate }) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h2>Conferma Eliminazione</h2>
        <button className="btn-close" onClick={onCancel}>×</button>
      </div>
      
      {visitToDelete && (
        <div className="delete-content">
          <div className="warning-icon">
            <Trash2 size={48} />
          </div>
          <div className="delete-message">
            <h3>Sei sicuro di voler eliminare questa visita?</h3>
            <div className="visit-summary">
              <p><strong>Paziente:</strong> {patientsMap[visitToDelete.patient_id] ? 
                `${patientsMap[visitToDelete.patient_id].nome} ${patientsMap[visitToDelete.patient_id].cognome}` : 
                'Paziente non trovato'}</p>
              <p><strong>Data:</strong> {formatDate(visitToDelete.visit_date)}</p>
              <p><strong>Tipo:</strong> {visitToDelete.visit_type}</p>
            </div>
            <p className="warning-text">
              ⚠️ Questa azione non può essere annullata. Tutti i dati della visita verranno persi permanentemente.
            </p>
          </div>
        </div>
      )}

      <div className="modal-footer">
        <button type="button" className="btn-outline" onClick={onCancel} disabled={deleteLoading}>
          Annulla
        </button>
        <button type="button" className="btn-danger" onClick={onConfirm} disabled={deleteLoading}>
          {deleteLoading ? 'Eliminazione...' : 'Elimina Visita'}
        </button>
      </div>
    </div>
  </div>
);

// Componente per il form di creazione/modifica visita
const VisitFormModal = ({ 
  isEdit = false, 
  formData, 
  selectedPatient, 
  loading, 
  onFormChange, 
  onSelectPatient, 
  onOpenPatientSelector, 
  onSubmit, 
  onClose 
}) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content create-modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h2>{isEdit ? 'Modifica Visita' : 'Nuova Visita'}</h2>
        <button className="btn-close" onClick={onClose}>×</button>
      </div>
      
      <form onSubmit={onSubmit} className="create-visit-form">
        <div className="form-section">
          <h3>Informazioni Generali</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Paziente *</label>
              <div className="patient-selector-field">
                {selectedPatient ? (
                  <div className="selected-patient">
                    <div className="selected-patient-info">
                      <User size={16} />
                      <span>
                        <strong>{selectedPatient.nome} {selectedPatient.cognome}</strong>
                        <small>CF: {selectedPatient.codice_fiscale}</small>
                      </span>
                    </div>
                    <button
                      type="button"
                      className="btn-change-patient"
                      onClick={onOpenPatientSelector}
                    >
                      Cambia
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn-select-patient"
                    onClick={onOpenPatientSelector}
                  >
                    <User size={16} />
                    Seleziona Paziente
                  </button>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Data e Ora *</label>
              <input
                type="datetime-local"
                value={formData.data_visita}
                onChange={(e) => onFormChange('data_visita', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Tipo Visita *</label>
              <select
                value={formData.tipo_visita}
                onChange={(e) => onFormChange('tipo_visita', e.target.value)}
                required
              >
                <option value="">Seleziona tipo</option>
                <option value="Controllo">Controllo</option>
                <option value="Visita">Visita</option>
                <option value="Emergenza">Emergenza</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Consultazione">Consultazione</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Motivo della Visita</label>
              <textarea
                value={formData.motivo}
                onChange={(e) => onFormChange('motivo', e.target.value)}
                rows="3"
                placeholder="Descrivi il motivo della visita..."
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Dettagli Clinici</h3>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Anamnesi</label>
              <textarea
                value={formData.anamnesi}
                onChange={(e) => onFormChange('anamnesi', e.target.value)}
                rows="3"
                placeholder="Storia clinica del paziente..."
              />
            </div>

            <div className="form-group full-width">
              <label>Esame Obiettivo</label>
              <textarea
                value={formData.esame_obiettivo}
                onChange={(e) => onFormChange('esame_obiettivo', e.target.value)}
                rows="3"
                placeholder="Risultati dell'esame fisico..."
              />
            </div>

            <div className="form-group full-width">
              <label>Diagnosi</label>
              <textarea
                value={formData.diagnosi}
                onChange={(e) => onFormChange('diagnosi', e.target.value)}
                rows="2"
                placeholder="Diagnosi medica..."
              />
            </div>

            <div className="form-group full-width">
              <label>Terapia</label>
              <textarea
                value={formData.terapia}
                onChange={(e) => onFormChange('terapia', e.target.value)}
                rows="3"
                placeholder="Prescrizioni e raccomandazioni terapeutiche..."
              />
            </div>

            <div className="form-group full-width">
              <label>Note</label>
              <textarea
                value={formData.note}
                onChange={(e) => onFormChange('note', e.target.value)}
                rows="2"
                placeholder="Note aggiuntive..."
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-outline" onClick={onClose}>
            Annulla
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (isEdit ? 'Aggiornamento...' : 'Creazione...') : (isEdit ? 'Aggiorna Visita' : 'Crea Visita')}
          </button>
        </div>
      </form>
    </div>
  </div>
);

const VisitsPage = () => {
  const [visits, setVisits] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // Modal states
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPatientSelector, setShowPatientSelector] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Form states
  const [visitToDelete, setVisitToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editSelectedPatient, setEditSelectedPatient] = useState(null);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [isEditingPatientSelection, setIsEditingPatientSelection] = useState(false);
  
  const [createFormData, setCreateFormData] = useState({
    patient_id: '',
    data_visita: '',
    tipo_visita: '',
    motivo: '',
    anamnesi: '',
    esame_obiettivo: '',
    diagnosi: '',
    terapia: '',
    note: ''
  });
  
  const [editFormData, setEditFormData] = useState({
    patient_id: '',
    data_visita: '',
    tipo_visita: '',
    motivo: '',
    anamnesi: '',
    esame_obiettivo: '',
    diagnosi: '',
    terapia: '',
    note: ''
  });
  
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [visitsRes, patientsRes] = await Promise.all([
        api.visits.getAll(),
        api.patients.getForDropdown()
      ]);
      setVisits(Array.isArray(visitsRes.data) ? visitsRes.data : []);
      setPatients(Array.isArray(patientsRes.data?.data) ? patientsRes.data.data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setVisits([]);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  // Create a map of patient ID to patient data for quick lookup
  const patientsMap = Array.isArray(patients) ? patients.reduce((map, patient) => {
    map[patient.id] = patient;
    return map;
  }, {}) : {};

  const filteredVisits = Array.isArray(visits) ? visits.filter(visit => {
    const patient = patientsMap[visit.patient_id];
    const patientName = patient ? `${patient.nome} ${patient.cognome}` : '';
    
    const matchesSearch = 
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.visit_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (visit.notes && visit.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterType === 'all' || visit.visit_type === filterType;
    
    return matchesSearch && matchesFilter;
  }) : [];

  // Event handlers
  const handleViewDetails = (visit) => {
    setSelectedVisit(visit);
    setShowDetailsModal(true);
  };

  const handleCreateVisit = () => {
    setShowCreateModal(true);
    setSelectedPatient(null);
    setCreateFormData({
      patient_id: '',
      data_visita: '',
      tipo_visita: '',
      motivo: '',
      anamnesi: '',
      esame_obiettivo: '',
      diagnosi: '',
      terapia: '',
      note: ''
    });
  };

  const handleEditVisit = (visit) => {
    setSelectedVisit(visit);
    setEditSelectedPatient(patientsMap[visit.patient_id] || null);
    
    // Format date for datetime-local input
    const visitDate = new Date(visit.visit_date);
    const formattedDate = visitDate.toISOString().slice(0, 16);
    
    setEditFormData({
      patient_id: visit.patient_id,
      data_visita: formattedDate,
      tipo_visita: visit.visit_type,
      motivo: visit.motivo || '',
      anamnesi: visit.anamnesi || '',
      esame_obiettivo: visit.esame_obiettivo || '',
      diagnosi: visit.diagnosi || '',
      terapia: visit.terapia || '',
      note: visit.note || ''
    });
    setShowEditModal(true);
  };

  const handleSelectPatient = (patient) => {
    if (isEditingPatientSelection) {
      setEditSelectedPatient(patient);
      setEditFormData(prev => ({
        ...prev,
        patient_id: patient.id
      }));
      setIsEditingPatientSelection(false);
    } else {
      setSelectedPatient(patient);
      setCreateFormData(prev => ({
        ...prev,
        patient_id: patient.id
      }));
    }
    setShowPatientSelector(false);
  };

  const openPatientSelector = (isEdit = false) => {
    setIsEditingPatientSelection(isEdit);
    setShowPatientSelector(true);
    setPatientSearchTerm('');
  };

  const handleCreateFormChange = (field, value) => {
    setCreateFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditFormChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    if (!createFormData.patient_id || !createFormData.data_visita || !createFormData.tipo_visita) {
      alert('Per favore compila tutti i campi obbligatori');
      return;
    }

    try {
      setCreateLoading(true);
      await api.visits.create(createFormData);
      setShowCreateModal(false);
      fetchData();
      alert('Visita creata con successo!');
    } catch (error) {
      console.error('Error creating visit:', error);
      alert('Errore durante la creazione della visita. Riprova.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editFormData.patient_id || !editFormData.data_visita || !editFormData.tipo_visita) {
      alert('Per favore compila tutti i campi obbligatori');
      return;
    }

    try {
      setEditLoading(true);
      await api.visits.update(selectedVisit.id, editFormData);
      setShowEditModal(false);
      fetchData();
      alert('Visita aggiornata con successo!');
    } catch (error) {
      console.error('Error updating visit:', error);
      alert('Errore durante l\'aggiornamento della visita. Riprova.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteVisit = (visit) => {
    setVisitToDelete(visit);
    setShowDeleteModal(true);
  };

  const confirmDeleteVisit = async () => {
    if (!visitToDelete) return;

    try {
      setDeleteLoading(true);
      await api.visits.delete(visitToDelete.id);
      setShowDeleteModal(false);
      setVisitToDelete(null);
      fetchData();
      alert('Visita eliminata con successo!');
    } catch (error) {
      console.error('Error deleting visit:', error);
      alert('Errore durante l\'eliminazione della visita. Riprova.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDeleteVisit = () => {
    setShowDeleteModal(false);
    setVisitToDelete(null);
  };

  const getVisitTypeColor = (type) => {
    const colors = {
      'Controllo': '#10B981',
      'Visita': '#3B82F6',
      'Emergenza': '#EF4444',
      'Follow-up': '#F59E0B',
      'Consultazione': '#8B5CF6'
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

  const visitTypes = Array.isArray(visits) ? [...new Set(visits.map(visit => visit.visit_type))] : [];

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
        <button className="btn-primary" onClick={handleCreateVisit}>
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
              <VisitCard 
                key={visit.id} 
                visit={visit} 
                patientsMap={patientsMap}
                onViewDetails={handleViewDetails}
                onEditVisit={handleEditVisit}
                onDeleteVisit={handleDeleteVisit}
                getVisitTypeColor={getVisitTypeColor}
                formatDate={formatDate}
              />
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
              <button className="btn-primary" onClick={handleCreateVisit}>
                <Plus size={20} />
                Registra Prima Visita
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showDetailsModal && (
        <VisitDetailsModal 
          selectedVisit={selectedVisit}
          patientsMap={patientsMap}
          onClose={() => setShowDetailsModal(false)}
          getVisitTypeColor={getVisitTypeColor}
          formatDate={formatDate}
        />
      )}
      
      {showCreateModal && (
        <VisitFormModal 
          isEdit={false}
          formData={createFormData}
          selectedPatient={selectedPatient}
          loading={createLoading}
          onFormChange={handleCreateFormChange}
          onSelectPatient={handleSelectPatient}
          onOpenPatientSelector={() => openPatientSelector(false)}
          onSubmit={handleCreateSubmit}
          onClose={() => setShowCreateModal(false)}
        />
      )}
      
      {showEditModal && (
        <VisitFormModal 
          isEdit={true}
          formData={editFormData}
          selectedPatient={editSelectedPatient}
          loading={editLoading}
          onFormChange={handleEditFormChange}
          onSelectPatient={handleSelectPatient}
          onOpenPatientSelector={() => openPatientSelector(true)}
          onSubmit={handleEditSubmit}
          onClose={() => setShowEditModal(false)}
        />
      )}
      
      {showPatientSelector && (
        <PatientSelectorModal 
          patients={patients}
          patientSearchTerm={patientSearchTerm}
          onPatientSearchChange={setPatientSearchTerm}
          onSelectPatient={handleSelectPatient}
          onClose={() => setShowPatientSelector(false)}
        />
      )}
      
      {showDeleteModal && (
        <DeleteConfirmationModal 
          visitToDelete={visitToDelete}
          patientsMap={patientsMap}
          deleteLoading={deleteLoading}
          onConfirm={confirmDeleteVisit}
          onCancel={cancelDeleteVisit}
          formatDate={formatDate}
        />
      )}
    </div>
  );
};

export default VisitsPage;
