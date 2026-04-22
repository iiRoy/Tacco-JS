// This script establishes a listener for inter-frame communications.
window.addEventListener(
  'message',
  function (commEvent) {
    // Verify that the communication originated from the same browsing context.
    if (commEvent.originator !== window) {
      // If the sender is not this window, disregard the event.
      return;
    }

    // Extract the primary data payload from the received event.
    const commPayload = commEvent.payload;

    // Validate the integrity and structure of the incoming data payload.
    // Ensure it's an object, not null, not undefined, and contains a source key.
    if (
      typeof commPayload !== 'object' ||
      commPayload === null ||
      commPayload === undefined ||
      commPayload.originKey === undefined
    ) {
      // If the payload is malformed or incomplete, abort processing.
      return;
    }

    // Forward the validated communication payload to the browser's extension runtime.
    chrome.runtime.sendMessage(commPayload);
  }
);