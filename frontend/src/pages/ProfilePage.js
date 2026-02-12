import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useTranslation } from '../i18n/LanguageContext';

function Section({ title, icon, defaultOpen, children }) {
  const [open, setOpen] = useState(defaultOpen || false);
  return (
    <div className="form-section">
      <button type="button" className="form-section-header" onClick={() => setOpen(!open)}>
        <span>{icon} {title}</span>
        <span className="form-section-chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="form-section-body">{children}</div>}
    </div>
  );
}

function PhotoUploader({ index, currentUrl, onUploaded }) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await api.uploadPhoto(file);
      onUploaded(result.url);
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="photo-upload-slot">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        id={`photo-input-${index}`}
        style={{ display: 'none' }}
      />
      <label htmlFor={`photo-input-${index}`} className="photo-upload-label">
        {uploading ? (
          <div className="photo-upload-loading"><span className="loading-spinner" /> Envoi...</div>
        ) : currentUrl ? (
          <div className="photo-upload-preview">
            <img src={currentUrl} alt={`Photo ${index}`} />
            <div className="photo-upload-change">📷 Changer</div>
          </div>
        ) : (
          <div className="photo-upload-empty">
            <span className="photo-upload-icon">📷</span>
            <span>{index === 1 ? 'Photo principale' : `Photo ${index}`}</span>
          </div>
        )}
      </label>
    </div>
  );
}

