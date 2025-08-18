import React, { useState, useEffect } from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { getFutureEvents, isEventToday, isEventTomorrow } from '@/utils/eventUtils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

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
          
          // Get future events for carousel pagination
          const futureEvents = getFutureEvents(parsedEvents, 20);
          
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


  // Group events into chunks of 4
  const groupEventsInChunks = (events: AgendaEvent[], chunkSize: number) => {
    const chunks = [];
    for (let i = 0; i < events.length; i += chunkSize) {
      chunks.push(events.slice(i, i + chunkSize));
    }
    return chunks;
  };

  const eventChunks = groupEventsInChunks(events, 4);

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
      
      <div className="relative">
        {events.length > 0 ? (
          <Carousel className="w-full">
            <CarouselContent>
              {eventChunks.map((chunk, chunkIndex) => (
                <CarouselItem key={chunkIndex}>
                  <div className="space-y-3">
                    {chunk.map((event) => (
                      <div 
                        key={event.id}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group"
                        onClick={() => navigate('/agenda')}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              isEventToday(event.date) 
                                ? 'bg-red-500/20 text-red-300' 
                                : isEventTomorrow(event.date)
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
                    ))}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {eventChunks.length > 1 && (
              <>
                <CarouselPrevious className="absolute -left-3 top-1/2 -translate-y-1/2 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white" />
                <CarouselNext className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white" />
              </>
            )}
          </Carousel>
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