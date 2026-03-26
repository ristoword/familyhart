/**
 * SafePlaces - Luoghi sicuri / Geofence
 * Collegato allo stato centrale. Add/edit locale, trigger automatici entrata/uscita
 * TODO: Backend per luoghi persistenti, mappe per selezione posizione
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useApp } from '../store/AppContext';
import { PERMISSION } from '../data/constants';
import './SafePlaces.css';

const DEFAULT_COORDS = { lat: 45.4642, lng: 9.19 };

export default function SafePlaces() {
  const {
    places,
    family,
    addPlace,
    updatePlace,
    removePlace,
    userPosition,
    canUser,
  } = useApp();

  const canEditPlaces = canUser(PERMISSION.EDIT_SAFE_PLACES);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    address: '',
    lat: DEFAULT_COORDS.lat,
    lng: DEFAULT_COORDS.lng,
    radius: 100,
    memberIds: [],
    notifyEntry: true,
    notifyExit: true,
  });

  const members = family.members || [];

  const resetForm = () => {
    const coords = userPosition?.lat != null ? userPosition : DEFAULT_COORDS;
    setForm({
      name: '',
      address: '',
      lat: coords.lat ?? DEFAULT_COORDS.lat,
      lng: coords.lng ?? DEFAULT_COORDS.lng,
      radius: 100,
      memberIds: [],
      notifyEntry: true,
      notifyExit: true,
    });
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    addPlace({
      name: form.name.trim(),
      address: form.address.trim() || form.name.trim(),
      lat: Number(form.lat) || DEFAULT_COORDS.lat,
      lng: Number(form.lng) || DEFAULT_COORDS.lng,
      radius: Number(form.radius) || 100,
      memberIds: form.memberIds,
      notifyEntry: form.notifyEntry,
      notifyExit: form.notifyExit,
    });
    resetForm();
  };

  const handleEdit = (place) => {
    setEditingId(place.id);
    setForm({
      name: place.name,
      address: place.address || '',
      lat: place.lat,
      lng: place.lng,
      radius: place.radius || 100,
      memberIds: place.memberIds || [],
      notifyEntry: place.notifyEntry !== false,
      notifyExit: place.notifyExit !== false,
    });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!editingId || !form.name.trim()) return;
    updatePlace(editingId, {
      name: form.name.trim(),
      address: form.address.trim() || form.name.trim(),
      lat: Number(form.lat) || DEFAULT_COORDS.lat,
      lng: Number(form.lng) || DEFAULT_COORDS.lng,
      radius: Number(form.radius) || 100,
      memberIds: form.memberIds,
      notifyEntry: form.notifyEntry,
      notifyExit: form.notifyExit,
    });
    resetForm();
  };

  const toggleMember = (memberId) => {
    setForm((f) => ({
      ...f,
      memberIds: f.memberIds.includes(memberId)
        ? f.memberIds.filter((id) => id !== memberId)
        : [...f.memberIds, memberId],
    }));
  };

  const getMemberNames = (memberIds) => {
    if (!memberIds?.length) return 'Nessuno';
    return memberIds
      .map((id) => members.find((m) => m.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div className="safe-places-page">
      <header className="page-header">
        <Link to="/profile" className="back-link">← Indietro</Link>
        <h1>Luoghi sicuri</h1>
        <p className="header-subtitle">Geofence e notifiche automatiche</p>
      </header>

      <div className="places-list">
        {places.map((place) => (
          <div key={place.id} className="place-card">
            <div className="place-icon">📍</div>
            <div className="place-info">
              <h3>{place.name}</h3>
              <p className="place-address">{place.address}</p>
              <p className="place-details">
                Raggio: {place.radius}m · 
                Entrata: {place.notifyEntry ? 'Sì' : 'No'} · 
                Uscita: {place.notifyExit ? 'Sì' : 'No'}
              </p>
              <p className="place-members">
                Membri: {getMemberNames(place.memberIds)}
              </p>
              {canEditPlaces && (
                <div className="place-actions">
                  <button
                    type="button"
                    className="place-edit-btn"
                    onClick={() => handleEdit(place)}
                  >
                    Modifica
                  </button>
                  <button
                    type="button"
                    className="place-remove-btn"
                    onClick={() => removePlace(place.id)}
                    title="Elimina"
                  >
                    Elimina
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showAddForm && (
        <form className="place-form" onSubmit={handleAdd}>
          <h3>Aggiungi luogo sicuro</h3>
          <div className="form-row">
            <label>Nome</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="es. Casa"
              required
            />
          </div>
          <div className="form-row">
            <label>Indirizzo</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="es. Via Garibaldi 8"
            />
          </div>
          <div className="form-row">
            <label>Raggio (m)</label>
            <input
              type="number"
              value={form.radius}
              onChange={(e) => setForm((f) => ({ ...f, radius: e.target.value }))}
              min={50}
              max={500}
            />
          </div>
          <div className="form-row">
            <label>Membri da monitorare</label>
            <div className="member-checkboxes">
              {members.map((m) => (
                <label key={m.id} className="member-check">
                  <input
                    type="checkbox"
                    checked={form.memberIds.includes(m.id)}
                    onChange={() => toggleMember(m.id)}
                  />
                  {m.avatar} {m.name}
                </label>
              ))}
            </div>
          </div>
          <div className="form-row form-row-inline">
            <label>
              <input
                type="checkbox"
                checked={form.notifyEntry}
                onChange={(e) => setForm((f) => ({ ...f, notifyEntry: e.target.checked }))}
              />
              Notifica entrata
            </label>
          </div>
          <div className="form-row form-row-inline">
            <label>
              <input
                type="checkbox"
                checked={form.notifyExit}
                onChange={(e) => setForm((f) => ({ ...f, notifyExit: e.target.checked }))}
              />
              Notifica uscita
            </label>
          </div>
          <div className="form-actions">
            <button type="submit" className="fh-btn fh-btn-primary">Aggiungi</button>
            <button type="button" className="fh-btn fh-btn-secondary" onClick={resetForm}>
              Annulla
            </button>
          </div>
        </form>
      )}

      {editingId && (
        <form className="place-form" onSubmit={handleUpdate}>
          <h3>Modifica luogo</h3>
          <div className="form-row">
            <label>Nome</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className="form-row">
            <label>Indirizzo</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            />
          </div>
          <div className="form-row">
            <label>Raggio (m)</label>
            <input
              type="number"
              value={form.radius}
              onChange={(e) => setForm((f) => ({ ...f, radius: e.target.value }))}
              min={50}
              max={500}
            />
          </div>
          <div className="form-row">
            <label>Membri da monitorare</label>
            <div className="member-checkboxes">
              {members.map((m) => (
                <label key={m.id} className="member-check">
                  <input
                    type="checkbox"
                    checked={form.memberIds.includes(m.id)}
                    onChange={() => toggleMember(m.id)}
                  />
                  {m.avatar} {m.name}
                </label>
              ))}
            </div>
          </div>
          <div className="form-row form-row-inline">
            <label>
              <input
                type="checkbox"
                checked={form.notifyEntry}
                onChange={(e) => setForm((f) => ({ ...f, notifyEntry: e.target.checked }))}
              />
              Notifica entrata
            </label>
          </div>
          <div className="form-row form-row-inline">
            <label>
              <input
                type="checkbox"
                checked={form.notifyExit}
                onChange={(e) => setForm((f) => ({ ...f, notifyExit: e.target.checked }))}
              />
              Notifica uscita
            </label>
          </div>
          <div className="form-actions">
            <button type="submit" className="fh-btn fh-btn-primary">Salva</button>
            <button type="button" className="fh-btn fh-btn-secondary" onClick={resetForm}>
              Annulla
            </button>
          </div>
        </form>
      )}

      {canEditPlaces && !showAddForm && !editingId && (
        <button
          type="button"
          className="fh-btn fh-btn-primary btn-add-place"
          onClick={() => setShowAddForm(true)}
        >
          + Aggiungi luogo sicuro
        </button>
      )}

      <div className="page-bottom-spacer" />
      <BottomNav />
    </div>
  );
}
