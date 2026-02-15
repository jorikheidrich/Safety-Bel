
const CLOUD_API_BASE = 'https://jsonblob.com/api/jsonBlob';

export interface CloudData {
  users: any[];
  lmras: any[];
  kickoffs: any[];
  notifications: any[];
  appConfig: any;
  lastUpdated: number;
}

export const syncService = {
  // We gebruiken de Workspace Key om een unieke "Blob" aan te maken op jsonblob.com
  // In een echte productie app zouden we hier Supabase of Firebase gebruiken.
  
  async createWorkspace(data: CloudData): Promise<string> {
    const response = await fetch(CLOUD_API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    });
    const location = response.headers.get('Location');
    if (!location) throw new Error('Could not create workspace');
    return location.split('/').pop() || '';
  },

  async updateWorkspace(blobId: string, data: CloudData): Promise<void> {
    await fetch(`${CLOUD_API_BASE}/${blobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  async getWorkspace(blobId: string): Promise<CloudData | null> {
    try {
      const response = await fetch(`${CLOUD_API_BASE}/${blobId}`, {
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
      });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }
};
