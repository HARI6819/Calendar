import React from "react";
import dayjs from "dayjs";
import './index.css'

const EventCard = ({ event }) => {
  const start = dayjs(`${event.date} ${event.start}`);
  const end = start.add(
    Number(event.duration.split(":")[0]), "hour"
  ).add(
    Number(event.duration.split(":")[1]), "minute"
  );

  return (
    <div className={`text-xs p-1 rounded ${event.color || "bg-gray-200"}`}>
      <strong>{event.title}</strong><br />
      {event.start} → {end.format("HH:mm")}
    </div>
  );
};

export default EventCard;
