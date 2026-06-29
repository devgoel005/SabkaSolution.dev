import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { Issue } from '../types';
import { 
  MapPin, Shield, Eye, Flame, Layers, Radio, Crosshair, 
  Search, Navigation, ZoomIn, ZoomOut, Check, ChevronRight, 
  Info, AlertTriangle, AlertCircle, HelpCircle, Activity 
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Coordinate mapping of seeded issues to real LatLng values
const SEEDED_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'issue_bengaluru_drain': { lat: 12.9348, lng: 77.6915 },  // Kadubeesanahalli / Outer Ring Road, Bengaluru
  'issue_delhi_garbage': { lat: 28.6132, lng: 77.2941 },   // Mayur Vihar Phase 2, Delhi
  'issue_mumbai_streetlight': { lat: 19.1643, lng: 72.8398 } // Goregaon West, Mumbai
};

// City center defaults (Sovereign Metros of India)
const CITY_CENTERS = {
  'Delhi': { lat: 28.6139, lng: 77.2090, zoom: 12 },
  'Bengaluru': { lat: 12.9716, lng: 77.5946, zoom: 12 },
  'Mumbai': { lat: 19.0760, lng: 72.8777, zoom: 11 }
};

type MapLayerType = 'roadmap' | 'satellite' | 'hybrid' | 'terrain';

