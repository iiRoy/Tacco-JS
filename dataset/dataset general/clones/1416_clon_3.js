// This script manages the setup and behavior of custom context menu entries
// within the browser environment. It specifically targets image-related actions
// for a Pinterest sharing workflow, ensuring robust configuration and user interaction.

/**
 * Encapsulates various configuration constants for the context menu item and sharing logic.
 * This object is frozen to prevent accidental modifications during runtime, promoting stability.
 * @namespace
 */
const AppConfiguration = Object.freeze({
  // The base URL for the Pinterest bookmarklet functionality. This endpoint initiates the pinning process.
  PINTEREST_SHARE_ENDPOINT: "https://pinterest.com/pin/create/bookmarklet/",
  // A default title used for the shared content if the browser tab's title is not available or empty.
  DEFAULT_SHARE_TITLE: "Web Image Share",
  // Default alternative text for the image, providing a fallback description for accessibility and context.
  DEFAULT_ALT_TEXT: "Pinnable Image",
  // The display text that appears on the context menu item in the browser.
  MENU_ITEM_DISPLAY_TEXT: "Pin This Image!",
  // An array of context types where this menu item should be visible. In this case, it's only for images.
  APPLICABLE_CONTEXTS: ["image"],
  // The desired width of the popup window that opens for the Pinterest sharing interface.
  POPUP_WIDTH: 635,
  // The desired height of the popup window for the Pinterest sharing interface.
  POPUP_HEIGHT: 290,
  // A boolean flag indicating whether the shared content is a video. Currently set to false for image pinning.
  IS_VIDEO_CONTEXT: false,
});

/**
 * Generates a unique name for the popup window. This prevents new windows from
 * reusing existing window names, ensuring each share action opens a distinct popup.
 * @returns {string} A dynamically generated, unique window name.
 */
function generateUniquePopupName() {
  const timestamp = Date.now(); // Current time in milliseconds.
  const randomSuffix = Math.random().toString(36).substring(2, 7); // A short, random alphanumeric string.
  return `pinterest_share_popup_${timestamp}_${randomSuffix}`;
}

/**
 * Constructs the comprehensive window features string required by the `window.open()` method.
 * This string dictates the appearance and behavior of the new popup window.
 * @param {number} width - The specified width for the new window.
 * @param {number} height - The specified height for the new window.
 * @returns {string} A comma-separated string of window features.
 */
function buildPopupWindowFeatures(width, height) {
  const features = {
    status: "no",         // Status bar visibility.
    resizable: "yes",     // Whether the window can be resized by the user.
    scrollbars: "yes",    // Whether scrollbars should be present if content overflows.
    personalbar: "no",    // Visibility of the personal bar (bookmarks bar).
    directories: "no",    // Visibility of the directories bar.
    location: "no",       // Visibility of the address bar.
    toolbar: "no",        // Visibility of the browser toolbar.
    menubar: "no",        // Visibility of the browser menu bar.
    width: width,         // The explicit width of the window.
    height: height,       // The explicit height of the window.
    left: 0,              // Initial horizontal position from the left edge of the screen.
    top: 0,               // Initial vertical position from the top edge of the screen.
  };

  // Converts the features object into a URL-encoded, comma-separated string.
  return Object.entries(features)
    .map(([key, value]) => `${key}=${value}`)
    .join(",");
}

/**
 * This function serves as the event handler for the context menu item click.
 * It is responsible for constructing the Pinterest sharing URL with all necessary parameters
 * and then opening this URL in a new, specially configured popup window.
 * @param {object} actionPayload - An object containing details about the context menu click event,
 *                                 such as the source URL of the clicked image (`srcUrl`).
 * @param {object} browserTabDetails - An object providing information about the active browser tab
 *                                     at the time of the click, including its URL and title.
 */
