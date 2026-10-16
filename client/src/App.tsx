
import { useEffect, useState } from "react";

type ServiceRequest = {
  serviceRequestId: string;
  name: string;
  status: string;
  createdAt: string;
};

export default function App() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/requests")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch requests");
        return response.json();
      })
      .then((data) => {
        setRequests(data.requests);
        setTotal(data.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Arlington Service Request Intelligence</h1>
      <p>Explore real Arlington County service requests.</p>

      <h2>{total.toLocaleString()} Total Requests</h2>

      {loading ? (
        <p>Loading requests...</p>
      ) : (
        <table cellPadding="12">
          <thead>
            <tr>
              <th>ID</th>
              <th>Service</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.serviceRequestId}>
                <td>{request.serviceRequestId}</td>
                <td>{request.name}</td>
                <td>{request.status}</td>
                <td>{request.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
