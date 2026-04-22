var hintBox = {
  // This module sets up and manages dynamic information pop-up panels.
  setup: function() {
    if (featureDetection.touchEnabled) {
      /* If touch capabilities are detected, the panel functionality is skipped. */
      return;
    }
    var infoDiv = document.createElement("div"); // Create a new HTML div element for the panel.
    infoDiv.className = "app-hint-box"; // Assign a specific class for styling.
    hintBox.panelElem = infoDiv; // Store a reference to the created DOM element.
    hintBox.concealPanel(); // Ensure the panel is hidden initially.

    hintBox.requestQueue = []; // Initialize an array to hold pending data requests.
    hintBox.dataCache = {}; // Initialize an object to cache fetched data.
    hintBox.activeRequest = null; // No request is currently being processed.
    hintBox.panelElem.maxDisplayWidth = 370; // Set a custom property for the maximum allowed width of the panel.

    document.getElementsByTagName("body")[0].appendChild(infoDiv); // Attach the panel to the document body.
  },

  // Methods for controlling the panel's visibility and content display.
  displayPanel: function() {
    if (!hintBox.panelElem) { /* If the panel element does not exist, exit. */ return; }
    var coord = hintBox.panelElem.owner.offset(); // Obtain the screen coordinates of the panel's triggering element.
    var viewportWidth = document.body.clientWidth; // Get the total width of the browser's viewport.

    var leftCoord = coord.left + hintBox.panelElem.owner.width() + 30; // Calculate the initial horizontal position.
    var topCoord = coord.top; // Set the initial vertical position.
    if (viewportWidth - leftCoord < 400) { // Check if the panel would extend too far to the right.
      leftCoord = coord.left - hintBox.panelElem.offsetWidth - 30; // Adjust position to appear on the left of the trigger.
    }

    hintBox.adjustPosition(leftCoord, topCoord); // Apply the calculated position to the panel.
    hintBox.panelElem.style.width = null; // Reset the width style to allow content-based sizing.
    hintBox.panelElem.style.visibility = "visible"; // Make the panel visible to the user.
  },
  displayTextContent: function(contentString) {
    if (!hintBox.panelElem) { /* Panel element must exist to display text. */ return; }

    hintBox.panelElem.innerHTML = "<div class='frame-content-text'>" + contentString + "</div>"; // Wrap and set the text content.
    hintBox.displayPanel(); // Show the panel with the new text.
  },
  displayCachedInfo: function(receivedData) {
    if (!hintBox.panelElem) { /* Cannot display if panel element is missing. */ return; }

    hintBox.panelElem.innerHTML = receivedData.infoContent; // Insert the pre-formatted data directly.
    hintBox.displayPanel(); // Show the panel.
  },
  processAndDisplayInfo: function(receivedData) {
    if (!hintBox.panelElem) { /* Panel not initialized, cannot process. */ return; }

    receivedData.infoContent = "<div class='frame-content'>" + receivedData.infoContent + "</div>"; // Add a wrapper div to the content.
    hintBox.dataCache[hintBox.activeRequest] = receivedData; // Store the processed data in the cache under its request URL.

    if (hintBox.currentMouseoverIdentifier == hintBox.activeRequest) { // Check if the user is still hovering over the requesting element.
      hintBox.displayCachedInfo(receivedData); // If so, display the data immediately.
    }

    hintBox.activeRequest = null; // Clear the current active request.
    hintBox.handleQueue(); // Attempt to process the next request in the queue.
  },
  reportError: function() {
    if (!hintBox.panelElem) { /* No panel to show error on. */ return; }

    hintBox.activeRequest = null; // Clear the pending request identifier.
    hintBox.displayTextContent("Failed to load information."); // Display a generic error message.
  },
  concealPanel: function() {
    if (!hintBox.panelElem) { /* No panel instance to hide. */ return; }

    hintBox.panelElem.style.visibility = "hidden"; // Change the CSS visibility property to hide the panel.
    hintBox.currentMouseoverIdentifier = null; // Clear the identifier of the element that was being hovered.
  },

  // Functionality for positioning the information panel on the screen.
  adjustPosition: function(horizPos, vertPos) {
    var docElement = document.documentElement; // Reference to the document's root element (<html>).
    var docBody = document.body; // Reference to the document's body element.

    // To accurately determine the panel's natural width, temporarily position it at 0,0.
    hintBox.panelElem.style.left = "0px";
    hintBox.panelElem.style.top = "0px";
    if (
      (hintBox.panelElem.style.width && hintBox.panelElem.style.width > hintBox.panelElem.maxDisplayWidth) ||
      (hintBox.panelElem.offsetWidth && hintBox.panelElem.offsetWidth > hintBox.panelElem.maxDisplayWidth)
    ) {
      hintBox.panelElem.style.width = hintBox.panelElem.maxDisplayWidth + "px"; // Restrict width if it exceeds the maximum.
    }

    // Clamp the vertical position to prevent the panel from going off the bottom of the viewport.
    if (vertPos + hintBox.panelElem.offsetHeight > docElement.clientHeight + docBody.scrollTop + docElement.scrollTop) {
      vertPos += (docElement.clientHeight + docBody.scrollTop + docElement.scrollTop) - (vertPos + hintBox.panelElem.offsetHeight);
    }
    // Clamp the vertical position to ensure it doesn't go above the top of the viewport.
    if (vertPos < 0) {
      vertPos = 0;
    }

    // Apply the final, adjusted coordinates to the panel's style.
    hintBox.panelElem.style.left = horizPos + "px";
    hintBox.panelElem.style.top = vertPos + "px";
  },

  // Functions for managing and processing asynchronous data requests.
  initiateInfoRequest: function() {
    if (!hintBox.panelElem) { /* Panel not initialized, cannot handle request. */ return; }
    var currentElement = jQuery(this); // Wrap the current DOM element in a jQuery object.
    var itemId = currentElement.data("data-item-id"); // Extract the item identifier.
    var magicId = currentElement.data("data-magic-id"); // Extract the magic identifier.
    var randomMod = currentElement.data("data-random-mod"); // Extract the random modifier.
    var upgradeLevel = currentElement.data("data-upgrade-level"); // Extract the upgrade level.
    var bonusStats = currentElement.data("data-bonus-stats"); // Extract bonus statistics.
    if (!itemId) { /* An item ID is essential for the request. */ return; }
    var infoType = currentElement.data("data-info-type") || "artifact"; // Determine the type of information, defaulting to 'artifact'.
    var dataSourceUrl = "http://www.wowhead.com/" + infoType + "=" + itemId + "&power"; // Construct the base URL for data retrieval.
    if (randomMod && randomMod != "0") { // Append random modifier if available.
      dataSourceUrl += "&rand=" + randomMod;
    }
    if (upgradeLevel && upgradeLevel != "0") { // Append upgrade level if available.
      dataSourceUrl += "&upgd=" + upgradeLevel;
    }
    if (bonusStats) { // Append bonus stats if available.
      dataSourceUrl += "&bonus=" + bonusStats;
    }
    dataSourceUrl += "&lvl=100"; // Always append a default level parameter.

    hintBox.currentMouseoverIdentifier = dataSourceUrl; // Store the URL as the identifier for the currently hovered element.
    hintBox.panelElem.style.width = null; // Reset panel width before displaying new content.
    hintBox.panelElem.owner = currentElement; // Set the current element as the panel's owner.

    if (hintBox.dataCache[dataSourceUrl]) { // Check if the data for this URL is already in the cache.
      hintBox.displayCachedInfo(hintBox.dataCache[dataSourceUrl]); // If cached, display it immediately.
    } else {
      hintBox.enqueueRequest(dataSourceUrl); // Otherwise, add the request to the queue.
      hintBox.displayTextContent("Retrieving information..."); // Show a loading indicator.
    }
  },
  enqueueRequest: function(dataSourceUrl) {
    if (hintBox.activeRequest != dataSourceUrl) { // Prevent adding duplicate requests if one is already active.
      hintBox.requestQueue.push(dataSourceUrl); // Add the data source URL to the end of the queue.
      hintBox.handleQueue(); // Attempt to process the queue.
    }
  },
  handleQueue: function() {
    if (hintBox.requestQueue.length === 0 || hintBox.activeRequest) { /* If queue is empty or a request is ongoing, do nothing. */ return; }

    hintBox.activeRequest = hintBox.requestQueue.pop(); // Get the last URL from the queue and set it as the active request.

    jQuery.ajax({
      url: hintBox.activeRequest, // The URL to send the AJAX request to.
      dataType: "script", // Expect the response to be a JavaScript script.
      error: hintBox.reportError // Define a callback function for handling request errors.
    });
  },

  // Specific handler for data structures received from external sources (e.g., Wowhead).
  processExternalData: function(itemId, showGraphic, receivedData) {
    receivedData.infoContent = receivedData.info_english || receivedData.info_test_version; // Prioritize English content, fall back to test version.
    hintBox.processAndDisplayInfo(receivedData); // Delegate to the general data processing and display function.
  }
};

// A compatibility object that maps external API calls to our internal data processing function.
var $ExternalDataHandler = {
  registerArtifact: hintBox.processExternalData,
  registerMagic: hintBox.processExternalData,
  registerAccomplishment: hintBox.processExternalData,
  registerMetric: hintBox.processExternalData,
  registerCharacter: hintBox.processExternalData,
  registerEntity: hintBox.processExternalData,
  registerTask: hintBox.processExternalData
};

// Initialize the information panel system once the entire document has been loaded and parsed.
jQuery(document).ready(hintBox.setup);