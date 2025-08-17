import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface AgendaEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  createdAt: string;
}

interface AgendaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onEventAdded: (event: AgendaEvent) => void;
  editingEvent?: AgendaEvent | null;
  onEventUpdated?: (event: AgendaEvent) => void;
}

const AgendaForm: React.FC<AgendaFormProps> = ({ 
  isOpen, 
  onClose, 
  onEventAdded, 
  editingEvent = null, 
  onEventUpdated 
}) => {
  const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '' });
  const { toast } = useToast();

  // Load event data when editing
  React.useEffect(() => {
    if (editingEvent) {
      setNewEvent({
        title: editingEvent.title,
        description: editingEvent.description,
        date: editingEvent.date
      });
    } else {
      setNewEvent({ title: '', description: '', date: '' });
    }
  }, [editingEvent]);

  const sendToTelegram = async (event: AgendaEvent): Promise<boolean> => {
    const apiUrl = `https://api.telegram.org/bot8362697237:AAEvPBT27oNL9Up8lJyce3Vy-vWIGubuM8E/sendMessage`;
    const chatId = "5266936879";
    
    const message = `📅 NUEVA AGENDA
Título: ${event.title}
Descripción: ${event.description || 'Sin descripción'}
Fecha: ${new Date(event.date).toLocaleString('es-ES')}
Enviado desde: Dashboard Baronti`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending to Telegram:', error);
      return false;
    }
  };

  const handleSaveEvent = async () => {
    if (!newEvent.title || !newEvent.date) {
      toast({
        title: "Error",
        description: "El título y la fecha son requeridos",
        variant: "destructive"
      });
      return;
    }

    if (editingEvent) {
      // Update existing event
      const updatedEvent: AgendaEvent = {
        ...editingEvent,
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date
      };

      // Update in localStorage
      const savedEvents = localStorage.getItem('agenda-events');
      const currentEvents = savedEvents ? JSON.parse(savedEvents) : [];
      const eventIndex = currentEvents.findIndex((e: AgendaEvent) => e.id === editingEvent.id);
      if (eventIndex !== -1) {
        currentEvents[eventIndex] = updatedEvent;
        localStorage.setItem('agenda-events', JSON.stringify(currentEvents));
      }

      toast({
        title: "Evento actualizado",
        description: "El evento ha sido modificado correctamente"
      });

      // Clean form and notify parent
      setNewEvent({ title: '', description: '', date: '' });
      onEventUpdated?.(updatedEvent);
    } else {
      // Create new event
      const event: AgendaEvent = {
        id: Date.now().toString(),
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        createdAt: new Date().toISOString()
      };

      // Save to localStorage
      const savedEvents = localStorage.getItem('agenda-events');
      const currentEvents = savedEvents ? JSON.parse(savedEvents) : [];
      const updatedEvents = [...currentEvents, event];
      localStorage.setItem('agenda-events', JSON.stringify(updatedEvents));

      // Send to Telegram
      const telegramSent = await sendToTelegram(event);

      if (telegramSent) {
        toast({
          title: "Evento agregado",
          description: "El evento ha sido guardado y enviado a Telegram"
        });
      } else {
        toast({
          title: "Evento guardado",
          description: "El evento ha sido guardado pero no se pudo enviar a Telegram",
          variant: "destructive"
        });
      }

      // Clean form and notify parent
      setNewEvent({ title: '', description: '', date: '' });
      onEventAdded(event);
    }
  };

  const handleClose = () => {
    setNewEvent({ title: '', description: '', date: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">
            {editingEvent ? 'Editar Evento' : 'Agregar Evento a la Agenda'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="event-title" className="text-white">Título del evento *</Label>
            <Input
              id="event-title"
              value={newEvent.title}
              onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Reunión, cita médica, etc."
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label htmlFor="event-description" className="text-white">Descripción (opcional)</Label>
            <Textarea
              id="event-description"
              value={newEvent.description}
              onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detalles adicionales del evento..."
              className="bg-gray-800 border-gray-600 text-white"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="event-date" className="text-white">Fecha y hora *</Label>
            <Input
              id="event-date"
              type="datetime-local"
              value={newEvent.date}
              onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <Button onClick={handleSaveEvent} className="w-full">
            {editingEvent ? 'Actualizar Evento' : 'Enviar a Telegram y Guardar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgendaForm;