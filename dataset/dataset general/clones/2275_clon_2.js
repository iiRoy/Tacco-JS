/**
 * @creator: code_artist
 * @label: APP.module.SYS_UTIL_DISP
 * @release: 1.0.0
 * @day: 12/01/17
 * @needs: nothing
 * @rights: Our Company
 */



/**
 * @creator: code_artist
 * @label: APP.systemInfo
 * @release: 1.0.0
 * @day: 12/01/17
 * @needs:
 * @rights: Our Company
 */
/* jslint devel: true, browser: true, maxerr: 50, indent: 2 */
(function (globalScope, appNamespace) {
  'strict';

  /*
   *  @label:        APP.systemInfo
   *  @Details:      Complete OS data
   *  @Arguments:    Zero
   *  @Example:      APP.systemInfo || APP.systemInfo.windows
   */
  appNamespace.systemInfo = (function() {
    var clientSoftwareVersion, clientBrowserAgent, systemDetails, windowsOS, linuxOS, macintoshOS, unixOS, temporaryCollection, currentVersion, mobileAndroid, mobileiPhone, mobileiPod, mobileiPad;

    systemDetails = {};
    clientSoftwareVersion = navigator.appVersion.toLowerCase();
    clientBrowserAgent = navigator.userAgent.toLowerCase();

    windowsOS = 'win';
    macintoshOS = 'mac';
    unixOS = 'x11';
    linuxOS = 'linux';
    mobileAndroid = 'android';
    mobileiPhone = 'iphone';
    mobileiPod = 'ipod';
    mobileiPad = 'ipad';

    systemDetails.windows = false;
    systemDetails.macintosh = false;
    systemDetails.unix = false;
    systemDetails.linux = false;
    systemDetails.android = false;
    systemDetails.appleMobile = false;
    systemDetails.handheld = false;
    systemDetails.iphone = false;
    systemDetails.ipad = false;

    systemDetails.platformName = 'unknown';
    systemDetails.platformVersion = 'unknown';

    if (clientSoftwareVersion.indexOf(windowsOS) > -1) {
      systemDetails.windows = true;
    }
    if (clientSoftwareVersion.indexOf(macintoshOS) > -1) {
      systemDetails.macintosh = true;
    }
    if (clientSoftwareVersion.indexOf(unixOS) > -1) {
      systemDetails.unix = true;
    }
    if (clientSoftwareVersion.indexOf(linuxOS) > -1) {
      systemDetails.linux = true;
    }
    if (clientBrowserAgent.indexOf(mobileAndroid) > -1) {
      systemDetails.android = true;
      systemDetails.handheld = true;
    }
    if (clientBrowserAgent.indexOf(mobileiPod) > -1 || clientBrowserAgent.indexOf(mobileiPhone) > -1 || clientBrowserAgent.indexOf(mobileiPad) > -1) {
      systemDetails.appleMobile = true;
      systemDetails.macintosh = false;
      systemDetails.handheld = true;

      if (clientBrowserAgent.indexOf(mobileiPod) > -1 || clientBrowserAgent.indexOf(mobileiPhone) > -1) {
        systemDetails.iphone = true;
      } else {
        systemDetails.ipad = true;
      }
    }

    if (systemDetails.windows) {
      if (clientSoftwareVersion.indexOf('win16') >= -1) { currentVersion = '3.11'; }
      if (clientSoftwareVersion.indexOf('95') >= -1) { currentVersion = '95'; }
      if (clientSoftwareVersion.indexOf('98') >= -1) { currentVersion = '98'; }
      if (clientSoftwareVersion.indexOf('4.0') >= -1 || clientSoftwareVersion.indexOf('winnt') >= -1) { currentVersion = 'NT 4.0'; }
      if (clientSoftwareVersion.indexOf('2000') >= -1 || clientSoftwareVersion.indexOf('nt 5.0') >= -1) { currentVersion = '2000'; }
      if (clientSoftwareVersion.indexOf(' me ') >= -1) { currentVersion = 'ME'; }
      if (clientSoftwareVersion.indexOf('xp') >= -1 || clientSoftwareVersion.indexOf('nt 5.1') >= -1) { currentVersion = 'XP'; }
      if (clientSoftwareVersion.indexOf('nt 5.2') >= -1) { currentVersion = 'Server 2003'; }
      if (clientSoftwareVersion.indexOf('nt 6.0') >= -1) { currentVersion = 'Vista'; }
      if (clientSoftwareVersion.indexOf('nt 7.0') >= -1 || clientSoftwareVersion.indexOf('nt 6.1') >= -1) { currentVersion = '7'; }

      systemDetails.platformName = 'Microsoft Windows';
      systemDetails.platformVersion = currentVersion;
    }
    if (systemDetails.macintosh) {
      temporaryCollection = clientBrowserAgent.split('mac os x ');
      if (temporaryCollection[1]) {
        currentVersion = temporaryCollection[1];
        currentVersion = currentVersion.split(';');
        if (currentVersion[0]) {
          currentVersion = currentVersion[0];
          currentVersion = currentVersion.replace(/_/g, '.');
        }

        if (currentVersion.indexOf(')')) {
          currentVersion = currentVersion.split(')');
          currentVersion = currentVersion[0];
        }
      } else {
        currentVersion = 'unknown';
      }
      systemDetails.platformVersion = 'OS X ' + currentVersion;
      systemDetails.platformName = 'Mac';
    }
    if (systemDetails.unix) {
      systemDetails.platformName = 'Unix';
    }
    if (systemDetails.linux) {
      systemDetails.platformName = 'Linux';
    }
    if (systemDetails.android) {
      temporaryCollection = clientBrowserAgent.split('android ');
      if (temporaryCollection[1]) {
        currentVersion = temporaryCollection[1].split(';');
        currentVersion = currentVersion[0];
      }
      systemDetails.platformVersion = currentVersion;
      systemDetails.platformName = 'Android';
    }
    if (systemDetails.appleMobile) {
      temporaryCollection = clientBrowserAgent.split(' os ');
      currentVersion = temporaryCollection[1];
      currentVersion = currentVersion.split(' ');
      if (currentVersion[0]) {
        currentVersion = currentVersion[0];
        currentVersion = currentVersion.replace(/_/g, '.');
      }
      systemDetails.platformVersion = currentVersion;
      systemDetails.platformName = 'iOS';
      if (systemDetails.iphone) {
        systemDetails.platformName = 'iOS iPhone/iPod';
      }
      if (systemDetails.ipad) {
        systemDetails.platformName = 'iOS iPad';
      }
    }

    return systemDetails;
  }());

  globalScope.APP = appNamespace;
}(window, window.APP || {}));

