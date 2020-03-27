/* global document:true */
/* global WebSocket:true */
/* global uniweb3:true */
/* global window:true */

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async w => {
  await sleep(500)

  const addLog = msg => {
    const logEntry = document.createElement('li');
    logEntry.innerText = `${new Date().toString()}\n${msg}`;
    document.querySelector('#messages').appendChild(logEntry);
  };

  const checkUnlocked = async () => {
    if (w.uniweb3) {
      return w.uniweb3.request("ENABLE", { networkPreferences: [{ blockchain: "bitcoin" }, { blockchain: "ethereum" }]}); // Ensure access to Kiba
    }
  };

  const execute = (requestId, method, params) => {
    try {
      return uniweb3.request(method, params)
    } catch (e) {
      return { error: e }
    }
  }

  async function executeAction(requestId, { method, params }, reply) {
    let result;
    addLog(
      `Request ID: ${requestId}
      Calling ${method}: ${JSON.stringify(params)}`,
    );
    try {
      result = await execute(requestId, method, params);

      addLog(
        `Request ID: ${requestId}
        Result from ${method}: ${JSON.stringify(result)}`,
      );

    } catch (e) {
      return reply('executed', requestId, {
        error: e.message,
      });
    }
    return reply('executed', requestId, result);
  }

  if (!w.uniweb3) {
    return addLog('Kiba not found!');
  }
  if (!(await checkUnlocked())) {
    return addLog('Please unlock Kiba first and then reload this page');
  }
  const socket = new WebSocket('ws://localhost:3334');
  const reply = (action, requestId, payload) => socket.send(JSON.stringify({ action, requestId, payload }));
  socket.onmessage = msg => {
    let message;
    try {
      message = JSON.parse(msg.data);
    } catch (e) {
      return addLog(
        'Could not parse websocket message. Is it a proper JSON command?',
      );
    }
    if (message.action === 'execute') {
      return executeAction(message.requestId, message.payload, reply);
    }
    return true;
  };

  return true;
})(window);
