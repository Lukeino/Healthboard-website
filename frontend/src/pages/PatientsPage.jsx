import React, { useState, useEffect } from 'react';
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
  User
} from 'lucide-react';
import { api } from '../utils/api';
import './PatientsPage.css';

const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await api.patients.getAll();
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    `${patient.first_name} ${patient.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.codice_fiscale && patient.codice_fiscale.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
    setShowDetailsModal(true);
  };

  const PatientCard = ({ patient }) => (
    <div className="patient-card">
      <div className="patient-header">
        <div className="patient-avatar">
          <User size={24} />
        </div>
        <div className="patient-basic">
          <h3>{patient.first_name} {patient.last_name}</h3>
          <p className="patient-birth">
            {new Date(patient.birth_date).toLocaleDateString('it-IT')} • 
            {' '}{new Date().getFullYear() - new Date(patient.birth_date).getFullYear()} anni
          </p>
        </div>
        <div className="patient-actions">
          <button 
            className="btn-icon"
            onClick={() => handleViewDetails(patient)}
            title="Visualizza dettagli"
          >
            <Eye size={18} />
          </button>
          <button 
            className="btn-icon"
            title="Modifica paziente"
          >
            <Edit size={18} />
          </button>
        </div>
      </div>
      
      <div className="patient-details">
        <div className="patient-detail">
          <Mail size={16} />
          <span>{patient.email}</span>
        </div>
        {patient.phone && (
          <div className="patient-detail">
            <Phone size={16} />
            <span>{patient.phone}</span>
          </div>
        )}
        {patient.address && (
          <div className="patient-detail">
            <MapPin size={16} />
            <span>{patient.address}</span>
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
              <h3>Informazioni Personali</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <label>Nome Completo:</label>
                  <span>{selectedPatient.first_name} {selectedPatient.last_name}</span>
                </div>
                <div className="detail-item">
                  <label>Data di Nascita:</label>
                  <span>{new Date(selectedPatient.birth_date).toLocaleDateString('it-IT')}</span>
                </div>
                <div className="detail-item">
                  <label>Sesso:</label>
                  <span>{selectedPatient.gender === 'M' ? 'Maschio' : 'Femmina'}</span>
                </div>
                <div className="detail-item">
                  <label>Codice Fiscale:</label>
                  <span>{selectedPatient.codice_fiscale || 'Non specificato'}</span>
                </div>
              </div>
            </div>

            <div className="details-section">
              <h3>Contatti</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{selectedPatient.email}</span>
                </div>
                <div className="detail-item">
                  <label>Telefono:</label>
                  <span>{selectedPatient.phone || 'Non specificato'}</span>
                </div>
                <div className="detail-item">
                  <label>Indirizzo:</label>
                  <span>{selectedPatient.address || 'Non specificato'}</span>
                </div>
              </div>
            </div>

            <div className="details-section">
              <h3>Informazioni Mediche</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <label>Allergie:</label>
                  <span>{selectedPatient.allergies || 'Nessuna allergia nota'}</span>
                </div>
                <div className="detail-item">
                  <label>Note Mediche:</label>
                  <span>{selectedPatient.medical_notes || 'Nessuna nota'}</span>
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
      </div>

      {showDetailsModal && <PatientDetailsModal />}
    </div>
  );
};

export default PatientsPage;
