/*
Copyright (c) 2009 - 2015, Evan Jehu
All rights reserved.

This software is distributed under the BSD 3-Clause License.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice,
   this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.
3. Neither the name of the author nor the names of its contributors may be used
   to endorse or promote products derived from this software without specific
   prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
IN NO EVENT SHALL EVAN JEHU BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY
OF SUCH DAMAGE.
*/

// Core data structures for managing browser extension state.
let openTabRegistry = [];          // Holds references to currently active browser tabs.
let recentlyClosedRecords = [];    // Maintains a history of tabs that have been recently closed.
let userBookmarks = [];            // Stores the user's fetched browser bookmarks.

// Utility object for interacting with the browser's local storage mechanism.
const storageService = {
  /**
   * Retrieves an item from local storage, providing a default if not found or an error occurs.
   * @param {string} key - The storage key.
   * @param {string} defaultValue - The value to return if the key is not found or an error occurs.
   * @returns {string} The stored value or the default value.
   */
  getItem: (key, defaultValue) => {
    try {
      const storedValue = localStorage.getItem(key);
      return storedValue !== null ? storedValue : defaultValue;
    } catch (e) {
      console.error(`StorageService: Error reading key '${key}':`, e);
      return defaultValue;
    }
  },
  /**
   * Stores an item in local storage.
   * @param {string} key - The storage key.
   * @param {string} value - The value to store.
   */
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error(`StorageService: Error writing key '${key}':`, e);
    }
  },
  /**
   * Removes an item from local storage.
   * @param {string} key - The storage key to remove.
   */
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`StorageService: Error removing key '${key}':`, e);
    }
  }
};

// Global flag to control diagnostic logging output.
let diagnosticsEnabled = loadDiagnosticsFlag();

// Regular expression for validating standard HTTP/HTTPS URLs.
const urlValidationPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;

/**
 * Checks if a given string represents a valid HTTP/HTTPS web address.
 * @param {string} inputUrl - The URL string to evaluate.
 * @returns {boolean} True if the string is a valid web URL, false otherwise.
 */
function isValidWebAddress(inputUrl) {
  if (typeof inputUrl !== 'string' || inputUrl.length === 0) {
    return false;
  }
  return urlValidationPattern.test(inputUrl);
}

/**
 * Provides a centralized logging mechanism for diagnostic messages.
 * Messages are only output if `diagnosticsEnabled` is true.
 * @param {...any} messages - Arguments to be logged.
 */
function diagnosticLogger(...messages) {
  if (diagnosticsEnabled) {
    console.debug('[ExtensionDiagnostics]', ...messages);
  }
}

/**
 * Represents a configurable keyboard shortcut combination.
 */
class KeyboardCombo {
  /**
   * @param {object} [config={}] - Configuration object for the shortcut.
   * @param {boolean} [config.control=false] - True if Ctrl/Cmd key is part of the combo.
   * @param {boolean} [config.shiftKey=false] - True if Shift key is part of the combo.
   * @param {boolean} [config.altKey=false] - True if Alt/Option key is part of the combo.
   * @param {boolean} [config.metaKey=false] - True if Meta (Windows/Cmd) key is part of the combo.
   * @param {string} [config.mainKey=''] - The primary key (e.g., 'A', 'Enter').
   */
  constructor(config = {}) {
    this.control = Boolean(config.control);
    this.shiftKey = Boolean(config.shiftKey);
    this.altKey = Boolean(config.altKey);
    this.metaKey = Boolean(config.metaKey);
    this.mainKey = String(config.mainKey || '').trim();
  }

  /**
   * Generates a standardized string representation of the keyboard combination.
   * @returns {string} The pattern string (e.g., "alt_cmd_ctrl_shift_A").
   */
  getPattern() {
    const parts = [];
    if (this.altKey) parts.push("alt");
    if (this.metaKey) parts.push("meta");
    if (this.control) parts.push("ctrl");
    if (this.shiftKey) parts.push("shift");
    if (this.mainKey) parts.push(this.mainKey);
    return parts.join("_");
  }
}

