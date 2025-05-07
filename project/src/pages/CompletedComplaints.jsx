import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function CompletedComplaints() {
  const [completedComplaints, setCompletedComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);

  useEffect(() => {
    const fetchCompletedComplaints = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://public-complient-websitw.onrender.com/api/user/completed-complaints', {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 text-lg">Loading completed complaints...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-red-900/50 border border-red-700 rounded-xl p-6 max-w-md text-center">
          <p className="text-red-300 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  if (completedComplaints.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <p className="text-gray-400 text-xl">No completed complaints found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 md:p-8 max-w-6xl mx-auto">
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl md:text-4xl font-bold mb-8 pb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500 border-b border-gray-700"
      >
        Completed Complaints
      </motion.h2>

      <div className="space-y-6">
        <AnimatePresence>
          {completedComplaints.map((complaint) => (
            <motion.div
              key={complaint._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              exit={{ opacity: 0 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-indigo-500/30 transition-all duration-300 shadow-lg hover:shadow-indigo-500/10"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <p className="text-lg font-medium text-gray-100 leading-relaxed">
                  {complaint.content}
                </p>
                {complaint.createdAt && (
                  <div className="flex items-center text-sm text-gray-400">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    {new Date(complaint.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                )}
              </div>

              {(complaint.image || complaint.video) && (
                <div className="mb-6 rounded-xl overflow-hidden border border-gray-700/50">
                  {complaint.image && (
                    <motion.img
                      src={complaint.image}
                      alt="Complaint visual"
                      className="w-full h-auto max-h-80 object-cover cursor-pointer hover:scale-[1.01] transition-transform duration-300"
                      onClick={() => setExpandedImage(complaint.image)}
                      whileHover={{ scale: 1.01 }}
                    />
                  )}
                  {complaint.video && (
                    <video
                      controls
                      className="w-full h-auto max-h-80 object-cover"
                      aria-label="Complaint video"
                    >
                      <source src={complaint.video} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              )}

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-700/30 rounded-xl p-5 border border-gray-600/30 backdrop-blur-sm"
              >
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-green-900/30 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg text-green-400">Admin Response</h3>
                </div>
                <p className="text-gray-300 pl-11 mb-4">
                  {complaint.adminReply?.description || 'No reply yet.'}
                </p>

                {(complaint.adminReply?.image || complaint.adminReply?.video) && (
                  <div className="pl-11">
                    {complaint.adminReply?.image && (
                      <motion.img
                        src={complaint.adminReply.image}
                        alt="Admin reply visual"
                        className="rounded-lg w-full h-auto max-h-80 object-cover cursor-pointer border border-gray-700/50 hover:scale-[1.01] transition-transform duration-300"
                        onClick={() => setExpandedImage(complaint.adminReply.image)}
                        whileHover={{ scale: 1.01 }}
                      />
                    )}
                    {complaint.adminReply?.video && (
                      <video
                        controls
                        className="rounded-lg w-full h-auto max-h-80 object-cover border border-gray-700/50"
                        aria-label="Admin reply video"
                      >
                        <source src={complaint.adminReply.video} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                )}
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
            onClick={() => setExpandedImage(null)}
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="relative max-w-4xl w-full"
            >
              <img
                src={expandedImage}
                alt="Expanded visual"
                className="max-h-[90vh] w-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute top-4 right-4 bg-gray-800/80 hover:bg-gray-700/90 rounded-full p-2 shadow-lg"
                onClick={() => setExpandedImage(null)}
                aria-label="Close expanded image"
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CompletedComplaints;