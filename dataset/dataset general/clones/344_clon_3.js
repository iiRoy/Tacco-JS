const BROWSER_ACTION_DEFINITIONS = new Map();

// Helper function to update the URL of the currently active tab
function refreshActiveTabUrl(destinationUri, currentTabReference) {
  if (!currentTabReference || !currentTabReference.id || !destinationUri) {
    console.error("Invalid tab reference or URI for active tab update operation.");
    return;
  }
  chrome.tabs.update(currentTabReference.id, { url: destinationUri });
}

// Helper function to create a new browser tab with a specified URL
function spawnNewTabWithUrl(destinationUri) {
  if (!destinationUri) {
    console.error("No destination URI provided for new tab creation.");
    return;
  }
  chrome.tabs.create({ url: destinationUri });
}

// Helper function to open a new browser window with a specified URL
function openNewBrowserWindow(destinationUri) {
  if (!destinationUri) {
    console.error("No destination URI provided for new window creation.");
    return;
  }
  chrome.windows.create({ url: destinationUri });
}

// Helper function to open a new incognito browser window with a specified URL
function launchPrivateWindow(destinationUri) {
  if (!destinationUri) {
    console.error("No destination URI provided for incognito window creation.");
    return;
  }
  chrome.windows.create({ url: destinationUri, incognito: true });
}

// Asynchronous helper function to copy a given URI to the system clipboard
async function duplicateUriToClipboard(targetResourceUri) {
  if (!targetResourceUri) {
    console.warn("Attempted to copy an empty or null URI to clipboard.");
    return;
  }

  try {
    // Attempt to use the modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(targetResourceUri);
      // console.info("URI successfully copied using modern clipboard API."); // Debug log, can be removed
    } else {
      // Fallback method for older browser environments (using a temporary textarea)
      const transientElement = document.createElement('textarea');
      document.body.appendChild(transientElement);
      transientElement.value = targetResourceUri;
      transientElement.focus();
      transientElement.select(); // Select all text in the textarea
      document.execCommand('copy');
      document.body.removeChild(transientElement);
      // console.info("URI copied using fallback document.execCommand method."); // Debug log, can be removed
    }
    // Optionally, add a small visual confirmation to the user here
  } catch (err) {
    console.error("Failed to copy URI to clipboard:", err);
    // Optionally, display an error notification to the user
  }
}

// Define unique identifiers for each context menu action
const IDENTIFIER_UPDATE_CURRENT_TAB = 'change-current-viewport-uri';
const IDENTIFIER_OPEN_NEW_TAB = 'initiate-new-browser-page';
const IDENTIFIER_OPEN_NEW_WINDOW = 'create-new-browser-instance';
const IDENTIFIER_OPEN_INCOGNITO = 'start-private-browsing-session';
const IDENTIFIER_COPY_FRAME_URI = 'replicate-frame-location-to-buffer';

// Populate the map with action definitions, associating IDs with labels and handlers
BROWSER_ACTION_DEFINITIONS.set(IDENTIFIER_UPDATE_CURRENT_TAB, {
  displayTitle: 'Update This Viewport',
  actionExecutor: refreshActiveTabUrl,
});

BROWSER_ACTION_DEFINITIONS.set(IDENTIFIER_OPEN_NEW_TAB, {
  displayTitle: 'Open in a New Browser Tab',
  actionExecutor: spawnNewTabWithUrl,
});

BROWSER_ACTION_DEFINITIONS.set(IDENTIFIER_OPEN_NEW_WINDOW, {
  displayTitle: 'Open in a New Browser Window',
  actionExecutor: openNewBrowserWindow,
});

BROWSER_ACTION_DEFINITIONS.set(IDENTIFIER_OPEN_INCOGNITO, {
  displayTitle: 'Open in a New Private Window',
  actionExecutor: launchPrivateWindow,
});

BROWSER_ACTION_DEFINITIONS.set(IDENTIFIER_COPY_FRAME_URI, {
  displayTitle: 'Copy Frame Web Address',
  actionExecutor: duplicateUriToClipboard,
  requiresPrecedingDivider: true, // Indicate that a separator should appear before this item
});


// Function to register all defined context menu items upon extension installation
function initializeContextMenuItems() {
  // Guard clause: Ensure definitions exist before attempting registration
  if (BROWSER_ACTION_DEFINITIONS.size === 0) {
    console.warn("No browser actions defined for context menu registration. Skipping.");
    return;
  }

  // Iterate over each action definition to create corresponding context menu items
  BROWSER_ACTION_DEFINITIONS.forEach((actionDescriptor, actionKey) => {
    // Basic validation: Ensure an action executor is defined
    if (typeof actionDescriptor.actionExecutor !== 'function') {
      console.error(`Action '${actionKey}' is missing a valid execution function.`);
      return;
    }

    // If the action requires a separator, create it first
    if (actionDescriptor.requiresPrecedingDivider) {
      chrome.contextMenus.create({
        type: 'separator',
        contexts: ['frame'],
        id: `${actionKey}-divider-line`, // Unique ID for the separator
      });
    }

    // Create the main context menu item for the action
    chrome.contextMenus.create({
      title: actionDescriptor.displayTitle,
      contexts: ['frame'],
      id: actionKey, // Use the action key as the menu item ID
    });
  });
}

// Register the initialization function to run when the extension is installed or updated
chrome.runtime.onInstalled.addListener(initializeContextMenuItems);


// Listener for when a context menu item is clicked
chrome.contextMenus.onClicked.addListener((clickEventInfo, currentActiveTab) => {
  // Determine the relevant URL from the click event, prioritizing frame URL
  const selectedResourceLocation = clickEventInfo.frameUrl || clickEventInfo.pageUrl;

  // Guard clauses for essential data
  if (!selectedResourceLocation) {
    console.error("Could not determine a valid resource location from the click event.");
    return;
  }
  if (!clickEventInfo.menuItemId) {
    console.error("No menu item ID found in the click event details.");
    return;
  }

  // Retrieve the action definition associated with the clicked menu item
  const targetedActionDefinition = BROWSER_ACTION_DEFINITIONS.get(clickEventInfo.menuItemId);

  // Validate that a corresponding action definition exists
  if (!targetedActionDefinition) {
    console.error(`Attempted to execute an undefined action: ${clickEventInfo.menuItemId}`);
    return;
  }

  const actionPerformerFunction = targetedActionDefinition.actionExecutor;

  // Final validation before invoking the action
  if (typeof actionPerformerFunction === 'function') {
    // Execute the action with the determined URI and the active tab reference
    actionPerformerFunction(selectedResourceLocation, currentActiveTab);
  } else {
    console.error(`The executor for action '${clickEventInfo.menuItemId}' is not a valid function.`);
  }
});