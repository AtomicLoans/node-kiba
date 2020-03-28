class RemoteKibaProvider {
  constructor(connector) {
    this._connector = connector;
  }

  // Generate a request id to track callbacks from async methods
  static generateRequestId() {
    const s4 = () =>
      Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
  }

  request(_type, _opts) {
    if (!this._connector.ready()) {
      new Error('Unable to send. Not connected to a Kiba socket.')
    }

    // Because requests are handled across a WebSocket, their callbacks need to
    // be associated with an ID which is returned with the response.
    const requestId = this.constructor.generateRequestId();

    // Set the payload to allow reassignment
    const payload = { method: _type, params: _opts }

    return this._connector.request('execute', requestId, payload, 'executed')
  }
}

module.exports = RemoteKibaProvider;
