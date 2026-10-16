import { app } from '@azure/functions';
import { BlobServiceClient } from '@azure/storage-blob';

// Cache the dataset within a warm Azure Functions instance.
let cachedRows;
let loading;

function safeRow(line) {
  const fields = line.split('|');
  if (fields.length < 11 || fields[9]?.trim().toLowerCase() !== 'public') return null;
  const [serviceRequestId, name, description, status, longitude, latitude, address, createdAt, updatedAt, permission, sourceSystem] = fields;
  // Do not publish private street addresses or exact coordinates from raw records.
  return {
    serviceRequestId,
    name,
    description,
    status,
    createdAt,
    updatedAt,
    sourceSystem
  };
}

async function loadRows() {
  if (cachedRows) return cachedRows;
  if (!loading) {
    loading = (async () => {
      const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
      if (!connectionString) throw new Error('Missing AZURE_STORAGE_CONNECTION_STRING application setting');
      const service = BlobServiceClient.fromConnectionString(connectionString);
      const container = service.getContainerClient('service-requests');
      const blob = container.getBlockBlobClient('ServiceRequest.txt');
      const response = await blob.download();
      const chunks = [];
      for await (const chunk of response.readableStreamBody) chunks.push(chunk);
      const contents = Buffer.concat(chunks).toString('utf8');
      cachedRows = contents.split(/\r?\n/).map(safeRow).filter(Boolean);
      return cachedRows;
    })().catch(error => { loading = undefined; throw error; });
  }
  return loading;
}

app.http('requests', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'requests',
  handler: async (request, context) => {
    try {
      const rows = await loadRows();
      const url = new URL(request.url);
      const search = (url.searchParams.get('search') || '').trim().toLowerCase().slice(0, 100);
      const status = (url.searchParams.get('status') || '').trim().toLowerCase();
      const page = Math.max(1, Math.min(10000, Number.parseInt(url.searchParams.get('page') || '1', 10) || 1));
      const pageSize = Math.max(1, Math.min(50, Number.parseInt(url.searchParams.get('pageSize') || '20', 10) || 20));
      const matching = rows.filter(row =>
        (!status || row.status.toLowerCase() === status) &&
        (!search || `${row.name} ${row.description} ${row.serviceRequestId}`.toLowerCase().includes(search))
      );
      const start = (page - 1) * pageSize;
      return { jsonBody: { total: matching.length, page, pageSize, requests: matching.slice(start, start + pageSize) }, headers: { 'Cache-Control': 'public, max-age=60' } };
    } catch (error) {
      context.error('Request query failed', error);
      return { status: 503, jsonBody: { error: 'Dataset temporarily unavailable. Check Azure application settings and storage access.' } };
    }
  }
});
