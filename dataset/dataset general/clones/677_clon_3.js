const tooltipManager = (() => {
  // Internal state variables for the tooltip system
  let uiDisplayElement = null; // The DOM element for the tooltip
  let requestQueue = [];       // Queue for pending tooltip data requests
  let dataCache = new Map();   // Cache for storing fetched tooltip data
  let activeRequestUrl = null; // URL of the currently processing request
  let hoveredItemUrl = null;   // URL associated with the currently hovered element
  let isSystemInitialized = false; // Flag to ensure single initialization

  // Configuration constants for tooltip behavior and appearance
  const MAX_TOOLTIP_WIDTH_PX = 370;
  const TOOLTIP_OFFSET_PX = 30; // Horizontal distance from owner element
  const MIN_RIGHT_SPACE_PX = 400; // Minimum space required on the right to avoid flipping tooltip to the left
  const DEFAULT_LOAD_MESSAGE = "Fetching content...";
  const ERROR_LOAD_MESSAGE = "Failed to load content.";
  const WRAPPER_CLASS = "border"; // CSS class for tooltip content border
  const TEXT_CLASS = "text";     // CSS class for plain text content

  /**
   * Initializes the tooltip display system: creates the display element,
   * sets up its initial properties, and attaches it to the document body.
   * Prevents re-initialization if already active.
   */
  function initializeDisplay() {
    if (isSystemInitialized) {
      console.warn("Tooltip system already initialized. Skipping.");
      return;
    }

    // Check for touch devices using Modernizr (if available) to opt-out
    if (typeof Modernizr !== 'undefined' && Modernizr.touch) {
      console.info("Touch device detected; tooltip functionality disabled.");
      return;
    }

    // Ensure the document body is available before appending elements
    if (!document.body) {
      console.error("Document body not found. Cannot initialize tooltip.");
      return;
    }

    // Create the main tooltip container element
    const newDisplayDiv = document.createElement("div");
    newDisplayDiv.className = "ea-custom-tooltip"; // Unique class name for styling
    newDisplayDiv.style.maxWidth = `${MAX_TOOLTIP_WIDTH_PX}px`; // Set maximum width
    newDisplayDiv.style.position = "absolute"; // Essential for positioning
    newDisplayDiv.style.pointerEvents = "none"; // Tooltip should not intercept mouse events

    uiDisplayElement = newDisplayDiv;
    hideDisplay(); // Initially hide the tooltip

    // Reset internal state variables
    requestQueue = [];
    dataCache = new Map();
    activeRequestUrl = null;
    hoveredItemUrl = null;

    document.body.appendChild(uiDisplayElement); // Append to the body
    isSystemInitialized = true;
    console.log("Tooltip system successfully initialized.");
  }

  /**
   * Makes the tooltip visible and calculates its optimal position
   * relative to its owner element, adjusting for viewport boundaries.
   */
  function revealDisplay() {
    if (!uiDisplayElement || !uiDisplayElement.owner) {
      console.warn("Cannot reveal display: UI element or owner reference is missing.");
      return;
    }

    const ownerElement = uiDisplayElement.owner;
    // Get the owner element's position relative to the document
    const ownerPosition = getElementOffset(ownerElement);

    const viewportWidth = document.documentElement.clientWidth || document.body.clientWidth;

    let calculatedLeft = ownerPosition.left + ownerElement.offsetWidth + TOOLTIP_OFFSET_PX;
    let calculatedTop = ownerPosition.top;

    // Logic to flip the tooltip to the left side if there's insufficient space on the right
    const spaceRemainingRight = viewportWidth - calculatedLeft;
    if (spaceRemainingRight < MIN_RIGHT_SPACE_PX) {
      calculatedLeft = ownerPosition.left - uiDisplayElement.offsetWidth - TOOLTIP_OFFSET_PX;
      // Fallback: If flipping left makes it go off-screen left, revert to right side
      if (calculatedLeft < 0) {
        calculatedLeft = ownerPosition.left + ownerElement.offsetWidth + TOOLTIP_OFFSET_PX;
      }
    }

    positionDisplay(calculatedLeft, calculatedTop); // Apply the calculated position
    uiDisplayElement.style.visibility = "visible";
    uiDisplayElement.style.width = ''; // Reset width to allow content to dictate its size dynamically
  }

  /**
   * Updates the tooltip's inner HTML with plain text wrapped in a styled container
   * and then makes the tooltip visible.
   * @param {string} message - The text content to be displayed.
   */
  function displayMessage(message) {
    if (!uiDisplayElement) {
      return;
    }
    const safeMessage = message || ''; // Ensure message is not null or undefined
    uiDisplayElement.innerHTML = `<div class='${WRAPPER_CLASS} ${TEXT_CLASS}'>${safeMessage}</div>`;
    revealDisplay();
  }

  /**
   * Displays pre-cached tooltip content (HTML string) directly.
   * @param {object} cachedData - An object containing the 'tooltip' HTML string.
   */
  function presentCachedContent(cachedData) {
    if (!uiDisplayElement || !cachedData || !cachedData.tooltip) {
      console.warn("Cannot present cached content: Invalid UI element or data provided.");
      return;
    }
    uiDisplayElement.innerHTML = cachedData.tooltip;
    revealDisplay();
  }

  /**
   * Processes newly fetched tooltip data: wraps it with styling, caches it,
   * and displays it if it corresponds to the currently hovered item.
   * @param {object} incomingData - The data object containing the raw tooltip HTML.
   */
  function processAndDisplayData(incomingData) {
    if (!uiDisplayElement || !incomingData || !incomingData.tooltip) {
      console.warn("Cannot process and display data: UI element or incoming data is invalid.");
      return;
    }

    // Wrap the raw tooltip HTML with a styling div
    const styledTooltipHtml = `<div class='${WRAPPER_CLASS}'>${incomingData.tooltip}</div>`;
    incomingData.tooltip = styledTooltipHtml; // Update the data object with the styled content

    // Store the processed data in the cache using the active request URL as key
    if (activeRequestUrl) {
      dataCache.set(activeRequestUrl, incomingData);
    } else {
      console.warn("No active request URL to associate with cached data.");
    }

    // Only display if the fetched data matches the currently hovered item's URL
    if (hoveredItemUrl === activeRequestUrl) {
      presentCachedContent(incomingData);
    } else {
      // If the user has moved their mouse, hide the tooltip as it's no longer relevant
      concealDisplay();
    }

    activeRequestUrl = null; // Clear the active request URL as it's now handled
    handleRequestQueue(); // Process the next item in the queue
  }

  /**
   * Displays a generic error message within the tooltip.
   */
  function signalError() {
    if (!uiDisplayElement) {
      return;
    }
    activeRequestUrl = null; // Clear active request even if it failed
    displayMessage(ERROR_LOAD_MESSAGE);
    handleRequestQueue(); // Continue processing the queue
  }

  /**
   * Hides the tooltip display from view and clears associated references.
   */
  function concealDisplay() {
    if (!uiDisplayElement) {
      return;
    }
    uiDisplayElement.style.visibility = "hidden";
    hoveredItemUrl = null; // Clear the URL of the item that was hovered
    uiDisplayElement.owner = null; // Clear owner reference to prevent memory leaks
  }

  /**
   * Sets the absolute position of the tooltip element on the screen,
   * applying clamping logic to keep it within the visible viewport.
   * @param {number} targetX - The desired X coordinate.
   * @param {number} targetY - The desired Y coordinate.
   */
  function positionDisplay(targetX, targetY) {
    if (!uiDisplayElement) {
      return;
    }

    const docElement = document.documentElement;
    const docBody = document.body;

    // Calculate current viewport dimensions and scroll offsets
    const viewportHeight = docElement.clientHeight;
    const scrollYOffset = docBody.scrollTop + docElement.scrollTop;
    const scrollXOffset = docBody.scrollLeft + docElement.scrollLeft;

    // Temporarily position at 0,0 to get accurate width/height measurements
    // without current position affecting layout calculations.
    uiDisplayElement.style.left = "0px";
    uiDisplayElement.style.top = "0px";
    // Adjust tooltip width if it exceeds the max width
    if (uiDisplayElement.offsetWidth > MAX_TOOLTIP_WIDTH_PX) {
      uiDisplayElement.style.width = `${MAX_TOOLTIP_WIDTH_PX}px`;
    } else {
      uiDisplayElement.style.width = ''; // Allow natural width if it's within limits
    }

    let finalX = targetX;
    let finalY = targetY;

    // Re-measure tooltip dimensions after potential width adjustment
    const tooltipWidth = uiDisplayElement.offsetWidth;
    const tooltipHeight = uiDisplayElement.offsetHeight;

    // Clamp Y position to ensure it stays within the viewport
    const bottomEdge = finalY + tooltipHeight;
    const viewportBottom = viewportHeight + scrollYOffset;
    if (bottomEdge > viewportBottom) {
      finalY -= (bottomEdge - viewportBottom); // Move up by the overflow amount
    }
    // Ensure it doesn't go above the top of the viewport
    if (finalY < scrollYOffset) {
      finalY = scrollYOffset;
    }

    // Clamp X position to ensure it stays within the viewport
    const rightEdge = finalX + tooltipWidth;
    const viewportRight = docElement.clientWidth + scrollXOffset;
    if (rightEdge > viewportRight) {
      finalX -= (rightEdge - viewportRight); // Move left by the overflow amount
    }
    // Ensure it doesn't go left of the viewport
    if (finalX < scrollXOffset) {
      finalX = scrollXOffset;
    }

    // Apply the final clamped position
    uiDisplayElement.style.left = `${finalX}px`;
    uiDisplayElement.style.top = `${finalY}px`;
  }

  /**
   * Prepares and initiates a tooltip data request based on the data attributes
   * of the element that triggered the hover event.
   * @param {HTMLElement} element - The DOM element whose data attributes will be used.
   */
  function prepareTooltipRequest(element) {
    if (!uiDisplayElement || !element) {
      console.warn("Cannot prepare request: UI element or target element is missing.");
      return;
    }

    // Use jQuery's data() method to retrieve attributes, mimicking original behavior
    const $target = $(element);
    const elementData = $target.data();

    const itemId = elementData.tooltipId;
    if (!itemId) {
      concealDisplay(); // If no ID, hide any active tooltip
      return;
    }

    const itemType = elementData.tooltipType || "item";
    const itemRand = elementData.tooltipRand || "0";
    const itemUpgd = elementData.tooltipUpgd || "0";
    const itemBonus = elementData.tooltipBonus;
    // itemSpellId from original is noted but not used in URL construction here

    // Construct the Wowhead API URL using template literals
    let requestUrl = `http://www.wowhead.com/${itemType}=${itemId}&power`;

    if (itemRand !== "0") {
      requestUrl += `&rand=${itemRand}`;
    }
    if (itemUpgd !== "0") {
      requestUrl += `&upgd=${itemUpgd}`;
    }
    if (itemBonus) {
      requestUrl += `&bonus=${itemBonus}`;
    }
    requestUrl += "&lvl=100"; // Always include a default level parameter

    hoveredItemUrl = requestUrl; // Store the URL for the currently hovered item
    uiDisplayElement.owner = element; // Link the tooltip to its owner element

    // Check if the requested data is already in the cache
    if (dataCache.has(requestUrl)) {
      presentCachedContent(dataCache.get(requestUrl));
    } else {
      enqueueRequest(requestUrl); // Add to the queue if not cached
      displayMessage(DEFAULT_LOAD_MESSAGE); // Show a loading indicator
    }
  }

  /**
   * Adds a URL to the request queue if it's not already being processed or queued.
   * @param {string} url - The URL for the tooltip data to be fetched.
   */
  function enqueueRequest(url) {
    if (!url || typeof url !== 'string') {
      console.error("Invalid URL provided for enqueueRequest.");
      return;
    }
    // Prevent duplicate requests: check if URL is currently active or already in queue
    if (activeRequestUrl !== url && !requestQueue.includes(url)) {
      requestQueue.push(url);
      handleRequestQueue(); // Attempt to process the queue immediately
    }
  }

  /**
   * Processes the next request in the queue if no request is currently active.
   * Uses a FIFO (First-In, First-Out) approach.
   */
  function handleRequestQueue() {
    if (requestQueue.length === 0 || activeRequestUrl) {
      return; // Nothing to process or a request is already active
    }

    // Get the next URL from the front of the queue
    const nextUrl = requestQueue.shift();
    if (!nextUrl) {
      return; // Should not happen if queue length > 0
    }

    activeRequestUrl = nextUrl; // Mark this URL as the one currently being processed

    $.ajax({
      url: activeRequestUrl,
      dataType: "script", // Expects a script that calls a global callback function
      success: function() {
        // Data processing happens via the global callback (e.g., whIntegration.registerItem)
        // No explicit success handling needed here, as the script itself triggers the next step.
      },
      error: signalError, // Handle any AJAX request errors
      timeout: 10000 // Set a timeout for the request to prevent indefinite loading
    });
  }

  /**
   * Helper function to determine an element's position relative to the document.
   * This provides similar functionality to jQuery's .offset().
   * @param {HTMLElement} element - The DOM element to query.
   * @returns {{left: number, top: number}} The offset coordinates.
   */
  function getElementOffset(element) {
    if (!element || typeof element.getBoundingClientRect !== 'function') {
      return { left: 0, top: 0 };
    }
    const rect = element.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return {
      top: rect.top + scrollTop,
      left: rect.left + scrollLeft
    };
  }

  /**
   * Callback function for Wowhead's data registration. This function is designed
   * to be called by scripts loaded from Wowhead. It extracts the relevant tooltip
   * content and triggers the display process.
   * @param {number} id - The ID of the item/spell/etc. (unused in this clone, but part of Wowhead signature).
   * @param {boolean} showIcon - Whether to show an icon (unused in this clone).
   * @param {object} whData - The data object provided by Wowhead, typically containing 'tooltip_enus'.
   */
  function ingestWowheadData(id, showIcon, whData) {
    if (!whData) {
      console.error("No Wowhead data provided for ingestion.");
      signalError();
      return;
    }

    // Prioritize English tooltip, then beta, then a generic 'tooltip' property
    const contentKey = whData.tooltip_enus ? 'tooltip_enus' : (whData.tooltip_beta ? 'tooltip_beta' : 'tooltip');
    const tooltipContent = whData[contentKey];

    if (!tooltipContent) {
      console.warn(`No suitable tooltip content found in Wowhead data for ID: ${id}`);
      signalError();
      return;
    }

    // Create a new object to match the expected structure for processAndDisplayData
    const processedData = { tooltip: tooltipContent };
    processAndDisplayData(processedData);
  }

  // Expose public methods of the tooltipManager via the returned object
  return {
    init: initializeDisplay,
    request: prepareTooltipRequest,
    hide: concealDisplay,
    // Expose the Wowhead integration callback for external scripts
    whCallback: ingestWowheadData
  };
})();

// Global object for integrating with Wowhead's data registration system.
// Each property maps to the central Wowhead callback function within the tooltipManager.
const whIntegration = {
  registerItem: tooltipManager.whCallback,
  registerSpell: tooltipManager.whCallback,
  registerAchievement: tooltipManager.whCallback,
  registerStatistic: tooltipManager.whCallback,
  registerNpc: tooltipManager.whCallback,
  registerObject: tooltipManager.whCallback,
  registerQuest: tooltipManager.whCallback
};

// Initialize the tooltip system once the DOM is fully loaded.
// This assumes jQuery is available, mirroring the original code's dependency.
$(document).ready(tooltipManager.init);

/*
// Alternative for native DOMContentLoaded if jQuery is not a hard dependency:
document.addEventListener('DOMContentLoaded', () => {
  tooltipManager.init();
});
*/