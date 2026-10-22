/**
 * LigaPro – Capa de datos (Local + Firebase Firestore)
 * Sincronización en tiempo real cuando USE_FIREBASE = true
 */

// ----- Config (edita js/firebase-config.js o sobrescribe aquí) -----
let USE_FIREBASE = false;
let db = null;
let unsubscribeTournaments = null;

const LOCAL_KEY = 'ligapro_tournaments_v1';

const DEFAULT_TOURNAMENTS = [
  {
    id: 1,
    name: "Liga Comunitaria 2026",
    sport: "Fútbol",
    format: "Liga",
    type: "simple",
    status: "live",
    groups: 1,
    visibility: "public",
    teams: [
      { id: 1, name: "Riverside FC", short: "RIV", played: 4, won: 3, drawn: 1, lost: 0, gf: 10, ga: 4, points: 10 },
      { id: 2, name: "North United", short: "NOR", played: 4, won: 2, drawn: 2, lost: 0, gf: 7, ga: 4, points: 8 },
      { id: 3, name: "South Stars", short: "SOU", played: 4, won: 1, drawn: 3, lost: 0, gf: 6, ga: 5, points: 6 },
      { id: 4, name: "Westside FC", short: "WES", played: 4, won: 0, drawn: 3, lost: 1, gf: 3, ga: 5, points: 3 },
      { id: 5, name: "Central City", short: "CEN", played: 4, won: 1, drawn: 1, lost: 2, gf: 5, ga: 7, points: 4 },
      { id: 6, name: "East Rovers", short: "EAS", played: 4, won: 0, drawn: 2, lost: 2, gf: 2, ga: 8, points: 2 }
    ],
    matches: [
      { id: 1, home: "Riverside FC", away: "North United", homeScore: 2, awayScore: 1, round: "Jornada 4", date: "2026-10-18", status: "finished" },
      { id: 2, home: "South Stars", away: "Westside FC", homeScore: 1, awayScore: 1, round: "Jornada 4", date: "2026-10-18", status: "finished" },
      { id: 3, home: "Central City", away: "East Rovers", homeScore: 2, awayScore: 0, round: "Jornada 4", date: "2026-10-19", status: "finished" },
      { id: 4, home: "Riverside FC", away: "South Stars", homeScore: null, awayScore: null, round: "Jornada 5", date: "2026-10-25", status: "scheduled" },
      { id: 5, home: "North United", away: "Central City", homeScore: null, awayScore: null, round: "Jornada 5", date: "2026-10-25", status: "scheduled" },
      { id: 6, home: "Westside FC", away: "East Rovers", homeScore: null, awayScore: null, round: "Jornada 5", date: "2026-10-26", status: "scheduled" }
    ],
    players: [
      { name: "R. Santos", team: "Riverside FC", goals: 8, yellow: 1, red: 0, assists: 3 },
      { name: "G. Mendoza", team: "North United", goals: 5, yellow: 0, red: 0, assists: 2 },
      { name: "L. Vargas", team: "South Stars", goals: 4, yellow: 2, red: 0, assists: 1 },
      { name: "P. Álvarez", team: "Central City", goals: 3, yellow: 1, red: 0, assists: 0 },
      { name: "M. Torres", team: "Riverside FC", goals: 3, yellow: 0, red: 0, assists: 4 },
      { name: "J. Ruiz", team: "North United", goals: 2, yellow: 3, red: 1, assists: 1 }
    ]
  },
  {
    id: 2,
    name: "Copa Verano eSports",
    sport: "eSports",
    format: "Eliminatorias",
    type: "simple",
    status: "registration",
    groups: 1,
    visibility: "public",
    teams: [
      { id: 1, name: "Team Alpha", short: "ALP", played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
      { id: 2, name: "Team Beta", short: "BET", played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
      { id: 3, name: "Team Gamma", short: "GAM", played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
      { id: 4, name: "Team Delta", short: "DEL", played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 }
    ],
    matches: [],
    players: []
  }
];

let tournaments = [];
let onDataChange = null; // callback cuando cambian los datos

function setOnDataChange(fn) {
  onDataChange = fn;
}

function notify() {
  if (typeof onDataChange === 'function') onDataChange(tournaments);
}

// ----- LocalStorage -----
function loadLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) {
      tournaments = JSON.parse(raw);
      return;
    }
  } catch (e) {}
  tournaments = JSON.parse(JSON.stringify(DEFAULT_TOURNAMENTS));
  saveLocal();
}

function saveLocal() {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(tournaments));
  } catch (e) {
    console.warn('No se pudo guardar en localStorage', e);
  }
}

// ----- Firebase -----
async function initFirebase(config) {
  if (!config || !config.apiKey || config.apiKey === 'TU_API_KEY') {
    console.info('Firebase no configurado. Usando almacenamiento local.');
    USE_FIREBASE = false;
    loadLocal();
    notify();
    return false;
  }

  try {
    // firebase ya debe estar cargado por CDN (compat)
    if (typeof firebase === 'undefined') {
      console.error('Firebase SDK no cargado');
      loadLocal();
      notify();
      return false;
    }
    firebase.initializeApp(config);
    db = firebase.firestore();
    USE_FIREBASE = true;

    // Listener en tiempo real
    unsubscribeTournaments = db.collection('tournaments').onSnapshot(
      (snap) => {
        const list = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        // Si la colección está vacía, sembrar datos de ejemplo una vez
        if (list.length === 0) {
          seedFirebase();
          return;
        }
        // Normalizar id numérico si venía como string
        tournaments = list.map((t) => ({
          ...t,
          id: isNaN(t.id) ? t.id : Number(t.id)
        }));
        notify();
      },
      (err) => {
        console.error('Error Firestore:', err);
        loadLocal();
        notify();
      }
    );
    return true;
  } catch (e) {
    console.error('Error iniciando Firebase:', e);
    USE_FIREBASE = false;
    loadLocal();
    notify();
    return false;
  }
}

async function seedFirebase() {
  if (!db) return;
  const batch = db.batch();
  DEFAULT_TOURNAMENTS.forEach((t) => {
    const ref = db.collection('tournaments').doc(String(t.id));
    batch.set(ref, t);
  });
  await batch.commit();
  console.info('Datos de ejemplo cargados en Firestore');
}

async function saveTournament(tournament) {
  if (USE_FIREBASE && db) {
    const id = String(tournament.id);
    await db.collection('tournaments').doc(id).set(tournament);
  } else {
    const idx = tournaments.findIndex((t) => t.id === tournament.id);
    if (idx >= 0) tournaments[idx] = tournament;
    else tournaments.unshift(tournament);
    saveLocal();
    notify();
  }
}

async function deleteTournament(id) {
  if (USE_FIREBASE && db) {
    await db.collection('tournaments').doc(String(id)).delete();
  } else {
    tournaments = tournaments.filter((t) => t.id !== id);
    saveLocal();
    notify();
  }
}

async function saveAllTournaments(list) {
  tournaments = list;
  if (USE_FIREBASE && db) {
    const batch = db.batch();
    list.forEach((t) => {
      batch.set(db.collection('tournaments').doc(String(t.id)), t);
    });
    await batch.commit();
  } else {
    saveLocal();
    notify();
  }
}

function getTournaments() {
  return tournaments;
}

function setTournaments(list) {
  tournaments = list;
}
