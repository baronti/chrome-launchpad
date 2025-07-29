import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, Folder, Monitor } from 'lucide-react';

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
  onOpen: (url: string, category: string) => void;
  onRemove: (category: string, id: string) => void;
}

const DraggableShortcut: React.FC<DraggableShortcutProps> = ({
  item,
  category,
  onOpen,
  onRemove
}) => {
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

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group relative bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer select-none"
      onClick={() => onOpen(item.url, category)}
    >
      <CardContent className="p-4 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center mb-2">
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
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(category, item.id);
          }}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
        >
          ×
        </button>
      </CardContent>
    </Card>
  );
};

export default DraggableShortcut;