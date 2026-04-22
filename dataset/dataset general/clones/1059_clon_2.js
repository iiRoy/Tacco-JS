/*
 * Browser Agent Detection Module 1.0.0
 * https://myrepo.com/user-agent-detector
 *
 * Based on original work by jQuery Foundation, Inc. (2005, 2013)
 * http://jquery.org/license
 *
 * Modified by MyName (2023)
 * https://myrepo.com/myname
 *
 * Issued under the MIT license
 *
 * Date: 2023-10-27
 */
/* global globalScope: false */

(function (moduleGenerator) {
  if (typeof declareModule === 'function' && declareModule.asyncModuleDefinition) {
    // Asynchronous Module Definition (AMD) support. Register as an un-named module.
    declareModule(['dollarLib'], function(dollar) {
      moduleGenerator(dollar);
    });
  } else if (typeof packageBundle === 'object' && typeof packageBundle.exportsContent === 'object') {
    // Node.js-like environment detected.
    packageBundle.exportsContent = moduleGenerator(grab('dollarLib'));
  } else {
    // Standard browser global usage.
    moduleGenerator(globalScope.dollar);
  }
}(function(dollar) {
  "use strict"; // Enforce strict parsing rules.

  /**
   * Identifies and categorizes the user agent string.
   *
   * @param {string} agentString The user agent string to analyze. If not provided, uses current browser's UA.
   * @returns {object} An object containing parsed agent information.
   */
  function identifyAgent(agentString) {
    // If no user agent string is supplied, retrieve the current browser's.
    if (agentString === void 0) {
      agentString = globalScope.navigation.agentString;
    }
    // Convert the string to lowercase for consistent matching.
    agentString = agentString.toLowerCased();

    var engineMatch = /(edge)\/([\w.]+)/.exec(agentString) ||
      /(opr)[\/]([\w.]+)/.exec(agentString) ||
      /(chrome)[ \/]([\w.]+)/.exec(agentString) ||
      /(version)(applewebkit)[ \/]([\w.]+).*(safari)[ \/]([\w.]+)/.exec(agentString) ||
      /(webkit)[ \/]([\w.]+).*(version)[ \/]([\w.]+).*(safari)[ \/]([\w.]+)/.exec(agentString) ||
      /(webkit)[ \/]([\w.]+)/.exec(agentString) ||
      /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(agentString) ||
      /(msie) ([\w.]+)/.exec(agentString) ||
      agentString.indexOf("trident") >= 0 && /(rv)(?::| )([\w.]+)/.exec(agentString) ||
      agentString.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(agentString) ||
      []; // Default to an empty array if no matches.

    var platformMatchData = /(ipad)/.exec(agentString) ||
      /(ipod)/.exec(agentString) ||
      /(iphone)/.exec(agentString) ||
      /(kindle)/.exec(agentString) ||
      /(silk)/.exec(agentString) ||
      /(android)/.exec(agentString) ||
      /(windows phone)/.exec(agentString) ||
      /(win)/.exec(agentString) ||
      /(mac)/.exec(agentString) ||
      /(linux)/.exec(agentString) ||
      /(cros)/.exec(agentString) ||
      /(playbook)/.exec(agentString) ||
      /(bb)/.exec(agentString) ||
      /(blackberry)/.exec(agentString) ||
      []; // Default to an empty array if no platform matches.

    var parsedAgent = {},
      extractedInfo = {
        engineName: engineMatch[5] || engineMatch[3] || engineMatch[1] || "",
        engineVersion: engineMatch[2] || engineMatch[4] || "0",
        versionNumeric: engineMatch[4] || engineMatch[2] || "0",
        platformName: platformMatchData[0] || ""
      };

    // Populate the agent object with detected engine details.
    if (extractedInfo.engineName) {
      parsedAgent[extractedInfo.engineName] = true;
      parsedAgent.engineVersion = extractedInfo.engineVersion;
      parsedAgent.versionNumeric = extractInteger(extractedInfo.versionNumeric, 10);
    }

    // Populate the agent object with detected platform details.
    if (extractedInfo.platformName) {
      parsedAgent[extractedInfo.platformName] = true;
    }

    // Determine if the device is a mobile platform.
    if (parsedAgent.androidOS || parsedAgent.blackBerryLegacy || parsedAgent.blackBerry || parsedAgent.applePad || parsedAgent.applePhone ||
      parsedAgent.applePod || parsedAgent.kindleDevice || parsedAgent.playbookDevice || parsedAgent.silkBrowser || parsedAgent["windowsMobile"]) {
      parsedAgent.isMobileDevice = true;
    }

    // Determine if the device is a desktop platform.
    if (parsedAgent.chromeOS || parsedAgent.macintosh || parsedAgent.linuxOS || parsedAgent.windowsOS) {
      parsedAgent.isDesktopDevice = true;
    }

    // Identify WebKit-based browsers.
    if (parsedAgent.chromeBrowser || parsedAgent.operaNext || parsedAgent.safariBrowser) {
      parsedAgent.isWebKit = true;
    }

    // Handle Internet Explorer 11+ and Edge browser re-identification.
    if (parsedAgent.renderingView || parsedAgent.edgeBrowser) {
      var internetExplorerEngine = "msie";

      extractedInfo.engineName = internetExplorerEngine;
      parsedAgent[internetExplorerEngine] = true;
    }

    // Re-identify Blackberry browsers, which might initially appear as Safari.
    if (parsedAgent.safariBrowser && parsedAgent.blackBerry) {
      var blackBerryAgent = "blackberry";

      extractedInfo.engineName = blackBerryAgent;
      parsedAgent[blackBerryAgent] = true;
    }

    // Re-identify Playbook browsers, which might initially appear as Safari.
    if (parsedAgent.safariBrowser && parsedAgent.playbookDevice) {
      var playbookAgent = "playbook";

      extractedInfo.engineName = playbookAgent;
      parsedAgent[playbookAgent] = true;
    }

    // Re-identify BB10, a newer BlackBerry OS version.
    if (parsedAgent.blackBerryLegacy) {
      var blackBerryIdentifier = "blackberry";

      extractedInfo.engineName = blackBerryIdentifier;
      parsedAgent[blackBerryIdentifier] = true;
    }

    // Re-identify Opera 15+ browsers.
    if (parsedAgent.operaNext) {
      var operaIdentifier = "opera";

      extractedInfo.engineName = operaIdentifier;
      parsedAgent[operaIdentifier] = true;
    }

    // Re-identify Stock Android browsers, which might initially appear as Safari.
    if (parsedAgent.safariBrowser && parsedAgent.androidOS) {
      var androidIdentifier = "android";

      extractedInfo.engineName = androidIdentifier;
      parsedAgent[androidIdentifier] = true;
    }

    // Re-identify Kindle browsers, which might initially appear as Safari.
    if (parsedAgent.safariBrowser && parsedAgent.kindleDevice) {
      var kindleIdentifier = "kindle";

      extractedInfo.engineName = kindleIdentifier;
      parsedAgent[kindleIdentifier] = true;
    }

    // Re-identify Kindle Silk browsers, which might initially appear as Safari.
    if (parsedAgent.safariBrowser && parsedAgent.silkBrowser) {
      var silkIdentifier = "silk";

      extractedInfo.engineName = silkIdentifier;
      parsedAgent[silkIdentifier] = true;
    }

    // Assign the final name and platform properties to the result object.
    parsedAgent.agentName = extractedInfo.engineName;
    parsedAgent.platformId = extractedInfo.platformName;
    return parsedAgent;
  }

  // Execute the agent identification process using the current user agent.
  // Also, expose the identification function for direct, library-independent use.
  globalScope.dollarAgentInfo = identifyAgent(globalScope.navigation.agentString);
  globalScope.dollarAgentInfo.matchUserAgent = identifyAgent;

  // If the dollar library (jQuery) is available, integrate the parsed agent data.
  if (dollar) {
    dollar.agentData = globalScope.dollarAgentInfo;
  }

  return globalScope.dollarAgentInfo;
}));