/**
 * Utilità persistenza localStorage
 * TODO: Sostituire con sync backend quando disponibile
 */

import {
  CHAT_STORAGE_KEY,
  SOS_STORAGE_KEY,
  ALERTS_STORAGE_KEY,
  PLACES_STORAGE_KEY,
  GEOFENCE_STATE_KEY,
  GEOFENCE_EVENTS_KEY,
  MEMBERS_STORAGE_KEY,
  INVITES_STORAGE_KEY,
  CALL_HISTORY_STORAGE_KEY,
  APPOINTMENTS_STORAGE_KEY,
  EVENTS_STORAGE_KEY,
} from '../data/constants';

export function loadChat() {
  try {
    const s = localStorage.getItem(CHAT_STORAGE_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function saveChat(conversations) {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    // quota exceeded o storage non disponibile
  }
}

export function loadSosEvents() {
  try {
    const s = localStorage.getItem(SOS_STORAGE_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function saveSosEvents(events) {
  try {
    localStorage.setItem(SOS_STORAGE_KEY, JSON.stringify(events));
  } catch {
    //
  }
}

export function loadAlerts() {
  try {
    const s = localStorage.getItem(ALERTS_STORAGE_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function saveAlerts(alerts) {
  try {
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
  } catch {
    //
  }
}

export function loadPlaces() {
  try {
    const s = localStorage.getItem(PLACES_STORAGE_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function savePlaces(places) {
  try {
    localStorage.setItem(PLACES_STORAGE_KEY, JSON.stringify(places));
  } catch {
    //
  }
}

export function loadGeofenceState() {
  try {
    const s = localStorage.getItem(GEOFENCE_STATE_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function saveGeofenceState(state) {
  try {
    localStorage.setItem(GEOFENCE_STATE_KEY, JSON.stringify(state));
  } catch {
    //
  }
}

export function loadGeofenceEvents() {
  try {
    const s = localStorage.getItem(GEOFENCE_EVENTS_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function saveGeofenceEvents(events) {
  try {
    localStorage.setItem(GEOFENCE_EVENTS_KEY, JSON.stringify(events));
  } catch {
    //
  }
}

export function loadMembers() {
  try {
    const s = localStorage.getItem(MEMBERS_STORAGE_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function saveMembers(members) {
  try {
    localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(members));
  } catch {
    //
  }
}

export function loadInvites() {
  try {
    const s = localStorage.getItem(INVITES_STORAGE_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function saveInvites(invites) {
  try {
    localStorage.setItem(INVITES_STORAGE_KEY, JSON.stringify(invites));
  } catch {
    //
  }
}

export function loadCallHistory() {
  try {
    const s = localStorage.getItem(CALL_HISTORY_STORAGE_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function saveCallHistory(history) {
  try {
    localStorage.setItem(CALL_HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch {
    //
  }
}

export function loadAppointments() {
  try {
    const s = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function saveAppointments(appointments) {
  try {
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
  } catch {
    //
  }
}

export function loadEvents() {
  try {
    const s = localStorage.getItem(EVENTS_STORAGE_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function saveEvents(events) {
  try {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  } catch {
    //
  }
}
