import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  ChartBarIcon,
  FlagIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import StatusBadge from '../components/StatusBadge';
import { API_BASE_URL } from '../services/api';

mapboxgl.accessToken = 'pk.eyJ1IjoidGhhcnVuLTE2MDUwODA1IiwiYSI6ImNtOW1kYmd2ZTBhZTgyanM4ejRtMjQwa2UifQ.m9ey6l9q5bRWa4GwPneNwA';

function StatCard({ icon, title, value, gradient, shadow }) {
  return (
    <div className={`glass-card rounded-3xl p-6 border border-white/10 ${shadow} flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-2xl ${gradient} flex items-center justify-center shadow-lg text-white`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-black text-white mt-1">{value}</h3>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOption, setSortOption] = useState('Newest');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showComments, setShowComments] = useState({});
  const [mapVisible, setMapVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [fullImageUrl, setFullImageUrl] = useState(null);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Admin Portal | ComplainIQ";
    const fetchComplaints = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/user/posts`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        const fetchedData = await response.json();
        setComplaints(fetchedData);
        setFilteredComplaints(fetchedData);
      } catch (error) {
        console.error('Failed to fetch complaints:', error.message);
      }
    };

    fetchComplaints();
  }, []);

  useEffect(() => {
    let filtered = complaints.filter(c =>
      (c.content || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.user?.name && c.user.name.toLowerCase().includes(search.toLowerCase())) ||
      (c.category && c.category.toLowerCase().includes(search.toLowerCase()))
    );

    if (statusFilter !== 'All') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    if (categoryFilter !== 'All') {
      filtered = filtered.filter(c => c.category === categoryFilter);
    }

    if (sortOption === 'Most Liked') {
      filtered.sort((a, b) => b.likes - a.likes);
    } else {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredComplaints(filtered);
  }, [search, statusFilter, sortOption, categoryFilter, complaints]);

  useEffect(() => {
    if (mapVisible && selectedLocation && mapContainerRef.current) {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [selectedLocation.lng, selectedLocation.lat],
        zoom: 13,
      });

      mapRef.current.on('load', () => {
        if (routeGeoJSON) {
          if (mapRef.current.getSource('route')) {
            mapRef.current.getSource('route').setData(routeGeoJSON);
          } else {
            mapRef.current.addSource('route', {
              type: 'geojson',
              data: routeGeoJSON,
            });
            mapRef.current.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round',
              },
              paint: {
                'line-color': '#6366f1',
                'line-width': 5,
                'line-opacity': 0.8,
              },
            });
          }
          
          const coordinates = routeGeoJSON.coordinates;
          const bounds = coordinates.reduce((bounds, coord) => {
            return bounds.extend(coord);
          }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
          
          mapRef.current.fitBounds(bounds, { padding: 50 });
        } else {
          new mapboxgl.Marker({ color: '#6366f1' })
            .setLngLat([selectedLocation.lng, selectedLocation.lat])
            .addTo(mapRef.current);
        }
      });

      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    }
  }, [mapVisible, selectedLocation, routeGeoJSON]);

  const openMap = (location) => {
    setRouteGeoJSON(null);
    setSelectedLocation(location);
    setMapVisible(true);
  };

  const closeMap = () => {
    setMapVisible(false);
    setSelectedLocation(null);
    setRouteGeoJSON(null);
  };

  const toggleComments = (id) => {
    setShowComments((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/user/complaints/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error(`Failed to update status`);
      const updatedComplaint = await response.json();

      setComplaints((prev) =>
        prev.map((complaint) =>
          complaint._id === id ? { ...complaint, status: updatedComplaint.status || newStatus } : complaint
        )
      );
    } catch (error) {
      console.error('Error updating status:', error.message);
    }
  };

  const exportCSV = () => {
    const csvData = [['ID', 'User', 'Content', 'Status', 'Likes', 'Comments']];
    complaints.forEach(({ _id, user, content, status, likes, comments }) => {
      csvData.push([_id, user?.name || 'Unknown', `"${content.replace(/"/g, '""')}"`, status, likes, comments?.length || 0]);
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + csvData.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'ComplainIQ_Governance_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-40 glass-panel border-b border-white/10 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <ShieldCheckIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Complain<span className="gradient-text">IQ</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Admin Console
              </span>
            </h1>
            <p className="text-xs text-gray-400">Civic Governance & Resolution Management</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-white/10 transition-all shadow-md"
          >
            <ArrowDownTrayIcon className="w-4 h-4 text-indigo-400" />
            Export CSV
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        
        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<ChartBarIcon className="w-6 h-6" />}
            title="Total Reported"
            value={complaints.length}
            gradient="bg-gradient-to-r from-blue-600 to-indigo-600"
            shadow="shadow-blue-500/10"
          />
          <StatCard
            icon={<ArrowPathIcon className="w-6 h-6" />}
            title="Pending & In Progress"
            value={complaints.filter(c => c.status === 'Pending' || c.status === 'In Progress').length}
            gradient="bg-gradient-to-r from-amber-500 to-orange-600"
            shadow="shadow-amber-500/10"
          />
          <StatCard
            icon={<CheckCircleIcon className="w-6 h-6" />}
            title="Resolved Issues"
            value={complaints.filter(c => c.status === 'Resolved' || c.status === 'Completed').length}
            gradient="bg-gradient-to-r from-emerald-500 to-teal-600"
            shadow="shadow-emerald-500/10"
          />
          <StatCard
            icon={<FlagIcon className="w-6 h-6" />}
            title="High Upvotes (>5)"
            value={complaints.filter(c => (c.likes || 0) > 5).length}
            gradient="bg-gradient-to-r from-purple-600 to-pink-600"
            shadow="shadow-purple-500/10"
          />
        </div>

        {/* Filter Bar */}
        <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative flex-1 w-full">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search complaints by description, citizen name, or location..."
                className="w-full pl-11 pr-4 py-3 glass-input rounded-xl text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-xs font-bold text-gray-300 border border-white/10 transition-all w-full sm:w-auto justify-center"
            >
              <FunnelIcon className="w-4 h-4 text-indigo-400" />
              <span>Advanced Filters</span>
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <AnimatePresence>
            {isFiltersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10 overflow-hidden"
              >
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5">Status Filter</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full glass-input rounded-xl p-2.5 text-xs font-medium"
                  >
                    <option value="All" className="bg-slate-900">All Statuses</option>
                    <option value="Pending" className="bg-slate-900">Pending</option>
                    <option value="In Progress" className="bg-slate-900">In Progress</option>
                    <option value="Resolved" className="bg-slate-900">Resolved</option>
                    <option value="Completed" className="bg-slate-900">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5">Category Filter</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full glass-input rounded-xl p-2.5 text-xs font-medium"
                  >
                    <option value="All" className="bg-slate-900">All Categories</option>
                    <option value="Infrastructure" className="bg-slate-900">Infrastructure</option>
                    <option value="Water Supply" className="bg-slate-900">Water Supply</option>
                    <option value="Electricity" className="bg-slate-900">Electricity</option>
                    <option value="Sanitation" className="bg-slate-900">Sanitation</option>
                    <option value="Public Safety" className="bg-slate-900">Public Safety</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5">Sort Order</label>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="w-full glass-input rounded-xl p-2.5 text-xs font-medium"
                  >
                    <option value="Newest" className="bg-slate-900">Newest First</option>
                    <option value="Most Liked" className="bg-slate-900">Most Upvoted</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Complaints Table Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredComplaints.length === 0 ? (
            <div className="col-span-full glass-card rounded-3xl p-12 text-center border border-white/10">
              <p className="text-gray-400 text-base font-medium">No complaints match the current filter criteria.</p>
            </div>
          ) : (
            filteredComplaints.map((complaint) => (
              <motion.div
                key={complaint._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card glass-card-hover rounded-3xl p-6 border border-white/10 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top metadata */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300">
                        {(complaint.user?.name || 'A')[0].toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{complaint.user?.name || 'Citizen'}</h4>
                        <p className="text-xs text-gray-400">{new Date(complaint.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <StatusBadge status={complaint.status} size="sm" />
                  </div>

                  {/* Complaint Description */}
                  <p className="text-xs sm:text-sm text-gray-200 line-clamp-3">
                    {complaint.content}
                  </p>

                  {/* Image attachment if exists */}
                  {complaint.image && (
                    <div className="rounded-2xl overflow-hidden bg-slate-950/60 max-h-48 cursor-pointer">
                      <img
                        src={complaint.image}
                        alt="Evidence"
                        className="w-full h-48 object-cover hover:scale-105 transition-transform"
                        onClick={() => setFullImageUrl(complaint.image)}
                      />
                    </div>
                  )}

                  {/* Location badge if location attached */}
                  {complaint.location && (
                    <button
                      onClick={() => openMap(complaint.location)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-indigo-400 text-xs font-semibold border border-indigo-500/20 hover:bg-slate-850 transition-colors"
                    >
                      <MapPinIcon className="w-3.5 h-3.5" />
                      <span>View Map Coordinates</span>
                    </button>
                  )}
                </div>

                {/* Status Update & Actions Controls */}
                <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase text-gray-400">Update:</span>
                    <select
                      value={complaint.status || 'Pending'}
                      onChange={(e) => updateStatus(complaint._id, e.target.value)}
                      className="glass-input rounded-xl px-3 py-1.5 text-xs font-bold text-white bg-slate-900 border-indigo-500/30"
                    >
                      <option value="Pending" className="bg-slate-900">Pending</option>
                      <option value="In Progress" className="bg-slate-900">In Progress</option>
                      <option value="Resolved" className="bg-slate-900">Resolved</option>
                    </select>
                  </div>

                  {/* Reply Button */}
                  <Link
                    to={`/admin-reply/${complaint._id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white gradient-bg hover:opacity-90 shadow-md shadow-indigo-500/20"
                  >
                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    Official Reply
                  </Link>
                </div>
              </motion.div>
            ))
          )}
        </div>

      </main>

      {/* Mapbox Modal */}
      <AnimatePresence>
        {mapVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <div className="glass-card rounded-3xl w-full max-w-3xl border border-white/10 overflow-hidden shadow-2xl relative">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4 text-indigo-400" /> Geolocation Incident Inspector
                </h3>
                <button onClick={closeMap} className="text-gray-400 hover:text-white p-1 rounded-lg">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div ref={mapContainerRef} className="w-full h-96"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {fullImageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setFullImageUrl(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh]">
              <button
                onClick={() => setFullImageUrl(null)}
                className="absolute top-2 right-2 p-2 bg-slate-800 text-white rounded-full"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
              <img src={fullImageUrl} alt="Full view" className="max-h-[85vh] rounded-2xl object-contain" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminDashboard;