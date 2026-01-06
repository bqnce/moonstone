"use client";

import React, { useEffect, useState } from "react";
import { EventItem } from "./types";
import PageHeader from "./_components/PageHeader";
import HistoryFilters from "./_components/HistoryFilters";
import HistoryTable from "./_components/HistoryTable";

export default function HistoryPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  // FILTER STATE
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const query = selectedSource
      ? `?limit=50&source=${selectedSource}`
      : `?limit=50`;

    fetch(`/api/events${query}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setEvents(data.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedSource]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen animate-in fade-in zoom-in-95 duration-500">
      
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <PageHeader />
        <HistoryFilters 
          selectedSource={selectedSource}
          onSelectSource={setSelectedSource}
        />
      </div>

      {/* Table Container */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl min-h-[400px]">
        <HistoryTable 
          events={events} 
          loading={loading} 
        />
      </div>

      {/* Footer Info */}
      <div className="mt-4 flex justify-between items-center text-xs text-zinc-500 px-2">
        <span>
          {selectedSource
            ? `Filtering by ${selectedSource}`
            : "Showing all events"}
        </span>
        <span>Showing up to 50 results</span>
      </div>
    </div>
  );
}