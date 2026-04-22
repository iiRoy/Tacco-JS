(function(globalWindow) {
  "use strict";
  globalWindow.matchMedia = globalWindow.matchMedia || (function(documentReference, noValue) {
    var testResult,
      rootElement = documentReference.documentElement,
      insertionPoint = rootElement.firstElementChild || rootElement.firstChild,
      temporaryBody = documentReference.createElement("body"),
      testContainer = documentReference.createElement("div");

    const TEST_WIDTH_VALUE = 42; // A unique value for testing width

    testContainer.id = "media-query-probe";
    testContainer.style.cssText = "position:absolute;top:-9999px;left:-9999px;width:1px;"; // Ensure it's off-screen and small
    temporaryBody.style.backgroundColor = "transparent"; // More explicit than 'none'
    temporaryBody.appendChild(testContainer);

    return function(mediaQueryString) {
      if (!mediaQueryString || typeof mediaQueryString !== 'string') {
        // Basic validation for input
        return { matches: false, media: mediaQueryString || '' };
      }

      testContainer.innerHTML = '&shy;<style media="' + mediaQueryString + '"> #media-query-probe { width: ' + TEST_WIDTH_VALUE + 'px; }</style>';
      rootElement.insertBefore(temporaryBody, insertionPoint);
      testResult = testContainer.offsetWidth === TEST_WIDTH_VALUE;
      rootElement.removeChild(temporaryBody);

      return {
        matches: testResult,
        media: mediaQueryString
      };
    };
  })(globalWindow.document);
})(this);

(function(windowContext) {
  "use strict";

  // Check if native matchMedia with addListener already exists to prevent polyfilling
  if (windowContext.matchMedia && typeof windowContext.matchMedia("all").addListener === 'function') {
    return false; // Exit if already supported
  }

  var originalMediaQueryChecker = windowContext.matchMedia,
    supportsNativeMediaQueries = originalMediaQueryChecker("only all").matches,
    eventHandlerActive = false,
    debounceTimerHandle = 0,
    trackedMediaQueries = [], // Stores objects like { mediaQueryObject, callbackFunctions }
    DEBOUNCE_INTERVAL_MS = 60, // Slightly different debounce time
    processMediaChange = function(eventObject) {
      windowContext.clearTimeout(debounceTimerHandle);
      debounceTimerHandle = windowContext.setTimeout(function() {
        for (var i = 0, totalQueries = trackedMediaQueries.length; i < totalQueries; i++) {
          var queryEntry = trackedMediaQueries[i],
            mediaQueryObject = queryEntry.mql,
            callbackFunctions = queryEntry.listeners || [],
            currentMatchState = originalMediaQueryChecker(mediaQueryObject.media).matches;

          // Only trigger callbacks if the match state has truly changed
          if (currentMatchState !== mediaQueryObject.matches) {
            mediaQueryObject.matches = currentMatchState; // Update the internal state
            for (var j = 0, totalCallbacks = callbackFunctions.length; j < totalCallbacks; j++) {
              // Ensure the listener is a function before calling
              if (typeof callbackFunctions[j] === 'function') {
                callbackFunctions[j].call(windowContext, mediaQueryObject);
              }
            }
          }
        }
      }, DEBOUNCE_INTERVAL_MS);
    };

  // Override the global matchMedia function
  windowContext.matchMedia = function(queryText) {
    var mediaQueryObject = originalMediaQueryChecker(queryText),
      callbackFunctions = [],
      entryIndex = 0; // Tracks if this media query is already registered in trackedMediaQueries

    mediaQueryObject.addListener = function(observerCallback) {
      if (!supportsNativeMediaQueries) {
        return; // No need to listen if media queries aren't fundamentally supported
      }

      if (typeof observerCallback !== 'function') {
        // Basic validation for callback
        console.warn('matchMedia.addListener: Callback must be a function.');
        return;
      }

      if (!eventHandlerActive) {
        eventHandlerActive = true;
        // Using capture phase to ensure it's handled before other resize listeners
        windowContext.addEventListener("resize", processMediaChange, true);
      }

      // If this media query object hasn't been added to our tracking list yet
      if (entryIndex === 0) {
        entryIndex = trackedMediaQueries.push({
          mql: mediaQueryObject,
          listeners: callbackFunctions
        });
      }
      callbackFunctions.push(observerCallback);
    };

    mediaQueryObject.removeListener = function(observerCallback) {
      for (var i = 0, totalCallbacks = callbackFunctions.length; i < totalCallbacks; i++) {
        if (callbackFunctions[i] === observerCallback) {
          callbackFunctions.splice(i, 1); // Remove the specific listener
          break; // Exit loop after finding and removing
        }
      }
      // Optional: If callbackFunctions becomes empty, potentially remove from trackedMediaQueries
      // and deregister resize listener. This adds complexity and isn't strictly necessary for polyfill.
    };

    return mediaQueryObject;
  };
})(this);