/**
 * @creator: code_artist
 * @label: APP.clientInfo
 * @release: 1.0.0
 * @day: 12/01/17
 * @needs:
 * @rights: Our Company
 */

/* jslint devel: true, browser: true, maxerr: 50, indent: 2 */

(function (globalScope, appNamespace) {
  'strict';

  /*
   *  @label:        APP.clientInfo
   *  @Details:      Complete client data
   *  @Arguments:    Zero
   *  @Example:      APP.clientInfo || APP.clientInfo.webkit
   */
  appNamespace.clientInfo = (function() {

    var applicationName, vendorName, clientUserAgent, chromeEngine, safariEngine, internetExplorer, mozillaFirefox, operaBrowser, clientBrowser, temporaryList, browserVersion;

    clientBrowser = {};

    applicationName = navigator.appName.toLowerCase();
    clientUserAgent = navigator.userAgent.toLowerCase();
    vendorName = navigator.vendor;

    clientBrowser.webkit = false;
    clientBrowser.chrome = false;
    clientBrowser.safari = false;
    clientBrowser.msie = false;
    clientBrowser.firefox = false;
    clientBrowser.opera = false;
    clientBrowser.name = 'unknown';
    clientBrowser.version = 'unknown';

    internetExplorer = 'msie';
    mozillaFirefox = 'firefox';
    operaBrowser = 'presto';

    // vendor exists in Chrome & Safari
    if (vendorName) {
      vendorName = vendorName.toLowerCase();
      chromeEngine = vendorName.indexOf('google');
      safariEngine = vendorName.indexOf('apple');

      if (chromeEngine > -1 || safariEngine > -1) {
        clientBrowser.webkit = true;

        if (chromeEngine > -1) {
          clientBrowser.chrome = true;
          clientBrowser.name = 'Google Chrome';
        }
        if (safariEngine > -1) {
          clientBrowser.safari = true;
          clientBrowser.name = 'Safari';
        }
      }
    }

    // else it's IE, FF, Opera or other
    if (clientUserAgent.indexOf(internetExplorer) > -1) {
      clientBrowser.msie = true;
      clientBrowser.name = 'Microsoft Internet Explorer';
    }
    if (clientUserAgent.indexOf(mozillaFirefox) > -1) {
      clientBrowser.firefox = true;
      clientBrowser.name = 'Mozilla Firefox';
    }
    if (clientUserAgent.indexOf(operaBrowser) > -1) {
      clientBrowser.opera = true;
      clientBrowser.name = 'Opera';
    }

    if (clientBrowser.msie) {
      temporaryList = clientUserAgent.split('; ');
      if (temporaryList[1]) {
        browserVersion = temporaryList[1].split(' ');
        if (browserVersion[1]) {
          browserVersion = browserVersion[1];
        }
      }
    }
    if (clientBrowser.opera) {
      temporaryList = clientUserAgent.split('version/');
      if (temporaryList[1]) {
        browserVersion = temporaryList[1];
      }
    }
    if (clientBrowser.chrome) {
      temporaryList = clientUserAgent.split('chrome/');
      if (temporaryList[1]) {
        browserVersion = temporaryList[1].split(' ');
        if (browserVersion[0]) { browserVersion = browserVersion[0]; }
      }
    }
    if (clientBrowser.safari) {
      temporaryList = clientUserAgent.split('version/');
      if (temporaryList[1]) {
        browserVersion = temporaryList[1].split(' ');
        if (browserVersion[0]) { browserVersion = browserVersion[0]; }
      }
    }
    if (clientBrowser.firefox) {
      temporaryList = clientUserAgent.split('firefox/');
      if (temporaryList[1]) {
        browserVersion = temporaryList[1];
      }
    }

    if (browserVersion) {
      clientBrowser.version = browserVersion;
    }

    return clientBrowser;

  }());

  globalScope.APP = appNamespace;
}(window, window.APP || {}));

