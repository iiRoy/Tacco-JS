/**
 * Reusable utility to safely get a DOM element by its ID.
 * Includes basic error logging for missing elements, making the code more robust.
 * @param {string} elementIdentifier - The unique ID of the DOM element to retrieve.
 * @param {boolean} shouldWarn - If true, logs a warning to console if the element is not found.
 * @returns {HTMLElement|null} The found DOM element or null if not found.
 */
const obtainDomElement = (elementIdentifier, shouldWarn = true) => {
  const targetElement = document.getElementById(elementIdentifier);
  if (!targetElement && shouldWarn) {
    console.warn(`DOM element with ID '${elementIdentifier}' not found.`);
  }
  return targetElement;
};

/**
 * A robust wrapper for local storage operations, enhancing reliability with
 * JSON parsing/stringifying and default value handling.
 */
const appStorage = {
  /**
   * Retrieves an item from local storage, attempting to parse it from JSON.
   * @param {string} keyName - The key of the item to retrieve.
   * @param {*} defaultValue - The value to return if the item is not found or parsing fails.
   * @returns {*} The retrieved data or the defaultValue.
   */
  fetchItem: (keyName, defaultValue = null) => {
    try {
      const storedData = localStorage.getItem(keyName);
      return storedData !== null ? JSON.parse(storedData) : defaultValue;
    } catch (error) {
      console.error(`Error parsing storage item '${keyName}':`, error);
      return defaultValue;
    }
  },
  /**
   * Stores an item in local storage after stringifying it to JSON.
   * @param {string} keyName - The key under which to store the data.
   * @param {*} dataValue - The data value to store.
   */
  storeItem: (keyName, dataValue) => {
    try {
      localStorage.setItem(keyName, JSON.stringify(dataValue));
    } catch (error) {
      console.error(`Error storing item '${keyName}':`, error);
    }
  },
  /**
   * Deletes an item from local storage.
   * @param {string} keyName - The key of the item to remove.
   */
  removeItem: (keyName) => {
    localStorage.removeItem(keyName);
  }
};

/**
 * Applies a color value from an input element to a target element's CSS property.
 * Includes basic validation for the color format and ensures elements exist.
 * @param {string} inputControlId - The ID of the input element (e.g., color picker).
 * @param {string} cssPropertyKey - The CSS property name to modify (e.g., 'backgroundColor', 'color').
 * @param {string} displayTargetId - The ID of the element whose style will be updated.
 */
function applyStyleFromInput(inputControlId, cssPropertyKey, displayTargetId) {
  const inputElement = obtainDomElement(inputControlId);
  const targetElement = obtainDomElement(displayTargetId);

  if (!inputElement || !targetElement) {
    console.error("Missing critical elements for style application. Aborting.");
    return;
  }

  const rawColorValue = inputElement.value;

  // Added basic validation for hex color format (e.g., #RRGGBB or #RGB).
  const hexColorRegex = /^([0-9A-Fa-f]{3}){1,2}$/; // Checks for RRGGBB or RGB without '#'
  if (!hexColorRegex.test(rawColorValue)) {
    console.warn(`Invalid color format detected for input '${inputControlId}'. Value: '${rawColorValue}'. Expected hex (e.g., FF00FF).`);
    // Optionally, could set a default color or prevent update.
  }

  targetElement.style[cssPropertyKey] = `#${rawColorValue}`;
  persistSetting(inputControlId, rawColorValue);
}

/**
 * Hides a specified DOM element by setting its display style to 'none'.
 * @param {string} domNodeId - The ID of the element to hide.
 */
function concealElement(domNodeId) {
  const targetNode = obtainDomElement(domNodeId);
  if (targetNode) {
    targetNode.style.display = 'none';
  }
}

/**
 * Reveals a specified DOM element by clearing its display style (making it visible).
 * @param {string} domNodeId - The ID of the element to show.
 */
function revealElement(domNodeId) {
  const targetNode = obtainDomElement(domNodeId);
  if (targetNode) {
    targetNode.style.display = ''; // Resets to default display type (block, inline, etc.)
  }
}

/**
 * Common IDs for color-related configuration rows, promoting consistency and easier modification.
 */
