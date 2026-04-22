(function() {
  const systemContext = {
    activeProcessors: []
  };

  function launchDataStreamView(connectionPort) {
    document.addEventListener('DOMContentLoaded', function() {
      const endpointAddress = 'ws://localhost:' + connectionPort;
      const dataChannel = new (window.WebSocket || window.MozWebSocket)(endpointAddress);
      const executionEnvironment = {};

      const primaryDataProcessor = function(receivedPayload, currentEnvironment) {
        const previousDisplayBlock = document.querySelector('pre:last-of-type');

        // Skip consecutive blank lines
        if (receivedPayload.data === '\n' && previousDisplayBlock && previousDisplayBlock.textContent === '\n') {
          return;
        }

        // Generate and append new content block
        const newContentBlock = document.createElement('pre');
        newContentBlock.textContent = receivedPayload.data;
        document.body.appendChild(newContentBlock);

        // Ensure view is scrolled to the bottom
        window.scrollTo(0, document.documentElement.scrollHeight || document.body.scrollHeight);
      };

      // Populate systemContext with the primary processor
      systemContext.activeProcessors.push(primaryDataProcessor);

      dataChannel.onmessage = function(incomingEvent) {
        // Iterate through all registered processors
        systemContext.activeProcessors.forEach(processor => processor(incomingEvent, executionEnvironment));
      };
    });
  }

  // Expose the initiation function globally
  window.initializeStreamMonitor = launchDataStreamView;
})();