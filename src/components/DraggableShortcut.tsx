import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Globe, Folder, Monitor, Edit2, X } from 'lucide-react';

interface Shortcut {
  id: string;
  name: string;
  url: string;
  icon?: string;
  order: number;
}

interface DraggableShortcutProps {
  item: Shortcut;
  category: string;
  onOpen: (url: string) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string, newName: string) => void;
}

const DraggableShortcut: React.FC<DraggableShortcutProps> = ({
  item,
  category,
  onOpen,
  onRemove,
  onEdit
}) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'websites': return <Globe className="w-4 h-4" />;
      case 'applications': return <Monitor className="w-4 h-4" />;
      case 'folders': return <Folder className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const handleEditSave = () => {
    if (editName.trim() && editName !== item.name) {
      onEdit(item.id, editName.trim());
    }
    setIsEditOpen(false);
  };

  const handleEditCancel = () => {
    setEditName(item.name);
    setIsEditOpen(false);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card 
            ref={setNodeRef}
            style={style}
            {...attributes}
            className="group relative bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 select-none cursor-pointer"
            onClick={() => onOpen(item.url)}
          >
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div 
                {...listeners}
                className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center mb-2 cursor-grab active:cursor-grabbing"
                onClick={(e) => e.stopPropagation()}
              >
                {item.icon ? (
                  <img 
                    src={item.icon} 
                    alt={item.name} 
                    className="w-8 h-8 rounded"
                    onError={(e) => {
                      // Fallback to category icon if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={item.icon ? 'hidden' : ''}>
                  {getCategoryIcon(category)}
                </div>
              </div>
              <span className="text-white text-sm font-medium truncate w-full">{item.name}</span>
              
              {/* Edit Button */}
              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditName(item.name);
                    }}
                    className="absolute top-1 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-blue-500/80 hover:bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs z-50"
                    title="Editar nombre"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-white">Editar nombre del acceso directo</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Nombre del acceso directo"
                      className="bg-gray-800 border-gray-600 text-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleEditSave();
                        } else if (e.key === 'Escape') {
                          handleEditCancel();
                        }
                      }}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={handleEditCancel}
                        className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleEditSave}
                        disabled={!editName.trim()}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Guardar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(item.id);
                }}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-600/80 hover:bg-red-500/80 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs z-50"
                title="Eliminar acceso directo"
              >
                <X className="w-3 h-3" />
              </button>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm font-medium">{item.name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DraggableShortcut;