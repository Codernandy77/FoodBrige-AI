import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix leaflet default icon issue in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom colored markers
const getMarkerIcon = (type: 'pending' | 'accepted' | 'completed' | 'need', servings: number) => {
  let color = '#22c55e'; // Green for pending
  if (type === 'accepted') color = '#3b82f6'; // Blue
  else if (type === 'completed') color = '#94a3b8'; // Gray
  else if (type === 'need') color = '#ef4444'; // Red

  // Size scales with quantity
  const size = Math.min(32, Math.max(16, 12 + servings * 0.05));

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.3);" class="map-pulse-marker"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  type: 'pending' | 'accepted' | 'completed' | 'need';
  servings: number;
  meta?: string;
}

interface InteractiveMapProps {
  markers: MapMarker[];
  center?: [number, number]; // [lat, lng]
  zoom?: number;
  height?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  markers,
  center = [13.0827, 80.2707], // Chennai
  zoom = 12,
  height = '400px'
}) => {
  const [loadError, setLoadError] = useState(false);
  const [activeDistrict, setActiveDistrict] = useState<string | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);

  // Approximate coordinate mapping to SVG viewBox (1000x800)
  // Chennai bounding box for mapping: Lat 12.85 to 13.20, Lng 80.10 to 80.32
  const mapCoordsToSvg = (lat: number, lng: number) => {
    const latMin = 12.85;
    const latMax = 13.20;
    const lngMin = 80.10;
    const lngMax = 80.32;

    const x = ((lng - lngMin) / (lngMax - lngMin)) * 800 + 100;
    const y = 800 - (((lat - latMin) / (latMax - latMin)) * 600 + 100); // SVG y is inverted
    return { x, y };
  };

  if (loadError) {
    return renderSvgFallback();
  }

  try {
    return (
      <div style={{ height }} className="w-full rounded-xl overflow-hidden shadow-inner border border-slate-200 relative z-10">
        <MapContainer 
          center={center} 
          zoom={zoom} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {markers.map((m) => (
            <Marker 
              key={m.id} 
              position={[m.lat, m.lng]}
              icon={getMarkerIcon(m.type, m.servings)}
            >
              <Popup>
                <div className="p-1 font-sans text-xs">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide mb-1.5 text-white ${
                    m.type === 'pending' ? 'bg-green-500' :
                    m.type === 'accepted' ? 'bg-blue-500' :
                    m.type === 'completed' ? 'bg-slate-400' : 'bg-red-500'
                  }`}>
                    {m.type}
                  </span>
                  <h4 className="font-bold text-slate-800 text-sm">{m.title}</h4>
                  <p className="text-slate-600 mt-1">{m.description}</p>
                  <p className="font-semibold text-primary-600 mt-1">{m.servings} Servings</p>
                  {m.meta && <p className="text-slate-400 mt-1 italic text-[10px]">{m.meta}</p>}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    );
  } catch (err) {
    return renderSvgFallback();
  }

  // Styled SVG interactive map fallback for offline/errors
  function renderSvgFallback() {
    return (
      <div style={{ height }} className="w-full bg-slate-900 rounded-xl p-4 flex flex-col items-center justify-between border border-slate-700 relative text-white font-sans overflow-hidden">
        
        {/* Map Header */}
        <div className="w-full flex justify-between items-center border-b border-slate-700 pb-2 mb-2 z-20">
          <div>
            <h3 className="font-bold text-sm text-green-400">Interactive Aggregation Need Map (SVG Mode)</h3>
            <p className="text-[10px] text-slate-400">Fail-safe client visualization offline rendering</p>
          </div>
          <div className="flex gap-2 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Pending</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Accepted</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Deficit Area</span>
          </div>
        </div>

        {/* Custom SVG Tamil Nadu District Overlay */}
        <div className="w-full flex-grow relative flex items-center justify-center">
          <svg viewBox="0 0 1000 800" className="w-full h-full max-h-[300px]">
            {/* Background grid */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" rx="8" />

            {/* Stylized Chennai Bay outline */}
            <path d="M 800,100 C 700,200 650,450 780,680" fill="none" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="6" strokeDasharray="5,5" />
            
            {/* Tamil Nadu Districts Vector Blocks */}
            <g stroke="#1e293b" strokeWidth="2" fill="#334155">
              <path 
                d="M 400,200 L 600,180 L 650,300 L 450,350 Z" 
                className={`transition-colors cursor-pointer ${activeDistrict === 'North' ? 'fill-primary-700' : 'hover:fill-slate-600'}`}
                onClick={() => setActiveDistrict('North')}
              />
              <text x="500" y="260" fill="#94a3b8" fontSize="16" fontWeight="bold" textAnchor="middle" pointerEvents="none">North Chennai</text>

              <path 
                d="M 650,300 L 800,280 L 780,450 L 580,420 Z" 
                className={`transition-colors cursor-pointer ${activeDistrict === 'Central' ? 'fill-primary-700' : 'hover:fill-slate-600'}`}
                onClick={() => setActiveDistrict('Central')}
              />
              <text x="700" y="370" fill="#94a3b8" fontSize="16" fontWeight="bold" textAnchor="middle" pointerEvents="none">Central District</text>

              <path 
                d="M 450,350 L 580,420 L 520,620 L 350,550 Z" 
                className={`transition-colors cursor-pointer ${activeDistrict === 'South' ? 'fill-primary-700' : 'hover:fill-slate-600'}`}
                onClick={() => setActiveDistrict('South')}
              />
              <text x="470" y="500" fill="#94a3b8" fontSize="16" fontWeight="bold" textAnchor="middle" pointerEvents="none">South Chennai</text>
            </g>

            {/* Render Markers as clickable vector circles */}
            {markers.map((m) => {
              const { x, y } = mapCoordsToSvg(m.lat, m.lng);
              const color = m.type === 'pending' ? '#22c55e' : m.type === 'accepted' ? '#3b82f6' : m.type === 'completed' ? '#64748b' : '#ef4444';
              return (
                <g key={m.id} className="cursor-pointer group" onClick={() => setSelectedMarker(m)}>
                  <circle cx={x} cy={y} r="14" fill={color} stroke="white" strokeWidth="2" />
                  <circle cx={x} cy={y} r="22" fill="none" stroke={color} strokeWidth="1" className="animate-ping" opacity="0.4" />
                  <text x={x} y={y - 18} fill="white" fontSize="11" textAnchor="middle" fontWeight="bold" className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 p-1 rounded">
                    {m.title.substring(0, 15)}...
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Marker popup panel */}
        {selectedMarker ? (
          <div className="w-full bg-slate-800 p-3 rounded-lg border border-slate-700 flex justify-between items-start gap-4 z-20">
            <div>
              <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase text-white ${
                selectedMarker.type === 'pending' ? 'bg-green-500' :
                selectedMarker.type === 'accepted' ? 'bg-blue-500' :
                selectedMarker.type === 'completed' ? 'bg-slate-400' : 'bg-red-500'
              }`}>
                {selectedMarker.type}
              </span>
              <h4 className="font-bold text-xs text-white mt-1">{selectedMarker.title}</h4>
              <p className="text-[10px] text-slate-300 mt-0.5 leading-relaxed">{selectedMarker.description}</p>
              <p className="font-semibold text-xs text-green-400 mt-1">{selectedMarker.servings} Servings</p>
            </div>
            <button 
              className="text-xs text-slate-400 hover:text-white bg-slate-700 px-2 py-1 rounded" 
              onClick={() => setSelectedMarker(null)}
            >
              Close
            </button>
          </div>
        ) : (
          <div className="w-full text-center text-[11px] text-slate-400 py-2 border-t border-slate-800">
            Click on a colored marker pin on the Chennai grid above to view donation status details.
          </div>
        )}
      </div>
    );
  }
};
