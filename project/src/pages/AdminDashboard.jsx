import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  ChartBarIcon,
  FlagIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

// Set the Mapbox access token directly here as environment variable editing is not allowed
mapboxgl.accessToken = 'pk.eyJ1IjoidGhhcnVuLTE2MDUwODA1IiwiYSI6ImNtOW1kYmd2ZTBhZTgyanM4ejRtMjQwa2UifQ.m9ey6l9q5bRWa4GwPneNwA';

function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOption, setSortOption] = useState('Newest');
  const [showComments, setShowComments] = useState({});
  const [mapVisible, setMapVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null); // keep a ref to the map instance

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://public-complient-websitw.onrender.com/api/user/posts', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) throw new Error(`Error: ${response.statusText}`);

        const fetchedData = await response.json();
        console.log('Fetched complaints data:', fetchedData); // Added log to check lat/lng presence
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
      c.content.toLowerCase().includes(search.toLowerCase())
    );

    if (statusFilter !== 'All') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    if (sortOption === 'Most Liked') {
      filtered.sort((a, b) => b.likes - a.likes);
    } else {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredComplaints(filtered);
  }, [search, statusFilter, sortOption, complaints]);

  useEffect(() => {
    if (mapVisible && selectedLocation && mapContainerRef.current) {
      console.log('Initializing map at location:', selectedLocation);
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
                'line-color': '#3887be',
                'line-width': 5,
                'line-opacity': 0.75,
              },
            });
          }
          // Fit map bounds to the route
          const coordinates = routeGeoJSON.coordinates;
          const bounds = coordinates.reduce(function(bounds, coord) {
            return bounds.extend(coord);
          }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
          mapRef.current.fitBounds(bounds, {
            padding: 50
          });
        } else {
          // Add marker for simple view location
          new mapboxgl.Marker()
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
    console.log('openMap called with location:', location);
    setRouteGeoJSON(null); // Clear route for simple view
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
        console.log('Current position fetched:', position);
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <header className="bg-white dark:bg-gray-800 shadow p-4 rounded-lg flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">ComplainIQ Admin Dashboard</h1>
        <div className="flex space-x-2">
          {/* <button
            onClick={() => trackLocation(selectedLocation)}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            title="Track Location"
            disabled={!selectedLocation}
          >
            Track Location
          </button>
          <button
            onClick={closeMap}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            title="Close Map"
          >
            Close Map
          </button> */}
          <button
            onClick={exportCSV}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Export as CSV
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        <StatCard icon={<ChartBarIcon className="h-6 w-6 text-blue-500" />} title="Total Complaints" value={complaints.length} />
        <StatCard icon={<FlagIcon className="h-6 w-6 text-yellow-500" />} title="In Progress" value={complaints.filter(c => c.status === 'In Progress').length} />
        <StatCard icon={<CheckCircleIcon className="h-6 w-6 text-green-500" />} title="Completed" value={complaints.filter(c => c.status === 'Completed').length} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Search complaints..."
          className="p-2 border rounded-md dark:bg-gray-700 dark:text-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="p-2 border rounded-md dark:bg-gray-700 dark:text-white">
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="p-2 border rounded-md dark:bg-gray-700 dark:text-white">
          <option value="Newest">Newest</option>
          <option value="Most Liked">Most Liked</option>
        </select>
      </div>

      {/* Complaints List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredComplaints.map(complaint => (
          <div key={complaint._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-3">
            <div className="flex items-center space-x-3">
              <img src={complaint.user?.avatar || '/default-avatar.png'} alt="User Avatar" className="h-8 w-8 rounded-full" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{complaint.user?.name || 'Unknown'}</p>
                <p className="text-xs text-gray-500">{new Date(complaint.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <p className="mt-2 text-sm text-gray-900 dark:text-gray-100">{complaint.content}</p>
            {complaint.image && <img src={complaint.image} alt="Complaint" className="mt-2 rounded-lg" />}
            {complaint.video && (
              <video controls className="mt-2 rounded-lg">
                <source src={complaint.video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}

            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>👍 {complaint.likes} Likes</span>
              <span>💬 {complaint.comments.length} Comments</span>
            </div>

            {/* Status Dropdown */}
            <div className="mt-2">
              <label htmlFor={`status-${complaint._id}`} className="text-sm text-gray-500 dark:text-gray-400">
                Update Status:
              </label>
              <select
                id={`status-${complaint._id}`}
                value={complaint.status}
                onChange={(e) => updateStatus(complaint._id, e.target.value)}
                className="ml-2 p-1 border rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Location Buttons */}
            <div className="mt-2 flex space-x-4">
              <button
                onClick={() => openMap({ lat: complaint.latitude, lng: complaint.longitude })}
                className={`flex items-center font-semibold text-sm ${
                  complaint.latitude && complaint.longitude
                    ? 'text-blue-600 hover:text-blue-800 cursor-pointer'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
                title={complaint.latitude && complaint.longitude ? "View Location of this Post" : "Location not available"}
                disabled={!(complaint.latitude && complaint.longitude)}
              >
                <MapPinIcon className="h-5 w-5 mr-1" />
                View Location
              </button>
              <button
                onClick={() => trackLocation({ lat: complaint.latitude, lng: complaint.longitude })}
                className={`flex items-center font-semibold text-sm ${
                  complaint.latitude && complaint.longitude
                    ? 'text-green-600 hover:text-green-800 cursor-pointer'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
                title={complaint.latitude && complaint.longitude ? "Track Location of this Post" : "Location not available"}
                disabled={!(complaint.latitude && complaint.longitude)}
              >
                <MapPinIcon className="h-5 w-5 mr-1" />
                Track Location
              </button>
            </div>

            {/* Comments Toggle */}
            <button
              onClick={() => toggleComments(complaint._id)}
              className="mt-2 text-blue-500 text-sm"
            >
              {showComments[complaint._id] ? 'Hide Comments' : 'Show Comments'}
            </button>

            {/* Comments */}
            {showComments[complaint._id] && (
              <div className="mt-2 bg-gray-50 p-2 rounded">
                {complaint.comments.length > 0 ? (
                  complaint.comments.map((comment, index) => (
                    <p key={index} className="text-gray-700">
                      <strong>{comment.user}:</strong> {comment.text}
                    </p>
                  ))
                ) : (
                  <p className="text-gray-500">No comments yet.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Map Modal */}
      {mapVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg max-w-2xl w-full relative">
            <button
              onClick={closeMap}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 dark:text-gray-300"
            >
              ✖
            </button>
            <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Location Map</h2>
            <div ref={mapContainerRef} className="h-96 w-full rounded-md" />
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center space-x-3">
      {icon}
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{value}</p>
      </div>
    </div>
  );
}

export default AdminDashboard;

