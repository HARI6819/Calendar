import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import EventCard from "./EventCard";
import './index.css';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showPopUp, setPopUp] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [selectedDayLabel, setSelectedDayLabel] = useState("");
  const [selectedDay, setSelectedDay] = useState(null);
  const [conflictMessage, setConflictMessage] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(currentDate.month());
  const [selectedYear, setSelectedYear] = useState(currentDate.year());

  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    start: "",
    duration: "",
    color: "bg-yellow-200"
  });

  useEffect(() => {
    fetch("/events.json")
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error("Error loading events:", err));
  }, []);

  const startOfMonth = currentDate.startOf("month").startOf("week");
  const endOfMonth = currentDate.endOf("month").endOf("week");

  const generateCalendarDays = () => {
    const days = [];
    let day = startOfMonth;
    while (day.isBefore(endOfMonth) || day.isSame(endOfMonth, 'day')) {
      days.push(day);
      day = day.add(1, "day");
    }
    return days;
  };

  const handlePrev = () => setCurrentDate(currentDate.subtract(1, "month"));
  const handleNext = () => setCurrentDate(currentDate.add(1, "month"));
  const addEvents = () => {
    setNewEvent({
      title: "",
      date: selectedDay ? selectedDay.format("YYYY-MM-DD") : "",
      start: "",
      duration: "",
      color: "bg-yellow-200"
    });
    setShowForm(true);
  };

  const handleMonthYearChange = () => {
    const updatedDate = dayjs().year(selectedYear).month(selectedMonth);
    setCurrentDate(updatedDate);
  };

  const openEvent = (day) => {
    const filteredEvents = events.filter(e => dayjs(e.date).isSame(day, "day"));
    setSelectedDay(day);
    setSelectedDayEvents(filteredEvents);
    setSelectedDayLabel(day.format("dddd, MMM D"));
    setPopUp(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  const isOverlapping = (newEvent, existingEvent) => {
    const newStart = dayjs(`${newEvent.date}T${newEvent.start}`);
    const [h1, m1 = "0"] = newEvent.duration.split(":");
    const newEnd = newStart.add(Number(h1), "hour").add(Number(m1), "minute");

    const existingStart = dayjs(`${existingEvent.date}T${existingEvent.start}`);
    const [h2, m2 = "0"] = existingEvent.duration.split(":");
    const existingEnd = existingStart.add(Number(h2), "hour").add(Number(m2), "minute");

    return newStart.isBefore(existingEnd) && existingStart.isBefore(newEnd);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const overlappingEvent = events.find(event =>
      event.date === newEvent.date && isOverlapping(newEvent, event)
    );

    if (overlappingEvent) {
      setConflictMessage(`Overlaps with "${overlappingEvent.title}" at ${overlappingEvent.start}`);
      setTimeout(() => setConflictMessage(""), 4000);
      return;
    }

    const newId = events.length + 1;
    const eventToAdd = { id: newId, ...newEvent };
    setEvents([...events, eventToAdd]);

    if (selectedDay && dayjs(eventToAdd.date).isSame(selectedDay, 'day')) {
      setSelectedDayEvents(prev => [...prev, eventToAdd]);
    }

    setNewEvent({ title: "", date: "", start: "", duration: "", color: "bg-yellow-200" });
    setShowForm(false);
  };

  const cancelPopup = () => {
    setShowForm(false);
  };

  const removeEvent = (idToRemove) => {
    const updatedEvents = events.filter(event => event.id !== idToRemove);
    setEvents(updatedEvents);

    if (selectedDay) {
      const updatedSelected = updatedEvents.filter(e => e.date === selectedDay.format("YYYY-MM-DD"));
      setSelectedDayEvents(updatedSelected);
    }
  };

  return (<>
    {/* <div className="max-w-5xl mx-auto p-2 bor-color scrollbar-hidden backimg">
     </div> */}
    <div className="flex max-w-6xl mx-auto Cstring">
      <img src="./Cstring.png" className="calenderString"></img>
      <img src="./Cstring.png" className="calenderString2"></img>
    </div>

    <div className="max-w-6xl mx-auto p-2 bor-color scrollbar-hidden backimg dateBox">
      {conflictMessage && (
        <div className="fixed top-5 right-5 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded shadow-lg animate-slide-in">
          {conflictMessage}
        </div>
      )}

      <div className="eventspage">
        <div className="eventfont scrollbar-hidden">
          <h1 className="text-4xl font-bold text-red-400 mt-10 AddEventbtn">Events</h1>
          {events.filter(event => {
            const eventDate = dayjs(event.date);
            return eventDate.month() === currentDate.month() && eventDate.year() === currentDate.year();
          })
            .map(event => (
              <div key={event.id} className={`p-4 rounded text-red-200 mb-2 eventsBorder`}>
                <h3 className="text-lg font-bold ">{event.title}</h3>
                <p>Date: {event.date}</p>
                <p>Start: {event.start}</p>
                <p>Duration: {event.duration} hrs</p>
              </div>
            ))}
        </div>
      </div>
      <div className="flex items-center mb-6 mt-10">
        <h2 className="text-4xl font-bold">{currentDate.format("MMMM YYYY")}</h2>
        <button onClick={handlePrev} className="px-4 py-1 bg-red-300 text-2xl rounded adjust">←</button>
        <button onClick={handleNext} className="px-4 py-1 bg-red-300 text-2xl rounded adjust">→</button>
      </div>


      <div className="grid grid-cols-7 gap-2 text-center font-semibold">
        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(day => (
          <div key={day} className={day === "SUN" ? "text-red-500" : ""}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 mt-3">
        {generateCalendarDays().map(day => {
          const isToday = day.isSame(dayjs(), "day");
          const dayEvents = events.filter(e => dayjs(e.date).isSame(day, "day"));

          return (
            <div
              onClick={() => openEvent(day)}
              key={day.format("YYYY-MM-DD")}

              className={`border-t-4 border-black-300 p-2 text-left h-50 overflow-y-auto scrollbar-hidden ${isToday ? 'bg-blue-200 border-blue-500' : ''} ${day.day() === 0 ? 'text-red-500' : ''}`}
            >
              <div className="text-2xl font-bold">{day.date()}</div>
              <div className="mt-1 space-y-1 ">
                {dayEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showPopUp && (
        <div className="fixed inset-0 popupEvents flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded max-w-md w-full relative h-160 popupDetails">
            <h2 className="text-xl font-bold mb-4 text-center">{selectedDayLabel}</h2>
            {selectedDayEvents.length > 0 ? (
              <div className="space-y-2 max-h-111 overflow-y-auto scrollbar-hidden">
                {selectedDayEvents.map(event => (
                  <div key={event.id} className={`p-2 rounded ${event.color}`}>
                    <h3 className="font-semibold">{event.title}</h3>
                    <p>Start: {event.start}</p>
                    <p>Duration: {event.duration}</p>
                    <button
                      onClick={() => removeEvent(event.id)}
                      className="text-xs mt-1 bg-red-500 text-white px-2 py-1 rounded flex justify-self-end"
                    >
                      Delete
                    </button>
                  </div>
                ))}

              </div>
            ) : (
              <p className="text-gray-500 text-center">No Events</p>
            )}
            <button className="text-white cursor-pointer bg-green-700 rounded pl-2 pr-2 pt-1 pb-1 mt-5 AddEventbtn" onClick={addEvents}>Add Events</button>
            {showForm && (
              <form onSubmit={handleFormSubmit} className="p-4 bg-gray-100 rounded shadow-md max-w-md popup">
                <input type="text" name="title" placeholder="Event Title" value={newEvent.title} onChange={handleInputChange} className="block w-full p-2 mb-2 border rounded" required />
                <input type="date" name="date" value={newEvent.date} onChange={handleInputChange} className="block w-full p-2 mb-2 border rounded" required />
                <input type="time" name="start" value={newEvent.start} onChange={handleInputChange} className="block w-full p-2 mb-2 border rounded" required />
                <input type="text" name="duration" placeholder="Duration (HH:MM)" value={newEvent.duration} onChange={handleInputChange} className="block w-full p-2 mb-2 border rounded" required />
                <select name="color" value={newEvent.color} onChange={handleInputChange} className="block w-full p-2 mb-4 rounded bg-gray-300 h-12">
                  <option value="bg-blue-200">Blue</option>
                  <option value="bg-green-200">Green</option>
                  <option value="bg-yellow-200">Yellow</option>
                  <option value="bg-red-200">Red</option>
                  <option value="bg-purple-200">Purple</option>
                </select>
                <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Add to Calendar</button>
                <button className="bg-red-500 p-2 rounded ml-5 pl-5 pr-5 text-white" onClick={cancelPopup}>Cancel</button>
              </form>

            )}

            <button
              onClick={() => setPopUp(false)}
              className="absolute bottom-2 right-6 text-sm bg-black text-white px-46 py-3 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  </>);
};

export default Calendar;
