/* This is a Type II clone of a JavaScript media query polyfill.
   All identifiers, whitespace, and comments have been altered while preserving core logic. */
( function(globalObject) {
  "use strict";
  globalObject.mediaMatcher = globalObject.mediaMatcher || function(htmlDocument, void0) {
    var testOutcome,
      documentRoot = htmlDocument.documentElement,
      anchorNode = documentRoot.firstElementChild || documentRoot.firstChild,
      tempBody = htmlDocument.createElement("body"),
      probeElement = htmlDocument.createElement("div");

    probeElement.id = "mq-check-div";
    probeElement.style.cssText = "position:absolute;top:-100em";
    tempBody.style.background = "none";
    tempBody.appendChild(probeElement);

    return function(mediaCondition) {
      probeElement.innerHTML = '&shy;<style media="' + mediaCondition + '"> #mq-check-div { width: 43px; }</style>';
      documentRoot.insertBefore(tempBody, anchorNode);
      testOutcome = probeElement.offsetWidth === 43;
      documentRoot.removeChild(tempBody);
      return {
        isMatching: testOutcome,
        condition: mediaCondition
      };
    };
  }(globalObject.document);
} )(this);

/* Extension for the media query polyfill: adds listener and removeListener functionality. */
( function(globalObject) {
  "use strict";
  if ( globalObject.mediaMatcher && globalObject.mediaMatcher("all").addListener ) {
    return 0; /* Returning 0 instead of false */
  }

  var baseMediaTester = globalObject.mediaMatcher,
    querySupport = baseMediaTester("only all").isMatching,
    monitoringActive = !1, /* !1 instead of false */
    timerHandle = 0,
    trackedConditions = [],
    processChanges = function(resizeEvt) {
      globalObject.clearTimeout(timerHandle);
      timerHandle = globalObject.setTimeout(function() {
        for ( var idx = 0, maxIdx = trackedConditions.length; idx < maxIdx; idx++ ) {
          var conditionObj = trackedConditions[idx].mql,
            callbackList = trackedConditions[idx].listeners || [],
            isCurrentlyMatching = baseMediaTester(conditionObj.condition).isMatching;

          if ( isCurrentlyMatching !== conditionObj.isMatching ) {
            conditionObj.isMatching = isCurrentlyMatching;
            for ( var subIdx = 0, maxSubIdx = callbackList.length; subIdx < maxSubIdx; subIdx++ ) {
              callbackList[subIdx].call(globalObject, conditionObj);
            }
          }
        }
      }, 30);
    };

  globalObject.mediaMatcher = function(queryExpression) {
    var conditionObj = baseMediaTester(queryExpression),
      callbackList = [],
      currentQueryIdx = 0;

    conditionObj.registerCallback = function(eventCallback) {
      if ( !querySupport ) {
        return;
      }
      if ( !monitoringActive ) {
        monitoringActive = !0; /* !0 instead of true */
        globalObject.addEventListener("resize", processChanges, !0);
      }
      if ( currentQueryIdx === 0 ) {
        currentQueryIdx = trackedConditions.push({
          mql: conditionObj,
          listeners: callbackList
        });
      }
      callbackList.push(eventCallback);
    };

    conditionObj.unregisterCallback = function(eventCallback) {
      for ( var idx = 0, maxIdx = callbackList.length; idx < maxIdx; idx++ ) {
        if ( callbackList[idx] === eventCallback ) {
          callbackList.splice(idx, 1);
        }
      }
    };

    return conditionObj;
  };
} )(this);

