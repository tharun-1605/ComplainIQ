import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import { API_BASE_URL } from '../services/api';
import { 
  CheckCircle, 
  X, 
  Sparkles, 
  MapPin, 
  Heart, 
  MessageCircle, 
  Share2, 
  ShieldCheck,
  Award
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const CATEGORY_STORIES = [
  { id: 'All', name: 'All Resolved', emoji: '🏆' },
  { id: 'Electric', name: 'Electricity', emoji: '⚡' },
  { id: 'Water', name: 'Water', emoji: '💧' },
  { id: 'Drainage', name: 'Sanitation', emoji: '🧹' },
  { id: 'Social Problem', name: 'Public Safety', emoji: '🛡️' },
  { id: 'Air', name: 'Environment', emoji: '🌿' },
  { id: 'Others', name: 'General', emoji: '📌' },
];

function CompletedComplaints() {
  const [completedComplaints, setCompletedComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    document.title = "Resolved Issues Showcase • ComplainIQ";
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

  const filteredComplaints = completedComplaints.filter((complaint) => {
    if (selectedCategory === 'All') return true;
    return complaint.category && complaint.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-emerald-500 selection:text-white pb-16 md:pb-8">
      <Navbar />

      <main className="flex-1 max-w-lg w-full mx-auto px-0 sm:px-4 py-4 space-y-6">
        
        {/* Header & Subtitle */}
        <div className="px-4 py-2 border-b border-[#262626] sm:border-b-0 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Resolved Resolutions
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Verified municipal fixes & civic actions
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
            {completedComplaints.length} Fixed
          </span>
        </div>

        {/* Category Story Highlights Bar */}
        <div className="bg-black sm:bg-[#0a0a0a] sm:border border-[#262626] sm:rounded-2xl p-3 flex items-center gap-4 overflow-x-auto scrollbar-custom border-b border-[#262626]">
          {CATEGORY_STORIES.map((story) => {
            const isSelected = selectedCategory === story.id;
            return (
              <button
                key={story.id}
                onClick={() => setSelectedCategory(story.id)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 group focus:outline-none"
              >
                <div className={isSelected ? 'w-[62px] h-[62px] rounded-full p-[2px] bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500' : 'w-[62px] h-[62px] rounded-full p-[2px] bg-[#262626]'}>
                  <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center text-2xl border-2 border-black">
                    {story.emoji}
                  </div>
                </div>
                <span className={`text-[11px] tracking-tight font-medium max-w-[64px] truncate ${isSelected ? 'text-white font-bold' : 'text-gray-400'}`}>
                  {story.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-6 px-4">
            {[1, 2].map((n) => (
              <div key={n} className="bg-[#0a0a0a] border border-[#262626] rounded-2xl p-4 space-y-4 animate-pulse">
                <div className="h-4 bg-[#1e1e1e] rounded w-1/3"></div>
                <div className="h-64 bg-[#1e1e1e] rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mx-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center">
            {error}
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="text-center py-16 px-4 bg-[#0a0a0a] border border-[#262626] rounded-2xl">
            <Award className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No Resolved Complaints Here</h3>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">
              Complaints verified as completed by government officials will appear in this showcase.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredComplaints.map((complaint) => {
              const authorName = complaint.user?.name || complaint.user?.username || 'Citizen';

              return (
                <article
                  key={complaint._id}
                  className="ig-card overflow-hidden"
                >
                  {/* Post Header */}
                  <div className="p-3 sm:p-4 flex items-center justify-between border-b border-[#1e1e1e]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1.5px]">
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center font-bold text-xs text-white uppercase">
                          {authorName[0]}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">{authorName}</span>
                          <StatusBadge status="Resolved" />
                        </div>
                        <p className="text-[11px] text-gray-400 font-medium">
                          Resolved on {new Date(complaint.updatedAt || complaint.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                      {complaint.category || 'Civic'}
                    </span>
                  </div>

                  {/* Complaint Description */}
                  <div className="p-4 space-y-2">
                    <h3 className="text-sm font-bold text-white">{complaint.title || 'Civic Issue Resolved'}</h3>
                    <p className="text-xs text-gray-300 leading-relaxed">{complaint.content}</p>
                  </div>

                  {/* Original Media Attachment */}
                  {(complaint.image || complaint.video) && (
                    <div className="relative bg-[#121212]">
                      {complaint.image && (
                        <img
                          src={complaint.image}
                          alt="Reported Issue"
                          className="w-full max-h-96 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                          onClick={() => setExpandedImage(complaint.image)}
                        />
                      )}
                      {complaint.video && (
                        <video controls className="w-full max-h-96 object-cover">
                          <source src={complaint.video} type="video/mp4" />
                        </video>
                      )}
                    </div>
                  )}

                  {/* Official Municipal Resolution Card */}
                  <div className="p-4 bg-[#0d1612] border-t border-emerald-900/40 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                      <ShieldCheck className="w-4 h-4" /> Official Municipal Resolution
                    </div>
                    <p className="text-xs text-emerald-200 leading-relaxed">
                      {complaint.adminReply?.description || complaint.adminReply || 'Municipal authority has verified and resolved this civic issue.'}
                    </p>

                    {(complaint.adminReply?.image || complaint.adminReply?.video) && (
                      <div className="pt-2">
                        {complaint.adminReply?.image && (
                          <div className="rounded-xl overflow-hidden border border-emerald-500/30 max-h-56">
                            <img
                              src={complaint.adminReply.image}
                              alt="Resolution Proof"
                              className="w-full h-56 object-cover cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => setExpandedImage(complaint.adminReply.image)}
                            />
                          </div>
                        )}
                        {complaint.adminReply?.video && (
                          <video controls className="w-full h-56 rounded-xl border border-emerald-500/30 object-cover mt-2">
                            <source src={complaint.adminReply.video} type="video/mp4" />
                          </video>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Lightbox Image Preview Modal */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setExpandedImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh]">
              <button
                onClick={() => setExpandedImage(null)}
                className="absolute top-2 right-2 p-2 bg-[#1e1e1e] text-white rounded-full hover:bg-[#333333]"
              >
                <X className="w-5 h-5" />
              </button>
              <img src={expandedImage} alt="Resolution" className="max-h-[85vh] rounded-xl object-contain border border-[#262626]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CompletedComplaints;