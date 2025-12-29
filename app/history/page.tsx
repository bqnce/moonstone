"use client"

import { useEffect, useState } from "react";

interface EventItem {
  _id: string;
  timestamp: string;
  source: string;
  delta: number;
  balanceAfter: number;
  currency: string;
  category: string;
  subcategory?: string;
}

export default function HistoryPage() {
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    fetch("/api/events?limit=50")
      .then((res) => res.json())
      .then((data) => {
        // A válasz { data: [], meta: {} } formátumú
        if (data.data) setEvents(data.data);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-8">
      {/* --- RAW EVENT LOG (DEBUG VIEW) --- */}
      <div className="mt-12 p-4 border-t border-zinc-800">
        <h3 className="text-white font-mono mb-4 text-lg">
          Event Log (Last 50)
        </h3>

        <div className="space-y-1 font-mono text-sm text-zinc-400">
          {events.map((event) => (
            <div key={event._id}>
              <span className="text-zinc-500">
                [{new Date(event.timestamp).toLocaleString("hu-HU")}]
              </span>{" "}
              <span className="font-bold text-white uppercase">
                {event.source}
              </span>{" "}
              {/* Színkódolt Delta */}
              <span
                className={event.delta > 0 ? "text-green-500" : "text-red-500"}
              >
                {event.delta > 0 ? "+" : ""}
                {event.delta} {event.currency}
              </span>{" "}
              <span>→ balance: {event.balanceAfter}</span>{" "}
              <span className="text-zinc-600 text-xs">
                ({event.category}{" "}
                {event.subcategory ? `/ ${event.subcategory}` : ""})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