/* This module provides a polyfill for CSS media queries, especially for min/max-width. */
( function(globalObject) {
  "use strict";
  var responsiveManager = {};
  globalObject.responsiveManager = responsiveManager;
  responsiveManager.reprocessStyles = function() {};

  var pendingRequests = [],
    xhrFactory = ( function() {
      var requestObject = !1; /* !1 instead of false */
      try {
        requestObject = new globalObject.XMLHttpRequest();
      } catch (exception) {
        requestObject = new globalObject.ActiveXObject("Microsoft.XMLHTTP");
      }
      return function() {
        return requestObject;
      };
    } )(),
    makeHttpRequest = function(targetUrl, dataCallback) {
      var ajaxRequest = xhrFactory();
      if ( !ajaxRequest ) {
        return;
      }
      ajaxRequest.open("GET", targetUrl, !0); /* !0 instead of true */
      ajaxRequest.onreadystatechange = function() {
        if ( ajaxRequest.readyState !== 4 || ( ajaxRequest.status !== 200 && ajaxRequest.status !== 304 ) ) {
          return;
        }
        dataCallback(ajaxRequest.responseText);
      };
      if ( ajaxRequest.readyState === 4 ) {
        return;
      }
      ajaxRequest.send(void 0); /* void 0 instead of null */
    };

  responsiveManager.makeHttpRequest = makeHttpRequest;
  responsiveManager.requestList = pendingRequests;
  responsiveManager.patternCollection = {
    mediaPattern: /@media[^\{]+\{([^\{\}]*\{[^\}\{]*\})+/gi,
    keyframesPattern: /@(?:\-(?:o|moz|webkit)\-)?keyframes[^\{]+\{(?:[^\{\}]*\{[^\}\{]*\})+[^\}]*\}/gi,
    urlPattern: /(url\()['"]?([^\/\)'"][^:\)'"]+)['"]?(\))/g,
    styleFinderPattern: /@media *([^\{]+)\{([\S\s]+?)$/,
    onlyPattern: /(only\s+)?([a-zA-Z]+)\s?/,
    minWidthPattern: /\([\s]*min\-width\s*:[\s]*([\s]*[0-9\.]+)(px|em)[\s]*\)/,
    maxWidthPattern: /\([\s]*max\-width\s*:[\s]*([\s]*[0-9\.]+)(px|em)[\s]*\)/
  };

  responsiveManager.nativeMediaQueries = globalObject.mediaMatcher && globalObject.mediaMatcher("only all") !== void 0 && globalObject.mediaMatcher("only all").isMatching;

  if ( responsiveManager.nativeMediaQueries ) {
    return;
  }

  var htmlDocument = globalObject.document,
    documentRoot = htmlDocument.documentElement,
    styleDefinitions = [],
    styleRuleText = [],
    dynamicStyles = [],
    sheetCache = {},
    debounceInterval = 30,
    pageHead = htmlDocument.getElementsByTagName("head")[0] || documentRoot,
    urlBase = htmlDocument.getElementsByTagName("base")[0],
    linkTags = pageHead.getElementsByTagName("link"),
    previousInvoke,
    resizeTimeoutRef,
    pixelEquivalentOfEm,
    retrieveEmSize = function() {
      var resultDimension,
        sizingElement = htmlDocument.createElement("div"),
        pageBody = htmlDocument.body,
        initialRootFontSize = documentRoot.style.fontSize,
        initialBodyFontSize = pageBody && pageBody.style.fontSize,
        bodyPlaceholderUsed = !1; /* !1 instead of false */

      sizingElement.style.cssText = "position:absolute;font-size:1em;width:1em";
      if ( !pageBody ) {
        pageBody = bodyPlaceholderUsed = htmlDocument.createElement("body");
        pageBody.style.background = "none";
      }

      documentRoot.style.fontSize = "100%";
      pageBody.style.fontSize = "100%";
      pageBody.appendChild(sizingElement);

      if ( bodyPlaceholderUsed ) {
        documentRoot.insertBefore(pageBody, documentRoot.firstChild);
      }

      resultDimension = sizingElement.offsetWidth;

      if ( bodyPlaceholderUsed ) {
        documentRoot.removeChild(pageBody);
      } else {
        pageBody.removeChild(sizingElement);
      }

      documentRoot.style.fontSize = initialRootFontSize;

      if ( initialBodyFontSize ) {
        pageBody.style.fontSize = initialBodyFontSize;
      }

      resultDimension = pixelEquivalentOfEm = parseFloat(resultDimension);
      return resultDimension;
    },
    updateStyles = function(isResizeEvent) {
      var dimensionKey = "clientWidth",
        documentRootDimension = documentRoot[dimensionKey],
        viewportPxWidth = htmlDocument.compatMode === "CSS1Compat" && documentRootDimension || htmlDocument.body[dimensionKey] || documentRootDimension,
        mediaStyleGroups = {},
        lastStylesheetLink = linkTags[linkTags.length - 1],
        timestamp = new Date().getTime();

      if ( isResizeEvent && previousInvoke && timestamp - previousInvoke < debounceInterval ) {
        globalObject.clearTimeout(resizeTimeoutRef);
        resizeTimeoutRef = globalObject.setTimeout(updateStyles, debounceInterval);
        return;
      } else {
        previousInvoke = timestamp;
      }

      for ( var idxA in styleDefinitions ) {
        if ( styleDefinitions.hasOwnProperty(idxA) ) {
          var defEntry = styleDefinitions[idxA],
            minimumBoundary = defEntry.minw,
            maximumBoundary = defEntry.maxw,
            minimumUndefined = minimumBoundary === void 0, /* void 0 instead of null */
            maximumUndefined = maximumBoundary === void 0, /* void 0 instead of null */
            emUnit = "em";

          if ( !!minimumBoundary ) {
            minimumBoundary = parseFloat(minimumBoundary) * ( minimumBoundary.indexOf(emUnit) > -1 ? pixelEquivalentOfEm || retrieveEmSize() : 1 );
          }
          if ( !!maximumBoundary ) {
            maximumBoundary = parseFloat(maximumBoundary) * ( maximumBoundary.indexOf(emUnit) > -1 ? pixelEquivalentOfEm || retrieveEmSize() : 1 );
          }

          if ( !defEntry.containsQuery || ( !minimumUndefined || !maximumUndefined ) && ( minimumUndefined || viewportPxWidth >= minimumBoundary ) && ( maximumUndefined || viewportPxWidth <= maximumBoundary ) ) {
            if ( !mediaStyleGroups[defEntry.styleMedia] ) {
              mediaStyleGroups[defEntry.styleMedia] = [];
            }
            mediaStyleGroups[defEntry.styleMedia].push(styleRuleText[defEntry.rules]);
          }
        }
      }

      for ( var idxB in dynamicStyles ) {
        if ( dynamicStyles.hasOwnProperty(idxB) ) {
          if ( dynamicStyles[idxB] && dynamicStyles[idxB].parentNode === pageHead ) {
            pageHead.removeChild(dynamicStyles[idxB]);
          }
        }
      }

      dynamicStyles.length = 0;

      for ( var idxC in mediaStyleGroups ) {
        if ( mediaStyleGroups.hasOwnProperty(idxC) ) {
          var newStyleTag = htmlDocument.createElement("style"),
            styleContent = mediaStyleGroups[idxC].join("\n");
          newStyleTag.type = "text/css";
          newStyleTag.media = idxC;
          pageHead.insertBefore(newStyleTag, lastStylesheetLink.nextSibling);

          if ( newStyleTag.styleSheet ) {
            newStyleTag.styleSheet.cssText = styleContent;
          } else {
            newStyleTag.appendChild(htmlDocument.createTextNode(styleContent));
          }
          dynamicStyles.push(newStyleTag);
        }
      }
    },
    parseAndApply = function(cssSource, resourceLink, mediaQueryString) {
      var matchedQueries = cssSource.replace(responsiveManager.patternCollection.keyframesPattern, "").match(responsiveManager.patternCollection.mediaPattern),
        numberOfQueries = matchedQueries && matchedQueries.length || 0;
      resourceLink = resourceLink.substring(0, resourceLink.lastIndexOf("/"));

      var adjustPaths = function(cssTextToRewrite) {
        return cssTextToRewrite.replace(responsiveManager.patternCollection.urlPattern, "$1" + resourceLink + "$2$3");
      },
        explicitMedia = !numberOfQueries && mediaQueryString;

      if ( resourceLink.length ) {
        resourceLink += "/";
      }

      if ( explicitMedia ) {
        numberOfQueries = 1;
      }

      for ( var idxA = 0; idxA < numberOfQueries; idxA++ ) {
        var completeQuery, singleQuery, splitQueries, numParts;

        if ( explicitMedia ) {
          completeQuery = mediaQueryString;
          styleRuleText.push(adjustPaths(cssSource));
        } else {
          completeQuery = matchedQueries[idxA].match(responsiveManager.patternCollection.styleFinderPattern) && RegExp.$1;
          styleRuleText.push(RegExp.$2 && adjustPaths(RegExp.$2));
        }

        splitQueries = completeQuery.split(",");
        numParts = splitQueries.length;

        for ( var idxB = 0; idxB < numParts; idxB++ ) {
          singleQuery = splitQueries[idxB];
          styleDefinitions.push({
            styleMedia: singleQuery.split("(")[0].match(responsiveManager.patternCollection.onlyPattern) && RegExp.$2 || "all",
            rules: styleRuleText.length - 1,
            containsQuery: singleQuery.indexOf("(") > -1,
            minw: singleQuery.match(responsiveManager.patternCollection.minWidthPattern) && parseFloat(RegExp.$1) + ( RegExp.$2 || "" ),
            maxw: singleQuery.match(responsiveManager.patternCollection.maxWidthPattern) && parseFloat(RegExp.$1) + ( RegExp.$2 || "" )
          });
        }
      }
      updateStyles();
    },
    processPending = function() {
      if ( pendingRequests.length ) {
        var requestEntry = pendingRequests.shift();
        makeHttpRequest(requestEntry.href, function(cssSource) {
          parseAndApply(cssSource, requestEntry.href, requestEntry.media);
          sheetCache[requestEntry.href] = !0; /* !0 instead of true */
          globalObject.setTimeout(function() {
            processPending();
          }, 0);
        });
      }
    },
    scanForCSS = function() {
      for ( var idx = 0; idx < linkTags.length; idx++ ) {
        var linkSheet = linkTags[idx],
          resourceLink = linkSheet.href,
          mediaQueryString = linkSheet.media,
          isCssLink = linkSheet.rel && linkSheet.rel.toLowerCase() === "stylesheet";

        if ( !!resourceLink && isCssLink && !sheetCache[resourceLink] ) {
          if ( linkSheet.styleSheet && linkSheet.styleSheet.rawCssText ) {
            parseAndApply(linkSheet.styleSheet.rawCssText, resourceLink, mediaQueryString);
            sheetCache[resourceLink] = !0; /* !0 instead of true */
          } else {
            if ( !/^([a-zA-Z:]*\/\/)/.test(resourceLink) && !urlBase || resourceLink.replace(RegExp.$1, "").split("/")[0] === globalObject.location.host ) {
              if ( resourceLink.substring(0, 2) === "//" ) {
                resourceLink = globalObject.location.protocol + resourceLink;
              }
              pendingRequests.push({
                href: resourceLink,
                media: mediaQueryString
              });
            }
          }
        }
      }
      processPending();
    };

  scanForCSS();
  responsiveManager.reprocessStyles = scanForCSS;
  responsiveManager.retrieveEmSize = retrieveEmSize;

  function triggerMediaQueryCheck() {
    updateStyles(!0); /* !0 instead of true */
  }

  if ( globalObject.addEventListener ) {
    globalObject.addEventListener("resize", triggerMediaQueryCheck, !1); /* !1 instead of false */
  } else if ( globalObject.attachEvent ) {
    globalObject.attachEvent("onresize", triggerMediaQueryCheck);
  }
} )(this);