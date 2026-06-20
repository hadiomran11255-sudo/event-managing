import { useEffect, useState } from 'react';
import SectionCard from './SectionCard.jsx';
import ImageUpload from './ImageUpload.jsx';
import { createEvent, deleteEvent, updateEvent } from '../api/eventApi.js';

const blankImage = { url: '', filename: '' };

const getBlankForm = (date) => ({
  date,
  bride: { name: '', phone: '' },
  groom: { name: '', phone: '' },
  invitedPeople: { total: '', groom: '', bride: '', photo: blankImage },
  decoration: { color: '', model: '', photo: blankImage },
  doorEntranceDecoration: { color: '', model: '', photo: blankImage },
  brideGroomSittingArea: { color: '', model: '', photo: blankImage },
  notes: { text: '', photos: [] }
});

export default function EventForm({ selectedDate, existingEvent, onSaved, onDeleted }) {
  const [form, setForm] = useState(getBlankForm(selectedDate));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(existingEvent || getBlankForm(selectedDate));
  }, [selectedDate, existingEvent]);

  const setNested = (path, value) => {
    setForm((current) => {
      const next = structuredClone(current);
      const keys = path.split('.');
      let target = next;
      keys.slice(0, -1).forEach((key) => {
        target[key] = target[key] || {};
        target = target[key];
      });
      target[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const normalizePayload = () => ({
    ...form,
    date: selectedDate,
    invitedPeople: {
      ...form.invitedPeople,
      total: Number(form.invitedPeople.total),
      groom: Number(form.invitedPeople.groom),
      bride: Number(form.invitedPeople.bride)
    }
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    const total = Number(form.invitedPeople.total);
    const groom = Number(form.invitedPeople.groom);
    const bride = Number(form.invitedPeople.bride);

    if (groom + bride !== total) {
      alert('Groom invited people + bride invited people must equal total invited people.');
      return;
    }

    setSaving(true);
    try {
      const payload = normalizePayload();
      const saved = form._id ? await updateEvent(form._id, payload) : await createEvent(payload);
      onSaved(saved);
      alert('Event saved successfully');
    } catch (error) {
      alert(error.response?.data?.error || error.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!form._id) return;
    if (!confirm('Delete this event?')) return;

    await deleteEvent(form._id);
    onDeleted();
  };

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <div>
          <p className="muted">Selected date</p>
          <h1>{selectedDate}</h1>
        </div>
        {form._id && <button type="button" className="danger" onClick={handleDelete}>Delete Event</button>}
      </div>

      <SectionCard title="Bride and Groom Information">
        <div className="field"><label>Bride Name *</label><input required value={form.bride.name} onChange={(e) => setNested('bride.name', e.target.value)} /></div>
        <div className="field"><label>Bride Phone *</label><input required value={form.bride.phone} onChange={(e) => setNested('bride.phone', e.target.value)} /></div>
        <div className="field"><label>Groom Name *</label><input required value={form.groom.name} onChange={(e) => setNested('groom.name', e.target.value)} /></div>
        <div className="field"><label>Groom Phone *</label><input required value={form.groom.phone} onChange={(e) => setNested('groom.phone', e.target.value)} /></div>
      </SectionCard>

      <SectionCard title="Invited People">
        <div className="field"><label>Total Invited People *</label><input required type="number" min="0" value={form.invitedPeople.total} onChange={(e) => setNested('invitedPeople.total', e.target.value)} /></div>
        <div className="field"><label>Groom Invited People *</label><input required type="number" min="0" value={form.invitedPeople.groom} onChange={(e) => setNested('invitedPeople.groom', e.target.value)} /></div>
        <div className="field"><label>Bride Invited People *</label><input required type="number" min="0" value={form.invitedPeople.bride} onChange={(e) => setNested('invitedPeople.bride', e.target.value)} /></div>
        <ImageUpload label="Guest List Photo" value={form.invitedPeople.photo} onChange={(photo) => setNested('invitedPeople.photo', photo)} />
      </SectionCard>

      <SectionCard title="Main Decoration">
        <div className="field"><label>Color *</label><input required value={form.decoration.color} onChange={(e) => setNested('decoration.color', e.target.value)} /></div>
        <div className="field"><label>Model *</label><input required value={form.decoration.model} onChange={(e) => setNested('decoration.model', e.target.value)} /></div>
        <ImageUpload label="Decoration Photo" value={form.decoration.photo} onChange={(photo) => setNested('decoration.photo', photo)} />
      </SectionCard>

      <SectionCard title="Door Entrance Decoration">
        <div className="field"><label>Color</label><input value={form.doorEntranceDecoration.color} onChange={(e) => setNested('doorEntranceDecoration.color', e.target.value)} /></div>
        <div className="field"><label>Model</label><input value={form.doorEntranceDecoration.model} onChange={(e) => setNested('doorEntranceDecoration.model', e.target.value)} /></div>
        <ImageUpload label="Door Entrance Photo" value={form.doorEntranceDecoration.photo} onChange={(photo) => setNested('doorEntranceDecoration.photo', photo)} />
      </SectionCard>

      <SectionCard title="Bride and Groom Sitting Area">
        <div className="field"><label>Color</label><input value={form.brideGroomSittingArea.color} onChange={(e) => setNested('brideGroomSittingArea.color', e.target.value)} /></div>
        <div className="field"><label>Model</label><input value={form.brideGroomSittingArea.model} onChange={(e) => setNested('brideGroomSittingArea.model', e.target.value)} /></div>
        <ImageUpload label="Sitting Area Photo" value={form.brideGroomSittingArea.photo} onChange={(photo) => setNested('brideGroomSittingArea.photo', photo)} />
      </SectionCard>

      <SectionCard title="Notes">
        <div className="field full"><label>Notes</label><textarea rows="5" value={form.notes.text} onChange={(e) => setNested('notes.text', e.target.value)} /></div>
        <ImageUpload label="Optional Notes Photos" multiple value={form.notes.photos} onChange={(photos) => setNested('notes.photos', photos)} />
      </SectionCard>

      <button className="primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Event'}</button>
    </form>
  );
}
