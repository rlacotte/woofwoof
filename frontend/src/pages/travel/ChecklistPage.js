import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

const DEFAULT_ITEMS = [
  'Passeport',
  'Carnet de sante',
  'Croquettes',
  'Gamelle',
  'Laisse',
  'Sacs',
  'Jouet',
  'Couverture',
  'Medicaments',
];

export default function ChecklistPage() {
  const navigate = useNavigate();
  const [checklists, setChecklists] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [activeDogId, setActiveDogId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    destination: '',
    departure_date: '',
    dog_id: '',
  });

  useEffect(() => {
    api.request('/dogs').then((data) => {
      setDogs(data);
      if (data.length > 0) {
        setActiveDogId(data[0].id);
        setForm((prev) => ({ ...prev, dog_id: data[0].id }));
      }
    }).catch(() => {});
  }, []);

  const fetchChecklists = () => {
    setLoading(true);
    api.request('/travel/checklists')
      .then((data) => {
        setChecklists(data);
        setLoading(false);
      })
      .catch(() => {
        setChecklists([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchChecklists();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.destination || !form.departure_date) return;
    setSubmitting(true);
    try {
      const payload = {
        destination: form.destination,
        departure_date: form.departure_date,
        dog_id: form.dog_id || activeDogId,
        items: DEFAULT_ITEMS.map((name) => ({ name, checked: false })),
      };
      await api.request('/travel/checklists', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setForm({ destination: '', departure_date: '', dog_id: activeDogId || '' });
      setShowForm(false);
      fetchChecklists();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleItem = async (checklist, itemIndex) => {
    const updatedItems = checklist.items.map((item, idx) =>
      idx === itemIndex ? { ...item, checked: !item.checked } : item
    );
    try {
      await api.request(`/travel/checklists/${checklist.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...checklist, items: updatedItems }),
      });
      setChecklists((prev) =>
        prev.map((c) =>
          c.id === checklist.id ? { ...c, items: updatedItems } : c
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const getProgress = (checklist) => {
    const items = checklist.items || [];
    const total = items.length;
    const checked = items.filter((i) => i.checked).length;
    return { checked, total };
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px',
    padding: '12px 14px',
    color: '#f0f0f5',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div className="checklist-page">
      <SubAppHeader
        title="WoofTravel"
        icon="✈️"
        gradient="linear-gradient(135deg, #00c9ff, #92fe9d)"
        onBack={() => navigate('/travel')}
      />

      <div style={{ padding: '16px' }}>
        <h2 style={{ color: '#f0f0f5', fontSize: '18px', margin: '0 0 16px 0' }}>
          Mes checklists de voyage
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'rgba(240,240,245,0.6)', padding: '40px 0' }}>
            Chargement...
          </div>
        ) : checklists.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.12)',
            padding: '30px',
            textAlign: 'center',
            color: 'rgba(240,240,245,0.6)',
            marginBottom: '16px',
          }}>
            Aucune checklist. Creez-en une pour votre prochain voyage !
          </div>
        ) : (
          checklists.map((checklist) => {
            const { checked, total } = getProgress(checklist);
            const isExpanded = expandedId === checklist.id;
            const progressPct = total > 0 ? (checked / total) * 100 : 0;

            return (
              <div
                key={checklist.id}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.12)',
                  marginBottom: '10px',
                  overflow: 'hidden',
                }}
              >
                {/* Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : checklist.id)}
                  style={{
                    padding: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#f0f0f5', fontWeight: 600, fontSize: '15px' }}>
                      📍 {checklist.destination}
                    </div>
                    <div style={{ color: 'rgba(240,240,245,0.6)', fontSize: '13px', marginTop: '4px' }}>
                      {checklist.departure_date
                        ? new Date(checklist.departure_date).toLocaleDateString('fr-FR')
                        : 'Date non definie'}
                    </div>
                    {/* Progress bar */}
                    <div style={{
                      marginTop: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}>
                      <div style={{
                        flex: 1,
                        height: '6px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '3px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${progressPct}%`,
                          height: '100%',
                          background: progressPct === 100
                            ? 'linear-gradient(135deg, #2ed573, #7bed9f)'
                            : 'linear-gradient(135deg, #00c9ff, #92fe9d)',
                          borderRadius: '3px',
                          transition: 'width 0.3s ease',
                        }} />
                      </div>
                      <span style={{
                        color: 'rgba(240,240,245,0.6)',
                        fontSize: '12px',
                        flexShrink: 0,
                      }}>
                        {checked}/{total}
                      </span>
                    </div>
                  </div>
                  <span style={{
                    color: 'rgba(240,240,245,0.4)',
                    fontSize: '18px',
                    marginLeft: '12px',
                    transition: 'transform 0.2s',
                    transform: isExpanded ? 'rotate(90deg)' : 'none',
                  }}>
                    ›
                  </span>
                </div>

                {/* Expanded items */}
                {isExpanded && (
                  <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    padding: '12px 16px',
                  }}>
                    {(checklist.items || []).map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => toggleItem(checklist, idx)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 0',
                          borderBottom: idx < checklist.items.length - 1
                            ? '1px solid rgba(255,255,255,0.05)'
                            : 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '6px',
                          border: `2px solid ${item.checked ? '#92fe9d' : 'rgba(255,255,255,0.2)'}`,
                          background: item.checked ? 'rgba(146,254,157,0.15)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {item.checked && (
                            <span style={{ color: '#92fe9d', fontSize: '14px' }}>✓</span>
                          )}
                        </div>
                        <span style={{
                          color: item.checked ? 'rgba(240,240,245,0.4)' : '#f0f0f5',
                          fontSize: '14px',
                          textDecoration: item.checked ? 'line-through' : 'none',
                        }}>
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Create New Checklist */}
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            width: '100%',
            background: showForm ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #00c9ff, #92fe9d)',
            border: 'none',
            borderRadius: '12px',
            padding: '14px',
            color: showForm ? '#f0f0f5' : '#0f0f1a',
            fontWeight: 600,
            fontSize: '15px',
            cursor: 'pointer',
            marginTop: '8px',
          }}
        >
          {showForm ? '✕ Annuler' : '+ Nouvelle checklist'}
        </button>

        {showForm && (
          <form onSubmit={handleCreate} style={{
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.12)',
            padding: '20px',
            marginTop: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            <input
              type="text"
              placeholder="Destination *"
              value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })}
              style={inputStyle}
              required
            />
            <input
              type="date"
              value={form.departure_date}
              onChange={(e) => setForm({ ...form, departure_date: e.target.value })}
              style={inputStyle}
              required
            />
            {dogs.length > 1 && (
              <select
                value={form.dog_id}
                onChange={(e) => setForm({ ...form, dog_id: e.target.value })}
                style={{ ...inputStyle, appearance: 'auto' }}
              >
                {dogs.map((dog) => (
                  <option key={dog.id} value={dog.id}>
                    {dog.name}
                  </option>
                ))}
              </select>
            )}
            <div style={{
              color: 'rgba(240,240,245,0.6)',
              fontSize: '12px',
              padding: '8px 0',
            }}>
              Elements par defaut : {DEFAULT_ITEMS.join(', ')}
            </div>
            <button
              type="submit"
              disabled={submitting}
              style={{
                background: 'linear-gradient(135deg, #00c9ff, #92fe9d)',
                border: 'none',
                borderRadius: '12px',
                padding: '14px',
                color: '#0f0f1a',
                fontWeight: 600,
                fontSize: '15px',
                cursor: submitting ? 'wait' : 'pointer',
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? 'Creation...' : 'Creer la checklist'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
