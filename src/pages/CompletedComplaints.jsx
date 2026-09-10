import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import { API_BASE_URL } from '../services/api';
import { CheckBadgeIcon, XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';

function CompletedComplaints() {
  const [completedComplaints, setCompletedComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);

  useEffect(() => {
    document.title = "Resolved Issues | ComplainIQ";
    const fetchCompletedComplaints = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/user/completed-complaints`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch completed complaints');
        const data = await response.json();
        setCompletedComplaints(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedComplaints();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
              <CheckBadgeIcon className="w-8 h-8 text-emerald-400" />
              Resolved Complaints Showcase
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Public record of successfully addressed civic issues & municipal responses
            </p>
          </div>
          <span className="text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold self-start sm:self-auto">
            {completedComplaints.length} Total Resolutions
          </span>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2].map((n) => (
              <div key={n} className="glass-card rounded-3xl p-6 border border-white/10 animate-pulse space-y-4">
                <div className="h-4 bg-slate-800 rounded w-1/3"></div>
                <div className="h-16 bg-slate-800 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="glass-card rounded-3xl p-8 text-center border border-rose-500/30 text-rose-300 text-sm">
            {error}
          </div>
        ) : completedComplaints.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center border border-white/10">
            <CheckBadgeIcon className="w-12 h-12 text-gray-500 mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-bold text-white mb-1">No Completed Complaints Yet</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Resolved complaints with official admin verification will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {completedComplaints.map((complaint) => (
              <motion.article
                key={complaint._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card glass-card-hover rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6"
              >
                {/* Top status bar */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
                      {complaint.category || 'Civic Issue'}
                    </span>
                    <span className="text-xs text-gray-400">
                      Resolved on {new Date(complaint.updatedAt || complaint.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <StatusBadge status="Resolved" />
                </div>

                {/* Complaint Content */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2">{complaint.title || 'Civic Complaint'}</h3>
                  <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">{complaint.content}</p>
                </div>

                {/* Media attachments */}
                {(complaint.image || complaint.video) && (
                  <div className="rounded-2xl overflow-hidden bg-slate-950/60 max-h-72">
                    {complaint.image && (
                      <img
                        src={complaint.image}
                        alt="Resolved Issue Proof"
                        className="w-full h-72 object-cover cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => setExpandedImage(complaint.image)}
                      />
                    )}
                    {complaint.video && (
                      <video controls className="w-full h-72 object-cover">
                        <source src={complaint.video} type="video/mp4" />
                      </video>
                    )}
                  </div>
                )}

                {/* Official Admin Reply Highlight */}
                <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    <SparklesIcon className="w-4 h-4" /> Official Municipal Resolution
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-100">
                    {complaint.adminReply?.description || complaint.adminReply || 'Issue inspected, addressed, and closed by authority.'}
                  </p>

                  {(complaint.adminReply?.image || complaint.adminReply?.video) && (
                    <div className="pt-2">
                      {complaint.adminReply?.image && (
                        <img
                          src={complaint.adminReply.image}
                          alt="Resolution Proof"
                          className="rounded-xl max-h-48 w-auto object-cover cursor-pointer border border-emerald-500/30"
                          onClick={() => setExpandedImage(complaint.adminReply.image)}
                        />
                      )}
                    </div>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setExpandedImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh]">
              <button
                onClick={() => setExpandedImage(null)}
                className="absolute top-2 right-2 p-2 bg-slate-800 text-white rounded-full"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
              <img src={expandedImage} alt="Resolution" className="max-h-[85vh] rounded-2xl object-contain" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CompletedComplaints;