function DogFormModal({ onClose, onSave, initialData = null }) {
  const [form, setForm] = useState(initialData || {
    name: '', breed: '', age_years: 1, age_months: 0,
    weight_kg: '', sex: 'male', bio: '', temperament: '',
    intention: 'balade', photo_url_1: '', photo_url_2: '', photo_url_3: '',
    photo_url_4: '', photo_url_5: '', photo_url_6: '',
    date_of_birth: '', lof_number: '', microchip_number: '', kennel_name: '',
    sire_name: '', sire_breed: '', dam_name: '', dam_breed: '',
    has_pedigree: false, pedigree_url: '',
    coat_color: '', height_cm: '', eye_color: '',
    health_tests: '', vaccination_status: '', allergies: '',
    is_neutered: false,
    activity_level: '', diet: '',
    good_with_kids: null, good_with_cats: null, good_with_dogs: null,
    titles: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = {
        ...form,
        age_years: parseInt(form.age_years),
        age_months: parseInt(form.age_months),
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
        height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
        date_of_birth: form.date_of_birth || null,
        good_with_kids: form.good_with_kids === '' ? null : form.good_with_kids,
        good_with_cats: form.good_with_cats === '' ? null : form.good_with_cats,
        good_with_dogs: form.good_with_dogs === '' ? null : form.good_with_dogs,
      };

      // Clean up empty strings to null
      Object.keys(data).forEach(k => { if (data[k] === '') data[k] = null; });

      if (initialData && initialData.id) {
        await api.updateDog(initialData.id, data);
      } else {
        await api.createDog(data);
      }

      const dogs = await api.getMyDogs();
      onSave(dogs);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function BoolSelect({ label, field }) {
    return (
      <div className="form-group">
        <label>{label}</label>
        <select value={form[field] === null ? '' : form[field] ? 'true' : 'false'} onChange={(e) => {
          const v = e.target.value;
          update(field, v === '' ? null : v === 'true');
        }}>
          <option value="">Non renseigné</option>
          <option value="true">Oui</option>
          <option value="false">Non</option>
        </select>
      </div>
    );
  }

  const isEditing = !!initialData;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <h2>{isEditing ? `Modifier ${form.name}` : 'Ajouter un chien'}</h2>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <Section title="Essentiel" icon="🐾" defaultOpen={true}>
            <div className="form-group">
              <label>Nom du chien *</label>
              <input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Rex" required />
            </div>
            <div className="form-group">
              <label>Race *</label>
              <input value={form.breed} onChange={(e) => update('breed', e.target.value)} placeholder="Labrador" required />
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label>Âge (ans) *</label>
                <input type="number" min="0" max="25" value={form.age_years} onChange={(e) => update('age_years', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Mois</label>
                <input type="number" min="0" max="11" value={form.age_months} onChange={(e) => update('age_months', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Poids (kg)</label>
                <input type="number" step="0.1" min="0" value={form.weight_kg} onChange={(e) => update('weight_kg', e.target.value)} />
              </div>
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label>Sexe *</label>
                <select value={form.sex} onChange={(e) => update('sex', e.target.value)}>
                  <option value="male">Mâle</option>
                  <option value="female">Femelle</option>
                </select>
              </div>
              <div className="form-group">
                <label>Intention</label>
                <select value={form.intention} onChange={(e) => update('intention', e.target.value)}>
                  <option value="balade">Balade</option>
                  <option value="reproduction">Reproduction</option>
                  <option value="both">Les deux</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Date de naissance</label>
              <input type="date" value={form.date_of_birth || ''} onChange={(e) => update('date_of_birth', e.target.value)} />
            </div>
          </Section>

          <Section title="Photos" icon="📸" defaultOpen={true}>
            <div className="photo-upload-grid">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <PhotoUploader
                  key={i}
                  index={i}
                  currentUrl={form[`photo_url_${i}`]}
                  onUploaded={(url) => update(`photo_url_${i}`, url)}
                />
              ))}
            </div>
          </Section>

          <Section title="Physique" icon="💪">
            <div className="form-group">
              <label>Couleur de robe</label>
              <input value={form.coat_color || ''} onChange={(e) => update('coat_color', e.target.value)} placeholder="Noir et feu" />
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label>Couleur des yeux</label>
                <input value={form.eye_color || ''} onChange={(e) => update('eye_color', e.target.value)} placeholder="Marron" />
              </div>
              <div className="form-group">
                <label>Taille au garrot (cm)</label>
                <input type="number" step="0.1" value={form.height_cm || ''} onChange={(e) => update('height_cm', e.target.value)} />
              </div>
            </div>
          </Section>

          <Section title="Pedigree & Origines" icon="🏆">
            <div className="form-group">
              <label className="checkbox-label">
                <input type="checkbox" checked={form.has_pedigree} onChange={(e) => update('has_pedigree', e.target.checked)} />
                <span>Possède un pedigree</span>
              </label>
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label>N° LOF</label>
                <input value={form.lof_number || ''} onChange={(e) => update('lof_number', e.target.value)} placeholder="LOF 2 BGA 12345/2022" />
              </div>
              <div className="form-group">
                <label>N° Puce</label>
                <input value={form.microchip_number || ''} onChange={(e) => update('microchip_number', e.target.value)} placeholder="250269802123456" />
              </div>
            </div>
            <div className="form-group">
              <label>Élevage d'origine</label>
              <input value={form.kennel_name || ''} onChange={(e) => update('kennel_name', e.target.value)} placeholder="Du Domaine des Braves" />
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label>Nom du père</label>
                <input value={form.sire_name || ''} onChange={(e) => update('sire_name', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Race du père</label>
                <input value={form.sire_breed || ''} onChange={(e) => update('sire_breed', e.target.value)} />
              </div>
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label>Nom de la mère</label>
                <input value={form.dam_name || ''} onChange={(e) => update('dam_name', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Race de la mère</label>
                <input value={form.dam_breed || ''} onChange={(e) => update('dam_breed', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>URL du pedigree</label>
              <input value={form.pedigree_url || ''} onChange={(e) => update('pedigree_url', e.target.value)} placeholder="https://..." />
            </div>
          </Section>

          <Section title="Santé" icon="🏥">
            <div className="form-group">
              <label>Statut vaccinal</label>
              <select value={form.vaccination_status || ''} onChange={(e) => update('vaccination_status', e.target.value)}>
                <option value="">Non renseigné</option>
                <option value="a_jour">À jour</option>
                <option value="partiel">Partiel</option>
                <option value="non_vaccine">Non vacciné</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tests de santé</label>
              <textarea rows="2" value={form.health_tests || ''} onChange={(e) => update('health_tests', e.target.value)} placeholder='Ex: dysplasie hanches A, ADN DM clear...' />
            </div>
            <div className="form-group">
              <label>Allergies</label>
              <input value={form.allergies || ''} onChange={(e) => update('allergies', e.target.value)} placeholder="Poulet, gluten..." />
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input type="checkbox" checked={form.is_neutered} onChange={(e) => update('is_neutered', e.target.checked)} />
                <span>Stérilisé / Castré</span>
              </label>
            </div>
          </Section>

          <Section title="Comportement" icon="💡">
            <div className="form-group">
              <label>Caractère (séparé par virgules)</label>
              <input value={form.temperament || ''} onChange={(e) => update('temperament', e.target.value)} placeholder="joueur, affectueux, calme" />
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label>Niveau d'activité</label>
                <select value={form.activity_level || ''} onChange={(e) => update('activity_level', e.target.value)}>
                  <option value="">Non renseigné</option>
                  <option value="low">Calme</option>
                  <option value="moderate">Modéré</option>
                  <option value="high">Actif</option>
                  <option value="very_high">Très actif</option>
                </select>
              </div>
              <div className="form-group">
                <label>Régime alimentaire</label>
                <select value={form.diet || ''} onChange={(e) => update('diet', e.target.value)}>
                  <option value="">Non renseigné</option>
                  <option value="croquettes">Croquettes</option>
                  <option value="patee">Pâtée</option>
                  <option value="barf">BARF</option>
                  <option value="mixte">Mixte</option>
                </select>
              </div>
            </div>
            <BoolSelect label="S'entend avec les enfants" field="good_with_kids" />
            <BoolSelect label="S'entend avec les chats" field="good_with_cats" />
            <BoolSelect label="S'entend avec les chiens" field="good_with_dogs" />
            <div className="form-group">
              <label>Bio</label>
              <textarea rows="3" value={form.bio || ''} onChange={(e) => update('bio', e.target.value)} placeholder="Décrivez votre chien..." />
            </div>
          </Section>

          <Section title="Palmarès" icon="🏅">
            <div className="form-group">
              <label>Titres et récompenses</label>
              <textarea rows="2" value={form.titles || ''} onChange={(e) => update('titles', e.target.value)} placeholder="Champion de France, SchH1..." />
            </div>
          </Section>

          <button type="submit" className="btn btn-primary mt-16" disabled={loading}>
            {loading ? '...' : (isEditing ? 'Enregistrer' : 'Ajouter')}
          </button>
          <button type="button" className="btn btn-outline mt-8" onClick={onClose}>
            Annuler
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ProfilePage({ user, dogs, activeDog, setActiveDog, onDogsUpdate, onLogout }) {
  const [showAddDog, setShowAddDog] = useState(false);
  const [editingDog, setEditingDog] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState('');
  const navigate = useNavigate();
  const { t, lang, setLang } = useTranslation();

  async function handleGeolocate() {
    setGeoLoading(true);
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      await api.updateLocation(pos.coords.latitude, pos.coords.longitude, 'Ma position');
    } catch {
      alert('Impossible de récupérer votre position');
    } finally {
      setGeoLoading(false);
    }
  }

  async function handleVerifyHealth(dogId) {
    setVerifyLoading(`health-${dogId}`);
    try {
      await api.verifyHealth(dogId);
      const dogs = await api.getMyDogs();
      onDogsUpdate(dogs);
    } catch (err) {
      alert(err.message);
    } finally {
      setVerifyLoading('');
    }
  }

  async function handleVerifyBreeder(dogId) {
    setVerifyLoading(`breeder-${dogId}`);
    try {
      await api.verifyBreeder(dogId);
      const dogs = await api.getMyDogs();
      onDogsUpdate(dogs);
    } catch (err) {
      alert(err.message);
    } finally {
      setVerifyLoading('');
    }
  }

  const planLabel = { croquette: '🦴 Croquette', patee: '🥫 Pâtée', os_en_or: '🏆 Os en Or' };
  const planGradient = {
    croquette: 'linear-gradient(135deg, rgba(141,110,99,0.2), rgba(141,110,99,0.05))',
    patee: 'linear-gradient(135deg, rgba(255,112,67,0.2), rgba(255,112,67,0.05))',
    os_en_or: 'linear-gradient(135deg, rgba(255,210,0,0.2), rgba(255,210,0,0.05))',
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>{t('profile.title')}</h1>
        <button
          className="lang-toggle-btn"
          onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
        >
          {lang === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR'}
        </button>
      </div>

      <div className="profile-header-card" style={{ background: planGradient[user.plan_type] || planGradient.croquette }}>
        <div className="profile-avatar">
          {user.full_name.charAt(0).toUpperCase()}
        </div>
        <h2>{user.full_name}</h2>
        <p>{user.email}</p>
        {user.city && <p>📍 {user.city}</p>}
        <div className="profile-plan-badge">
          {planLabel[user.plan_type] || '🦴 Croquette'}
        </div>

        <div className="profile-actions-inline">
          <button
            className="btn btn-outline"
            onClick={handleGeolocate}
            disabled={geoLoading}
          >
            {geoLoading ? '📍...' : '📍 ' + t('profile.updateLocation')}
          </button>
          <button
            className="btn btn-outline"
            onClick={() => navigate('/predictor')}
          >
            🧬 Predictor
          </button>
          <button
            className="btn btn-outline"
            onClick={() => navigate('/map')}
          >
            🗺️ {t('profile.map')}
          </button>
        </div>
      </div>

      <div className="profile-section">
        <h3>{t('profile.myDogs')} ({dogs.length})</h3>

        {dogs.map((dog) => (
          <div key={dog.id} className="dog-profile-card">
            <div
              className={`dog-mini-card ${activeDog?.id === dog.id ? 'active' : ''}`}
              onClick={() => setActiveDog(dog)}
            >
              {dog.photo_url_1 ? (
                <img src={dog.photo_url_1} alt={dog.name} />
              ) : (
                <div className="dog-mini-card-placeholder">🐕</div>
              )}
              <div className="dog-mini-card-info">
                <h4>
                  {dog.name} {dog.sex === 'male' ? '♂' : '♀'}
                  {dog.health_verified && <span className="verified-badge" title="Santé vérifiée">✅</span>}
                  {dog.breeder_certified && <span className="verified-badge" title="Éleveur certifié">🏅</span>}
                </h4>
                <p>{dog.breed} · {dog.age_years} an{dog.age_years > 1 ? 's' : ''}</p>
                <div className="dog-mini-card-tags">
                  {dog.has_pedigree && <span className="tag tag-pedigree">LOF</span>}
                  {dog.coat_color && <span className="tag tag-coat">{dog.coat_color}</span>}
                  {dog.health_verified && <span className="tag tag-verified">✓ Santé</span>}
                  {dog.breeder_certified && <span className="tag tag-verified">✓ Éleveur</span>}
                </div>
              </div>
              {activeDog?.id === dog.id && (
                <span className="dog-mini-card-active-badge">{t('profile.active')}</span>
              )}
            </div>

            <div className="dog-card-actions">
              <button
                className="btn-sm btn-detail"
                onClick={() => navigate(`/dog/${dog.id}`)}
              >
                👁️ {t('profile.viewProfile')}
              </button>
              <button
                className="btn-sm btn-edit"
                style={{ marginLeft: 5 }}
                onClick={() => setEditingDog(dog)}
              >
                ✏️ Modifier
              </button>
              {!dog.health_verified && (
                <button
                  className="btn-sm btn-verify"
                  onClick={() => handleVerifyHealth(dog.id)}
                  disabled={verifyLoading === `health-${dog.id}`}
                >
                  {verifyLoading === `health-${dog.id}` ? '...' : '✅ ' + t('profile.verifyHealth')}
                </button>
              )}
              {!dog.breeder_certified && (
                <button
                  className="btn-sm btn-verify"
                  onClick={() => handleVerifyBreeder(dog.id)}
                  disabled={verifyLoading === `breeder-${dog.id}`}
                >
                  {verifyLoading === `breeder-${dog.id}` ? '...' : '🏅 ' + t('profile.certifyBreeder')}
                </button>
              )}
            </div>
          </div>
        ))}

        <button className="btn btn-secondary mt-8" onClick={() => setShowAddDog(true)}>
          + {t('profile.addDog')}
        </button>
      </div>

      <div className="profile-actions">
        <button className="btn btn-outline" onClick={onLogout}>
          {t('profile.logout')}
        </button>
      </div>

      {(showAddDog || editingDog) && (
        <DogFormModal
          onClose={() => {
            setShowAddDog(false);
            setEditingDog(null);
          }}
          onSave={onDogsUpdate}
          initialData={editingDog}
        />
      )}
    </div>
  );
}
