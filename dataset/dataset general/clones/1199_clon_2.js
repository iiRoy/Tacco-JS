(function(globalScope,voidValue){
  "use strict";

  // ========================================================================
  // Core Module Initialization

  // Localize Global References
  var
    debugLog = globalScope.debugLog || voidValue, // Suppress linter warnings
    pageContent = globalScope.document, // Ensure we use the correct document object
    browserAgent = globalScope.navigator, // Ensure we use the correct navigator object
    sessionStore = globalScope.sessionStorage || false, // Access session storage
    delayCall = globalScope.setTimeout,
    cancelDelay = globalScope.clearTimeout,
    repeatCall = globalScope.setInterval,
    cancelRepeat = globalScope.clearInterval,
    dataSerializer = globalScope.JSON,
    notifyUser = globalScope.alert,
    Chronicle = globalScope.Chronicle = globalScope.Chronicle || {}, // Public API for Chronicle
    legacyHistory = globalScope.history; // Reference to the browser's native history

  // Adapt for MooTools JSON methods if present
  dataSerializer.serialize = dataSerializer.serialize || dataSerializer.encodeData;
  dataSerializer.deserialize = dataSerializer.deserialize || dataSerializer.decodeData;

  // Verify if Chronicle is already loaded
  if ( typeof Chronicle.setup !== 'undefined' ) {
    throw new Error('Chronicle module is already active...');
  }

  // Initialize the main Chronicle functionality
  Chronicle.setup = function(){
    // Check if the adapter is available
    if ( typeof Chronicle.Connector === 'undefined' ) {
      return false;
    }

    // Check if the core engine needs to be initialized
    if ( typeof Chronicle.initializeEngine !== 'undefined' ) {
      Chronicle.initializeEngine();
    }

    // Check if HTML4 compatibility needs to be activated
    if ( typeof Chronicle.activateHtml4Support !== 'undefined' ) {
      Chronicle.activateHtml4Support();
    }

    // Indicate successful initialization
    return true;
  };


  // ========================================================================
  // Initialize Core Logic

  // Set up the core components
  Chronicle.initializeEngine = function(){
    // Perform initialization
    if ( typeof Chronicle.initializeEngine.isReady !== 'undefined' ) {
      // Already set up, exit
      return false;
    }
    else {
      Chronicle.initializeEngine.isReady = true;
    }


    // ====================================================================
    // Configuration Settings

    /**
     * Chronicle.settings
     * Customizable options for the module
     */
    Chronicle.settings = Chronicle.settings || {};

    /**
     * Chronicle.settings.fragmentUpdatePeriod
     * The duration between checks for hash changes
     */
    Chronicle.settings.fragmentUpdatePeriod = Chronicle.settings.fragmentUpdatePeriod || 100;

    /**
     * Chronicle.settings.safariCheckDelay
     * The duration between polling checks specifically for Safari
     */
    Chronicle.settings.safariCheckDelay = Chronicle.settings.safariCheckDelay || 500;

    /**
     * Chronicle.settings.reverificationInterval
     * The time to wait before performing a secondary check for state changes
     */
    Chronicle.settings.reverificationInterval = Chronicle.settings.reverificationInterval || 500;

    /**
     * Chronicle.settings.storageSyncInterval
     * The interval at which state data is synchronized with storage
     */
    Chronicle.settings.storageSyncInterval = Chronicle.settings.storageSyncInterval || 1000;

    /**
     * Chronicle.settings.activityPauseDuration
     * Delay period for busy events to prevent rapid firing
     */
    Chronicle.settings.activityPauseDuration = Chronicle.settings.activityPauseDuration || 250;

    /**
     * Chronicle.settings.enableLogging
     * If true, enables debugging messages to be output
     */
    Chronicle.settings.enableLogging = Chronicle.settings.enableLogging || false;

    /**
     * Chronicle.settings.startPageTitle
     * The title of the initial browser state
     */
    Chronicle.settings.startPageTitle = Chronicle.settings.startPageTitle || pageContent.title;


    // ====================================================================
    // Timer Management

    /**
     * Chronicle.activeTimers
     * A collection of active setInterval instances to be cleared upon unload.
     */
    Chronicle.activeTimers = [];

    /**
     * Chronicle.clearAllTimers
     * Terminates all active setInterval instances.
     */
    Chronicle.clearAllTimers = function(){
      var counter, timerList = Chronicle.activeTimers;
      if (typeof timerList !== "undefined" && timerList !== null) {
        for (counter = 0; counter < timerList.length; counter++) {
          cancelRepeat(timerList[counter]);
        }
        Chronicle.activeTimers = null;
      }
    };


    // ====================================================================
    // Logging Utilities

    /**
     * Chronicle.trace(message,...)
     * Records the provided arguments if logging is enabled
     */
    Chronicle.trace = function(){
      if ( (Chronicle.settings.enableLogging || false) ) {
        Chronicle.record.apply(Chronicle, arguments);
      }
    };

    /**
     * Chronicle.record(message,...)
     * Records the provided arguments to the console or a textarea
     */
    Chronicle.record = function(){
      // Setup
      var
        consoleAvailable = !(typeof debugLog === 'undefined' || typeof debugLog.output === 'undefined' || typeof debugLog.output.apply === 'undefined'),
        outputArea = pageContent.getElementById('eventLog'),
        logEntry,
        idx, total,
        inputArgs, currentArg
        ;

      // Output to Browser Console
      if ( consoleAvailable ) {
        inputArgs = Array.prototype.slice.call(arguments);
        logEntry = inputArgs.shift();
        if ( typeof debugLog.diag !== 'undefined' ) {
          debugLog.diag.apply(debugLog, [logEntry, inputArgs]);
        }
        else {
          debugLog.output.apply(debugLog, [logEntry, inputArgs]);
        }
      }
      else {
        logEntry = ("\n" + arguments[0] + "\n");
      }

      // Output to Textarea or Alert
      for ( idx = 1, total = arguments.length; idx < total; ++idx ) {
        currentArg = arguments[idx];
        if ( typeof currentArg === 'object' && typeof dataSerializer !== 'undefined' ) {
          try {
            currentArg = dataSerializer.serialize(currentArg);
          }
          catch ( parsingError ) {
            // Handle recursive object issues
          }
        }
        logEntry += "\n" + currentArg + "\n";
      }

      // Update Textarea
      if ( outputArea ) {
        outputArea.value += logEntry + "\n-----\n";
        outputArea.scrollTop = outputArea.scrollHeight - outputArea.clientHeight;
      }
      // If no textarea and no console, use alert
      else if ( !consoleAvailable ) {
        notifyUser(logEntry);
      }

      // Return success
      return true;
    };


    // ====================================================================
    // Feature Emulation Status

    /**
     * Chronicle.getIEMainVersion()
     * Retrieves the primary version number of Internet Explorer
     * @return {integer}
     * @license Public Domain
     * @author Benjamin Arthur Lupton <contact@balupton.com>
     * @author James Padolsey <https://gist.github.com/527683>
     */
    Chronicle.getIEMainVersion = function(){
      var versionResult = Chronicle.getIEMainVersion.cachedValue =
          (typeof Chronicle.getIEMainVersion.cachedValue !== 'undefined')
        ? Chronicle.getIEMainVersion.cachedValue
        : (function(){
            var ver = 3,
                tempDiv = pageContent.createElement('div'),
                allTags = tempDiv.getElementsByTagName('i');
            while ( (tempDiv.innerHTML = '<!--[if gt IE ' + (++ver) + ']><i></i><![endif]-->') && allTags[0] ) {}
            return (ver > 4) ? ver : false;
          })()
        ;
      return versionResult;
    };

    /**
     * Chronicle.isIEMode()
     * Determines if the current browser is Internet Explorer
     * @return {boolean}
     * @license Public Domain
     * @author Benjamin Arthur Lupton <contact@balupton.com>
     */
    Chronicle.isIEMode = function(){
      var ieStatus =
        Chronicle.isIEMode.cachedValue =
        (typeof Chronicle.isIEMode.cachedValue !== 'undefined')
          ? Chronicle.isIEMode.cachedValue
          : Boolean(Chronicle.getIEMainVersion())
        ;
      return ieStatus;
    };

    /**
     * Chronicle.simulatedFeatures
     * Identifies which browser features require polyfilling or emulation
     */
    Chronicle.simulatedFeatures = {
      statePush: !Boolean(
        globalScope.history && globalScope.history.pushState && globalScope.history.replaceState
        && !(
          (/ Mobile\/([1-7][a-z]|(8([abcde]|f(1[0-8]))))/i).test(browserAgent.userAgent) /* disable for versions of iOS before version 4.3 (8F190) */
          || (/AppleWebKit\/5([0-2]|3[0-2])/i).test(browserAgent.userAgent) /* disable for the mercury iOS browser, or at least older versions of the webkit engine */
        )
      ),
      fragmentChange: Boolean(
        !(('onhashchange' in globalScope) || ('onhashchange' in pageContent))
        ||
        (Chronicle.isIEMode() && Chronicle.getIEMainVersion() < 8)
      )
    };

    /**
     * Chronicle.isActive
     * Indicates whether Chronicle's state management is operational
     */
    Chronicle.isActive = !Chronicle.simulatedFeatures.statePush;

    /**
     * Chronicle.knownIssues
     * List of identified browser-specific bugs
     */
    Chronicle.knownIssues = {
      /**
       * Safari 5 and Safari iOS 4 fail to return to the correct state once a hash is replaced by a `replaceState` call
       * https://bugs.webkit.org/show_bug.cgi?id=56249
       */
      fragmentSetIssue: Boolean(!Chronicle.simulatedFeatures.statePush && browserAgent.vendor === 'Apple Computer, Inc.' && /AppleWebKit\/5([0-2]|3[0-3])/.test(browserAgent.userAgent)),

      /**
       * Safari 5 and Safari iOS 4 sometimes fail to apply the state change under busy conditions
       * https://bugs.webkit.org/show_bug.cgi?id=42940
       */
      safariPollingBug: Boolean(!Chronicle.simulatedFeatures.statePush && browserAgent.vendor === 'Apple Computer, Inc.' && /AppleWebKit\/5([0-2]|3[0-3])/.test(browserAgent.userAgent)),

      /**
       * MSIE 6 and 7 sometimes do not apply a hash even it was told to (requiring a second call to the apply function)
       */
      ieVerificationGlitch: Boolean(Chronicle.isIEMode() && Chronicle.getIEMainVersion() < 8),

      /**
       * MSIE 6 requires the entire hash to be encoded for the hashes to trigger the onHashChange event
       */
      fragmentEncodingProblem: Boolean(Chronicle.isIEMode() && Chronicle.getIEMainVersion() < 7)
    };

    /**
     * Chronicle.isObjectEmpty(targetObj)
     * Checks if a given Object contains no properties
     * @param {Object} targetObj
     * @return {boolean}
     */
    Chronicle.isObjectEmpty = function(targetObj) {
      for ( var propName in targetObj ) {
        return false;
      }
      return true;
    };

    /**
     * Chronicle.duplicateObject(originalObj)
     * Creates a deep copy of an object, severing all references to the original
     * @param {Object} originalObj
     * @return {Object}
     */
    Chronicle.duplicateObject = function(originalObj) {
      var serializedData, clonedObject;
      if ( originalObj ) {
        serializedData = dataSerializer.serialize(originalObj);
        clonedObject = dataSerializer.deserialize(serializedData);
      }
      else {
        clonedObject = {};
      }
      return clonedObject;
    };


    // ====================================================================
    // URL Processing Functions

    /**
     * Chronicle.fetchBaseDomainUrl()
     * Transforms "http://example.com/path/file.html?query" into "http://example.com"
     * @return {String} baseDomainUrl
     */
    Chronicle.fetchBaseDomainUrl = function(){
      // Generate
      var baseDomainUrl = pageContent.location.protocol + '//' + (pageContent.location.hostname || pageContent.location.host);
      if ( pageContent.location.port || false ) {
        baseDomainUrl += ':' + pageContent.location.port;
      }
      baseDomainUrl += '/';

      // Return the constructed URL
      return baseDomainUrl;
    };

    /**
     * Chronicle.retrieveBaseLink()
     * Extracts the `href` attribute from the `<base href="...">` element if it exists
     * @return {String} baseLinkRef
     */
    Chronicle.retrieveBaseLink = function(){
      // Create
      var
        baseLinkElements = pageContent.getElementsByTagName('base'),
        baseLinkElement = null,
        baseLinkRef = '';

      // Check for Base Element
      if ( baseLinkElements.length === 1 ) {
        // Prepare for Base Element
        baseLinkElement = baseLinkElements[0];
        baseLinkRef = baseLinkElement.href.replace(/[^\/]+$/,'');
      }

      // Adjust trailing slash
      baseLinkRef = baseLinkRef.replace(/\/+$/,'');
      if ( baseLinkRef ) baseLinkRef += '/';

      // Return the base link reference
      return baseLinkRef;
    };

    /**
     * Chronicle.getPrimaryUrl()
     * Obtains the most appropriate base URL (baseHref, basePageUrl, or rootUrl)
     * @return {String} primaryUrl
     */
    Chronicle.getPrimaryUrl = function(){
      // Create
      var primaryUrl = Chronicle.retrieveBaseLink() || Chronicle.getPageDirectoryUrl() || Chronicle.fetchBaseDomainUrl();

      // Return the primary URL
      return primaryUrl;
    };

    /**
     * Chronicle.getCurrentPageUrl()
     * Retrieves the URL of the currently displayed page
     * @return {String} currentPageUrl
     */
    Chronicle.getCurrentPageUrl = function(){
      // Fetch
      var
        currentModuleState = Chronicle.obtainCurrentState(false, false),
        currentLocationUrl = (currentModuleState || {}).url || pageContent.location.href,
        currentPageUrl;

      // Create
      currentPageUrl = currentLocationUrl.replace(/\/+$/,'').replace(/[^\/]+$/,function(segment,idx,fullStr){
        return (/\!/).test(segment) ? segment : segment+'/';
      });

      // Return the page URL
      return currentPageUrl;
    };

    /**
     * Chronicle.getPageDirectoryUrl()
     * Fetches the URL of the directory containing the current page
     * @return {String} pageDirectoryUrl
     */
    Chronicle.getPageDirectoryUrl = function(){
      // Create
      var pageDirectoryUrl = pageContent.location.href.replace(/[#\?].*/,'').replace(/[^\/]+$/,function(segment,idx,fullStr){
        return (/[^\/]$/).test(segment) ? '' : segment;
      }).replace(/\/+$/,'')+'/';

      // Return the directory URL
      return pageDirectoryUrl;
    };

    /**
     * Chronicle.resolveAbsoluteUrl(targetUrl, useBaseLink)
     * Converts a relative URL into an absolute URL
     * @param {string} targetUrl
     * @param {Boolean} useBaseLink - whether to consider the <base> tag
     * @return {string} absoluteUrl
     */
    Chronicle.resolveAbsoluteUrl = function(targetUrl, useBaseLink){
      // Prepare
      var absoluteUrl = targetUrl, firstCharacter = targetUrl.substring(0,1);
      useBaseLink = (typeof useBaseLink === 'undefined') ? true : useBaseLink;

      // Check the URL type
      if ( /[a-z]+\:\/\//.test(targetUrl) ) {
        // Already a full absolute URL
      }
      else if ( firstCharacter === '/' ) {
        // Root-relative URL
        absoluteUrl = Chronicle.fetchBaseDomainUrl() + targetUrl.replace(/^\/+/,'');
      }
      else if ( firstCharacter === '#' ) {
        // Anchor URL
        absoluteUrl = Chronicle.getCurrentPageUrl().replace(/#!*/,'') + targetUrl;
      }
      else if ( firstCharacter === '?' ) {
        // Query string URL
        absoluteUrl = Chronicle.getCurrentPageUrl().replace(/[\?#]!*/,'') + targetUrl;
      }
      else {
        // Relative URL
        if ( useBaseLink ) {
          absoluteUrl = Chronicle.getPrimaryUrl() + targetUrl.replace(/^(\!\/)+/,'');
        } else {
          absoluteUrl = Chronicle.getPageDirectoryUrl() + targetUrl.replace(/^(\!\/)+/,'');
        }
        // The above condition is important because hashes relative to baseHref
        // could become problematic if baseHref changes, whereas basePageUrl is stable.
      }

      // Return the absolute URL, removing any trailing hash
      return absoluteUrl.replace(/\#$/,'');
    };

    /**
     * Chronicle.shortenUrl(longUrl)
     * Converts an absolute URL into a relative URL
     * @param {string} longUrl
     * @return {string} relativeUrl
     */
    Chronicle.shortenUrl = function(longUrl){
      // Prepare