/**
 * Loads the current state of the diagnostics flag from local storage.
 * @returns {boolean} True if diagnostics are active, false otherwise.
 */
function loadDiagnosticsFlag() {
  const flagStatus = storageService.getItem("diagnostics_active_status", "false");
  return flagStatus === 'true';
}

/**
 * Toggles the diagnostics logging state and saves it to local storage.
 * @param {boolean} newStatus - The desired state for diagnostics (true to enable, false to disable).
 */
function toggleDiagnostics(newStatus) {
  diagnosticsEnabled = Boolean(newStatus);
  storageService.setItem("diagnostics_active_status", String(diagnosticsEnabled));
  diagnosticLogger(`Diagnostics toggled to: ${diagnosticsEnabled}`);
}

/**
 * Retrieves the configured maximum capacity for the recently closed tabs history.
 * @returns {number} The maximum number of closed tabs to retain. Defaults to 15.
 */
function getClosedHistoryCapacity() {
  const storedVal = storageService.getItem("closed_tab_max_history", "15");
  const parsedVal = parseInt(storedVal, 10);
  return isNaN(parsedVal) || parsedVal < 0 ? 15 : parsedVal;
}

/**
 * Sets the maximum capacity for the recently closed tabs history.
 * @param {number} newCapacity - The new maximum capacity. Must be a non-negative number.
 */
function setClosedHistoryCapacity(newCapacity) {
  if (typeof newCapacity !== 'number' || newCapacity < 0) {
    diagnosticLogger("Attempted to set an invalid closed history capacity:", newCapacity);
    return;
  }
  storageService.setItem("closed_tab_max_history", String(Math.floor(newCapacity)));
  trimClosedTabHistory(); // Apply the new capacity immediately.
}

/**
 * Fetches the user's preferred navigation style for tab cycling.
 * @returns {string} The navigation style string (e.g., 'circular', 'linear'). Defaults to 'circular'.
 */
function getNavigationStyle() {
  return storageService.getItem("navigation_behavior_mode", "circular");
}

/**
 * Configures the navigation style for tab cycling.
 * @param {string} style - The desired navigation style. Valid options are 'circular', 'linear', 'recent'.
 */
function setNavigationStyle(style) {
  const validStyles = ['linear', 'circular', 'recent'];
  if (!validStyles.includes(style)) {
    diagnosticLogger("Attempted to set an invalid navigation style:", style);
    return;
  }
  storageService.setItem("navigation_behavior_mode", style);
}

/**
 * Obtains the number of tabs to skip when using page up/page down actions.
 * @returns {number} The skip size. Defaults to 7.
 */
function getPageScrollIncrement() {
  const storedVal = storageService.getItem("page_scroll_jump_size", "7");
  const parsedVal = parseInt(storedVal, 10);
  return isNaN(parsedVal) || parsedVal < 1 ? 7 : parsedVal;
}

/**
 * Sets the number of tabs to skip for page up/page down operations.
 * @param {number} increment - The new skip size. Must be a positive integer.
 */
function setPageScrollIncrement(increment) {
  if (typeof increment !== 'number' || increment < 1) {
    diagnosticLogger("Attempted to set invalid page scroll increment:", increment);
    return;
  }
  storageService.setItem("page_scroll_jump_size", String(Math.floor(increment)));
}

/**
 * Determines if Chrome Developer Tools tabs should be included in the tab list.
 * @returns {boolean} True if dev tools tabs should be shown, false otherwise. Defaults to false.
 */
function includeDeveloperTools() {
  const setting = storageService.getItem("include_dev_tools_tabs", "false");
  return setting === 'true';
}

/**
 * Sets whether Developer Tools tabs should be visible in the extension's tab list.
 * @param {boolean} shouldInclude - True to include, false to exclude.
 */
function setIncludeDeveloperTools(shouldInclude) {
  storageService.setItem("include_dev_tools_tabs", String(Boolean(shouldInclude)));
}

/**
 * Checks if tab URLs should be displayed within the user interface.
 * @returns {boolean} True if URLs are displayed. Defaults to true.
 */
function displayTabUrls() {
  const setting = storageService.getItem("show_tab_addresses", "true");
  return setting === 'true';
}

