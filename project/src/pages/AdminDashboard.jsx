import { useState, useEffect, useRef } from 'react';
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
  BarsArrowDownIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

// Set the Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoidGhhcnVuLTE2MDUwODA1IiwiYSI6ImNtOW1kYmd2ZTBhZTgyanM4ejRtMjQwa2UifQ.m9ey6l9q5bRWa4GwPneNwA';

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

  // Fetch complaints data
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://public-complient-websitw.onrender.com/api/user/posts', {
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

  // Filter and sort complaints
  useEffect(() => {
    let filtered = complaints.filter(c =>
      c.content.toLowerCase().includes(search.toLowerCase()) ||
      (c.user?.name && c.user.name.toLowerCase().includes(search.toLowerCase()))
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

  // Initialize map
  useEffect(() => {
    if (mapVisible && selectedLocation && mapContainerRef.current) {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [selectedLocation.lng, selectedLocation.lat],
        zoom: 12,
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
                'line-color': '#3b82f6',
                'line-width': 4,
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
          new mapboxgl.Marker({ color: '#3b82f6' })
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

  const trackLocation = (destination) => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        if (!latitude || !longitude) {
          alert('Could not get valid coordinates from your location');
          return;
        }

        try {
          const query = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${longitude},${latitude};${destination.lng},${destination.lat}?geometries=geojson&access_token=${mapboxgl.accessToken}`
          );
          const json = await query.json();
          
          if (json.routes && json.routes.length > 0) {
            setRouteGeoJSON(json.routes[0].geometry);
            setSelectedLocation(destination);
            setMapVisible(true);
          } else {
            alert('No route found');
          }
        } catch (error) {
          alert('Failed to fetch directions');
          console.error(error);
        }
      },
      (error) => {
        alert('Unable to retrieve your location: ' + error.message);
        console.error('Geolocation error:', error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
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
      const response = await fetch(`https://public-complient-websitw.onrender.com/api/user/complaints/${id}/status`, {
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
          complaint._id === id ? { ...complaint, status: updatedComplaint.status } : complaint
        )
      );
    } catch (error) {
      console.error('Error updating status:', error.message);
    }
  };

  const exportCSV = () => {
    const csvData = [['ID', 'User', 'Content', 'Status', 'Likes', 'Comments']];
    complaints.forEach(({ _id, user, content, status, likes, comments }) => {
      csvData.push([_id, user?.name || 'Unknown', content, status, likes, comments.length]);
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + csvData.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'complaints.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ComplainIQ Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {complaints.length} total complaints • {new Date().toLocaleDateString()}
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={exportCSV}
          className="mt-4 md:mt-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition-all"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          Export as CSV
        </motion.button>
        <button
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/';
          }}
          className="mt-4 md:mt-0 ml-2 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-md transition-all"
        >
          Logout
        </button>
      </motion.header>

      {/* Stats Cards */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      >
        <StatCard 
          icon={<ChartBarIcon className="h-6 w-6 text-blue-500" />} 
          title="Total Complaints" 
          value={complaints.length} 
          color="bg-blue-100 dark:bg-blue-900/30"
        />
        <StatCard 
          icon={<FlagIcon className="h-6 w-6 text-yellow-500" />} 
          title="In Progress" 
          value={complaints.filter(c => c.status === 'In Progress').length} 
          color="bg-yellow-100 dark:bg-yellow-900/30"
        />
        <StatCard 
          icon={<CheckCircleIcon className="h-6 w-6 text-green-500" />} 
          title="Completed" 
          value={complaints.filter(c => c.status === 'Completed').length} 
          color="bg-green-100 dark:bg-green-900/30"
        />
      </motion.div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search complaints..."
              className="pl-10 w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <FunnelIcon className="h-5 w-5" />
            <span>Filters</span>
            <ChevronDownIcon className={`h-4 w-4 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <AnimatePresence>
          {isFiltersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)} 
                  className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="All">All Categories</option>
                  <option value="Electric">Electric</option>
                  <option value="Water">Water</option>
                  <option value="Social Problem">Social Problem</option>
                  <option value="Drainage">Drainage</option>
                  <option value="Air">Air</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
                <select 
                  value={sortOption} 
                  onChange={(e) => setSortOption(e.target.value)} 
                  className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Newest">Newest First</option>
                  <option value="Most Liked">Most Liked</option>
                </select>
              </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Complaints List */}
      {filteredComplaints.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center"
        >
          <div className="text-5xl mb-4">📭</div>
          <h3 className="text-xl font-semibold mb-2">No complaints found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {search ? 'Try adjusting your search criteria' : 'No complaints have been submitted yet'}
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          {filteredComplaints.map((complaint, index) => (
            <motion.div
              key={complaint._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg"
            >
              <div className="p-5">
                {/* Complaint Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={complaint.user?.avatar || '/default-avatar.png'} 
                      alt="User Avatar" 
                      className="h-10 w-10 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm" 
                    />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{complaint.user?.name || 'Anonymous'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(complaint.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    complaint.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    complaint.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {complaint.status}
                  </span>
                </div>

                {/* Complaint Content */}
                <div className="mt-4">
                <h3 className="font-medium text-gray-900 dark:text-white">{complaint.title || 'No title'}</h3>
                <p className="mt-1 text-gray-600 dark:text-gray-300">{complaint.content}</p>
                <p className="mt-1 text-sm font-semibold text-blue-600 dark:text-blue-400">Category: {complaint.category || 'N/A'}</p>
                
                {/* Media */}
                {complaint.image && (
                  <div className="mt-3 rounded-lg overflow-hidden">
                    <img 
                      src={complaint.image} 
                      alt="Complaint" 
                      className="w-full h-auto max-h-60 object-cover rounded-lg hover:scale-[1.02] transition-transform duration-300 cursor-zoom-in"
                      onClick={() => setFullImageUrl(complaint.image)}
                    />
                  </div>
                )}
                {complaint.video && (
                  <div className="mt-3 rounded-lg overflow-hidden">
                    <video 
                      controls 
                      className="w-full rounded-lg"
                      poster={complaint.image}
                    >
                      <source src={complaint.video} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
                </div>

                {/* Complaint Footer */}
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  {/* Stats and Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <span className="mr-1">👍</span> {complaint.likes || 0}
                      </span>
                      <button 
                        onClick={() => toggleComments(complaint._id)}
                        className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                        {complaint.comments.length}
                      </button>
                    </div>

                    {/* Location Buttons */}
                    <div className="flex space-x-2">
                      {complaint.latitude && complaint.longitude && (
                        <>
                          <button
                            onClick={() => openMap({ lat: complaint.latitude, lng: complaint.longitude })}
                            className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title="View Location"
                          >
                            <MapPinIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => trackLocation({ lat: complaint.latitude, lng: complaint.longitude })}
                            className="p-2 text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                            title="Track Location"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status Update */}
                  <div className="mt-3 flex items-center justify-between">
                    <select
                      value={complaint.status}
                      onChange={(e) => updateStatus(complaint._id, e.target.value)}
                      className="text-sm p-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                    
                    <button
                      onClick={() => window.location.href = `/admin-reply/${complaint._id}`}
                      className="text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Reply
                    </button>
                  </div>

                  {/* Comments Section */}
                  <AnimatePresence>
                    {showComments[complaint._id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 overflow-hidden"
                      >
                        <h4 className="text-sm font-medium mb-2">Comments ({complaint.comments.length})</h4>
                        {complaint.comments.length > 0 ? (
                          <div className="space-y-2">
                            {complaint.comments.map((comment, index) => (
                              <div key={index} className="flex items-start space-x-2">
                                <div className="flex-shrink-0">
                                  <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs">
                                    {comment.user?.charAt(0) || 'A'}
                                  </div>
                                </div>
                                <div className="text-sm bg-gray-100 dark:bg-gray-700 rounded-lg p-2 flex-1">
                                  <p className="font-medium text-gray-900 dark:text-white">{comment.user || 'Anonymous'}</p>
                                  <p className="text-gray-600 dark:text-gray-300">{comment.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet.</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Map Modal */}
      <AnimatePresence>
        {mapVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {routeGeoJSON ? 'Route to Complaint Location' : 'Complaint Location'}
                </h2>
                <button
                  onClick={closeMap}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <div ref={mapContainerRef} className="flex-1 min-h-[400px] rounded-b-xl" />
            </motion.div>
          </motion.div>
        )}

        {fullImageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-80 z-60 flex items-center justify-center p-4"
            onClick={() => setFullImageUrl(null)}
          >
            <motion.img
              src={fullImageUrl}
              alt="Full View"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="max-w-full max-h-full rounded-lg shadow-lg cursor-zoom-out"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setFullImageUrl(null)}
              className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon, title, value, color = 'bg-gray-100 dark:bg-gray-700' }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`${color} rounded-xl shadow-sm p-4 flex items-center space-x-4`}
    >
      <div className="p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </motion.div>
  );
}

export default AdminDashboard;