import React, { useState, useEffect } from 'react';
import './EntryModal.css';

const EntryModal = ({ onSave, onDelete, onClose, selectedDate, currentEvent, selectedResource }) => {
  const [type, setType] = useState('Work');
  const [name, setName] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [recurrenceCount, setRecurrenceCount] = useState(1);

  useEffect(() => {
    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      return d.toISOString().slice(0, 16);
    };

    if (selectedDate) {
      const defaultStart = formatDate(new Date(selectedDate).setHours(8, 0));
      const defaultEnd = formatDate(new Date(selectedDate).setHours(16, 0));
      setStart(defaultStart);
      setEnd(defaultEnd);
    }
    if (currentEvent) {
      const [eventType, eventName] = currentEvent.title.split(': ');
      setType(eventType);
      setName(eventName);
      setStart(formatDate(currentEvent.start));
      setEnd(formatDate(currentEvent.end));
    } else if (selectedResource) {
      setName(selectedResource.charAt(0).toUpperCase() + selectedResource.slice(1));
    }
  }, [selectedDate, currentEvent, selectedResource]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && start && (type === 'Work' ? end : true)) {
      const newEvent = {
        id: currentEvent ? currentEvent.id : null,
        resourceId: selectedResource,
        title: `${type}: ${name}`,
        start: new Date(start).toISOString(),
        end: type === 'Work' ? new Date(end).toISOString() : null,
        recurrenceCount: recurring ? recurrenceCount : 1
      };
      onSave([newEvent]);
      setName('');
      setStart('');
      setEnd('');
      setType('Work');
      setRecurring(false);
      setRecurrenceCount(1);
    } else {
      alert('Please fill in all required fields.');
    }
  };

  const handleDelete = () => {
    if (currentEvent && onDelete) {
      onDelete(currentEvent.id);
    }
    onClose();
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-group">
          <label>Type:</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="form-control">
            <option value="Work">Work</option>
            <option value="Freetime">Freetime</option>
            <option value="Holiday">Holiday</option>
            <option value="Sick">Sick</option>
          </select>
        </div>
        <div className="form-group">
          <label>Name:</label>
          <select value={name} onChange={(e) => setName(e.target.value)} className="form-control">
            <option value="">Select a name</option>
            {['Werner', 'Günther', 'Miro', 'Gaby', 'Thomas', 'Heinz', 'Martin', 'Patrick'].map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Start:</label>
          <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} className="form-control" />
        </div>
        {type === 'Work' && (
          <div className="form-group">
            <label>End:</label>
            <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} className="form-control" />
          </div>
        )}
        <div className="form-group">
          <label>Recurring:</label>
          <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
          {recurring && (
            <input type="number" value={recurrenceCount} onChange={(e) => setRecurrenceCount(e.target.value)} className="form-control" style={{ width: '60px', display: 'inline-block', marginLeft: '10px' }} min="1" />
          )}
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">Save</button>
          {currentEvent && <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete</button>}
          <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </form>
    </div>
  );
};

export default EntryModal;