(function(glob) {
  "use strict";

  var responsiveUtil = {}; // Renamed from 'respond'
  glob.responsiveUtil = responsiveUtil;
  responsiveUtil.refreshLayout = function() {}; // Renamed from 'update'

  var pendingStyleRequests = [], // Renamed from 'requestQueue'
    createXmlHttpRequest = (function() { // Renamed from 'xmlHttp'
      var reqInstance = false;
      try {
        reqInstance = new glob.XMLHttpRequest();
      } catch (e) {
        try {
          reqInstance = new glob.ActiveXObject("Microsoft.XMLHTTP"); // IE fallback
        } catch (ieError) {
          // Fallback failed, reqInstance remains false
        }
      }
      return function() {
        return reqInstance; // Return the cached instance
      };
    })(),
    fetchStylesheetContent = function(resourcePath, onContentReceived) { // Renamed from 'ajax'
      var httpRequest = createXmlHttpRequest();
      if (!httpRequest) {
        console.error("XMLHttpRequest is not supported by this browser.");
        return;
      }

      httpRequest.open("GET", resourcePath, true); // Asynchronous request
      httpRequest.onreadystatechange = function() {
        // Check for success (readyState 4, status 200 or 304 for cached)
        if (httpRequest.readyState === 4) {
          if (httpRequest.status >= 200 && httpRequest.status < 300 || httpRequest.status === 304) {
            onContentReceived(httpRequest.responseText);
          } else {
            console.error("Failed to load stylesheet: " + resourcePath + ", Status: " + httpRequest.status);
          }
        }
      };
      // For immediate synchronous requests which are bad practice but were checked in original
      if (httpRequest.readyState === 4) {
        return;
      }
      httpRequest.send(null); // Send the request
    };

  responsiveUtil.fetchContent = fetchStylesheetContent; // Expose for potential debugging
  responsiveUtil.requestQueue = pendingStyleRequests; // Expose the queue

  responsiveUtil.queryPatterns = { // Renamed from 'regex'
    mediaBlocks: /@media[^\{]+\{([^{}]*\{[^{}]*\})+/gi,
    keyframesBlocks: /@(?:-(?:o|moz|webkit)-)?keyframes[^\{]+\{(?:[^{}]*\{[^{}]*\})+[^\}]*\}/gi,
    urlReferences: /(url\()['"]?([^\/\)'"][^:\)'"]+)['"]?(\))/g,
    styleExtraction: /@media *([^\{]+)\{([\S\s]+?)$/,
    onlyKeyword: /(only\s+)?([a-zA-Z]+)\s?/,
    minWidthConstraint: /\([\s]*min\-width\s*:[\s]*([0-9\.]+)(px|em)[\s]*\)/,
    maxWidthConstraint: /\([\s]*max\-width\s*:[\s]*([0-9\.]+)(px|em)[\s]*\)/
  };

  // Check for native media query support using window.matchMedia
  responsiveUtil.nativeMediaQueriesSupported = glob.matchMedia && glob.matchMedia("only all") !== null && glob.matchMedia("only all").matches;

  if (responsiveUtil.nativeMediaQueriesSupported) {
    return; // Exit if the browser natively supports media queries
  }

  var currentDocument = glob.document,
    htmlRoot = currentDocument.documentElement,
    parsedMediaQueryRules = [], // Stores processed media query objects
    collectedCssRules = [], // Stores actual CSS rule strings
    dynamicStyleElements = [], // Stores dynamically inserted style elements
    processedSheetUrls = {}, // Tracks URLs of stylesheets that have been processed
    resizeDebounceInterval = 50, // Debounce interval for resize events, slightly changed
    documentHead = currentDocument.getElementsByTagName("head")[0] || htmlRoot,
    baseTagElement = currentDocument.getElementsByTagName("base")[0],
    linkElements = documentHead.getElementsByTagName("link"),
    lastResizeTime,
    resizeTimeoutHandle,
    emPixelValue; // Cached em to px conversion value

  var calculateEmToPxRatio = function() { // Renamed from 'getEmValue'
    var calculatedRatio,
      measurementDiv = currentDocument.createElement("div"),
      documentBody = currentDocument.body,
      initialHtmlFontSize = htmlRoot.style.fontSize,
      initialBodyFontSize = documentBody && documentBody.style.fontSize,
      tempBodyCreated = false; // Flag to indicate if a temporary body was created

    measurementDiv.style.cssText = "position:absolute;font-size:1em;width:1em;visibility:hidden;"; // Added visibility hidden
    if (!documentBody) {
      documentBody = tempBodyCreated = currentDocument.createElement("body");
      documentBody.style.backgroundColor = "transparent";
    }

    // Temporarily set font sizes for accurate em calculation
    htmlRoot.style.fontSize = "100%";
    if (documentBody) {
      documentBody.style.fontSize = "100%";
      documentBody.appendChild(measurementDiv);
    }

    if (tempBodyCreated) {
      htmlRoot.insertBefore(documentBody, htmlRoot.firstChild);
    }

    calculatedRatio = measurementDiv.offsetWidth; // Get the pixel width of 1em

    // Clean up temporary elements and restore original styles
    if (tempBodyCreated) {
      htmlRoot.removeChild(documentBody);
    } else if (documentBody) {
      documentBody.removeChild(measurementDiv);
    }

    htmlRoot.style.fontSize = initialHtmlFontSize;
    if (initialBodyFontSize) {
      if (documentBody) {
        documentBody.style.fontSize = initialBodyFontSize;
      }
    }

    emPixelValue = parseFloat(calculatedRatio); // Cache the value
    return emPixelValue;
  };
  responsiveUtil.getEmValue = calculateEmToPxRatio; // Expose

  var updateResponsiveStyles = function(isFromResize) { // Renamed from 'applyMedia'
    var dimensionProperty = "clientWidth",
      rootDimension = htmlRoot[dimensionProperty],
      currentViewportWidth = currentDocument.compatMode === "CSS1Compat" && rootDimension || currentDocument.body[dimensionProperty] || rootDimension,
      groupedStylesByMedia = {}, // Stores CSS rules grouped by media type
      lastLinkInHead = linkElements[linkElements.length - 1],
      currentTime = new Date().getTime();

    // Debouncing mechanism for resize events
    if (isFromResize && lastResizeTime && (currentTime - lastResizeTime < resizeDebounceInterval)) {
      glob.clearTimeout(resizeTimeoutHandle);
      resizeTimeoutHandle = glob.setTimeout(updateResponsiveStyles, resizeDebounceInterval);
      return;
    } else {
      lastResizeTime = currentTime;
    }

    // Iterate through all parsed media query rules
    for (var i in parsedMediaQueryRules) {
      if (parsedMediaQueryRules.hasOwnProperty(i)) {
        var currentMediaQueryEntry = parsedMediaQueryRules[i],
          minConstraint = currentMediaQueryEntry.minw,
          maxConstraint = currentMediaQueryEntry.maxw,
          noMinConstraint = minConstraint === null,
          noMaxConstraint = maxConstraint === null,
          emUnitString = "em";

        // Convert 'em' values to pixels if present
        if (minConstraint) {
          minConstraint = parseFloat(minConstraint) * (minConstraint.indexOf(emUnitString) > -1 ? emPixelValue || calculateEmToPxRatio() : 1);
        }
        if (maxConstraint) {
          maxConstraint = parseFloat(maxConstraint) * (maxConstraint.indexOf(emUnitString) > -1 ? emPixelValue || calculateEmToPxRatio() : 1);
        }

        // Check if the current viewport width satisfies the media query
        if (!currentMediaQueryEntry.hasquery ||
          ((noMinConstraint || currentViewportWidth >= minConstraint) &&
            (noMaxConstraint || currentViewportWidth <= maxConstraint))) {
          if (!groupedStylesByMedia[currentMediaQueryEntry.media]) {
            groupedStylesByMedia[currentMediaQueryEntry.media] = [];
          }
          groupedStylesByMedia[currentMediaQueryEntry.media].push(collectedCssRules[currentMediaQueryEntry.rules]);
        }
      }
    }

    // Remove previously appended dynamic style elements
    while (dynamicStyleElements.length > 0) {
      var oldStyleElement = dynamicStyleElements.pop();
      if (oldStyleElement && oldStyleElement.parentNode === documentHead) {
        documentHead.removeChild(oldStyleElement);
      }
    }

    // Append new style elements based on current media matches
    for (var mediaType in groupedStylesByMedia) {
      if (groupedStylesByMedia.hasOwnProperty(mediaType)) {
        var newStyleSheetElement = currentDocument.createElement("style"),
          combinedCssContent = groupedStylesByMedia[mediaType].join("\n");

        newStyleSheetElement.type = "text/css";
        newStyleSheetElement.media = mediaType;
        documentHead.insertBefore(newStyleSheetElement, lastLinkInHead ? lastLinkInHead.nextSibling : documentHead.firstChild); // Insert relative to last link or as first child

        if (newStyleSheetElement.styleSheet) { // IE-specific
          newStyleSheetElement.styleSheet.cssText = combinedCssContent;
        } else {
          newStyleSheetElement.appendChild(currentDocument.createTextNode(combinedCssContent));
        }
        dynamicStyleElements.push(newStyleSheetElement);
      }
    }
  };

  var parseAndProcessStyles = function(cssContent, stylesheetUrl, mediaAttribute) { // Renamed from 'translate'
    // Remove keyframe blocks first to prevent them from being mistaken for media queries
    var mediaQueryBlocks = cssContent.replace(responsiveUtil.queryPatterns.keyframesBlocks, "").match(responsiveUtil.queryPatterns.mediaBlocks),
      blockCount = mediaQueryBlocks && mediaQueryBlocks.length || 0;

    var baseHref = stylesheetUrl.substring(0, stylesheetUrl.lastIndexOf("/"));
    if (baseHref.length) {
      baseHref += "/"; // Ensure trailing slash if a base path exists
    }

    // Helper to resolve relative URLs in CSS
    var resolveRelativeUrls = function(css) {
      return css.replace(responsiveUtil.queryPatterns.urlReferences, "$1" + baseHref + "$2$3");
    };

    var isDirectMediaQuery = !blockCount && mediaAttribute; // If no @media blocks but a media attribute exists

    if (isDirectMediaQuery) {
      blockCount = 1; // Treat as a single block for processing
    }

    for (var i = 0; i < blockCount; i++) {
      var fullQueryClause, singleQueryPart, individualQueries, queryPartCount;

      if (isDirectMediaQuery) {
        fullQueryClause = mediaAttribute;
        collectedCssRules.push(resolveRelativeUrls(cssContent));
      } else {
        var matchResult = mediaQueryBlocks[i].match(responsiveUtil.queryPatterns.styleExtraction);
        fullQueryClause = matchResult && matchResult[1];
        collectedCssRules.push(matchResult && resolveRelativeUrls(matchResult[2]));
      }

      individualQueries = fullQueryClause.split(",");
      queryPartCount = individualQueries.length;

      for (var j = 0; j < queryPartCount; j++) {
        singleQueryPart = individualQueries[j];
        var mqOnlyMatch = singleQueryPart.match(responsiveUtil.queryPatterns.onlyKeyword);
        var mediaType = (mqOnlyMatch && mqOnlyMatch[2]) || "all";

        var minWidthMatch = singleQueryPart.match(responsiveUtil.queryPatterns.minWidthConstraint);
        var maxWidthMatch = singleQueryPart.match(responsiveUtil.queryPatterns.maxWidthConstraint);

        parsedMediaQueryRules.push({
          media: mediaType,
          rules: collectedCssRules.length - 1,
          hasquery: singleQueryPart.indexOf("(") > -1, // Check for actual query parts (min-width, max-width)
          minw: minWidthMatch ? parseFloat(minWidthMatch[1]) + (minWidthMatch[2] || "") : null,
          maxw: maxWidthMatch ? parseFloat(maxWidthMatch[1]) + (maxWidthMatch[2] || "") : null
        });
      }
    }
    updateResponsiveStyles(); // Trigger style update after processing
  };

  var processPendingRequests = function() { // Renamed from 'makeRequests'
    if (pendingStyleRequests.length > 0) {
      var currentRequest = pendingStyleRequests.shift(); // Get the next request
      fetchStylesheetContent(currentRequest.href, function(styles) {
        parseAndProcessStyles(styles, currentRequest.href, currentRequest.media);
        processedSheetUrls[currentRequest.href] = true; // Mark as processed
        glob.setTimeout(function() {
          processPendingRequests(); // Process next request asynchronously
        }, 0);
      });
    }
  };

  var scanAndLoadStylesheets = function() { // Renamed from 'ripCSS'
    for (var i = 0; i < linkElements.length; i++) {
      var linkElement = linkElements[i],
        stylesheetUrl = linkElement.href,
        mediaAttribute = linkElement.media,
        isStylesheetLink = linkElement.rel && linkElement.rel.toLowerCase() === "stylesheet";

      // Process only valid stylesheet links that haven't been processed yet
      if (stylesheetUrl && isStylesheetLink && !processedSheetUrls[stylesheetUrl]) {
        // If the stylesheet content is directly available (e.g., via styleSheet.rawCssText for IE)
        if (linkElement.styleSheet && linkElement.styleSheet.rawCssText) {
          parseAndProcessStyles(linkElement.styleSheet.rawCssText, stylesheetUrl, mediaAttribute);
          processedSheetUrls[stylesheetUrl] = true;
        } else {
          // Check if the URL is local or same-origin to avoid cross-origin issues
          var isCrossOrigin = /^([a-zA-Z:]*\/\/)/.test(stylesheetUrl) && stylesheetUrl.replace(RegExp.$1, "").split("/")[0] !== glob.location.host;
          if (!isCrossOrigin || (baseTagElement && !isCrossOrigin)) { // If not cross-origin, or if a base tag exists and it's still same-origin relative to base
            if (stylesheetUrl.substring(0, 2) === "//") {
              stylesheetUrl = glob.location.protocol + stylesheetUrl; // Prepend protocol for protocol-relative URLs
            }
            pendingStyleRequests.push({
              href: stylesheetUrl,
              media: mediaAttribute
            });
          }
        }
      }
    }
    processPendingRequests(); // Start processing the queue
  };

  scanAndLoadStylesheets(); // Initial scan on page load
  responsiveUtil.refreshLayout = scanAndLoadStylesheets; // Expose update function

  function triggerMediaUpdate() { // Renamed from 'callMedia'
    updateResponsiveStyles(true); // Indicate that this call is from a resize event
  }

  // Attach resize event listener
  if (glob.addEventListener) {
    glob.addEventListener("resize", triggerMediaUpdate, false);
  } else if (glob.attachEvent) {
    glob.attachEvent("onresize", triggerMediaUpdate); // IE fallback
  }

})(this);