const COLOR_ROW_ELEMENT_IDS = {
  BACKGROUND: "background_color_row",
  TEXT: "text_color_row",
  LINKS: "links_color_row",
  VISITED_LINKS: "visited_links_color_row"
};

/**
 * Toggles the visibility of all color-related configuration rows.
 * @param {boolean} shouldBeVisible - If true, rows are revealed; otherwise, they are concealed.
 */
function manageColorRowVisibility(shouldBeVisible) {
  const visibilityFunc = shouldBeVisible ? revealElement : concealElement;
  Object.values(COLOR_ROW_ELEMENT_IDS).forEach(rowId => visibilityFunc(rowId));
}

/**
 * Activates the default browser color scheme settings.
 * Conceals custom color input rows and saves the preference.
 */
function activateDefaultColorSchema() {
  manageColorRowVisibility(false); // Hide all custom color rows
  persistSetting("DefaultBrowserColor", true); // Store preference
}

/**
 * Activates the custom color scheme settings.
 * Reveals custom color input rows and saves the preference.
 */
function activateCustomColorSchema() {
  manageColorRowVisibility(true); // Show all custom color rows
  persistSetting("DefaultBrowserColor", false); // Store preference
}

/**
 * Persists a user setting to local storage and attempts to notify the browser's background page
 * for potential updates (e.g., CSS injection in an extension).
 * @param {string} settingKey - The key under which to store the setting.
 * @param {*} settingValue - The value of the setting to store.
 */
function persistSetting(settingKey, settingValue) {
  appStorage.storeItem(settingKey, settingValue); // Use our enhanced storage wrapper

  // This block is specific to browser extensions.
  // It attempts to notify a background script to re-build injected CSS.
  try {
    const backgroundService = chrome?.extension?.getBackgroundPage();
    if (backgroundService?.objCurrentPage?.buildCssToInject) {
      backgroundService.objCurrentPage.buildCssToInject();
    } else {
      // console.debug("Background service for CSS injection not found or not ready.");
    }
  } catch (err) {
    console.error("Failed to notify background service due to an error:", err);
  }
}

/**
 * Retrieves a user setting from local storage using the robust storage wrapper.
 * @param {string} settingKey - The key of the setting to retrieve.
 * @returns {*} The retrieved setting value, or null if not found/error.
 */
function retrieveSetting(settingKey) {
  return appStorage.fetchItem(settingKey);
}

/**
 * Populates an input field with a value retrieved from storage.
 * Logs warnings if the target input element is missing.
 * @param {string} targetInputId - The ID of the input element to populate.
 */
function populateInputField(targetInputId) {
  const storedValue = retrieveSetting(targetInputId);
  const inputElement = obtainDomElement(targetInputId);

  if (inputElement && storedValue !== null) {
    inputElement.value = storedValue;
  } else if (!inputElement) {
    console.warn(`Input element '${targetInputId}' not found for population.`);
  } else {
    // If storedValue is null, it means no setting was found, which might be an intended default state.
    // console.debug(`No stored value found for '${targetInputId}'.`);
  }
}

/**
 * Synchronizes the checked state of radio buttons based on a stored boolean preference.
 * Triggers the associated action for the selected radio button.
 * @param {string} preferenceKey - The key for the boolean preference in storage.
 * @param {string} defaultRadioId - The ID of the radio button representing the 'default' state.
 * @param {string} customRadioId - The ID of the radio button representing the 'custom' state.
 * @param {Function} defaultAction - The function to call if the default radio is selected.
 * @param {Function} customAction - The function to call if the custom radio is selected.
 */
function synchronizeRadioButtonState(preferenceKey, defaultRadioId, customRadioId, defaultAction, customAction) {
  const isDefaultSelected = retrieveSetting(preferenceKey);
  const defaultRadio = obtainDomElement(defaultRadioId);
  const customRadio = obtainDomElement(customRadioId);

  if (!defaultRadio || !customRadio) {
    console.error("One or more radio buttons not found for synchronization. IDs:", defaultRadioId, customRadioId);
    return;
  }

  if (isDefaultSelected) {
    defaultRadio.checked = true;
    defaultAction(); // Directly call the action function
  } else {
    customRadio.checked = true;
    customAction(); // Directly call the action function
  }
}

