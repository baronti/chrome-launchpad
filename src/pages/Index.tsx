import React, { useState, useEffect } from 'react';
import { Plus, Download, Upload, Settings, Globe, Folder, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface Shortcut {
  id: string;
  name: string;
  url: string;
  icon?: string;
}

interface AppData {
  websites: Shortcut[];
  applications: Shortcut[];
  folders: Shortcut[];
  backgroundImage: string;
}

const DEFAULT_BACKGROUND = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';

const Index = () => {
  const [appData, setAppData] = useState<AppData>({
    websites: [],
    applications: [],
    folders: [],
    backgroundImage: DEFAULT_BACKGROUND
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'websites' | 'applications' | 'folders'>('websites');
  const [newShortcut, setNewShortcut] = useState({ name: '', url: '', icon: '' });
  const [newBackground, setNewBackground] = useState('');
  const { toast } = useToast();

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('dashboard-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setAppData(parsed);
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

  const addShortcut = () => {
    if (!newShortcut.name || !newShortcut.url) {
      toast({
        title: "Error",
        description: "El nombre y la URL son requeridos",
        variant: "destructive"
      });
      return;
    }

    const shortcut: Shortcut = {
      id: Date.now().toString(),
      name: newShortcut.name,
      url: newShortcut.url,
      icon: newShortcut.icon
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

  const removeShortcut = (category: keyof AppData, id: string) => {
    if (category === 'backgroundImage') return;
    
    setAppData(prev => ({
      ...prev,
      [category]: prev[category].filter(item => item.id !== id)
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
    } else if (category === 'applications') {
      // For applications, we'll show a notification since we can't directly open desktop apps from browser
      toast({
        title: "Aplicación",
        description: `Para abrir: ${url}`,
      });
    } else if (category === 'folders') {
      // For folders, we'll show the path since we can't directly open folders from browser
      toast({
        title: "Carpeta",
        description: `Ruta: ${url}`,
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'websites': return <Globe className="w-4 h-4" />;
      case 'applications': return <Monitor className="w-4 h-4" />;
      case 'folders': return <Folder className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const ShortcutGrid = ({ items, category }: { items: Shortcut[], category: string }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
      {items.map((item) => (
        <Card 
          key={item.id} 
          className="group relative bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer"
          onClick={() => openShortcut(item.url, category)}
        >
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center mb-2">
              {item.icon ? (
                <img src={item.icon} alt={item.name} className="w-8 h-8 rounded" />
              ) : (
                getCategoryIcon(category)
              )}
            </div>
            <span className="text-white text-sm font-medium truncate w-full">{item.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeShortcut(category as keyof AppData, item.id);
              }}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
            >
              ×
            </button>
          </CardContent>
        </Card>
      ))}
    </div>
  );

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
          <h1 className="text-4xl font-bold text-white">Dashboard Personal</h1>
          
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
                  <Button onClick={updateBackground} className="w-full">
                    Actualizar Fondo
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="websites" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-md">
            <TabsTrigger value="websites" className="text-white data-[state=active]:bg-white/20">
              <Globe className="w-4 h-4 mr-2" />
              Sitios Web
            </TabsTrigger>
            <TabsTrigger value="applications" className="text-white data-[state=active]:bg-white/20">
              <Monitor className="w-4 h-4 mr-2" />
              Aplicaciones
            </TabsTrigger>
            <TabsTrigger value="folders" className="text-white data-[state=active]:bg-white/20">
              <Folder className="w-4 h-4 mr-2" />
              Carpetas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="websites" className="mt-6">
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
                      <Input
                        id="icon"
                        value={newShortcut.icon}
                        onChange={(e) => setNewShortcut(prev => ({ ...prev, icon: e.target.value }))}
                        placeholder="https://ejemplo.com/favicon.ico"
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <Button onClick={addShortcut} className="w-full">
                      Agregar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <ShortcutGrid items={appData.websites} category="websites" />
          </TabsContent>

          <TabsContent value="applications" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-white">Aplicaciones</h2>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => setActiveTab('applications')}
                    className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar App
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Agregar Aplicación</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-white">Nombre</Label>
                      <Input
                        id="name"
                        value={newShortcut.name}
                        onChange={(e) => setNewShortcut(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Visual Studio Code, Photoshop, etc."
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="url" className="text-white">Ruta del ejecutable</Label>
                      <Input
                        id="url"
                        value={newShortcut.url}
                        onChange={(e) => setNewShortcut(prev => ({ ...prev, url: e.target.value }))}
                        placeholder="C:\Program Files\App\app.exe"
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="icon" className="text-white">Icono (URL - opcional)</Label>
                      <Input
                        id="icon"
                        value={newShortcut.icon}
                        onChange={(e) => setNewShortcut(prev => ({ ...prev, icon: e.target.value }))}
                        placeholder="https://ejemplo.com/icon.png"
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <Button onClick={addShortcut} className="w-full">
                      Agregar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <ShortcutGrid items={appData.applications} category="applications" />
          </TabsContent>

          <TabsContent value="folders" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-white">Carpetas</h2>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => setActiveTab('folders')}
                    className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Carpeta
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Agregar Carpeta</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-white">Nombre</Label>
                      <Input
                        id="name"
                        value={newShortcut.name}
                        onChange={(e) => setNewShortcut(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Documentos, Descargas, etc."
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="url" className="text-white">Ruta de la carpeta</Label>
                      <Input
                        id="url"
                        value={newShortcut.url}
                        onChange={(e) => setNewShortcut(prev => ({ ...prev, url: e.target.value }))}
                        placeholder="C:\Users\Usuario\Documents"
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="icon" className="text-white">Icono (URL - opcional)</Label>
                      <Input
                        id="icon"
                        value={newShortcut.icon}
                        onChange={(e) => setNewShortcut(prev => ({ ...prev, icon: e.target.value }))}
                        placeholder="https://ejemplo.com/folder-icon.png"
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <Button onClick={addShortcut} className="w-full">
                      Agregar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <ShortcutGrid items={appData.folders} category="folders" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;