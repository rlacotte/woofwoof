import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubAppHeader from '../../components/SubAppHeader';
import api from '../../services/api';

const POSITIONS = [
  { value: 'sire', label: 'Pere' },
  { value: 'dam', label: 'Mere' },
  { value: 'sire_sire', label: 'Grand-pere paternel' },
  { value: 'sire_dam', label: 'Grand-mere paternelle' },
  { value: 'dam_sire', label: 'Grand-pere maternel' },
  { value: 'dam_dam', label: 'Grand-mere maternelle' },
];

const GENERATIONS = [
  { value: 1, label: 'Parents (Gen 1)' },
  { value: 2, label: 'Grands-parents (Gen 2)' },
];

export default function PedigreePage() {
  const navigate = useNavigate();
  const [dogs, setDogs] = useState([]);
  const [activeDogId, setActiveDogId] = useState(null);
  const [pedigree, setPedigree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    generation: 1,
    position: 'sire',
    ancestor_name: '',
    ancestor_breed: '',
    titles: '',
  });

  useEffect(() => {
    api.request('/dogs').then((data) => {
      setDogs(data);
      if (data.length > 0) {
        setActiveDogId(data[0].id);
      }
    }).catch(() => {});
  }, []);

  const fetchPedigree = () => {
    if (!activeDogId) return;
    setLoading(true);
    api.request(`/breed/pedigree/${activeDogId}`)
      .then((data) => {
        setPedigree(data);
        setLoading(false);
      })
      .catch(() => {
        setPedigree(null);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPedigree();
  }, [activeDogId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ancestor_name || !activeDogId) return;
    setSubmitting(true);
    try {
      await api.request('/breed/pedigree', {
        method: 'POST',
        body: JSON.stringify({
          dog_id: activeDogId,
          generation: form.generation,
          position: form.position,
          ancestor_name: form.ancestor_name,
          ancestor_breed: form.ancestor_breed,
          titles: form.titles ? form.titles.split(',').map((t) => t.trim()).filter(Boolean) : [],
        }),
      });
      setForm({
        generation: 1,
        position: 'sire',
        ancestor_name: '',
        ancestor_breed: '',
        titles: '',
      });
      setShowForm(false);
      fetchPedigree();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getAncestor = (position) => {
    if (!pedigree || !pedigree.ancestors) return null;
    return pedigree.ancestors.find((a) => a.position === position) || null;
  };

  const activeDog = dogs.find((d) => d.id === activeDogId);

  const renderAncestorCard = (position, label) => {
    const ancestor = getAncestor(position);
    return (
      <div style={{
        background: ancestor ? 'rgba(79,172,254,0.08)' : 'rgba(255,255,255,0.03)',
        borderRadius: '10px',
        border: `1px solid ${ancestor ? 'rgba(79,172,254,0.2)' : 'rgba(255,255,255,0.08)'}`,
        padding: '10px 12px',
        minHeight: '52px',
      }}>
        <div style={{
          color: 'rgba(240,240,245,0.4)',
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '4px',
        }}>
          {label}
        </div>
        {ancestor ? (
          <>
            <div style={{ color: '#f0f0f5', fontWeight: 600, fontSize: '13px' }}>
              {ancestor.ancestor_name || ancestor.name}
            </div>
            {(ancestor.ancestor_breed || ancestor.breed) && (
              <div style={{ color: '#4facfe', fontSize: '11px', marginTop: '1px' }}>
                {ancestor.ancestor_breed || ancestor.breed}
              </div>
            )}
            {ancestor.titles && ancestor.titles.length > 0 && (
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                {(Array.isArray(ancestor.titles) ? ancestor.titles : [ancestor.titles]).map((title, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: 'rgba(245,175,25,0.12)',
                      color: '#f5af19',
                      borderRadius: '4px',
                      padding: '1px 6px',
                      fontSize: '9px',
                      fontWeight: 600,
                    }}
                  >
                    {title}
                  </span>
                ))}
              </div>
            )}
          </>
        ) : (
          <div style={{ color: 'rgba(240,240,245,0.3)', fontSize: '12px', fontStyle: 'italic' }}>
            Non renseigne
          </div>
        )}
      </div>
    );
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
    <div className="pedigree-page">
      <SubAppHeader
        title="WoofBreed"
        icon="🧬"
        gradient="linear-gradient(135deg, #4facfe, #00f2fe)"
        onBack={() => navigate('/breed')}
      />

      <div style={{ padding: '16px' }}>
        <h2 style={{ color: '#f0f0f5', fontSize: '18px', margin: '0 0 12px 0' }}>
          Arbre genealogique
        </h2>

        {/* Dog Selector */}
        {dogs.length > 0 && (
          <select
            value={activeDogId || ''}
            onChange={(e) => setActiveDogId(e.target.value)}
            style={{
              ...inputStyle,
              appearance: 'auto',
              marginBottom: '20px',
            }}
          >
            {dogs.map((dog) => (
              <option key={dog.id} value={dog.id}>
                {dog.name}
              </option>
            ))}
          </select>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', color: 'rgba(240,240,245,0.6)', padding: '40px 0' }}>
            Chargement...
          </div>
        ) : (
          <>
            {/* Pedigree Tree */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '20px 16px',
              marginBottom: '20px',
            }}>
              {/* Current Dog (Root) */}
              <div style={{
                textAlign: 'center',
                marginBottom: '20px',
              }}>
                <div style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, rgba(79,172,254,0.2), rgba(0,242,254,0.2))',
                  borderRadius: '12px',
                  border: '2px solid #4facfe',
                  padding: '12px 24px',
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>🐕</div>
                  <div style={{ color: '#f0f0f5', fontWeight: 700, fontSize: '16px' }}>
                    {activeDog ? activeDog.name : 'Mon chien'}
                  </div>
                  {activeDog && activeDog.breed && (
                    <div style={{ color: '#4facfe', fontSize: '12px', marginTop: '2px' }}>
                      {activeDog.breed}
                    </div>
                  )}
                </div>
              </div>

              {/* Connector line */}
              <div style={{
                width: '2px',
                height: '16px',
                background: 'rgba(79,172,254,0.3)',
                margin: '0 auto 8px',
              }} />

              {/* Parents */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                marginBottom: '16px',
              }}>
                {renderAncestorCard('sire', 'Pere')}
                {renderAncestorCard('dam', 'Mere')}
              </div>

              {/* Connector lines */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                marginBottom: '8px',
              }}>
                <div style={{
                  width: '2px',
                  height: '12px',
                  background: 'rgba(79,172,254,0.2)',
                }} />
                <div style={{
                  width: '2px',
                  height: '12px',
                  background: 'rgba(79,172,254,0.2)',
                }} />
              </div>

              {/* Grandparents */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
              }}>
                {renderAncestorCard('sire_sire', 'GP paternel')}
                {renderAncestorCard('sire_dam', 'GM paternelle')}
                {renderAncestorCard('dam_sire', 'GP maternel')}
                {renderAncestorCard('dam_dam', 'GM maternelle')}
              </div>
            </div>

            {/* Add Ancestor */}
            <button
              onClick={() => setShowForm(!showForm)}
              style={{
                width: '100%',
                background: showForm ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #4facfe, #00f2fe)',
                border: 'none',
                borderRadius: '12px',
                padding: '14px',
                color: showForm ? '#f0f0f5' : '#0f0f1a',
                fontWeight: 600,
                fontSize: '15px',
                cursor: 'pointer',
              }}
            >
              {showForm ? '✕ Annuler' : '+ Ajouter un ancetre'}
            </button>

            {showForm && (
              <form onSubmit={handleSubmit} style={{
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.12)',
                padding: '20px',
                marginTop: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}>
                <select
                  value={form.generation}
                  onChange={(e) => setForm({ ...form, generation: parseInt(e.target.value) })}
                  style={{ ...inputStyle, appearance: 'auto' }}
                >
                  {GENERATIONS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
                <select
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  style={{ ...inputStyle, appearance: 'auto' }}
                >
                  {POSITIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Nom de l'ancetre *"
                  value={form.ancestor_name}
                  onChange={(e) => setForm({ ...form, ancestor_name: e.target.value })}
                  style={inputStyle}
                  required
                />
                <input
                  type="text"
                  placeholder="Race de l'ancetre"
                  value={form.ancestor_breed}
                  onChange={(e) => setForm({ ...form, ancestor_breed: e.target.value })}
                  style={inputStyle}
                />
                <input
                  type="text"
                  placeholder="Titres (separes par des virgules)"
                  value={form.titles}
                  onChange={(e) => setForm({ ...form, titles: e.target.value })}
                  style={inputStyle}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
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
                  {submitting ? 'Ajout...' : 'Ajouter l\'ancetre'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
