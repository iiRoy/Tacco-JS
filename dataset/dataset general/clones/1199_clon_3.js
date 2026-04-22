(function(globalWindow, localUndefined){
  "use strict";

  // ========================================================================
  // Core Initialization Routines

  // Cache Global References
  const
    consoleRef = globalWindow.console || localUndefined, // Suppress linter warnings
    currentDocument = globalWindow.document, // Ensure we interact with the correct document object
    browserNavigator = globalWindow.navigator, // Ensure we interact with the correct navigator object
    sessionDataStore = globalWindow.sessionStorage || false, // Access browser session storage
    setDelay = globalWindow.setTimeout,
    clearDelay = globalWindow.clearTimeout,
    setRepeater = globalWindow.setInterval,
    clearRepeater = globalWindow.clearInterval,
    jsonProcessor = globalWindow.JSON,
    displayAlert = globalWindow.alert,
    NavStateMgr = globalWindow.NavStateMgr = globalWindow.NavStateMgr || {}, // The primary public interface
    oldBrowserHistory = globalWindow.history; // The native browser history object

  // Polyfill for older environments (MooTools compatibility)
  if (!jsonProcessor.stringify) {
    jsonProcessor.stringify = jsonProcessor.encode;
  }
  if (!jsonProcessor.parse) {
    jsonProcessor.parse = jsonProcessor.decode;
  }

  // Prevent multiple loadings
  if ( NavStateMgr._isModuleActive !== localUndefined ) {
    throw new Error('NavStateMgr.js engine has already been loaded and initialized.');
  }
  NavStateMgr._isModuleActive = true; // Mark as loaded

  // Entry point for module setup
  NavStateMgr.bootModule = function(){
    // Verify adapter presence
    if ( typeof NavStateMgr.Adapter === localUndefined ) {
      NavStateMgr.report('NavStateMgr: Adapter not found. Module cannot fully initialize.');
      return false;
    }

    // Initialize the main core engine
    if ( typeof NavStateMgr.primeEngine !== localUndefined ) {
      NavStateMgr.primeEngine();
    }

    // Initialize legacy HTML4 support if available
    if ( typeof NavStateMgr.configureLegacySupport !== localUndefined ) {
      NavStateMgr.configureLegacySupport();
    }

    // Indicate successful boot
    return true;
  };


  // ========================================================================
  // Main Engine Setup

  // Main engine setup function
  NavStateMgr.primeEngine = function(){
    // Prevent re-initialization of the engine kernel
    if ( NavStateMgr.primeEngine._kernelReady ) {
      NavStateMgr.report('NavStateMgr: Engine kernel already primed. Skipping re-initialization.');
      return false;
    }
    NavStateMgr.primeEngine._kernelReady = true;


    // ====================================================================
    // Configuration Settings

    /**
     * NavStateMgr.settings
     * Customizable configuration parameters for the history manager.
     */
    NavStateMgr.settings = NavStateMgr.settings || {};

    // Apply default settings if not already defined
    NavStateMgr.settings = {
      ...{
        hashPollDelayMs: 100, // Interval for hash change checks in milliseconds
        appleBrowserPollMs: 500, // Interval for Safari-specific polling checks
        recheckDelayMs: 500, // Delay for double-checking state changes
        storageSyncIntervalMs: 1000, // Frequency for persisting state to storage
        eventThrottleMs: 250, // Delay between busy events to prevent overload
        enableDebugging: false, // Flag to activate verbose logging
        initialDocumentTitle: currentDocument.title // The title of the page at initial load
      },
      ...NavStateMgr.settings
    };


    // ====================================================================
    // Interval Management

    /**
     * NavStateMgr.activeTimers
     * A collection of all active setInterval identifiers, to be cleared upon module unload.
     */
    NavStateMgr.activeTimers = [];

    /**
     * NavStateMgr.disposeTimers
     * Clears all registered setInterval instances to prevent memory leaks.
     */
    NavStateMgr.disposeTimers = function(){
      if (Array.isArray(NavStateMgr.activeTimers)) {
        NavStateMgr.activeTimers.forEach(timerId => clearRepeater(timerId));
        NavStateMgr.activeTimers = null; // Dereference the array
      }
    };


    // ====================================================================
    // Diagnostic Logging

    /**
     * NavStateMgr.logDebug(message, ...)
     * Emits messages to the console only if debugging is enabled in settings.
     */
    NavStateMgr.logDebug = function(...messages){
      if ( NavStateMgr.settings.enableDebugging ) {
        NavStateMgr.outputMessage('[DEBUG]', ...messages);
      }
    };

    /**
     * NavStateMgr.outputMessage(message, ...)
     * Writes messages to the browser console and an optional DOM element.
     */
    NavStateMgr.outputMessage = function(...args){
      const hasConsole = consoleRef && typeof consoleRef.log === 'function';
      const logTargetElement = currentDocument.getElementById('log_output_area');
      let combinedMessage = '';

      // Prepare messages for output
      const formattedArgs = args.map(arg => {
        if (typeof arg === 'object' && arg !== null && typeof jsonProcessor !== localUndefined) {
          try {
            return jsonProcessor.stringify(arg);
          } catch (e) {
            return '[Circular Object]'; // Handle circular references gracefully
          }
        }
        return String(arg);
      });

      combinedMessage = formattedArgs.join(' ');

      // Output to console
      if (hasConsole) {
        if (typeof consoleRef.debug === 'function') {
          consoleRef.debug(combinedMessage);
        } else {
          consoleRef.log(combinedMessage);
        }
      }

      // Output to a designated textarea if available
      if (logTargetElement && logTargetElement.tagName === 'TEXTAREA') {
        logTargetElement.value += combinedMessage + '\n----------------\n';
        logTargetElement.scrollTop = logTargetElement.scrollHeight - logTargetElement.clientHeight;
      }
      // Fallback to alert if no console and no textarea
      else if ( !hasConsole ) {
        displayAlert(combinedMessage);
      }

      return true;
    };


    // ====================================================================
    // Browser Capability Detection

    /**
     * NavStateMgr.retrieveIEMainVersion()
     * Determines the major version number of Internet Explorer.
     * @returns {number|boolean} The major version or false if not IE.
     * @license Public Domain
     * @author Benjamin Arthur Lupton <contact@balupton.com>
     * @author James Padolsey <https://gist.github.com/527683>
     */
    NavStateMgr.retrieveIEMainVersion = function(){
      if ( NavStateMgr.retrieveIEMainVersion._cachedResult !== localUndefined ) {
        return NavStateMgr.retrieveIEMainVersion._cachedResult;
      }

      let version = 3;
      const testDiv = currentDocument.createElement('div');
      const allTags = testDiv.getElementsByTagName('i');
      while ( (testDiv.innerHTML = `<!--[if gt IE ${++version}]><i></i><![endif]-->`) && allTags[0] ) {}
      const result = (version > 4) ? version : false;
      NavStateMgr.retrieveIEMainVersion._cachedResult = result;
      return result;
    };

    /**
     * NavStateMgr.isLegacyIEBrowser()
     * Checks if the current browser is an Internet Explorer version.
     * @returns {boolean} True if IE, false otherwise.
     */
    NavStateMgr.isLegacyIEBrowser = function(){
      if ( NavStateMgr.isLegacyIEBrowser._cachedResult !== localUndefined ) {
        return NavStateMgr.isLegacyIEBrowser._cachedResult;
      }
      const result = Boolean(NavStateMgr.retrieveIEMainVersion());
      NavStateMgr.isLegacyIEBrowser._cachedResult = result;
      return result;
    };

    /**
     * NavStateMgr.compatModes
     * Flags indicating which browser features require emulation or polyfills.
     */
    NavStateMgr.compatModes = {
      pushStateFallbackRequired: !Boolean(
        oldBrowserHistory && oldBrowserHistory.pushState && oldBrowserHistory.replaceState
        && !(
          (/ Mobile\/(?:[1-7][a-z]|8(?:[abcde]|f(?:1[0-8])))/i).test(browserNavigator.userAgent) || /* iOS < 4.3 */
          (/AppleWebKit\/5(?:[0-2]|3[0-2])/i).test(browserNavigator.userAgent) /* Older WebKit versions */
        )
      ),
      hashChangeEventPolyfill: Boolean(
        !(('onhashchange' in globalWindow) || ('onhashchange' in currentDocument))
        ||
        (NavStateMgr.isLegacyIEBrowser() && NavStateMgr.retrieveIEMainVersion() < 8)
      )
    };

    /**
     * NavStateMgr.isModernHistoryAPIActive
     * Indicates whether the native HTML5 History API is fully operational.
     */
    NavStateMgr.isModernHistoryAPIActive = !NavStateMgr.compatModes.pushStateFallbackRequired;

    /**
     * NavStateMgr.platformQuirks
     * A collection of known browser-specific bugs and inconsistencies.
     */
    NavStateMgr.platformQuirks = {
      /**
       * Safari 5 and iOS 4: state not restored correctly after hash replacement via `replaceState`.
       * Ref: https://bugs.webkit.org/show_bug.cgi?id=56249
       */
      safariSetHashIssue: Boolean(!NavStateMgr.compatModes.pushStateFallbackRequired && browserNavigator.vendor === 'Apple Computer, Inc.' && /AppleWebKit\/5(?:[0-2]|3[0-3])/.test(browserNavigator.userAgent)),

      /**
       * Safari 5 and iOS 4: state changes sometimes fail under heavy load.
       * Ref: https://bugs.webkit.org/show_bug.cgi?id=42940
       */
      safariBusyPoll: Boolean(!NavStateMgr.compatModes.pushStateFallbackRequired && browserNavigator.vendor === 'Apple Computer, Inc.' && /AppleWebKit\/5(?:[0-2]|3[0-3])/.test(browserNavigator.userAgent)),

      /**
       * MSIE 6 and 7: hash changes may require a second application to take effect.
       */
      ieHashDoubleCheck: Boolean(NavStateMgr.isLegacyIEBrowser() && NavStateMgr.retrieveIEMainVersion() < 8),

      /**
       * MSIE 6: entire hash must be URL-encoded for `onHashChange` to fire.
       */
      ieHashEncodingRequired: Boolean(NavStateMgr.isLegacyIEBrowser() && NavStateMgr.retrieveIEMainVersion() < 7)
    };

    /**
     * NavStateMgr.isObjectEmpty(targetObject)
     * Determines if an object has no enumerable properties.
     * @param {Object} targetObject The object to check.
     * @returns {boolean} True if the object is empty, false otherwise.
     */
    NavStateMgr.isObjectEmpty = function(targetObject) {
      if (typeof targetObject !== 'object' || targetObject === null) {
        return true; // Non-objects or null are considered "empty" in this context
      }
      return Object.keys(targetObject).length === 0;
    };

    /**
     * NavStateMgr.duplicateObject(sourceObject)
     * Creates a deep clone of an object, breaking all references to the original.
     * Uses JSON serialization for simplicity, but has limitations (e.g., functions, dates).
     * @param {Object} sourceObject The object to clone.
     * @returns {Object} A new, cloned object.
     */
    NavStateMgr.duplicateObject = function(sourceObject) {
      if (typeof sourceObject !== 'object' || sourceObject === null) {
        return sourceObject; // Return primitives/null directly
      }
      try {
        const serialized = jsonProcessor.stringify(sourceObject);
        return jsonProcessor.parse(serialized);
      } catch (error) {
        NavStateMgr.outputMessage('NavStateMgr: Error cloning object via JSON:', error);
        return {}; // Return an empty object on error
      }
    };


    // ====================================================================
    // URL Manipulation Utilities

    /**
     * NavStateMgr.fetchRootDomainPath()
     * Extracts the root URL (e.g., "http://example.com" or "http://example.com:8080").
     * @returns {string} The root URL.
     */
    NavStateMgr.fetchRootDomainPath = function(){
      const currentLoc = currentDocument.location;
      let rootPath = `${currentLoc.protocol}//${currentLoc.hostname || currentLoc.host}`;
      if ( currentLoc.port ) {
        rootPath += `:${currentLoc.port}`;
      }
      return `${rootPath}/`;
    };

    /**
     * NavStateMgr.extractBaseElementHref()
     * Retrieves the `href` attribute from the `<base>` HTML element, if present.
     * @returns {string} The base href, or an empty string if not found.
     */
    NavStateMgr.extractBaseElementHref = function(){
      const baseElements = currentDocument.getElementsByTagName('base');
      if ( baseElements.length === 0 ) {
        return '';
      }
      const baseEl = baseElements[0];
      let baseReference = baseEl.href.replace(/[^/]+$/,''); // Remove filename
      baseReference = baseReference.replace(/\/+$/,''); // Remove trailing slashes
      return baseReference ? `${baseReference}/` : '';
    };

    /**
     * NavStateMgr.determineBaseURL()
     * Provides the most appropriate base URL, prioritizing `<base href>`, then the current page's directory, then the root domain.
     * @returns {string} The resolved base URL.
     */
    NavStateMgr.determineBaseURL = function(){
      return NavStateMgr.extractBaseElementHref() || NavStateMgr.getDirectoryURL() || NavStateMgr.fetchRootDomainPath();
    };

    /**
     * NavStateMgr.getCurrentPagePath()
     * Obtains the full URL of the current page, excluding query strings and hash.
     * @returns {string} The current page's URL path.
     */
    NavStateMgr.getCurrentPagePath = function(){
      const currentState = NavStateMgr.getState(false, false);
      const urlFromState = (currentState && currentState.url) ? currentState.url : currentDocument.location.href;

      // Extract path, ensuring a trailing slash for directories
      let pagePath = urlFromState.replace(/\/+$/,''); // Remove trailing slashes initially
      pagePath = pagePath.replace(/[^\/]+$/, (match) => {
        return (/\!/).test(match) ? match : `${match}/`; // Keep '!' paths, add slash to others
      });
      return pagePath;
    };

    /**
     * NavStateMgr.getDirectoryURL()
     * Returns the URL of the directory containing the current page.
     * @returns {string} The directory URL with a trailing slash.
     */
    NavStateMgr.getDirectoryURL = function(){
      const currentLocHref = currentDocument.location.href;
      const pathWithoutQueryOrHash = currentLocHref.split(/[?#]/)[0]; // Remove query and hash
      const lastSlashIndex = pathWithoutQueryOrHash.lastIndexOf('/');
      if (lastSlashIndex === -1) {
          return `${pathWithoutQueryOrHash}/`; // No slashes, likely root file
      }
      return `${pathWithoutQueryOrHash.substring(0, lastSlashIndex + 1)}`;
    };

    /**
     * NavStateMgr.resolveAbsoluteURL(relativePath, useBaseHref)
     * Converts a relative URL into a full, absolute URL.
     * @param {string} relativePath The URL to resolve.
     * @param {boolean} [useBaseHref=true] Whether to use the `<base href>` for resolution.
     * @returns {string} The fully qualified absolute URL.
     */
    NavStateMgr.resolveAbsoluteURL = function(relativePath, useBaseHref = true){
      let absoluteUrl = relativePath;
      const firstChar = relativePath.charAt(0);

      // Check for already absolute URL
      if ( /[a-z]+:\/\//.test(relativePath) ) {
        // Already a full URL, no change needed
      }
      // Root-relative URL (starts with '/')
      else if ( firstChar === '/' ) {
        absoluteUrl = NavStateMgr.fetchRootDomainPath() + relativePath.substring(1);
      }
      // Hash-only URL (starts with '#')
      else if ( firstChar === '#' ) {
        absoluteUrl = NavStateMgr.getCurrentPagePath().replace(/#!*/,'') + relativePath;
      }
      // Query-only URL (starts with '?')
      else if ( firstChar === '?' ) {
        absoluteUrl = NavStateMgr.getCurrentPagePath().replace(/[\?#]!*/,'') + relativePath;
      }
      // Standard relative URL
      else {
        const baseForRelative = useBaseHref ? NavStateMgr.determineBaseURL() : NavStateMgr.getDirectoryURL();
        absoluteUrl = baseForRelative + relativePath.replace(/^(\!\/)+/,'');
      }

      // Remove any trailing hash symbols
      return absoluteUrl.replace(/#$/,'');
    };

    /**
     * NavStateMgr.makeRelativeURL(fullUrl)
     * Converts a full absolute URL into a URL relative to the current base.
     * @param {string} fullUrl The absolute URL to shorten.
     * @returns {string} The relative URL.
     */
    NavStateMgr.makeRelativeURL = function(fullUrl){
      // Implementation for getShortUrl starts here
      const baseUrl = NavStateMgr.determineBaseURL();
      if (fullUrl.startsWith(baseUrl)) {
        return fullUrl.substring(baseUrl.length);
      }
      return fullUrl; // If not relative to base, return as is
    };

    // Placeholder for remaining original code (NavStateMgr.getShortUrl)
    // The original code was truncated, so I'll just add a simple implementation for this example.
    // ... rest of the original code would continue here ...
  };
})(window,undefined);