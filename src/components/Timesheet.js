import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin from '@fullcalendar/interaction';
import '@fullcalendar/common/main.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Calendar.css';
import EntryModal from './EntryModal';
import logo from './logo.png';

const Timesheet = () => {
  const [events, setEvents] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);
  const [resources, setResources] = useState([
    { id: '0', title: 'Werner', group: 'Gruppe 1' },
    { id: '1', title: 'Gaby', group: 'Gruppe 1' },
    { id: '2', title: 'Günther', group: 'Gruppe 1' },
    { id: '3', title: 'Thomas', group: 'Gruppe 1' },
    { id: '4', title: 'Miro', group: 'Gruppe 1' },
    { id: '6', title: 'Martin', group: 'Gruppe 2' },
    { id: '7', title: 'Heinz', group: 'Gruppe 2' },
    { id: '9', title: 'Patrick', group: 'Gruppe 3' }
  ]);

  useEffect(() => {
    fetch('/api/entries')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        const parsedEvents = data.map(entry => {
          const startDate = new Date(entry.date);
          let endDate = null;

          if (entry.endHour && entry.endHour !== "") {
            const [endHour, endMinute] = entry.endHour.split(':').map(Number);
            endDate = new Date(entry.date);
            endDate.setHours(endHour, endMinute);
          }

          return {
            id: entry._id,
            title: `${entry.type}: ${resources.find(resource => resource.id === entry.user)?.title || entry.user}`,
            start: startDate.toISOString(),
            end: endDate ? endDate.toISOString() : null,
            resourceId: entry.user,
            classNames: [entry.type] // Add class name based on entry type
          };
        });
        setEvents(parsedEvents);
      })
      .catch(error => console.error('Error fetching events:', error));
  }, [resources]);

  const renderEventContent = (eventInfo) => {
    const startTime = eventInfo.event.start ? eventInfo.event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    const endTime = eventInfo.event.end ? eventInfo.event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    const title = eventInfo.event.title.split(': ')[1];

    return (
      <>
        <b className="fc-event-time">{startTime} - {endTime}</b><br />
        <i>{title}</i>
      </>
    );
  };

  const handleDateClick = (info) => {
    setSelectedDate(info.dateStr);
    setSelectedResource(info.resource ? info.resource.id : null);
    setCurrentEvent(null);
    setIsFormVisible(true);
  };

  const handleEventClick = (info) => {
    setSelectedDate(info.event.startStr);
    setSelectedResource(info.event.extendedProps.resourceId);
    setCurrentEvent(info.event);
    setIsFormVisible(true);
  };

  const handleSaveEvent = (newEvents) => {
    newEvents.forEach((newEvent, index) => {
      const formattedEvents = [];
      for (let i = 0; i < (newEvent.recurrenceCount || 1); i++) {
        const offset = i * 24 * 60 * 60 * 1000; // Offset in milliseconds for each day
        const formattedEvent = {
          user: newEvent.resourceId,
          date: new Date(new Date(newEvent.start).getTime() + offset).toISOString(),
          type: newEvent.title.split(': ')[0],
          startHour: new Date(newEvent.start).toISOString().split('T')[1].slice(0, 5),
          endHour: new Date(newEvent.end).toISOString().split('T')[1].slice(0, 5),
          hours: newEvent.end ? (new Date(newEvent.end) - new Date(newEvent.start)) / (1000 * 60 * 60) : 0
        };
        formattedEvents.push(formattedEvent);
      }

      console.log('Sending events:', formattedEvents); // Add logging to see the data being sent

      formattedEvents.forEach((formattedEvent) => {
        let url = '/api/entries';
        let method = 'POST';

        if (newEvent.id) {
          url = `/api/entries/${newEvent.id}`;
          method = 'PUT';
        }

        fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formattedEvent)
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          console.log('Saved event:', data);

          // Immediately update state to reflect the new or updated event
          setEvents(prevEvents => {
            if (method === 'POST') {
              return [
                ...prevEvents,
                {
                  id: data._id,
                  title: `${data.type}: ${resources.find(resource => resource.id === data.user)?.title || data.user}`,
                  start: data.date,
                  end: data.endHour ? new Date(data.date).setHours(...data.endHour.split(':')) : null,
                  resourceId: data.user,
                  classNames: [data.type]
                }
              ];
            } else {
              return prevEvents.map(event => event.id === data._id ? {
                id: data._id,
                title: `${data.type}: ${resources.find(resource => resource.id === data.user)?.title || data.user}`,
                start: data.date,
                end: data.endHour ? new Date(data.date).setHours(...data.endHour.split(':')) : null,
                resourceId: data.user,
                classNames: [data.type]
              } : event);
            }
          });
        })
        .catch(error => console.error('Error saving event:', error));
      });
    });
    setIsFormVisible(false); // Close the form after saving
  };

  const handleDeleteEvent = async (id) => {
    console.log('Deleting event ID:', id);
    // Immediately update state to reflect the deleted event
    setEvents(prevEvents => prevEvents.filter(event => event.id !== id));

    try {
      const response = await fetch(`/api/entries/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('Deleted event:', data);
    } catch (error) {
      console.error('Error deleting event:', error);
      // Revert state update if deletion fails
      setEvents(prevEvents => [...prevEvents, events.find(event => event.id === id)]);
    }
  };

  const handleCloseForm = () => {
    setIsFormVisible(false);
  };

  return (
    <div className="container">
      <header className="header">
        <img src={logo} alt="Logo" className="logo" />
        <h1 className="title">Taxi-Novak Fahrerplan</h1>
      </header>
      {isFormVisible && (
        <div className="form-popup">
          <EntryModal
            onSave={handleSaveEvent}
            onDelete={handleDeleteEvent}
            selectedDate={selectedDate}
            onClose={handleCloseForm}
            currentEvent={currentEvent}
            selectedResource={selectedResource}
          />
        </div>
      )}
      <FullCalendar
        plugins={[resourceTimelinePlugin, interactionPlugin]}
        initialView="resourceTimelineWeek"
        locale="de"
        resources={resources}
        events={events}
        eventContent={renderEventContent} // Custom event display
        dateClick={handleDateClick} // Handle date click
        eventClick={handleEventClick} // Handle event click
        slotLabelFormat={{ weekday: 'short', day: 'numeric' }} // Show days of the week
        slotLabelInterval={{ days: 1 }} // Interval for slot labels
        slotDuration={{ days: 1 }} // Duration for each slot
        firstDay={1} // Start the week on Monday
        resourceAreaHeaderContent="Fahrer" // Change resource area header to "Fahrer"
        eventClassNames={(arg) => `fc-event ${arg.event.extendedProps.classNames}`} // Assign class names for styling
        resourceGroupField="group" // Ensure resource grouping
      />
    </div>
  );
};

export default Timesheet;
