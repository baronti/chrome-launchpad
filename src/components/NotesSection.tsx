import React, { useState, useEffect } from 'react';
import { Save, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface NotesSectionProps {
  notes: string;
  onNotesUpdate: (notes: string) => void;
}

const NotesSection: React.FC<NotesSectionProps> = ({ notes, onNotesUpdate }) => {
  const [currentNotes, setCurrentNotes] = useState(notes);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  // Sincronizar el estado local con las notas que vienen del prop
  useEffect(() => {
    setCurrentNotes(notes);
    setHasChanges(false);
  }, [notes]);

  const handleNotesChange = (value: string) => {
    setCurrentNotes(value);
    setHasChanges(value !== notes);
  };

  const handleSave = () => {
    onNotesUpdate(currentNotes);
    setHasChanges(false);
    
    toast({
      title: "Notas guardadas",
      description: "Las notas han sido guardadas correctamente"
    });
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 h-[900px] flex flex-col overflow-hidden">
      <CardHeader className="pb-2 flex-shrink-0">
        <CardTitle className="text-white flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Notas
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3 min-h-0">
        <Textarea
          value={currentNotes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Escribe aquí tus notas, ideas, tareas pendientes, enlaces importantes..."
          className="bg-white/10 border-white/20 text-white placeholder:text-white/60 flex-1 resize-none overflow-auto"
        />
        
        <div className="flex-shrink-0">
          {hasChanges && (
            <Button 
              onClick={handleSave}
              className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar Notas
            </Button>
          )}
          
          {!hasChanges && notes && (
            <p className="text-white/60 text-sm">
              Notas guardadas ({notes.length} caracteres)
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotesSection;