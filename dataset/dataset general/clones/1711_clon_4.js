(function(globalScope) {
  "use strict";

  const renderDoc = globalScope.document;
  const renderRoot = renderDoc.documentElement;

  let viewportConditionManager = null;
  let layoutAdaptor = {};

  // --- Utility functions and constants ---
  const debounceDelayMilliseconds = 30; // Matches original for responsiveness
  let cachedEmPixelValue = 0;
  let resizeActivityTimer = 0;

  // Replacement for getEmValue
  function determineEmEquivalence() {
    if (cachedEmPixelValue) return cachedEmPixelValue; // Use cached value if available

    let computedEm = 0;
    const testElement = renderDoc.createElement("div");
    const temporaryBodyElement = renderDoc.body || renderDoc.createElement("body");
    const originalRootFontSize = renderRoot.style.fontSize;
    const originalBodyFontSize = temporaryBodyElement.style.fontSize;
    let bodyAddedTemporarily = false;

    testElement.style.cssText = "position:absolute;font-size:1em;width:1em;height:0;overflow:hidden;visibility:hidden;";

    if (!renderDoc.body) {
      renderRoot.insertBefore(temporaryBodyElement, renderRoot.firstChild);
      bodyAddedTemporarily = true;
    }

    renderRoot.style.fontSize = "100%";
    temporaryBodyElement.style.fontSize = "100%";
    temporaryBodyElement.appendChild(testElement);

    computedEm = testElement.offsetWidth;

    if (bodyAddedTemporarily) {
      renderRoot.removeChild(temporaryBodyElement);
    } else {
      temporaryBodyElement.removeChild(testElement);
    }

    renderRoot.style.fontSize = originalRootFontSize;
    if (originalBodyFontSize) {
      temporaryBodyElement.style.fontSize = originalBodyFontSize;
    }
    cachedEmPixelValue = parseFloat(computedEm);
    return cachedEmPixelValue;
  }

  // Replacement for parseConditionExpression (more robust for Respond.js needs)
  function analyzeQueryDescriptor(descriptorString) {
    const tokenRegex = /\(.*?\)|\S+/g;
    const tokens = descriptorString.match(tokenRegex) || [];
    let mediaCategory = 'all';
    let isNegative = false;
    const featureBreakdowns = [];

    for (let i = 0; i < tokens.length; i++) {
      let token = tokens[i];
      if (token === 'not') {
        isNegative = true;
      } else if (token === 'only') {
        // 'only' is ignored for functional evaluation
      } else if (token === 'and') {
        // 'and' is implicitly handled by sequential evaluation
      } else if (token.startsWith('(') && token.endsWith(')')) {
        const content = token.slice(1, -1);
        const colonPos = content.indexOf(':');
        if (colonPos > -1) {
          const featureName = content.substring(0, colonPos).trim();
          let featureVal = content.substring(colonPos + 1).trim();
          let featureUnit = '';
          const unitMatch = featureVal.match(/(\d*\.?\d+)(em|px)/);
          if (unitMatch) {
            featureVal = parseFloat(unitMatch[1]);
            featureUnit = unitMatch[2];
          }
          featureBreakdowns.push({ attribute: featureName, value: featureVal, unit: featureUnit });
        } else {
          // Handle boolean features like '(hover)' - not directly supported by original polyfills
        }
      } else {
        mediaCategory = token;
      }
    }
    return {
      category: mediaCategory,
      negative: isNegative,
      features: featureBreakdowns
    };
  }

  // Replacement for evaluateCurrentConditions
  function assessEnvironmentMatch(parsedDescriptor, currentEmPx) {
    const currentViewportWidth = globalScope.innerWidth || renderRoot.clientWidth;
    const currentViewportHeight = globalScope.innerHeight || renderRoot.clientHeight;
    const currentDeviceOrientation = currentViewportWidth > currentViewportHeight ? 'landscape' : 'portrait';

    let categoryMatch = parsedDescriptor.category === 'all' || parsedDescriptor.category === 'screen';

    let allFeaturesPass = parsedDescriptor.features.every(feature => {
      let featureValueInPx;
      if (feature.unit === 'em') {
        featureValueInPx = feature.value * currentEmPx;
      } else if (feature.unit === 'px') {
        featureValueInPx = feature.value;
      } else {
        featureValueInPx = feature.value; // Assume string values like 'landscape'
      }

      switch (feature.attribute) {
        case 'min-width':
          return currentViewportWidth >= featureValueInPx;
        case 'max-width':
          return currentViewportWidth <= featureValueInPx;
        case 'orientation':
          return currentDeviceOrientation === featureValueInPx;
        default:
          return true; // Unknown features are considered true for compatibility
      }
    });

    let overallMatch = categoryMatch && allFeaturesPass;
    return parsedDescriptor.negative ? !overallMatch : overallMatch;
  }

  // --- Part 1 & 2: Viewport Condition Evaluator and Dynamic Query Observer ---
  (function() {
    const querySubjectRegistry = {}; // Stores all created query subjects
    let monitorInitialized = false;

    function processAllQueryUpdates() {
      globalScope.clearTimeout(resizeActivityTimer);
      resizeActivityTimer = globalScope.setTimeout(function() {
        const currentEmPx = determineEmEquivalence(); // Refresh em value
        for (const queryKey in querySubjectRegistry) {
          if (querySubjectRegistry.hasOwnProperty(queryKey)) {
            const subject = querySubjectRegistry[queryKey];
            const newMatchState = assessEnvironmentMatch(subject.parsedDescriptor, currentEmPx);
            if (newMatchState !== subject.currentMatchStatus) {
              subject.currentMatchStatus = newMatchState;
              const notificationData = {
                matches: newMatchState,
                queryText: queryKey
              };
              subject.observers.forEach(obs => obs.call(globalScope, notificationData));
            }
          }
        }
        // Also trigger the adaptive layout manager to refresh
        if (layoutAdaptor && typeof layoutAdaptor.refreshLayout === 'function') {
            layoutAdaptor.refreshLayout();
        }
      }, debounceDelayMilliseconds);
    }

    // Replacement for window.matchMedia
    globalScope.viewportConditionManager = globalScope.viewportConditionManager || function(queryInput) {
      if (!querySubjectRegistry[queryInput]) {
        querySubjectRegistry[queryInput] = {
          parsedDescriptor: analyzeQueryDescriptor(queryInput),
          currentMatchStatus: false,
          observers: []
        };
        // Initial evaluation
        querySubjectRegistry[queryInput].currentMatchStatus = assessEnvironmentMatch(querySubjectRegistry[queryInput].parsedDescriptor, determineEmEquivalence());
      }

      const currentSubject = querySubjectRegistry[queryInput];

      const returnedDescriptor = {
        matches: currentSubject.currentMatchStatus,
        queryText: queryInput,
        // Replacement for addListener
        addChangeListener: function(callbackFunction) {
          if (typeof callbackFunction === 'function' && currentSubject.observers.indexOf(callbackFunction) === -1) {
            currentSubject.observers.push(callbackFunction);
          }
        },
        // Replacement for removeListener
        removeChangeListener: function(callbackFunction) {
          currentSubject.observers = currentSubject.observers.filter(obs => obs !== callbackFunction);
        }
      };
      return returnedDescriptor;
    };

    // Initialize global resize listener once
    if (!monitorInitialized) {
      if (globalScope.addEventListener) {
        globalScope.addEventListener("resize", processAllQueryUpdates, true);
      } else if (globalScope.attachEvent) { // For older IE
        globalScope.attachEvent("onresize", processAllQueryUpdates);
      }
      monitorInitialized = true;
      // Initial check to populate match states
      processAllQueryUpdates();
    }
  })();


  // --- Part 3: Adaptive Layout Manager (replacement for Respond.js) ---
  (function() {
    const storedMediaRules = []; // Stores parsed rules (query string + CSS block)
    const processedSourceUrls = {}; // Tracks URLs of stylesheets already processed
    const pendingFetchTasks = []; // Queue for fetching external stylesheets
    let activeStyleSheetNode = null; // The single <style> element for dynamic CSS

    // Regex for URL rewriting (same logic as original, different name)
    const urlReplacementPattern = /(url\()['"]?([^\/\)'"][^:\)'"]+)['"]?(\))/g;

    // Replacement for XMLHttpRequest / ajax
    function fetchRemoteContent(resourcePath, completionCallback) {
      const httpRequest = new globalScope.XMLHttpRequest();
      httpRequest.open("GET", resourcePath, true);
      httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4 && (httpRequest.status === 200 || httpRequest.status === 304)) {
          completionCallback(httpRequest.responseText);
        }
      };
      httpRequest.send(null);
    }

    // Replacement for translate - parses CSS content for @media blocks
    function parseAndStoreCss(cssContentString, originPath, mediaTypeOverride) {
      const discoveredMediaBlocks = [];
      let currentScanPosition = 0;

      // Custom state-machine like parser for @media blocks (divergent from regex)
      while (true) {
        const mediaTagIndex = cssContentString.indexOf('@media', currentScanPosition);
        if (mediaTagIndex === -1) break;

        const queryExpressionStart = mediaTagIndex + '@media'.length;
        let queryExpressionEnd = cssContentString.indexOf('{', queryExpressionStart);
        if (queryExpressionEnd === -1) break;

        const queryExpression = cssContentString.substring(queryExpressionStart, queryExpressionEnd).trim();

        let rulesBlockStart = queryExpressionEnd + 1;
        let braceDepthCounter = 1;
        let rulesBlockEnd = rulesBlockStart;

        while (rulesBlockEnd < cssContentString.length && braceDepthCounter > 0) {
          if (cssContentString[rulesBlockEnd] === '{') braceDepthCounter++;
          else if (cssContentString[rulesBlockEnd] === '}') braceDepthCounter--;
          rulesBlockEnd++;
        }
        if (braceDepthCounter !== 0) { // Mismatched braces, parsing error or malformed CSS
          break;
        }

        const ruleSetContent = cssContentString.substring(rulesBlockStart, rulesBlockEnd - 1).trim();
        discoveredMediaBlocks.push({ condition: queryExpression, rules: ruleSetContent });
        currentScanPosition = rulesBlockEnd;
      }

      // Process and store the extracted blocks
      discoveredMediaBlocks.forEach(block => {
        const rewrittenRules = block.rules.replace(urlReplacementPattern, (match, p1, p2, p3) => {
          if (originPath.length && !/^([a-zA-Z:]*\/\/)/.test(p2)) { // Only relative URLs need rewriting
            const basePath = originPath.substring(0, originPath.lastIndexOf('/') + 1);
            return p1 + basePath + p2 + p3;
          }
          return match;
        });
        storedMediaRules.push({
          queryText: block.condition,
          cssPayload: rewrittenRules,
        });
      });

      // If no @media blocks were found but the link tag had a media attribute, apply the whole sheet under that condition
      if (discoveredMediaBlocks.length === 0 && mediaTypeOverride && mediaTypeOverride !== 'all') {
          const rewrittenRules = cssContentString.replace(urlReplacementPattern, (match, p1, p2, p3) => {
              if (originPath.length && !/^([a-zA-Z:]*\/\/)/.test(p2)) {
                  const basePath = originPath.substring(0, originPath.lastIndexOf('/') + 1);
                  return p1 + basePath + p2 + p3;
              }
              return match;
          });
          storedMediaRules.push({
              queryText: mediaTypeOverride,
              cssPayload: rewrittenRules,
          });
      }
      activateCurrentStyles();
    }

    // Replacement for makeRequests
    function processPendingFetches() {
      if (pendingFetchTasks.length) {
        const currentTask = pendingFetchTasks.shift();
        fetchRemoteContent(currentTask.sourceUrl, function(content) {
          parseAndStoreCss(content, currentTask.sourceUrl, currentTask.mediaAttribute);
          processedSourceUrls[currentTask.sourceUrl] = true;
          globalScope.setTimeout(processPendingFetches, 0); // Continue processing queue
        });
      }
    }

    // Replacement for ripCSS
    function identifyAndLoadStylesheets() {
      const allLinkElements = renderDoc.getElementsByTagName("link");
      const baseTag = renderDoc.getElementsByTagName("base")[0];
      const currentHost = globalScope.location.host;
      const currentProtocol = globalScope.location.protocol;

      for (let i = 0; i < allLinkElements.length; i++) {
        const currentLink = allLinkElements[i];
        const hrefValue = currentLink.href;
        const mediaValue = currentLink.media;
        const isCssStylesheet = currentLink.rel && currentLink.rel.toLowerCase() === "stylesheet";

        if (hrefValue && isCssStylesheet && !processedSourceUrls[hrefValue]) {
          // Check for same-origin or explicit base tag handling
          if (!/^([a-zA-Z:]*\/\/)/.test(hrefValue) || (baseTag && hrefValue.replace(RegExp.$1, "").split("/")[0] === currentHost)) {
              let normalizedHref = hrefValue;
              if (normalizedHref.substring(0, 2) === "//") {
                  normalizedHref = currentProtocol + normalizedHref;
              }
              pendingFetchTasks.push({ sourceUrl: normalizedHref, mediaAttribute: mediaValue });
          } else if (currentLink.styleSheet && currentLink.styleSheet.rawCssText) {
              // IE-specific path for inline stylesheets
              parseAndStoreCss(currentLink.styleSheet.rawCssText, hrefValue, mediaValue);
              processedSourceUrls[hrefValue] = true;
          }
        }
      }
      processPendingFetches(); // Start fetching any identified external stylesheets
    }

    // Replacement for applyMedia
    function activateCurrentStyles() {
      const effectiveCssBlocks = [];
      const currentEmConversion = viewportConditionManager("all").matches ? determineEmEquivalence() : 16; // Fallback

      storedMediaRules.forEach(ruleEntry => {
        const parsedQuery = analyzeQueryDescriptor(ruleEntry.queryText);
        if (assessEnvironmentMatch(parsedQuery, currentEmConversion)) {
          effectiveCssBlocks.push(ruleEntry.cssPayload);
        }
      });

      if (!activeStyleSheetNode) {
        activeStyleSheetNode = renderDoc.createElement("style");
        activeStyleSheetNode.type = "text/css";
        activeStyleSheetNode.id = "dynamic-adaptive-styles";
        const headContainer = renderDoc.getElementsByTagName("head")[0] || renderRoot;
        const lastKnownLink = renderDoc.getElementsByTagName("link");
        if (lastKnownLink.length) {
            headContainer.insertBefore(activeStyleSheetNode, lastKnownLink[lastKnownLink.length - 1].nextSibling);
        } else {
            headContainer.appendChild(activeStyleSheetNode);
        }
      }

      const newCombinedCss = effectiveCssBlocks.join("\n");
      if (activeStyleSheetNode.styleSheet) { // IE compatibility
        activeStyleSheetNode.styleSheet.cssText = newCombinedCss;
      } else {
        activeStyleSheetNode.textContent = newCombinedCss;
      }
    }

    // Expose update method for external calls (e.g., after dynamic DOM changes)
    layoutAdaptor.refreshLayout = function() {
      identifyAndLoadStylesheets(); // Rescan and load new sheets
      activateCurrentStyles();     // Re-evaluate and apply
    };

    // Initialize if native matchMedia is not fully supported
    const fullMediaSupport = globalScope.viewportConditionManager && globalScope.viewportConditionManager("only all").matches;

    if (!fullMediaSupport) {
        identifyAndLoadStylesheets();
        // The processAllQueryUpdates in Part 1/2 will call refreshLayout on resize
    }

    globalScope.adaptiveLayoutManager = layoutAdaptor; // Expose globally
  })();

})(this);