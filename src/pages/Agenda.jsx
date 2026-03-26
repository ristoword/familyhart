/**
 * Agenda - Appuntamenti & Eventi famiglia
 * Collegato allo stato centrale, backend reale con fallback locale
 */

import { useState } from 'react';
import BottomNav from '../components/BottomNav';
import { useApp } from '../store/AppContext';
import './Agenda.css';

const APT_CATEGORIES = {
  health: 'Salute',
  school: 'Scuola',
  sport: 'Sport',
  work: 'Lavoro',
  other: 'Altro',
};

const EVENT_TYPES = {
  birthday: 'Compleanno',
  family: 'Famiglia',
  school: 'Scuola',
  trip: 'Gita',
  other: 'Altro',
};

function formatDate(str) {
  if (!str) return '-';
  const d = new Date(str + 'T12:00:00');
  return d.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatTime(s) {
  if (!s) return '';
  return s;
}

export default function Agenda() {
  const { members, appointments, familyEvents, addAppointment, updateAppointment, removeAppointment, addFamilyEvent, updateFamilyEvent, removeFamilyEvent } = useApp();

  const [activeTab, setActiveTab] = useState('appointments');
  const [showAptForm, setShowAptForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingAptId, setEditingAptId] = useState(null);
  const [editingEventId, setEditingEventId] = useState(null);

  const [aptForm, setAptForm] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().slice(0, 10),
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    assignedMembers: [],
    category: 'other',
    reminderEnabled: true,
  });

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    eventDate: new Date().toISOString().slice(0, 10),
    startTime: '',
    endTime: '',
    location: '',
    eventType: 'other',
    participants: [],
    isAllDay: false,
    reminderEnabled: true,
  });

  const membersList = members || [];

  const resetAptForm = () => {
    setAptForm({
      title: '',
      description: '',
      date: new Date().toISOString().slice(0, 10),
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      assignedMembers: [],
      category: 'other',
      reminderEnabled: true,
    });
    setShowAptForm(false);
    setEditingAptId(null);
  };

  const resetEventForm = () => {
    setEventForm({
      title: '',
      description: '',
      eventDate: new Date().toISOString().slice(0, 10),
      startTime: '',
      endTime: '',
      location: '',
      eventType: 'other',
      participants: [],
      isAllDay: false,
      reminderEnabled: true,
    });
    setShowEventForm(false);
    setEditingEventId(null);
  };

  const handleSaveAppointment = (e) => {
    e.preventDefault();
    if (!aptForm.title.trim()) return;
    const data = {
      title: aptForm.title.trim(),
      description: aptForm.description.trim(),
      date: aptForm.date,
      startTime: aptForm.startTime,
      endTime: aptForm.endTime,
      location: aptForm.location.trim(),
      assignedMembers: aptForm.assignedMembers,
      category: aptForm.category,
      reminderEnabled: aptForm.reminderEnabled,
    };
    if (editingAptId) {
      updateAppointment(editingAptId, data);
    } else {
      addAppointment(data);
    }
    resetAptForm();
  };

  const handleSaveEvent = (e) => {
    e.preventDefault();
    if (!eventForm.title.trim()) return;
    const data = {
      title: eventForm.title.trim(),
      description: eventForm.description.trim(),
      eventDate: eventForm.eventDate,
      startTime: eventForm.startTime,
      endTime: eventForm.endTime,
      location: eventForm.location.trim(),
      eventType: eventForm.eventType,
      participants: eventForm.participants,
      isAllDay: eventForm.isAllDay,
      reminderEnabled: eventForm.reminderEnabled,
    };
    if (editingEventId) {
      updateFamilyEvent(editingEventId, data);
    } else {
      addFamilyEvent(data);
    }
    resetEventForm();
  };

  const handleEditAppointment = (apt) => {
    setEditingAptId(apt.id);
    setAptForm({
      title: apt.title || '',
      description: apt.description || '',
      date: apt.date || new Date().toISOString().slice(0, 10),
      startTime: apt.startTime || '09:00',
      endTime: apt.endTime || '10:00',
      location: apt.location || '',
      assignedMembers: Array.isArray(apt.assignedMembers) ? apt.assignedMembers : [],
      category: apt.category || 'other',
      reminderEnabled: apt.reminderEnabled !== false,
    });
    setShowAptForm(true);
  };

  const handleEditEvent = (evt) => {
    setEditingEventId(evt.id);
    setEventForm({
      title: evt.title || '',
      description: evt.description || '',
      eventDate: evt.eventDate || new Date().toISOString().slice(0, 10),
      startTime: evt.startTime || '',
      endTime: evt.endTime || '',
      location: evt.location || '',
      eventType: evt.eventType || 'other',
      participants: Array.isArray(evt.participants) ? evt.participants : [],
      isAllDay: !!evt.isAllDay,
      reminderEnabled: evt.reminderEnabled !== false,
    });
    setShowEventForm(true);
  };

  const toggleAptMember = (id) => {
    setAptForm((f) => ({
      ...f,
      assignedMembers: f.assignedMembers.includes(id)
        ? f.assignedMembers.filter((m) => m !== id)
        : [...f.assignedMembers, id],
    }));
  };

  const toggleEventMember = (id) => {
    setEventForm((f) => ({
      ...f,
      participants: f.participants.includes(id)
        ? f.participants.filter((m) => m !== id)
        : [...f.participants, id],
    }));
  };

  const getMemberNames = (ids) => {
    if (!ids?.length) return '—';
    return ids
      .map((id) => membersList.find((m) => m.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const sortedAppointments = [...(appointments || [])].sort((a, b) => {
    const da = a.date || '';
    const db = b.date || '';
    if (da !== db) return da.localeCompare(db);
    return (a.startTime || '').localeCompare(b.startTime || '');
  });

  const sortedEvents = [...(familyEvents || [])].sort((a, b) => {
    const da = a.eventDate || '';
    const db = b.eventDate || '';
    return da.localeCompare(db);
  });

  return (
    <div className="agenda-page">
      <header className="page-header">
        <h1>Agenda famiglia</h1>
        <p className="header-subtitle">Appuntamenti & eventi</p>
      </header>

      <div className="agenda-tabs">
        <button
          type="button"
          className={`agenda-tab ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          📅 Appuntamenti
        </button>
        <button
          type="button"
          className={`agenda-tab ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          🎉 Eventi
        </button>
      </div>

      {activeTab === 'appointments' && (
        <section className="agenda-section">
          {showAptForm ? (
            <form className="agenda-form" onSubmit={handleSaveAppointment}>
              <h4>{editingAptId ? 'Modifica appuntamento' : 'Nuovo appuntamento'}</h4>
              <input
                type="text"
                placeholder="Titolo *"
                value={aptForm.title}
                onChange={(e) => setAptForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
              <input
                type="text"
                placeholder="Descrizione"
                value={aptForm.description}
                onChange={(e) => setAptForm((f) => ({ ...f, description: e.target.value }))}
              />
              <input
                type="date"
                value={aptForm.date}
                onChange={(e) => setAptForm((f) => ({ ...f, date: e.target.value }))}
                required
              />
              <div className="form-row">
                <input
                  type="time"
                  placeholder="Da"
                  value={aptForm.startTime}
                  onChange={(e) => setAptForm((f) => ({ ...f, startTime: e.target.value }))}
                />
                <input
                  type="time"
                  placeholder="A"
                  value={aptForm.endTime}
                  onChange={(e) => setAptForm((f) => ({ ...f, endTime: e.target.value }))}
                />
              </div>
              <input
                type="text"
                placeholder="Luogo"
                value={aptForm.location}
                onChange={(e) => setAptForm((f) => ({ ...f, location: e.target.value }))}
              />
              <select
                value={aptForm.category}
                onChange={(e) => setAptForm((f) => ({ ...f, category: e.target.value }))}
              >
                {Object.entries(APT_CATEGORIES).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <div className="form-member-list">
                <span className="form-label">Membri coinvolti</span>
                {membersList.map((m) => (
                  <label key={m.id} className="form-check">
                    <input
                      type="checkbox"
                      checked={aptForm.assignedMembers.includes(m.id)}
                      onChange={() => toggleAptMember(m.id)}
                    />
                    <span>{m.avatar} {m.name}</span>
                  </label>
                ))}
              </div>
              <label className="form-check">
                <input
                  type="checkbox"
                  checked={aptForm.reminderEnabled}
                  onChange={(e) => setAptForm((f) => ({ ...f, reminderEnabled: e.target.checked }))}
                />
                <span>Promemoria</span>
              </label>
              <div className="form-actions">
                <button type="submit" className="fh-btn fh-btn-primary">Salva</button>
                <button type="button" className="fh-btn fh-btn-secondary" onClick={resetAptForm}>Annulla</button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              className="fh-btn fh-btn-primary btn-add"
              onClick={() => {
                resetAptForm();
                setShowAptForm(true);
              }}
            >
              + Nuovo appuntamento
            </button>
          )}

          <div className="agenda-list">
            {sortedAppointments.length === 0 ? (
              <p className="agenda-empty">Nessun appuntamento</p>
            ) : (
              sortedAppointments.map((apt) => (
                <div key={apt.id} className="agenda-card">
                  <div className="agenda-card-main">
                    <span className="agenda-card-icon">📅</span>
                    <div>
                      <h4>{apt.title}</h4>
                      <p className="agenda-card-meta">
                        {formatDate(apt.date)}
                        {(apt.startTime || apt.endTime) && (
                          <> · {formatTime(apt.startTime)}{apt.endTime ? ` – ${formatTime(apt.endTime)}` : ''}</>
                        )}
                      </p>
                      {apt.location && <p className="agenda-card-loc">📍 {apt.location}</p>}
                      <p className="agenda-card-members">{APT_CATEGORIES[apt.category] || apt.category} · {getMemberNames(apt.assignedMembers)}</p>
                    </div>
                  </div>
                  <div className="agenda-card-actions">
                    <button type="button" className="btn-icon" onClick={() => handleEditAppointment(apt)} title="Modifica">✎</button>
                    <button type="button" className="btn-icon danger" onClick={() => removeAppointment(apt.id)} title="Elimina">✕</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {activeTab === 'events' && (
        <section className="agenda-section">
          {showEventForm ? (
            <form className="agenda-form" onSubmit={handleSaveEvent}>
              <h4>{editingEventId ? 'Modifica evento' : 'Nuovo evento'}</h4>
              <input
                type="text"
                placeholder="Titolo *"
                value={eventForm.title}
                onChange={(e) => setEventForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
              <input
                type="text"
                placeholder="Descrizione"
                value={eventForm.description}
                onChange={(e) => setEventForm((f) => ({ ...f, description: e.target.value }))}
              />
              <input
                type="date"
                value={eventForm.eventDate}
                onChange={(e) => setEventForm((f) => ({ ...f, eventDate: e.target.value }))}
                required
              />
              <label className="form-check">
                <input
                  type="checkbox"
                  checked={eventForm.isAllDay}
                  onChange={(e) => setEventForm((f) => ({ ...f, isAllDay: e.target.checked }))}
                />
                <span>Giornata intera</span>
              </label>
              {!eventForm.isAllDay && (
                <div className="form-row">
                  <input
                    type="time"
                    placeholder="Da"
                    value={eventForm.startTime}
                    onChange={(e) => setEventForm((f) => ({ ...f, startTime: e.target.value }))}
                  />
                  <input
                    type="time"
                    placeholder="A"
                    value={eventForm.endTime}
                    onChange={(e) => setEventForm((f) => ({ ...f, endTime: e.target.value }))}
                  />
                </div>
              )}
              <input
                type="text"
                placeholder="Luogo"
                value={eventForm.location}
                onChange={(e) => setEventForm((f) => ({ ...f, location: e.target.value }))}
              />
              <select
                value={eventForm.eventType}
                onChange={(e) => setEventForm((f) => ({ ...f, eventType: e.target.value }))}
              >
                {Object.entries(EVENT_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <div className="form-member-list">
                <span className="form-label">Partecipanti</span>
                {membersList.map((m) => (
                  <label key={m.id} className="form-check">
                    <input
                      type="checkbox"
                      checked={eventForm.participants.includes(m.id)}
                      onChange={() => toggleEventMember(m.id)}
                    />
                    <span>{m.avatar} {m.name}</span>
                  </label>
                ))}
              </div>
              <label className="form-check">
                <input
                  type="checkbox"
                  checked={eventForm.reminderEnabled}
                  onChange={(e) => setEventForm((f) => ({ ...f, reminderEnabled: e.target.checked }))}
                />
                <span>Promemoria</span>
              </label>
              <div className="form-actions">
                <button type="submit" className="fh-btn fh-btn-primary">Salva</button>
                <button type="button" className="fh-btn fh-btn-secondary" onClick={resetEventForm}>Annulla</button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              className="fh-btn fh-btn-primary btn-add"
              onClick={() => {
                resetEventForm();
                setShowEventForm(true);
              }}
            >
              + Nuovo evento
            </button>
          )}

          <div className="agenda-list">
            {sortedEvents.length === 0 ? (
              <p className="agenda-empty">Nessun evento</p>
            ) : (
              sortedEvents.map((evt) => (
                <div key={evt.id} className="agenda-card">
                  <div className="agenda-card-main">
                    <span className="agenda-card-icon">🎉</span>
                    <div>
                      <h4>{evt.title}</h4>
                      <p className="agenda-card-meta">
                        {formatDate(evt.eventDate)}
                        {!evt.isAllDay && (evt.startTime || evt.endTime) && (
                          <> · {formatTime(evt.startTime)}{evt.endTime ? ` – ${formatTime(evt.endTime)}` : ''}</>
                        )}
                        {evt.isAllDay && ' · Giornata intera'}
                      </p>
                      {evt.location && <p className="agenda-card-loc">📍 {evt.location}</p>}
                      <p className="agenda-card-members">{EVENT_TYPES[evt.eventType] || evt.eventType} · {getMemberNames(evt.participants)}</p>
                    </div>
                  </div>
                  <div className="agenda-card-actions">
                    <button type="button" className="btn-icon" onClick={() => handleEditEvent(evt)} title="Modifica">✎</button>
                    <button type="button" className="btn-icon danger" onClick={() => removeFamilyEvent(evt.id)} title="Elimina">✕</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      <div className="page-bottom-spacer" />
      <BottomNav />
    </div>
  );
}
