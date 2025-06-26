import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import Events from "./Events";
import './index.css';


const Calendar = () => {
  const [SDayEvents, setSDayEvents] = useState([]);
  const [SDayLabel, setSDayLabel] = useState("");
  const [SDay, setSDay] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [CDate, setCDate] = useState(dayjs());
  const [PopUpMessage, setPopUpMessage] = useState("");
  const [checked, setChecked] = useState(false);
  const [showPopUp, setPopUp] = useState(false);
  const [EventsList, setEvents] = useState([]);
  const [newEventList, setNewEventList] = useState({
    title: "",
    date: "",
    start: "",
    duration: "",
    color: "bg-yellow-200"
  });

  const CheckboxChange = () => {
    setChecked(!checked);
  };

  useEffect(() => {
    fetch("/events.json")
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error("Error loading events :", err));
  }, []);

  const SOfMonth = CDate.startOf("month").startOf("week");
  const EOfMonth = CDate.endOf("month").endOf("week");

  const DaysList = () => {
    const days = [];
    let day = SOfMonth;
    while (day.isBefore(EOfMonth) || day.isSame(EOfMonth, 'day')) {
      days.push(day);
      day = day.add(1, "day");
    }
    return days;
  };

  const PrevMonthBtn = () => setCDate(CDate.subtract(1, "month"));
  const NextMonthBtn = () => setCDate(CDate.add(1, "month"));
  const addEvents = () => {
    setNewEventList({
      title: "",
      date: SDay ? SDay.format("YYYY-MM-DD") : "",
      start: "",
      duration: "",
      color: "bg-yellow-200"
    });
    setShowForm(true);
  };

  const openEvent = (day) => {
    const filteredEvents = EventsList.filter(e => dayjs(e.date).isSame(day, "day"));
    setSDay(day);
    setSDayEvents(filteredEvents);
    setSDayLabel(day.format("dddd, MMM D"));
    setPopUp(true);
  };

  const InputBox = (e) => {
    const { name, value } = e.target;
    setNewEventList(prev => ({ ...prev, [name]: value }));
  };

  const isOverlapping = (newEventList, existingEvent) => {
    const newStart = dayjs(`${newEventList.date}T${newEventList.start}`);
    const [h1, m1 = "0"] = newEventList.duration.split(":");
    const newEnd = newStart.add(Number(h1), "hour").add(Number(m1), "minute");

    const existingStart = dayjs(`${existingEvent.date}T${existingEvent.start}`);
    const [h2, m2 = "0"] = existingEvent.duration.split(":");
    const existingEnd = existingStart.add(Number(h2), "hour").add(Number(m2), "minute");

    return newStart.isBefore(existingEnd) && existingStart.isBefore(newEnd);
  };

  const FormSubmit = (e) => {
    e.preventDefault();

    const overlappingEvent = EventsList.find(event =>
      event.date === newEventList.date && isOverlapping(newEventList, event)
    );

    if (overlappingEvent) {
      setPopUpMessage(`Overlaps with "${overlappingEvent.title}" at ${overlappingEvent.start}`);
      setTimeout(() => setPopUpMessage(""), 4000);
      return;
    }

    const newId = EventsList.length + 1;
    const eventToAdd = { id: newId, ...newEventList };
    setEvents([...EventsList, eventToAdd]);

    if (SDay && dayjs(eventToAdd.date).isSame(SDay, 'day')) {
      setSDayEvents(prev => [...prev, eventToAdd]);
    }

    setNewEventList({ title: "", date: "", start: "", duration: "", color: "bg-yellow-200" });
    setShowForm(false);
  };

  const cancelPopUp = () => {
    setShowForm(false);
  };

  const removeEvent = (idToRemove) => {
    const updatedEvents = EventsList.filter(event => event.id !== idToRemove);
    setEvents(updatedEvents);

    if (SDay) {
      const updatedSelected = updatedEvents.filter(e => e.date === SDay.format("YYYY-MM-DD"));
      setSDayEvents(updatedSelected);
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
      {PopUpMessage && (
        <div className="fixed top-5 right-5 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded shadow-lg animate-slide-in">
          {PopUpMessage}
        </div>
      )}

      <div className="eventspage">
        <div className={` eventfont scrollbar-hidden ${checked ? "moved" : ""}`}>
          <h1 className="text-4xl font-bold text-red-400 mt-10 AddEventbtn">Events</h1>
          {EventsList.filter(event => {
            const eventDate = dayjs(event.date);
            return eventDate.month() === CDate.month() && eventDate.year() === CDate.year();
          })
            .map(event => (
              <div key={event.id} className={`p-4 rounded text-red-200 mb-2 eventsBorder`}>
                <h3 className="text-lg font-bold eventtitle">{event.title}</h3>
                <p>Date: {event.date}</p>
                <p>Start: {event.start}</p>
                <p>Duration: {event.duration} hrs</p>
              </div>
            ))}
        </div>
      </div>
      <div className="flex items-center mb-6 mt-10">
        <h2 className="text-4xl font-bold dateHead">{CDate.format("MMMM YYYY")}</h2>
        <button onClick={PrevMonthBtn} className="px-4 py-1 bg-red-300 text-2xl rounded adjust">←</button>
        <button onClick={NextMonthBtn} className="px-4 py-1 bg-red-300 text-2xl rounded adjust">→</button>
        <label className="toggellabel">
        <input type="checkbox" checked={checked} onChange={CheckboxChange} className={`mr-2 togglebtn `}/>< i class={`bx  bx-menu-select `} style={{color:checked ? "#ffffff" : undefined}} ></i></label>
      </div>


      <div className="grid grid-cols-7 gap-2 text-center font-semibold gridDate">
        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(day => (
          <div key={day} className={day === "SUN" ? "text-red-500" : ""}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 mt-3 gridouter scrollbar-hidden">
        {DaysList().map(day => {
          const isToday = day.isSame(dayjs(), "day");
          const dayEvents = EventsList.filter(e => dayjs(e.date).isSame(day, "day"));

          return (
            <div title="Click to See More"
              onClick={() => openEvent(day)}
              key={day.format("YYYY-MM-DD")}
              className={`border-t-4 border-black-300 p-2 text-left h-50 overflow-y-auto scrollbar-hidden gridDate2 ${isToday ? 'bg-blue-200 border-blue-500' : ''} ${day.day() === 0 ? 'text-red-500' : ''}`}
            >
              <div className="text-2xl font-bold datefont">{day.date()}</div>
              <div className="mt-1 space-y-1">
                {dayEvents.map(event => (
                  <Events key={event.id} event={event} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showPopUp && (
        <div className="fixed inset-0 popupEvents flex items-center justify-center z-50 PopUpBox">
          <div className="bg-white p-6 rounded max-w-md w-full relative  popupDetails">
            <h2 className="text-xl font-bold mb-4 text-center">{SDayLabel}</h2>
            {SDayEvents.length > 0 ? (
              <div className="space-y-2 overflow-y-auto scrollbar-hidden PopupEventDetails">
                {SDayEvents.map(event => (
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
              <form onSubmit={FormSubmit} className="p-4 bg-gray-100 rounded shadow-md max-w-md popup formBox scrollbar-hidden">
                <input type="text" name="title" placeholder="Event Title" value={newEventList.title} onChange={InputBox} className="block w-full p-2 mb-2 border rounded" required />
                <input type="date" name="date" value={newEventList.date} onChange={InputBox} className="block w-1/2 mr-2 p-2 mb-2 border rounded float-left" required />
                <input type="time" name="start" value={newEventList.start} onChange={InputBox} className="block w-47/100 p-2 mb-2 border rounded" required />
                <input type="text" name="duration" placeholder="Duration (HH:MM)" value={newEventList.duration} onChange={InputBox} className="block w-full p-2 mb-2 border rounded" required />
                <label className="labelcolor">Choose the Color</label><br></br>

                <div className="flex flex-wrap gap-2 mb-4">
                  {["bg-yellow-200","bg-green-400","bg-red-400 text-gray-100","bg-purple-300","bg-blue-400","bg-gray-400","bg-orange-300","bg-blue-200",
                  ].map((color, index) => (
                    <label key={index} className="inline-flex items-center cursor-pointer">
                      <input type="radio" name="color" value={color} checked={newEventList.color === color} onChange={InputBox} className="hidden peer"/>
                      <span
                        className={`px-4 py-4 rounded-full colorbtn ${color} peer-checked:border peer-checked:border-black`}
                      ></span>
                    </label>
                  ))}
                </div>


                <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Add to Calendar</button>
                <button className="bg-red-500 p-2 rounded ml-5 pl-5 pr-5 text-white" onClick={cancelPopUp}>Cancel</button>
              </form>

            )}

            <button
              onClick={() => setPopUp(false)}
              className="absolute bottom-2 right-6 left-6 text-sm bg-black text-white py-3 rounded-lg closeBTN"
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
