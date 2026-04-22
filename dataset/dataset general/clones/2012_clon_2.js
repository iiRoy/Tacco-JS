(function( globalScope, moduleBuilder ) {
  if ( typeof define === 'function' && define.amd ) {
    define( [], moduleBuilder );
  } else if ( typeof exports === 'object' ) {
    module.exports = moduleBuilder();
  } else {
    globalScope.layoutManager = moduleBuilder();
  }
}(this, function() {
// This is a polyfill for matchMedia functionality. It allows testing CSS media queries in JavaScript.
// Original authors: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license.

if (!window.matchMedia) {
    window.matchMedia = function() {
        "use strict";

        // For web browsers that support the matchMedium API (e.g., Internet Explorer 9 and WebKit browsers)
        var cssQueryHandler = (window.styleMedia || window.media);

        // For browsers that do not natively support matchMedium
        if ( !cssQueryHandler ) {
            var testStyleElement = document.createElement('style')
            , firstScriptTag = document.getElementsByTagName('script')[0]
            , computedStyleData = null;

            testStyleElement.type = 'text/css';
            testStyleElement.id = 'matchmediajs-test';

            firstScriptTag.parentNode.insertBefore(testStyleElement, firstScriptTag);

            // 'style.currentStyle' is for IE <= 8, 'window.getComputedStyle' for all other browsers
            computedStyleData = ('getComputedStyle' in window) && window.getComputedStyle(testStyleElement, null) || testStyleElement.currentStyle;

            cssQueryHandler = {
                evaluateMedia: function(queryExpression) {
                    var cssRuleContent = '@media ' + queryExpression + '{ #matchmediajs-test { width: 1px; } }';

                    // 'style.styleSheet' is for IE <= 8, 'style.textContent' for others
                    if (testStyleElement.styleSheet) {
                        testStyleElement.styleSheet.cssText = cssRuleContent;
                    } else {
                        testStyleElement.textContent = cssRuleContent;
                    }

                    // Check if the media query is true or false by inspecting the width
                    return computedStyleData.width === '1px';
                }
            };
        }

        return function(queryExpression) {
            return {
                isMatching: cssQueryHandler.evaluateMedia(queryExpression || 'all'),
                query: queryExpression || 'all'
            };
        };
    }();
}

// matchMedia() polyfill extension for addListener/removeListener.
// Author & copyright (c) 2012: Scott Jehl. Dual MIT/BSD license.
(function() {
    "use strict";

    // Exit if the browser already supports addListener
    if (window.matchMedia && window.matchMedia('all').addListener) {
        return false;
    }

    var originalMediaQuery = window.matchMedia
      , supportsMediaQueries = originalMediaQuery('only all').isMatching
      , eventActive = false
      , debounceTimer = 0 // setTimeout ID for debouncing 'processMediaChange'
      , registeredQueries = [] // Holds each 'mediaQueryObject' and its 'callbackList'
      , processMediaChange = function(eventObj) {
            // Debounce the event processing
            clearTimeout(debounceTimer);

            debounceTimer = setTimeout(function() {
                for (var idx = 0, limit = registeredQueries.length; idx < limit; idx++) {
                    var mediaQueryObject = registeredQueries[idx].mediaQueryObject
                      , callbackList = registeredQueries[idx].callbackList || []
                      , currentMatchState = originalMediaQuery(mediaQueryObject.query).isMatching;

                    // Update the mediaQueryObject's match state and invoke callbacks
                    // Callbacks fire only when transitioning into or out of a matched state
                    if (currentMatchState !== mediaQueryObject.isMatching) {
                        mediaQueryObject.isMatching = currentMatchState;

                        for (var subIdx = 0, subLimit = callbackList.length; subIdx < subLimit; subIdx++) {
                            callbackList[subIdx].call(window, mediaQueryObject);
                        }
                    }
                }
            }, 30);
        };

    window.matchMedia = function(queryExpression) {
        var mediaQueryObject = originalMediaQuery(queryExpression)
          , callbackList = []
          , entryIndex = 0;

        mediaQueryObject.attachListener = function(callbackFn) {
            // Changes won't occur for static CSS media types, so return early (affects IE <= 8)
            if (!supportsMediaQueries) {
                return;
            }

            // Set up a 'resize' listener for browsers that support CSS3 media queries (not IE <= 8)
            // Only one resize listener should ever be active for performance
            if (!eventActive) {
                eventActive = true;
                window.addEventListener('resize', processMediaChange, true);
            }

            // Add the object to registeredQueries only if it hasn't been added yet
            if (entryIndex === 0) {
                entryIndex = registeredQueries.push({
                    mediaQueryObject : mediaQueryObject,
                    callbackList     : callbackList
                });
            }

            callbackList.push(callbackFn);
        };

        mediaQueryObject.detachListener = function(callbackFn) {
            for (var idx = 0, limit = callbackList.length; idx < limit; idx++) {
                if (callbackList[idx] === callbackFn) {
                    callbackList.splice(idx, 1);
                }
            }
        };

        return mediaQueryObject;
    };
}());

// requestAnimationFrame polyfill by Erik Möller. Fixes by Paul Irish and Tino Zijdel. MIT license.
// See: http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// See: http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

(function() {
    "use strict";

    var previousFrameTime = 0;
    var vendorPrefixes = ['ms', 'moz', 'webkit', 'o'];
    for (var iter = 0; iter < vendorPrefixes.length && !window.requestAnimationFrame; ++iter) {
        window.requestAnimationFrame = window[vendorPrefixes[iter] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendorPrefixes[iter] + 'CancelAnimationFrame'] ||
            window[vendorPrefixes[iter] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(animationCallback, targetElement) {
            var currentTimeStamp = new Date().getTime();
            var delayUntilCall = Math.max(0, 16 - (currentTimeStamp - previousFrameTime));
            var timerId = window.setTimeout(function() { animationCallback(currentTimeStamp + delayUntilCall); },
              delayUntilCall);
            previousFrameTime = currentTimeStamp + delayUntilCall;
            return timerId;
        };
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(timerId) {
            clearTimeout(timerId);
        };
    }
}());

// CustomEvent polyfill for older browsers.
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent

if (typeof window.CustomEvent !== "function") {
  (function() {
    "use strict";
    function DomEvent(eventName, eventOptions) {
      eventOptions = eventOptions || { shouldBubble: false, canCancel: false, extraDetail: undefined };
      var eventInstance = document.createEvent('CustomEvent');
      eventInstance.initCustomEvent(eventName, eventOptions.shouldBubble, eventOptions.canCancel, eventOptions.extraDetail);
      return eventInstance;
     }

    DomEvent.prototype = window.Event.prototype;

    window.CustomEvent = DomEvent;
  })();
}

/* jshint laxcomma: true */
var layoutManager = (function (globalRef, domRef, undefValue) {
"use strict";

var moduleAPI = {}
  , managedLayouts = []
  , activeMediaRuleSet = []
  , queryListeners = []
  , assignDataAttribute = function(targetNode, attributeKey, attributeValue) {
      // Utilizes the dataset property or falls back for IE < 10
      if (targetNode.dataset) {
        targetNode.dataset[attributeKey] = attributeValue;
      } else {
        targetNode.setAttribute("data-" + attributeKey, attributeValue);
      }
      return;
    };

moduleAPI.retrieveLayoutConfiguration = function retrieveLayoutConfiguration(targetNode) {
  // Gathers the column count and CSS classes for columns
  // by inspecting the ::before pseudo-element's computed style on the grid.

  var calculatedStyle = globalRef.getComputedStyle(targetNode, ":before")
    , styleContent = calculatedStyle.getPropertyValue("content").slice(1, -1)
    , parsingResult = styleContent.match(/^\s*(\d+)(?:\s?\.(.+))?\s*$/)
    , columnCount = 1
    , cssClassesForColumns = []
  ;

  if (parsingResult) {
    columnCount = parsingResult[1];
    cssClassesForColumns = parsingResult[2];
    cssClassesForColumns = cssClassesForColumns ? cssClassesForColumns.split(".") : ["column"];
  } else {
    parsingResult = styleContent.match(/^\s*\.(.+)\s+(\d+)\s*$/);
    if (parsingResult) {
      cssClassesForColumns = parsingResult[1];
      columnCount = parsingResult[2];
      if (columnCount) {
            columnCount = columnCount.split(".");
      }
    }
  }

  return {
    columnCount: columnCount,
    cssClassesForColumns: cssClassesForColumns
  };
};


moduleAPI.insertLayoutColumns = function insertLayoutColumns(layoutContainer, contentElements) {
  // Based on the retrieved settings, this function creates columns
  // with the specified classes and distributes the provided items among them.

  var layoutConfig = moduleAPI.retrieveLayoutConfiguration(layoutContainer)
    , columnCount = layoutConfig.columnCount
    , cssClassesForColumns = layoutConfig.cssClassesForColumns
    , groupedColumnElements = new Array(+columnCount)
    , columnDocumentFragment = domRef.createDocumentFragment()
    , loopCounter = columnCount
    , cssSelector
  ;

  while (loopCounter-- !== 0) {
    cssSelector = "[data-columns] > *:nth-child(" + columnCount + "n-" + loopCounter + ")";
    groupedColumnElements.push(contentElements.querySelectorAll(cssSelector));
  }

  groupedColumnElements.forEach(function appendToLayoutFragment(elementRows) {
    var layoutColumn = domRef.createElement("div")
      , rowContentFragment = domRef.createDocumentFragment()
    ;

    layoutColumn.className = cssClassesForColumns.join(" ");

    Array.prototype.forEach.call(elementRows, function insertIntoColumn(singleRowElement) {
      rowContentFragment.appendChild(singleRowElement);
    });
    layoutColumn.appendChild(rowContentFragment);
    columnDocumentFragment.appendChild(layoutColumn);
  });

  layoutContainer.appendChild(columnDocumentFragment);
  assignDataAttribute(layoutContainer, 'columns', columnCount);
};


moduleAPI.stripLayoutColumns = function stripLayoutColumns(layoutContainer) {
  // This function removes all columns from a layout container
  // and returns the original items, sorted by their column order.

  var domSelectionRange = domRef.createRange();
  domSelectionRange.selectNodeContents(layoutContainer);

  var columnNodes = Array.prototype.filter.call(domSelectionRange.extractContents().childNodes, function filterDomElements(domNode) {
    return domNode instanceof globalRef.HTMLElement;
  });

  var colCount = columnNodes.length
    , initialColumnRowCount = columnNodes[0].childNodes.length
    , reorderedElements = new Array(initialColumnRowCount * colCount)
  ;

  Array.prototype.forEach.call(columnNodes, function processColumns(column, colIndex) {
    Array.prototype.forEach.call(column.children, function processRows(row, rowIdx) {
      reorderedElements[rowIdx * colCount + colIndex] = row;
    });
  });

  var temporaryContainer = domRef.createElement("div");
  assignDataAttribute(temporaryContainer, 'columns', 0);

  reorderedElements.filter(function filterValidChildren(currentChild) {
    return !!currentChild;
  }).forEach(function attachElement(currentChild) {
    temporaryContainer.appendChild(currentChild);
  });

  return temporaryContainer;
};


moduleAPI.refreshLayoutStructure = function refreshLayoutStructure(layoutContainer) {
  // This function removes and then re-adds the columns to the grid,
  // typically used when the number of columns changes due to a media query.

  globalRef.requestAnimationFrame(function renderOnMediaQueryChange() {
    moduleAPI.insertLayoutColumns(layoutContainer, moduleAPI.stripLayoutColumns(layoutContainer));
    var layoutUpdateEvent = new CustomEvent("columnsChange");
    layoutContainer.dispatchEvent(layoutUpdateEvent);
  });
};


moduleAPI.handleMediaQueryMatch = function handleMediaQueryMatch(mediaQueryListener) {
  // Reconstructs the columns when a media query matches the browser's current state.

  if (mediaQueryListener.isMatching) {
    Array.prototype.forEach.call(managedLayouts, moduleAPI.refreshLayoutStructure);
  }
};


moduleAPI.retrieveCssRules = function retrieveCssRules(styleSheetObject) {
  // Fetches a list of CSS rules from a given stylesheet.

  var ruleList;
  try {
    ruleList = styleSheetObject.sheet.cssRules || styleSheetObject.sheet.rules;
  } catch (errorObject) {
    return [];
  }

  return ruleList || [];
};


moduleAPI.getAllStyleSheets = function getAllStyleSheets() {
  // Returns a collection of all accessible stylesheets in the document.

  return Array.prototype.concat.call(
    Array.prototype.slice.call(domRef.querySelectorAll("style[type='text/css']")),
    Array.prototype.slice.call(domRef.querySelectorAll("link[rel='stylesheet']"))
  );
};


moduleAPI.checkRuleForColumnSelector = function checkRuleForColumnSelector(cssRuleArray) {
  // Determines if a media query CSS rule contains a selector
  // that targets the grid (i.e., [data-columns]).

  var iter, singleRule;

  try {
    iter = cssRuleArray.length;
  }
  catch (errorObject) {
    iter = 0;
  }

  while (iter--) {
    singleRule = cssRuleArray[iter];
    if (singleRule.selectorText && singleRule.selectorText.match(/\[data-columns\](.*)::?before$/)) {
      return true;
    }
  }

  return false;
};


moduleAPI.detectMediaQueries = function detectMediaQueries() {
  // Scans all stylesheets for selectors that style grids,
  // provided the matchMedia API is supported.

  var freshMediaRules = [];

  if (!globalRef.matchMedia) {
    return;
  }

  moduleAPI.getAllStyleSheets().forEach(function processStyleSheet(styleSheetObject) {
    Array.prototype.forEach.call(moduleAPI.retrieveCssRules(styleSheetObject), function filterColumnSelectors(singleRule) {
      if (singleRule.media && singleRule.cssRules && moduleAPI.checkRuleForColumnSelector(singleRule.cssRules)) {
        freshMediaRules.push(singleRule);
      }
    });
  });

  // Remove matchMedia listeners from any old rules that are no longer present
  var staleRules = activeMediaRuleSet.filter(function (item) {
      return freshMediaRules.indexOf(item) === -1;
  });
  queryListeners.filter(function (item) {
    return staleRules.indexOf(item.rule) !== -1;
  }).forEach(function (item) {
      item.mediaQueryListener.detachListener(moduleAPI.handleMediaQueryMatch);
  });
  queryListeners = queryListeners.filter(function (item) {
    return staleRules.indexOf(item.rule) === -1;
  });

  // Add matchMedia listeners for new rules
  freshMediaRules.filter(function (item) {
    return activeMediaRuleSet.indexOf(item) == -1;
  }).forEach(function (singleRule) {
      var mediaQueryListener = globalRef.matchMedia(singleRule.media.mediaText);
      mediaQueryListener.attachListener(moduleAPI.handleMediaQueryMatch);
      queryListeners.push({rule: singleRule, mediaQueryListener: mediaQueryListener});
  });

  // Update the set of active media rules
  activeMediaRuleSet.length = 0;
  activeMediaRuleSet = freshMediaRules;
};


moduleAPI.reDetectAndApplyMediaQueries = function reDetectAndApplyMediaQueries() {
    moduleAPI.detectMediaQueries();
    Array.prototype.forEach.call(managedLayouts, moduleAPI.refreshLayoutStructure);
};


moduleAPI.getNextColumnPlacementIndex = function getNextColumnPlacementIndex(layoutContainer, columnFragments) {
  // Determines the index of the column where the next element should be placed.

  var columnNodes = layoutContainer.children
    , childCount = columnNodes.length
    , minRowCount = 0
    , currentChild
    , currentChildCount
    , loopCounter
    , targetIndex = 0
  ;
  for (loopCounter = 0; loopCounter < childCount; loopCounter++) {
    currentChild = columnNodes[loopCounter];
    currentChildCount = currentChild.children.length + (columnFragments[loopCounter].children || columnFragments[loopCounter].childNodes).length;
  if(minRowCount === 0) {
    minRowCount = currentChildCount;
  }
    if(currentChildCount < minRowCount) {
      targetIndex = loopCounter;
      minRowCount = currentChildCount;
    }
  }

  return targetIndex;
};


moduleAPI.generateFragmentArray = function generateFragmentArray(fragmentCount) {
  // Creates and returns an array of document fragments.

  var columnFragments = new Array(fragmentCount)
    , loopCounter = 0
  ;

  while (loopCounter !== fragmentCount) {
    columnFragments[loopCounter] = domRef.createDocumentFragment();
    loopCounter++;
  }

  return columnFragments;
};


moduleAPI.addGridElements = function addGridElements(layoutContainer, incomingElements) {
  // Appends a list of elements to the end of a grid, distributing them across columns.

  var columnNodes = layoutContainer.children
    , colCount = columnNodes.length
    , columnFragments = moduleAPI.generateFragmentArray(colCount)
  ;

  Array.prototype.forEach.call(incomingElements, function appendToNextAvailableFragment(element) {
    var targetColumnIndex = moduleAPI.getNextColumnPlacementIndex(layoutContainer, columnFragments);
    columnFragments[targetColumnIndex].appendChild(element);
  });

  Array.prototype.forEach.call(columnNodes, function appendToColumnElement(column, index) {
    column.appendChild(columnFragments[index]);
  });
};


moduleAPI.precedeGridElements = function precedeGridElements(layoutContainer, incomingElements) {
  // Prepends a list of elements to the beginning of a grid, distributing them across columns.

  var columnNodes = layoutContainer.children
    , colCount = columnNodes.length
    , columnFragments = moduleAPI.generateFragmentArray(colCount)
  ;

  // Reverse the incoming elements to maintain logical order when prepending
  incomingElements = Array.prototype.slice.call(incomingElements).reverse();

  Array.prototype.forEach.call(incomingElements, function prependToNextAvailableFragment(element) {
    var targetColumnIndex = moduleAPI.getNextColumnPlacementIndex(layoutContainer, columnFragments);
    columnFragments[targetColumnIndex].insertBefore(element, columnFragments[targetColumnIndex].firstChild);
  });

  Array.prototype.forEach.call(columnNodes, function prependToColumnElement(column, index) {
    column.insertBefore(columnFragments[index], column.firstChild);
  });
};


moduleAPI.registerLayout = function registerLayout(layoutContainer) {
  // Registers a grid layout, initializes its columns, and adds it to the list of managed layouts.

  if (globalRef.getComputedStyle(layoutContainer, ":before").getPropertyValue("content").indexOf("columns") === -1) {
    return;
  }

  moduleAPI.insertLayoutColumns(layoutContainer, domRef.createDocumentFragment());
  managedLayouts.push(layoutContainer);
};


moduleAPI.unregisterLayout = function unregisterLayout(layoutContainer) {
  // Unregisters a grid layout, removes its columns, and removes it from the managed list.

  var elements = moduleAPI.stripLayoutColumns(layoutContainer);
  layoutContainer.appendChild(elements);
  managedLayouts.splice(managedLayouts.indexOf(layoutContainer), 1);
};


moduleAPI.init = function initializeLayouts() {
  // Initializes the layout system by scanning for media queries and registering existing grids.

  moduleAPI.detectMediaQueries();

  Array.prototype.forEach.call(domRef.querySelectorAll("[data-columns]"), moduleAPI.registerLayout);
};


moduleAPI.appendElements = moduleAPI.addGridElements;
moduleAPI.prependElements = moduleAPI.precedeGridElements;

// Initialize on DOMContentLoaded or if the document is already ready
if (domRef.readyState === 'complete' || domRef.readyState === 'interactive') {
  moduleAPI.init();
} else {
  domRef.addEventListener('DOMContentLoaded', moduleAPI.init);
}

// Listen for new stylesheets or changes to existing ones that might affect grid layouts
globalRef.addEventListener('load', moduleAPI.reDetectAndApplyMediaQueries);
globalRef.addEventListener('resize', moduleAPI.reDetectAndApplyMediaQueries);


return moduleAPI;

}(window, document)));