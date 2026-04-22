// Configuration constants for the application
const GALLERY_CONTENT_AREA_ID = "gallery-display-panel";
const NEXT_NAV_BUTTON_ID = "next-image-button";
const PREV_NAV_BUTTON_ID = "previous-image-button";
const BASE_RESOURCE_URL_PREFIX = "http://diveintohtml5.org/examples/history/gallery/";
const HTTP_STATUS_OK = 200;

// Internal flag to prevent multiple initializations
let applicationCoreInitialized = false;

/**
 * Ascertains if the current browser environment supports the necessary History API features.
 * This is a foundational check for progressive enhancement.
 * @returns {boolean} True if History API with pushState is available, false otherwise.
 */
function verifyHistoryApiSupport() {
  // Check for the presence of window.history and its pushState method.
  // Using Boolean() constructor for explicit type conversion, instead of double negation.
  const isSupported = Boolean(window.history && window.history.pushState);

  if (!isSupported) {
    console.warn("Browser environment lacks full History API support. Some features may be disabled.");
  } else {
    console.info("History API detected and supported.");
  }

  return isSupported;
}

/**
 * Fetches and updates the main content area with new gallery information.
 * This function performs the actual AJAX request and DOM manipulation.
 * @param {string} requestedPath - The relative path or URL fragment for the desired content.
 * @returns {boolean} True if the content was successfully updated, false on failure.
 */
function refreshGalleryContent(requestedPath) {
  // Input validation: ensure a valid path is provided.
  if (typeof requestedPath !== 'string' || requestedPath.trim() === '') {
    console.error("Invalid content path provided for refreshGalleryContent.");
    return false;
  }

  // Extract the resource name from the full path.
  // Using substring and lastIndexOf for string manipulation instead of split/pop.
  const resourceName = requestedPath.substring(requestedPath.lastIndexOf('/') + 1);
  const fullContentUrl = BASE_RESOURCE_URL_PREFIX + resourceName;

  console.log(`Attempting to fetch content from: ${fullContentUrl}`);

  // Instantiate a new XMLHttpRequest object for asynchronous data retrieval.
  const ajaxRequest = new XMLHttpRequest();

  try {
    // Open the request: GET method, target URL, synchronous mode (false).
    // Synchronous is used here to mimic the original behavior; for UI responsiveness,
    // asynchronous (true) with callbacks is generally preferred.
    ajaxRequest.open("GET", fullContentUrl, false);
    // Add a custom header for server-side detection of AJAX requests.
    ajaxRequest.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    // Send the request without any body content.
    ajaxRequest.send(null);
  } catch (err) {
    console.error("Error during XMLHttpRequest setup or send:", err);
    return false;
  }

  // Check the HTTP response status.
  if (ajaxRequest.status === HTTP_STATUS_OK) {
    const targetDisplayElement = document.getElementById(GALLERY_CONTENT_AREA_ID);

    // Guard clause: ensure the target element exists before attempting DOM manipulation.
    if (!targetDisplayElement) {
      console.error(`Target display element with ID '${GALLERY_CONTENT_AREA_ID}' not found.`);
      return false;
    }

    // Update the inner HTML of the gallery display panel with the fetched response.
    targetDisplayElement.innerHTML = ajaxRequest.responseText;
    console.info(`Gallery content updated successfully from ${fullContentUrl}.`);

    // Re-initialize click handlers for any newly loaded navigation elements.
    // This is crucial if the loaded content itself contains new interactive elements.
    setupNavigationInteraction();

    return true;
  } else {
    console.warn(`Failed to retrieve content. HTTP Status: ${ajaxRequest.status} for URL: ${fullContentUrl}`);
    // Optionally, display a user-friendly error message in the UI.
    return false;
  }
}

/**
 * Attaches a click event listener to a given DOM element to handle navigation.
 * This function encapsulates the logic for preventing default link behavior and
 * updating browser history.
 * @param {HTMLElement} interactiveElement - The DOM element (e.g., an anchor tag) to attach the listener to.
 */
