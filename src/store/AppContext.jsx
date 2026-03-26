/**
 * AppContext - Stato globale Family Hart
 *
 * Centralizza: sessione, famiglia, posizioni, chat, SOS, avvisi
 * Socket.io per realtime, polling come fallback
 */

/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { familyGroup, currentUser } from '../data';
import { notifications } from '../data/mock/notifications';
import { sosHistory } from '../data/mock/sos';
import {
  DEMO_CREDENTIALS,
  SESSION_KEY,
  SOS_TYPES,
  CALL_TYPE,
  CALL_STATE,
  PARTICIPANT_STATE,
} from '../data/constants';
import { LOCATION_PERMISSION, isGeolocationSupported } from '../utils/location';
import {
  loadChat,
  saveChat,
  loadSosEvents,
  saveSosEvents,
  loadAlerts,
  saveAlerts,
  loadPlaces,
  savePlaces,
  loadGeofenceState,
  saveGeofenceState,
  loadGeofenceEvents,
  saveGeofenceEvents,
  loadMembers,
  saveMembers,
  loadInvites,
  saveInvites,
  loadCallHistory,
  saveCallHistory,
  loadAppointments,
  saveAppointments,
  loadEvents,
  saveEvents,
} from '../utils/storage';
import { getInitialConversations } from '../data/chatInitial';
import { getInitialMembers, getPermissionsForRole } from '../data/familyInitial';
import { getInitialPlaces } from '../data/geofenceInitial';
import { computeStateChanges } from '../services/geofence.service';
import { createCallPayload, createParticipant } from '../services/call.service';
import { canUser } from '../services/permissions.service';
import {
  requestAndGetPosition,
  watchUserPosition,
  simulateMembersUpdate,
} from './locationStore';
import { setToken, clearToken } from '../api/client.js';
import * as authApi from '../api/auth.api.js';
import * as familyApi from '../api/family.api.js';
import * as safePlacesApi from '../api/safePlaces.api.js';
import * as chatApi from '../api/chat.api.js';
import * as notificationsApi from '../api/notifications.api.js';
import * as locationApi from '../api/location.api.js';
import * as geofenceApi from '../api/geofence.api.js';
import * as appointmentsApi from '../api/appointments.api.js';
import * as familyEventsApi from '../api/familyEvents.api.js';
import * as socketService from '../services/socket.service.js';
import * as callRealtime from '../services/callRealtime.service.js';
import * as pushService from '../services/push.service.js';

const AppContext = createContext(null);
const SIMULATION_INTERVAL_MS = 12000;
const BACKEND_POLL_INTERVAL_MS = 15000;
const LOCATION_SOCKET_THROTTLE_MS = 8000;
const USER_POSITION_USER_ID = '1';

function loadUserFromStorage() {
  try {
    const saved = localStorage.getItem(SESSION_KEY);
    const data = saved ? JSON.parse(saved) : null;
    const user = data?.user || null;
    const hasToken = !!data?.token;
    return { user, hasToken };
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return { user: null, hasToken: false };
  }
}

function initMembers() {
  const saved = loadMembers();
  if (saved && Array.isArray(saved)) {
    return saved.map((m) => ({
      ...m,
      permissions: m.permissions || getPermissionsForRole(m.roleType),
    }));
  }
  return getInitialMembers();
}

function initLiveMembers(members) {
  return (members || initMembers()).map((m) => ({
    ...m,
    lastUpdateRaw: new Date(),
  }));
}

function initConversations(members) {
  const saved = loadChat();
  if (saved && typeof saved === 'object') return saved;
  const initial = getInitialConversations();
  (members || initMembers()).forEach((m) => {
    if (m.id !== USER_POSITION_USER_ID && !initial[m.id]) {
      initial[m.id] = [];
    }
  });
  return initial;
}

function initInvites() {
  const saved = loadInvites();
  return saved && Array.isArray(saved) ? saved : [];
}

function initCallHistory() {
  const saved = loadCallHistory();
  return saved && Array.isArray(saved) ? saved : [];
}

function initSosEvents() {
  const saved = loadSosEvents();
  if (saved && Array.isArray(saved)) return saved;
  return sosHistory;
}

function initPlaces() {
  const saved = loadPlaces();
  if (saved && Array.isArray(saved)) {
    return saved.map((p) => ({ ...p, memberIds: p.memberIds || [] }));
  }
  return getInitialPlaces();
}

function initGeofenceState() {
  const saved = loadGeofenceState();
  return saved && typeof saved === 'object' ? saved : {};
}

function initGeofenceEvents() {
  const saved = loadGeofenceEvents();
  return saved && Array.isArray(saved) ? saved : [];
}

function initAlerts() {
  const saved = loadAlerts();
  if (saved && Array.isArray(saved)) return saved;
  return notifications;
}

function initAppointments() {
  const saved = loadAppointments();
  return saved && Array.isArray(saved) ? saved : [];
}

function initFamilyEvents() {
  const saved = loadEvents();
  return saved && Array.isArray(saved) ? saved : [];
}

function createMessage(text, isOwn, conversationId, memberName = 'Tu') {
  const now = new Date();
  return {
    id: `m${Date.now()}`,
    memberId: USER_POSITION_USER_ID,
    memberName,
    text,
    time: now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
    timestamp: now.getTime(),
    isOwn,
    conversationId,
  };
}

function createAlert(type, title, message, icon = '📢') {
  const now = new Date();
  return {
    id: `a${Date.now()}`,
    type,
    title,
    message,
    time: now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
    timestamp: now.getTime(),
    read: false,
    icon,
  };
}

function createSosEvent(type, memberId, memberName, position) {
  const now = new Date();
  return {
    id: `sos${Date.now()}`,
    memberId,
    memberName,
    type,
    time: now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
    timestamp: now.getTime(),
    resolved: false,
    position: position ? { lat: position.lat, lng: position.lng } : null,
  };
}

const initialMembers = initMembers();