/**
 * Configures whether tab URLs should be shown in the UI.
 * @param {boolean} shouldDisplay - True to show URLs, false to hide them.
 */
function setDisplayTabUrls(shouldDisplay) {
  storageService.setItem("show_tab_addresses", String(Boolean(shouldDisplay)));
}

/**
 * Indicates if the content of tab URLs should be considered during search operations.
 * @returns {boolean} True if URL content is searchable. Defaults to false.
 */
function enableUrlSearch() {
  const setting = storageService.getItem("search_tab_urls_content", "false");
  return setting === 'true';
}

/**
 * Activates or deactivates searching within tab URL content.
 * @param {boolean} enable - True to enable URL search, false to disable.
 */
function setEnableUrlSearch(enable) {
  storageService.setItem("search_tab_urls_content", String(Boolean(enable)));
}

/**
 * Checks if the total number of open tabs should be displayed on the extension's badge icon.
 * @returns {boolean} True if the tab count is shown. Defaults to true.
 */
function showTabCounterOnBadge() {
  const setting = storageService.getItem("display_tab_count_badge", "true");
  return setting === 'true';
}

/**
 * Controls whether the open tab count is visible on the extension's badge.
 * @param {boolean} showCount - True to display the count, false to hide it.
 */
function setShowTabCounterOnBadge(showCount) {
  storageService.setItem("display_tab_count_badge", String(Boolean(showCount)));
  updateExtensionBadge(openTabRegistry.length); // Immediately update the badge display.
}

/**
 * Determines if tooltips should be shown for UI elements.
 * @returns {boolean} True if tooltips are enabled. Defaults to true.
 */
function displayInterfaceTooltips() {
  const setting = storageService.getItem("show_ui_tooltips", "true");
  return setting === 'true';
}

/**
 * Enables or disables the display of tooltips in the user interface.
 * @param {boolean} showTips - True to show tooltips, false to hide them.
 */
function setDisplayInterfaceTooltips(showTips) {
  storageService.setItem("show_ui_tooltips", String(Boolean(showTips)));
}

/**
 * Checks if favicons (site icons) should be displayed alongside tab titles.
 * @returns {boolean} True if favicons are shown. Defaults to true.
 */
function displayTabFavicons() {
  const setting = storageService.getItem("show_tab_favicons", "true");
  return setting === 'true';
}

/**
 * Controls whether favicons are displayed for tabs.
 * @param {boolean} showIcons - True to display favicons, false to hide them.
 */
function setDisplayTabFavicons(showIcons) {
  storageService.setItem("show_tab_favicons", String(Boolean(showIcons)));
}

/**
 * Retrieves the custom search engine URL template from storage.
 * @returns {string} The URL template, where '%s' is a placeholder for the search query. Defaults to Google search.
 */
function getCustomSearchTemplate() {
  return storageService.getItem("custom_search_engine_url", 'https://www.google.com/search?q=%s');
}

/**
 * Sets a new custom search engine URL template.
 * @param {string} template - The new URL template. Must contain '%s'.
 */
function setCustomSearchTemplate(template) {
  if (typeof template !== 'string' || !template.includes('%s')) {
    diagnosticLogger("Invalid custom search template provided. Must be a string containing '%s'.");
    return;
  }
  storageService.setItem("custom_search_engine_url", template);
}

/**
 * Fetches any user-defined custom CSS rules from storage.
 * @returns {string} The custom CSS string. Defaults to an empty string.
 */
function getCustomCssStyle() {
  return storageService.getItem("user_defined_css_rules", '');
}

/**
 * Stores new custom CSS rules.
 * @param {string} cssContent - The CSS string to store.
 */
function setCustomCssStyle(cssContent) {
  storageService.setItem("user_defined_css_rules", cssContent);
}

/**
 * Retrieves a KeyboardCombo object from local storage, or creates one with defaults.
 * @param {string} storageKey - The key where the combo is stored.
 * @param {object} defaultProps - Properties for a new KeyboardCombo if none found.
 * @returns {KeyboardCombo} The retrieved or default keyboard combination.
 */
