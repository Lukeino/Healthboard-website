// Validazione Codice Fiscale italiano
export const validateCodiceFiscale = (codiceFiscale) => {
  if (!codiceFiscale) return false;
  
  const cf = codiceFiscale.toUpperCase().trim();
  
  // Controllo lunghezza
  if (cf.length !== 16) return false;
  
  // Controllo formato: 6 lettere, 2 numeri, 1 lettera, 2 numeri, 1 lettera, 3 caratteri alphanumerici, 1 lettera
  const regex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9A-Z]{3}[A-Z]$/;
  if (!regex.test(cf)) return false;
  
  // Controllo carattere di controllo
  const even = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
  const odd = [1, 0, 5, 7, 9, 13, 15, 17, 19, 21, 2, 4, 18, 20, 11, 3, 6, 8, 12, 14, 16, 10, 22, 25, 24, 23];
  
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    const char = cf[i];
    const value = isNaN(char) ? char.charCodeAt(0) - 65 : parseInt(char);
    sum += i % 2 === 0 ? odd[value] : even[value];
  }
  
  const checkChar = String.fromCharCode(65 + (sum % 26));
  return checkChar === cf[15];
};

// Validazione email
export const validateEmail = (email) => {
  if (!email) return true; // Email opzionale
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Validazione telefono italiano
export const validateTelefono = (telefono) => {
  if (!telefono) return true; // Telefono opzionale
  const cleaned = telefono.replace(/[\s\-\+\(\)]/g, '');
  const regex = /^(\+39)?[0-9]{8,11}$/;
  return regex.test(cleaned);
};

// Validazione CAP italiano
export const validateCAP = (cap) => {
  if (!cap) return true; // CAP opzionale
  const regex = /^[0-9]{5}$/;
  return regex.test(cap);
};

// Validazione data (formato YYYY-MM-DD)
export const validateData = (data) => {
  if (!data) return false;
  const date = new Date(data);
  return date instanceof Date && !isNaN(date) && data.match(/^\d{4}-\d{2}-\d{2}$/);
};

// Validazione età minima
export const validateEtaMinima = (dataNascita, etaMinima = 0) => {
  if (!dataNascita) return false;
  const oggi = new Date();
  const nascita = new Date(dataNascita);
  const eta = oggi.getFullYear() - nascita.getFullYear();
  const meseDiff = oggi.getMonth() - nascita.getMonth();
  
  if (meseDiff < 0 || (meseDiff === 0 && oggi.getDate() < nascita.getDate())) {
    eta--;
  }
  
  return eta >= etaMinima;
};

// Validazione password
export const validatePassword = (password) => {
  if (!password) return { valid: false, message: 'Password richiesta' };
  
  if (password.length < 8) {
    return { valid: false, message: 'Password deve essere di almeno 8 caratteri' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { valid: false, message: 'Password deve contenere almeno una lettera minuscola' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { valid: false, message: 'Password deve contenere almeno una lettera maiuscola' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { valid: false, message: 'Password deve contenere almeno un numero' };
  }
  
  return { valid: true };
};

// Validazione campi obbligatori paziente
export const validatePatient = (patientData) => {
  const errors = {};
  
  if (!patientData.nome?.trim()) {
    errors.nome = 'Nome è richiesto';
  }
  
  if (!patientData.cognome?.trim()) {
    errors.cognome = 'Cognome è richiesto';
  }
  
  if (!patientData.codice_fiscale?.trim()) {
    errors.codice_fiscale = 'Codice fiscale è richiesto';
  } else if (!validateCodiceFiscale(patientData.codice_fiscale)) {
    errors.codice_fiscale = 'Codice fiscale non valido';
  }
  
  if (!patientData.data_nascita) {
    errors.data_nascita = 'Data di nascita è richiesta';
  } else if (!validateData(patientData.data_nascita)) {
    errors.data_nascita = 'Data di nascita non valida';
  }
  
  if (!patientData.sesso) {
    errors.sesso = 'Sesso è richiesto';
  } else if (!['M', 'F'].includes(patientData.sesso)) {
    errors.sesso = 'Sesso deve essere M o F';
  }
  
  if (patientData.email && !validateEmail(patientData.email)) {
    errors.email = 'Email non valida';
  }
  
  if (patientData.telefono && !validateTelefono(patientData.telefono)) {
    errors.telefono = 'Numero di telefono non valido';
  }
  
  if (patientData.cap && !validateCAP(patientData.cap)) {
    errors.cap = 'CAP non valido';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validazione campi obbligatori visita
export const validateVisit = (visitData) => {
  const errors = {};
  
  if (!visitData.patient_id) {
    errors.patient_id = 'Paziente è richiesto';
  }
  
  if (!visitData.data_visita) {
    errors.data_visita = 'Data visita è richiesta';
  } else if (!validateData(visitData.data_visita.split('T')[0])) {
    errors.data_visita = 'Data visita non valida';
  }
  
  if (!visitData.tipo_visita?.trim()) {
    errors.tipo_visita = 'Tipo visita è richiesto';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
