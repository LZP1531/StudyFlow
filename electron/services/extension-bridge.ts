import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

export interface BrowserActivityPayload {
  browser: string;
  url: string;
  domain: string;
  title: string;
  pageType?: string;
  capturedAt: string;
}

export class ExtensionBridge {
  private latestActivity: BrowserActivityPayload | null = null;

  private server = createServer((req, res) => {
    void this.handleRequest(req, res);
  });

  async start(port = 32145) {
    await new Promise<void>((resolve) => {
      this.server.listen(port, "127.0.0.1", () => resolve());
    });
  }

  stop() {
    this.server.close();
  }

  getLatestActivity() {
    return this.latestActivity;
  }

  getStatus() {
    const lastSyncAt = this.latestActivity?.capturedAt ?? null;
    const isConnected = lastSyncAt
      ? Date.now() - new Date(lastSyncAt).getTime() <= 5 * 60 * 1000
      : false;

    return {
      browserExtensionConnected: isConnected,
      lastBrowserSyncAt: lastSyncAt,
    };
  }

  private async handleRequest(req: IncomingMessage, res: ServerResponse) {
    if (req.method === "POST" && req.url === "/extension/activity") {
      const body = await this.readBody(req);
      try {
        this.latestActivity = JSON.parse(body) as BrowserActivityPayload;
        res.writeHead(204);
        res.end();
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON payload" }));
      }
      return;
    }

    if (req.method === "GET" && req.url === "/extension/activity") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(this.latestActivity));
      return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  }

  private async readBody(req: IncomingMessage) {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString("utf8");
  }
}
