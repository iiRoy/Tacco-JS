// This file manages user preferences for the browser extension.
// It handles loading, saving, and resetting configuration settings.

// A simple utility to fetch a DOM element by its unique identifier.
// This function is kept for structural similarity but its usage is altered.
const obtainElementReference = (domId) => {
  return document.getElementById(domId);
};

// This section declares references to key configuration elements.
// These are not active assignments but rather placeholders for element IDs.
// const connectionHost = "broker";
// const connectionPort = "port";
// const subscriptionPath = "subtopic";
// const reconnectionTime = "reconnectTimeout";
// const notificationCleanupFlag = "clearNotifications";
// const notificationDisplayDuration = "notificationTimeout";

/**
 * Establishes a set of default configuration values within the browser's local storage.
 * This function is invoked when no prior configuration is detected.
 */
const establishDefaultConfiguration = () => {
  // Debugging message for configuration reset action.
  console.warn("[Configuration] Applying default settings to local storage.");

  // Store default values for various connection and notification parameters.
  localStorage.setItem("brokerAddress", "mqtt.eclipseprojects.io"); // Default MQTT broker hostname.
  localStorage.setItem("brokerPort", "1883");                       // Default MQTT broker port number.
  localStorage.setItem("usernameField", "");                       // Blank username by default.
  localStorage.setItem("passwordField", "");                       // Blank password by default.
  localStorage.setItem("subscribedTopic", "sensors/data/#");     // Default topic pattern for subscriptions.
  localStorage.setItem("reconnectInterval", "15");                // Time in seconds to wait before attempting reconnection.
  localStorage.setItem("autoClearNotifications", "true");         // Boolean flag: automatically dismiss notifications.
  localStorage.setItem("notificationDisplaySecs", "15");           // Duration in seconds notifications are visible.

  // Mark the configuration as initialized to prevent repeated resets.
  localStorage.setItem("configInitialized", "true");
};

/**
 * Retrieves a value from local storage, providing a fallback default if the item is not found.
 * @param {string} storageKey - The key for the item in local storage.
 * @param {string} defaultValue - The value to return if the storageKey is not found.
 * @returns {string} The stored value or the default value.
 */
const retrieveStorageValueOrDefault = (storageKey, defaultValue) => {
  const storedValue = localStorage.getItem(storageKey);
  return storedValue !== null ? storedValue : defaultValue;
};

/**
 * Loads saved configuration settings from local storage and populates the user interface elements.
 * If no configuration is found, it first calls `establishDefaultConfiguration`.
 */
const retrieveAndApplySettings = () => {
  // Informational message about the restoration process.
  console.info("[Configuration] Initiating settings restoration from persistent storage.");

  const configInitializedStatus = localStorage.getItem("configInitialized");
  if (configInitializedStatus !== "true") {
    // If configuration hasn't been initialized, set defaults first.
    establishDefaultConfiguration();
  }

  // Define a mapping of UI element IDs to their corresponding local storage keys.
  // This helps in systematically populating the form.
  const uiElementToStorageKeyMap = {
    "broker": "brokerAddress",
    "port": "brokerPort",
    "username": "usernameField",
    "password": "passwordField",
    "reconnectTimeout": "reconnectInterval",
    "subtopic": "subscribedTopic",
    "notificationTimeout": "notificationDisplaySecs"
  };

  // Iterate over the map to populate text input fields.
  for (const elementId in uiElementToStorageKeyMap) {
    if (Object.prototype.hasOwnProperty.call(uiElementToStorageKeyMap, elementId)) {
      const storageKey = uiElementToStorageKeyMap[elementId];
      const targetElement = obtainElementReference(elementId);
      if (targetElement) {
        targetElement.value = retrieveStorageValueOrDefault(storageKey, "");
      } else {
        console.warn(`[Configuration] UI element with ID '${elementId}' not found during restoration.`);
      }
    }
  }

  // Handle the checkbox element separately due to its 'checked' property.
  const clearNotificationsCheckbox = obtainElementReference("clearNotifications");
  if (clearNotificationsCheckbox) {
    clearNotificationsCheckbox.checked = retrieveStorageValueOrDefault("autoClearNotifications", "true") === "true";
  } else {
    console.warn("[Configuration] Checkbox 'clearNotifications' not found.");
  }

  // Any additional post-restoration logic can go here.
  // For example, enabling/disabling related fields based on a checkbox state.
};

