import React, { useState, useEffect } from 'react';
import { Plus, Download, Upload, Settings, Globe, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useToast } from '@/hooks/use-toast';
import SortableShortcutGrid from '@/components/SortableShortcutGrid';
import { getAutomaticIcon } from '@/utils/iconUtils';

interface Shortcut {
  id: string;
  name: string;
  url: string;
  icon?: string;
  order: number;
}

interface AppData {
  websites: Shortcut[];
  backgroundImage: string;
}

const DEFAULT_BACKGROUND = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';

const Index = () => {
  const [appData, setAppData] = useState<AppData>({
    websites: [],
    backgroundImage: DEFAULT_BACKGROUND
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'websites'>('websites');
  const [newShortcut, setNewShortcut] = useState({ name: '', url: '', icon: '' });
  const [newBackground, setNewBackground] = useState('');
  const { toast } = useToast();

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('dashboard-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        
        // Migrate data to include order field if not present
        const migrateShortcuts = (shortcuts: Shortcut[]) => 
          shortcuts.map((shortcut, index) => ({
            ...shortcut,
            order: shortcut.order ?? index
          }));

        const migratedData = {
          ...parsed,
          websites: migrateShortcuts(parsed.websites || [])
        };

        setAppData(migratedData);
        setNewBackground(migratedData.backgroundImage || DEFAULT_BACKGROUND);
      } catch (error) {
        console.error('Error parsing saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever appData changes
  useEffect(() => {
    localStorage.setItem('dashboard-data', JSON.stringify(appData));
  }, [appData]);

  const addShortcut = () => {
    if (!newShortcut.name || !newShortcut.url) {
      toast({
        title: "Error",
        description: "El nombre y la URL son requeridos",
        variant: "destructive"
      });
      return;
    }

    const currentItems = appData[activeTab];
    const nextOrder = currentItems.length;

    const shortcut: Shortcut = {
      id: Date.now().toString(),
      name: newShortcut.name,
      url: newShortcut.url,
      icon: newShortcut.icon,
      order: nextOrder
    };

    setAppData(prev => ({
      ...prev,
      [activeTab]: [...prev[activeTab], shortcut]
    }));

    setNewShortcut({ name: '', url: '', icon: '' });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Acceso directo agregado",
      description: `${shortcut.name} ha sido agregado a ${activeTab}`
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

    const detectedIcon = getAutomaticIcon(newShortcut.url, activeTab);
    setNewShortcut(prev => ({ ...prev, icon: detectedIcon }));
    
    toast({
      title: "Icono detectado",
      description: "El icono ha sido detectado automáticamente"
    });
  };

  const handleReorder = (category: 'websites', reorderedItems: Shortcut[]) => {
    setAppData(prev => ({
      ...prev,
      [category]: reorderedItems
    }));
  };

  const removeShortcut = (category: keyof AppData, id: string) => {
    console.log('removeShortcut llamado con:', { category, id });
    if (category === 'backgroundImage') return;
    
    setAppData(prev => {
      console.log('Estado anterior:', prev[category]);
      const newData = {
        ...prev,
        [category]: prev[category].filter(item => item.id !== id)
      };
      console.log('Estado nuevo:', newData[category]);
      return newData;
    });
    
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

  const openShortcut = (url: string, category: string) => {
    if (category === 'websites') {
      window.open(url.startsWith('http') ? url : `https://${url}`, '_blank');
    }
  };

  // Sort items by order for display
  const getSortedItems = (items: Shortcut[]) => {
    return [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
  };

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
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-1 mb-6 inline-flex">
            <div className="bg-white/20 rounded px-4 py-2 text-white">
              <Globe className="w-4 h-4 mr-2 inline" />
              Sitios Web
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-white">Sitios Web</h2>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => setActiveTab('websites')}
                    className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Sitio
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Agregar Sitio Web</DialogTitle>
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
              items={getSortedItems(appData.websites)} 
              category="websites"
              onReorder={(items) => handleReorder('websites', items)}
              onOpen={openShortcut}
              onRemove={removeShortcut}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;