function retrieveKeyCombination(storageKey, defaultProps) {
  const storedJson = storageService.getItem(storageKey);
  if (storedJson) {
    try {
      const parsedConfig = JSON.parse(storedJson);
      return new KeyboardCombo(parsedConfig);
    } catch (e) {
      diagnosticLogger(`Failed to parse stored key combo for '${storageKey}':`, e);
      // Fallback to default if parsing fails.
    }
  }
  return new KeyboardCombo(defaultProps);
}

/**
 * Persists a KeyboardCombo object to local storage.
 * @param {string} storageKey - The key under which to save the combo.
 * @param {KeyboardCombo} comboObject - The KeyboardCombo instance to save.
 */
function persistKeyCombination(storageKey, comboObject) {
  if (!(comboObject instanceof KeyboardCombo)) {
    diagnosticLogger("Attempted to persist a non-KeyboardCombo object:", comboObject);
    return;
  }
  storageService.setItem(storageKey, JSON.stringify(comboObject));
}

/**
 * Retrieves the keyboard shortcut for activating the extension's popup.
 * @returns {KeyboardCombo} The popup activation shortcut.
 */
function getPopupActivationKey() {
  return retrieveKeyCombination("popup_activation_shortcut", {control: true, mainKey: "space"});
}

/**
 * Removes a specific legacy or deprecated shortcut key from storage.
 * @param {string} oldKeyIdentifier - The local storage key of the shortcut to remove.
 */
function removeLegacyShortcut(oldKeyIdentifier) {
  storageService.removeItem(oldKeyIdentifier);
  diagnosticLogger(`Removed legacy shortcut key: ${oldKeyIdentifier}`);
}

/**
 * Determines if a given Chrome tab object should be included in the extension's tab management.
 * @param {object} browserTab - The tab object to check.
 * @returns {boolean} True if the tab should be managed, false otherwise.
 */
function shouldRegisterTab(browserTab) {
  if (!browserTab || typeof browserTab.url !== 'string') {
    return false; // Basic validation for a valid tab object.
  }
  // Exclude developer tools tabs if the user setting dictates.
  if (!includeDeveloperTools() && browserTab.url.startsWith("chrome-devtools://")) {
    return false;
  }
  // Generally exclude internal Chrome pages, except for specific ones like extensions.
  if (browserTab.url.startsWith("chrome://") && !browserTab.url.startsWith("chrome://extensions")) {
    return false;
  }
  return true;
}

/**
 * Retrieves the keyboard shortcut for closing a single tab.
 * @returns {KeyboardCombo} The single tab closure shortcut.
 */
function getSingleTabClosureKey() {
  return retrieveKeyCombination("single_tab_close_shortcut", {control: true, mainKey: "d"});
}

/**
 * Sets the keyboard shortcut for closing a single tab.
 * @param {KeyboardCombo} combo - The new shortcut combination.
 */
function setSingleTabClosureKey(combo) {
  persistKeyCombination("single_tab_close_shortcut", combo);
}

/**
 * Retrieves the keyboard shortcut for closing all tabs.
 * @returns {KeyboardCombo} The all tabs closure shortcut.
 */
function getAllTabsClosureKey() {
  return retrieveKeyCombination("all_tabs_close_shortcut", {control: true, shiftKey: true, mainKey: "D"});
}

/**
 * Sets the keyboard shortcut for closing all tabs.
 * @param {KeyboardCombo} combo - The new shortcut combination.
 */
function setAllTabsClosureKey(combo) {
  persistKeyCombination("all_tabs_close_shortcut", combo);
}

/**
 * Trims the `recentlyClosedRecords` array to ensure it does not exceed its configured maximum capacity.
 */
function trimClosedTabHistory() {
  const maxCapacity = getClosedHistoryCapacity();
  if (recentlyClosedRecords.length > maxCapacity) {
    recentlyClosedRecords.splice(maxCapacity);
    diagnosticLogger(`Trimmed closed tab history to ${maxCapacity} entries.`);
  }
}

/**
 * Adds information about a closed tab to the `recentlyClosedRecords` history.
 * Only valid web URLs are recorded.
 * @param {object} tabData - The tab object containing details like url, title, and favIconUrl.
 */