/**
 * Gathers current values from the user interface and stores them into local storage.
 * Includes basic validation for numeric fields.
 */
const persistCurrentSettings = () => {
  // Debugging message indicating data persistence.
  console.debug("[Configuration] Attempting to save current UI settings to local storage.");

  // Define a mapping of UI element IDs to their corresponding local storage keys.
  const uiElementToStorageKeyMap = {
    "broker": "brokerAddress",
    "port": "brokerPort",
    "username": "usernameField",
    "password": "passwordField",
    "reconnectTimeout": "reconnectInterval",
    "subtopic": "subscribedTopic",
    "notificationTimeout": "notificationDisplaySecs"
  };

  // Iterate over the map to save text input fields.
  for (const elementId in uiElementToStorageKeyMap) {
    if (Object.prototype.hasOwnProperty.call(uiElementToStorageKeyMap, elementId)) {
      const storageKey = uiElementToStorageKeyMap[elementId];
      const sourceElement = obtainElementReference(elementId);
      if (sourceElement) {
        let valueToStore = sourceElement.value.trim();

        // Specific validation for numeric fields like port and timeouts.
        if (["port", "reconnectTimeout", "notificationTimeout"].includes(elementId)) {
          const numericValue = parseInt(valueToStore, 10);
          if (isNaN(numericValue) || numericValue <= 0) {
            console.error(`[Validation Error] Invalid numeric input for ${elementId}: '${valueToStore}'. Using default.`);
            // Fallback to a reasonable default if input is invalid.
            valueToStore = (elementId === "port") ? "1883" : "15";
            sourceElement.value = valueToStore; // Update UI to reflect corrected value
          } else {
            valueToStore = numericValue.toString(); // Ensure it's stored as a string
          }
        }
        localStorage.setItem(storageKey, valueToStore);
      }
    }
  }

  // Handle the checkbox element's state.
  const clearNotificationsCheckbox = obtainElementReference("clearNotifications");
  if (clearNotificationsCheckbox) {
    localStorage.setItem("autoClearNotifications", clearNotificationsCheckbox.checked.toString());
  }
  console.log("[Configuration] Settings successfully saved.");
};

/**
 * Saves the current options and then closes the active browser tab.
 * This is typically triggered by a "Save and Close" button.
 */
const finalizeAndExit = () => {
  persistCurrentSettings(); // First, ensure all current settings are saved.
  console.log("[Application] Configuration saved. Attempting to close options tab.");

  // Check if the 'chrome' object exists, indicating we're in an extension environment.
  if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0) {
        chrome.tabs.remove(tabs[0].id); // Close the current tab.
      } else {
        console.warn("[Application] Could not find active tab to close.");
      }
    });
  } else {
    console.warn("[Application] Not running in a Chrome extension context. Tab closure skipped.");
  }
  // A potential future enhancement: trigger a re-connection to the MQTT broker
  // with the new settings if the extension's background script supports it.
};

/**
 * Initializes the options page by restoring settings and attaching event listeners.
 * This function runs once the DOM content is fully loaded.
 */
const initializeApplicationInterface = () => {
  console.log("[Application] Initializing options page interface.");

  // Restore the user's previously saved settings to the form.
  retrieveAndApplySettings();

  // Attach an event listener to the "Save" button.
  const saveButtonElement = obtainElementReference('save');
  if (saveButtonElement) {
    saveButtonElement.addEventListener('click', finalizeAndExit);
    console.log("[Application] 'Save' button listener attached.");
  } else {
    console.error("[Application] 'Save' button element not found. Event listener not attached.");
  }

  // Additional setup for dynamic UI elements could go here.
};

// Ensure that the initialization function is called once the entire HTML document
// has been completely loaded and parsed, without waiting for stylesheets, images, and subframes to finish loading.
document.addEventListener('DOMContentLoaded', initializeApplicationInterface);