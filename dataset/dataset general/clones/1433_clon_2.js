let displayUpdateTimer,
  devToolsMode = 0,
  sizeMonitoring = false;

/* This function displays the current dimensions of the browser's content area. */
const displayMonitor = function() {
  // Validate if the dimension display element is already present in the DOM.
  if (document.getElementById('screenDimensionsDisplay')) {
    // If the element exists, refresh its content with current window sizes.
    document.getElementById('screenDimensionsDisplay').innerHTML =
      window.innerWidth + ' by ' + window.innerHeight;

    // Arrange for the display element to vanish after a brief period.
    clearTimeout(displayUpdateTimer);
    displayUpdateTimer = setTimeout(
      function() {
        document.getElementById('screenDimensionsDisplay').remove();
        displayUpdateTimer = null;
      },
      2 * 1000
    );
  } else {
    // If the display element does not exist, create a new one.
    let measurementElement = document.createElement('div');
    measurementElement.setAttribute('id', 'screenDimensionsDisplay');
    measurementElement.style.position = 'fixed';
    measurementElement.style.bottom = '0';
    measurementElement.style.right = '0';
    measurementElement.style.zIndex = '99999999';
    measurementElement.style.backgroundColor = '#000';
    measurementElement.style.color = '#fff';
    measurementElement.style.fontFamily = 'monospace';
    measurementElement.style.fontSize = '1.1em';
    measurementElement.style.lineHeight = '2rem';
    measurementElement.style.width = '8.5rem';
    measurementElement.style.textAlign = 'center';
    document.body.appendChild(measurementElement);
  }
};

/**
 * Executes the initial setup procedures for the application.
 */
const initializeDisplay = function() {
  let activateFeature = true;

  /* The user's preference dictates that the script should only operate
     if the developer tools panel is open and visible. */
  if (devToolsMode) {
    activateFeature = false;
    let minInspectorWidth = 750;
    let minInspectorHeight = 312;
    let diffWidth = window.outerWidth - window.innerWidth;
    let diffHeight = window.outerHeight - window.innerHeight;

    if (
      diffWidth >= minInspectorWidth ||
      diffHeight >= minInspectorHeight
    ) {
      activateFeature = true;
    }
  }

  // Proceed with monitoring the display if the feature is enabled.
  if (activateFeature) {
    displayMonitor();
  }
};

// Establish a listener for messages originating from the background script (e.g., global.html).
browserApp.self.addEventListener(
  'dataExchange',
  (eventObj) => {
    // Verify if the received data pertains to configuration parameters.
    if (eventObj.name === 'configParams') {
      devToolsMode = eventObj.message.devToolsOnly;
      sizeMonitoring = false;
      sizeMonitoring = window.addEventListener('resize', initializeDisplay);
    }
  },
  false
);

// Request the current configuration from the main application process.
browserApp.self.tab.dispatchMessage('retrieveConfiguration');
// Instruct the main application process to notify of any configuration updates.
browserApp.self.tab.dispatchMessage('listenForConfigChanges');