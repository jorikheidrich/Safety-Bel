
export interface CloudData {
  users: any[];
  lmras: any[];
  kickoffs: any[];
  notifications: any[];
  appConfig: any;
  lastUpdated: number;
}

export const syncService = {
  /**
   * Stuurt alle data naar de Google Sheet Web App.
   */
  async pushData(sheetUrl: string, data: CloudData, workspaceId: string): Promise<void> {
    if (!sheetUrl) return;
    
    try {
      // We gebruiken een POST request naar de Web App URL.
      // We voegen de workspaceId toe als parameter zodat meerdere teams 1 sheet kunnen gebruiken.
      const url = new URL(sheetUrl);
      url.searchParams.set('id', workspaceId || 'default');
      url.searchParams.set('action', 'push');

      const response = await fetch(url.toString(), {
        method: 'POST',
        mode: 'no-cors', // Essentieel voor Google Apps Script redirects
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(data)
      });
      
      // Bij no-cors kunnen we de response body niet lezen, 
      // maar het versturen werkt wel betrouwbaar.
    } catch (e) {
      console.error("Database Push Error:", e);
      throw new Error("Kon geen verbinding maken met de Google Sheet database.");
    }
  },

  /**
   * Haalt de laatste data op uit de Google Sheet.
   */
  async pullData(sheetUrl: string, workspaceId: string): Promise<CloudData | null> {
    if (!sheetUrl) return null;

    try {
      const url = new URL(sheetUrl);
      url.searchParams.set('id', workspaceId || 'default');
      url.searchParams.set('action', 'pull');

      const response = await fetch(url.toString(), {
        method: 'GET',
        cache: 'no-store'
      });
      
      if (!response.ok) throw new Error("Server reageert niet");
      
      const text = await response.text();
      if (!text || text === "{}") return null;
      
      return JSON.parse(text);
    } catch (e) {
      console.error("Database Pull Error:", e);
      return null;
    }
  }
};