export function AppProvider({ children }) {
  const stored = loadUserFromStorage();
  const [user, setUser] = useState(stored.user);
  const [useBackend, setUseBackend] = useState(false);
  const [backendLoading, setBackendLoading] = useState(!!stored.hasToken);
  const [backendError, setBackendError] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [socketGraceDone, setSocketGraceDone] = useState(false);
  const [family] = useState({ group: familyGroup, members: [] });
  const [members, setMembers] = useState(initialMembers);
  const [invites, setInvites] = useState(initInvites);
  const [activeCall, setActiveCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callHistory, setCallHistory] = useState(initCallHistory);
  const [conversations, setConversations] = useState(() => initConversations(initialMembers));
  const [sosEvents, setSosEvents] = useState(initSosEvents);
  const [alerts, setAlerts] = useState(initAlerts);
  const [places, setPlaces] = useState(initPlaces);
  const [geofenceState, setGeofenceState] = useState(initGeofenceState);
  const [geofenceEvents, setGeofenceEvents] = useState(initGeofenceEvents);
  const [appointments, setAppointments] = useState(initAppointments);
  const [familyEvents, setFamilyEvents] = useState(initFamilyEvents);
  const [selectedMemberId, setSelectedMemberId] = useState(initialMembers[0]?.id || null);
  const [activeConversationId, setActiveConversationId] = useState('family');

  const [locationPermission, setLocationPermission] = useState(() =>
    !isGeolocationSupported() ? LOCATION_PERMISSION.UNAVAILABLE : LOCATION_PERMISSION.PROMPT
  );
  const [userPosition, setUserPosition] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [liveMembers, setLiveMembers] = useState(() => initLiveMembers(initialMembers));
  const watchIdRef = useRef(null);
  const userPositionRef = useRef(null);
  const prevBatteryRef = useRef({});
  const prevStatusRef = useRef({});
  const geofenceStateRef = useRef(initGeofenceState());
  const placesRef = useRef(places);
  const membersRef = useRef(members);
  const lastLocationEmitRef = useRef(0);

  useEffect(() => {
    userPositionRef.current = userPosition;
  }, [userPosition]);

  /* Restore session from token (backend) */
  useEffect(() => {
    if (!stored.hasToken) {
      setBackendLoading(false);
      return;
    }
    authApi.getCurrentUser()
      .then((res) => {
        const u = res.user;
        if (u) {
          setUser({
            id: u.id,
            name: u.name,
            email: u.email,
            avatar: u.avatar || '👤',
            role: u.role,
            roleType: u.roleType,
            familyId: u.familyId,
            permissions: u.permissions || [],
          });
          setUseBackend(true);
        }
      })
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setBackendLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  /* Socket.io: connect quando useBackend + user */
  useEffect(() => {
    if (user && useBackend) {
      socketService.connect();
      pushService.ensurePushSubscription().catch(() => {});
    } else {
      socketService.disconnect();
    }
    return () => socketService.disconnect();
  }, [user, useBackend]);

  useEffect(() => {
    if (!user || !useBackend) {
      setSocketConnected(false);
      setSocketGraceDone(false);
      return undefined;
    }
    const grace = setTimeout(() => setSocketGraceDone(true), 2800);
    const u1 = socketService.on('connect', () => setSocketConnected(true));
    const u2 = socketService.on('disconnect', () => setSocketConnected(false));
    return () => {
      clearTimeout(grace);
      u1();
      u2();
    };
  }, [user, useBackend]);

  const showSocketOfflineBanner = useMemo(
    () => !!(user && useBackend && socketGraceDone && !socketConnected && !backendError),
    [user, useBackend, socketGraceDone, socketConnected, backendError],
  );

  useEffect(() => {
    if (user) {
      const prev = (() => {
        try {
          const s = localStorage.getItem(SESSION_KEY);
          return s ? JSON.parse(s) : {};
        } catch {
          return {};
        }
      })();
      localStorage.setItem(SESSION_KEY, JSON.stringify({ ...prev, user }));
    } else {
      clearToken();
      localStorage.removeItem(SESSION_KEY);
    }
  }, [user]);

  useEffect(() => {
    saveChat(conversations);
  }, [conversations]);

  useEffect(() => {
    saveSosEvents(sosEvents);
  }, [sosEvents]);

  useEffect(() => {
    saveAlerts(alerts);
  }, [alerts]);

  useEffect(() => {
    savePlaces(places);
  }, [places]);

  useEffect(() => {
    saveGeofenceState(geofenceState);
  }, [geofenceState]);

  useEffect(() => {
    saveGeofenceEvents(geofenceEvents);
  }, [geofenceEvents]);

  useEffect(() => {
    geofenceStateRef.current = geofenceState;
  }, [geofenceState]);

  useEffect(() => {
    placesRef.current = places;
  }, [places]);

  useEffect(() => {
    membersRef.current = members;
  }, [members]);

  useEffect(() => {
    if (!useBackend) saveMembers(members);
  }, [members, useBackend]);

  /* Fetch da backend quando useBackend */
  useEffect(() => {
    if (!user || !useBackend) return;
    setBackendError(false);
    familyApi.getMembers()
      .then((res) => {
        const ms = (res.members || []).map((m) => ({
          ...m,
          permissions: m.permissions || getPermissionsForRole(m.roleType),
        }));
        setMembers(ms);
      })
      .catch(() => setBackendError(true));
  }, [user, useBackend]);

  useEffect(() => {
    if (!user || !useBackend) return;
    safePlacesApi.getSafePlaces()
      .then((res) => {
        const ps = (res.places || []).map((p) => ({ ...p, memberIds: p.memberIds || [] }));
        setPlaces(ps);
      })
      .catch(() => setBackendError(true));
  }, [user, useBackend]);

  useEffect(() => {
    if (!user || !useBackend) return;
    chatApi.getConversations()
      .then((res) => {
        if (res.conversations && typeof res.conversations === 'object') {
          setConversations(res.conversations);
        }
      })
      .catch(() => setBackendError(true));
  }, [user, useBackend]);

  useEffect(() => {
    if (!user || !useBackend) return;
    notificationsApi.getNotifications()
      .then((res) => {
        const list = res.notifications || res.alerts || [];
        setAlerts(list);
      })
      .catch(() => setBackendError(true));
  }, [user, useBackend]);

  useEffect(() => {
    if (!user || !useBackend) return;
    appointmentsApi.getAppointments()
      .then((res) => {
        if (res.ok && Array.isArray(res.appointments)) setAppointments(res.appointments);
      })
      .catch(() => setBackendError(true));
  }, [user, useBackend]);

  useEffect(() => {
    if (!user || !useBackend) return;
    familyEventsApi.getFamilyEvents()
      .then((res) => {
        if (res.ok && Array.isArray(res.events)) setFamilyEvents(res.events);
      })
      .catch(() => setBackendError(true));
  }, [user, useBackend]);

  const applyBackendLocations = useCallback((locations) => {
    if (!Array.isArray(locations) || locations.length === 0) return;
    const byMemberId = new Map(locations.map((l) => [String(l.memberId), l]));
    const now = new Date();
    setLiveMembers((prev) => prev.map((m) => {
      const loc = byMemberId.get(String(m.id));
      if (!loc) return m;
      const dt = loc.recordedAt ? new Date(loc.recordedAt) : now;
      return {
        ...m,
        lat: loc.latitude,
        lng: loc.longitude,
        battery: loc.batteryLevel ?? m.battery,
        status: loc.isMoving == null ? m.status : (loc.isMoving ? 'in movimento' : 'a casa'),
        lastUpdateRaw: dt,
        lastUpdate: dt.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      };
    }));
  }, []);

  const applySingleLocation = useCallback((loc) => {
    if (!loc?.memberId || loc.latitude == null || loc.longitude == null) return;
    const dt = loc.recordedAt ? new Date(loc.recordedAt) : new Date();
    setLiveMembers((prev) => prev.map((m) => {
      if (String(m.id) !== String(loc.memberId)) return m;
      return {
        ...m,
        lat: loc.latitude,
        lng: loc.longitude,
        battery: loc.batteryLevel ?? m.battery,
        status: loc.isMoving == null ? m.status : (loc.isMoving ? 'in movimento' : 'a casa'),
        lastUpdateRaw: dt,
        lastUpdate: dt.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      };
    }));
  }, []);

  /* Socket.io: listener realtime */
  useEffect(() => {
    if (!user || !useBackend) return;
    const unsub = [
      socketService.on('receive_message', ({ conversationId, message }) => {
        if (!conversationId || !message) return;
        setConversations((prev) => {
          const conv = prev[conversationId] || [];
          if (conv.some((m) => m.id === message.id)) return prev;
          return { ...prev, [conversationId]: [...conv, { ...message, isOwn: false }] };
        });
      }),
      socketService.on('receive_sos', (event) => {
        if (!event) return;
        setSosEvents((prev) => (prev.some((e) => e.id === event.id) ? prev : [event, ...prev]));
        setAlerts((prev) => [
          { id: `a${Date.now()}`, type: 'safety', title: `${event.memberName} - ${event.type}`, message: event.time, icon: '🆘', read: false },
          ...prev,
        ]);
      }),
      socketService.on('receive_location_update', applySingleLocation),
      socketService.on('receive_geofence_event', (e) => {
        if (!e) return;
        setGeofenceEvents((prev) => (prev.some((x) => x.id === e.id) ? prev : [{
          id: e.id,
          memberId: e.memberId,
          placeId: e.safePlaceId,
          type: e.eventType === 'enter' ? 'entry' : 'exit',
          timestamp: e.createdAt ? new Date(e.createdAt).getTime() : Date.now(),
          time: e.createdAt ? new Date(e.createdAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : '',
        }, ...prev]));
        setAlerts((prev) => [{
          id: `a${Date.now()}`,
          type: 'position',
          title: e.eventType === 'enter' ? `${e.memberName || 'Membro'} è arrivato` : `${e.memberName || 'Membro'} ha lasciato`,
          message: '',
          icon: e.eventType === 'enter' ? '📍' : '🚶',
          read: false,
        }, ...prev]);
      }),
      socketService.on('receive_notification', (n) => {
        if (!n) return;
        setAlerts((prev) => (prev.some((a) => a.id === n.id) ? prev : [{ ...n, id: n.id || `n${Date.now()}` }, ...prev]));
      }),
      socketService.on('appointment_created', (a) => {
        if (a) setAppointments((p) => (p.some((x) => x.id === a.id) ? p : [...p, a]));
      }),
      socketService.on('appointment_updated', (a) => {
        if (a) setAppointments((p) => p.map((x) => (x.id === a.id ? a : x)));
      }),
      socketService.on('appointment_deleted', ({ id }) => {
        if (id) setAppointments((p) => p.filter((x) => x.id !== id));
      }),
      socketService.on('event_created', (e) => {
        if (e) setFamilyEvents((p) => (p.some((x) => x.id === e.id) ? p : [...p, e]));
      }),
      socketService.on('event_updated', (e) => {
        if (e) setFamilyEvents((p) => p.map((x) => (x.id === e.id ? e : x)));
      }),
      socketService.on('event_deleted', ({ id }) => {
        if (id) setFamilyEvents((p) => p.filter((x) => x.id !== id));
      }),
      socketService.on('webrtc_call_start', (data) => {
        const memberId = user?.memberId || user?.id;
        if (String(data.targetId) !== String(memberId) && !data.isGroup) return;
        setActiveCall({
          id: data.callId,
          type: data.type || 'audio',
          targetId: data.callerId,
          targetName: data.callerName,
          callerId: data.callerId,
          callerName: data.callerName,
          isGroup: !!data.isGroup,
          direction: 'incoming',
          state: CALL_STATE.INCOMING,
          startTime: Date.now(),
          duration: 0,
          muted: false,
          speaker: true,
          videoOn: data.type === 'video',
        });
      }),
      socketService.on('webrtc_offer', (data) => {
        callRealtime.storePendingOffer(data.callId, data.fromId, data.sdp);
      }),
      socketService.on('webrtc_answer', (data) => {
        callRealtime.setRemoteAnswer(data.sdp).then(() => {
          setActiveCall((c) => (c?.id === data.callId ? { ...c, state: CALL_STATE.CONNECTED } : c));
        });
      }),
      socketService.on('webrtc_ice_candidate', (data) => {
        callRealtime.addRemoteIceCandidate(data.candidate, data.callId);
      }),
      socketService.on('webrtc_call_decline', (data) => {
        setCallHistory((prev) => prev.map((h) => (h.id === data.callId ? { ...h, outcome: 'declined' } : h)));
        setActiveCall((c) => (c?.id === data.callId ? { ...c, state: CALL_STATE.DECLINED } : c));
        setTimeout(() => {
          setActiveCall((x) => (x?.id === data.callId ? null : x));
          setLocalStream(null);
          setRemoteStream(null);
          callRealtime.endCall();
        }, 1500);
      }),
      socketService.on('webrtc_call_end', (data) => {
        callRealtime.handleRemoteCallEnd(data.callId);
        setActiveCall((c) => (c?.id === data.callId ? null : c));
        setLocalStream(null);
        setRemoteStream(null);
      }),
      socketService.on('webrtc_call_start_unreachable', () => {
        setActiveCall((c) => (c ? { ...c, state: CALL_STATE.UNAVAILABLE } : c));
        setTimeout(() => setActiveCall(null), 2000);
      }),
    ];
    return () => unsub.forEach((fn) => fn?.());
  }, [user, useBackend, applySingleLocation]);

  useEffect(() => {
    if (!user || !useBackend) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const [locRes, eventRes, aptRes, evtRes] = await Promise.all([
          locationApi.getFamilyPositions(),
          geofenceApi.getGeofenceEvents(100),
          appointmentsApi.getAppointments(),
          familyEventsApi.getFamilyEvents(),
        ]);
        if (cancelled) return;
        if (locRes.ok) applyBackendLocations(locRes.positions || []);
        if (eventRes.ok) {
          setGeofenceEvents((eventRes.events || []).map((e) => ({
            id: e.id,
            memberId: e.memberId,
            placeId: e.safePlaceId,
            type: e.eventType === 'enter' ? 'entry' : 'exit',
            timestamp: e.createdAt ? new Date(e.createdAt).getTime() : Date.now(),
            time: e.createdAt
              ? new Date(e.createdAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
              : '',
          })));
        }
        if (aptRes.ok && Array.isArray(aptRes.appointments)) setAppointments(aptRes.appointments);
        if (evtRes.ok && Array.isArray(evtRes.events)) setFamilyEvents(evtRes.events);
        setBackendError(!(locRes.ok && eventRes.ok && aptRes.ok && evtRes.ok));
      } catch {
        if (!cancelled) setBackendError(true);
      }
    };
    poll();
    const timer = setInterval(poll, BACKEND_POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [user, useBackend, applyBackendLocations]);

  useEffect(() => {
    saveInvites(invites);
  }, [invites]);

  useEffect(() => {
    saveCallHistory(callHistory);
  }, [callHistory]);

  useEffect(() => {
    if (!useBackend) saveAppointments(appointments);
  }, [appointments, useBackend]);

  useEffect(() => {
    if (!useBackend) saveEvents(familyEvents);
  }, [familyEvents, useBackend]);

  /** Sincronizza liveMembers quando members cambia (add/remove/update ruolo) */
  /* eslint-disable react-hooks/set-state-in-effect -- sync intenzionale members -> liveMembers */
  useEffect(() => {
    const ids = new Set(members.map((m) => m.id));
    const liveFields = ['lat', 'lng', 'status', 'battery', 'lastUpdate', 'lastUpdateRaw', 'location'];
    setLiveMembers((prev) => {
      const kept = prev.filter((m) => ids.has(m.id));
      const existingIds = new Set(kept.map((m) => m.id));
      const toAdd = members.filter((m) => !existingIds.has(m.id));
      return [
        ...kept.map((m) => {
          const base = members.find((b) => b.id === m.id);
          if (!base) return m;
          const liveData = Object.fromEntries(liveFields.map((k) => [k, m[k]]).filter(([, v]) => v !== undefined));
          return { ...base, ...liveData };
        }),
        ...toAdd.map((m) => ({ ...m, lastUpdateRaw: new Date() })),
      ];
    });
  }, [members]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const requestLocationPermission = useCallback(async () => {
    setLocationError(null);
    const result = await requestAndGetPosition();
    setLocationPermission(result.permission);
    if (result.position) setUserPosition(result.position);
    if (result.error) setLocationError(result.error);
    return result;
  }, []);

  const refreshUserPosition = useCallback(async () => {
    setLocationError(null);
    const result = await requestAndGetPosition();
    if (result.permission === LOCATION_PERMISSION.GRANTED && result.position) {
      setUserPosition(result.position);
      setLocationPermission(LOCATION_PERMISSION.GRANTED);
    }
    if (result.error) setLocationError(result.error);
    return result;
  }, []);

  useEffect(() => {
    if (!user || locationPermission !== LOCATION_PERMISSION.GRANTED) return;
    watchIdRef.current = watchUserPosition(
      setUserPosition,
      () => setLocationError('Errore aggiornamento posizione')
    );
    return () => {
      if (watchIdRef.current != null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [user, locationPermission]);

  useEffect(() => {
    if (!user || !useBackend || !userPosition) return;
    if (socketService.isConnected()) {
      const now = Date.now();
      if (now - lastLocationEmitRef.current < LOCATION_SOCKET_THROTTLE_MS) return;
      lastLocationEmitRef.current = now;
      socketService.updateLocation({
        latitude: userPosition.lat,
        longitude: userPosition.lng,
        accuracy: userPosition.accuracy,
        source: 'device',
        batteryLevel: userPosition.battery,
        isMoving: userPosition.isMoving,
      });
    } else {
      locationApi.sendPosition(userPosition.lat, userPosition.lng, {
        memberId: user.id,
        accuracy: userPosition.accuracy,
        source: 'device',
        recordedAt: userPosition.lastUpdate || new Date(),
      }).then((res) => {
        if (!res.ok) setBackendError(true);
      }).catch(() => setBackendError(true));
    }
  }, [user, useBackend, userPosition]);

  const sendMessage = useCallback(async (conversationId, text) => {
    if (useBackend) {
      if (socketService.isConnected()) {
        const res = await socketService.sendMessage(conversationId, text);
        if (res?.message) {
          const msg = { ...res.message, isOwn: true };
          setConversations((prev) => {
            const conv = prev[conversationId] || [];
            return { ...prev, [conversationId]: [...conv, msg] };
          });
        } else if (res?.error) {
          setBackendError(true);
        }
      } else {
        try {
          const res = await chatApi.sendMessage(conversationId, text);
          if (res.message) {
            const msg = { ...res.message, isOwn: true };
            setConversations((prev) => {
              const conv = prev[conversationId] || [];
              return { ...prev, [conversationId]: [...conv, msg] };
            });
          }
        } catch {
          setBackendError(true);
        }
      }
      return;
    }
    const member = membersRef.current.find((m) => m.id === USER_POSITION_USER_ID);
    const msg = createMessage(text, true, conversationId, member?.name || 'Tu');
    setConversations((prev) => {
      const conv = prev[conversationId] || [];
      return { ...prev, [conversationId]: [...conv, msg] };
    });
  }, [useBackend]);

  const addSosEvent = useCallback((type, memberId = USER_POSITION_USER_ID) => {
    const member = membersRef.current.find((m) => m.id === memberId) || { name: 'Utente' };
    const pos = userPositionRef.current;
    const event = createSosEvent(type, memberId, member.name, pos);
    setSosEvents((prev) => [event, ...prev]);
    const alert = createAlert(
      'safety',
      `${member.name} - ${type}`,
      `${type} inviato alle ${event.time}`,
      '🆘'
    );
    setAlerts((prev) => [alert, ...prev]);
    if (useBackend && socketService.isConnected()) {
      socketService.sendSos({
        memberName: member.name,
        type,
        position: pos ? { lat: pos.lat, lng: pos.lng } : null,
      });
    }
  }, [useBackend]);

  const resolveSosEvent = useCallback((eventId) => {
    setSosEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, resolved: true } : e))
    );
  }, []);

  const addAlert = useCallback((alert) => {
    setAlerts((prev) => [alert, ...prev]);
  }, []);

  const markAlertRead = useCallback(async (id) => {
    if (useBackend) {
      try {
        await notificationsApi.markAsRead(id);
        setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
      } catch {
        setBackendError(true);
      }
      return;
    }
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  }, [useBackend]);

  const addPlace = useCallback(async (place) => {
    if (useBackend) {
      try {
        const res = await safePlacesApi.addSafePlace(place);
        if (res.place) {
          setPlaces((prev) => [...prev, { ...res.place, memberIds: res.place.memberIds || [] }]);
        }
      } catch {
        /* fallback locale */
      }
      return;
    }
    const newPlace = {
      ...place,
      id: place.id || `sp${Date.now()}`,
      memberIds: place.memberIds || [],
    };
    setPlaces((prev) => [...prev, newPlace]);
  }, [useBackend]);

  const updatePlace = useCallback(async (placeId, updates) => {
    if (useBackend) {
      try {
        const res = await safePlacesApi.updateSafePlace(placeId, updates);
        if (res.place) {
          setPlaces((prev) =>
            prev.map((p) => (p.id === placeId ? { ...res.place, memberIds: res.place.memberIds || p.memberIds } : p))
          );
        }
      } catch {
        setBackendError(true);
      }
      return;
    }
    setPlaces((prev) =>
      prev.map((p) => (p.id === placeId ? { ...p, ...updates } : p))
    );
  }, [useBackend]);

  const removePlace = useCallback(async (placeId) => {
    if (useBackend) {
      try {
        await safePlacesApi.removeSafePlace(placeId);
        setPlaces((prev) => prev.filter((p) => p.id !== placeId));
        setGeofenceState((s) => {
          const next = { ...s };
          Object.keys(next).forEach((k) => {
            if (k.endsWith(`:${placeId}`)) delete next[k];
          });
          return next;
        });
      } catch {
        /* fallback locale */
      }
      return;
    }
    setPlaces((prev) => prev.filter((p) => p.id !== placeId));
    setGeofenceState((s) => {
      const next = { ...s };
      Object.keys(next).forEach((k) => {
        if (k.endsWith(`:${placeId}`)) delete next[k];
      });
      return next;
    });
  }, [useBackend]);

  const addMember = useCallback(async (memberData) => {
    if (useBackend) {
      try {
        const res = await familyApi.addMember(memberData);
        if (res.member) {
          const m = { ...res.member, permissions: res.member.permissions || getPermissionsForRole(res.member.roleType) };
          setMembers((p) => [...p, m]);
          setConversations((c) => ({ ...c, [m.id]: [] }));
        }
      } catch {
        setBackendError(true);
      }
      return;
    }
    const prev = membersRef.current;
    const nextId = String(Math.max(0, ...prev.map((m) => parseInt(m.id, 10) || 0), 0) + 1);
    const roleType = memberData.roleType || 'child';
    const newMember = {
      id: nextId,
      name: memberData.name || 'Nuovo',
      surname: memberData.surname || '',
      role: memberData.role || 'Membro',
      roleType,
      email: memberData.email || '',
      phone: memberData.phone || '',
      avatar: memberData.avatar || '👤',
      accountStatus: 'active',
      locationSharingEnabled: true,
      status: 'in movimento',
      battery: 80,
      lastUpdate: 'ora',
      location: '',
      lat: 45.4642,
      lng: 9.19,
      color: '#6B7280',
      permissions: getPermissionsForRole(roleType),
    };
    setMembers((p) => [...p, newMember]);
    setConversations((c) => ({ ...c, [nextId]: [] }));
  }, [useBackend]);

  const updateMember = useCallback(async (memberId, updates) => {
    if (useBackend) {
      try {
        const res = await familyApi.updateMember(memberId, updates);
        if (res.member) {
          const m = { ...res.member, permissions: res.member.permissions || getPermissionsForRole(res.member.roleType) };
          setMembers((prev) => prev.map((x) => (x.id === memberId ? m : x)));
        }
      } catch {
        /* fallback locale */
      }
      return;
    }
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? { ...m, ...updates, permissions: updates.roleType ? getPermissionsForRole(updates.roleType) : m.permissions }
          : m
      )
    );
  }, [useBackend]);

  const updateMemberRole = useCallback((memberId, roleType) => {
    updateMember(memberId, { roleType, permissions: getPermissionsForRole(roleType) });
  }, [updateMember]);

  const removeMember = useCallback(async (memberId) => {
    if (useBackend) {
      try {
        await familyApi.removeMember(memberId);
        setMembers((prev) => prev.filter((m) => m.id !== memberId));
        setConversations((prev) => {
          const next = { ...prev };
          delete next[memberId];
          return next;
        });
        setPlaces((prev) =>
          prev.map((p) => ({ ...p, memberIds: (p.memberIds || []).filter((id) => id !== memberId) }))
        );
        if (selectedMemberId === memberId) {
          setSelectedMemberId(membersRef.current.find((m) => m.id !== memberId)?.id || null);
        }
      } catch {
        setBackendError(true);
      }
      return;
    }
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    setConversations((prev) => {
      const next = { ...prev };
      delete next[memberId];
      return next;
    });
    setPlaces((prev) =>
      prev.map((p) => ({ ...p, memberIds: (p.memberIds || []).filter((id) => id !== memberId) }))
    );
    if (selectedMemberId === memberId) {
      setSelectedMemberId(membersRef.current.find((m) => m.id !== memberId)?.id || null);
    }
  }, [selectedMemberId, useBackend]);

  const toggleLocationSharing = useCallback(async (memberId) => {
    if (useBackend) {
      const member = membersRef.current.find((m) => m.id === memberId);
      if (!member) return;
      const next = !member.locationSharingEnabled;
      try {
        await familyApi.updateMember(memberId, { locationSharingEnabled: next });
        setMembers((prev) =>
          prev.map((m) => (m.id === memberId ? { ...m, locationSharingEnabled: next } : m))
        );
      } catch {
        setBackendError(true);
      }
      return;
    }
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, locationSharingEnabled: !m.locationSharingEnabled } : m))
    );
  }, [useBackend]);

  const createInvite = useCallback((inviteData) => {
    const invite = {
      id: `inv${Date.now()}`,
      name: inviteData.name || '',
      surname: inviteData.surname || '',
      roleType: inviteData.roleType || 'child',
      email: inviteData.email || '',
      phone: inviteData.phone || '',
      status: 'pending',
      createdAt: Date.now(),
    };
    setInvites((prev) => [invite, ...prev]);
  }, []);

  const acceptInvite = useCallback(async (inviteId) => {
    const invite = invites.find((i) => i.id === inviteId);
    if (!invite) return;
    await addMember({
      name: invite.name,
      surname: invite.surname,
      roleType: invite.roleType,
      email: invite.email,
      phone: invite.phone,
    });
    setInvites((prev) => prev.filter((i) => i.id !== inviteId));
  }, [invites, addMember]);

  const declineInvite = useCallback((inviteId) => {
    setInvites((prev) => prev.filter((i) => i.id !== inviteId));
  }, []);

  const addAppointment = useCallback(async (data) => {
    if (useBackend) {
      try {
        const res = await appointmentsApi.createAppointment(data);
        if (res.ok && res.appointment) setAppointments((p) => [...p, res.appointment]);
      } catch {
        setBackendError(true);
      }
      return;
    }
    const apt = { id: `apt${Date.now()}`, ...data, assignedMembers: data.assignedMembers || [], createdAt: Date.now(), updatedAt: Date.now() };
    setAppointments((p) => [...p, apt]);
  }, [useBackend]);

  const updateAppointment = useCallback(async (id, updates) => {
    if (useBackend) {
      try {
        const res = await appointmentsApi.updateAppointment(id, updates);
        if (res.ok && res.appointment) setAppointments((p) => p.map((a) => (a.id === id ? res.appointment : a)));
      } catch {
        setBackendError(true);
      }
      return;
    }
    setAppointments((p) => p.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: Date.now() } : a)));
  }, [useBackend]);

  const removeAppointment = useCallback(async (id) => {
    if (useBackend) {
      try {
        await appointmentsApi.deleteAppointment(id);
        setAppointments((p) => p.filter((a) => a.id !== id));
      } catch {
        setBackendError(true);
      }
      return;
    }
    setAppointments((p) => p.filter((a) => a.id !== id));
  }, [useBackend]);

  const addFamilyEvent = useCallback(async (data) => {
    if (useBackend) {
      try {
        const res = await familyEventsApi.createFamilyEvent(data);
        if (res.ok && res.event) setFamilyEvents((p) => [...p, res.event]);
      } catch {
        setBackendError(true);
      }
      return;
    }
    const evt = { id: `evt${Date.now()}`, ...data, participants: data.participants || [], createdAt: Date.now(), updatedAt: Date.now() };
    setFamilyEvents((p) => [...p, evt]);
  }, [useBackend]);

  const updateFamilyEvent = useCallback(async (id, updates) => {
    if (useBackend) {
      try {
        const res = await familyEventsApi.updateFamilyEvent(id, updates);
        if (res.ok && res.event) setFamilyEvents((p) => p.map((e) => (e.id === id ? res.event : e)));
      } catch {
        setBackendError(true);
      }
      return;
    }
    setFamilyEvents((p) => p.map((e) => (e.id === id ? { ...e, ...updates, updatedAt: Date.now() } : e)));
  }, [useBackend]);

  const removeFamilyEvent = useCallback(async (id) => {
    if (useBackend) {
      try {
        await familyEventsApi.deleteFamilyEvent(id);
        setFamilyEvents((p) => p.filter((e) => e.id !== id));
      } catch {
        setBackendError(true);
      }
      return;
    }
    setFamilyEvents((p) => p.filter((e) => e.id !== id));
  }, [useBackend]);

  const useWebRTC = useBackend && socketService.isConnected() && (user?.memberId || user?.id);

  const finishCall = useCallback((outcome = 'cancelled') => {
    setActiveCall((c) => {
      if (!c) return null;
      const duration = Math.floor((Date.now() - c.startTime) / 1000);
      setCallHistory((prev) =>
        prev.map((h) => (h.id === c.id ? { ...h, duration, outcome } : h))
      );
      return null;
    });
    setLocalStream(null);
    setRemoteStream(null);
    callRealtime.endCall();
  }, []);

  const startCall = useCallback(({ type = CALL_TYPE.AUDIO, targetId, targetName, isGroup = false }, members = []) => {
    if (activeCall) return;
    const filtered = (members || []).filter((m) => m.id !== USER_POSITION_USER_ID);
    const participants = isGroup
      ? filtered.map((m, i) => createParticipant(m, i === 0 ? PARTICIPANT_STATE.IN_CALL : PARTICIPANT_STATE.ONLINE))
      : [];
    const call = createCallPayload({
      type,
      targetId: targetId || 'family',
      targetName: targetName || 'Famiglia',
      isGroup,
      participants,
    });
    setActiveCall(call);
    setCallHistory((prev) => [
      { id: call.id, targetName: call.targetName, type: call.type, startTime: call.startTime, duration: 0, outcome: 'in_progress' },
      ...prev.slice(0, 99),
    ]);

    if (useWebRTC && !isGroup) {
      const memberId = user?.memberId || user?.id;
      callRealtime.startOutgoingCall(
        { callId: call.id, targetId, targetName, type, isGroup: false },
        { memberId, callerName: user?.name || 'Tu' },
        {
          onRemoteStream: (stream) => setRemoteStream(stream),
          onConnected: () => setActiveCall((c) => (c?.id === call.id ? { ...c, state: CALL_STATE.CONNECTED } : c)),
          onConnectionFailed: () => setActiveCall((c) => (c?.id === call.id ? { ...c, state: CALL_STATE.FAILED } : c)),
        }
      ).then(() => {
        setLocalStream(callRealtime.getLocalStream());
        setActiveCall((c) => (c?.id === call.id ? { ...c, state: CALL_STATE.RINGING } : c));
      }).catch((err) => {
        if (err?.code === 'PERMISSION_DENIED') {
          setActiveCall((c) => (c?.id === call.id ? { ...c, state: CALL_STATE.PERMISSION_DENIED } : c));
        } else {
          finishCall('cancelled');
        }
      });
    } else {
      setTimeout(() => setActiveCall((c) => (c?.id === call.id ? { ...c, state: CALL_STATE.RINGING } : c)), 800);
      setTimeout(() => setActiveCall((c) => (c?.id === call.id ? { ...c, state: CALL_STATE.CONNECTED } : c)), 2500);
    }
  }, [activeCall, useWebRTC, user, finishCall]);

  const endCall = useCallback(() => {
    setActiveCall((c) => {
      if (!c) return null;
      const duration = Math.floor((Date.now() - c.startTime) / 1000);
      const outcome = c.state === CALL_STATE.CONNECTED ? 'completed' : c.state === CALL_STATE.RINGING ? 'no_answer' : 'cancelled';
      setCallHistory((prev) => prev.map((h) => (h.id === c.id ? { ...h, duration, outcome } : h)));
      return null;
    });
    setLocalStream(null);
    setRemoteStream(null);
    callRealtime.endCall();
  }, []);

  const acceptCall = useCallback(() => {
    const c = activeCall;
    if (!c || c.state !== CALL_STATE.INCOMING) return;
    const memberId = user?.memberId || user?.id;
    callRealtime.acceptIncomingCall(
      c.id,
      c.callerId,
      c.type || 'audio',
      memberId,
      {
        onRemoteStream: (stream) => setRemoteStream(stream),
        onConnected: () => setActiveCall((x) => (x?.id === c.id ? { ...x, state: CALL_STATE.CONNECTED } : x)),
        onConnectionFailed: () => setActiveCall((x) => (x?.id === c.id ? { ...x, state: CALL_STATE.FAILED } : x)),
      }
    ).then(() => {
      setLocalStream(callRealtime.getLocalStream());
      setActiveCall((x) => (x?.id === c.id ? { ...x, state: CALL_STATE.CONNECTING } : x));
    }).catch((err) => {
      if (err?.code === 'PERMISSION_DENIED') {
        setActiveCall((x) => (x?.id === c.id ? { ...x, state: CALL_STATE.PERMISSION_DENIED } : x));
      } else {
        setActiveCall(null);
      }
    });
  }, [activeCall, user]);

  const declineCall = useCallback(() => {
    const c = activeCall;
    if (!c || c.state !== CALL_STATE.INCOMING) return;
    callRealtime.declineCall(c.id, c.callerId);
    setActiveCall(null);
  }, [activeCall]);

  const updateCallState = useCallback((updates) => {
    setActiveCall((c) => (c ? { ...c, ...updates } : null));
  }, []);

  const toggleCallMute = useCallback(() => {
    setActiveCall((c) => {
      if (!c) return null;
      const next = !c.muted;
      if (callRealtime.isInCall()) callRealtime.toggleMute(next);
      return { ...c, muted: next };
    });
  }, []);

  const toggleCallSpeaker = useCallback(() => {
    setActiveCall((c) => (c ? { ...c, speaker: !c.speaker } : null));
  }, []);

  const toggleCallVideo = useCallback(() => {
    setActiveCall((c) => {
      if (!c) return null;
      const next = !c.videoOn;
      if (callRealtime.isInCall()) callRealtime.toggleVideo(next);
      return { ...c, videoOn: next };
    });
  }, []);

  useEffect(() => {
    if (!activeCall || activeCall.state !== CALL_STATE.CONNECTED) return;
    const t = setInterval(() => {
      setActiveCall((c) => (c?.state === CALL_STATE.CONNECTED ? { ...c, duration: Math.floor((Date.now() - c.startTime) / 1000) } : c));
    }, 1000);
    return () => clearInterval(t);
  }, [activeCall]);

  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      const pos = userPositionRef.current;
      const currentPlaces = placesRef.current;
      setLiveMembers((prev) => {
        const updated = useBackend ? [...prev] : simulateMembersUpdate(prev);
        let next = updated;
        if (pos && user?.id === USER_POSITION_USER_ID) {
          next = updated.map((m) =>
            m.id === USER_POSITION_USER_ID
              ? { ...m, lat: pos.lat, lng: pos.lng, lastUpdate: pos.lastUpdateText, lastUpdateRaw: pos.lastUpdate }
              : m
          );
        }
        const newAlerts = [];
        next.forEach((m) => {
          if (m.battery <= 15 && (prevBatteryRef.current[m.id] ?? 100) > 15) {
            newAlerts.push(
              createAlert('battery', `${m.name} batteria al ${m.battery}%`, 'Considera di ricaricare', '🔋')
            );
          }
          if (m.status !== (prevStatusRef.current[m.id] || '')) {
            if (prevStatusRef.current[m.id]) {
              newAlerts.push(createAlert('position', `${m.name} - ${m.status}`, m.location || '', '📍'));
            }
            prevStatusRef.current[m.id] = m.status;
          }
          prevBatteryRef.current[m.id] = m.battery;
        });
        if (newAlerts.length) setAlerts((a) => [...newAlerts, ...a]);
        return next;
      });

      // Geofence: controlla entrata/uscita dopo aggiornamento membri
      setLiveMembers((curr) => {
        const { changes, nextState } = computeStateChanges(
          curr,
          currentPlaces,
          geofenceStateRef.current
        );
        if (changes.length > 0) {
          setGeofenceState(nextState);
          const now = new Date();
          changes.forEach((c) => {
            const event = {
              id: `gf${Date.now()}-${c.memberId}-${c.placeId}`,
              memberId: c.memberId,
              memberName: c.memberName,
              placeId: c.placeId,
              placeName: c.placeName,
              type: c.type,
              time: now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
              timestamp: now.getTime(),
            };
            setGeofenceEvents((e) => [event, ...e]);
            if (useBackend) {
              const payload = {
                memberId: c.memberId,
                safePlaceId: c.placeId,
                eventType: c.type === 'entry' ? 'enter' : 'exit',
                createdAt: new Date(event.timestamp).toISOString(),
              };
              const isCurrentUser = String(c.memberId) === String(user?.id);
              if (isCurrentUser && socketService.isConnected()) {
                socketService.geofenceEvent({ safePlaceId: c.placeId, eventType: payload.eventType });
              } else {
                geofenceApi.createGeofenceEvent(payload).then((res) => {
                  if (!res.ok) setBackendError(true);
                }).catch(() => setBackendError(true));
              }
            }
            if (c.notify) {
              const title =
                c.type === 'entry'
                  ? `${c.memberName} è arrivat${/a$/.test(c.memberName) ? 'a' : 'o'} a ${c.placeName}`
                  : `${c.memberName} ha lasciato ${c.placeName}`;
              setAlerts((a) => [
                createAlert('position', title, event.time, c.type === 'entry' ? '📍' : '🚶'),
                ...a,
              ]);
            }
          });
        } else if (Object.keys(nextState).length > 0) {
          setGeofenceState(nextState);
        }
        return curr;
      });
    }, SIMULATION_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [user, useBackend]);

  const login = useCallback(async (email, password) => {
    try {
      const res = await authApi.login(email?.trim(), password);
      if (res.user && res.token) {
        setToken(res.token);
        setUser({
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          avatar: res.user.avatar || '👤',
          role: res.user.role,
          roleType: res.user.roleType,
          familyId: res.user.familyId,
          permissions: res.user.permissions || [],
        });
        setUseBackend(true);
        setLiveMembers(() => initLiveMembers(membersRef.current));
        return { success: true };
      }
    } catch (err) {
      if (err.offline) {
        /* fallback locale */
      } else {
        return { success: false, error: err.message || 'Email o password non corretti' };
      }
    }
    const ok =
      email?.toLowerCase().trim() === DEMO_CREDENTIALS.email &&
      password === DEMO_CREDENTIALS.password;
    if (ok) {
      setUser(currentUser);
      setUseBackend(false);
      setLiveMembers(() => initLiveMembers(membersRef.current));
      return { success: true };
    }
    return { success: false, error: 'Email o password non corretti' };
  }, []);

  const logout = useCallback(async () => {
    if (useBackend) {
      try {
        await authApi.logout();
      } catch {
        clearToken();
      }
    }
    setUser(null);
    setUseBackend(false);
    setUserPosition(null);
    setLocationError(null);
    setLocationPermission(isGeolocationSupported() ? LOCATION_PERMISSION.PROMPT : LOCATION_PERMISSION.UNAVAILABLE);
    setSelectedMemberId(membersRef.current[0]?.id || null);
  }, [useBackend]);

  const selectMember = useCallback((id) => setSelectedMemberId(id), []);

  const selectedMember = liveMembers.find((m) => m.id === selectedMemberId) || liveMembers[0];

  const activeMessages = conversations[activeConversationId] || [];

  const currentMember = user ? liveMembers.find((m) => m.id === user.id) : null;
  const userWithPermissions = user
    ? { ...user, permissions: currentMember?.permissions || getPermissionsForRole(user.roleType) }
    : null;

  const value = {
    user: userWithPermissions || user,
    family: { ...family, members: liveMembers },
    members: liveMembers,
    conversations,
    activeConversationId,
    setActiveConversationId,
    activeMessages,
    sosEvents,
    alerts,
    places,
    appointments,
    familyEvents,
    geofenceEvents,
    selectedMemberId,
    selectedMember,
    login,
    logout,
    selectMember,
    sendMessage,
    addSosEvent,
    resolveSosEvent,
    addAlert,
    markAlertRead,
    addPlace,
    updatePlace,
    removePlace,
    membersBase: members,
    invites,
    addMember,
    updateMember,
    removeMember,
    updateMemberRole,
    toggleLocationSharing,
    createInvite,
    acceptInvite,
    declineInvite,
    activeCall,
    callHistory,
    startCall,
    endCall,
    acceptCall,
    declineCall,
    updateCallState,
    toggleCallMute,
    toggleCallSpeaker,
    toggleCallVideo,
    localStream,
    remoteStream,
    canUser: (perm) => canUser(userWithPermissions || user, perm),
    backendLoading,
    backendError,
    showSocketOfflineBanner,
    useBackend,
    refreshBackendData: useCallback(() => {
      if (!user || !useBackend) return;
      setBackendError(false);
      Promise.all([
        familyApi.getMembers(),
        safePlacesApi.getSafePlaces(),
        chatApi.getConversations(),
        notificationsApi.getNotifications(),
        locationApi.getFamilyPositions(),
        geofenceApi.getGeofenceEvents(100),
        appointmentsApi.getAppointments(),
        familyEventsApi.getFamilyEvents(),
      ]).then(([mRes, pRes, cRes, nRes, lRes, gRes, aptRes, evtRes]) => {
        setMembers((mRes.members || []).map((m) => ({ ...m, permissions: m.permissions || getPermissionsForRole(m.roleType) })));
        setPlaces((pRes.places || []).map((p) => ({ ...p, memberIds: p.memberIds || [] })));
        if (cRes.conversations && typeof cRes.conversations === 'object') setConversations(cRes.conversations);
        setAlerts(nRes.notifications || nRes.alerts || []);
        if (lRes.ok) applyBackendLocations(lRes.positions || []);
        if (gRes.ok) {
          setGeofenceEvents((gRes.events || []).map((e) => ({
            id: e.id,
            memberId: e.memberId,
            placeId: e.safePlaceId,
            type: e.eventType === 'enter' ? 'entry' : 'exit',
            timestamp: e.createdAt ? new Date(e.createdAt).getTime() : Date.now(),
            time: e.createdAt
              ? new Date(e.createdAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
              : '',
          })));
        }
        if (aptRes.ok && Array.isArray(aptRes.appointments)) setAppointments(aptRes.appointments);
        if (evtRes.ok && Array.isArray(evtRes.events)) setFamilyEvents(evtRes.events);
      }).catch(() => setBackendError(true));
    }, [user, useBackend, applyBackendLocations]),
    setPlaces,
    isAuthenticated: !!user,
    locationPermission,
    locationError,
    userPosition,
    requestLocationPermission,
    refreshUserPosition,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve essere usato dentro AppProvider');
  return ctx;
}