function recordClosedTab(tabData) {
  if (isValidWebAddress(tabData.url)) {
    const closedTabInfo = {
      url: tabData.url,
      title: tabData.title || 'Untitled Tab', // Provide a fallback title.
      favicon: tabData.favIconUrl || 'chrome://favicon/' // Default favicon if none provided.
    };
    recentlyClosedRecords.unshift(closedTabInfo); // Add to the beginning of the history.
    trimClosedTabHistory(); // Ensure history size is maintained.
    diagnosticLogger(`Recorded closed tab: "${closedTabInfo.title}" (${closedTabInfo.url})`);
  } else {
    diagnosticLogger(`Skipping recording of non-web URL for closed tab: ${tabData.url}`);
  }
}

/**
 * Searches the `openTabRegistry` for a tab with a matching ID.
 * @param {number} tabIdentifier - The ID of the tab to locate.
 * @returns {number} The index of the tab in `openTabRegistry`, or -1 if not found.
 */
function findTabIndexById(tabIdentifier) {
  return openTabRegistry.findIndex(aTab => aTab.id === tabIdentifier);
}

/**
 * Searches a given array of tab objects for a tab with a matching URL.
 * @param {Array<object>} tabList - The array of tab objects to search through.
 * @param {string} targetUrl - The URL to match.
 * @returns {number} The index of the tab in `tabList`, or -1 if not found.
 */
function findTabIndexByUrl(tabList, targetUrl) {
  return tabList.findIndex(aTab => aTab.url === targetUrl);
}

/**
 * Initializes the visual settings for the extension's browser action badge.
 */
function setupBadgeDisplay() {
  chrome.browserAction.setBadgeBackgroundColor({color: [50, 100, 200, 255]}); // A distinct blue color.
  updateExtensionBadge(0); // Set initial badge text to zero.
  diagnosticLogger("Extension badge display initialized.");
}

/**
 * Updates the text displayed on the extension's browser action badge icon.
 * The badge text is cleared if `showTabCounterOnBadge()` is false.
 * @param {number} currentCount - The numerical value to display on the badge.
 */
function updateExtensionBadge(currentCount) {
  const badgeText = showTabCounterOnBadge() ? String(currentCount) : "";
  chrome.browserAction.setBadgeText({text: badgeText});
  diagnosticLogger(`Badge text updated to: '${badgeText}' (count: ${currentCount})`);
}

/**
 * Moves a specified tab to the beginning of the `openTabRegistry`, marking it as the most recently active.
 * This ensures that recently used tabs are easily accessible.
 * @param {number} tabIdToPrioritize - The ID of the tab to elevate.
 */
function prioritizeTabInList(tabIdToPrioritize) {
  const targetIndex = findTabIndexById(tabIdToPrioritize);
  if (targetIndex !== -1) {
    const [movedTab] = openTabRegistry.splice(targetIndex, 1); // Remove the tab from its current position.
    openTabRegistry.unshift(movedTab); // Insert it at the beginning of the array.
    diagnosticLogger(`Tab ID ${tabIdToPrioritize} moved to front of registry.`);
  } else {
    diagnosticLogger(`Could not prioritize tab ID ${tabIdToPrioritize}: not found in registry.`);
  }
}

/**
 * Reorders multiple tabs within the `openTabRegistry` based on an input array of tabs.
 * Tabs in the input array are moved to the front of the registry in reverse order of their appearance
 * in the input array, ensuring the *first* tab in the input array ends up at the very front.
 * @param {Array<object>} tabsToPrioritize - An array of tab objects to reorder.
 */
function reorderMultipleTabs(tabsToPrioritize) {
  // Iterate in reverse to move elements to the front without shifting indices of unprocessed elements.
  for (let i = tabsToPrioritize.length - 1; i >= 0; i--) {
    prioritizeTabInList(tabsToPrioritize[i].id);
  }
  diagnosticLogger(`Reordered ${tabsToPrioritize.length} tabs.`);
}

