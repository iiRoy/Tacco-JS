const emptyFunction = () => {};

function establishStream(requestChannel, responseChannel, configuration = {}) {
  let userTerminationAction = configuration.onClose || emptyFunction;
  let heartbeatTimerId = null;
  let streamClosed = false;

  const sendServiceNote = (textNote) => {
    if (streamClosed) return;
    responseChannel.write(`:${textNote}\n\n`);
  };

  const sendHeartbeatSignal = () => {
    if (streamClosed) return;
    sendServiceNote("pulse");
    if (configuration.maintainHeartbeat && !streamClosed) {
      heartbeatTimerId = setTimeout(sendHeartbeatSignal, 15000);
    }
  };

  const handleStreamTermination = () => {
    if (streamClosed) return;
    streamClosed = true;

    if (heartbeatTimerId) {
      clearTimeout(heartbeatTimerId);
      heartbeatTimerId = null;
    }

    userTerminationAction();
    userTerminationAction = null;
  };

  const connectionClosureHandler = handleStreamTermination;

  requestChannel
    .on("aborted", connectionClosureHandler)
    .on("error", connectionClosureHandler);
  responseChannel
    .on("aborted", connectionClosureHandler)
    .on("error", connectionClosureHandler)
    .on("close", connectionClosureHandler)
    .on("end", connectionClosureHandler);

  responseChannel.writeHead(
    200,
    Object.freeze({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    })
  );

  if (configuration.maintainHeartbeat) {
    sendHeartbeatSignal();
  }

  return Object.freeze({
    pushData: (signalType, payload) => {
      if (streamClosed) return;
      responseChannel.write(
        `event: ${signalType}\n` +
        `data: ${JSON.stringify(payload)}\n\n`
      );
    },

    postMessage: sendServiceNote,

    closeConnection: () => {
      if (streamClosed) return;
      responseChannel.end();
      handleStreamTermination();
    },
  });
}

module.exports = establishStream;