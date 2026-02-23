/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'motion/react';
import { Volume2, VolumeX, Volume1, Speaker, Music, Settings2, Plus, Trash2, MonitorSmartphone, X, Bell, Smartphone, Search, ChevronRight, Zap, PlayCircle, SkipForward, SkipBack, Camera, EyeOff, Hand, Palette, Magnet, Cpu, ShieldCheck, AlarmClock, Phone, BellRing, Gamepad2, Disc } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Capacitor Imports
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App as CapApp } from '@capacitor/app';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [volume, setVolume] = useState(50);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [widgetColor, setWidgetColor] = useState('#0f172a'); // slate-900
  const [widgetOpacity, setWidgetOpacity] = useState(80);
  const [widgetSize, setWidgetSize] = useState(56); // Default 56px (w-14)
  const [panelDirection, setPanelDirection] = useState<'up' | 'down'>('up');
  
  // App-specific volume states
  const [isAppVolumeEnabled, setIsAppVolumeEnabled] = useState(false);
  const [currentApp, setCurrentApp] = useState('Desktop');
  const [appConfigs, setAppConfigs] = useState([
    { name: 'YouTube', mediaVolume: 50, notificationVolume: 30, icon: 'youtube' },
    { name: 'Instagram', mediaVolume: 10, notificationVolume: 20, icon: 'instagram' },
    { name: 'Spotify', mediaVolume: 80, notificationVolume: 10, icon: 'spotify' }
  ]);
  const [isScanning, setIsScanning] = useState(false);
  const [isAppSelectionOpen, setIsAppSelectionOpen] = useState(false);
  const [configApp, setConfigApp] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Smart Gestures states
  const [isGesturesEnabled, setIsGesturesEnabled] = useState(false);
  const [isGesturesModalOpen, setIsGesturesModalOpen] = useState(false);
  const [isWidgetEnabled, setIsWidgetEnabled] = useState(true);
  const [isAppManagementModalOpen, setIsAppManagementModalOpen] = useState(false);
  const [isWidgetCustomizationModalOpen, setIsWidgetCustomizationModalOpen] = useState(false);
  const [isMemoryManagementModalOpen, setIsMemoryManagementModalOpen] = useState(false);
  const [isMixerConfigModalOpen, setIsMixerConfigModalOpen] = useState(false);
  const [gestureFeedback, setGestureFeedback] = useState<string | null>(null);
  const [isScreenOff, setIsScreenOff] = useState(false);
  const [isSnapToEdgeEnabled, setIsSnapToEdgeEnabled] = useState(true);
  const [isForegroundServiceEnabled, setIsForegroundServiceEnabled] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('modern');

  // Native Android Integration
  useEffect(() => {
    const setupNative = async () => {
      try {
        // Set Status Bar Style
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#ffffff' });
        
        // Handle Back Button
        CapApp.addListener('backButton', ({ canGoBack }) => {
          if (isExpanded) {
            setIsExpanded(false);
          } else if (isGesturesModalOpen) {
            setIsGesturesModalOpen(false);
          } else if (isAppManagementModalOpen) {
            setIsAppManagementModalOpen(false);
          } else if (isWidgetCustomizationModalOpen) {
            setIsWidgetCustomizationModalOpen(false);
          } else if (isMemoryManagementModalOpen) {
            setIsMemoryManagementModalOpen(false);
          } else if (isMixerConfigModalOpen) {
            setIsMixerConfigModalOpen(false);
          } else if (isAppSelectionOpen) {
            setIsAppSelectionOpen(false);
          }
        });
      } catch (e) {
        console.log('Capacitor not available');
      }
    };
    setupNative();
  }, [isExpanded, isGesturesModalOpen, isAppManagementModalOpen, isWidgetCustomizationModalOpen, isMemoryManagementModalOpen, isMixerConfigModalOpen, isAppSelectionOpen]);

  const triggerHaptic = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      // Not on native
    }
  };
  
  // Audio Channels states
  const [selectedChannel, setSelectedChannel] = useState<'media' | 'alarm' | 'ring' | 'call'>('media');
  const [channelVolumes, setChannelVolumes] = useState({
    media: 50,
    alarm: 30,
    ring: 70,
    call: 60
  });
  const [isChannelSelectorOpen, setIsChannelSelectorOpen] = useState(false);
  const [widgetSide, setWidgetSide] = useState<'left' | 'right'>('right');
  
  // Mixer states
  const [isMixerEnabled, setIsMixerEnabled] = useState(true);
  const [mixerMode, setMixerMode] = useState<'all' | 'selected'>('all');
  const [selectedMixerApps, setSelectedMixerApps] = useState<string[]>(['Spotify', 'YouTube']);
  const [activeApps, setActiveApps] = useState([
    { 
      id: 'spotify', 
      name: 'Spotify', 
      volume: 80, 
      icon: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg', 
      isActive: true 
    },
    { 
      id: 'youtube', 
      name: 'YouTube', 
      volume: 60, 
      icon: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg', 
      isActive: true 
    },
    { 
      id: 'instagram', 
      name: 'Instagram', 
      volume: 30, 
      icon: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg', 
      isActive: true 
    }
  ]);

  const [enabledGestures, setEnabledGestures] = useState({
    double: true,
    triple: true,
    hold: true,
    swipe: true,
    palm: true
  });

  const availableApps = [
    { name: 'YouTube', icon: 'youtube' },
    { name: 'Instagram', icon: 'instagram' },
    { name: 'Spotify', icon: 'spotify' },
    { name: 'TikTok', icon: 'tiktok' },
    { name: 'Netflix', icon: 'netflix' },
    { name: 'WhatsApp', icon: 'whatsapp' },
    { name: 'Facebook', icon: 'facebook' },
    { name: 'Chrome', icon: 'chrome' },
    { name: 'Twitter', icon: 'twitter' },
    { name: 'LinkedIn', icon: 'linkedin' },
    { name: 'Twitch', icon: 'twitch' },
    { name: 'Discord', icon: 'discord' },
    { name: 'Telegram', icon: 'telegram' },
    { name: 'Pinterest', icon: 'pinterest' },
    { name: 'Snapchat', icon: 'snapchat' },
    { name: 'Reddit', icon: 'reddit' }
  ];

  const themes: Record<string, any> = {
    modern: {
      name: 'Moderno',
      bg: 'bg-[#f5f5f5]',
      card: 'bg-white/70 backdrop-blur-md border-black/5',
      text: 'text-slate-900',
      accent: '#4f46e5',
      button: 'bg-indigo-600 text-white',
      secondary: 'bg-slate-50/50',
      font: 'font-sans'
    },
    luxury: {
      name: 'Luxo Dark',
      bg: 'bg-[#050505]',
      card: 'bg-zinc-900/50 backdrop-blur-xl border-white/10',
      text: 'text-zinc-100',
      accent: '#d4af37',
      button: 'bg-[#d4af37] text-black',
      secondary: 'bg-zinc-800/50',
      font: 'font-serif'
    },
    brutalist: {
      name: 'Brutalista',
      bg: 'bg-white',
      card: 'bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
      text: 'text-black',
      accent: '#00ff00',
      button: 'bg-[#00ff00] text-black border-2 border-black font-bold',
      secondary: 'bg-gray-100 border-2 border-black',
      font: 'font-mono'
    },
    atmospheric: {
      name: 'Atmosférico',
      bg: 'bg-[#0a0502]',
      card: 'bg-orange-500/10 backdrop-blur-2xl border-orange-500/20',
      text: 'text-orange-50',
      accent: '#ff4e00',
      button: 'bg-[#ff4e00] text-white shadow-[0_0_20px_rgba(255,78,0,0.4)]',
      secondary: 'bg-orange-950/30',
      font: 'font-sans'
    },
    cyber: {
      name: 'Cyberpunk',
      bg: 'bg-[#0d0221]',
      card: 'bg-[#0d0221] border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]',
      text: 'text-cyan-400',
      accent: '#f0abfc',
      button: 'bg-fuchsia-500 text-white border-b-4 border-fuchsia-800 active:border-b-0',
      secondary: 'bg-[#1a0b2e] border border-cyan-900',
      font: 'font-mono'
    }
  };

  const activeTheme = themes[currentTheme] || themes.modern;

  const applyTheme = (themeId: string) => {
    setCurrentTheme(themeId);
    const theme = themes[themeId];
    setWidgetColor(theme.accent);
  };

  // Gesture detection refs
  const lastTapTime = useRef(0);
  const tapCount = useRef(0);
  const pressTimer = useRef<any>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const constraintsRef = useRef(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetControls = useAnimation();

  // Sync volume with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : channelVolumes.media / 100;
    }
  }, [channelVolumes.media, isMuted]);

  // Handle click outside to close panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isExpanded]);

  // Auto-close panel after 10s of inactivity
  useEffect(() => {
    let timer: any;
    if (isExpanded) {
      timer = setTimeout(() => {
        setIsExpanded(false);
      }, 10000);

      // Smart positioning: check if button is near top or bottom
      if (widgetRef.current) {
        const rect = widgetRef.current.getBoundingClientRect();
        const screenHeight = window.innerHeight;
        // If button is in the top 40% of the screen, open downwards
        if (rect.top < screenHeight * 0.4) {
          setPanelDirection('down');
        } else {
          setPanelDirection('up');
        }
      }
    }
    return () => clearTimeout(timer);
  }, [isExpanded, volume, isMuted]);

  // App-specific volume logic
  useEffect(() => {
    if (isAppVolumeEnabled) {
      const config = appConfigs.find(c => c.name.toLowerCase() === currentApp.toLowerCase());
      if (config) {
        setVolume(config.mediaVolume);
        if (isMuted) setIsMuted(false);
      }
    }
  }, [currentApp, isAppVolumeEnabled, appConfigs]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    triggerHaptic();
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setChannelVolumes(prev => ({ ...prev, [selectedChannel]: val }));
    setVolume(val);
    if (isMuted) setIsMuted(false);
    triggerHaptic();
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX size={20} />;
    if (volume < 50) return <Volume1 size={20} />;
    return <Volume2 size={20} />;
  };

  const removeAppConfig = (name: string) => {
    setAppConfigs(appConfigs.filter(c => c.name !== name));
  };

  const selectApp = (app: any) => {
    if (!appConfigs.find(c => c.name === app.name)) {
      setAppConfigs([...appConfigs, { ...app, mediaVolume: 50, notificationVolume: 50 }]);
    }
    setIsAppSelectionOpen(false);
  };

  const updateAppConfig = (name: string, field: string, value: number) => {
    setAppConfigs(appConfigs.map(c => c.name === name ? { ...c, [field]: value } : c));
    if (configApp && configApp.name === name) {
      setConfigApp({ ...configApp, [field]: value });
    }
  };

  const updateMixerVolume = (id: string, val: number) => {
    setActiveApps(prev => prev.map(app => app.id === id ? { ...app, volume: val } : app));
  };

  const simulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const currentNames = appConfigs.map(c => c.name.toLowerCase());
      const discovered = availableApps
        .filter(app => !currentNames.includes(app.name.toLowerCase()))
        .slice(0, 3)
        .map(app => ({ ...app, mediaVolume: 40, notificationVolume: 30 }));
      
      if (discovered.length > 0) {
        setAppConfigs(prev => [...prev, ...discovered]);
      }
      setIsScanning(false);
    }, 2000);
  };

  const showFeedback = (text: string) => {
    setGestureFeedback(text);
    setTimeout(() => setGestureFeedback(null), 1500);
  };

  const handleGestureAction = (type: 'double' | 'triple' | 'hold' | 'swipe-left' | 'swipe-right') => {
    if (!isGesturesEnabled) return;

    triggerHaptic();
    if (type === 'double' && !enabledGestures.double) return;
    if (type === 'triple' && !enabledGestures.triple) return;
    if (type === 'hold' && !enabledGestures.hold) return;
    if ((type === 'swipe-left' || type === 'swipe-right') && !enabledGestures.swipe) return;

    switch (type) {
      case 'double':
        setIsPlaying(!isPlaying);
        showFeedback(isPlaying ? 'Pausado' : 'Reproduzindo');
        break;
      case 'triple':
        showFeedback('Screenshot capturada!');
        // Simulate flash effect
        const flash = document.createElement('div');
        flash.className = 'fixed inset-0 bg-white z-[200] pointer-events-none animate-pulse';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 200);
        break;
      case 'hold':
        setIsMuted(!isMuted);
        showFeedback(isMuted ? 'Som Ativado' : 'Mudo Ativado');
        break;
      case 'swipe-left':
        showFeedback('Música Anterior');
        break;
      case 'swipe-right':
        showFeedback('Próxima Música');
        break;
    }
  };

  const handlePalmCover = () => {
    if (!isGesturesEnabled || !enabledGestures.palm) return;
    setChannelVolumes(prev => ({ ...prev, media: 0, alarm: 0, ring: 0, call: 0 }));
    setVolume(0);
    setIsMuted(true);
    setIsScreenOff(true);
    showFeedback('Modo Privacidade Ativado');
  };

  // Floating Volume Widget
  useEffect(() => {
    widgetControls.set({ x: window.innerWidth - widgetSize - 20, y: window.innerHeight - 150 });
  }, []);

  return (
    <div className={cn(
      "min-h-screen flex flex-col items-center justify-center p-6 transition-all duration-700",
      activeTheme.bg,
      activeTheme.font,
      activeTheme.text,
      isScreenOff && "bg-black brightness-0"
    )}>
      {isScreenOff && (
        <button 
          onClick={() => setIsScreenOff(false)}
          className="fixed inset-0 z-[300] cursor-pointer flex items-center justify-center"
        >
          <div className="text-white/20 text-xs font-bold uppercase tracking-widest animate-pulse">
            Toque para ligar a tela
          </div>
        </button>
      )}
      {/* Background Content - Just for context */}
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Volume Control</h1>
          <p className="text-slate-500">A floating utility for your system audio.</p>
        </div>

        <div className="bg-white/70 backdrop-blur-md p-8 rounded-3xl shadow-sm border border-black/5 space-y-6">
          <div className={cn("flex items-center justify-between p-4 rounded-2xl", activeTheme.secondary)}>
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", activeTheme.button)}>
                <Music size={20} />
              </div>
              <div className="text-left">
                <p className="font-medium">Test Audio</p>
                <p className={cn("text-xs opacity-60")}>Sample Track</p>
              </div>
            </div>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                isPlaying ? "bg-red-100 text-red-600" : activeTheme.button
              )}
            >
              {isPlaying ? 'Stop' : 'Play'}
            </button>
          </div>

          <audio 
            ref={audioRef}
            src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
            loop
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          <div className="text-sm text-slate-400 italic">
            Drag the floating button on the right to adjust volume anywhere.
          </div>

          <div className="pt-6 border-t border-black/5 space-y-3 text-left">
            {/* Ativar/Desativar Botão Flutuante */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between group transition-all">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-all",
                  isWidgetEnabled ? "bg-slate-800 shadow-slate-200" : "bg-slate-300 shadow-none"
                )}>
                  <MonitorSmartphone size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800">Botão Flutuante</p>
                  <p className={cn(
                    "text-[10px] font-bold uppercase tracking-wider",
                    isWidgetEnabled ? "text-emerald-600" : "text-slate-400"
                  )}>
                    {isWidgetEnabled ? 'Serviço Ativo' : 'Serviço Parado'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsWidgetEnabled(!isWidgetEnabled)}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                  isWidgetEnabled ? "bg-emerald-500" : "bg-slate-300"
                )}
              >
                <span className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  isWidgetEnabled ? "translate-x-6" : "translate-x-1"
                )} />
              </button>
            </div>

            {/* Gestos Inteligentes Button */}
            <button 
              onClick={() => setIsGesturesModalOpen(true)}
              className="w-full p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between group hover:bg-indigo-100 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                  <Zap size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800">Gestos Inteligentes</p>
                  <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">
                    {isGesturesEnabled ? 'Ativado' : 'Desativado'}
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Gerenciamento de Apps Button */}
            <button 
              onClick={() => setIsAppManagementModalOpen(true)}
              className="w-full p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between group hover:bg-emerald-100 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                  <Smartphone size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800">Gerenciamento de Apps</p>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                    {isAppVolumeEnabled ? 'Ativado' : 'Desativado'}
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Customização do Widget Button */}
            <button 
              onClick={() => setIsWidgetCustomizationModalOpen(true)}
              className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between group hover:bg-slate-200 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
                  <Settings2 size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800">Customização do Widget</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Cores e Tamanhos
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Gestão de Memória Button */}
            <button 
              onClick={() => setIsMemoryManagementModalOpen(true)}
              className="w-full p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-between group hover:bg-amber-100 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
                  <Cpu size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800">Gestão de Memória</p>
                  <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">
                    {isForegroundServiceEnabled ? 'Otimizado' : 'Não Otimizado'}
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Mixer Flutuante Config Button */}
            <button 
              onClick={() => setIsMixerConfigModalOpen(true)}
              className="w-full p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between group hover:bg-indigo-100 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                  <Disc size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800">Mixer Flutuante</p>
                  <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">
                    {isMixerEnabled ? 'Ativado' : 'Desativado'}
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Volume Widget */}
      {isWidgetEnabled && (
        <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-50">
        <motion.div
          ref={widgetRef}
          drag
          dragConstraints={constraintsRef}
          dragMomentum={false}
          dragElastic={0.1}
          animate={widgetControls}
          onDragEnd={(_, info) => {
            const screenWidth = window.innerWidth;
            const widgetWidth = widgetSize;
            const currentX = info.point.x;
            const side = currentX < screenWidth / 2 ? 'left' : 'right';
            setWidgetSide(side);

            if (isSnapToEdgeEnabled) {
              // Determine which side is closer
              const snapX = side === 'left' ? 20 : screenWidth - widgetWidth - 20;
              
              widgetControls.start({
                x: snapX,
                transition: { type: 'spring', stiffness: 300, damping: 30 }
              });
            }
          }}
          className="absolute pointer-events-auto cursor-grab active:cursor-grabbing"
          style={{ 
            touchAction: 'none',
            opacity: widgetOpacity / 100 
          }}
        >
          <div className="relative flex flex-col items-center">
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: panelDirection === 'up' ? 20 : -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: panelDirection === 'up' ? 20 : -20 }}
                  className={cn(
                    "absolute mb-4 bg-white/60 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-white/20 flex items-end gap-4",
                    panelDirection === 'up' ? "bottom-full mb-4" : "top-full mt-4",
                    widgetSide === 'left' ? "left-0 flex-row" : "right-0 flex-row-reverse"
                  )}
                >
                  {/* Main Volume Slider */}
                  <div className="flex flex-col items-center gap-4 w-12">
                    <div className="h-48 w-full flex justify-center py-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={channelVolumes[selectedChannel]}
                        onChange={handleVolumeChange}
                        className="appearance-none w-1 h-full bg-slate-200 rounded-full outline-none cursor-pointer vertical-range"
                        style={{
                          WebkitAppearance: 'slider-vertical',
                          writingMode: 'bt-lr',
                          '--thumb-color': widgetColor
                        } as any}
                      />
                    </div>
                    <div className="text-[10px] font-bold text-slate-500">
                      {channelVolumes[selectedChannel]}%
                    </div>

                    {/* Channel Selector */}
                    <div className="relative">
                      <button 
                        onClick={() => setIsChannelSelectorOpen(!isChannelSelectorOpen)}
                        className={cn(
                          "p-2 rounded-full transition-all",
                          isChannelSelectorOpen ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                        )}
                      >
                        {selectedChannel === 'media' && <Music size={18} />}
                        {selectedChannel === 'alarm' && <AlarmClock size={18} />}
                        {selectedChannel === 'ring' && <BellRing size={18} />}
                        {selectedChannel === 'call' && <Phone size={18} />}
                      </button>

                      <AnimatePresence>
                        {isChannelSelectorOpen && (
                          <motion.div
                            initial={{ opacity: 0, x: widgetSide === 'left' ? 10 : -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: widgetSide === 'left' ? 10 : -10 }}
                            className={cn(
                              "absolute top-0 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-black/5 flex flex-col gap-1",
                              widgetSide === 'left' ? "left-full ml-2" : "right-full mr-2"
                            )}
                          >
                            {[
                              { id: 'media', icon: <Music size={14} />, label: 'Mídia' },
                              { id: 'alarm', icon: <AlarmClock size={14} />, label: 'Alarme' },
                              { id: 'ring', icon: <BellRing size={14} />, label: 'Toque' },
                              { id: 'call', icon: <Phone size={14} />, label: 'Chamada' }
                            ].map((channel) => (
                              <button
                                key={channel.id}
                                onClick={() => {
                                  setSelectedChannel(channel.id as any);
                                  setVolume(channelVolumes[channel.id as keyof typeof channelVolumes]);
                                  setIsChannelSelectorOpen(false);
                                }}
                                className={cn(
                                  "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-colors whitespace-nowrap",
                                  selectedChannel === channel.id ? "bg-indigo-600 text-white" : "hover:bg-slate-100 text-slate-600"
                                )}
                              >
                                {channel.icon}
                                {channel.label}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <button 
                      onClick={toggleMute}
                      className={cn(
                        "p-2 rounded-full transition-colors",
                        isMuted ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                  </div>

                  {/* App Specific Sliders (Mixer) */}
                  {isMixerEnabled && activeApps
                    .filter(app => app.isActive)
                    .filter(app => mixerMode === 'all' || selectedMixerApps.includes(app.name))
                    .map(app => (
                    <div key={app.id} className={cn(
                      "flex flex-col items-center gap-4 w-12 pl-4",
                      widgetSide === 'left' ? "border-l border-black/5" : "border-r border-black/5 pr-4 pl-0"
                    )}>
                      <div className="h-48 w-full flex justify-center py-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={app.volume}
                          onChange={(e) => updateMixerVolume(app.id, parseInt(e.target.value))}
                          className="appearance-none w-1 h-full bg-slate-200 rounded-full outline-none cursor-pointer vertical-range"
                          style={{
                            WebkitAppearance: 'slider-vertical',
                            writingMode: 'bt-lr',
                            '--thumb-color': widgetColor
                          } as any}
                        />
                      </div>
                      <div className="text-[10px] font-bold text-slate-500">
                        {app.volume}%
                      </div>
                      <div className={cn("p-2 rounded-full bg-slate-100 text-slate-600 shadow-sm flex items-center justify-center overflow-hidden w-9 h-9")}>
                        {typeof app.icon === 'string' ? (
                          <img src={app.icon} alt={app.name} className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
                        ) : (
                          app.icon
                        )}
                      </div>
                      <div className="h-9" /> {/* Spacer to align with mute button */}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onPointerDown={(e) => {
                dragStartPos.current = { x: e.clientX, y: e.clientY };
                pressTimer.current = setTimeout(() => {
                  handleGestureAction('hold');
                }, 600);
              }}
              onPointerUp={(e) => {
                clearTimeout(pressTimer.current);
                
                // Swipe detection
                const deltaX = e.clientX - dragStartPos.current.x;
                if (Math.abs(deltaX) > 50) {
                  handleGestureAction(deltaX > 0 ? 'swipe-right' : 'swipe-left');
                  return;
                }

                // Tap detection
                const now = Date.now();
                if (now - lastTapTime.current < 300) {
                  tapCount.current++;
                } else {
                  tapCount.current = 1;
                }
                lastTapTime.current = now;

                setTimeout(() => {
                  if (tapCount.current === 2) {
                    handleGestureAction('double');
                    tapCount.current = 0;
                  } else if (tapCount.current === 3) {
                    handleGestureAction('triple');
                    tapCount.current = 0;
                  } else if (tapCount.current === 1) {
                    if (!isExpanded) setIsExpanded(true);
                    else setIsExpanded(false);
                    tapCount.current = 0;
                  }
                }, 300);
              }}
              style={{
                backgroundColor: isExpanded ? widgetColor : undefined,
                color: isExpanded ? '#fff' : undefined,
                width: widgetSize,
                height: widgetSize
              }}
              className={cn(
                "rounded-full flex items-center justify-center shadow-xl transition-all duration-300 backdrop-blur-sm group relative",
                !isExpanded && "bg-white/80 text-slate-900 border border-black/5",
                isExpanded && "rotate-90"
              )}
            >
              {getVolumeIcon()}
              {!isExpanded && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  Arraste-me
                </div>
              )}
              
              {/* Gesture Feedback Overlay */}
              <AnimatePresence>
                {gestureFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: -40 }}
                    exit={{ opacity: 0 }}
                    className="absolute whitespace-nowrap bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg"
                  >
                    {gestureFeedback}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.div>
      </div>
      )}

      {/* Palm Cover Simulation Button */}
      {isGesturesEnabled && !isScreenOff && (
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handlePalmCover}
          className="fixed top-6 right-6 z-40 bg-slate-800 text-white p-3 rounded-2xl shadow-xl flex items-center gap-2 hover:bg-slate-700 transition-colors border border-white/10"
        >
          <Hand size={18} />
          <span className="text-xs font-bold uppercase tracking-wider">Cobrir Sensor</span>
        </motion.button>
      )}

      {/* App Selection Modal */}
      <AnimatePresence>
        {isAppSelectionOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAppSelectionOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Selecionar App</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Apps Instalados</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAppSelectionOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="p-4 bg-slate-50 border-b border-slate-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Buscar aplicativo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-black/5 rounded-2xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {availableApps
                  .filter(app => app.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(app => (
                    <button
                      key={app.name}
                      onClick={() => selectApp(app)}
                      className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                          <MonitorSmartphone size={20} />
                        </div>
                        <span className="font-semibold text-slate-700">{app.name}</span>
                      </div>
                      {appConfigs.find(c => c.name === app.name) ? (
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full uppercase">Adicionado</span>
                      ) : (
                        <Plus size={18} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                      )}
                    </button>
                  ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Smart Gestures Modal */}
      <AnimatePresence>
        {isGesturesModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGesturesModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Gestos Inteligentes</h2>
                    <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Atalhos Rápidos</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsGesturesModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-black/5">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Ativar Gestos</p>
                    <p className="text-[10px] text-slate-400 font-medium">Habilita interações avançadas no botão</p>
                  </div>
                  <button 
                    onClick={() => setIsGesturesEnabled(!isGesturesEnabled)}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                      isGesturesEnabled ? "bg-indigo-600" : "bg-slate-200"
                    )}
                  >
                    <span className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      isGesturesEnabled ? "translate-x-6" : "translate-x-1"
                    )} />
                  </button>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Configurar Gestos</p>
                  
                  <div className="grid gap-3">
                    {[
                      { id: 'double', icon: <PlayCircle size={16} />, title: 'Dois Toques', desc: 'Pausa ou retoma mídia', color: 'bg-blue-50 text-blue-600' },
                      { id: 'hold', icon: <VolumeX size={16} />, title: 'Segurar', desc: 'Mudo instantâneo', color: 'bg-red-50 text-red-600' },
                      { id: 'swipe', icon: <SkipForward size={16} />, title: 'Deslizar Lados', desc: 'Pula ou volta faixas', color: 'bg-emerald-50 text-emerald-600' },
                      { id: 'triple', icon: <Camera size={16} />, title: 'Toque Triplo', desc: 'Captura de tela rápida', color: 'bg-purple-50 text-purple-600' },
                      { id: 'palm', icon: <Hand size={16} />, title: 'Cobrir Sensor', desc: 'Mudo + Tela desligada', color: 'bg-slate-900 text-white' },
                    ].map((gesture) => (
                      <div key={gesture.id} className={cn(
                        "flex items-center justify-between p-3 bg-white border border-slate-100 rounded-2xl shadow-sm transition-opacity",
                        !isGesturesEnabled && "opacity-60"
                      )}>
                        <div className="flex items-center gap-4">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", gesture.color)}>
                            {gesture.icon}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{gesture.title}</p>
                            <p className="text-xs text-slate-500">{gesture.desc}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setEnabledGestures(prev => ({ ...prev, [gesture.id]: !prev[gesture.id as keyof typeof prev] }))}
                          disabled={!isGesturesEnabled}
                          className={cn(
                            "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none",
                            isGesturesEnabled && enabledGestures[gesture.id as keyof typeof enabledGestures] ? "bg-indigo-600" : "bg-slate-200",
                            !isGesturesEnabled && "cursor-not-allowed"
                          )}
                        >
                          <span className={cn(
                            "inline-block h-3 w-3 transform rounded-full bg-white transition-transform",
                            isGesturesEnabled && enabledGestures[gesture.id as keyof typeof enabledGestures] ? "translate-x-5" : "translate-x-1"
                          )} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                  <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider mb-1">Dica de Uso</p>
                  <p className="text-xs text-amber-600 leading-relaxed">
                    Os gestos funcionam em qualquer lugar da tela. O sensor de proximidade (Cobrir Sensor) é ideal para reuniões ou privacidade instantânea.
                  </p>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100">
                <button 
                  onClick={() => setIsGesturesModalOpen(false)}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* App Management Modal */}
      <AnimatePresence>
        {isAppManagementModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAppManagementModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Gerenciamento de Apps</h2>
                    <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Controle por Aplicativo</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAppManagementModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-black/5">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Ativar Controle</p>
                    <p className="text-[10px] text-slate-400 font-medium">Ajusta volume baseado no app aberto</p>
                  </div>
                  <button 
                    onClick={() => setIsAppVolumeEnabled(!isAppVolumeEnabled)}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                      isAppVolumeEnabled ? "bg-emerald-600" : "bg-slate-200"
                    )}
                  >
                    <span className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      isAppVolumeEnabled ? "translate-x-6" : "translate-x-1"
                    )} />
                  </button>
                </div>

                <div className={cn("space-y-4 transition-opacity", !isAppVolumeEnabled && "opacity-50 pointer-events-none")}>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Apps Detectados</label>
                    <button 
                      onClick={simulateScan}
                      disabled={isScanning || !isAppVolumeEnabled}
                      className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 disabled:opacity-50 flex items-center gap-1"
                    >
                      {isScanning ? 'Escaneando...' : 'Escanear Smartphone'}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {['Desktop', ...appConfigs.map(c => c.name)].map(app => (
                      <button
                        key={app}
                        onClick={() => setCurrentApp(app)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
                          currentApp === app 
                            ? "bg-emerald-600 text-white shadow-sm" 
                            : "bg-white text-slate-600 border border-black/5 hover:bg-slate-50"
                        )}
                      >
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          currentApp === app ? "bg-white" : "bg-slate-300"
                        )} />
                        {app}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Configurações de Volume</p>
                      <span className="text-[10px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded font-bold">{appConfigs.length} Apps</span>
                    </div>
                    
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {appConfigs.map(config => (
                        <div 
                          key={config.name} 
                          onClick={() => setConfigApp(config)}
                          className="flex items-center justify-between bg-white p-3 rounded-xl border border-black/5 shadow-sm cursor-pointer hover:border-emerald-200 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                              <MonitorSmartphone size={16} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold">{config.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] text-slate-400 font-bold uppercase">Mídia: {config.mediaVolume}%</span>
                                <span className="text-[9px] text-slate-400 font-bold uppercase">Notif: {config.notificationVolume}%</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-400 transition-colors" />
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                removeAppConfig(config.name);
                              }}
                              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2">
                      <button 
                        onClick={() => setIsAppSelectionOpen(true)}
                        className="w-full py-3 bg-white border border-dashed border-slate-300 rounded-xl text-slate-500 text-xs font-bold uppercase tracking-wider hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50/30 transition-all flex items-center justify-center gap-2"
                      >
                        <Plus size={16} />
                        Selecionar App Instalado
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100">
                <button 
                  onClick={() => setIsAppManagementModalOpen(false)}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all"
                >
                  Concluído
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mixer Configuration Modal */}
      <AnimatePresence>
        {isMixerConfigModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMixerConfigModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Disc size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Mixer Flutuante</h2>
                    <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Controle Individual por App</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMixerConfigModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-black/5">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Ativar Mixer</p>
                    <p className="text-[10px] text-slate-400 font-medium">Mostrar sliders para apps de mídia</p>
                  </div>
                  <button 
                    onClick={() => setIsMixerEnabled(!isMixerEnabled)}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                      isMixerEnabled ? "bg-indigo-600" : "bg-slate-200"
                    )}
                  >
                    <span className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      isMixerEnabled ? "translate-x-6" : "translate-x-1"
                    )} />
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Modo de Operação</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setMixerMode('all')}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all text-center space-y-2",
                        mixerMode === 'all' ? "border-indigo-600 bg-indigo-50" : "border-slate-100 hover:border-slate-200"
                      )}
                    >
                      <p className={cn("text-xs font-bold", mixerMode === 'all' ? "text-indigo-600" : "text-slate-600")}>Todos os Apps</p>
                      <p className="text-[9px] text-slate-400">Qualquer app com som</p>
                    </button>
                    <button
                      onClick={() => setMixerMode('selected')}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all text-center space-y-2",
                        mixerMode === 'selected' ? "border-indigo-600 bg-indigo-50" : "border-slate-100 hover:border-slate-200"
                      )}
                    >
                      <p className={cn("text-xs font-bold", mixerMode === 'selected' ? "text-indigo-600" : "text-slate-600")}>Selecionados</p>
                      <p className="text-[9px] text-slate-400">Apenas apps escolhidos</p>
                    </button>
                  </div>
                </div>

                {mixerMode === 'selected' && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Apps Selecionados</p>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {availableApps.map(app => (
                        <button
                          key={app.name}
                          onClick={() => {
                            if (selectedMixerApps.includes(app.name)) {
                              setSelectedMixerApps(selectedMixerApps.filter(a => a !== app.name));
                            } else {
                              setSelectedMixerApps([...selectedMixerApps, app.name]);
                            }
                          }}
                          className={cn(
                            "flex items-center gap-2 p-3 rounded-xl border transition-all",
                            selectedMixerApps.includes(app.name) 
                              ? "bg-indigo-600 border-indigo-600 text-white" 
                              : "bg-white border-slate-100 text-slate-600 hover:border-slate-200"
                          )}
                        >
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            selectedMixerApps.includes(app.name) ? "bg-white" : "bg-slate-200"
                          )} />
                          <span className="text-[10px] font-bold">{app.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div className="flex items-center gap-2">
                    <Disc size={16} className="text-indigo-600" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Simulação de Mixer</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {activeApps.map(app => (
                      <button
                        key={app.id}
                        onClick={() => setActiveApps(prev => prev.map(a => a.id === app.id ? { ...a, isActive: !a.isActive } : a))}
                        className={cn(
                          "py-2 px-2 rounded-xl text-[9px] font-bold transition-all flex flex-col items-center justify-center gap-1 border h-16",
                          app.isActive ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-white text-slate-400 border-slate-200"
                        )}
                      >
                        {typeof app.icon === 'string' ? (
                          <img src={app.icon} alt={app.name} className="w-4 h-4 object-contain" referrerPolicy="no-referrer" />
                        ) : (
                          app.icon
                        )}
                        <span>{app.name}</span>
                        <span className="text-[7px] opacity-70">{app.isActive ? 'Ativo' : 'Inativo'}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[9px] text-slate-400 italic text-center">Use estes botões para simular apps reproduzindo áudio.</p>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100">
                <button 
                  onClick={() => setIsMixerConfigModalOpen(false)}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                >
                  Salvar Configurações
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Widget Customization Modal */}
      <AnimatePresence>
        {isWidgetCustomizationModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWidgetCustomizationModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-800 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Settings2 size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Customização</h2>
                    <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Aparência do Widget</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsWidgetCustomizationModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
                {/* Themes Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Palette size={16} className="text-slate-400" />
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Temas Predefinidos</label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(themes).map(([id, theme]) => (
                      <button
                        key={id}
                        onClick={() => applyTheme(id)}
                        className={cn(
                          "p-3 rounded-2xl border-2 transition-all text-left space-y-2",
                          currentTheme === id ? "border-indigo-600 bg-indigo-50" : "border-slate-100 hover:border-slate-200"
                        )}
                      >
                        <div className="flex gap-1">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.accent }} />
                          <div className="w-4 h-4 rounded-full opacity-50" style={{ backgroundColor: theme.accent }} />
                        </div>
                        <p className={cn("text-xs font-bold", currentTheme === id ? "text-indigo-600" : "text-slate-600")}>
                          {theme.name}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cor do Tema</label>
                  <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-black/5">
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={widgetColor}
                        onChange={(e) => setWidgetColor(e.target.value)}
                        className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-none"
                      />
                      <span className="text-sm font-mono font-bold text-slate-600 uppercase tracking-widest">{widgetColor}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full shadow-inner border border-black/5" style={{ backgroundColor: widgetColor }} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Opacidade</label>
                    <span className="text-sm font-black text-slate-800">{widgetOpacity}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={widgetOpacity}
                    onChange={(e) => setWidgetOpacity(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-slate-800"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tamanho do Botão</label>
                    <span className="text-sm font-black text-slate-800">{widgetSize}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="40" 
                    max="100" 
                    value={widgetSize}
                    onChange={(e) => setWidgetSize(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-slate-800"
                  />
                </div>

                {/* Snap to Edge Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-black/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                      <Magnet size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Snap to Edge</p>
                      <p className="text-[10px] text-slate-400 font-medium">Grudar nas bordas ao soltar</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsSnapToEdgeEnabled(!isSnapToEdgeEnabled)}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                      isSnapToEdgeEnabled ? "bg-indigo-600" : "bg-slate-200"
                    )}
                  >
                    <span className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      isSnapToEdgeEnabled ? "translate-x-6" : "translate-x-1"
                    )} />
                  </button>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-black/5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-sm border border-black/5" style={{ width: widgetSize/2, height: widgetSize/2, opacity: widgetOpacity/100, backgroundColor: widgetColor }}>
                    <Volume2 size={widgetSize/4} className="text-white" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium leading-tight">
                    Prévia do widget com as configurações atuais de cor, opacidade e tamanho.
                  </p>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100">
                <button 
                  onClick={() => setIsWidgetCustomizationModalOpen(false)}
                  className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-100 hover:bg-slate-900 transition-all"
                >
                  Salvar Alterações
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* App Selection Modal */}
      {/* Memory Management Modal */}
      <AnimatePresence>
        {isMemoryManagementModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMemoryManagementModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-amber-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Cpu size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Gestão de Memória</h2>
                    <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Foreground Service</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMemoryManagementModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-black/5">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Serviço em Primeiro Plano</p>
                    <p className="text-[10px] text-slate-400 font-medium">Evita que o Android encerre o app</p>
                  </div>
                  <button 
                    onClick={() => setIsForegroundServiceEnabled(!isForegroundServiceEnabled)}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                      isForegroundServiceEnabled ? "bg-amber-600" : "bg-slate-200"
                    )}
                  >
                    <span className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      isForegroundServiceEnabled ? "translate-x-6" : "translate-x-1"
                    )} />
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Por que ativar?</p>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-black/5 space-y-3">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 shrink-0">
                        <ShieldCheck size={16} />
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        O Android encerra processos em segundo plano para liberar RAM. Ativar esta opção cria uma <strong>Notificação Fixa</strong>, sinalizando ao sistema que este é um serviço essencial.
                      </p>
                    </div>
                  </div>
                </div>

                {isForegroundServiceEnabled && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Simulação de Notificação</p>
                    <div className="bg-slate-900 p-4 rounded-2xl border border-white/10 flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                        <Volume2 size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-white">Volume Control está ativo</p>
                        <p className="text-[10px] text-white/50">Toque para configurar ou ocultar</p>
                      </div>
                      <div className="text-[10px] text-white/30 font-mono">AGORA</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100">
                <button 
                  onClick={() => setIsMemoryManagementModalOpen(false)}
                  className="w-full py-4 bg-amber-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-amber-100 hover:bg-amber-700 transition-all"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {configApp && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfigApp(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                    <MonitorSmartphone size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">{configApp.name}</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Configurações de Áudio</p>
                  </div>
                </div>
                <button 
                  onClick={() => setConfigApp(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="p-8 space-y-8">
                {/* Media Volume */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                        <Music size={16} />
                      </div>
                      <span className="text-sm font-bold text-slate-700">Volume de Mídia</span>
                    </div>
                    <span className="text-lg font-black text-indigo-600">{configApp.mediaVolume}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={configApp.mediaVolume}
                    onChange={(e) => updateAppConfig(configApp.name, 'mediaVolume', parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    <span>Mín</span>
                    <span>Máx</span>
                  </div>
                </div>

                {/* Notification Volume */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                        <Bell size={16} />
                      </div>
                      <span className="text-sm font-bold text-slate-700">Volume de Notificação</span>
                    </div>
                    <span className="text-lg font-black text-indigo-600">{configApp.notificationVolume}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={configApp.notificationVolume}
                    onChange={(e) => updateAppConfig(configApp.name, 'notificationVolume', parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    <span>Mín</span>
                    <span>Máx</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100">
                <button 
                  onClick={() => setConfigApp(null)}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
                >
                  Salvar Configurações
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .vertical-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: var(--thumb-color, #4f46e5);
          border-radius: 50%;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        
        .vertical-range::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: var(--thumb-color, #4f46e5);
          border-radius: 50%;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