/**
 * Adds a new tab to the `openTabRegistry` or updates its entry if it already exists,
 * provided it meets the inclusion criteria (`shouldRegisterTab`).
 * @param {object} newTabObject - The Chrome tab object to register.
 */
function registerNewOpenTab(newTabObject) {
  if (!newTabObject || !newTabObject.id) {
    diagnosticLogger("Invalid tab object provided for registration.");
    return;
  }

  if (shouldRegisterTab(newTabObject)) {
    const existingIndex = findTabIndexById(newTabObject.id);
    if (existingIndex !== -1) {
      // If the tab already exists, update its details in the registry.
      openTabRegistry[existingIndex] = {...openTabRegistry[existingIndex], ...newTabObject};
      diagnosticLogger(`Updated details for existing tab ID ${newTabObject.id}.`);
    } else {
      // Otherwise, add the new tab to the registry.
      openTabRegistry.push(newTabObject);
      diagnosticLogger(`Registered new open tab ID: ${newTabObject.id} (URL: ${newTabObject.url}).`);
    }
  } else {
    diagnosticLogger(`Skipping registration for tab ID ${newTabObject.id} (URL: ${newTabObject.url}) due to exclusion rules.`);
  }
}

/**
 * Processes a list of tab IDs that have been removed, updating the `openTabRegistry`
 * and adding them to the `recentlyClosedRecords`.
 * @param {Array<number>} removedTabIds - An array of IDs of tabs that were removed.
 * @param {Function} [completionCallback] - An optional callback to execute after all tabs are processed.
 */
function processRemovedTabs(removedTabIds, completionCallback) {
  if (!Array.isArray(removedTabIds) || removedTabIds.length === 0) {
    diagnosticLogger("No tab IDs provided to process for removal.");
    if (completionCallback) completionCallback();
    return;
  }

  removedTabIds.forEach(tabIdToRemove => {
    const indexToRemove = findTabIndexById(tabIdToRemove);
    if (indexToRemove !== -1) {
      const [closedTab] = openTabRegistry.splice(indexToRemove, 1); // Remove the tab from open list.
      recordClosedTab(closedTab); // Add it to the recently closed history.
      updateExtensionBadge(openTabRegistry.length); // Refresh the badge count.
      diagnosticLogger(`Successfully removed and recorded tab ID ${tabIdToRemove}.`);
    } else {
      diagnosticLogger(`Tab ID ${tabIdToRemove} not found in open registry during removal process.`);
    }
  });

  if (completionCallback) {
    completionCallback();
  }
}

/**
 * Activates a specific tab, bringing its window to focus and making the tab active.
 * @param {number} targetTabId - The ID of the tab to activate.
 * @param {Function} [activationCallback] - Optional callback (receives boolean success status).
 */
function activateAndFocusTab(targetTabId, activationCallback) {
  if (typeof targetTabId !== 'number' || targetTabId <= 0) {
    diagnosticLogger("Invalid tab ID provided for activation:", targetTabId);
    if (activationCallback) activationCallback(false);
    return;
  }

  chrome.tabs.get(targetTabId, (tabDetails) => {
    if (chrome.runtime.lastError || !tabDetails) {
      diagnosticLogger(`Failed to retrieve details for tab ID ${targetTabId}:`, chrome.runtime.lastError?.message || "Tab not found.");
      if (activationCallback) activationCallback(false);
      return;
    }

    chrome.windows.update(tabDetails.windowId, {focused: true}, () => {
      if (chrome.runtime.lastError) {
        diagnosticLogger(`Failed to focus window ${tabDetails.windowId}:`, chrome.runtime.lastError.message);
        if (activationCallback) activationCallback(false);
        return;
      }
      chrome.tabs.update(tabDetails.id, {active: true}, (updatedTab) => {
        if (chrome.runtime.lastError || !updatedTab) {
          diagnosticLogger(`Failed to activate tab ID ${tabDetails.id}:`, chrome.runtime.lastError?.message);
          if (activationCallback) activationCallback(false);
          return;
        }
        diagnosticLogger(`Activated tab ID ${updatedTab.id} in window ${updatedTab.windowId}.`);
        if (activationCallback) activationCallback(true);
      });
    });
  });
}

