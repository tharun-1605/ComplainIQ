import { useState, useEffect } from 'react';

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
    return <p className="text-center text-gray-400 mt-6">Loading completed complaints...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 mt-6">{error}</p>;
  }

  if (completedComplaints.length === 0) {
    return <p className="text-center text-gray-400 mt-6">No completed complaints found.</p>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-extrabold mb-8 border-b border-gray-700 pb-3">Completed Complaints</h2>
      {completedComplaints.map((complaint) => (
        <div
          key={complaint._id}
          className="bg-zinc-900 rounded-xl p-6 mb-8 shadow-xl hover:shadow-2xl transition-shadow duration-300"
          aria-label="Completed complaint card"
        >
          <div className="flex justify-between items-center mb-4">
            <p className="text-lg font-semibold text-indigo-400">{complaint.content}</p>
            {complaint.createdAt && (
              <time
                dateTime={complaint.createdAt}
                className="text-sm text-gray-500 italic"
                title={new Date(complaint.createdAt).toLocaleString()}
              >
                {new Date(complaint.createdAt).toLocaleDateString()}
              </time>
            )}
          </div>
          {complaint.image && (
            <img
              src={complaint.image}
              alt="Complaint visual"
              className="mb-4 rounded-lg max-h-72 w-full object-cover border border-gray-700 cursor-pointer"
              onClick={() => setExpandedImage(complaint.image)}
            />
          )}
          {complaint.video && (
            <video
              controls
              className="mb-4 rounded-lg max-h-72 w-full border border-gray-700"
              aria-label="Complaint video"
            >
              <source src={complaint.video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
          <div className="mt-6 bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h3 className="font-semibold mb-3 text-lg text-indigo-300 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-green-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
              </svg>
              Admin Reply:
            </h3>
            <p className="text-gray-300">{complaint.adminReply?.description || 'No reply yet.'}</p>
            {complaint.adminReply?.image && (
              <img
                src={complaint.adminReply.image}
                alt="Admin reply visual"
                className="mt-4 rounded-lg max-h-72 w-full object-cover border border-gray-700 cursor-pointer"
                onClick={() => setExpandedImage(complaint.adminReply.image)}
              />
            )}
            {complaint.adminReply?.video && (
              <video
                controls
                className="mt-4 rounded-lg max-h-72 w-full border border-gray-700"
                aria-label="Admin reply video"
              >
                <source src={complaint.adminReply.video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>
      ))}

      {expandedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 cursor-pointer"
          onClick={() => setExpandedImage(null)}
          aria-label="Expanded image modal"
        >
          <img
            src={expandedImage}
            alt="Expanded visual"
            className="max-h-full max-w-full rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 text-white text-3xl font-bold"
            onClick={() => setExpandedImage(null)}
            aria-label="Close expanded image"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}

export default CompletedComplaints;
