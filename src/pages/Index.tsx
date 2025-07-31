import React, { useState, useEffect } from 'react';
import { Plus, Download, Upload, Settings, Globe, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useToast } from '@/hooks/use-toast';
import SortableShortcutGrid from '@/components/SortableShortcutGrid';
import { getAutomaticIcon } from '@/utils/iconUtils';
import TabManager, { TabData } from '@/components/TabManager';
import NotesSection from '@/components/NotesSection';

interface Shortcut {
  id: string;
  name: string;
  url: string;
  icon?: string;
  order: number;
}

interface AppData {
  tabs: TabData[];
  activeTabId: string;
  backgroundImage: string;
}

const DEFAULT_BACKGROUND = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';

const Index = () => {
  const defaultTab: TabData = {
    id: 'default',
    name: 'Sitios Web',
    websites: [],
    notes: ''
  };

  const [appData, setAppData] = useState<AppData>({
    tabs: [defaultTab],
    activeTabId: 'default',
    backgroundImage: DEFAULT_BACKGROUND
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newShortcut, setNewShortcut] = useState({ name: '', url: '', icon: '' });
  const [newBackground, setNewBackground] = useState('');
  const { toast } = useToast();

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('dashboard-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        
        // Migrate old data format to new tab-based format
        if (parsed.websites && !parsed.tabs) {
          const migrateShortcuts = (shortcuts: Shortcut[]) => 
            shortcuts.map((shortcut, index) => ({
              ...shortcut,
              order: shortcut.order ?? index
            }));

          const migratedData = {
            tabs: [{
              id: 'default',
              name: 'Sitios Web',
              websites: migrateShortcuts(parsed.websites || []),
              notes: ''
            }],
            activeTabId: 'default',
            backgroundImage: parsed.backgroundImage || DEFAULT_BACKGROUND
          };
          
          setAppData(migratedData);
        } else {
          // Ensure all tabs have migrated shortcuts
          const migratedTabs = parsed.tabs?.map((tab: TabData) => ({
            ...tab,
            websites: tab.websites?.map((shortcut, index) => ({
              ...shortcut,
              order: shortcut.order ?? index
            })) || []
          })) || [defaultTab];

          setAppData({
            ...parsed,
            tabs: migratedTabs
          });
        }
        
        setNewBackground(parsed.backgroundImage || DEFAULT_BACKGROUND);
      } catch (error) {
        console.error('Error parsing saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever appData changes
  useEffect(() => {
    localStorage.setItem('dashboard-data', JSON.stringify(appData));
  }, [appData]);

  const getCurrentTab = () => {
    return appData.tabs.find(tab => tab.id === appData.activeTabId) || appData.tabs[0];
  };

  const addShortcut = () => {
    if (!newShortcut.name || !newShortcut.url) {
      toast({
        title: "Error",
        description: "El nombre y la URL son requeridos",
        variant: "destructive"
      });
      return;
    }

    const currentTab = getCurrentTab();
    const nextOrder = currentTab.websites.length;

    const shortcut: Shortcut = {
      id: Date.now().toString(),
      name: newShortcut.name,
      url: newShortcut.url,
      icon: newShortcut.icon,
      order: nextOrder
    };

    setAppData(prev => ({
      ...prev,
      tabs: prev.tabs.map(tab =>
        tab.id === prev.activeTabId
          ? { ...tab, websites: [...tab.websites, shortcut] }
          : tab
      )
    }));

    setNewShortcut({ name: '', url: '', icon: '' });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Acceso directo agregado",
      description: `${shortcut.name} ha sido agregado a ${currentTab.name}`
    });
  };

  const autoDetectIcon = () => {
    if (!newShortcut.url) {
      toast({
        title: "Error",
        description: "Ingresa una URL primero",
        variant: "destructive"
      });
      return;
    }

    const detectedIcon = getAutomaticIcon(newShortcut.url, 'websites');
    setNewShortcut(prev => ({ ...prev, icon: detectedIcon }));
    
    toast({
      title: "Icono detectado",
      description: "El icono ha sido detectado automáticamente"
    });
  };

  const handleReorder = (reorderedItems: Shortcut[]) => {
    setAppData(prev => ({
      ...prev,
      tabs: prev.tabs.map(tab =>
        tab.id === prev.activeTabId
          ? { ...tab, websites: reorderedItems }
          : tab
      )
    }));
  };

  const removeShortcut = (id: string) => {
    setAppData(prev => ({
      ...prev,
      tabs: prev.tabs.map(tab =>
        tab.id === prev.activeTabId
          ? { ...tab, websites: tab.websites.filter(item => item.id !== id) }
          : tab
      )
    }));
    
    toast({
      title: "Acceso directo eliminado",
      description: "El acceso directo ha sido eliminado"
    });
  };

  const updateBackground = () => {
    setAppData(prev => ({
      ...prev,
      backgroundImage: newBackground
    }));
    setIsSettingsOpen(false);
    
    toast({
      title: "Fondo actualizado",
      description: "El fondo de pantalla ha sido cambiado"
    });
  };

  const handleBackgroundFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de imagen válido",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setNewBackground(dataUrl);
      setAppData(prev => ({
        ...prev,
        backgroundImage: dataUrl
      }));
      
      toast({
        title: "Fondo actualizado",
        description: "El archivo local ha sido cargado como fondo"
      });
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const exportData = () => {
    const dataStr = JSON.stringify(appData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dashboard-config.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Datos exportados",
      description: "La configuración ha sido descargada"
    });
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        setAppData(importedData);
        setNewBackground(importedData.backgroundImage || DEFAULT_BACKGROUND);
        
        toast({
          title: "Datos importados",
          description: "La configuración ha sido cargada exitosamente"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "El archivo no tiene un formato válido",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const openShortcut = (url: string) => {
    window.open(url.startsWith('http') ? url : `https://${url}`, '_blank');
  };

  // Tab management functions
  const handleTabSelect = (tabId: string) => {
    setAppData(prev => ({ ...prev, activeTabId: tabId }));
  };

  const handleTabCreate = (name: string) => {
    const newTab: TabData = {
      id: Date.now().toString(),
      name,
      websites: [],
      notes: ''
    };
    
    setAppData(prev => ({
      ...prev,
      tabs: [...prev.tabs, newTab],
      activeTabId: newTab.id
    }));
  };

  const handleTabUpdate = (tabId: string, name: string) => {
    setAppData(prev => ({
      ...prev,
      tabs: prev.tabs.map(tab =>
        tab.id === tabId ? { ...tab, name } : tab
      )
    }));
  };

  const handleTabDelete = (tabId: string) => {
    setAppData(prev => {
      const newTabs = prev.tabs.filter(tab => tab.id !== tabId);
      const newActiveTabId = prev.activeTabId === tabId ? newTabs[0]?.id : prev.activeTabId;
      
      return {
        ...prev,
        tabs: newTabs,
        activeTabId: newActiveTabId
      };
    });
  };

  const handleNotesUpdate = (notes: string) => {
    setAppData(prev => ({
      ...prev,
      tabs: prev.tabs.map(tab =>
        tab.id === prev.activeTabId
          ? { ...tab, notes }
          : tab
      )
    }));
  };

  // Sort items by order for display
  const getSortedItems = (items: Shortcut[]) => {
    return [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  const currentTab = getCurrentTab();

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${appData.backgroundImage})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white"> Baronti Dashboard</h1>
          
          <div className="flex gap-4">
            <Button 
              onClick={exportData}
              variant="outline" 
              className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
              <Button 
                variant="outline" 
                className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
                asChild
              >
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Importar
                </span>
              </Button>
            </label>

            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Configuración</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="background" className="text-white">URL del fondo de pantalla</Label>
                    <Input
                      id="background"
                      value={newBackground}
                      onChange={(e) => setNewBackground(e.target.value)}
                      placeholder="https://ejemplo.com/imagen.jpg"
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  
                  <div className="text-center text-gray-400">
                    <span>- o -</span>
                  </div>
                  
                  <div>
                    <Label className="text-white">Seleccionar archivo local</Label>
                    <label className="cursor-pointer block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBackgroundFile}
                        className="hidden"
                      />
                      <div className="bg-gray-800 border border-gray-600 rounded-md p-3 text-center text-white hover:bg-gray-700 transition-colors">
                        <Upload className="w-5 h-5 mx-auto mb-2" />
                        <span>Hacer clic para seleccionar imagen</span>
                      </div>
                    </label>
                  </div>
                  
                  <Button onClick={updateBackground} className="w-full">
                    Actualizar Fondo
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Content */}
        <div className="w-full">
          <TabManager
            tabs={appData.tabs}
            activeTabId={appData.activeTabId}
            onTabSelect={handleTabSelect}
            onTabCreate={handleTabCreate}
            onTabUpdate={handleTabUpdate}
            onTabDelete={handleTabDelete}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Websites Section */}
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                  <Globe className="w-6 h-6" />
                  {currentTab.name} - Enlaces
                </h2>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Enlace
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Agregar Enlace Web</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name" className="text-white">Nombre</Label>
                        <Input
                          id="name"
                          value={newShortcut.name}
                          onChange={(e) => setNewShortcut(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Google, Facebook, etc."
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="url" className="text-white">URL</Label>
                        <Input
                          id="url"
                          value={newShortcut.url}
                          onChange={(e) => setNewShortcut(prev => ({ ...prev, url: e.target.value }))}
                          placeholder="https://google.com"
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="icon" className="text-white">Icono (URL - opcional)</Label>
                        <div className="flex gap-2">
                          <Input
                            id="icon"
                            value={newShortcut.icon}
                            onChange={(e) => setNewShortcut(prev => ({ ...prev, icon: e.target.value }))}
                            placeholder="https://ejemplo.com/favicon.ico"
                            className="bg-gray-800 border-gray-600 text-white flex-1"
                          />
                          <Button
                            type="button"
                            onClick={autoDetectIcon}
                            variant="outline"
                            size="icon"
                            className="bg-gray-800 border-gray-600 hover:bg-gray-700"
                          >
                            <Wand2 className="w-4 h-4" />
                          </Button>
                        </div>
                        {newShortcut.icon && (
                          <div className="flex items-center gap-2 mt-2">
                            <img src={newShortcut.icon} alt="Preview" className="w-6 h-6 rounded" />
                            <span className="text-sm text-gray-400">Vista previa del icono</span>
                          </div>
                        )}
                      </div>
                      <Button onClick={addShortcut} className="w-full">
                        Agregar
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <SortableShortcutGrid 
                items={getSortedItems(currentTab.websites)} 
                category="websites"
                onReorder={handleReorder}
                onOpen={openShortcut}
                onRemove={removeShortcut}
              />
            </div>

            {/* Notes Section */}
            <div className="lg:col-span-1">
              <NotesSection
                notes={currentTab.notes}
                onNotesUpdate={handleNotesUpdate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;