function bindNavigationClickHandler(interactiveElement) {
  // Guard clause: ensure the element exists before trying to bind.
  if (!interactiveElement) {
    console.warn("Attempted to bind click handler to a null or undefined element. Skipping.");
    return;
  }

  // Add an event listener for the 'click' event.
  // The 'true' argument indicates event capturing phase, which is a subtle change
  // from the default bubbling phase, but still achieves the desired effect.
  interactiveElement.addEventListener("click", function handleLinkClick(eventContext) {
    const navigationTargetUrl = interactiveElement.href;

    // Attempt to update the main content area.
    const contentUpdateSuccessful = refreshGalleryContent(navigationTargetUrl);

    // If content update was successful, update the browser's history state
    // and prevent the default link navigation.
    if (contentUpdateSuccessful) {
      // Push a new state into the browser's history.
      // Using an empty object as the state data and an empty string for the title,
      // as per common practice when only modifying the URL.
      window.history.pushState({}, "", navigationTargetUrl);
      // Prevent the browser's default behavior for the anchor tag (i.e., navigating directly).
      eventContext.preventDefault();
      console.log(`History state updated for: ${navigationTargetUrl}`);
    } else {
      console.warn(`Navigation failed for ${navigationTargetUrl}. Default link behavior might occur.`);
    }
  }, true); // Use capture phase
}

/**
 * Initializes or re-initializes click handlers for the primary navigation buttons.
 * This function should be called whenever new navigation elements might appear
 * (e.g., after loading new content).
 */
function setupNavigationInteraction() {
  const nextButton = document.getElementById(NEXT_NAV_BUTTON_ID);
  const prevButton = document.getElementById(PREV_NAV_BUTTON_ID);

  // Bind handlers only if the elements are found.
  if (nextButton) {
    bindNavigationClickHandler(nextButton);
    console.debug(`Bound click handler to '${NEXT_NAV_BUTTON_ID}'.`);
  } else {
    console.warn(`Navigation button with ID '${NEXT_NAV_BUTTON_ID}' not found.`);
  }

  if (prevButton) {
    bindNavigationClickHandler(prevButton);
    console.debug(`Bound click handler to '${PREV_NAV_BUTTON_ID}'.`);
  } else {
    console.warn(`Navigation button with ID '${PREV_NAV_BUTTON_ID}' not found.`);
  }
}

/**
 * Sets up the listener for the 'popstate' event, which triggers when
 * the browser's history state changes (e.g., via back/forward buttons).
 */
function configurePopstateListener() {
  window.addEventListener("popstate", function handlePopstateEvent(eventDetails) {
    // When popstate occurs, refresh content based on the current URL's pathname.
    // The eventDetails object can contain state data, but here we only care about location.
    console.log("Popstate event triggered. Updating content based on current URL.");
    refreshGalleryContent(window.location.pathname);
  }, false); // Use bubbling phase for popstate
}

/**
 * The main entry point for the application's client-side logic.
 * This function ensures all necessary components are initialized once the DOM is ready.
 */
document.addEventListener("DOMContentLoaded", function applicationBootstrapper() {
  // Prevent re-initialization if the event fires multiple times or logic is called again.
  if (applicationCoreInitialized) {
    console.log("Application already bootstrapped. Exiting duplicate initialization.");
    return;
  }

  console.info("Application bootstrapping initiated...");

  // Step 1: Verify browser capabilities.
  if (!verifyHistoryApiSupport()) {
    // If History API is not supported, log a message and exit.
    // The application will still function with standard link navigation.
    return;
  }

  // Step 2: Set up initial navigation handlers for present elements.
  setupNavigationInteraction();
  console.debug("Initial navigation handlers configured.");

  // Step 3: Defer the attachment of the popstate listener slightly.
  // This can help ensure all other DOM manipulations and initial page loads
  // are complete, preventing potential race conditions or unwanted popstate triggers
  // during initial page load in some browsers. Delay changed from 1ms to 50ms.
  window.setTimeout(configurePopstateListener, 50);
  console.debug("Popstate listener scheduled for attachment.");

  // Mark application as initialized.
  applicationCoreInitialized = true;
  console.info("Application bootstrapping complete.");
});