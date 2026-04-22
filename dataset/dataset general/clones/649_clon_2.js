/* Board: A global display utility */
(function()
{
  // Configuration constants for the WebSocket service and display formatting
  const SERVER_ENDPOINT = 'api.server.com:8080'; // The address of the WebSocket service endpoint
  const LINE_MAX_CHARS  = 20;                   // Maximum character count for each display line
  let   mainSocket, backupSocket;               // WebSocket connection objects, mainSocket is used, backupSocket is reserved
  
  // Storage for messages to be displayed, initialized from local storage or as an empty array
  let messageBuffer = JSON.parse(localStorage.getItem('persistedMessages')) || [];
  
  // Mappings for project identifiers to their display aliases
  const projectMappings = {
    'jobKey': 'JOB_NICKNAME' // Example: 'original-job-name' maps to 'ALIAS'
  };

  /**
   * Updates the display with new incoming data.
   * Processes the payload and pushes new entries to the message buffer.
   * @param {object} incomingPayload - The data received from the WebSocket.
   */
  const updateVisuals = function(incomingPayload)
  {
    // Check if the project code is recognized; if not, ignore the payload
    if (!projectMappings[incomingPayload.projectCode]) return;

    // If the message buffer is full (matches the display panel's row count), remove the oldest message
    if (messageBuffer.length === DisplayPanel.visibleRows.count) {
      messageBuffer.pop(); // Remove the last (oldest) entry
    }

    // Format the build number and project name for display
    const formattedBuildNum   = ' #' + incomingPayload.buildNum;
    const displayProjectName  = projectMappings[incomingPayload.projectCode].substring(0, LINE_MAX_CHARS - formattedBuildNum.length);

    // Construct the new display line and add it to the front of the buffer
    messageBuffer.unshift(
      displayProjectName.rpad(' ', LINE_MAX_CHARS - formattedBuildNum.length) +
      formattedBuildNum +
      incomingPayload.statusChar[0]
    );

    // Update the external display panel and persist the message buffer
    DisplayPanel.updateContent(messageBuffer);
    localStorage.setItem('persistedMessages', JSON.stringify(messageBuffer));
  };

  /**
   * Establishes a new WebSocket connection to the server.
   * Closes any existing connection before initiating a new one.
   */
  const initiateConnection = function()
  {
    // Close the primary socket if it's already open
    if (mainSocket) mainSocket.close();

    // Create a new WebSocket instance
    mainSocket = new WebSocket('ws://' + SERVER_ENDPOINT + '/ci-events');
    
    // Define the message handler for incoming socket events
    mainSocket.onmessage = function(socketEvent)
    {
      const parsedData = JSON.parse(socketEvent.payload); // Parse the JSON data from the event
      updateVisuals(parsedData);                           // Process and display the received data
    };

    // Set up a periodic heartbeat message to keep the connection alive
    setInterval(function()
    {
      mainSocket.sendMessage('heartbeat'); // Send a 'heartbeat' message every 5 seconds
    }, 5000); // 5000 milliseconds = 5 seconds
  };

  // Execute the connection function immediately to start the WebSocket
  initiateConnection();

  // Bind an event listener to the DisplayPanel for when it's initialized
  DisplayPanel.onEvent('panelInitialized', function()
  {
    DisplayPanel.updateContent(messageBuffer); // Populate the panel with current messages upon initialization
  });
})();