/**
 * Recursively traverses a Chrome bookmark tree node and collects all actual bookmark items (nodes with a URL).
 * @param {object} node - The current node in the bookmark tree structure.
 * @param {Array<object>} collectedBookmarks - An accumulator array for the bookmarks found.
 * @returns {Array<object>} The array of collected bookmark objects.
 */
function collectAllBookmarksRecursive(node, collectedBookmarks) {
  if (!node) return collectedBookmarks;

  // If the node has a URL, it's a bookmark (not a folder), so add it.
  if (node.url) {
    collectedBookmarks.push(node);
  }

  // If the node has children, recurse into them.
  if (node.children && Array.isArray(node.children)) {
    for (const childNode of node.children) {
      collectAllBookmarksRecursive(childNode, collectedBookmarks);
    }
  }
  return collectedBookmarks;
}

/**
 * Fetches all user bookmarks from the Chrome API and updates the global `userBookmarks` array.
 * @param {Function} resultCallback - A callback function that receives the array of all bookmarks.
 */
function fetchAllUserBookmarks(resultCallback) {
  chrome.bookmarks.getTree((bookmarkTreeNodes) => {
    if (chrome.runtime.lastError) {
      diagnosticLogger("Error fetching bookmark tree:", chrome.runtime.lastError.message);
      resultCallback([]); // Return an empty array on error.
      return;
    }
    const rootNode = bookmarkTreeNodes[0]; // The top-level node of the bookmark tree.
    const allBookmarksFlattened = collectAllBookmarksRecursive(rootNode, []);
    userBookmarks = allBookmarksFlattened; // Update the global store.
    diagnosticLogger(`Successfully fetched and cached ${allBookmarksFlattened.length} bookmarks.`);
    resultCallback(allBookmarksFlattened);
  });
}

/**
 * Initiates a refresh of the cached user bookmarks list.
 * This function is typically called in response to bookmark-related events.
 */
function refreshBookmarkCache() {
  fetchAllUserBookmarks(() => {
    // The global 'userBookmarks' array is updated within fetchAllUserBookmarks.
    // This callback could be used for any post-refresh UI updates if necessary.
  });
}

/**
 * The main initialization routine for the extension's background script.
 * Sets up initial data, configures the badge, and registers all necessary event listeners.
 */
