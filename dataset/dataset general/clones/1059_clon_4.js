(function (initializer) {
  if (typeof define === 'function' && define.amd) {
    // Asynchronous Module Definition. Register as an anonymous module.
    define(['jquery'], function (dependency) {
      initializer(dependency);
    });
  } else if (typeof module === 'object' && typeof module.exports === 'object') {
    // Node-like environment detection
    module.exports = initializer(require('jquery'));
  } else {
    // Standard browser global scope
    initializer(window.jQuery);
  }
}(function (externalFramework) {
  "use strict";

  function analyzeUserAgentString(inputAgentText) {
    const lowercasedAgentText = (inputAgentText === undefined ? window.navigator.userAgent : inputAgentText).toLowerCase();

    let primaryAgentIdentification = {};
    let primaryPlatformIdentification = {};

    // Ordered sequence of browser identification rules
    const browserRecognitionRules = [
      {
        pattern: /(edge)\/([\w.]+)/,
        extract: (m) => ({ id: m[1], ver: m[2], verNum: m[2] })
      },
      {
        pattern: /(opr)[\/]([\w.]+)/,
        extract: (m) => ({ id: m[1], ver: m[2], verNum: m[2] })
      },
      {
        pattern: /(chrome)[ \/]([\w.]+)/,
        extract: (m) => ({ id: m[1], ver: m[2], verNum: m[2] })
      },
      // Safari variant 1 (version and applewebkit before safari)
      {
        pattern: /(version)(applewebkit)[ \/]([\w.]+).*(safari)[ \/]([\w.]+)/,
        extract: (m) => ({ id: m[5], ver: m[6], verNum: m[6] })
      },
      // Safari variant 2 (webkit and version before safari)
      {
        pattern: /(webkit)[ \/]([\w.]+).*(version)[ \/]([\w.]+).*(safari)[ \/]([\w.]+)/,
        extract: (m) => ({ id: m[5], ver: m[6], verNum: m[6] })
      },
      // Generic Webkit
      {
        pattern: /(webkit)[ \/]([\w.]+)/,
        extract: (m) => ({ id: m[1], ver: m[2], verNum: m[2] })
      },
      {
        pattern: /(opera)(?:.*version|)[ \/]([\w.]+)/,
        extract: (m) => ({ id: m[1], ver: m[2], verNum: m[2] })
      },
      {
        pattern: /(msie) ([\w.]+)/,
        extract: (m) => ({ id: m[1], ver: m[2], verNum: m[2] })
      },
      // Trident special case for IE11+
      {
        condition: (txt) => txt.indexOf("trident") >= 0,
        pattern: /(rv)(?::| )([\w.]+)/,
        extract: (m) => ({ id: m[1], ver: m[2], verNum: m[2] })
      },
      // Mozilla special case (not compatible)
      {
        condition: (txt) => txt.indexOf("compatible") < 0,
        pattern: /(mozilla)(?:.*? rv:([\w.]+)|)/,
        extract: (m) => ({ id: m[1], ver: m[2], verNum: m[2] })
      }
    ];

    // Iterate through browser rules to find the first match
    for (const rule of browserRecognitionRules) {
      if (rule.condition && !rule.condition(lowercasedAgentText)) {
        continue;
      }
      const currentExtraction = rule.pattern.exec(lowercasedAgentText);
      if (currentExtraction) {
        primaryAgentIdentification = rule.extract(currentExtraction);
        break;
      }
    }

    // Ordered sequence of platform identification rules
    const platformRecognitionRules = [
      { pattern: /(ipad)/, extract: (m) => ({ id: m[0] }) },
      { pattern: /(ipod)/, extract: (m) => ({ id: m[0] }) },
      { pattern: /(iphone)/, extract: (m) => ({ id: m[0] }) },
      { pattern: /(kindle)/, extract: (m) => ({ id: m[0] }) },
      { pattern: /(silk)/, extract: (m) => ({ id: m[0] }) },
      { pattern: /(android)/, extract: (m) => ({ id: m[0] }) },
      { pattern: /(windows phone)/, extract: (m) => ({ id: m[0] }) },
      { pattern: /(win)/, extract: (m) => ({ id: m[0] }) },
      { pattern: /(mac)/, extract: (m) => ({ id: m[0] }) },
      { pattern: /(linux)/, extract: (m) => ({ id: m[0] }) },
      { pattern: /(cros)/, extract: (m) => ({ id: m[0] }) },
      { pattern: /(playbook)/, extract: (m) => ({ id: m[0] }) },
      { pattern: /(bb)/, extract: (m) => ({ id: m[0] }) },
      { pattern: /(blackberry)/, extract: (m) => ({ id: m[0] }) }
    ];

    // Iterate through platform rules to find the first match
    for (const rule of platformRecognitionRules) {
      const currentExtraction = rule.pattern.exec(lowercasedAgentText);
      if (currentExtraction) {
        primaryPlatformIdentification = rule.extract(currentExtraction);
        break;
      }
    }

    // Initialize an intermediate data structure
    const interimData = {
      detectedBrowserId: primaryAgentIdentification.id || "",
      detectedBrowserVersion: primaryAgentIdentification.ver || "0",
      detectedBrowserVersionNumber: primaryAgentIdentification.verNum || "0",
      detectedPlatformId: primaryPlatformIdentification.id || ""
    };

    const finalAgentProfile = {};

    if (interimData.detectedBrowserId) {
      finalAgentProfile[interimData.detectedBrowserId] = true;
      finalAgentProfile.detectedBrowserVersion = interimData.detectedBrowserVersion;
      finalAgentProfile.detectedBrowserVersionNumber = parseInt(interimData.detectedBrowserVersionNumber, 10);
    }

    if (interimData.detectedPlatformId) {
      finalAgentProfile[interimData.detectedPlatformId] = true;
    }

    // Function to set derived device type flags
    const setDeviceTypeFlags = (profile) => {
      if (profile.android || profile.bb || profile.blackberry || profile.ipad || profile.iphone ||
        profile.ipod || profile.kindle || profile.playbook || profile.silk || profile["windows phone"]) {
        profile.isMobileDevice = true;
      }

      if (profile.cros || profile.mac || profile.linux || profile.win) {
        profile.isDesktopSystem = true;
      }
    };
    setDeviceTypeFlags(finalAgentProfile);

    // Function to set derived rendering engine flags
    const setEngineFlags = (profile) => {
      if (profile.chrome || profile.opr || profile.safari) {
        profile.isWebkitEngine = true;
      }
    };
    setEngineFlags(finalAgentProfile);

    // Function to apply specific browser re-mappings
    const applyBrowserRemappings = (profile, data) => {
      if (profile.rv || profile.edge) {
        const ieAlias = "internetExplorer";
        data.detectedBrowserId = ieAlias;
        profile[ieAlias] = true;
      }

      if (profile.safari && profile.blackberry) {
        const bbAlias = "blackberryBrowser";
        data.detectedBrowserId = bbAlias;
        profile[bbAlias] = true;
      }

      if (profile.safari && profile.playbook) {
        const pbAlias = "playbookTablet";
        data.detectedBrowserId = pbAlias;
        profile[pbAlias] = true;
      }

      if (profile.bb) {
        const bb10Alias = "blackberryOS";
        data.detectedBrowserId = bb10Alias;
        profile[bb10Alias] = true;
      }

      if (profile.opr) {
        const operaAlias = "operaBrowser";
        data.detectedBrowserId = operaAlias;
        profile[operaAlias] = true;
      }

      if (profile.safari && profile.android) {
        const androidAlias = "androidBrowser";
        data.detectedBrowserId = androidAlias;
        profile[androidAlias] = true;
      }

      if (profile.safari && profile.kindle) {
        const kindleAlias = "kindleReader";
        data.detectedBrowserId = kindleAlias;
        profile[kindleAlias] = true;
      }

      if (profile.safari && profile.silk) {
        const silkAlias = "silkBrowser";
        data.detectedBrowserId = silkAlias;
        profile[silkAlias] = true;
      }
    };
    applyBrowserRemappings(finalAgentProfile, interimData);

    // Assign final descriptive properties
    finalAgentProfile.browserName = interimData.detectedBrowserId;
    finalAgentProfile.platformName = interimData.detectedPlatformId;

    return finalAgentProfile;
  }

  // Execute the analysis and expose the results
  window.agentInsight = analyzeUserAgentString(window.navigator.userAgent);
  window.agentInsight.determineProfile = analyzeUserAgentString;

  // Integrate with jQuery if available
  if (externalFramework) {
    externalFramework.agentProfile = window.agentInsight;
  }

  return window.agentInsight;
}));