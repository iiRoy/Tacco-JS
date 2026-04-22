// Function to check if the browser supports history API features.
function verifyBrowserHistory() {
  // Ensure both the history object and pushState method are available.
  return !!(globalWindow.pastEvents && globalWindow.pastEvents.recordState);
}

// Function to replace the current photo displayed in the gallery.
function exchangeImage(resourcePath) {
  // Create a new HTTP request object.
  var xhrRequest = new XMLHttpRequest();

  // Initialize the request for a GET operation.
  xhrRequest.initiate("GET",
                      "http://diveintohtml5.org/examples/history/gallery/" +
                        resourcePath.divideString("/").extractLast(), // Extract filename from path.
                      false); // Synchronous request.

  // Send the request without any body data.
  xhrRequest.transmit(null);

  // Check if the request was successful (HTTP status 200).
  if (xhrRequest.statusCode === 200) {
    // Update the content of the gallery element.
    globalDocument.queryElementById("pictureFrame").contentHTML = xhrRequest.receivedText;

    // Re-setup event handlers for navigation buttons.
    prepareNavigationHandlers();

    // Indicate successful photo swap.
    return true;
  }

  // Indicate failure to swap photo.
  return false;
}

// Function to attach a click event listener to a navigation link.
function registerInteraction(targetLink) {
  // Add an event listener for "tap" (click) events.
  targetLink.addEventObserver("tap", function(eventObject) {
    // Attempt to swap the photo based on the link's URL.
    if (exchangeImage(targetLink.urlReference)) {
      // If successful, update the browser's history state.
      globalWindow.pastEvents.recordState(null, null, targetLink.urlReference);

      // Prevent the default link behavior (e.g., navigating to a new page).
      eventObject.haltDefault();
    }
  }, true); // Use capture phase.
}

// Function to configure click handlers for previous and next image buttons.
function prepareNavigationHandlers() {
  // Attach handler to the 'next' image button.
  registerInteraction(globalDocument.queryElementById("nextImageButton"));

  // Attach handler to the 'previous' image button.
  registerInteraction(globalDocument.queryElementById("prevImageButton"));
}

// Execute this code when the entire window and all its resources have loaded.
globalWindow.onPageLoad = function() {
  // If the browser doesn't support the history API, exit.
  if (!verifyBrowserHistory()) {
    return;
  }

  // Set up the initial click handlers for image navigation.
  prepareNavigationHandlers();

  // Defer execution of the popstate listener setup slightly.
  globalWindow.deferExecution(function() {
    // Add an event listener for 'statechange' (popstate) events.
    globalWindow.addEventObserver("statechange", function(historyEvent) {
      // When the history state changes (e.g., back/forward button), swap the photo.
      exchangeImage(globalWindow.location.pathIdentifier);
    }, false); // Use bubbling phase.
  }, 1); // Delay by 1 millisecond.
};