function initializeExtensionCore() {
  diagnosticLogger("Starting extension core initialization process...");

  // Reset all primary data stores to a clean state.
  openTabRegistry = [];
  recentlyClosedRecords = [];
  userBookmarks = [];

  // Prepare the browser action badge for display.
  setupBadgeDisplay();

  // Enumerate all currently open tabs across all browser windows.
  chrome.windows.getAll({populate: true}, (allWindows) => {
    if (chrome.runtime.lastError) {
      diagnosticLogger("Error retrieving all windows for initial population:", chrome.runtime.lastError.message);
      return;
    }

    allWindows.forEach(currentWindow => {
      if (currentWindow.tabs && Array.isArray(currentWindow.tabs)) {
        currentWindow.tabs.forEach(tabItem => {
          registerNewOpenTab(tabItem); // Add each tab to our registry.
        });
      }
    });

    // Ensure a consistent initial order for tabs before any prioritization.
    openTabRegistry.sort((a, b) => a.id - b.id);
    updateExtensionBadge(openTabRegistry.length); // Update badge with the total count.

    // Identify and prioritize the active tab in the current window.
    chrome.tabs.query({currentWindow: true, active: true}, (activeTabs) => {
      if (chrome.runtime.lastError) {
        diagnosticLogger("Error querying active tab during initial setup:", chrome.runtime.lastError.message);
        return;
      }
      if (activeTabs && activeTabs.length > 0) {
        reorderMultipleTabs(activeTabs); // Move the active tab to the front of the list.
        diagnosticLogger(`Initial active tab ID ${activeTabs[0].id} prioritized.`);
      }
    });
  });

  // --- Register Chrome API Event Listeners ---

  // Event listener for when tabs are closed.
  chrome.tabs.onRemoved.addListener((closedTabId, removeInfo) => {
    processRemovedTabs([closedTabId]);
    diagnosticLogger(`Tab ID ${closedTabId} removed. Window closing: ${removeInfo.isWindowClosing}.`);
  });

  // Event listener for when new tabs are created.
  chrome.tabs.onCreated.addListener((createdTab) => {
    if (!createdTab || !createdTab.id) {
      diagnosticLogger("Received invalid tab object on creation event.");
      return;
    }

    // If the newly created tab matches a recently closed tab's URL, remove it from history.
    const closedTabIndex = findTabIndexByUrl(recentlyClosedRecords, createdTab.url);
    if (closedTabIndex !== -1) {
      recentlyClosedRecords.splice(closedTabIndex, 1);
      diagnosticLogger(`Tab with URL ${createdTab.url} reopened, removed from closed history.`);
    }

    registerNewOpenTab(createdTab); // Add the new tab to our active registry.
    prioritizeTabInList(createdTab.id); // New tabs are usually active, so they should be prioritized.
    updateExtensionBadge(openTabRegistry.length); // Update the badge count.
    diagnosticLogger(`Tab ID ${createdTab.id} created and registered.`);
  });

  // Event listener for when a tab's properties (like URL, title) are updated.
  chrome.tabs.onUpdated.addListener((tabId, changeMeta, updatedTab) => {
    // Only proceed if there are relevant changes or the tab has finished loading.
    if (changeMeta.url || changeMeta.title || changeMeta.favIconUrl || changeMeta.status === 'complete') {
      const tabIndex = findTabIndexById(tabId);
      if (tabIndex !== -1) {
        // Merge updated properties to avoid overwriting custom internal data.
        openTabRegistry[tabIndex] = {...openTabRegistry[tabIndex], ...updatedTab};
        diagnosticLogger(`Tab ID ${tabId} updated. Status: ${changeMeta.status || 'N/A'}.`);
      } else {
        // If an updated tab isn't in our registry (e.g., was filtered out), try to register it now if it qualifies.
        if (shouldRegisterTab(updatedTab)) {
          registerNewOpenTab(updatedTab);
          prioritizeTabInList(updatedTab.id); // Also prioritize if it's newly included.
          updateExtensionBadge(openTabRegistry.length);
        }
      }
    }
  });

  // Event listener for when a tab becomes the active tab in its window.
  chrome.tabs.onActivated.addListener((activeInfo) => {
    prioritizeTabInList(activeInfo.tabId);
    diagnosticLogger(`Tab ID ${activeInfo.tabId} activated in window ${activeInfo.windowId}.`);
  });

  // Event listener for when the browser window focus changes.
  chrome.windows.onFocusChanged.addListener((windowId) => {
    // -1 indicates that no window is currently focused (e.g., all windows minimized).
    if (windowId !== chrome.windows.WINDOW_ID_NONE) {
      chrome.tabs.query({windowId: windowId, active: true}, (focusedTabs) => {
        if (chrome.runtime.lastError) {
          diagnosticLogger("Error querying active tab in focused window:", chrome.runtime.lastError.message);
          return;
        }
        if (focusedTabs && focusedTabs.length > 0) {
          reorderMultipleTabs(focusedTabs);
          diagnosticLogger(`Window ID ${windowId} focused. Active tab ID ${focusedTabs[0].id} prioritized.`);
        }
      });
    } else {
      diagnosticLogger("Browser window focus lost (e.g., all windows minimized or closed).");
    }
  });

  // --- Bookmark Event Listeners ---
  // Attach listeners to various bookmark events to keep the bookmark cache fresh.
  const bookmarkEventTypes = ['onCreated', 'onRemoved', 'onChanged', 'onMoved'];
  bookmarkEventTypes.forEach(eventType => {
    chrome.bookmarks[eventType].addListener(() => {
      refreshBookmarkCache();
      diagnosticLogger(`Bookmark event '${eventType}' detected, refreshing cache.`);
    });
  });

  // Perform an initial fetch to populate the bookmark cache.
  refreshBookmarkCache();
}

// Execute the main initialization function when the background script starts.
initializeExtensionCore();