import React, { useState, useEffect } from 'react';
import { Users, Calendar, FileText, Activity } from 'lucide-react';
import { api } from '../utils/api';
import './DashboardPage.css';

const DashboardPage = () => {  const [stats, setStats] = useState({
    totalPatients: 0,
    todayVisits: 0,
    pendingExaminations: 0
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [recentVisits, setRecentVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch patients for stats
      const patientsResponse = await api.patients.getAll();
      const patients = Array.isArray(patientsResponse.data) ? patientsResponse.data : patientsResponse.data.data || [];
      
      // Fetch recent visits
      const visitsResponse = await api.visits.getAll();
      const visits = Array.isArray(visitsResponse.data) ? visitsResponse.data : visitsResponse.data.data || [];
        // Create patients map for quick lookup
      const patientsMap = patients.reduce((map, patient) => {
        // Try both string and number keys since IDs might come in different formats
        map[patient.id] = patient;
        map[String(patient.id)] = patient;
        if (typeof patient.id === 'string') {
          map[parseInt(patient.id)] = patient;
        }
        return map;
      }, {});
      
      // Fetch pending examinations count
      const pendingExamsResponse = await api.examinations.getPendingCount();
      const pendingExamsCount = pendingExamsResponse.data.count;
      
      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const todayVisits = visits.filter(visit => 
        visit.data_visita && visit.data_visita.startsWith(today)
      ).length;
      
      // Get recent patients (last 5) - sorted by creation date
      const sortedPatients = patients
        .filter(patient => patient.created_at) // Filtra solo pazienti con data creazione
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);      // Get recent visits (last 5) with patient information
      const sortedVisits = visits
        .filter(visit => (visit.data_visita || visit.visit_date)) // Prima filtra solo per data
        .sort((a, b) => new Date(b.data_visita || b.visit_date) - new Date(a.data_visita || a.visit_date))
        .slice(0, 5)        .map(visit => {
          console.log('Processing visit:', visit.id, 'patient_id:', visit.patient_id, 'type:', typeof visit.patient_id);
          
          // Try to find patient with different ID formats
          let patient = patientsMap[visit.patient_id] || 
                       patientsMap[String(visit.patient_id)] || 
                       patientsMap[parseInt(visit.patient_id)] || 
                       null;
          
          console.log('Patient found:', !!patient, patient ? `${patient.nome} ${patient.cognome}` : 'none');
          
          return {
            ...visit,
            patient: patient
          };
        });
        console.log('Dashboard data:', {
        totalPatients: patients.length,
        recentPatients: sortedPatients.length,
        todayVisits,
        pendingExamsCount,
        visits: visits.slice(0, 3), // Log first 3 visits to see structure
        patients: patients.slice(0, 3), // Log first 3 patients to see structure
        patientsMap: Object.keys(patientsMap).slice(0, 5) // Log first 5 patient IDs
      }); // Debug
        setStats({
        totalPatients: patients.length,
        todayVisits: todayVisits,
        pendingExaminations: pendingExamsCount
      });
      
      setRecentPatients(sortedPatients);
      setRecentVisits(sortedVisits);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Caricamento dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Panoramica generale del sistema sanitario</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.totalPatients}</h3>
            <p>Pazienti Totali</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.todayVisits}</h3>
            <p>Visite Oggi</p>
          </div>
        </div>        <div className="stat-card">
          <div className="stat-icon">
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.pendingExaminations}</h3>
            <p>Esami Pendenti</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-content">
        <div className="dashboard-section">
          <h2>
            <Activity size={20} />
            Pazienti Recenti
          </h2>
          <div className="recent-list">            {recentPatients.length > 0 ? (
              recentPatients.map(patient => (
                <div key={patient.id} className="recent-item">
                  <div className="patient-info">
                    <strong>{patient.nome} {patient.cognome}</strong>
                    <span className="patient-meta">
                      {patient.email} • {new Date(patient.created_at).toLocaleDateString('it-IT')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">Nessun paziente registrato</p>
            )}
          </div>
        </div>

        <div className="dashboard-section">
          <h2>
            <Calendar size={20} />
            Visite Recenti
          </h2>          <div className="recent-list">
            {recentVisits.length > 0 ? (
              recentVisits.map(visit => (
                <div key={visit.id} className="recent-item">
                  <div className="visit-info">
                    <div className="visit-details">
                      <strong>Paziente: {visit.patient ? `${visit.patient.nome} ${visit.patient.cognome}` : 'Paziente non trovato'}</strong>
                      <span className="visit-meta">
                        Data e Ora: {new Date(visit.data_visita || visit.visit_date).toLocaleString('it-IT', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className="visit-reason">
                        Motivo visita: {visit.motivo || '-'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">Nessuna visita registrata</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
