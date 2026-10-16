
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
  const [page, setPage] = useState(1);

  const pageSize = 20;
  const totalPages = Math.ceil(total / pageSize);

  function loadRequests(pageNumber: number, searchText: string, statusText: string) {
    const params = new URLSearchParams({
      page: String(pageNumber),
      search: searchText,
      status: statusText,
    });

    fetch(`/api/requests?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setRequests(data.requests);
        setTotal(data.total);
        setPage(pageNumber);
      });
  }

  useEffect(() => {
    loadRequests(1, "", "");
  }, []);

  function handleSearch() {
    loadRequests(1, search, status);
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

      <div>
        {requests.map((request) => (
          <p key={request.serviceRequestId}>
            {request.name} - {request.status}
          </p>
        ))}
      </div>

      <button
        disabled={page === 1}
        onClick={() => loadRequests(page - 1, search, status)}
      >
        Previous
      </button>

      <span> Page {page} of {totalPages} </span>

      <button
        disabled={page >= totalPages}
        onClick={() => loadRequests(page + 1, search, status)}
      >
        Next
      </button>
    </div>
  );
}

export default App;
