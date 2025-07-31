import React, { useState } from 'react';
import { Plus, X, Edit2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface TabData {
  id: string;
  name: string;
  color?: string;
  order: number;
  websites: Array<{
    id: string;
    name: string;
    url: string;
    icon?: string;
    order: number;
  }>;
  notes: string;
}

interface TabManagerProps {
  tabs: TabData[];
  activeTabId: string;
  onTabSelect: (tabId: string) => void;
  onTabCreate: (name: string, color?: string) => void;
  onTabUpdate: (tabId: string, name: string, color?: string) => void;
  onTabDelete: (tabId: string) => void;
  onTabReorder: (tabs: TabData[]) => void;
}

const TAB_COLORS = [
  { name: 'Azul', value: 'blue', class: 'bg-blue-500/20 border-blue-500/30 text-blue-100' },
  { name: 'Verde', value: 'green', class: 'bg-green-500/20 border-green-500/30 text-green-100' },
  { name: 'Rojo', value: 'red', class: 'bg-red-500/20 border-red-500/30 text-red-100' },
  { name: 'Amarillo', value: 'yellow', class: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-100' },
  { name: 'Púrpura', value: 'purple', class: 'bg-purple-500/20 border-purple-500/30 text-purple-100' },
  { name: 'Rosa', value: 'pink', class: 'bg-pink-500/20 border-pink-500/30 text-pink-100' },
  { name: 'Naranja', value: 'orange', class: 'bg-orange-500/20 border-orange-500/30 text-orange-100' },
  { name: 'Por defecto', value: '', class: 'bg-white/20 border-white/20 text-white' },
];

interface SortableTabProps {
  tab: TabData;
  isActive: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const SortableTab: React.FC<SortableTabProps> = ({ tab, isActive, onSelect, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getTabColorClass = (color?: string) => {
    const colorConfig = TAB_COLORS.find(c => c.value === color);
    return colorConfig?.class || TAB_COLORS[TAB_COLORS.length - 1].class;
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`flex items-center group ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center">
        <Button
          variant="ghost"
          className="p-1 cursor-grab text-white/60 hover:text-white"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-3 h-3" />
        </Button>
        
        <Button
          variant={isActive ? "default" : "ghost"}
          onClick={onSelect}
          className={`${
            isActive 
              ? getTabColorClass(tab.color)
              : "text-white/80 hover:bg-white/10 hover:text-white"
          } px-3 py-2 rounded-l transition-all border`}
        >
          {tab.name}
        </Button>
        
        {isActive && (
          <div className={`flex ${getTabColorClass(tab.color)} rounded-r border border-l-0`}>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="text-current hover:bg-white/10 px-2 py-2 h-auto"
            >
              <Edit2 className="w-3 h-3" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-current hover:bg-white/10 px-2 py-2 h-auto"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const TabManager: React.FC<TabManagerProps> = ({
  tabs,
  activeTabId,
  onTabSelect,
  onTabCreate,
  onTabUpdate,
  onTabDelete,
  onTabReorder
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [newTabName, setNewTabName] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [editingTab, setEditingTab] = useState<TabData | null>(null);
  const [tabToDelete, setTabToDelete] = useState<TabData | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tabs.findIndex((tab) => tab.id === active.id);
      const newIndex = tabs.findIndex((tab) => tab.id === over.id);

      const reorderedTabs = arrayMove(tabs, oldIndex, newIndex).map((tab, index) => ({
        ...tab,
        order: index
      }));

      onTabReorder(reorderedTabs);
    }
  };

  const handleCreateTab = () => {
    if (!newTabName.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la pestaña es requerido",
        variant: "destructive"
      });
      return;
    }

    onTabCreate(newTabName.trim(), selectedColor);
    setNewTabName('');
    setSelectedColor('');
    setIsCreateOpen(false);
    
    toast({
      title: "Pestaña creada",
      description: `La pestaña "${newTabName}" ha sido creada`
    });
  };

  const handleUpdateTab = () => {
    if (!editingTab || !newTabName.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la pestaña es requerido",
        variant: "destructive"
      });
      return;
    }

    onTabUpdate(editingTab.id, newTabName.trim(), selectedColor);
    setNewTabName('');
    setSelectedColor('');
    setEditingTab(null);
    setIsEditOpen(false);
    
    toast({
      title: "Pestaña actualizada",
      description: `La pestaña ha sido actualizada`
    });
  };

  const startDelete = (tab: TabData) => {
    if (tabs.length <= 1) {
      toast({
        title: "Error",
        description: "No puedes eliminar la última pestaña",
        variant: "destructive"
      });
      return;
    }
    
    setTabToDelete(tab);
    setIsDeleteOpen(true);
  };

  const confirmDeleteTab = () => {
    if (tabToDelete) {
      onTabDelete(tabToDelete.id);
      toast({
        title: "Pestaña eliminada",
        description: `La pestaña "${tabToDelete.name}" ha sido eliminada`
      });
    }
    setTabToDelete(null);
    setIsDeleteOpen(false);
  };

  const startEdit = (tab: TabData) => {
    setEditingTab(tab);
    setNewTabName(tab.name);
    setSelectedColor(tab.color || '');
    setIsEditOpen(true);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-1 mb-6">
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={tabs} strategy={horizontalListSortingStrategy}>
          <div className="flex flex-wrap gap-1 items-center">
            {tabs.map((tab) => (
              <SortableTab
                key={tab.id}
                tab={tab}
                isActive={activeTabId === tab.id}
                onSelect={() => onTabSelect(tab.id)}
                onEdit={() => startEdit(tab)}
                onDelete={() => startDelete(tab)}
              />
            ))}
            
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="text-white/80 hover:bg-white/10 hover:text-white px-3 py-2"
          >
            <Plus className="w-4 h-4 mr-1" />
            Nueva Pestaña
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Crear Nueva Pestaña</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tabName" className="text-white">Nombre de la pestaña</Label>
              <Input
                id="tabName"
                value={newTabName}
                onChange={(e) => setNewTabName(e.target.value)}
                placeholder="Ej: Proyecto A, Desarrollo, Marketing..."
                className="bg-gray-800 border-gray-600 text-white"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateTab()}
              />
            </div>
            <div>
              <Label className="text-white">Color de la pestaña</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {TAB_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className={`p-2 rounded text-xs text-center border-2 transition-all ${
                      selectedColor === color.value 
                        ? `${color.class} border-white` 
                        : `${color.class} border-transparent hover:border-white/50`
                    }`}
                  >
                    {color.name}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={handleCreateTab} className="w-full">
              Crear Pestaña
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Pestaña</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editTabName" className="text-white">Nombre de la pestaña</Label>
              <Input
                id="editTabName"
                value={newTabName}
                onChange={(e) => setNewTabName(e.target.value)}
                placeholder="Nuevo nombre de la pestaña"
                className="bg-gray-800 border-gray-600 text-white"
                onKeyDown={(e) => e.key === 'Enter' && handleUpdateTab()}
              />
            </div>
            <div>
              <Label className="text-white">Color de la pestaña</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {TAB_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className={`p-2 rounded text-xs text-center border-2 transition-all ${
                      selectedColor === color.value 
                        ? `${color.class} border-white` 
                        : `${color.class} border-transparent hover:border-white/50`
                    }`}
                  >
                    {color.name}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={handleUpdateTab} className="w-full">
              Actualizar Pestaña
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="bg-gray-900 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              ¿Eliminar pestaña?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              ¿Estás seguro de que quieres eliminar la pestaña "{tabToDelete?.name}"? 
              Esta acción no se puede deshacer y se perderán todos los enlaces y notas de esta pestaña.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setIsDeleteOpen(false)}
              className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteTab}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default TabManager;