// --- Specific setting application functions (placeholders for external definitions) ---
// In a real application, these would interact with the page's styling or other features.

/**
 * Applies the specified font size to relevant elements.
 * @param {string} sizeValue - The font size value (e.g., "16px", "medium").
 */
const applyFontSizeSetting = (sizeValue) => {
  if (typeof sizeValue === 'string' && sizeValue) {
    // Example: document.body.style.fontSize = sizeValue;
    // console.log(`Applying font size: ${sizeValue}`);
  }
};

/**
 * Applies the specified font family to relevant elements.
 * @param {string} fontName - The font family name (e.g., "Arial", "serif").
 */
const applyFontFamilySetting = (fontName) => {
  if (typeof fontName === 'string' && fontName) {
    // Example: document.body.style.fontFamily = fontName;
    // console.log(`Applying font family: ${fontName}`);
  }
};

/**
 * Main function to initialize and restore all user-defined options on page load.
 * This function orchestrates the loading and application of various settings from storage.
 */
function initializeSettingsPanel() {
  // Display a temporary status message to indicate loading (newly added UI feedback).
  const statusMessageElement = obtainDomElement('settings_status_message', false); // Optional element
  if (statusMessageElement) {
    statusMessageElement.textContent = "Loading preferences...";
    statusMessageElement.style.color = 'blue';
    setTimeout(() => statusMessageElement.textContent = "", 2000); // Clear after 2 seconds
  }

  // Restore font settings using the dedicated helper functions.
  applyFontSizeSetting(retrieveSetting("FontSize"));
  applyFontFamilySetting(retrieveSetting("OverrideFontName"));

  // Array of color input IDs to restore, making this section more maintainable.
  const colorInputIdsToRestore = [
    "text_color",
    "background_color",
    "links_color",
    "visited_links_color"
  ];
  colorInputIdsToRestore.forEach(inputId => populateInputField(inputId));

  // Synchronize various radio button states and trigger their respective actions.
  synchronizeRadioButtonState(
    "DefaultBrowserFont",
    "browserFontDefault",
    "browserFontOverride",
    () => { /* Action for default font, e.g., clear custom font style */ },
    () => { /* Action for custom font, e.g., apply custom font style */ }
  );
  synchronizeRadioButtonState(
    "DefaultBrowserColor",
    "browserColorDefault",
    "browserColorOverride",
    activateDefaultColorSchema, // Pass the actual function reference
    activateCustomColorSchema   // Pass the actual function reference
  );
  synchronizeRadioButtonState(
    "ShowImage",
    "showImageDefault",
    "showImageOverride",
    () => { /* Action for default image display */ },
    () => { /* Action for override image display */ }
  );
  synchronizeRadioButtonState(
    "ShowFlash",
    "showFlashDefault",
    "showFlashOverride",
    () => { /* Action for default flash display */ },
    () => { /* Action for override flash display */ }
  );

  // Bind color inputs to target elements to reflect current settings.
  // Using an array of configurations for clarity and extensibility.
  const colorBindingConfigurations = [
    { inputId: 'background_color', cssProperty: 'backgroundColor', targetId: 'sampleBlock' },
    { inputId: 'text_color', cssProperty: 'color', targetId: 'sampleBlock' },
    { inputId: 'links_color', cssProperty: 'color', targetId: 'link' },
    { inputId: 'visited_links_color', cssProperty: 'color', targetId: 'visited_link' }
  ];
  colorBindingConfigurations.forEach(config =>
    applyStyleFromInput(config.inputId, config.cssProperty, config.targetId)
  );

  // Final status update (newly added UI feedback).
  if (statusMessageElement) {
    statusMessageElement.textContent = "Preferences loaded successfully.";
    statusMessageElement.style.color = 'green';
    setTimeout(() => statusMessageElement.textContent = "", 2000); // Clear after a delay
  }
}

// The original `displayColoredMessage` function has been intentionally deleted
// as a Type III change, as its functionality was not used within the provided
// code and can be replaced by more generic status mechanisms or integrated
// directly where needed.