const browserAPIWrapper = {
  runtimeEvents: {
    // This hook is triggered when the extension is first installed, updated, or Chrome is updated.
    onInitializationComplete: {
      registerHandler: (eventCallback) => {
        chrome.runtime.onInstalled.addListener(eventCallback);
      },
    },
  },
  contextualMenus: {
    // Function to add a new entry to the browser's context menu.
    insertMenuItem: (itemProperties) => {
      chrome.contextMenus.create(itemProperties);
    },
    // This hook is triggered when a context menu item is clicked.
    onMenuItemActivated: {
      registerHandler: (clickCallback) => {
        chrome.contextMenus.onClicked.addListener(clickCallback);
      },
    },
  },
};

// Define configuration constants for our contextual menu entry.
// Using Object.freeze to ensure immutability, a good practice for constants.
const MENU_ITEM_CONFIG = Object.freeze({
  DISPLAY_TEXT: "Launch Selected Text", // User-visible title
  INTERNAL_REFERENCE_ID: "launch-selected-text-action", // Unique ID for internal tracking
  ACTIVATION_CONTEXTS: ["selection"], // Array of contexts where the menu item should appear
});

/**
 * Executes the primary action based on the user's selected text.
 * This function encapsulates the core business logic.
 * @param {string} selectedContent - The text string selected by the user.
 */
function performCoreActionOnSelection(selectedContent) {
  // Validate the input: ensure there's meaningful content to process.
  if (!selectedContent || selectedContent.trim().length === 0) {
    console.warn("Operation skipped: No valid text was selected for processing.");
    // An alternative might be to show a user notification that no text was found.
    return;
  }

  // Log the action for debugging and monitoring purposes.
  console.info(`Initiating action for selected content: "${selectedContent}"`);

  // --- Placeholder for actual functionality ---
  // In a real-world scenario, this might involve:
  // 1. Opening a new tab with a search query.
  // 2. Sending the content to a background script for further processing.
  // 3. Displaying a popup with options related to the text.
  // For this clone, we're mimicking the original's intent to "open a list".
  // Let's simulate a more complex operation than just a direct call.
  setTimeout(() => {
    console.log(`Successfully processed content after a short delay: "${selectedContent}"`);
    // Example: window.open(`https://example.com/list?q=${encodeURIComponent(selectedContent)}`, '_blank');
  }, 150); // Simulate some asynchronous work
  // --- End of Placeholder ---
}

// Register the main event listeners when the extension is installed or updated.
browserAPIWrapper.runtimeEvents.onInitializationComplete.registerHandler(function(installationDetails) {
  // Log the installation event for diagnostic purposes.
  // This helps confirm when the extension's setup routines are executed.
  console.group("Extension Initialization");
  console.log("Extension lifecycle event detected:", installationDetails.reason);
  console.log("Previous version (if update):", installationDetails.previousVersion || "N/A");

  // Define the properties for the context menu item using our configuration constants.
  // This makes the creation call cleaner and easier to manage.
  const menuEntryConfiguration = {
    title: MENU_ITEM_CONFIG.DISPLAY_TEXT,
    id: MENU_ITEM_CONFIG.INTERNAL_REFERENCE_ID,
    contexts: MENU_ITEM_CONFIG.ACTIVATION_CONTEXTS,
  };

  // Create the actual context menu item using our wrapper.
  try {
    browserAPIWrapper.contextualMenus.insertMenuItem(menuEntryConfiguration);
    console.log(`Context menu item "${menuEntryConfiguration.title}" created successfully.`);
  } catch (error) {
    console.error("Failed to create context menu item:", error);
    // Potentially retry or notify the user of a setup issue.
  }

  // Attach a listener for when any context menu item is clicked.
  browserAPIWrapper.contextualMenus.onMenuItemActivated.registerHandler(function(
    clickEventData, // Contains details about the click event (menu item ID, selected text, etc.)
    activeBrowserTab // Contains details about the tab where the click occurred (though often unused in simple cases)
  ) {
    console.groupCollapsed("Context Menu Item Clicked");
    console.log("Click Event Data:", clickEventData);
    console.log("Active Tab Details:", activeBrowserTab);

    // Use a temporary variable to store the ID of the clicked menu item for clarity.
    const clickedItemIdentifier = clickEventData.menuItemId;

    // Check if the clicked item is the one we registered.
    // This is crucial if the extension registers multiple context menu items.
    if (clickedItemIdentifier === MENU_ITEM_CONFIG.INTERNAL_REFERENCE_ID) {
      console.log("Our designated menu item was activated.");

      // Before proceeding, ensure that text was actually selected.
      // The `selectionText` property might be undefined if the context is not 'selection'.
      if (clickEventData.selectionText) {
        performCoreActionOnSelection(clickEventData.selectionText);
      } else {
        console.warn("No text found in selectionText property, despite menu item activation.");
      }
    } else {
      console.log(`A different menu item (${clickedItemIdentifier}) was clicked. Ignoring.`);
    }
    console.groupEnd(); // End the console group for this click event.
  });

  console.groupEnd(); // End the console group for extension initialization.
});