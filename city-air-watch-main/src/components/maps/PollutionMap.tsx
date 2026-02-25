import { MapContainer, TileLayer, Circle, Marker, Popup, useMapEvents } from "react-leaflet";
import { DivIcon } from "leaflet";
import { Wind } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

// Zone data with real coordinates (example: using a generic city center)
// You can adjust these coordinates to match your actual city
const zones = [
  { id: 1, name: "Central", lat: 28.6139, lng: 77.2090, aqi: 85, radius: 2000, ward: "Ward 1 - Central" },
  { id: 2, name: "North", lat: 28.7041, lng: 77.1025, aqi: 45, radius: 1500, ward: "Ward 2 - North" },
  { id: 3, name: "South", lat: 28.5245, lng: 77.1855, aqi: 156, radius: 1800, ward: "Ward 3 - Traffic Hub" },
  { id: 4, name: "East", lat: 28.6139, lng: 77.3156, aqi: 120, radius: 1600, ward: "Ward 4 - East" },
  { id: 5, name: "West", lat: 28.6139, lng: 77.1025, aqi: 65, radius: 1700, ward: "Ward 5 - West" },
  { id: 6, name: "Industrial", lat: 28.7041, lng: 77.3156, aqi: 210, radius: 1400, ward: "Ward 6 - Industrial" },
  { id: 7, name: "Construction", lat: 28.6545, lng: 77.2090, aqi: 185, radius: 1200, ward: "Ward 12 - Construction" },
  { id: 8, name: "Market", lat: 28.5939, lng: 77.2090, aqi: 145, radius: 1300, ward: "Ward 8 - Market Area" },
];

// Default center (can be adjusted to your city)
const defaultCenter: [number, number] = [28.6139, 77.2090];
const defaultZoom = 12;

const getAQIColor = (aqi: number) => {
  if (aqi <= 50) return "#22c55e"; // Good - Green
  if (aqi <= 100) return "#eab308"; // Moderate - Yellow
  if (aqi <= 150) return "#f97316"; // Unhealthy - Orange
  return "#ef4444"; // Hazardous - Red
};

const getAQILabel = (aqi: number) => {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy";
  return "Hazardous";
};

// Custom icon for markers using DivIcon
const createCustomIcon = (color: string, aqi: number, isSelected: boolean = false) => {
  return new DivIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: ${isSelected ? '44px' : '36px'};
        height: ${isSelected ? '44px' : '36px'};
        border-radius: 50%;
        border: ${isSelected ? '4px solid #000' : '3px solid white'};
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: ${isSelected ? '0 4px 12px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.3)'};
        font-weight: bold;
        color: white;
        font-size: ${isSelected ? '12px' : '11px'};
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
      ">
        ${aqi}
      </div>
    `,
    iconSize: [isSelected ? 44 : 36, isSelected ? 44 : 36],
    iconAnchor: [isSelected ? 22 : 18, isSelected ? 22 : 18],
    popupAnchor: [0, isSelected ? -22 : -18],
  });
};

function MapClickHandler({ onZoneClick }: { onZoneClick: (ward: string) => void }) {
  return null; // Event handlers will be on individual markers
}

export function PollutionMap({ 
  compact = false, 
  onZoneClick,
  selectedWard 
}: { 
  compact?: boolean;
  onZoneClick?: (ward: string) => void;
  selectedWard?: string;
}) {
  useEffect(() => {
    // Store selected ward in localStorage when changed
    if (selectedWard) {
      localStorage.setItem('selectedWard', selectedWard);
    }
  }, [selectedWard]);

  const handleMarkerClick = (ward: string) => {
    if (onZoneClick) {
      onZoneClick(ward);
    }
    // Also store in localStorage for cross-component communication
    localStorage.setItem('selectedWard', ward);
    // Trigger a custom event for other components to listen
    window.dispatchEvent(new CustomEvent('wardSelected', { detail: { ward } }));
  };

  return (
    <div className={`relative bg-muted/30 rounded-2xl overflow-hidden ${compact ? 'h-64' : 'h-96'}`}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        scrollWheelZoom={true}
        className="h-full w-full rounded-2xl z-0"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {zones.map((zone) => {
          const color = getAQIColor(zone.aqi);
          const isSelected = selectedWard === zone.ward;
          const customIcon = createCustomIcon(
            color, 
            zone.aqi, 
            isSelected
          );
          
          return (
            <div key={zone.id}>
              <Circle
                center={[zone.lat, zone.lng]}
                radius={zone.radius}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: isSelected ? 0.5 : 0.3,
                  color: isSelected ? '#000' : color,
                  weight: isSelected ? 4 : 2,
                  opacity: isSelected ? 0.8 : 0.6,
                }}
                eventHandlers={{
                  click: () => handleMarkerClick(zone.ward),
                }}
              />
              <Marker
                position={[zone.lat, zone.lng]}
                icon={customIcon}
                eventHandlers={{
                  click: () => handleMarkerClick(zone.ward),
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[140px]">
                    <h3 className="font-semibold text-sm mb-2">{zone.ward || zone.name} Zone</h3>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">AQI: {zone.aqi}</span>
                        <span className="text-xs text-muted-foreground">
                          {getAQILabel(zone.aqi)}
                        </span>
                      </div>
                    </div>
                    {onZoneClick && (
                      <button
                        onClick={() => handleMarkerClick(zone.ward)}
                        className="mt-2 text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            </div>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-xl p-3 shadow-lg z-[1000]">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getAQIColor(25) }} />
            <span className="text-muted-foreground">Good</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getAQIColor(75) }} />
            <span className="text-muted-foreground">Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getAQIColor(125) }} />
            <span className="text-muted-foreground">Unhealthy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getAQIColor(200) }} />
            <span className="text-muted-foreground">Hazardous</span>
          </div>
        </div>
      </div>

      {/* Map Title */}
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-card/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg z-[1000]">
        <Wind className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Live AQI Map</span>
      </div>
    </div>
  );
}
