/*
 * Browser Agent Detection Module
 * This utility identifies various browser and platform characteristics
 * by parsing the user agent string provided by the browser environment.
 * It aims for broad compatibility across different module systems.
 */

/* global globalThis: false */ // Declare globalThis for linting purposes

(function (moduleInitializerFunction) {
  // Check for Asynchronous Module Definition (AMD) loader, e.g., RequireJS.
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], function(dependentJQuery) {
      // If AMD is present, register as an anonymous module.
      moduleInitializerFunction(dependentJQuery);
    });
  } else if (typeof module === 'object' && typeof module.exports === 'object') {
    // Check for CommonJS or Node.js-like environments.
    // Export the module's core functionality.
    module.exports = moduleInitializerFunction(require('jquery'));
  } else {
    // If no module system is found, assume a global browser environment.
    // Attach the functionality to the global scope's jQuery object.
    const currentGlobalScope = typeof globalThis !== 'undefined' ? globalThis : window; // Robust global scope access
    moduleInitializerFunction(currentGlobalScope.jQuery);
  }
}(function(targetLibrary) { // Renamed 'jQuery' parameter to 'targetLibrary'
  "use strict"; // Enable strict mode for better code quality and error handling.

  /**
   * Parses a given user agent string to extract detailed browser and operating system information.
   * @param {string} [agentInputString] - The user agent string to analyze. If not provided,
   *                                      it defaults to the current browser's user agent.
   * @returns {object} An object containing properties for detected browser, version, and platform.
   */
  function processUserAgentString(agentInputString) { // Renamed 'uaMatch' to 'processUserAgentString'
    // Ensure a user agent string is available; default to the current navigator's agent.
    if (!agentInputString || typeof agentInputString !== 'string' || agentInputString.trim() === '') {
      agentInputString = (typeof globalThis !== 'undefined' && globalThis.navigator && globalThis.navigator.userAgent) ?
                          globalThis.navigator.userAgent :
                          ''; // Provide a safe fallback for the agent string
    }
    let lowercasedAgent = agentInputString.toLocaleLowerCase(); // Renamed 'ua' to 'lowercasedAgent'

    // Define an ordered list of regular expressions for browser detection.
    // The order is significant as some patterns are more specific than others.
    const browserRecognitionPatterns = [
      // Edge browser detection
      { id: "edge", regex: /(edge)[\\/]([a-zA-Z0-9._]+)/ },
      // Opera (new 'opr' token)
      { id: "opr", regex: /(opr)[\\/]([a-zA-Z0-9._]+)/ },
      // Chrome browser
      { id: "chrome", regex: /(chrome)[ \\/]([a-zA-Z0-9._]+)/ },
      // Safari with version and AppleWebKit (more specific)
      { id: "safari_v_aw", regex: /(version)(applewebkit)[ \\/]([a-zA-Z0-9._]+).*(safari)[ \\/]([a-zA-Z0-9._]+)/ },
      // WebKit with version and Safari (another specific Safari pattern)
      { id: "webkit_v_safari", regex: /(webkit)[ \\/]([a-zA-Z0-9._]+).*(version)[ \\/]([a-zA-Z0-9._]+).*(safari)[ \\/]([a-zA-Z0-9._]+)/ },
      // Generic WebKit detection
      { id: "webkit", regex: /(webkit)[ \\/]([a-zA-Z0-9._]+)/ },
      // Opera (legacy, Presto-based)
      { id: "opera_legacy", regex: /(opera)(?:.*version|)[ \\/]([a-zA-Z0-9._]+)/ },
      // Microsoft Internet Explorer (older versions)
      { id: "msie", regex: /(msie) ([a-zA-Z0-9._]+)/ },
      // Internet Explorer 11+ (using 'trident' token with 'rv' for version)
      { id: "trident_ie", condition: (agent) => agent.indexOf("trident") >= 0, regex: /(rv)(?::| )([a-zA-Z0-9._]+)/, isSecondaryCheck: true },
      // Mozilla-based browsers (if not 'compatible')
      { id: "mozilla", condition: (agent) => agent.indexOf("compatible") < 0, regex: /(mozilla)(?:.*? rv:([a-zA-Z0-9._]+)|)/, isSecondaryCheck: true }
    ];

    let currentBrowserParseResult = []; // Renamed 'match' to 'currentBrowserParseResult'
    let primaryMatchFound = false;

    // Iterate through patterns to find the first match.
    for (const patternDescriptor of browserRecognitionPatterns) {
      if (patternDescriptor.isSecondaryCheck) {
        if (patternDescriptor.condition(lowercasedAgent)) {
          currentBrowserParseResult = patternDescriptor.regex.exec(lowercasedAgent) || [];
          if (currentBrowserParseResult.length > 0) {
            primaryMatchFound = true;
            break;
          }
        }
      } else if (patternDescriptor.regex.test(lowercasedAgent)) { // Pre-check with test for efficiency
        currentBrowserParseResult = patternDescriptor.regex.exec(lowercasedAgent) || [];
        if (currentBrowserParseResult.length > 0) {
          primaryMatchFound = true;
          break;
        }
      }
    }

    // Define an ordered list of regular expressions for platform/OS detection.
    const platformRecognitionPatterns = [ // Renamed 'platform_match' to 'platformRecognitionPatterns'
      /(ipad)/, /(ipod)/, /(iphone)/, /(kindle)/, /(silk)/, /(android)/,
      /(windows phone)/, /(win)/, /(mac)/, /(linux)/, /(cros)/, /(playbook)/,
      /(bb)/, /(blackberry)/
    ];

    let currentPlatformParseResult = []; // Renamed 'platform_match' to 'currentPlatformParseResult'
    for (const platformRegex of platformRecognitionPatterns) {
      currentPlatformParseResult = platformRegex.exec(lowercasedAgent) || [];
      if (currentPlatformParseResult.length > 0) {
        break;
      }
    }

    // Extract relevant tokens from the successful matches.
    let extractedTokens = { // Renamed 'matched' to 'extractedTokens'
      browserIdentifier: currentBrowserParseResult[ 5 ] || currentBrowserParseResult[ 3 ] || currentBrowserParseResult[ 1 ] || "",
      browserVersionString: currentBrowserParseResult[ 2 ] || currentBrowserParseResult[ 4 ] || "0",
      browserVersionNumeric: currentBrowserParseResult[ 4 ] || currentBrowserParseResult[ 2 ] || "0",
      devicePlatform: currentPlatformParseResult[ 0 ] || ""
    };

    let detectionDetails = {}; // Renamed 'browser' to 'detectionDetails'

    // Populate browser-specific flags and version.
    if (extractedTokens.browserIdentifier) {
      detectionDetails[ extractedTokens.browserIdentifier ] = true;
      detectionDetails.version = extractedTokens.browserVersionString;
      detectionDetails.versionNumber = Number.parseInt(extractedTokens.browserVersionNumeric, 10); // Using Number.parseInt
    }

    // Populate platform-specific flags.
    if (extractedTokens.devicePlatform) {
      detectionDetails[ extractedTokens.devicePlatform ] = true;
    }

    // Determine if the device is a mobile platform.
    const mobileDeviceKeys = ["android", "bb", "blackberry", "ipad", "iphone", "ipod", "kindle", "playbook", "silk", "windows phone"];
    let isMobileCandidate = false;
    for (const mobileKey of mobileDeviceKeys) {
      if (detectionDetails[mobileKey]) {
        isMobileCandidate = true;
        break;
      }
    }
    if (isMobileCandidate) {
      detectionDetails.mobile = true;
    }

    // Determine if the device is a desktop platform.
    const desktopDeviceKeys = ["cros", "mac", "linux", "win"];
    let isDesktopCandidate = false;
    for (const desktopKey of desktopDeviceKeys) {
      if (detectionDetails[desktopKey]) {
        isDesktopCandidate = true;
        break;
      }
    }
    if (isDesktopCandidate) {
      detectionDetails.desktop = true;
    }

    // Identify WebKit-based browsers (Chrome, Opera 15+, Safari).
    if (detectionDetails.chrome || detectionDetails.opr || detectionDetails.safari) {
      detectionDetails.webkit = true;
    }

    // Remap IE11 (Trident) and Edge for consistent 'msie' identification.
    if (detectionDetails.rv || detectionDetails.edge) {
      const ieAlias = "msie"; // Use a constant for clarity
      extractedTokens.browserIdentifier = ieAlias;
      detectionDetails[ieAlias] = true;
    }

    // Adjust for Blackberry browsers (often identified as Safari on BlackBerry).
    if (detectionDetails.safari && detectionDetails.blackberry) {
      const bbAlias = "blackberry";
      extractedTokens.browserIdentifier = bbAlias;
      detectionDetails[bbAlias] = true;
    }

    // Adjust for Playbook browsers (often identified as Safari on Playbook).
    if (detectionDetails.safari && detectionDetails.playbook) {
      const pbAlias = "playbook";
      extractedTokens.browserIdentifier = pbAlias;
      detectionDetails[pbAlias] = true;
    }

    // Adjust for BB10 (newer BlackBerry OS, using 'bb' token).
    if (detectionDetails.bb) {
      const bb10Alias = "blackberry"; // Map 'bb' to 'blackberry' for consistency
      extractedTokens.browserIdentifier = bb10Alias;
      detectionDetails[bb10Alias] = true;
    }

    // Adjust for Opera 15+ (identified by 'opr' token).
    if (detectionDetails.opr) {
      const newOperaAlias = "opera";
      extractedTokens.browserIdentifier = newOperaAlias;
      detectionDetails[newOperaAlias] = true;
    }

    // Adjust for Stock Android browsers (often identified as Safari on Android).
    if (detectionDetails.safari && detectionDetails.android) {
      const androidAlias = "android";
      extractedTokens.browserIdentifier = androidAlias;
      detectionDetails[androidAlias] = true;
    }

    // Adjust for Kindle browsers (often identified as Safari on Kindle).
    if (detectionDetails.safari && detectionDetails.kindle) {
      const kindleAlias = "kindle";
      extractedTokens.browserIdentifier = kindleAlias;
      detectionDetails[kindleAlias] = true;
    }

    // Adjust for Kindle Silk browsers (often identified as Safari on Kindle).
    if (detectionDetails.safari && detectionDetails.silk) {
      const silkAlias = "silk";
      extractedTokens.browserIdentifier = silkAlias;
      detectionDetails[silkAlias] = true;
    }

    // Assign the determined primary name and platform to the output object.
    detectionDetails.name = extractedTokens.browserIdentifier;
    detectionDetails.platform = extractedTokens.devicePlatform;

    return detectionDetails;
  }

  // Perform the initial user agent detection using the current browser's UA.
  // Store the result on the global object and expose the parsing function itself.
  let currentExecutionRoot = typeof globalThis !== 'undefined' ? globalThis : window;
  currentExecutionRoot.browserAgentInfo = processUserAgentString(currentExecutionRoot.navigator?.userAgent); // Renamed 'jQBrowser' to 'browserAgentInfo'
  currentExecutionRoot.browserAgentInfo.parseAgentString = processUserAgentString; // Expose the parsing function

  // If a target library (e.g., jQuery) is provided, extend it with the browser information.
  if (typeof targetLibrary !== 'undefined' && targetLibrary) {
    targetLibrary.browser = currentExecutionRoot.browserAgentInfo;
  }

  // Return the main detection object, making it accessible to module loaders.
  return currentExecutionRoot.browserAgentInfo;
}));