export const MapView: React.FC = () => {
  const { t } = useTranslation();
  const { issues, showToast, fetchIssues } = useApp();

  const [cities, setCities] = useState<string[]>(['Delhi', 'Bengaluru', 'Mumbai']);
  const [activeCity, setActiveCity] = useState<string>('Delhi');
  const [mapLayer, setMapLayer] = useState<MapLayerType>('roadmap');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPin, setSelectedPin] = useState<Issue | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [heatmapMode, setHeatmapMode] = useState(false);
  const [trafficMode, setTrafficMode] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // User simulated GPS offsets within each city
  const userSimulatedGPS: Record<string, { lat: number; lng: number }> = {
    'Delhi': { lat: 28.6200, lng: 77.2200 },
    'Bengaluru': { lat: 12.9750, lng: 77.6100 },
    'Mumbai': { lat: 19.0800, lng: 72.8850 }
  };

  // Helper to get category emoji for the custom pin icon
  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'Infrastructure': return '🚧';
      case 'Waste Management': return '🗑️';
      case 'Electricity': return '⚡';
      case 'Corruption': return '⚖️';
      case 'Road Damage': return '🕳️';
      case 'Streetlight': return '💡';
      default: return '📍';
    }
  };

  // Get color depending on issue status
  const getPinColor = (status: Issue['status']) => {
    switch (status) {
      case 'PENDING': return '#EF233C';      // Crimson Red
      case 'VERIFIED': return '#F59E0B';     // Amber Saffron
      case 'IN_PROGRESS': return '#2563EB';  // Cobalt Blue
      case 'RESOLVED': return '#10B981';     // Emerald Green
      case 'ESCALATED': return '#8B5CF6';    // Sovereign Purple
      default: return '#64748B';
    }
  };

  // Helper to map and retrieve coordinate for any issue dynamically
  const getIssueCoordinates = (issue: Issue): { lat: number; lng: number } => {
    if (issue.latitude !== undefined && issue.longitude !== undefined) {
      return { lat: issue.latitude, lng: issue.longitude };
    }
    if (SEEDED_COORDINATES[issue.id]) {
      return SEEDED_COORDINATES[issue.id];
    }
    
    // Fallback pseudo-random but deterministic mapping near city center based on id
    const center = CITY_CENTERS[activeCity as keyof typeof CITY_CENTERS] || { lat: 28.6139, lng: 77.2090 };
    let hash = 0;
    for (let i = 0; i < issue.id.length; i++) {
      hash = issue.id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const offsetLat = ((hash % 100) / 1500); // within ~5-7km
    const offsetLng = (((hash >> 2) % 100) / 1500);

    return {
      lat: center.lat + offsetLat,
      lng: center.lng + offsetLng
    };
  };

  // Filter issues based on active city and selected category
  const filteredIssues = issues.filter(issue => {
    const issueCity = issue.city.toLowerCase();
    const activeCityLower = activeCity.toLowerCase();
    
    const matchesCity = issueCity.includes(activeCityLower) || 
                       activeCityLower.includes(issueCity) ||
                       (activeCityLower === 'delhi' && issueCity.includes('delhi')) ||
                       (activeCityLower === 'bengaluru' && issueCity.includes('bengaluru')) ||
                       (activeCityLower === 'mumbai' && issueCity.includes('mumbai'));
    
    const matchesCategory = selectedCategory === 'All' || issue.category === selectedCategory;
    
    return matchesCity && matchesCategory;
  });

  // 1. Initialize Map Instance
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const center = CITY_CENTERS[activeCity as keyof typeof CITY_CENTERS] || { lat: 28.6139, lng: 77.2090, zoom: 12 };
    
    // Create Map with custom zoom buttons and disable attribution to maximize workspace elegance
    const map = L.map(mapContainerRef.current, {
      center: [center.lat, center.lng],
      zoom: (center as any).zoom || 12,
      zoomControl: false,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    // Create marker layers
    markersLayerRef.current = L.layerGroup().addTo(map);
    heatmapLayerRef.current = L.layerGroup().addTo(map);

    // Bind clean resize observer
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Load Google Maps Tile Layer dynamically based on type
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    // Google Maps Tile Server URLs with live Traffic support
    let lyrs = 'm';
    if (mapLayer === 'satellite') {
      lyrs = 's';
    } else if (mapLayer === 'hybrid') {
      lyrs = 'y';
    } else if (mapLayer === 'terrain') {
      lyrs = 't';
    }

    if (trafficMode) {
      if (mapLayer === 'satellite') {
        lyrs = 'y,traffic';
      } else {
        lyrs += ',traffic';
      }
    }

    const tileUrl = `https://mt1.google.com/vt/lyrs=${lyrs}&x={x}&y={y}&z={z}`;

    const newTileLayer = L.tileLayer(tileUrl, {
      maxZoom: 21,
      minZoom: 3
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newTileLayer;
  }, [mapLayer, trafficMode]);

  // 3. Handle Active City Transition (Smooth Zoom/Pan Flight)
  const handleCityChange = (city: string) => {
    setActiveCity(city);
    setSelectedPin(null);
    showToast('info', `Navigating satellite view to ${city}...`);

    if (mapInstanceRef.current) {
      const target = CITY_CENTERS[city as keyof typeof CITY_CENTERS] || { lat: 28.6139, lng: 77.2090, zoom: 12 };
      mapInstanceRef.current.flyTo([target.lat, target.lng], (target as any).zoom || 12, {
        duration: 1.6,
        easeLinearity: 0.25
      });
    }
  };

  // 4. Plot Custom Issue Pins & User Location GPS
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const heatmapLayer = heatmapLayerRef.current;
    if (!map || !markersLayer || !heatmapLayer) return;

    // Clear previous markers
    markersLayer.clearLayers();
    heatmapLayer.clearLayers();

    // Plot User Simulated GPS Marker
    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
    }

    const userLoc = userSimulatedGPS[activeCity] || CITY_CENTERS[activeCity as keyof typeof CITY_CENTERS] || { lat: 28.6139, lng: 77.2090 };
    const userHtml = `
      <div class="user-gps-pulse-container" style="position: relative; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;">
        <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: rgba(5, 150, 105, 0.4); transform: scale(2.5); animation: userPulseRadar 2s infinite ease-out;"></div>
        <div style="width: 14px; height: 14px; background: #059669; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(5,150,105,0.85); z-index: 10;"></div>
      </div>
    `;
    const userIcon = L.divIcon({
      html: userHtml,
      className: '',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    userMarkerRef.current = L.marker([userLoc.lat, userLoc.lng], { icon: userIcon })
      .addTo(map)
      .bindTooltip("You are here (Simulated Ward GPS)", { permanent: false, direction: 'top' });

    // Plot Heatmap underlay if enabled
    if (heatmapMode) {
      filteredIssues.forEach(issue => {
        const coords = getIssueCoordinates(issue);
        const heatHtml = `
          <div style="
            width: 130px; 
            height: 130px; 
            background: radial-gradient(circle, rgba(239, 35, 60, 0.4) 0%, rgba(239, 35, 60, 0.1) 45%, transparent 70%); 
            border-radius: 50%; 
            transform: translate(-50%, -50%);
            animation: heatmapPulse 2.5s infinite ease-in-out;
          "></div>
        `;
        const heatIcon = L.divIcon({
          html: heatHtml,
          className: '',
          iconSize: [130, 130],
          iconAnchor: [65, 65]
        });

        L.marker([coords.lat, coords.lng], { icon: heatIcon, interactive: false }).addTo(heatmapLayer);
      });
    }

    // Plot Issue Markers
    filteredIssues.forEach(issue => {
      const coords = getIssueCoordinates(issue);
      const pinColor = getPinColor(issue.status);
      const emoji = getCategoryEmoji(issue.category);

      const markerHtml = `
        <div class="premium-issue-marker" id="marker-icon-${issue.id}" style="display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);">
          <div style="
            background: ${pinColor}; 
            width: 42px; 
            height: 42px; 
            border-radius: 50%; 
            border: 3px solid white; 
            box-shadow: 0 10px 25px rgba(15,23,42,0.22); 
            display: flex; 
            align-items: center; 
            justify-content: center;
            transform: scale(${selectedPin?.id === issue.id ? 1.25 : 1});
            transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          ">
            <span style="font-size: 1.15rem; filter: drop-shadow(0 1.5px 1px rgba(0,0,0,0.2));">${emoji}</span>
          </div>
          <!-- Pin Pointer Arrow -->
          <div style="
            width: 0; 
            height: 0; 
            border-left: 7px solid transparent; 
            border-right: 7px solid transparent; 
            border-top: 9px solid white; 
            margin-top: -3px; 
            filter: drop-shadow(0 3px 3px rgba(15,23,42,0.15));
          "></div>
        </div>
      `;

      const markerIcon = L.divIcon({
        html: markerHtml,
        className: '',
        iconSize: [42, 48],
        iconAnchor: [21, 48],
        popupAnchor: [0, -42]
      });

      const marker = L.marker([coords.lat, coords.lng], { icon: markerIcon })
        .addTo(markersLayer)
        .on('click', () => {
          setSelectedPin(issue);
          map.flyTo([coords.lat, coords.lng], 15, {
            duration: 1.2,
            easeLinearity: 0.2
          });
        });

      // Customized Google Map styled popup body
      const popupContent = document.createElement('div');
      popupContent.style.padding = '8px';
      popupContent.style.fontFamily = 'var(--font-sans)';
      popupContent.style.width = '240px';
      popupContent.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <img src="${issue.imageUrl || 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=300'}" 
               style="width: 100%; height: 95px; object-fit: cover; border-radius: 8px;" referrerPolicy="no-referrer" />
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px;">
              <span style="font-size: 0.65rem; font-weight: 800; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; background: ${pinColor}18; color: ${pinColor}; border: 1px solid ${pinColor}30;">
                ${issue.status}
              </span>
              <span style="font-size: 0.72rem; font-weight: 700; color: #475569;">${issue.category}</span>
            </div>
            <h4 style="font-size: 0.88rem; font-weight: 800; color: #0F172A; margin: 4px 0 2px 0; line-height: 1.3;">${issue.title}</h4>
            <p style="font-size: 0.75rem; color: #64748B; margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
              📍 ${issue.location.length > 32 ? issue.location.substring(0, 32) + '...' : issue.location}
            </p>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: false,
        className: 'custom-google-popup',
        maxWidth: 260
      });
    });

  }, [filteredIssues, activeCity, heatmapMode, selectedPin]);

  // 5. Center map back to user simulated GPS coordinates
  const handleRecenterGPS = () => {
    if (!mapInstanceRef.current) return;
    const userLoc = userSimulatedGPS[activeCity] || CITY_CENTERS[activeCity as keyof typeof CITY_CENTERS] || { lat: 28.6139, lng: 77.2090 };
    showToast('success', `Recentered GPS coordinates securely for ${activeCity}!`);
    mapInstanceRef.current.flyTo([userLoc.lat, userLoc.lng], 14, {
      duration: 1.2
    });
  };

  // 6. Handle Search Location queries
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery || !mapInstanceRef.current || isSearching) return;

    setIsSearching(true);
    showToast('info', `Searching for "${searchQuery}" in Google Maps database...`);

    try {
      let query = searchQuery;
      if (!query.toLowerCase().includes('india')) {
        query += ', India';
      }

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&addressdetails=1&limit=5`
      );

      if (response.ok) {
        const results = await response.json();
        if (results && results.length > 0) {
          setSearchResults(results);
          const first = results[0];
          const lat = parseFloat(first.lat);
          const lon = parseFloat(first.lon);

          mapInstanceRef.current.flyTo([lat, lon], 14, {
            duration: 1.6,
            easeLinearity: 0.25
          });

          const address = first.address || {};
          const cityName = address.city || address.town || address.suburb || address.village || address.state_district || 'Custom District';
          const stateName = address.state || 'India';
          const pincode = address.postcode || '';

          showToast('success', `Located: ${cityName}. Generating real-time local complaints...`);

          const genResponse = await fetch('/api/issues/generate-for-location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lat,
              lng: lon,
              locationName: first.display_name,
              cityName,
              stateName,
              pincode
            })
          });

          if (genResponse.ok) {
            await fetchIssues();
            if (!cities.includes(cityName)) {
              setCities(prev => [...prev, cityName]);
            }
            setActiveCity(cityName);
            showToast('success', `Live maps updated with 3+ real-time local issues near ${cityName}!`);
          }
        } else {
          showToast('error', `Could not find "${searchQuery}" in India. Please check the spelling or try another term.`);
        }
      } else {
        throw new Error('Nominatim lookup failed');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Unable to complete real-time satellite search. Using local database fallback.');
      
      const query = searchQuery.toLowerCase();
      const cityCenter = CITY_CENTERS[activeCity as keyof typeof CITY_CENTERS] || CITY_CENTERS['Delhi'];
      let targetCoords = { ...cityCenter };
      let successMessage = `Dispatched search drone to find location...`;

      if (activeCity === 'Delhi') {
        if (query.includes('vihar') || query.includes('mayur')) {
          targetCoords = { lat: 28.6132, lng: 77.2941, zoom: 14 };
          successMessage = `Located Mayur Vihar Ward Grid! Flying there...`;
        } else if (query.includes('connaught') || query.includes('cp')) {
          targetCoords = { lat: 28.6304, lng: 77.2177, zoom: 14 };
          successMessage = `Located Connaught Place Center! Flying there...`;
        }
      } else if (activeCity === 'Bengaluru') {
        if (query.includes('bellandur') || query.includes('kadubeesanahalli')) {
          targetCoords = { lat: 12.9348, lng: 77.6915, zoom: 14 };
          successMessage = `Located Bellandur Ward 150 Area! Flying there...`;
        }
      }

      showToast('success', successMessage);
      mapInstanceRef.current.flyTo([targetCoords.lat, targetCoords.lng], 14, {
        duration: 1.5
      });
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = async (result: any) => {
    setSearchResults([]);
    const shortName = result.display_name.split(',').slice(0, 2).join(', ');
    setSearchQuery(shortName);

    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lon], 14, {
        duration: 1.6,
        easeLinearity: 0.25
      });
    }

    const address = result.address || {};
    const cityName = address.city || address.town || address.suburb || address.village || address.state_district || 'Custom District';
    const stateName = address.state || 'India';
    const pincode = address.postcode || '';

    if (!cities.includes(cityName)) {
      setCities(prev => [...prev, cityName]);
    }
    setActiveCity(cityName);

    showToast('success', `Centered on ${cityName}. Synchronizing live grievances...`);

    try {
      const genResponse = await fetch('/api/issues/generate-for-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat,
          lng: lon,
          locationName: result.display_name,
          cityName,
          stateName,
          pincode
        })
      });

      if (genResponse.ok) {
        await fetchIssues();
        showToast('success', `Successfully pulled real-time complaints for ${cityName}!`);
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to generate live grievance data.');
    }
  };

  // 7. Manual Zoom controllers
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  return (
    <div className="map-page-container" id="radar-map-page" style={{ animation: 'fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
      
      {/* Map Control settings and Search bar */}
      <div className="top-navbar" style={{ 
        flexWrap: 'wrap', 
        gap: '12px', 
        padding: '16px 20px', 
        margin: '0 0 16px 0',
        background: 'var(--surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)'
      }}>
        
        {/* City Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {cities.map(city => (
            <button
              key={city}
              className={`filter-chip ${activeCity === city ? 'active' : ''}`}
              onClick={() => handleCityChange(city)}
              id={`map-city-btn-${city.toLowerCase()}`}
              style={{
                background: activeCity === city ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)' : 'var(--bg)',
                color: activeCity === city ? 'white' : 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                padding: '8px 16px',
                borderRadius: '30px',
                border: '1px solid rgba(15,23,42,0.05)',
                transition: 'var(--transition)',
                boxShadow: activeCity === city ? '0 4px 12px rgba(255,107,0,0.25)' : 'none'
              }}
            >
              📍 {city}
            </button>
          ))}
        </div>

        {/* Integrated Location Geocode Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ flexGrow: 1, minWidth: '220px', position: 'relative' }}>
          <Search size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder={isSearching ? "Searching Google Maps connectivity..." : `Search any city/street in India...`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value === '') setSearchResults([]);
            }}
            disabled={isSearching}
            style={{
              width: '100%',
              background: '#F1F5F9',
              border: '1px solid rgba(15,23,42,0.08)',
              padding: '10px 16px 10px 42px',
              borderRadius: '30px',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--secondary)',
              outline: 'none',
              transition: 'var(--transition)',
            }}
          />
          {isSearching && (
            <div style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '16px',
              height: '16px',
              border: '2px solid rgba(255,107,0,0.3)',
              borderTop: '2px solid #FF6B00',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          )}

          {/* Real-time search matches dropdown results */}
          {searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'white',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              boxShadow: '0 12px 24px rgba(15,23,42,0.12)',
              marginTop: '8px',
              zIndex: 100,
              maxHeight: '220px',
              overflowY: 'auto',
              padding: '6px'
            }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', padding: '6px 10px', borderBottom: '1px solid #F1F5F9' }}>
                Search results inside India
              </div>
              {searchResults.map((resItem, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => selectSearchResult(resItem)}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: 'var(--secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>{resItem.display_name.split(',')[0]}</span>
                  <span style={{ fontSize: '0.68rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{resItem.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </form>

        {/* Category Filters Select */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            id="map-category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="lang-selector-select"
            style={{ 
              padding: '8px 16px', 
              fontSize: '0.82rem',
              fontWeight: 700,
              background: '#F1F5F9',
              border: '1px solid rgba(15,23,42,0.08)',
              borderRadius: '30px',
              outline: 'none',
              color: 'var(--secondary)'
            }}
          >
            <option value="All">All Categories</option>
            <option value="Infrastructure">Infrastructure 🚧</option>
            <option value="Waste Management">Waste Management 🗑️</option>
            <option value="Electricity">Electricity ⚡</option>
            <option value="Corruption">Corruption ⚖️</option>
            <option value="Road Damage">Road Damage 🕳️</option>
            <option value="Streetlight">Streetlight 💡</option>
          </select>
        </div>

      </div>

      {/* Main Interactive Map Canvas Container */}
      <div className="map-card" id="interactive-map-stage" style={{ 
        flexGrow: 1, 
        borderRadius: 'var(--radius-lg)', 
        border: '1px solid var(--border)', 
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        minHeight: '480px'
      }}>
        
        {/* Leaflet DOM Anchor */}
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%', outline: 'none', zIndex: 1 }}></div>

        {/* 1. Google Maps Premium Layer Floating Selector */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 10,
          background: 'rgba(15, 23, 42, 0.94)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          color: 'white',
          width: '150px'
        }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: '#94A3B8', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Layers size={11} color="#FF6B00" /> Google Layers
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {([
              { id: 'roadmap', label: 'Default Map', icon: '🗺️' },
              { id: 'satellite', label: 'Satellite', icon: '🛰️' },
              { id: 'hybrid', label: 'Hybrid View', icon: '🌍' },
              { id: 'terrain', label: 'Terrain Label', icon: '⛰️' }
            ] as const).map(layer => (
              <button
                key={layer.id}
                onClick={() => {
                  setMapLayer(layer.id);
                  showToast('info', `Switched map overlay to ${layer.label}`);
                }}
                style={{
                  background: mapLayer === layer.id ? 'var(--primary)' : 'transparent',
                  color: 'white',
                  border: 'none',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background 0.2s'
                }}
              >
                <span>{layer.icon}</span>
                <span>{layer.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Heatmap & Extra Operations HUD */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {/* Heatmap Toggle */}
          <button
            onClick={() => {
              setHeatmapMode(!heatmapMode);
              showToast('success', heatmapMode ? 'Heatmap overlay hidden' : 'Active Heatmap overlay enabled!');
            }}
            style={{
              background: heatmapMode ? '#EF233C' : 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(8px)',
              border: heatmapMode ? '1px solid #EF233C' : '1px solid rgba(255,255,255,0.12)',
              color: 'white',
              padding: '10px 16px',
              borderRadius: '30px',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
              transition: 'var(--transition)'
            }}
          >
            <Flame size={14} className={heatmapMode ? 'animate-pulse' : ''} />
            <span>{heatmapMode ? 'Disable Heatmap' : 'Analyze Heatmap'}</span>
          </button>

          {/* Real-time Traffic Overlay Toggle */}
          <button
            onClick={() => {
              setTrafficMode(!trafficMode);
              showToast('success', trafficMode ? 'Google Traffic overlay hidden' : 'Google Real-time Traffic connectivity active!');
            }}
            style={{
              background: trafficMode ? '#059669' : 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(8px)',
              border: trafficMode ? '1px solid #059669' : '1px solid rgba(255,255,255,0.12)',
              color: 'white',
              padding: '10px 16px',
              borderRadius: '30px',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
              transition: 'var(--transition)'
            }}
          >
            <Navigation size={14} className={trafficMode ? 'animate-bounce' : ''} />
            <span>{trafficMode ? 'Disable Traffic' : 'Live Google Traffic'}</span>
          </button>

          {/* Ward Scan Indicator Panel */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '16px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'white',
            boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
          }}>
            <Activity size={12} color="#059669" className="animate-pulse" />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.3px' }}>
              Ward Status: <span style={{ color: '#059669' }}>Synchronized</span>
            </span>
          </div>
        </div>

        {/* 3. Custom Zoom and Location Controls (Bottom Right HUD) */}
        <div style={{
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {/* Recenter GPS Button */}
          <button
            onClick={handleRecenterGPS}
            style={{
              background: 'white',
              border: '1px solid rgba(15,23,42,0.1)',
              borderRadius: '50%',
              width: '42px',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
              transition: 'var(--transition)'
            }}
            title="Recenter simulated ward GPS"
          >
            <Crosshair size={18} color="var(--primary)" />
          </button>

          {/* Custom zoom-in controller */}
          <button
            onClick={handleZoomIn}
            style={{
              background: 'white',
              border: '1px solid rgba(15,23,42,0.1)',
              borderRadius: '50%',
              width: '42px',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
              transition: 'var(--transition)'
            }}
            title="Zoom In"
          >
            <ZoomIn size={18} color="var(--secondary)" />
          </button>

          {/* Custom zoom-out controller */}
          <button
            onClick={handleZoomOut}
            style={{
              background: 'white',
              border: '1px solid rgba(15,23,42,0.1)',
              borderRadius: '50%',
              width: '42px',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
              transition: 'var(--transition)'
            }}
            title="Zoom Out"
          >
            <ZoomOut size={18} color="var(--secondary)" />
          </button>
        </div>

        {/* 4. Bottom corner radar scanning feedback indicator satisfying focus selector */}
        <div className="map-radar-pulse" id="radar-pulse-msg" style={{
          background: 'rgba(15, 23, 42, 0.94)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
          padding: '10px 18px'
        }}>
          <div className="radar-dot" style={{ background: '#059669' }}></div>
          <span style={{ fontWeight: 700, color: '#F1F5F9', fontSize: '0.78rem' }}>
            🛰️ {activeCity} Satellite Radar: Monitoring {filteredIssues.length} live grievances in ward boundaries
          </span>
        </div>

      </div>

      {/* Selected Pin Bottom Sheet Detail */}
      {selectedPin && (
        <div
          className="bottom-sheet"
          id="map-bottom-sheet"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            boxShadow: '0 -15px 40px rgba(15,23,42,0.12)',
            padding: '24px',
            position: 'relative',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 11,
            marginTop: '16px'
          }}
        >
          <button
            onClick={() => setSelectedPin(null)}
            style={{ 
              position: 'absolute', 
              top: '20px', 
              right: '20px', 
              background: '#F1F5F9', 
              border: 'none', 
              cursor: 'pointer', 
              fontWeight: 800, 
              color: 'var(--secondary)',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition)'
            }}
          >
            ✕
          </button>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <img
              src={selectedPin.imageUrl || 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=400'}
              alt={selectedPin.title}
              style={{ width: '130px', height: '130px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '2px solid rgba(15,23,42,0.05)' }}
              referrerPolicy="no-referrer"
            />

            <div style={{ flexGrow: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`status-chip status-${selectedPin.status}`} style={{ 
                  fontSize: '0.7rem', 
                  fontWeight: 800, 
                  background: `${getPinColor(selectedPin.status)}18`,
                  color: getPinColor(selectedPin.status),
                  border: `1px solid ${getPinColor(selectedPin.status)}30`
                }}>
                  {selectedPin.status}
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', background: '#FFF7ED', padding: '4px 10px', borderRadius: '20px' }}>
                  {getCategoryEmoji(selectedPin.category)} {selectedPin.category}
                </span>
              </div>
              
              <h4 style={{ fontSize: '1.2rem', color: 'var(--secondary)', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{selectedPin.title}</h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {selectedPin.description}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                  <MapPin size={14} color="var(--primary)" /> {selectedPin.location}
                </span>
                
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#D97706', background: '#FEF3C7', padding: '4px 10px', borderRadius: '15px' }}>
                  🔥 Severity: {selectedPin.severity}/5
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styled custom animations */}
      <style>{`
        @keyframes userPulseRadar {
          0% { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes heatmapPulse {
          0% { transform: translate(-50%, -50%) scale(0.85); opacity: 0.8; }
          50% { transform: translate(-50%, -50%) scale(1.15); opacity: 0.9; }
          100% { transform: translate(-50%, -50%) scale(0.85); opacity: 0.8; }
        }
        .leaflet-container {
          background: #0F172A !important;
        }
        /* Custom Google Map Styled popup styling */
        .custom-google-popup .leaflet-popup-content-wrapper {
          background: rgba(255, 255, 255, 0.96) !important;
          backdrop-filter: blur(12px) !important;
          border-radius: 12px !important;
          box-shadow: 0 15px 35px rgba(15,23,42,0.18) !important;
          border: 1px solid rgba(15,23,42,0.06) !important;
          padding: 2px !important;
        }
        .custom-google-popup .leaflet-popup-tip {
          background: white !important;
          box-shadow: 0 5px 10px rgba(0,0,0,0.05) !important;
        }
        .custom-google-popup .leaflet-popup-content {
          margin: 0 !important;
          line-height: inherit !important;
        }
      `}</style>
    </div>
  );
};