function handlePinActionClick(actionPayload, browserTabDetails) {
  // --- Input Validation and Guard Clauses ---
  // Ensure that essential data (image source URL and current tab URL) is present and valid.
  if (!actionPayload || typeof actionPayload.srcUrl !== 'string' || !actionPayload.srcUrl.trim()) {
    console.warn("Pin action aborted: The clicked image's source URL is missing or invalid.");
    return; // Exit early if critical information is absent.
  }
  if (!browserTabDetails || typeof browserTabDetails.url !== 'string' || !browserTabDetails.url.trim()) {
    console.warn("Pin action aborted: The current browser tab's URL is missing or invalid.");
    return; // Exit early if the tab's URL cannot be determined.
  }

  // --- URL Parameter Encoding ---
  // All URL components must be properly encoded to handle special characters and ensure valid URLs.
  // Using `encodeURIComponent` is crucial for this, replacing the deprecated `escape()` function.
  const encodedMediaUrl = encodeURIComponent(actionPayload.srcUrl);
  const encodedPageUrl = encodeURIComponent(browserTabDetails.url);
  // Prioritize the actual tab title, falling back to a default if it's unavailable.
  const encodedTitle = encodeURIComponent(browserTabDetails.title || AppConfiguration.DEFAULT_SHARE_TITLE);
  const encodedAlt = encodeURIComponent(AppConfiguration.DEFAULT_ALT_TEXT);

  // --- Pinterest Sharing URL Assembly ---
  // Construct the array of query parameters for the Pinterest bookmarklet URL.
  const queryParameters = [
    `media=${encodedMediaUrl}`,                     // The URL of the image to be pinned.
    `url=${encodedPageUrl}`,                        // The URL of the page where the image was found.
    `alt=${encodedAlt}`,                            // Alternative text for the image on Pinterest.
    `title=${encodedTitle}`,                        // The title for the pin.
    `is_video=${AppConfiguration.IS_VIDEO_CONTEXT}`,// Flag to indicate if the content is a video.
  ];

  // Combine the base endpoint with the assembled query parameters.
  const targetShareUrl = `${AppConfiguration.PINTEREST_SHARE_ENDPOINT}?${queryParameters.join('&')}`;

  // --- Popup Window Configuration and Opening ---
  const popupWindowName = generateUniquePopupName(); // Get a unique identifier for the new window.
  const popupFeatures = buildPopupWindowFeatures(AppConfiguration.POPUP_WIDTH, AppConfiguration.POPUP_HEIGHT); // Build the features string.

  // Attempt to open the new window within a try-catch block to handle potential browser security restrictions or errors.
  try {
    window.open(targetShareUrl, popupWindowName, popupFeatures);
  } catch (error) {
    console.error("An error occurred while attempting to open the Pinterest sharing window:", error);
    alert("The Pinterest sharing window could not be opened. Please ensure pop-ups are allowed for this site.");
  }
}

/**
 * Initializes or re-initializes the browser's custom context menu items.
 * This function first clears any existing menus to prevent duplicates and then
 * sets up the dedicated Pinterest image pinning action, ensuring a clean state.
 */
function configureBrowserContextActions() {
  // --- Environment Check ---
  // Verify that the Chrome contextMenus API is available in the current environment.
  // This is a critical check for extensions to ensure API functionality.
  if (typeof chrome === 'undefined' || !chrome.contextMenus) {
    console.error("Critical: Chrome contextMenus API not detected. Cannot configure browser actions.");
    return; // Abort if the API is not available.
  }

  // --- Cleanup Existing Menus ---
  // Remove all previously registered context menu items to guarantee a fresh setup.
  // A callback is used to handle potential errors during the removal process.
  chrome.contextMenus.removeAll(() => {
    if (chrome.runtime.lastError) {
      // Log an error if menu removal fails, but proceed as it might not be critical
      // (e.g., no menus existed to remove).
      console.error("Warning: Error encountered while removing existing context menus:", chrome.runtime.lastError.message);
    }

    // --- Create New Menu Item ---
    // Attempt to create the new Pinterest image pinning context menu item.
    try {
      const imagePinActionId = chrome.contextMenus.create({
        id: "pinterest_image_pin_action_v2", // A unique identifier for this specific menu item.
        title: AppConfiguration.MENU_ITEM_DISPLAY_TEXT, // The text displayed to the user.
        contexts: AppConfiguration.APPLICABLE_CONTEXTS, // The types of elements this menu applies to.
        onclick: handlePinActionClick, // The function to execute when the menu item is clicked.
      }, () => {
        // Callback to check for errors after the creation attempt.
        if (chrome.runtime.lastError) {
          console.error("Error creating the Pinterest context menu item:", chrome.runtime.lastError.message);
        } else {
          console.info("Pinterest image pinning context menu item successfully created with ID:", imagePinActionId);
        }
      });
    } catch (creationError) {
      // Catch any synchronous errors that might occur during the `chrome.contextMenus.create` call.
      console.error("An unexpected error occurred during the context menu creation process:", creationError);
    }
  });
}

// --- Initial Execution ---
// Immediately invoke the configuration function when the script loads.
// This ensures that the context menu is set up and ready for user interaction
// as soon as the browser extension becomes active.
configureBrowserContextActions();