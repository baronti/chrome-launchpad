import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Calendar, Clock, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import AgendaForm from '@/components/AgendaForm';
import { getEventsOrderedByProximity, isEventPast } from '@/utils/eventUtils';

interface AgendaEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  createdAt: string;
}

const Agenda = () => {
  const [agendaEvents, setAgendaEvents] = useState<AgendaEvent[]>([]);
  const [backgroundImage, setBackgroundImage] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AgendaEvent | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load events and background from localStorage
  useEffect(() => {
    const savedEvents = localStorage.getItem('agenda-events');
    if (savedEvents) {
      try {
        setAgendaEvents(JSON.parse(savedEvents));
      } catch (error) {
        console.error('Error parsing agenda events:', error);
      }
    }

    const savedData = localStorage.getItem('dashboard-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setBackgroundImage(parsed.backgroundImage || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80');
      } catch (error) {
        console.error('Error parsing dashboard data:', error);
      }
    }
  }, []);

  // Sort events by proximity (future events first, then past events)
  const sortedEvents = getEventsOrderedByProximity(agendaEvents);

  const handleEventAdded = (newEvent: AgendaEvent) => {
    setAgendaEvents(prev => [...prev, newEvent]);
    setIsFormOpen(false);
    setEditingEvent(null);
  };

  const handleEventUpdated = (updatedEvent: AgendaEvent) => {
    setAgendaEvents(prev => 
      prev.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
    setIsFormOpen(false);
    setEditingEvent(null);
  };

  const handleEditEvent = (event: AgendaEvent) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    // Remove from state
    setAgendaEvents(prev => prev.filter(event => event.id !== eventId));
    
    // Remove from localStorage
    const savedEvents = localStorage.getItem('agenda-events');
    if (savedEvents) {
      const currentEvents = JSON.parse(savedEvents);
      const filteredEvents = currentEvents.filter((event: AgendaEvent) => event.id !== eventId);
      localStorage.setItem('agenda-events', JSON.stringify(filteredEvents));
    }

    toast({
      title: "Evento eliminado",
      description: "El evento ha sido eliminado correctamente"
    });
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingEvent(null);
  };


  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('es-ES', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      }),
      time: date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/40" />
      
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-8 h-8" />
              Agenda
            </h1>
          </div>
          
          <Button
            onClick={() => setIsFormOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Evento
          </Button>
        </div>

        {/* Events Grid */}
        {sortedEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8 max-w-md mx-auto">
              <Calendar className="w-16 h-16 text-white/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No hay eventos</h3>
              <p className="text-white/70 mb-4">Agrega tu primer evento a la agenda</p>
              <Button
                onClick={() => setIsFormOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Evento
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedEvents.map((event) => {
              const { date, time } = formatEventDate(event.date);
              const isPast = isEventPast(event.date);
              
              return (
                <div
                  key={event.id}
                  className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 transition-all hover:bg-white/20 ${
                    isPast ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white leading-tight">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      {isPast && (
                        <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
                          Pasado
                        </span>
                      )}
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditEvent(event)}
                          className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/20"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteEvent(event.id)}
                          className="h-8 w-8 p-0 text-white/70 hover:text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {event.description && (
                    <p className="text-white/80 text-sm mb-4 leading-relaxed">
                      {event.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-white/70">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{time}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Agenda Form Modal */}
      {isFormOpen && (
        <AgendaForm
          isOpen={isFormOpen}
          onClose={handleFormClose}
          onEventAdded={handleEventAdded}
          editingEvent={editingEvent}
          onEventUpdated={handleEventUpdated}
        />
      )}
    </div>
  );
};

export default Agenda;