/**
 * @creator: code_artist
 * @label: DeviceQuery
 * @release: 1.0.0
 * @day: 11/04/11
 * @needs:
 * @rights: Our Company
 */
(function (globalScope, appNamespace, omitted) {
  /**
   *  @label:        DeviceQuery
   *  @details:      Determine the correct classification of a JavaScript entity
   *  @arguments:    None
   *  @example:      APP.deviceQuery || APP.deviceQuery.displaySize || ...
   */

  appNamespace.deviceQuery = (function() {
    var deviceQueryModule = {
      minimumWidthPattern:       /min-(device-){0,1}width:( *)(\d+)px/gi,
      maximumWidthPattern:       /max-(device-){0,1}width:( *)(\d+)px/gi,
      viewportWidth:    globalScope.innerWidth || document.body.clientWidth || document.documentElement.clientWidth,
      styleDocuments:    document.styleSheets
    };

    deviceQueryModule.initialize = function() {
      deviceQueryModule.styleDocuments = filterStyleSheets(deviceQueryModule.styleDocuments);
      deviceQueryModule.mediaQueries = parseStyleSheetRules(deviceQueryModule.styleDocuments);
      determineCurrentMediaQuery();
    };

    function filterStyleSheets(sheetCollection) {
      var idx, currentCount, chosenSheets, singleSheet, mediaRule;

      chosenSheets = [];

      for (idx = 0, currentCount = sheetCollection.length; idx < currentCount; idx += 1) {
        singleSheet = sheetCollection[idx];

        mediaRule = singleSheet.media || "";

        // if sheets are not for print
        if (singleSheet.media.mediaText && singleSheet.media.mediaText.indexOf('print') >= 0) { continue; }
        if (singleSheet.media.toString().indexOf('print') >= 0) { continue; }

        chosenSheets.push(singleSheet);
      }

      return chosenSheets;
    }

    function parseStyleSheetRules(sheetCollection) {
      var sheetIndex, sheetTotal, pageLayouts, currentLayoutSpec, sheetMediaText, mediaProperty, singleSheet, cssRules, singleRule, ruleIndex, ruleTotal;

      pageLayouts = {};

      for (sheetIndex = 0, sheetTotal = sheetCollection.length; sheetIndex < sheetTotal; sheetIndex += 1) {
        singleSheet = sheetCollection[sheetIndex];

        if (singleSheet.media) {
          if (singleSheet.media.hasOwnProperty('mediaText')) {
            sheetMediaText = singleSheet.media.mediaText;
          } else {
            sheetMediaText = "" + singleSheet.media;
          }

          if (sheetMediaText && sheetMediaText.indexOf('print') < 0) {
            currentLayoutSpec = {};
            currentLayoutSpec.minVal = sheetMediaText.match(deviceQueryModule.minimumWidthPattern);
            currentLayoutSpec.maxVal = sheetMediaText.match(deviceQueryModule.maximumWidthPattern);

            if (currentLayoutSpec.minVal || currentLayoutSpec.maxVal) {
              if (currentLayoutSpec.minVal) {
                currentLayoutSpec.minVal = currentLayoutSpec.minVal[0].split(':')[1];
                currentLayoutSpec.minVal = parseInt(currentLayoutSpec.minVal, 10);
              } else {
                currentLayoutSpec.minVal = 0;
              }
              if (currentLayoutSpec.maxVal) {
                currentLayoutSpec.maxVal = currentLayoutSpec.maxVal[0].split(':')[1];
                currentLayoutSpec.maxVal = parseInt(currentLayoutSpec.maxVal, 10);
              } else {
                currentLayoutSpec.maxVal = 'exceeds all limits';
              }

              currentLayoutSpec.queryText = sheetMediaText;
              pageLayouts[currentLayoutSpec.minVal] = pageLayouts[currentLayoutSpec.minVal] || [];
              pageLayouts[currentLayoutSpec.minVal].push(currentLayoutSpec);
            }
          }
        }

        try {
          cssRules = singleSheet.cssRules || singleSheet.rules || omitted;
        } catch (parsingError) {
          appNamespace.log('Error parsing style sheet: ', parsingError);
          return false;
        }

        if (cssRules) {
          for (ruleIndex = 0, ruleTotal = cssRules.length; ruleIndex < ruleTotal; ruleIndex += 1) {
            singleRule = cssRules[ruleIndex];

            // if rule doesn't contain media query
            if (!singleRule.media) { continue; }

            mediaProperty = singleRule.media.mediaText || singleRule.media;
            if (mediaProperty.indexOf('print') >= 0) { continue; }

            currentLayoutSpec = {};
            currentLayoutSpec.minVal = mediaProperty.match(deviceQueryModule.minimumWidthPattern);
            currentLayoutSpec.maxVal = mediaProperty.match(deviceQueryModule.maximumWidthPattern);

            // if media query doesn't contain min-width or max-width
            if (!currentLayoutSpec.minVal && !currentLayoutSpec.maxVal) { continue; }

            if (currentLayoutSpec.minVal) {
              currentLayoutSpec.minVal = currentLayoutSpec.minVal[0].split(':')[1];
              currentLayoutSpec.minVal = parseInt(currentLayoutSpec.minVal, 10);
            } else {
              currentLayoutSpec.minVal = 0;
            }
            if (currentLayoutSpec.maxVal) {
              currentLayoutSpec.maxVal = currentLayoutSpec.maxVal[0].split(':')[1];
              currentLayoutSpec.maxVal = parseInt(currentLayoutSpec.maxVal, 10);
            } else {
              currentLayoutSpec.maxVal = 'exceeds all limits';
            }

            currentLayoutSpec.queryText = mediaProperty;

            pageLayouts[currentLayoutSpec.minVal] = pageLayouts[currentLayoutSpec.minVal] || [];

            pageLayouts[currentLayoutSpec.minVal].push(currentLayoutSpec);

            pageLayouts[currentLayoutSpec.minVal].sort(function(first, second) {
              if (typeof first.maxVal === "string" && typeof second.maxVal === "string") { return 0; }
              if (typeof first.maxVal === "string") { return 1; }
              if (typeof second.maxVal === "string") { return 1; }

              return first.maxVal - second.maxVal;
            });
          }
        }
      }

      return pageLayouts;
    }

    function determineCurrentMediaQuery() {
      var availableQueries, queryKey, iterator, queryLength, activeLayouts, singleLayout, displayIndex;

      availableQueries = deviceQueryModule.mediaQueries;

      deviceQueryModule.viewportWidth = globalScope.innerWidth || document.body.clientWidth || document.documentElement.clientWidth;

      activeLayouts = [];

      displayIndex = 0;
      for (queryKey in availableQueries) {
        if (availableQueries.hasOwnProperty(queryKey)) {
          //deviceQueryModule.activeMediaQuery = availableQueries[queryKey];
          if (queryKey < deviceQueryModule.viewportWidth) {
            displayIndex += 1;
            activeLayouts = availableQueries[queryKey];
            deviceQueryModule.displaySize = displayIndex;
          } else {
            break;
          }
        }
      }

      for (iterator = 0, queryLength = activeLayouts.length; iterator < queryLength; iterator += 1) {
        singleLayout = activeLayouts[iterator];
        if (typeof singleLayout.maxVal === "string" || singleLayout.maxVal >= deviceQueryModule.viewportWidth) { deviceQueryModule.activeMediaQuery = singleLayout; }
      }
    }

    function handleViewportResize() {
      deviceQueryModule.viewportWidth = globalScope.innerWidth || document.body.clientWidth || document.documentElement.clientWidth;
      clearTimeout(deviceQueryModule.resizeThrottle);
      deviceQueryModule.resizeThrottle = setTimeout(determineCurrentMediaQuery, 10);
    }

    deviceQueryModule.initialize();

    if (globalScope.addEventListener) {
      globalScope.addEventListener('resize', handleViewportResize, true);
    } else {
      globalScope.attachEvent('onresize', handleViewportResize);
    }

    globalScope.APP = appNamespace;

    return deviceQueryModule;

  }());

}(window, window.APP || {}, undefined));

(function (globalScope, appNamespace) {
  var resizeDelayIdentifier;

  // if (!appNamespace.deviceQuery.displaySize) { alert('Responsive styling not detected in document header'); return false; }

  function setupDisplay() {
    var documentRoot, mainContainer, clearFixDiv, clearElement, leftPanel, rightPanel, clientBrowserInfo, closeButton, systemOperatingInfo, mediaQueryDetails, existingElement, minVal, maxVal, currentVal;

    existingElement = document.getElementById('app_module_sys_util_display_container');

    if (existingElement) { return false; }

    minVal = appNamespace.deviceQuery.activeMediaQuery.minVal;
    maxVal = appNamespace.deviceQuery.activeMediaQuery.maxVal;
    currentVal = appNamespace.deviceQuery.viewportWidth;

    if (typeof minVal !== "string") { minVal += "px"; }