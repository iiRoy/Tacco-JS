(function(globalObject, moduleFactory) {
  if (typeof define === 'function' && define.amd) {
    define([], moduleFactory);
  } else if (typeof exports === 'object') {
    module.exports = moduleFactory();
  } else {
    globalObject.fluidLayoutEngine = moduleFactory();
  }
}(this, function() {
// This section implements a basic window.matchMedia polyfill for older browsers.
// It detects whether the browser supports matchMedia and provides a fallback if not.
if (!window.matchMedia) {
    window.matchMedia = function() {
        "use strict";

        // Attempt to use native styleMedia or media for testing media queries
        var mediaQueryTester = (window.styleMedia || window.media);

        // If native support is absent, create a custom testing mechanism
        if (!mediaQueryTester) {
            let tempStyleElement = document.createElement('style');
            let firstScriptElement = document.getElementsByTagName('script')[0];
            let computedStyleHolder = null;

            tempStyleElement.type = 'text/css';
            tempStyleElement.id = 'responsive-layout-test-style';

            // Insert the temporary style element into the DOM
            if (firstScriptElement && firstScriptElement.parentNode) {
              firstScriptElement.parentNode.insertBefore(tempStyleElement, firstScriptElement);
            } else {
              document.head.appendChild(tempStyleElement); // Fallback if no script found
            }


            // Retrieve computed styles, using window.getComputedStyle for modern browsers
            // and style.currentStyle for IE <= 8
            computedStyleHolder = (('getComputedStyle' in window) && window.getComputedStyle(tempStyleElement, null)) || tempStyleElement.currentStyle;

            mediaQueryTester = {
                evaluateMediaQuery: function(queryText) {
                    const testCssRule = `@media ${queryText}{ #responsive-layout-test-style { width: 1px; } }`;

                    // Apply the test CSS rule
                    if (tempStyleElement.styleSheet) { // IE <= 8
                        tempStyleElement.styleSheet.cssText = testCssRule;
                    } else { // Modern browsers
                        tempStyleElement.textContent = testCssRule;
                    }

                    // Check if the media query is active by inspecting the width
                    return computedStyleHolder.width === '1px';
                }
            };
        }

        // Return a function that creates a MediaQueryList-like object
        return function(mediaQueryString) {
            const effectiveQuery = mediaQueryString || 'all';
            return {
                matches: mediaQueryTester.evaluateMediaQuery(effectiveQuery),
                media: effectiveQuery
            };
        };
    }();
}

// This polyfill extends the matchMedia functionality to include addListener and removeListener.
// It's crucial for responsive layouts that react to media query changes without full page reloads.
(function(){
    "use strict";

    // If matchMedia already has addListener support, no need for polyfill
    if (window.matchMedia && typeof window.matchMedia('all').addListener === 'function') {
        return;
    }

    const nativeMediaQueryHandler = window.matchMedia;
    const supportsCssMediaQueries = nativeMediaQueryHandler('only all').matches;
    let isResizeObserverActive = false;
    let debounceTimeoutIdentifier = 0;
    const registeredMediaQueryObservers = []; // Stores { mql, listeners }
    const DEBOUNCE_DELAY_MS = 30; // Milliseconds to wait before processing resize events

    const processMediaQueryChanges = function() {
        clearTimeout(debounceTimeoutIdentifier); // Clear any pending debounced calls

        debounceTimeoutIdentifier = setTimeout(() => {
            for (let i = 0; i < registeredMediaQueryObservers.length; i++) {
                const observerEntry = registeredMediaQueryObservers[i];
                const mediaQueryList = observerEntry.mql;
                const activeListeners = observerEntry.listeners || [];
                const currentMatchesState = nativeMediaQueryHandler(mediaQueryList.media).matches;

                // Update the 'matches' value and notify listeners if the state has changed
                if (currentMatchesState !== mediaQueryList.matches) {
                    mediaQueryList.matches = currentMatchesState;

                    for (let j = 0; j < activeListeners.length; j++) {
                        activeListeners[j].call(window, mediaQueryList);
                    }
                }
            }
        }, DEBOUNCE_DELAY_MS);
    };

    // Override the global window.matchMedia to include listener methods
    window.matchMedia = function(mediaQueryString) {
        const mediaQueryList = nativeMediaQueryHandler(mediaQueryString);
        const associatedListeners = [];
        let observerIndex = 0; // Tracks if this MQL is already registered

        mediaQueryList.addListener = function(listenerCallback) {
            // Early exit if CSS media queries are not supported (e.g., IE 8)
            if (!supportsCssMediaQueries) {
                return;
            }

            // Start a single global resize listener for performance
            if (!isResizeObserverActive) {
                isResizeObserverActive = true;
                window.addEventListener('resize', processMediaQueryChanges, true);
            }

            // Register this media query list and its listeners if not already done
            if (observerIndex === 0) {
                observerIndex = registeredMediaQueryObservers.push({
                    mql: mediaQueryList,
                    listeners: associatedListeners
                });
            }

            associatedListeners.push(listenerCallback);
        };

        mediaQueryList.removeListener = function(listenerCallback) {
            const listenerIdx = associatedListeners.indexOf(listenerCallback);
            if (listenerIdx > -1) {
                associatedListeners.splice(listenerIdx, 1);
            }
            // Optionally, if associatedListeners becomes empty, remove from registeredMediaQueryObservers
            // and potentially stop the global resize listener. For simplicity, we keep it active.
        };

        return mediaQueryList;
    };
}());

// requestAnimationFrame polyfill
// Provides a smoother way to animate by synchronizing with the browser's refresh rate.
(function() {
    "use strict";

    let previousFrameTimestamp = 0;
    const browserPrefixes = ['ms', 'moz', 'webkit', 'o'];

    // Check for native requestAnimationFrame and cancelAnimationFrame
    for (let i = 0; i < browserPrefixes.length && !window.requestAnimationFrame; ++i) {
        window.requestAnimationFrame = window[browserPrefixes[i] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[browserPrefixes[i] + 'CancelAnimationFrame'] ||
                                      window[browserPrefixes[i] + 'CancelRequestAnimationFrame'];
    }

    // Polyfill for requestAnimationFrame
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback) {
            const currentTime = new Date().getTime();
            const timeUntilNextFrame = Math.max(0, 16 - (currentTime - previousFrameTimestamp)); // Aim for ~60 FPS
            const timerId = window.setTimeout(function() { callback(currentTime + timeUntilNextFrame); },
              timeUntilNextFrame);
            previousFrameTimestamp = currentTime + timeUntilNextFrame;
            return timerId;
        };
    }

    // Polyfill for cancelAnimationFrame
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
}());

// CustomEvent polyfill for browsers that do not support it natively.
// This allows for dispatching custom DOM events.
if (typeof window.CustomEvent !== "function") {
  (function() {
    "use strict";
    function UserDefinedEvent(eventName, eventOptions) {
      eventOptions = eventOptions || { bubbles: false, cancelable: false, detail: undefined };
      const newEvent = document.createEvent('CustomEvent');
      newEvent.initCustomEvent(eventName, eventOptions.bubbles, eventOptions.cancelable, eventOptions.detail);
      return newEvent;
     }

    UserDefinedEvent.prototype = window.Event.prototype;

    window.CustomEvent = UserDefinedEvent;
  })();
}

/*
 * Fluid Layout Engine - a JavaScript library for responsive grid layouts.
 * Developed to dynamically adjust content based on CSS media queries.
 */
const fluidLayoutEngine = (function (globalRef, documentRef, undefined) {
"use strict";

const layoutManager = {};
let managedGrids = [];
let activeMediaRuleSets = [];
let activeMediaQueryListeners = [];

/**
 * Helper function to set or update a data attribute on an element.
 * Provides a fallback for older browsers that don't fully support dataset.
 * @param {HTMLElement} targetElement - The DOM element to modify.
 * @param {string} key - The data attribute key (e.g., 'columns' for 'data-columns').
 * @param {string|number} value - The value to set for the data attribute.
 */
const updateDatasetAttribute = function(targetElement, key, value) {
  if (!targetElement) return;
  if (targetElement.dataset) {
    targetElement.dataset[key] = value;
  } else {
    targetElement.setAttribute(`data-${key}`, value);
  }
};

/**
 * Parses the ::before pseudo-element's content of a grid to determine column configuration.
 * The content should be in the format: "N .class1.class2" or ".class1.class2 N".
 * @param {HTMLElement} gridElement - The grid container element.
 * @returns {object} An object containing numberOfColumns and columnClasses.
 */
layoutManager.retrieveGridConfiguration = function retrieveGridConfiguration(gridElement) {
  if (!gridElement) {
    console.warn("retrieveGridConfiguration received a null or undefined gridElement.");
    return { numberOfColumns: 1, columnClasses: ["column"] };
  }

  const computedStyle = globalRef.getComputedStyle(gridElement, ":before");
  const content = computedStyle.getPropertyValue("content").replace(/^['"]|['"]$/g, ''); // Remove quotes
  let columnCount = 1;
  let classes = ["column"];

  // Attempt to parse content: "N .class1.class2" or ".class1.class2 N"
  const regex1 = /^\s*(\d+)(?:\s?\.(.+))?\s*$/; // N .classes
  const regex2 = /^\s*\.(.+)\s+(\d+)\s*$/;     // .classes N

  let match = content.match(regex1);
  if (match) {
    columnCount = parseInt(match[1], 10);
    classes = match[2] ? match[2].split(".").filter(Boolean) : ["column"];
  } else {
    match = content.match(regex2);
    if (match) {
      classes = match[1] ? match[1].split(".").filter(Boolean) : ["column"];
      columnCount = parseInt(match[2], 10);
    }
  }

  // Ensure columnCount is a positive integer
  if (isNaN(columnCount) || columnCount < 1) {
    columnCount = 1;
  }
  // Ensure there's at least one class
  if (classes.length === 0) {
    classes = ["column"];
  }

  return {
    numberOfColumns: columnCount,
    columnClasses: classes
  };
};

/**
 * Creates and appends columns to a grid element, distributing a list of items among them.
 * @param {HTMLElement} gridContainer - The grid element to add columns to.
 * @param {HTMLElement} itemsContainer - A temporary container holding all items to be distributed.
 */
layoutManager.constructGridColumns = function constructGridColumns(gridContainer, itemsContainer) {
  if (!gridContainer || !itemsContainer) {
    console.warn("constructGridColumns: Invalid gridContainer or itemsContainer provided.");
    return;
  }

  const gridConfig = layoutManager.retrieveGridConfiguration(gridContainer);
  const totalColumns = gridConfig.numberOfColumns;
  const columnClassNames = gridConfig.columnClasses;
  const columnFragments = Array.from({ length: totalColumns }, () => documentRef.createDocumentFragment());
  const allItems = Array.from(itemsContainer.children); // Convert HTMLCollection to Array

  // Distribute items to column fragments based on modulo arithmetic
  allItems.forEach((item, index) => {
    columnFragments[index % totalColumns].appendChild(item);
  });

  const mainFragment = documentRef.createDocumentFragment();
  for (let i = 0; i < totalColumns; i++) {
    const columnDiv = documentRef.createElement("div");
    columnDiv.className = columnClassNames.join(" ");
    columnDiv.appendChild(columnFragments[i]);
    mainFragment.appendChild(columnDiv);
  }

  gridContainer.appendChild(mainFragment);
  updateDatasetAttribute(gridContainer, 'columns', totalColumns);
};

/**
 * Removes all column elements from a grid and returns its items within a temporary container.
 * The items are reordered based on their original placement across columns.
 * @param {HTMLElement} gridContainer - The grid element to deconstruct.
 * @returns {HTMLElement} A temporary div containing all grid items in their original order.
 */
layoutManager.deconstructGridColumns = function deconstructGridColumns(gridContainer) {
  if (!gridContainer) {
    console.warn("deconstructGridColumns received a null or undefined gridContainer.");
    return documentRef.createElement("div"); // Return an empty div to prevent errors
  }

  const tempRange = documentRef.createRange();
  tempRange.selectNodeContents(gridContainer);

  const columnElements = Array.from(tempRange.extractContents().childNodes).filter(node =>
    node instanceof globalRef.HTMLElement && node.nodeType === Node.ELEMENT_NODE
  );

  const numColumns = columnElements.length;
  if (numColumns === 0) {
      return documentRef.createElement("div"); // No columns to process
  }

  const itemsInFirstColumn = columnElements[0].children.length;
  const reorderedItems = new Array(itemsInFirstColumn * numColumns).fill(null);

  columnElements.forEach((column, columnIndex) => {
    Array.from(column.children).forEach((item, rowIndex) => {
      reorderedItems[rowIndex * numColumns + columnIndex] = item;
    });
  });

  const temporaryItemsWrapper = documentRef.createElement("div");
  updateDatasetAttribute(temporaryItemsWrapper, 'columns', 0); // Indicate no columns currently

  reorderedItems.filter(item => item !== null).forEach(item => {
    temporaryItemsWrapper.appendChild(item);
  });

  return temporaryItemsWrapper;
};

/**
 * Re-renders the grid columns. This is typically called when the number of columns changes
 * due to a media query update.
 * @param {HTMLElement} gridElement - The grid container to rebuild.
 */
layoutManager.rebuildGridColumns = function rebuildGridColumns(gridElement) {
  if (!gridElement) return;

  // Use requestAnimationFrame for a smoother visual update
  if (globalRef.requestAnimationFrame) {
    globalRef.requestAnimationFrame(() => {
      const detachedItems = layoutManager.deconstructGridColumns(gridElement);
      layoutManager.constructGridColumns(gridElement, detachedItems);
      // Dispatch a custom event to notify external components of the layout change
      gridElement.dispatchEvent(new CustomEvent("layoutColumnsChanged"));
    });
  } else { // Fallback for browsers without requestAnimationFrame
    const detachedItems = layoutManager.deconstructGridColumns(gridElement);
    layoutManager.constructGridColumns(gridElement, detachedItems);
    gridElement.dispatchEvent(new CustomEvent("layoutColumnsChanged"));
  }
};

/**
 * Callback function for media query list changes.
 * When a media query state changes (e.g., window resized), it triggers a grid rebuild.
 * @param {MediaQueryListEvent} mediaQueryListEvent - The event object from matchMedia.
 */
layoutManager.handleMediaQueryUpdate = function handleMediaQueryUpdate(mediaQueryListEvent) {
  if (!mediaQueryListEvent || !mediaQueryListEvent.matches) {
    // Only act when the media query becomes true
    return;
  }
  managedGrids.forEach(grid => layoutManager.rebuildGridColumns(grid));
};

/**
 * Safely retrieves CSS rules from a given stylesheet.
 * Handles potential security errors when accessing cross-origin stylesheets.
 * @param {CSSStyleSheet|HTMLLinkElement|HTMLStyleElement} stylesheetRef - The stylesheet object or element.
 * @returns {CSSRuleList} A list of CSS rules, or an empty array if access is denied.
 */
layoutManager.fetchStylesheetRules = function fetchStylesheetRules(stylesheetRef) {
  if (!stylesheetRef || !stylesheetRef.sheet) return [];
  try {
    return stylesheetRef.sheet.cssRules || stylesheetRef.sheet.rules || [];
  } catch (e) {
    console.warn("Could not access CSS rules from stylesheet, likely due to cross-origin restrictions:", stylesheetRef, e);
    return [];
  }
};

/**
 * Gathers all accessible stylesheet elements in the document.
 * @returns {Array<HTMLLinkElement|HTMLStyleElement>} A list of stylesheet elements.
 */
layoutManager.getAllDocumentStylesheets = function getAllDocumentStylesheets() {
  const linkStyles = Array.from(documentRef.querySelectorAll("link[rel='stylesheet']"));
  const inlineStyles = Array.from(documentRef.querySelectorAll("style[type='text/css']"));
  return [...linkStyles, ...inlineStyles];
};

/**
 * Checks if any rule within a given CSS rule list targets the grid's data-columns selector.
 * This helps identify media queries relevant to the grid layout.
 * @param {CSSRuleList} rules - A list of CSS rules.
 * @returns {boolean} True if a grid-targeting selector is found, false otherwise.
 */
layoutManager.isGridStylingMediaQuery = function isGridStylingMediaQuery(rules) {
  for (let i = rules.length - 1; i >= 0; i--) {
    const rule = rules[i];
    // Check for selectorText and match patterns like "[data-columns] > *:before" or "[data-columns]::before"
    if (rule.selectorText && /\[data-columns\]\s*(?:>.*)?::?before$/i.test(rule.selectorText)) {
      return true;
    }
  }
  return false;
};

/**
 * Scans all stylesheets for media queries that define grid column configurations.
 * Sets up matchMedia listeners for these queries to react to responsive changes.
 */
layoutManager.monitorResponsiveStyles = function monitorResponsiveStyles() {
  const discoveredMediaRules = new Set(); // Use a Set for efficient uniqueness checking
  const newActiveMediaRuleSets = [];

  layoutManager.getAllDocumentStylesheets().forEach(stylesheet => {
    layoutManager.fetchStylesheetRules(stylesheet).forEach(rule => {
      // Check if it's a CSSMediaRule and contains relevant grid styling
      if (rule.media && rule.cssRules && layoutManager.isGridStylingMediaQuery(rule.cssRules)) {
        discoveredMediaRules.add(rule);
      }
    });
  });

  // Filter out rules that are no longer present or are new
  const oldRulesToRemove = activeMediaRuleSets.filter(rule => !discoveredMediaRules.has(rule));
  const newRulesToAdd = Array.from(discoveredMediaRules).filter(rule => !activeMediaRuleSets.includes(rule));

  // Remove listeners for old rules
  activeMediaQueryListeners = activeMediaQueryListeners.filter(listenerEntry => {
    if (oldRulesToRemove.includes(listenerEntry.rule)) {
      listenerEntry.mql.removeListener(layoutManager.handleMediaQueryUpdate);
      return false; // Remove this entry
    }
    return true; // Keep this entry
  });

  // Add listeners for new rules
  newRulesToAdd.forEach(rule => {
    const mql = globalRef.matchMedia(rule.media.mediaText);
    mql.addListener(layoutManager.handleMediaQueryUpdate);
    activeMediaQueryListeners.push({ rule: rule, mql: mql });
    newActiveMediaRuleSets.push(rule); // Add to the list of currently active rules
  });

  // Update the main list of active media rules
  activeMediaRuleSets = newActiveMediaRuleSets;
};

/**
 * Re-scans for media queries and rebuilds all managed grids.
 * Useful after dynamic stylesheet changes or initial setup.
 */
layoutManager.reinitiateResponsiveMonitoring = function reinitiateResponsiveMonitoring() {
  console.info("FluidLayoutEngine: Re-scanning media queries and rebuilding grids.");
  layoutManager.monitorResponsiveStyles();
  managedGrids.forEach(grid => layoutManager.rebuildGridColumns(grid));
};

/**
 * Determines the column index where the next element should be added to maintain balance.
 * It considers both existing elements and elements already queued in fragments.
 * @param {HTMLElement} gridContainer - The parent grid element.
 * @param {Array<DocumentFragment>} columnFragments - An array of document fragments, one for each column.
 * @returns {number} The index of the column with the fewest items.
 */
layoutManager.determineNextColumnIndex = function determineNextColumnIndex(gridContainer, columnFragments) {
  const columns = gridContainer.children;
  let leastRowCount = Infinity;
  let targetColumnIndex = 0;

  for (let i = 0; i < columns.length; i++) {
    const currentColumn = columns[i];
    // Sum of existing items and items in the fragment for this column
    const currentRowCount = currentColumn.children.length + columnFragments[i].children.length;

    if (currentRowCount < leastRowCount) {
      leastRowCount = currentRowCount;
      targetColumnIndex = i;
    }
  }

  return targetColumnIndex;
};

/**
 * Generates an array of empty DocumentFragments, useful for collecting elements before DOM insertion.
 * @param {number} count - The number of fragments to create.
 * @returns {Array<DocumentFragment>} An array of DocumentFragments.
 */
layoutManager.generateDocumentFragments = function generateDocumentFragments(count) {
  return Array.from({ length: count }, () => documentRef.createDocumentFragment());
};

/**
 * Appends a collection of elements to the grid, distributing them across columns.
 * Elements are added to the column with the least height/item count.
 * @param {HTMLElement} gridContainer - The grid element to append elements to.
 * @param {Array<HTMLElement>} elementsToAdd - An array of elements to distribute and append.
 */
layoutManager.distributeAndAppendElements = function distributeAndAppendElements(gridContainer, elementsToAdd) {
  if (!gridContainer || !elementsToAdd || elementsToAdd.length === 0) return;

  const columns = Array.from(gridContainer.children);
  if (columns.length === 0) {
      console.warn("Grid has no columns. Ensure grid is initialized with constructGridColumns before appending elements.");
      return;
  }

  const numColumns = columns.length;
  const fragmentsForInsertion = layoutManager.generateDocumentFragments(numColumns);

  elementsToAdd.forEach(element => {
    const targetColumnIdx = layoutManager.determineNextColumnIndex(gridContainer, fragmentsForInsertion);
    fragmentsForInsertion[targetColumnIdx].appendChild(element);
  });

  columns.forEach((column, index) => {
    column.appendChild(fragmentsForInsertion[index]);
  });
};

/**
 * Prepends a collection of elements to the grid, distributing them across columns.
 * Elements are added to the column with the least height/item count at the top.
 * @param {HTMLElement} gridContainer - The grid element to prepend elements to.
 * @param {Array<HTMLElement>} elementsToPrepend - An array of elements to distribute and prepend.
 */
layoutManager.distributeAndPrependElements = function distributeAndPrependElements(gridContainer, elementsToPrepend) {
  if (!gridContainer || !elementsToPrepend || elementsToPrepend.length === 0) return;

  const columns = Array.from(gridContainer.children);
  if (columns.length === 0) {
      console.warn("Grid has no columns. Ensure grid is initialized with constructGridColumns before prepending elements.");
      return;
  }

  const numColumns = columns.length;
  const fragmentsForInsertion = layoutManager.generateDocumentFragments(numColumns);

  // Distribute elements to fragments in reverse order to ensure correct prepend order
  // when appending to fragment and then prepending fragment to column.
  elementsToPrepend.reverse().forEach(element => {
    const targetColumnIdx = layoutManager.determineNextColumnIndex(gridContainer, fragmentsForInsertion);
    // Prepend to the fragment, so when fragment is prepended to column, elements are in correct order
    fragmentsForInsertion[targetColumnIdx].insertBefore(element, fragmentsForInsertion[targetColumnIdx].firstChild);
  });

  columns.forEach((column, index) => {
    column.insertBefore(fragmentsForInsertion[index], column.firstChild);
  });
};

/**
 * Initializes a grid element by setting up its columns and making it responsive.
 * @param {HTMLElement} gridElement - The grid container element.
 */
layoutManager.initiateGrid = function initiateGrid(gridElement) {
  if (!gridElement || !(gridElement instanceof globalRef.HTMLElement)) {
    console.error("fluidLayoutEngine.initiateGrid: Invalid grid element provided.", gridElement);
    return;
  }

  // If already managed, skip
  if (managedGrids.includes(gridElement)) {
      console.warn("fluidLayoutEngine: Grid already initialized:", gridElement);
      return;
  }

  managedGrids.push(gridElement);

  // Extract existing child elements before column creation
  const initialItemsWrapper = documentRef.createElement("div");
  while (gridElement.firstChild) {
      initialItemsWrapper.appendChild(gridElement.firstChild);
  }

  layoutManager.constructGridColumns(gridElement, initialItemsWrapper);
  updateDatasetAttribute(gridElement, 'status', 'initialized');
  gridElement.dispatchEvent(new CustomEvent("gridInitialized"));
};

/**
 * Destroys a managed grid, removing its columns and listeners.
 * @param {HTMLElement} gridElement - The grid container element to destroy.
 */
layoutManager.destroyGrid = function destroyGrid(gridElement) {
  if (!gridElement || !managedGrids.includes(gridElement)) {
      console.warn("fluidLayoutEngine.destroyGrid: Grid not found or already destroyed.", gridElement);
      return;
  }

  // Remove from managed grids list
  managedGrids = managedGrids.filter(grid => grid !== gridElement);

  // Deconstruct columns and return items to the grid directly
  const itemsContainer = layoutManager.deconstructGridColumns(gridElement);
  while (itemsContainer.firstChild) {
      gridElement.appendChild(itemsContainer.firstChild);
  }

  updateDatasetAttribute(gridElement, 'columns', ''); // Clear column count
  updateDatasetAttribute(gridElement, 'status', 'destroyed');
  gridElement.dispatchEvent(new CustomEvent("gridDestroyed"));

  // Re-scan media queries to potentially remove listeners if no grids are left
  if (managedGrids.length === 0) {
      layoutManager.monitorResponsiveStyles(); // This will clean up if no rules match
  }
};

/**
 * Public API for the fluid layout engine.
 * Users interact with these methods to manage grids.
 */
const publicApi = {
  /**
   * Initializes one or more grid elements.
   * @param {HTMLElement|NodeList|Array<HTMLElement>} elements - A single element or a collection of elements.
   */
  init: function(elements) {
    if (!elements) return;
    const elementsArray = elements instanceof NodeList || Array.isArray(elements)
      ? Array.from(elements)
      : [elements];

    elementsArray.forEach(layoutManager.initiateGrid);

    // Initial scan and setup for responsive behavior
    if (managedGrids.length > 0) {
        layoutManager.monitorResponsiveStyles();
    }
  },

  /**
   * Appends new elements to an existing grid.
   * @param {HTMLElement} gridElement - The target grid.
   * @param {HTMLElement|NodeList|Array<HTMLElement>} elements - Elements to append.
   */
  append: function(gridElement, elements) {
    if (!gridElement || !elements) return;
    const elementsArray = elements instanceof NodeList || Array.isArray(elements)
      ? Array.from(elements)
      : [elements];
    layoutManager.distributeAndAppendElements(gridElement, elementsArray);
  },

  /**
   * Prepends new elements to an existing grid.
   * @param {HTMLElement} gridElement - The target grid.
   * @param {HTMLElement|NodeList|Array<HTMLElement>} elements - Elements to prepend.
   */
  prepend: function(gridElement, elements) {
    if (!gridElement || !elements) return;
    const elementsArray = elements instanceof NodeList || Array.isArray(elements)
      ? Array.from(elements)
      : [elements];
    layoutManager.distributeAndPrependElements(gridElement, elementsArray);
  },

  /**
   * Triggers a re-calculation and re-rendering of all managed grids based on current media queries.
   */
  rescan: layoutManager.reinitiateResponsiveMonitoring,

  /**
   * Destroys one or more grid elements, returning their children to a flat structure.
   * @param {HTMLElement|NodeList|Array<HTMLElement>} elements - A single element or a collection of elements.
   */
  destroy: function(elements) {
    if (!elements) return;
    const elementsArray = elements instanceof NodeList || Array.isArray(elements)
      ? Array.from(elements)
      : [elements];

    elementsArray.forEach(layoutManager.destroyGrid);
  },

  /**
   * Returns a list of currently managed grid elements.
   * @returns {Array<HTMLElement>}
   */
  getManagedGrids: () => [...managedGrids]
};

// Initial setup: Scan for grids that might be pre-configured in the DOM
documentRef.addEventListener('DOMContentLoaded', () => {
    // Look for elements with data-columns attribute that are not yet initialized
    const preExistingGrids = documentRef.querySelectorAll("[data-columns]:not([data-status='initialized'])");
    if (preExistingGrids.length > 0) {
        publicApi.init(preExistingGrids);
    }
});


return publicApi;

}(this, document)); // Pass 'this' as globalRef, and 'document' as documentRef

return fluidLayoutEngine;
}));