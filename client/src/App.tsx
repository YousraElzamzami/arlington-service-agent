
import { useEffect, useState } from "react";

type ServiceRequest = {
  serviceRequestId: string;
  name: string;
  status: string;
  createdAt: string;
};

function App() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch("/api/requests")
      .then((res) => res.json())
      .then((data) => {
        setRequests(data.requests);
        setTotal(data.total);
      });
  }, []);

  function handleSearch() {
    fetch(`/api/requests?search=${encodeURIComponent(search)}&status=${status}`)
      .then((res) => res.json())
      .then((data) => {
        setRequests(data.requests);
        setTotal(data.total);
      });
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>Arlington Service Requests</h1>
      <p>{total.toLocaleString()} requests found</p>

      <input
        placeholder="Search requests"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <button onClick={handleSearch}>Search</button>

      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">All statuses</option>
        <option value="open">Open</option>
        <option value="closed">Closed</option>
      </select>

      <ul>
        {requests.map((request) => (
          <li key={request.serviceRequestId}>
            {request.name} - {request.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
