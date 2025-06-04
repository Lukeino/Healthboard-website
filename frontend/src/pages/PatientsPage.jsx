import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  Calendar,
  Phone,
  Mail,
  MapPin,
  User,
  Trash2
} from 'lucide-react';
import { api } from '../utils/api';
import './PatientsPage.css';

// Componente separato per il modal di aggiunta/modifica paziente
const AddPatientModal = ({ 
  showAddModal, 
  showEditModal,
  setShowAddModal, 
  setShowEditModal,
  formData, 
  setFormData, 
  formErrors, 
  setFormErrors, 
  isSubmitting, 
  handleSubmit, 
  handleInputChange,
  resetForm
}) => {
  if (!showAddModal && !showEditModal) return null;
  
  const isEditMode = showEditModal;
  
  const handleClose = () => {
    if (isEditMode) {
      setShowEditModal(false);
    } else {
      setShowAddModal(false);
    }
    resetForm();
  };
  
  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content add-patient-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditMode ? 'Modifica Paziente' : 'Registra Nuovo Paziente'}</h2>
          <button 
            className="btn-close"
            onClick={handleClose}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="patient-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="nome" className="form-label">
                Nome *
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                className={`form-input ${formErrors.nome ? 'error' : ''}`}
                placeholder="Nome del paziente"
                required
              />
              {formErrors.nome && <span className="error-text">{formErrors.nome}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="cognome" className="form-label">
                Cognome *
              </label>
              <input
                type="text"
                id="cognome"
                name="cognome"
                value={formData.cognome}
                onChange={handleInputChange}
                className={`form-input ${formErrors.cognome ? 'error' : ''}`}
                placeholder="Cognome del paziente"
                required
              />
              {formErrors.cognome && <span className="error-text">{formErrors.cognome}</span>}
            </div>

            <div className="form-group form-grid-full">
              <label htmlFor="codice_fiscale" className="form-label">
                Codice Fiscale *
              </label>
              <input
                type="text"
                id="codice_fiscale"
                name="codice_fiscale"
                value={formData.codice_fiscale}
                onChange={handleInputChange}
                className={`form-input ${formErrors.codice_fiscale ? 'error' : ''}`}
                placeholder="RSSMRA80A01H501U"
                maxLength="16"
                required
              />
              {formErrors.codice_fiscale && <span className="error-text">{formErrors.codice_fiscale}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="data_nascita" className="form-label">
                Data di Nascita *
              </label>
              <input
                type="date"
                id="data_nascita"
                name="data_nascita"
                value={formData.data_nascita}
                onChange={handleInputChange}
                className={`form-input ${formErrors.data_nascita ? 'error' : ''}`}
                required
              />
              {formErrors.data_nascita && <span className="error-text">{formErrors.data_nascita}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="sesso" className="form-label">
                Sesso *
              </label>
              <select
                id="sesso"
                name="sesso"
                value={formData.sesso}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="M">Maschio</option>
                <option value="F">Femmina</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="telefono" className="form-label">
                Telefono
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                className="form-input"
                placeholder="+39 123 456 7890"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`form-input ${formErrors.email ? 'error' : ''}`}
                placeholder="paziente@email.com"
              />
              {formErrors.email && <span className="error-text">{formErrors.email}</span>}
            </div>

            <div className="form-group form-grid-full">
              <label htmlFor="indirizzo" className="form-label">
                Indirizzo
              </label>
              <input
                type="text"
                id="indirizzo"
                name="indirizzo"
                value={formData.indirizzo}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Via, numero civico"
              />
            </div>

            <div className="form-group">
              <label htmlFor="citta" className="form-label">
                Città
              </label>
              <input
                type="text"
                id="citta"
                name="citta"
                value={formData.citta}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Città"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cap" className="form-label">
                CAP
              </label>
              <input
                type="text"
                id="cap"
                name="cap"
                value={formData.cap}
                onChange={handleInputChange}
                className="form-input"
                placeholder="12345"
                maxLength="5"
              />
            </div>

            <div className="form-group">
              <label htmlFor="provincia" className="form-label">
                Provincia
              </label>
              <input
                type="text"
                id="provincia"
                name="provincia"
                value={formData.provincia}
                onChange={handleInputChange}
                className="form-input"
                placeholder="RM"
                maxLength="2"
              />
            </div>

            <div className="form-group">
              <label htmlFor="medico_curante" className="form-label">
                Medico Curante
              </label>
              <input
                type="text"
                id="medico_curante"
                name="medico_curante"
                value={formData.medico_curante}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Dr. Mario Rossi"
              />
            </div>

            <div className="form-group form-grid-full">
              <label htmlFor="note_generali" className="form-label">
                Note Generali
              </label>
              <textarea
                id="note_generali"
                name="note_generali"
                value={formData.note_generali}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Note aggiuntive sul paziente..."
                rows="3"
              />
            </div>
          </div>          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClose}
            >
              Annulla
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" />
                  {isEditMode ? 'Aggiornamento...' : 'Registrazione...'}
                </>
              ) : (
                <>
                  <Plus size={18} />
                  {isEditMode ? 'Aggiorna Paziente' : 'Registra Paziente'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [formData, setFormData] = useState({
    codice_fiscale: '',
    nome: '',
    cognome: '',
    data_nascita: '',
    sesso: 'M',
    telefono: '',
    email: '',
    indirizzo: '',
    citta: '',
    cap: '',
    provincia: '',
    medico_curante: '',
    note_generali: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await api.patients.getAll();
      
      // Assicurati che response.data sia un array
      const patientsData = Array.isArray(response.data) ? response.data : response.data.data || [];
      
      setPatients(patientsData);
      console.log('Pazienti caricati:', patientsData.length); // Debug
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]); // Fallback a array vuoto
    } finally {
      setLoading(false);
    }
  };
  const filteredPatients = patients.filter(patient =>
    `${patient.nome} ${patient.cognome}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.codice_fiscale && patient.codice_fiscale.toLowerCase().includes(searchTerm.toLowerCase()))
  );  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
    setShowDetailsModal(true);
  };

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setFormData({
      codice_fiscale: patient.codice_fiscale || '',
      nome: patient.nome || '',
      cognome: patient.cognome || '',
      data_nascita: patient.data_nascita || '',
      sesso: patient.sesso || 'M',
      telefono: patient.telefono || '',
      email: patient.email || '',
      indirizzo: patient.indirizzo || '',
      citta: patient.citta || '',
      cap: patient.cap || '',
      provincia: patient.provincia || '',
      medico_curante: patient.medico_curante || '',
      note_generali: patient.note_generali || ''
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleDeletePatient = (patient) => {
    setPatientToDelete(patient);
    setShowDeleteModal(true);
  };

  const confirmDeletePatient = async () => {
    if (!patientToDelete) return;
    
    try {
      setIsSubmitting(true);
      await api.patients.delete(patientToDelete.id);
      
      // Ricarica la lista pazienti
      await fetchPatients();
      
      setShowDeleteModal(false);
      setPatientToDelete(null);
      alert('Paziente eliminato con successo!');
    } catch (error) {
      console.error('Errore nella cancellazione paziente:', error);
      const message = error.response?.data?.message || 'Errore durante la cancellazione';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Rimuovi errore quando l'utente inizia a digitare
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [formErrors]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.codice_fiscale.trim()) {
      errors.codice_fiscale = 'Codice fiscale è obbligatorio';
    }
    if (!formData.nome.trim()) {
      errors.nome = 'Nome è obbligatorio';
    }
    if (!formData.cognome.trim()) {
      errors.cognome = 'Cognome è obbligatorio';
    }
    if (!formData.data_nascita) {
      errors.data_nascita = 'Data di nascita è obbligatoria';
    }
    if (formData.email && !formData.email.includes('@')) {
      errors.email = 'Email non valida';
    }
    
    return errors;
  };  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let response;
      if (showEditModal && selectedPatient) {
        // Modifica paziente esistente
        response = await api.patients.update(selectedPatient.id, formData);
      } else {
        // Crea nuovo paziente
        response = await api.patients.create(formData);
      }
      
      // Verifica successo operazione
      const isSuccess = response.data?.success || response.status === 200 || response.status === 201;
      
      if (isSuccess) {
        // Reset form e chiudi modal PRIMA di ricaricare i dati
        resetForm();
        
        // Ricarica la lista pazienti
        await fetchPatients();
        
        const message = showEditModal ? 'Paziente modificato con successo!' : 'Paziente registrato con successo!';
        alert(message);
      } else {
        throw new Error('Operazione non riuscita');
      }
    } catch (error) {
      console.error('Errore nella gestione paziente:', error);
      const message = error.response?.data?.message || 'Errore durante l\'operazione';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      codice_fiscale: '',
      nome: '',
      cognome: '',
      data_nascita: '',
      sesso: 'M',
      telefono: '',
      email: '',
      indirizzo: '',
      citta: '',
      cap: '',
      provincia: '',
      medico_curante: '',
      note_generali: ''
    });
    setFormErrors({});
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedPatient(null);
  };
  const PatientCard = ({ patient }) => (
    <div className="patient-card">
      <div className="patient-header">
        <div className="patient-basic">
          <h3>{patient.nome} {patient.cognome}</h3>
          <p className="patient-info">
            {patient.codice_fiscale && `CF: ${patient.codice_fiscale}`}
          </p>
        </div>        <div className="patient-actions">
          <button 
            className="btn-icon"
            onClick={() => handleViewDetails(patient)}
            title="Visualizza dettagli"
          >
            <Eye size={18} />
          </button>
          <button 
            className="btn-icon"
            onClick={() => handleEditPatient(patient)}
            title="Modifica paziente"
          >
            <Edit size={18} />
          </button>          <button 
            className="btn-icon btn-danger"
            onClick={() => handleDeletePatient(patient)}
            title="Elimina paziente"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
        <div className="patient-details">
        <div className="patient-detail">
          <Mail size={16} />
          <span>{patient.email || 'Email non specificata'}</span>
        </div>
        {patient.telefono && (
          <div className="patient-detail">
            <Phone size={16} />
            <span>{patient.telefono}</span>
          </div>
        )}
        {patient.indirizzo && (
          <div className="patient-detail">
            <MapPin size={16} />
            <span>{patient.indirizzo}</span>
          </div>
        )}
        <div className="patient-detail">
          <Calendar size={16} />
          <span>Registrato: {new Date(patient.created_at).toLocaleDateString('it-IT')}</span>
        </div>
      </div>
    </div>
  );

  const PatientDetailsModal = () => (
    <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Dettagli Paziente</h2>
          <button 
            className="btn-close"
            onClick={() => setShowDetailsModal(false)}
          >
            ×
          </button>
        </div>
        
        {selectedPatient && (
          <div className="patient-full-details">
            <div className="details-section">
              <h3>Informazioni Personali</h3>              <div className="details-grid">
                <div className="detail-item">
                  <label>Nome Completo:</label>
                  <span>{selectedPatient.nome} {selectedPatient.cognome}</span>
                </div>
                <div className="detail-item">
                  <label>Data di Nascita:</label>
                  <span>{new Date(selectedPatient.data_nascita).toLocaleDateString('it-IT')}</span>
                </div>
                <div className="detail-item">
                  <label>Sesso:</label>
                  <span>{selectedPatient.sesso === 'M' ? 'Maschio' : 'Femmina'}</span>
                </div>
                <div className="detail-item">
                  <label>Codice Fiscale:</label>
                  <span>{selectedPatient.codice_fiscale || 'Non specificato'}</span>
                </div>
              </div>
            </div>

            <div className="details-section">
              <h3>Contatti</h3>              <div className="details-grid">
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{selectedPatient.email || 'Non specificata'}</span>
                </div>
                <div className="detail-item">
                  <label>Telefono:</label>
                  <span>{selectedPatient.telefono || 'Non specificato'}</span>
                </div>
                <div className="detail-item">
                  <label>Indirizzo:</label>
                  <span>{selectedPatient.indirizzo || 'Non specificato'}</span>
                </div>
                <div className="detail-item">
                  <label>Città:</label>
                  <span>{selectedPatient.citta || 'Non specificata'}</span>
                </div>
                <div className="detail-item">
                  <label>CAP:</label>
                  <span>{selectedPatient.cap || 'Non specificato'}</span>
                </div>
                <div className="detail-item">
                  <label>Provincia:</label>
                  <span>{selectedPatient.provincia || 'Non specificata'}</span>
                </div>
              </div>
            </div>            <div className="details-section">
              <h3>Informazioni Mediche</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <label>Medico Curante:</label>
                  <span>{selectedPatient.medico_curante || 'Non specificato'}</span>
                </div>
                <div className="detail-item">
                  <label>Note Generali:</label>
                  <span>{selectedPatient.note_generali || 'Nessuna nota'}</span>
                </div>
              </div>
            </div>

            <div className="details-section">
              <h3>Sistema</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <label>Data Registrazione:</label>
                  <span>{new Date(selectedPatient.created_at).toLocaleString('it-IT')}</span>
                </div>
                <div className="detail-item">
                  <label>Ultimo Aggiornamento:</label>
                  <span>{new Date(selectedPatient.updated_at).toLocaleString('it-IT')}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>  );

  // Modal di conferma cancellazione
  const DeleteConfirmModal = () => (
    <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
      <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Conferma Cancellazione</h2>
          <button 
            className="btn-close"
            onClick={() => setShowDeleteModal(false)}
          >
            ×
          </button>
        </div>
        
        <div className="delete-modal-content">
          <div className="delete-warning">
            <Trash2 size={48} className="warning-icon" />
            <h3>Sei sicuro di voler eliminare questo paziente?</h3>
            {patientToDelete && (
              <p>
                Stai per eliminare <strong>{patientToDelete.nome} {patientToDelete.cognome}</strong>
                {patientToDelete.codice_fiscale && ` (CF: ${patientToDelete.codice_fiscale})`}.
              </p>
            )}
            <p className="warning-text">
              Questa azione non può essere annullata. Tutti i dati del paziente, 
              incluse visite ed esami, verranno eliminati permanentemente.
            </p>
          </div>
          
          <div className="delete-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={isSubmitting}
            >
              Annulla
            </button>
            <button
              type="button"
              className="btn-danger"
              onClick={confirmDeletePatient}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" />
                  Eliminazione...
                </>
              ) : (
                <>
                  <Trash2 size={18} />
                  Elimina Paziente
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="patients-loading">
        <div className="loading-spinner"></div>
        <p>Caricamento pazienti...</p>
      </div>
    );
  }

  return (
    <div className="patients-page">
      <div className="patients-header">
        <div className="header-content">
          <h1>
            <Users size={28} />
            Gestione Pazienti
          </h1>
          <p>Gestisci i dati dei tuoi pazienti</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={20} />
          Nuovo Paziente
        </button>
      </div>

      <div className="patients-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Cerca per nome, email o codice fiscale..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="patients-stats">
          <span className="stat">
            {filteredPatients.length} di {patients.length} pazienti
          </span>
        </div>
      </div>

      <div className="patients-grid">
        {filteredPatients.length > 0 ? (
          filteredPatients.map(patient => (
            <PatientCard key={patient.id} patient={patient} />
          ))
        ) : (
          <div className="no-patients">
            <Users size={48} />
            <h3>Nessun paziente trovato</h3>
            <p>
              {patients.length === 0 
                ? "Non hai ancora registrato nessun paziente." 
                : "Nessun paziente corrisponde ai criteri di ricerca."}
            </p>
            {patients.length === 0 && (
              <button 
                className="btn-primary"
                onClick={() => setShowAddModal(true)}
              >
                <Plus size={20} />
                Registra Primo Paziente
              </button>
            )}
          </div>
        )}
      </div>      {showDetailsModal && <PatientDetailsModal />}
      {showDeleteModal && <DeleteConfirmModal />}
      <AddPatientModal 
        showAddModal={showAddModal}
        showEditModal={showEditModal}
        setShowAddModal={setShowAddModal}
        setShowEditModal={setShowEditModal}
        formData={formData}
        setFormData={setFormData}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
        isSubmitting={isSubmitting}
        handleSubmit={handleSubmit}
        handleInputChange={handleInputChange}
        resetForm={resetForm}
      />
    </div>
  );
};

export default PatientsPage;
