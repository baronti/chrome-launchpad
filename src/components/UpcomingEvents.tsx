import React, { useState, useEffect } from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface AgendaEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  createdAt: string;
}

const UpcomingEvents: React.FC = () => {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadEvents = () => {
      const savedEvents = localStorage.getItem('agenda-events');
      if (savedEvents) {
        try {
          const parsedEvents = JSON.parse(savedEvents);
          
          // Filter future events and sort chronologically
          const now = new Date();
          const futureEvents = parsedEvents
            .filter((event: AgendaEvent) => new Date(event.date) >= now)
            .sort((a: AgendaEvent, b: AgendaEvent) => 
              new Date(a.date).getTime() - new Date(b.date).getTime()
            )
            .slice(0, 5); // Show only next 5 events
          
          setEvents(futureEvents);
        } catch (error) {
          console.error('Error loading events:', error);
        }
      }
    };

    loadEvents();

    // Listen for changes in localStorage (when events are added from Agenda page)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'agenda-events') {
        loadEvents();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check for changes periodically (for same-tab updates)
    const interval = setInterval(loadEvents, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const formatEventDate = (dateString: string) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    
    if (eventDateOnly.getTime() === today.getTime()) {
      return `Hoy ${eventDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (eventDateOnly.getTime() === tomorrow.getTime()) {
      return `Mañana ${eventDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return eventDate.toLocaleString('es-ES', { 
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const isToday = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  };

  const isTomorrow = (dateString: string) => {
    const eventDate = new Date(dateString);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return eventDate.toDateString() === tomorrow.toDateString();
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 h-fit">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-white" />
          <h3 className="text-lg font-semibold text-white">Próximos Eventos</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/agenda')}
          className="text-white/70 hover:text-white hover:bg-white/10 p-1"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="space-y-3">
        {events.length > 0 ? (
          events.map((event) => (
            <div 
              key={event.id}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group"
              onClick={() => navigate('/agenda')}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isToday(event.date) 
                      ? 'bg-red-500/20 text-red-300' 
                      : isTomorrow(event.date)
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {formatEventDate(event.date)}
                  </span>
                </div>
                <p className="text-white font-medium mt-1 truncate group-hover:text-white/90">
                  {event.title}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <Calendar className="w-8 h-8 text-white/30 mx-auto mb-2" />
            <p className="text-white/60 text-sm">No hay eventos próximos</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/agenda')}
              className="mt-3 bg-white/5 border-white/20 text-white/70 hover:bg-white/10 hover:text-white text-xs"
            >
              Agregar evento
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingEvents;