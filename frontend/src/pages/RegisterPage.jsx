import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validatePassword } from '../utils/validation';
import './AuthPages.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    nome: '',
    cognome: '',
    ruolo: 'medico'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordValidation, setPasswordValidation] = useState({ valid: true, message: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validazione password in tempo reale
    if (name === 'password') {
      const validation = validatePassword(value);
      setPasswordValidation(validation);
    }

    // Rimuovi errori quando l'utente inizia a digitare
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validazioni client-side
    if (!passwordValidation.valid) {
      setError(passwordValidation.message);
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Le password non coincidono');
      setIsLoading(false);
      return;
    }

    if (!formData.username || !formData.email || !formData.nome || !formData.cognome) {
      setError('Tutti i campi sono obbligatori');
      setIsLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      const result = await register(registerData);
      
      if (result.success) {
        setSuccess('Registrazione completata con successo! Puoi ora effettuare il login.');
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          nome: '',
          cognome: '',
          ruolo: 'medico'
        });
        
        // Reindirizza al login dopo 2 secondi
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Errore durante la registrazione. Riprova.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <Heart className="auth-logo-icon" />
            <h1 className="auth-title">Healthboard</h1>
          </div>
          <p className="auth-subtitle">
            Crea il tuo account per accedere al fascicolo sanitario
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

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
                className="form-input"
                placeholder="Nome"
                required
                autoComplete="given-name"
              />
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
                className="form-input"
                placeholder="Cognome"
                required
                autoComplete="family-name"
              />
            </div>

            <div className="form-group form-grid-full">
              <label htmlFor="username" className="form-label">
                Username *
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Scegli un username univoco"
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group form-grid-full">
              <label htmlFor="email" className="form-label">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                placeholder="esempio@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group form-grid-full">
              <label htmlFor="ruolo" className="form-label">
                Ruolo
              </label>
              <select
                id="ruolo"
                name="ruolo"
                value={formData.ruolo}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="medico">Medico</option>
                <option value="infermiere">Infermiere</option>
                <option value="amministratore">Amministratore</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password *
              </label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Crea una password sicura"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {!passwordValidation.valid && formData.password && (
                <small className="text-error">{passwordValidation.message}</small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Conferma Password *
              </label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Ripeti la password"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary auth-submit-btn"
            disabled={isLoading || !passwordValidation.valid}
          >
            {isLoading ? (
              <>
                <div className="spinner" />
                Registrazione in corso...
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Registrati
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-footer-text">
            Hai già un account?{' '}
            <Link to="/login" className="auth-link">
              Accedi qui
            </Link>
          </p>
        </div>
      </div>

      <div className="auth-background">
        <div className="auth-bg-pattern"></div>
      </div>
    </div>
  );
};

export default RegisterPage;
