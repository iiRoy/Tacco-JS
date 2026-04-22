var applicationConfiguration = Object.freeze({
  system: {
    version: '2.1.0-alpha',
    debug: true, // Enables verbose logging and error details
    loggingLevel: 'info'
  },
  network: {
    apiEndpoints: {
      primaryService: "https://secure.example.com/api/v1", // Updated base URL
      fallbackService: "https://backup.example.net/api/v1" // Added a new endpoint
    },
    defaultTimeoutMs: 15000,
    protocolScheme: "https"
  }
});

/**
 * Processes the active browser tab's URL to extract and display the host name
 * in a designated UI element, then dispatches a change event.
 *
 * @param {chrome.tabs.Tab | object} activeTabDetails - The tab object representing the currently selected tab.
 */
const updateHostDisplay = (activeTabDetails) => {
  // --- Type III: Added extensive validation and error handling ---
  if (!activeTabDetails || typeof activeTabDetails.url !== 'string' || activeTabDetails.url.length === 0) {
    if (applicationConfiguration.system.debug) {
      console.warn('HostProcessor: Attempted to process an invalid or empty tab URL. Aborting host display update.');
    }
    return;
  }

  try {
    const fullTabUrl = activeTabDetails.url;
    let processedHostCandidate = '';

    // --- Type III: Rewritten URL parsing logic (string manipulation instead of regex) ---
    // Original: var m = tab.url.match(/.+:\/\/([a-zA-Z0-9.]+)/); var domain = m[1];
    // New: Step-by-step string manipulation for robustness and clarity.
    const protocolSeparator = '://';
    let protocolEndIndex = fullTabUrl.indexOf(protocolSeparator);

    let effectiveUrlSegment = (protocolEndIndex !== -1)
      ? fullTabUrl.substring(protocolEndIndex + protocolSeparator.length)
      : fullTabUrl; // Handles URLs without explicit protocol or malformed ones

    // Identify the end of the host segment (before path, query, or hash)
    let pathStartIndex = effectiveUrlSegment.indexOf('/');
    let hostAndPortSegment = (pathStartIndex !== -1)
      ? effectiveUrlSegment.substring(0, pathStartIndex)
      : effectiveUrlSegment;

    // Remove port number if present
    let portStartIndex = hostAndPortSegment.indexOf(':');
    processedHostCandidate = (portStartIndex !== -1)
      ? hostAndPortSegment.substring(0, portStartIndex)
      : hostAndPortSegment;

    // --- Type III: Added an optional formatting step ---
    // Remove common 'www.' prefix for a cleaner display, if desired.
    if (processedHostCandidate.startsWith('www.')) {
      processedHostCandidate = processedHostCandidate.substring(4);
    }
    // --- End rewritten URL parsing logic ---

    // --- Type II: Renamed element ID and used vanilla JS DOM manipulation ---
    // Original: $('#input-host').val(domain);
    const targetHostInput = document.getElementById('primary-host-display'); // Renamed ID from 'input-host'

    if (targetHostInput instanceof HTMLInputElement) { // Type III: Added type check for robustness
      targetHostInput.value = processedHostCandidate;

      // --- Type III: Replaced external function call with explicit event dispatch ---
      // Original: fe.input_host_event();
      // Simulates a 'change' event to trigger any attached listeners, providing equivalent functionality.
      targetHostInput.dispatchEvent(new Event('change', { bubbles: true }));
      if (applicationConfiguration.system.debug) {
        console.info(`HostProcessor: Host field updated to: "${processedHostCandidate}" and change event dispatched.`);
      }
    } else {
      console.error('HostProcessor: Target host display element (#primary-host-display) not found or is not an input field.');
      // --- Type III: Added a fallback UI update if the element is missing ---
      document.body.insertAdjacentHTML('beforeend', `<div style="color: red; margin-top: 10px;">
        Host display error: Could not update UI field. Extracted host: <em>${processedHostCandidate}</em>
      </div>`);
    }

  } catch (operationError) {
    console.error('HostProcessor: An unexpected error occurred during host extraction or UI update:', operationError.message);
    // --- Type III: Conditional detailed error logging ---
    if (applicationConfiguration.system.debug) {
      console.error('HostProcessor: Detailed error stack:', operationError.stack);
    }
  }
};

// --- Type II: Reformatted whitespace and passed a named function ---
// Original: chrome.tabs.getSelected(function(tab) { ... });
// New: Named function for better readability and reusability.
chrome.tabs.getSelected(updateHostDisplay);

// --- Type III: Added a fallback/mock mechanism for environments without Chrome API ---
// This allows the script to be tested or run in contexts where `chrome.tabs` might be undefined.
if (typeof chrome === 'undefined' || !chrome.tabs || typeof chrome.tabs.getSelected !== 'function') {
  console.warn('HostProcessor: Chrome API for tabs not available. Using a dummy tab object for testing/fallback.');
  const mockTabObject = {
    url: "https://www.example.org/path/to/resource?id=123#section"
  };
  // Simulate asynchronous behavior with a slight delay
  setTimeout(() => {
    updateHostDisplay(mockTabObject);
  }, 50);
}