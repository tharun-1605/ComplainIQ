import { useState, useEffect } from 'react';

function CompletedComplaints() {
  const [completedComplaints, setCompletedComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <div className="min-h-screen bg-black text-white p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Completed Complaints</h2>
      {completedComplaints.map((complaint) => (
        <div key={complaint._id} className="bg-zinc-900 rounded-lg p-4 mb-6 shadow-lg">
          <p className="mb-2">{complaint.content}</p>
          {complaint.image && (
            <img src={complaint.image} alt="Complaint" className="mb-2 rounded-lg max-h-64 object-cover" />
          )}
          {complaint.video && (
            <video controls className="mb-2 rounded-lg max-h-64 w-full">
              <source src={complaint.video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
          <div className="mt-4 bg-gray-800 p-3 rounded">
            <h3 className="font-semibold mb-2">Admin Reply:</h3>
            <p>{complaint.adminReply?.description || 'No reply yet.'}</p>
            {complaint.adminReply?.image && (
              <img src={complaint.adminReply.image} alt="Admin Reply" className="mt-2 rounded-lg max-h-64 object-cover" />
            )}
            {complaint.adminReply?.video && (
              <video controls className="mt-2 rounded-lg max-h-64 w-full">
                <source src={complaint.adminReply.video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default CompletedComplaints;