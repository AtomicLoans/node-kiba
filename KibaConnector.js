const path = require('path');
const WebSocket = require('ws');
const express = require('express');

const RemoteKibaProvider = require('./RemoteKibaProvider');

const DEFAULT_PORT = 3334;

class KibaConnector {
  constructor(options) {
    this.config = Object.assign({}, { port: DEFAULT_PORT }, options);
  }

  async start() {
    this._app = express();
    this._app.use(express.static(path.resolve(__dirname, 'client')));
    this._wss = await this._runServer();
    await this._initialize();
  }

  stop() {
    return new Promise(resolve => {
      this._wss.close(() => {
        this._server.close(() => {
          resolve(true);
        });
      });
    });
  }

  _runServer() {
    return new Promise((resolve, reject) => {
      this._server = this._app.listen(this.config.port, 'localhost', err => {
        if (err) return reject(err);
        return resolve(new WebSocket.Server({ server: this._server }));
      });
    });
  }

  _initialize() {
    return new Promise(resolve => {
      this._wss.on('connection', ws => {
        // Only allow one conection at a time
        if (this.ready()) {
          return ws.close();
        }
        ws.on('close', () => {
          delete this._ws;
        });
        this._ws = ws;
        if (this.config.onConnect) this.config.onConnect();
        return resolve();
      });
    });
  }

  ready() {
    return this._ws && this._ws.readyState === WebSocket.OPEN;
  }

  static handleMessage(msg) {
    let message;
    try {
      message = JSON.parse(msg);
    } catch (e) {
      throw new Error('Could not parse message from socket. Is it valid JSON?');
    }
    const { action, requestId, payload } = message;
    return this.handleAction(action, requestId, payload);
  }

  static handleAction(action, requestId, payload) {
    if (action === 'error') {
      throw new Error(payload);
    }
    return {
      responseAction: action,
      responseRequestId: requestId,
      responsePayload: payload,
    };
  }

  request(action, requestId, payload, requiredAction) {
    return new Promise(resolve => {
      const onMsg = msg => {
        const {
          responseAction,
          responseRequestId,
          responsePayload,
        } = this.constructor.handleMessage(msg.data);
        if (
          requiredAction === responseAction &&
          requestId === responseRequestId
        ) {
          this._ws.removeEventListener('message', onMsg);
          resolve(responsePayload);
        }
      };
      this._ws.addEventListener('message', onMsg);
      const msg = JSON.stringify({ action, requestId, payload });
      this._ws.send(msg);
    });
  }

  getProvider() {
    return new RemoteKibaProvider(this);
  }
}

module.exports = KibaConnector;
