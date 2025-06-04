import React, { useState, useEffect } from 'react';
import { Users, Calendar, FileText, TrendingUp, Activity } from 'lucide-react';
import { api } from '../utils/api';
import './DashboardPage.css';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayVisits: 0,
    pendingExaminations: 0,
    monthlyGrowth: 0
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [recentVisits, setRecentVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch patients for stats
      const patientsResponse = await api.patients.getAll();
      const patients = patientsResponse.data;
      
      // Fetch recent visits
      const visitsResponse = await api.visits.getAll();
      const visits = visitsResponse.data;
      
      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const todayVisits = visits.filter(visit => 
        visit.visit_date.startsWith(today)
      ).length;
      
      // Get recent patients (last 5)
      const sortedPatients = patients
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      
      // Get recent visits (last 5)
      const sortedVisits = visits
        .sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date))
        .slice(0, 5);
      
      setStats({
        totalPatients: patients.length,
        todayVisits: todayVisits,
        pendingExaminations: Math.floor(Math.random() * 10), // Placeholder
        monthlyGrowth: 15 // Placeholder
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
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.pendingExaminations}</h3>
            <p>Esami Pendenti</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>+{stats.monthlyGrowth}%</h3>
            <p>Crescita Mensile</p>
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
          <div className="recent-list">
            {recentPatients.length > 0 ? (
              recentPatients.map(patient => (
                <div key={patient.id} className="recent-item">
                  <div className="patient-info">
                    <strong>{patient.first_name} {patient.last_name}</strong>
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
          </h2>
          <div className="recent-list">
            {recentVisits.length > 0 ? (
              recentVisits.map(visit => (
                <div key={visit.id} className="recent-item">
                  <div className="visit-info">
                    <strong>Visita #{visit.id}</strong>
                    <span className="visit-meta">
                      {visit.visit_type} • {new Date(visit.visit_date).toLocaleDateString('it-IT')}
                    </span>
                    {visit.notes && (
                      <p className="visit-notes">{visit.notes.substring(0, 100)}...</p>
                    )}
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
