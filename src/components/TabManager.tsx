import React, { useState } from 'react';
import { Plus, X, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export interface TabData {
  id: string;
  name: string;
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
  onTabCreate: (name: string) => void;
  onTabUpdate: (tabId: string, name: string) => void;
  onTabDelete: (tabId: string) => void;
}

const TabManager: React.FC<TabManagerProps> = ({
  tabs,
  activeTabId,
  onTabSelect,
  onTabCreate,
  onTabUpdate,
  onTabDelete
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newTabName, setNewTabName] = useState('');
  const [editingTab, setEditingTab] = useState<TabData | null>(null);
  const { toast } = useToast();

  const handleCreateTab = () => {
    if (!newTabName.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la pestaña es requerido",
        variant: "destructive"
      });
      return;
    }

    onTabCreate(newTabName.trim());
    setNewTabName('');
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

    onTabUpdate(editingTab.id, newTabName.trim());
    setNewTabName('');
    setEditingTab(null);
    setIsEditOpen(false);
    
    toast({
      title: "Pestaña actualizada",
      description: `La pestaña ha sido renombrada a "${newTabName}"`
    });
  };

  const handleDeleteTab = (tabId: string) => {
    if (tabs.length <= 1) {
      toast({
        title: "Error",
        description: "No puedes eliminar la última pestaña",
        variant: "destructive"
      });
      return;
    }

    onTabDelete(tabId);
    toast({
      title: "Pestaña eliminada",
      description: "La pestaña ha sido eliminada"
    });
  };

  const startEdit = (tab: TabData) => {
    setEditingTab(tab);
    setNewTabName(tab.name);
    setIsEditOpen(true);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-1 mb-6 flex flex-wrap gap-1">
      {tabs.map((tab) => (
        <div key={tab.id} className="flex items-center group">
          <Button
            variant={activeTabId === tab.id ? "default" : "ghost"}
            onClick={() => onTabSelect(tab.id)}
            className={`${
              activeTabId === tab.id 
                ? "bg-white/20 text-white" 
                : "text-white/80 hover:bg-white/10 hover:text-white"
            } px-3 py-2 rounded-l transition-all`}
          >
            {tab.name}
          </Button>
          
          {activeTabId === tab.id && (
            <div className="flex bg-white/20 rounded-r">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => startEdit(tab)}
                className="text-white/80 hover:text-white hover:bg-white/10 px-2 py-2 h-auto"
              >
                <Edit2 className="w-3 h-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteTab(tab.id)}
                className="text-white/80 hover:text-white hover:bg-white/10 px-2 py-2 h-auto"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
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
            <Button onClick={handleUpdateTab} className="w-full">
              Actualizar Pestaña
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TabManager;