
import {useEffect, useState } from "react";

function App() {

  const [requests, setRequests] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/requests")
    .then((response) => response.json())
    .then((data) => setRequests(data));
  }, []);

  return (
  <main>
    <h1> Arlington Service Request Intelligence </h1>
    <p> Explore and analyze Arlington Country service requests</p>

    {requests.map((request) => (
      <div key={request.serviceRequestId}>
      <h3> {request.name} </h3>
      <p> Status: {request.status} </p>
      </div>
    ))}
  </main>
  );
}

export default App
