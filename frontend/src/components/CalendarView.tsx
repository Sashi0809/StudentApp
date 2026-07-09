import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import EventModal, { type CalendarEvent } from './EventModal';
import api from '../lib/axios';

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to fetch events', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Build calendar grid
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null); // Empty slots for previous month
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // Format date to YYYY-MM-DD
  const formatDateString = (year: number, month: number, day: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const getEventsForDate = (dateStr: string) => {
    // events.event_date from postgres is typically an ISO string or just date. Let's compare safely.
    return events.filter(e => {
      const eDate = new Date(e.event_date);
      return formatDateString(eDate.getUTCFullYear(), eDate.getUTCMonth(), eDate.getUTCDate()) === dateStr;
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-semibold mb-6 text-blue-100 flex items-center gap-2">
        <CalendarIcon className="text-blue-400" /> Schedule & Events
      </h2>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-xl backdrop-blur-md">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white tracking-wide">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 bg-black/30 hover:bg-white/10 rounded-lg transition-colors text-gray-300">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextMonth} className="p-2 bg-black/30 hover:bg-white/10 rounded-lg transition-colors text-gray-300">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square bg-white/[0.02] rounded-lg"></div>;
            }

            const dateStr = formatDateString(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dayEvents = getEventsForDate(dateStr);
            const isToday = formatDateString(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) === dateStr;

            return (
              <div 
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`aspect-square relative flex flex-col p-2 rounded-lg cursor-pointer transition-all border ${
                  isToday ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-white/5 bg-black/20 hover:border-white/30 hover:bg-white/5'
                }`}
              >
                <span className={`text-sm font-medium ${isToday ? 'text-blue-400' : 'text-gray-300'}`}>
                  {day}
                </span>
                
                {/* Event Indicators */}
                <div className="mt-auto flex flex-col gap-1 overflow-hidden">
                  {dayEvents.slice(0, 2).map((ev, i) => {
                    const isDatesheet = ev.user_id === null;
                    return (
                      <div key={i} className={`text-[10px] truncate px-1 rounded border ${
                        isDatesheet 
                          ? 'bg-emerald-600/40 text-emerald-100 border-emerald-500/30' 
                          : 'bg-blue-600/40 text-blue-100 border-blue-500/30'
                      }`}>
                        {ev.title}
                      </div>
                    );
                  })}
                  {dayEvents.length > 2 && (
                    <div className="text-[10px] text-gray-400 pl-1">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <EventModal 
          date={selectedDate} 
          events={getEventsForDate(selectedDate)}
          onClose={() => setSelectedDate(null)}
          onEventChanged={fetchEvents}
        />
      )}
    </div>
  );
}
