;(function(jqAlias, globalObj, docRef, voidVal) {

var NAV_HISTORY_STORAGE_KEY = 'NavTrack.pathHistory';
var DEST_STORAGE_KEY = 'NavTrack.targetPath';
var MAX_HISTORY_ENTRIES = 7; // Increased history length slightly

/**
 * Manages client-side navigation history and redirects.
 * @constructor
 */
function RouteManager() {
  this.exclusionSelector = null; // Stores a CSS selector for elements to ignore clicks on
  this.isVerbose = false;       // Controls debug logging output
  this.instanceId = Math.random().toString(36).substring(2, 9); // Unique ID for this instance
  this.initTimestamp = Date.now(); // Record initialization time
}

RouteManager.prototype = {

  /**
   * Helper for logging debug messages.
   * @param {string} message - The message to log.
   * @param {*} [data] - Optional additional data to log.
   * @private
   */
  _log: function(message, data) {
    if (this.isVerbose) {
      const logPrefix = `[RouteManager:${this.instanceId}] `;
      if (data !== voidVal) {
        console.log(logPrefix + message, data);
      } else {
        console.log(logPrefix + message);
      }
    }
  },

  /**
   * Retrieves an item from localStorage.
   * @param {string} key - The storage key.
   * @returns {*} Parsed JSON object or null.
   * @private
   */
  _retrieveStoredItem: function(key) {
    try {
      const item = globalObj.localStorage.getItem(key);
      if (item === null || item === voidVal) {
        return null; // Return null explicitly if not found
      }
      return JSON.parse(item);
    } catch (e) {
      this._log(`Error parsing stored item for key "${key}":`, e);
      globalObj.localStorage.removeItem(key); // Clear potentially corrupt data
      return null;
    }
  },

  /**
   * Stores an item in localStorage.
   * @param {string} key - The storage key.
   * @param {*} value - The value to store (will be JSON.stringified).
   * @private
   */
  _storeItem: function(key, value) {
    try {
      globalObj.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      this._log(`Error storing item for key "${key}":`, e);
      // Handle potential quota exceeded errors etc.
    }
  },

  /**
   * Removes an item from localStorage.
   * @param {string} key - The storage key.
   * @private
   */
  _clearStoredItem: function(key) {
    globalObj.localStorage.removeItem(key);
  },

  /**
   * Processes the current route upon page load or navigation event.
   * Determines if a redirect is needed or if the current page is valid.
   * @param {Function} [completionCallback] - Callback to execute if no redirect occurs.
   * @returns {RouteManager} The current instance.
   */
  reconcileNavigation: function(completionCallback) {
    const currentPath = this.getCurrentBrowserPath();
    const expectedDestination = this.getOrSetExpectedDestination();
    const lastRecordedRoute = this.getLatestHistoryEntry();

    // Is the user arriving from a previously set target link?
    if (expectedDestination) {
      this._log('Reconciling: Detected an expected destination.', expectedDestination);

      // Clear the link target to prevent infinite loops or stale targets
      this.clearExpectedDestination();

      // If current path does not match the expected destination, redirect
      if (expectedDestination !== currentPath) {
        this._log(`Reconciling: Mismatch - expected ('${expectedDestination}') vs actual ('${currentPath}'). Redirecting.`, {expected: expectedDestination, actual: currentPath});
        this.redirectToLastRecorded();
        return this;
      }

      this._log(`Reconciling: Successful arrival at expected destination ('${currentPath}'). Recording.`, {path: currentPath});
      this.recordCurrentPath(); // Bookmark the successful arrival
    }
    // If not a target, check if current route is consistent with history
    else if (lastRecordedRoute && currentPath !== lastRecordedRoute) {
      this._log(`Reconciling: Route inconsistency - actual ('${currentPath}') vs last recorded ('${lastRecordedRoute}'). Redirecting.`, {actual: currentPath, last: lastRecordedRoute});
      this.redirectToLastRecorded();
      // If base paths are similar, and a callback is provided, invoke it
      if (this.compareUrlRoots(lastRecordedRoute, currentPath) && typeof completionCallback === 'function') {
        completionCallback();
      }
      return this;
    }

    // If we're staying on this page, trigger the callback
    this._log(`Reconciling: Current route ('${currentPath}') is consistent. Invoking callback.`);
    if (typeof completionCallback === 'function') {
      completionCallback();
    }
    return this;
  },

  // --- Configuration and State Management ---

  /**
   * Gets or sets the verbosity (debug logging) state.
   * @param {boolean} [enableLogging] - True to enable, false to disable.
   * @returns {boolean|RouteManager} Current state or the instance.
   */
  setVerbosity: function(enableLogging) {
    if (enableLogging === voidVal) {
      return this.isVerbose;
    }
    this.isVerbose = !!enableLogging; // Ensure boolean
    this._log('Verbosity set to:', this.isVerbose);
    return this;
  },

  /**
   * Clears all stored navigation data (history and target).
   * @returns {RouteManager} The current instance.
   */
  purgeAllData: function() {
    this._log('Purging all stored navigation data.');
    this._clearStoredItem(NAV_HISTORY_STORAGE_KEY);
    this._clearStoredItem(DEST_STORAGE_KEY);
    return this;
  },

  /**
   * Records the current browser path into the navigation history.
   * @returns {RouteManager} The current instance.
   */
  recordCurrentPath: function() {
    const currentPath = this.getCurrentBrowserPath();
    this._log('Recording current path:', currentPath);
    this.addToHistory(currentPath);
    return this;
  },

  /**
   * Adds a given route to the navigation history, maintaining max length.
   * @param {string} pathEntry - The URL path to add.
   * @returns {RouteManager} The current instance.
   */
  addToHistory: function(pathEntry) {
    if (!pathEntry || typeof pathEntry !== 'string') {
      this._log('Attempted to add invalid path to history.', pathEntry);
      return this;
    }
    let currentHistoryList = this.getOrSetNavHistory();
    if (!Array.isArray(currentHistoryList)) {
      currentHistoryList = []; // Ensure it's an array
    }

    // Avoid adding duplicate consecutive entries
    if (currentHistoryList.length > 0 && currentHistoryList[currentHistoryList.length - 1] === pathEntry) {
      this._log('Skipping duplicate consecutive history entry:', pathEntry);
      return this;
    }

    currentHistoryList.push(pathEntry);
    // Trim history to maximum length
    while (currentHistoryList.length > MAX_HISTORY_ENTRIES) {
      currentHistoryList.shift(); // Remove oldest entry
    }
    this.updateHistoryStorage(currentHistoryList);
    this._log('History updated:', currentHistoryList);
    return this;
  },

  /**
   * Gets or sets the navigation history array.
   * @param {Array<string>} [newHistoryState] - The new history array to set.
   * @returns {Array<string>|RouteManager} The current history array or the instance.
   */
  getOrSetNavHistory: function(newHistoryState) {
    if (newHistoryState === voidVal) {
      const storedHistory = this._retrieveStoredItem(NAV_HISTORY_STORAGE_KEY);
      return Array.isArray(storedHistory) ? storedHistory : [];
    }

    if (!Array.isArray(newHistoryState)) {
      this._log('Attempted to set invalid history state (not an array).', newHistoryState);
      return this;
    }
    this._storeItem(NAV_HISTORY_STORAGE_KEY, newHistoryState);
    return this;
  },

  /**
   * Alias for `getOrSetNavHistory` when setting.
   * @param {Array<string>} historyArray - The history array to update.
   * @returns {RouteManager} The current instance.
   */
  updateHistoryStorage: function(historyArray) {
    return this.getOrSetNavHistory(historyArray);
  },

  /**
   * Gets or sets the expected destination path.
   * @param {string} [destinationPath] - The path to set as expected destination. Use `null` or `voidVal` to clear.
   * @returns {string|RouteManager} The current expected destination or the instance.
   */
  getOrSetExpectedDestination: function(destinationPath) {
    if (destinationPath === voidVal) {
      return this._retrieveStoredItem(DEST_STORAGE_KEY);
    }

    if (destinationPath === null) {
      return this.clearExpectedDestination();
    }

    if (typeof destinationPath !== 'string' || destinationPath.trim() === '') {
      this._log('Attempted to set invalid expected destination path.', destinationPath);
      return this;
    }
    this._storeItem(DEST_STORAGE_KEY, destinationPath);
    this._log('Expected destination set to:', destinationPath);
    return this;
  },

  /**
   * Clears the stored expected destination.
   * @returns {RouteManager} The current instance.
   */
  clearExpectedDestination: function() {
    this._log('Clearing expected destination.');
    this._clearStoredItem(DEST_STORAGE_KEY);
    return this;
  },

  /**
   * Gets or sets the CSS selector for elements whose clicks should be ignored.
   * @param {string} [cssSelector] - The CSS selector string.
   * @returns {string|RouteManager} The current selector or the instance.
   */
  setExclusionPattern: function(cssSelector) {
    if (cssSelector === voidVal) {
      return this.exclusionSelector;
    }
    if (cssSelector !== null && typeof cssSelector !== 'string') {
      this._log('Attempted to set invalid exclusion pattern (not string or null).', cssSelector);
      return this;
    }
    this.exclusionSelector = cssSelector;
    this._log('Exclusion pattern set to:', cssSelector);
    return this;
  },

  // --- URL Manipulation and Navigation ---

  /**
   * Gets the current full URL from the browser's location.
   * @returns {string} The current URL.
   */
  getCurrentBrowserPath: function() {
    return globalObj.location.href;
  },

  /**
   * Changes the browser's URL to a new path.
   * If the new path is different from the latest history entry, it's pushed to history.
   * If the new path's base differs, it's set as an expected destination.
   * @param {string} newLocationPath - The URL to navigate to.
   * @returns {RouteManager} The current instance.
   */
  handleRouteChange: function(newLocationPath) {
    if (newLocationPath === voidVal || typeof newLocationPath !== 'string' || newLocationPath.trim() === '') {
      this._log('Attempted to navigate to an invalid path.', newLocationPath);
      return this;
    }

    const currentPath = this.getCurrentBrowserPath();
    const resolvedNewPath = this.normalizePath(newLocationPath); // Ensure absolute path

    if (this.getLatestHistoryEntry() !== resolvedNewPath) {
      if (this.compareUrlRoots(resolvedNewPath, currentPath)) {
        this._log(`Route change: Same base path, adding to history: ${resolvedNewPath}`);
        this.addToHistory(resolvedNewPath);
      } else {
        this._log(`Route change: Different base path, setting as expected destination: ${resolvedNewPath}`);
        this.getOrSetExpectedDestination(resolvedNewPath);
      }
    } else {
      this._log(`Route change: New path is identical to latest history entry. No history update.`);
    }

    this._log('Navigating to:', resolvedNewPath);
    globalObj.location.assign(resolvedNewPath); // Use assign for clearer intent, though direct assignment works
    return this;
  },

  /**
   * Redirects the browser to the latest recorded history entry.
   * @returns {RouteManager} The current instance.
   */
  redirectToLastRecorded: function() {
    const lastEntry = this.getLatestHistoryEntry();
    if (lastEntry) {
      this._log('Redirecting to last recorded history entry:', lastEntry);
      this.handleRouteChange(lastEntry);
    } else {
      this._log('No history entry to redirect to. Staying on current page.');
    }
    return this;
  },

  /**
   * Pops the latest history entry and redirects to the new latest (previous) entry.
   * @returns {RouteManager} The current instance.
   */
  goBackInHistory: function() {
    let currentLog = this.getOrSetNavHistory();
    if (currentLog.length > 1) {
      const poppedEntry = currentLog.pop();
      this._log('Popped history entry:', poppedEntry);
      this.updateHistoryStorage(currentLog);
      this.redirectToLastRecorded();
    } else {
      this._log('History has 1 or fewer entries, cannot go back further.');
    }
    return this;
  },

  /**
   * Initiates an internal navigation process for a given URL.
   * This involves resolving the URL and then handling the route change.
   * @param {string} targetUrl - The URL to navigate to.
   * @returns {RouteManager} The current instance.
   */
  initiateNavigation: function(targetUrl) {
    if (!targetUrl || typeof targetUrl !== 'string') {
      this._log('Invalid URL provided for internal navigation.', targetUrl);
      return this;
    }
    const resolvedPath = this.normalizePath(targetUrl);
    this._log('Initiating internal navigation to:', resolvedPath);
    this.handleRouteChange(resolvedPath);
    return this;
  },

  /**
   * Opens a URL in a new browser window/tab, simulating a click.
   * @param {string} externalUrl - The URL to open.
   */
  launchNewWindow: function(externalUrl) {
    if (!externalUrl || typeof externalUrl !== 'string') {
      this._log('Invalid URL provided for external link.', externalUrl);
      return;
    }
    this._log('Launching new window for:', externalUrl);

    const tempLink = docRef.createElement('a');
    tempLink.setAttribute('href', externalUrl);
    tempLink.setAttribute('target', '_blank');
    tempLink.style.display = 'none'; // Hide the link element

    // Append to body, trigger click, then remove
    docRef.body.appendChild(tempLink);
    tempLink.click();
    docRef.body.removeChild(tempLink);
  },

  // --- Getters ---

  /**
   * Retrieves the last entry from the navigation history.
   * @returns {string|null} The last URL or null if history is empty.
   */
  getLatestHistoryEntry: function() {
    const currentHistorySnapshot = this.getOrSetNavHistory();
    if (Array.isArray(currentHistorySnapshot) && currentHistorySnapshot.length > 0) {
      return currentHistorySnapshot[currentHistorySnapshot.length - 1];
    }
    return null;
  },

  // --- Event Handling ---

  /**
   * Attaches a click event listener to elements matching a selector within the document.
   * Intercepts clicks to handle internal navigation.
   * @param {string} targetSelector - The CSS selector for elements to monitor.
   * @returns {RouteManager} The current instance.
   */
  attachClickListener: function(targetSelector) {
    const instanceRef = this; // Capture 'this' for the event handler scope
    if (typeof targetSelector !== 'string' || targetSelector.trim() === '') {
      this._log('Invalid selector provided for click listener.', targetSelector);
      return this;
    }

    jqAlias(docRef).on('click', targetSelector, function(event) {
      // Ensure the event object is passed
      return instanceRef.handleInterceptedClick(this, event);
    });
    this._log('Click listener attached for selector:', targetSelector);
    return this;
  },

  /**
   * Handles an intercepted click event.
   * Prevents default if the click is handled internally.
   * @param {HTMLElement} clickedElement - The DOM element that was clicked.
   * @param {Event} event - The original click event.
   * @returns {boolean} True if the default action should proceed, false otherwise.
   */
  handleInterceptedClick: function(clickedElement, event) {
    const jQClickedElement = jqAlias(clickedElement);

    // Check if the element should be ignored
    if (this.exclusionSelector && jQClickedElement.is(this.exclusionSelector)) {
      this._log('Intercepted click: Ignoring element due to exclusion pattern.', clickedElement);
      return true; // Let default action proceed
    }

    const hrefValue = jQClickedElement.attr('href');
    if (!hrefValue) {
      this._log('Intercepted click: Element has no href, allowing default.', clickedElement);
      return true;
    }

    this._log('Intercepted click: Detected href:', hrefValue);

    // Visual feedback for navigation (application-specific)
    jqAlias('#navigation-spinner-area .spinner-icon').addClass('is-animating');

    this.initiateNavigation(hrefValue);

    event.preventDefault(); // Prevent default browser navigation
    return false; // Indicate that the event was handled
  }
};

// --- Global Utility Functions ---

/**
 * Normalizes a URL to its absolute form.
 * @param {string} inputUrl - The URL to resolve.
 * @returns {string} The absolute URL.
 */
function normalizePath(inputUrl) {
  const tempAnchor = docRef.createElement('a');
  tempAnchor.href = inputUrl;
  return tempAnchor.href;
}

/**
 * Compares two URLs to check if their base paths (scheme, host, path, excluding query/hash) are equivalent.
 * Case-insensitive comparison.
 * @param {string} pathA - First URL.
 * @param {string} pathB - Second URL.
 * @returns {boolean} True if base paths are equivalent.
 */
function compareUrlRoots(pathA, pathB) {
  if (!pathA || !pathB) return false;

  const getBase = (url) => {
    try {
      const urlObj = new URL(url, globalObj.location.origin); // Ensure full URL for robust parsing
      return urlObj.origin + urlObj.pathname;
    } catch (e) {
      // Fallback for potentially malformed URLs or older browsers
      const parts = url.split('?')[0].split('#')[0];
      return normalizePath(parts); // Use normalizePath to get full origin/pathname
    }
  };

  const baseA = getBase(pathA);
  const baseB = getBase(pathB);

  return baseA.toLowerCase() === baseB.toLowerCase();
}

// Expose the RouteManager instance globally
globalObj.NavigationManager = new RouteManager();

})(window.jQuery || window.Zepto, window, document);