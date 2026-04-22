/*global DisplayManager*/
(function(){
  // Configuration constants for the WebSocket service and display
  const SERVER_HOST = 'socketserver.example.com:8080';
  const MAX_LINE_LENGTH = 20; // Maximum character width for each display line
  const STORAGE_KEY_MESSAGES = 'recentBuildUpdates'; // Key for localStorage persistence
  const PING_INTERVAL_MS = 7000; // Interval for sending health checks (in milliseconds)

  // Internal state variables for the connection and data
  let currentSocket = null; // Holds the active WebSocket connection instance
  let pingTimerHandle = null; // Stores the ID for the periodic ping timer
  let buildHistory = []; // Array to store formatted build update messages

  // Mapping of internal project identifiers to display aliases
  const projectMap = {
    'buildname': 'BUILD_ALIAS_ONE',
    'another-project-id': 'SECOND_PROJ' // Added for variety
  };

  /**
   * Helper function to retrieve build history from local storage.
   * Provides error handling for parsing.
   * @returns {Array<string>} An array of stored messages, or an empty array if none or error.
   */
  const retrieveBuildHistory = () => {
      try {
          const stored = localStorage.getItem(STORAGE_KEY_MESSAGES);
          return stored ? JSON.parse(stored) : [];
      } catch (e) {
          // Log parsing errors but return empty array to prevent application crash
          console.error("Failed to load build history from storage:", e);
          return [];
      }
  };

  /**
   * Helper function to persist the current build history to local storage.
   * Provides error handling for storage operations.
   * @param {Array<string>} history The array of messages to store.
   */
  const persistBuildHistory = (history) => {
      try {
          localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(history));
      } catch (e) {
          // Log storage errors
          console.error("Failed to save build history to storage:", e);
      }
  };

  // Initialize build history from local storage on startup
  buildHistory = retrieveBuildHistory();

  /**
   * Utility function to pad a string to the right with a specified character.
   * Behaves similarly to String.prototype.padEnd, but implemented explicitly.
   * @param {string} str The string to pad.
   * @param {number} len The desired total length of the string.
   * @param {string} [char=' '] The character to use for padding.
   * @returns {string} The padded string.
   */
  function padRight(str, len, char = ' ') {
      if (str.length >= len) {
        return str;
      }
      return str + char.repeat(len - str.length);
  }

  /**
   * Processes an incoming build update payload from the WebSocket.
   * Formats the message, updates the display history, and persists it.
   * @param {object} updatePayload The data object received from the WebSocket.
   * @param {string} updatePayload.project The identifier of the project.
   * @param {number} updatePayload.number The build number.
   * @param {string} updatePayload.result The result status of the build (e.g., 'SUCCESS', 'FAILURE').
   */
  const processIncomingUpdate = (updatePayload) => {
      // Guard clause: Validate essential properties and project alias existence
      if (!updatePayload || !updatePayload.project || !projectMap.hasOwnProperty(updatePayload.project)) {
          // console.warn("Received invalid update payload or unknown project:", updatePayload);
          return;
      }

      const maxDisplayRows = DisplayManager.getMaxRows();

      // Manage the size of the build history array.
      // If the history is at or above the max display rows, remove the oldest entry.
      if (buildHistory.length >= maxDisplayRows) {
          buildHistory = buildHistory.slice(0, maxDisplayRows - 1); // Remove the oldest item
      }

      const projectAlias = projectMap[updatePayload.project];
      const buildIdentifier = `#${updatePayload.number}`;
      // Extract the first character of the build result, default to '?' if not present
      const buildOutcomeChar = updatePayload.result ? updatePayload.result[0] : '?';

      // Calculate the space available for the project alias, accounting for build ID and a separator
      const availableSpaceForAlias = MAX_LINE_LENGTH - buildIdentifier.length - 1; // -1 for the space

      // Truncate and pad the project alias to fit the allotted space
      const trimmedAlias = projectAlias.substring(0, availableSpaceForAlias);
      const paddedAlias = padRight(trimmedAlias, availableSpaceForAlias, ' ');

      // Construct the final display line using template literals for clarity
      const displayLine = `${paddedAlias} ${buildIdentifier} ${buildOutcomeChar}`;

      // Add the newly formatted line to the beginning of the history
      buildHistory.unshift(displayLine);

      // Update the external display component and persist the updated history
      DisplayManager.updateContent(buildHistory);
      persistBuildHistory(buildHistory);
  };

  /**
   * Helper function to construct the full WebSocket URL.
   * @param {string} host The WebSocket server host (e.g., 'localhost:8080').
   * @param {string} path The specific endpoint path (e.g., '/build-stream').
   * @returns {string} The full WebSocket URL.
   */
  const constructSocketUrl = (host, path) => `ws://${host}${path}`;

  /**
   * Establishes or re-establishes a WebSocket connection to the build update stream.
   * Manages connection state, message handling, error recovery, and periodic pings.
   */
  const establishConnection = () => {
      // Close any existing open socket connection before creating a new one
      if (currentSocket && currentSocket.readyState === WebSocket.OPEN) {
          currentSocket.close(1000, "Reconnecting"); // 1000 is for normal closure
      }
      // Clear any active ping timer to prevent multiple timers running
      if (pingTimerHandle) {
          clearInterval(pingTimerHandle);
          pingTimerHandle = null;
      }

      const socketUrl = constructSocketUrl(SERVER_HOST, '/build-stream'); // Using a different path
      currentSocket = new WebSocket(socketUrl);

      // Event handler for successful connection establishment
      currentSocket.onopen = (event) => {
          // console.log('WebSocket connection established:', event.target.url);
          // Start sending periodic health checks (pings) to keep the connection alive
          pingTimerHandle = setInterval(() => {
              if (currentSocket.readyState === WebSocket.OPEN) {
                  currentSocket.send('health_check'); // Changed ping message
              } else {
                  // Stop pinging if the socket is no longer open
                  clearInterval(pingTimerHandle);
                  pingTimerHandle = null;
              }
          }, PING_INTERVAL_MS);
      };

      // Event handler for incoming messages from the WebSocket
      currentSocket.onmessage = (messageEvent) => {
          try {
              const parsedData = JSON.parse(messageEvent.data);
              processIncomingUpdate(parsedData);
          } catch (e) {
              // Log errors if message data cannot be parsed as JSON
              console.error("Error parsing WebSocket message:", e, messageEvent.data);
          }
      };

      // Event handler for WebSocket errors
      currentSocket.onerror = (errorEvent) => {
          console.error('WebSocket error encountered:', errorEvent);
          // Attempt to reconnect after a short delay to avoid rapid reconnection attempts
          setTimeout(establishConnection, 5000);
      };

      // Event handler for WebSocket connection closure
      currentSocket.onclose = (closeEvent) => {
          // console.log('WebSocket connection closed:', closeEvent.code, closeEvent.reason);
          // Clear the ping timer when the connection closes
          if (pingTimerHandle) {
              clearInterval(pingTimerHandle);
              pingTimerHandle = null;
          }
          // If the closure was not clean (e.g., unexpected disconnection), attempt to reconnect
          if (!closeEvent.wasClean) {
               // console.log('Attempting to re-establish connection due to unclean closure...');
               setTimeout(establishConnection, 3000);
          }
      };
  };

  // Initiate the WebSocket connection immediately upon script execution
  establishConnection();

  // Bind to the DisplayManager's 'ready' event to populate the initial display
  DisplayManager.subscribeToEvents('ready', () => {
    // When the display is ready, show the currently loaded build history
    DisplayManager.updateContent(buildHistory);
  });
})();