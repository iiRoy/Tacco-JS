/*
 * This file contains client-side functionality for a web-based terminal interface.
 * It manages the connection to a backend server and simulates a VT100 terminal.
 */

// Global function to initiate the terminal session and WebSocket connection.
window.beginSession = function() {
  // Declare local variables used within this scope.
  var outputPanel,
      pageInfo,
      commLink,
      vtEmulator;

  // Retrieve current page location details from the browser's document object.
  pageInfo = document.location;

  // Establish a new WebSocket communication link with the server.
  // The server address is constructed from the current page's protocol and host.
  // This connection object is also stored on the window for global access.
  commLink = window.commLink = io.connect(pageInfo.protocol + "//" + pageInfo.host);

  // Instantiate a new virtual terminal emulator.
  // It's configured for 80 columns and 25 rows, and associated with a specific display ID.
  vtEmulator = new VirtualTerminal(0x50, 25.0, "displayWindow");

  // Set up a callback to handle character input from the virtual terminal.
  // Whenever a character is typed, it's sent to the server via the WebSocket.
  vtEmulator.readKey(function(pressedChar, emuInstance) {
    // Dispatch the character input as an 'inputChar' event.
    return commLink.sendEvent('inputChar', pressedChar);
  });

  // Obtain a reference to the HTML element designated for terminal output.
  outputPanel = document.getElementById('displayWindow');

  // Configure the cursor visibility for the virtual terminal within its display area.
  vtEmulator.setCursorVisibility(1, true, outputPanel);

  // Set keyboard focus on the output panel to capture user input immediately.
  outputPanel.activateFocus();

  // Register an event listener for incoming 'serverData' messages from the server.
  commLink.onEvent('serverData', function(incomingMsg) {
    // Check if the received message is a specific command to terminate the session.
    if (incomingMsg === "\n\rexittt\n\r") {
      window.disconnectClient(); // Invoke the global session termination function.
    }
    // Otherwise, render the incoming data onto the virtual terminal screen.
    return vtEmulator.displayContent(incomingMsg);
  });

  // Register another event listener for the 'connectionClosed' event from the server.
  // This listener is returned, making it the final action of this setup function.
  return commLink.onEvent('connectionClosed', function(finalInfo) {
    vtEmulator.setCursorVisibility(0, true); // Hide the cursor when the connection closes.
    return vtEmulator.displayContent(finalInfo); // Display any last pieces of information.
  });
}; // End of beginSession function definition.


// Global function to gracefully close the client's connection to the server.
window.disconnectClient = function() {
  var activeLink; // Local variable to hold the reference to the active communication link.

  // Verify that there is an active communication link before attempting to close it.
  if ((activeLink = window.commLink) !== null) {
    // Send a 'terminateSignal' event to the server to inform it of the client's departure.
    activeLink.sendEvent('terminateSignal');
  }
  // Clear the reference to the communication link to ensure proper resource release.
  return activeLink = null;
}; // Concluding the disconnectClient function.