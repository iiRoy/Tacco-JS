const LiveLogStreamer = {
  // Initializes the WebSocket connection for real-time log streaming
  initiateConnection: function(connectionPort) {
    // Store a reference to this object for use within nested functions
    const streamerInstance = this;

    // Validate the provided network port to ensure it's a positive integer
    if (typeof connectionPort !== 'number' || connectionPort <= 0 || !Number.isInteger(connectionPort)) {
      console.error('Stream Setup Error: An invalid or missing port number was provided. Please use a positive integer.');
      return; // Abort connection setup if port is invalid
    }

    // Wait for the entire DOM to be fully loaded before attempting to establish a connection
    // and manipulate page elements. Using a local alias for jQuery for clarity.
    jQuery(function(domSelector) {
      // Construct the full WebSocket Uniform Resource Locator
      const wsUri = `ws://localhost:${connectionPort}`;

      // Instantiate a new WebSocket client to connect to the specified URI
      const webSocketEndpoint = new WebSocket(wsUri);

      // A dynamic object to maintain state and context across various message processing stages
      let processingContext = {
        receivedMessagesCount: 0,
        wasPreviousLineBlank: false,
        isAutoScrollingActive: true, // New control flag for scrolling behavior
        lastKnownScrollHeight: 0 // To optimize scrolling checks
      };

      // Define callback for when the WebSocket connection is successfully opened
      webSocketEndpoint.onopen = () => {
        console.info(`LiveLogStreamer: Successfully established connection to ${wsUri}`);
        // Add a visual indicator to the page
        domSelector('body').prepend('<div id="stream-live-status" style="background-color: #d4edda; color: #155724; padding: 8px; margin-bottom: 10px; border: 1px solid #c3e6cb; border-radius: 4px;">Live stream active.</div>');
      };

      // Define callback for handling incoming data messages from the server
      webSocketEndpoint.onmessage = function(incomingPayload) {
        // Increment the counter for processed messages
        processingContext.receivedMessagesCount++;

        // Execute each registered handler function in the 'messageProcessors' array
        // Using a standard array iteration method for cleaner code
        streamerInstance.messageProcessors.forEach(processorFn => {
          processorFn(incomingPayload, processingContext);
        });
      };

      // Define callback for handling any errors that occur during the WebSocket communication
      webSocketEndpoint.onerror = (errorEvent) => {
        console.error('LiveLogStreamer: WebSocket encountered an error!', errorEvent);
        domSelector('#stream-live-status').css({
          'background-color': '#f8d7da',
          'color': '#721c24',
          'border-color': '#f5c6cb'
        }).text('Stream Error! Check console for details.');
      };

      // Define callback for when the WebSocket connection is closed
      webSocketEndpoint.onclose = (closeDetail) => {
        console.warn(`LiveLogStreamer: WebSocket connection terminated. Code: ${closeDetail.code}, Reason: ${closeDetail.reason || 'No specific reason provided'}`);
        domSelector('#stream-live-status').css({
          'background-color': '#e2e3e5',
          'color': '#383d41',
          'border-color': '#d6d8db'
        }).text('Stream connection has been closed.');
      };
    });
  },

  // An extensible collection of functions, each responsible for processing a received log entry
  messageProcessors: [
    // The primary handler for rendering log content onto the page and managing display behavior
    function(logEntryData, processingContext) {
      const currentLineContent = logEntryData.data;

      // Implement a guard clause to prevent rendering multiple consecutive empty lines,
      // which can clutter the display.
      const isThisLineEmpty = currentLineContent === '\n' || currentLineContent.trim() === '';
      if (isThisLineEmpty && processingContext.wasPreviousLineBlank) {
        // If current line is empty and the previous one was also empty, skip rendering
        return;
      }
      processingContext.wasPreviousLineBlank = isThisLineEmpty; // Update state for the next message

      // Create a new <pre> element to preserve whitespace and formatting of the log line
      const outputElement = jQuery('<pre>').text(currentLineContent);

      // Append the newly created element to the document's body
      outputElement.appendTo('body');

      // Only perform scrolling if the auto-scrolling feature is enabled
      if (processingContext.isAutoScrollingActive) {
        // Smoothly animate the scroll position to the very bottom of the document
        // This ensures that the latest log entries are always visible
        jQuery('html, body').stop().animate({
          scrollTop: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
        }, 200); // Animation duration of 200 milliseconds for a softer effect
      }
    },
    // Optional additional processor: a simple console logger for debugging purposes.
    // This can be uncommented if a duplicate log of each message to the browser console is desired.
    /*
    function(logEntryData, processingContext) {
      console.log(`[Stream Log #${processingContext.receivedMessagesCount}]: ${logEntryData.data.trim()}`);
    }
    */
  ]
};