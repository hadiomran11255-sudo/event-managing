import { useEffect, useMemo, useState } from 'react';
import Calendar from 'react-calendar';
import EventForm from '../components/EventForm.jsx';
import { getEventByDate, getEvents } from '../api/eventApi.js';

const toDateString = (date) => date.toISOString().slice(0, 10);

export default function CalendarPage() {
  const [selected, setSelected] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDates, setEventDates] = useState([]);
  const [loading, setLoading] = useState(false);

  const selectedDate = useMemo(() => toDateString(selected), [selected]);

  const loadAllEvents = async () => {
    try {
      const events = await getEvents();
      setEventDates(events.map((event) => event.date));
    } catch (error) {
      console.error(error);
    }
  };

  const loadSelectedEvent = async (date) => {
    setLoading(true);
    try {
      const event = await getEventByDate(date);
      setSelectedEvent(event);
    } catch (error) {
      if (error.response?.status === 404) setSelectedEvent(null);
      else alert(error.response?.data?.message || 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllEvents();
  }, []);

  useEffect(() => {
    loadSelectedEvent(selectedDate);
  }, [selectedDate]);

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <h1>Wedding Planner</h1>
        <p>Select a calendar date to create, view, or edit an event.</p>
        <Calendar
          onChange={setSelected}
          value={selected}
          tileClassName={({ date, view }) => {
            if (view === 'month' && eventDates.includes(toDateString(date))) {
              return 'has-event';
            }
            return null;
          }}
        />
        <div className="legend"><span></span> Date has saved event</div>
      </aside>

      <section className="content">
        {loading ? (
          <div className="loading">Loading selected date...</div>
        ) : (
          <EventForm
            selectedDate={selectedDate}
            existingEvent={selectedEvent}
            onSaved={(saved) => {
              setSelectedEvent(saved);
              loadAllEvents();
            }}
            onDeleted={() => {
              setSelectedEvent(null);
              loadAllEvents();
            }}
          />
        )}
      </section>
    </main>
  );
}
