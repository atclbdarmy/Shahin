
import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Search, Filter, Map as MapIcon, List, Star, Navigation, Send, X, User, DollarSign, BrainCircuit } from 'lucide-react';
import { MOCK_LABORERS, SKILLS_LIST } from './constants';
import { Laborer, SearchFilters } from './types';
import { getSmartMatch } from './services/geminiService';

// Fix Leaflet marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom price marker icon component
const createPriceIcon = (price: number, isSelected: boolean) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="price-marker ${isSelected ? 'ring-4 ring-blue-500 bg-blue-50' : ''}">$${price}/hr</div>`,
    iconSize: [60, 24],
    iconAnchor: [30, 12],
  });
};

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
}

const App: React.FC = () => {
  const [laborers, setLaborers] = useState<Laborer[]>(MOCK_LABORERS);
  const [selectedLaborer, setSelectedLaborer] = useState<Laborer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    maxRate: 50,
    minRating: 0,
    skills: []
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]);
  const [isSmartMatching, setIsSmartMatching] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  // Filtered Laborers
  const filteredLaborers = useMemo(() => {
    return laborers.filter(l => {
      const matchesSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          l.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesRate = l.ratePerHour <= filters.maxRate;
      const matchesRating = l.rating >= filters.minRating;
      const matchesSkills = filters.skills.length === 0 || filters.skills.some(s => l.skills.includes(s));
      return matchesSearch && matchesRate && matchesRating && matchesSkills;
    });
  }, [laborers, searchQuery, filters]);

  const handleSmartMatch = async () => {
    if (!searchQuery.trim()) {
      alert("Please describe what you need help with in the search bar (e.g., 'Need someone to help me move furniture')");
      return;
    }
    setIsSmartMatching(true);
    setAiInsight(null);
    try {
      const result = await getSmartMatch(searchQuery, laborers);
      const matched = laborers.find(l => l.id === result.bestMatchId);
      if (matched) {
        setSelectedLaborer(matched);
        setMapCenter([matched.location.lat, matched.location.lng]);
        setAiInsight(result.reason);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSmartMatching(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) 
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  return (
    <div className="flex h-full w-full bg-slate-50 relative overflow-hidden font-sans">
      {/* Sidebar */}
      <div className={`
        fixed md:relative z-20 h-full bg-white border-r border-slate-200 transition-all duration-300 shadow-xl
        ${isSidebarOpen ? 'w-full md:w-[400px] translate-x-0' : 'w-0 -translate-x-full md:hidden'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-blue-600 text-white">
            <div className="flex items-center gap-2">
              <Navigation className="w-6 h-6 fill-white" />
              <h1 className="text-xl font-bold tracking-tight">LaborConnect</h1>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-2 hover:bg-blue-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search & AI */}
          <div className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Find help (e.g. Carpentry, Moving)"
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={handleSmartMatch}
              disabled={isSmartMatching}
              className={`
                w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium text-sm transition-all
                ${isSmartMatching ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}
              `}
            >
              <BrainCircuit className={`w-4 h-4 ${isSmartMatching ? 'animate-pulse' : ''}`} />
              {isSmartMatching ? 'AI Thinking...' : 'AI Smart Match'}
            </button>
          </div>

          {/* Filters */}
          <div className="px-4 pb-4 border-b border-slate-100 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <div className="flex gap-2">
              {SKILLS_LIST.map(skill => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`
                    px-3 py-1 rounded-full text-xs font-medium border transition-all
                    ${filters.skills.includes(skill) 
                      ? 'bg-blue-500 border-blue-500 text-white shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'}
                  `}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* AI Insight Box */}
          {aiInsight && (
            <div className="mx-4 mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2 mb-1">
                <BrainCircuit className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">AI Insight</span>
              </div>
              <p className="text-sm text-indigo-800 leading-relaxed italic">
                "{aiInsight}"
              </p>
            </div>
          )}

          {/* Laborer List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {filteredLaborers.length > 0 ? (
              filteredLaborers.map(laborer => (
                <div 
                  key={laborer.id}
                  onClick={() => {
                    setSelectedLaborer(laborer);
                    setMapCenter([laborer.location.lat, laborer.location.lng]);
                  }}
                  className={`
                    p-4 rounded-xl border transition-all cursor-pointer group
                    ${selectedLaborer?.id === laborer.id 
                      ? 'border-blue-500 bg-blue-50/50 shadow-md ring-1 ring-blue-500/20' 
                      : 'border-slate-100 hover:border-blue-200 hover:bg-white hover:shadow-sm'}
                  `}
                >
                  <div className="flex gap-4">
                    <img 
                      src={laborer.avatar} 
                      alt={laborer.name} 
                      className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{laborer.name}</h3>
                        <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
                          <DollarSign className="w-3 h-3" />
                          {laborer.ratePerHour}/hr
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium text-slate-600">{laborer.rating}</span>
                        <span className="text-xs text-slate-400">({laborer.reviews} reviews)</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {laborer.skills.slice(0, 3).map(skill => (
                          <span key={skill} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Search className="w-12 h-12 mb-4 opacity-20" />
                <p>No laborers found in this area.</p>
              </div>
            )}
          </div>

          {/* Footer Branding */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
            <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">
              Connecting Neighbors • Secure Payments • Insured
            </p>
          </div>
        </div>
      </div>

      {/* Main Map View */}
      <div className="flex-1 h-full relative">
        <MapContainer 
          center={mapCenter} 
          zoom={14} 
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater center={mapCenter} />
          {filteredLaborers.map(laborer => (
            <Marker 
              key={laborer.id} 
              position={[laborer.location.lat, laborer.location.lng]}
              icon={createPriceIcon(laborer.ratePerHour, selectedLaborer?.id === laborer.id)}
              eventHandlers={{
                click: () => {
                  setSelectedLaborer(laborer);
                  setIsSidebarOpen(true);
                  setAiInsight(null);
                }
              }}
            >
              <Popup>
                <div className="p-1">
                  <p className="font-bold text-slate-800">{laborer.name}</p>
                  <p className="text-xs text-slate-500">{laborer.skills.join(', ')}</p>
                  <button className="mt-2 w-full py-1 bg-blue-600 text-white rounded text-xs font-bold">
                    Book Now
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Map Overlays */}
        <div className="absolute top-4 left-4 z-[1000] flex gap-2">
          {!isSidebarOpen && (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-3 bg-white shadow-lg rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <List className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Selection Overlay (Floating Card) */}
        {selectedLaborer && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-2xl shadow-2xl p-4 border border-slate-200">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="relative">
                    <img 
                      src={selectedLaborer.avatar} 
                      className="w-16 h-16 rounded-2xl object-cover" 
                      alt={selectedLaborer.name} 
                    />
                    <div className={`
                      absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white
                      ${selectedLaborer.availability === 'Available' ? 'bg-green-500' : 'bg-amber-500'}
                    `} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">{selectedLaborer.name}</h2>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-slate-600">{selectedLaborer.rating}</span>
                      <span className="text-[10px] text-slate-400">({selectedLaborer.reviews} reviews)</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{selectedLaborer.bio}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedLaborer(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Rate</p>
                  <p className="text-lg font-bold text-slate-800">${selectedLaborer.ratePerHour}<span className="text-xs text-slate-500 font-normal"> / hour</span></p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Distance</p>
                  <p className="text-lg font-bold text-slate-800">{selectedLaborer.distance}<span className="text-xs text-slate-500 font-normal"> miles away</span></p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                  Contact Now
                </button>
                <button className="p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                  <User className="w-6 h-6 text-slate-600" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
