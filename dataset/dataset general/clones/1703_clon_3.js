// DataGridUtility
// Version 3.0, Refactored and Modernized
// 15th October 2023
// A utility for making HTML tables sortable by clicking header cells.
// Based on an original concept by Stuart Langridge.
//
// Usage:
// 1. Include this script in your HTML document.
// 2. Add the class "sortable-data-grid" to any <table> element you wish to enable sorting for.
// 3. Click on table headers (<th>) to sort columns.
//
// Contributions and suggestions from various sources incorporated.
// Licensed under the MIT License: do what you want with it.

// Flag to detect ancient Internet Explorer versions, primarily for specific DOM behaviors.
let isLegacyBrowser = false; // Original detection /*@cc_on!@*/false; has been removed.

// Main utility object for table sorting functionalities.
const tableOrganizer = {
  // Regex pattern for parsing dates in various formats (e.g., DD/MM/YYYY, MM-DD-YY).
  dateParsingPattern: /^(\d{1,2})[\/\.-](\d{1,2})[\/\.-]((\d{2})?\d{2})$/,

  // Initializes the sorting utility once the DOM is ready.
  initialize: function() {
    // Prevent re-initialization if already completed.
    if (this._initializationComplete) {
      return;
    }
    this._initializationComplete = true; // Mark as initialized.

    // Clear any pending DOM readiness checks.
    if (this._domReadyCheckTimer) {
      clearInterval(this._domReadyCheckTimer);
    }

    // Basic DOM availability check.
    if (!document.createElement || !document.getElementsByTagName) {
      return;
    }

    // Iterate over all tables in the document and process those marked as sortable.
    tableOrganizer.utilityForEach(document.getElementsByTagName('table'), function(targetGrid) {
      if (targetGrid.className && targetGrid.className.indexOf('sortable-data-grid') !== -1) {
        tableOrganizer.prepareGridForSorting(targetGrid);
      }
    });
  },

  // Prepares a specific HTML table element to be sortable.
  prepareGridForSorting: function(targetGrid) {
    // Ensure the table has a <thead> element. Create one if missing,
    // placing the first row into it.
    if (targetGrid.getElementsByTagName('thead').length === 0) {
      const newHeadElement = document.createElement('thead');
      // If there are rows, move the first one to the new <thead>.
      if (targetGrid.rows.length > 0) {
        newHeadElement.appendChild(targetGrid.rows[0]);
      }
      targetGrid.insertBefore(newHeadElement, targetGrid.firstChild);
    }

    // Handle Safari's historical lack of direct table.tHead support.
    if (!targetGrid.tHead) {
      targetGrid.tHead = targetGrid.getElementsByTagName('thead')[0];
    }

    // We only support tables with a single header row for sorting.
    if (!targetGrid.tHead || targetGrid.tHead.rows.length !== 1) {
      console.warn("Table does not have a single header row or no tHead element. Skipping sorting setup.", targetGrid);
      return;
    }

    // Handle legacy 'sortbottom' rows by moving them into a <tfoot>.
    // This is for backward compatibility; modern tables should use <tfoot> directly.
    const footerRowsCollection = [];
    // Iterate backwards to safely remove elements during iteration.
    for (let i = targetGrid.rows.length - 1; i >= 0; i--) {
      if (targetGrid.rows[i].className && targetGrid.rows[i].className.indexOf('sort-bottom-row') !== -1) {
        footerRowsCollection.unshift(targetGrid.rows[i]); // Add to the beginning to maintain order.
      }
    }

    if (footerRowsCollection.length > 0) {
      let newFootElement = targetGrid.tFoot;
      if (!newFootElement) {
        newFootElement = document.createElement('tfoot');
        targetGrid.appendChild(newFootElement);
      }
      for (let i = 0; i < footerRowsCollection.length; i++) {
        newFootElement.appendChild(footerRowsCollection[i]);
      }
    }

    // Process each header cell to determine its sort type and attach event listeners.
    const headerCells = targetGrid.tHead.rows[0].cells;
    for (let i = 0; i < headerCells.length; i++) {
      const currentCell = headerCells[i];
      // Skip columns explicitly marked as non-sortable.
      if (currentCell.className && currentCell.className.indexOf('no-sort-column') !== -1) {
        continue;
      }

      let typeOverrideKey = null;
      // Check for a custom sort type defined in the class name (e.g., "sort-type-numeric").
      const matchResult = currentCell.className.match(/sort-type-([a-z0-9]+)/);
      if (matchResult && matchResult[1]) {
        typeOverrideKey = matchResult[1];
      }

      // Assign the appropriate sorting function.
      if (typeOverrideKey && typeof tableOrganizer["sort_" + typeOverrideKey] === 'function') {
        currentCell.sortingAlgorithm = tableOrganizer["sort_" + typeOverrideKey];
      } else {
        currentCell.sortingAlgorithm = tableOrganizer.deduceColumnType(targetGrid, i);
      }

      // Store necessary data on the header cell for event handling.
      currentCell.columnIndex = i;
      currentCell.targetTbody = targetGrid.tBodies[0];

      // Attach a click event handler to the header cell.
      addDomEventHandler(currentCell, "click", function(eventObject) {
        const thisCell = this; // Reference to the clicked header cell.
        const currentHeaderRow = thisCell.parentNode;

        // Check if the column is already sorted.
        const isCurrentlySorted = thisCell.className.indexOf('sorted-ascending') !== -1;
        const isCurrentlySortedReverse = thisCell.className.indexOf('sorted-descending') !== -1;

        if (isCurrentlySorted || isCurrentlySortedReverse) {
          // If already sorted, just reverse the current order for efficiency.
          tableOrganizer.flipTableOrder(thisCell.targetTbody);
          
          const existingIndicator = document.getElementById(isCurrentlySorted ? 'sort-indicator-asc' : 'sort-indicator-desc');
          if (existingIndicator && existingIndicator.parentNode === thisCell) {
             thisCell.removeChild(existingIndicator);
          }

          if (isCurrentlySorted) {
            thisCell.className = thisCell.className.replace('sorted-ascending', 'sorted-descending');
            const reverseIndicator = document.createElement('span');
            reverseIndicator.id = "sort-indicator-desc";
            reverseIndicator.innerHTML = '&nbsp;&#x25B4;'; // Unicode Up Arrow (reversed indicator)
            thisCell.appendChild(reverseIndicator);
          } else { // isCurrentlySortedReverse
            thisCell.className = thisCell.className.replace('sorted-descending', 'sorted-ascending');
            const forwardIndicator = document.createElement('span');
            forwardIndicator.id = "sort-indicator-asc";
            forwardIndicator.innerHTML = '&nbsp;&#x25BE;'; // Unicode Down Arrow (forward indicator)
            thisCell.appendChild(forwardIndicator);
          }
          return;
        }

        // Remove sorting classes and indicators from all other header cells.
        tableOrganizer.utilityForEach(currentHeaderRow.childNodes, function(siblingCell) {
          if (siblingCell.nodeType === 1) { // Ensure it's an element node.
            siblingCell.className = siblingCell.className.replace('sorted-descending', '');
            siblingCell.className = siblingCell.className.replace('sorted-ascending', '');
            // Remove any existing sort indicators.
            const ascInd = siblingCell.querySelector('#sort-indicator-asc');
            if (ascInd) siblingCell.removeChild(ascInd);
            const descInd = siblingCell.querySelector('#sort-indicator-desc');
            if (descInd) siblingCell.removeChild(descInd);
          }
        });

        // Mark the current column as sorted ascending and add the indicator.
        thisCell.className += ' sorted-ascending';
        const forwardIndicator = document.createElement('span');
        forwardIndicator.id = "sort-indicator-asc";
        forwardIndicator.innerHTML = '&nbsp;&#x25BE;'; // Unicode Down Arrow
        thisCell.appendChild(forwardIndicator);

        // Implement Schwartzian transform for efficient sorting:
        // 1. Decorate each row with its sort key.
        // 2. Sort the decorated array.
        // 3. Undecorate by re-appending rows in sorted order.
        const decoratedRows = [];
        const columnIndex = thisCell.columnIndex;
        const tableBodyRows = thisCell.targetTbody.rows;

        // Extract sort keys and pair them with their respective rows.
        for (let j = 0; j < tableBodyRows.length; j++) {
          const cellToExtract = tableBodyRows[j].cells[columnIndex];
          const sortKey = tableOrganizer.extractCellText(cellToExtract);
          decoratedRows.push([sortKey, tableBodyRows[j]]);
        }

        // Perform the sort using the determined algorithm.
        // For a stable sort (e.g., preserving original order for equal values),
        // use tableOrganizer.stableCocktailSort(decoratedRows, thisCell.sortingAlgorithm);
        // Otherwise, Array.prototype.sort is generally faster but not guaranteed stable.
        decoratedRows.sort(thisCell.sortingAlgorithm);

        // Re-append the rows to the tbody in their new sorted order.
        const targetTbody = thisCell.targetTbody;
        for (let j = 0; j < decoratedRows.length; j++) {
          targetTbody.appendChild(decoratedRows[j][1]);
        }
      });
    }
  },

  // Attempts to determine the data type of a column based on its content.
  // This helps in selecting the most appropriate sorting function.
  deduceColumnType: function(targetGrid, columnIndex) {
    let sortingFunction = tableOrganizer.sort_alpha; // Default to alphanumeric sort.
    const bodyRows = targetGrid.tBodies[0].rows;

    // Examine the content of the first few non-blank cells to guess the type.
    // Limit to a reasonable number of rows to avoid performance issues on large tables.
    const maxRowsToSample = Math.min(bodyRows.length, 50);

    for (let i = 0; i < maxRowsToSample; i++) {
      const cellContent = tableOrganizer.extractCellText(bodyRows[i].cells[columnIndex]);

      if (cellContent.trim() !== '') {
        // Check for numeric pattern (with optional currency, comma, percent).
        if (cellContent.match(/^-?[£$€¥]?[\d,.]+%?$/)) {
          return tableOrganizer.sort_numeric;
        }

        // Check for date patterns (DD/MM/YYYY or MM/DD/YYYY).
        const potentialDateMatch = cellContent.match(tableOrganizer.dateParsingPattern);
        if (potentialDateMatch) {
          const partOne = parseInt(potentialDateMatch[1], 10);
          const partTwo = parseInt(potentialDateMatch[2], 10);

          if (partOne > 12 && partTwo <= 12) {
            // First part is day (DD/MM).
            return tableOrganizer.dateDdMmComparer;
          } else if (partTwo > 12 && partOne <= 12) {
            // Second part is day (MM/DD).
            return tableOrganizer.dateMmDdComparer;
          } else if (partOne <= 12 && partTwo <= 12) {
            // Ambiguous (e.g., 01/02/2003 could be Jan 2 or Feb 1).
            // Default to DD/MM (European standard) but keep looking for clearer patterns.
            sortingFunction = tableOrganizer.dateDdMmComparer;
          }
        }
      }
    }
    return sortingFunction; // Return the best guess or default.
  },

  // Extracts the text content from a DOM node for sorting purposes.
  // This function is specialized for table sorting, handling custom keys and input values.
  extractCellText: function(domNode) {
    if (!domNode) {
      return ''; // Guard against null/undefined nodes.
    }

    // Check for a custom sorting key attribute.
    const customKeyValue = domNode.getAttribute("data-sort-key");
    if (customKeyValue !== null) {
      return customKeyValue;
    }

    // Handle input elements specifically to get their value.
    const inputElements = domNode.getElementsByTagName('input');
    if (inputElements.length > 0) {
      return inputElements[0].value.trim();
    }

    // Use textContent for modern browsers, fallback to innerText/text.
    // Recursively extract text from child nodes if no direct text property.
    let extractedContent = '';
    if (typeof domNode.textContent !== 'undefined') {
      extractedContent = domNode.textContent;
    } else if (typeof domNode.innerText !== 'undefined') {
      extractedContent = domNode.innerText;
    } else if (typeof domNode.text !== 'undefined') { // Older DOM level 0
      extractedContent = domNode.text;
    } else {
      // Fallback for complex nodes or very old browsers.
      for (let i = 0; i < domNode.childNodes.length; i++) {
        extractedContent += tableOrganizer.extractCellText(domNode.childNodes[i]);
      }
    }

    return extractedContent.trim();
  },

  // Reverses the order of rows within a given tbody element.
  flipTableOrder: function(targetTbody) {
    if (!targetTbody) return; // Guard clause.

    const reversedRowsArray = [];
    // Collect all rows in their current order.
    for (let i = 0; i < targetTbody.rows.length; i++) {
      reversedRowsArray.push(targetTbody.rows[i]);
    }
    // Append them back in reverse order.
    for (let i = reversedRowsArray.length - 1; i >= 0; i--) {
      targetTbody.appendChild(reversedRowsArray[i]);
    }
  },

  // --- Sorting Comparison Functions ---
  // Each function takes two parameters (a, b), which are arrays: [sortKey, rowElement].
  // It compares a[0] and b[0] and returns:
  //   -1 if a[0] should come before b[0]
  //    0 if a[0] and b[0] are equivalent
  //    1 if a[0] should come after b[0]

  // Compares two values numerically.
  sort_numeric: function(a, b) {
    // Remove non-numeric characters except for decimal point and sign.
    const valA = parseFloat(String(a[0]).replace(/[^0-9.-]/g, ''));
    const valB = parseFloat(String(b[0]).replace(/[^0-9.-]/g, ''));

    // Treat NaN as 0 for comparison purposes.
    const numA = isNaN(valA) ? 0 : valA;
    const numB = isNaN(valB) ? 0 : valB;

    return numA - numB;
  },

  // Compares two values alphabetically (case-sensitive by default).
  sort_alpha: function(a, b) {
    const strA = String(a[0]);
    const strB = String(b[0]);
    if (strA === strB) return 0;
    return (strA < strB) ? -1 : 1;
  },

  // Compares two dates in DD/MM/YYYY (or DD/MM/YY) format.
  dateDdMmComparer: function(a, b) {
    const matchA = String(a[0]).match(tableOrganizer.dateParsingPattern);
    const matchB = String(b[0]).match(tableOrganizer.dateParsingPattern);

    if (!matchA || !matchB) {
      // Fallback to alpha comparison if date parsing fails.
      return tableOrganizer.sort_alpha(a, b);
    }

    // Reformat to YYYYMMDD for easy comparison.
    const yearA = matchA[3];
    let monthA = matchA[2];
    let dayA = matchA[1];
    if (monthA.length === 1) monthA = '0' + monthA;
    if (dayA.length === 1) dayA = '0' + dayA;
    const formattedDateA = yearA + monthA + dayA;

    const yearB = matchB[3];
    let monthB = matchB[2];
    let dayB = matchB[1];
    if (monthB.length === 1) monthB = '0' + monthB;
    if (dayB.length === 1) dayB = '0' + dayB;
    const formattedDateB = yearB + monthB + dayB;

    if (formattedDateA === formattedDateB) return 0;
    return (formattedDateA < formattedDateB) ? -1 : 1;
  },

  // Compares two dates in MM/DD/YYYY (or MM/DD/YY) format.
  dateMmDdComparer: function(a, b) {
    const matchA = String(a[0]).match(tableOrganizer.dateParsingPattern);
    const matchB = String(b[0]).match(tableOrganizer.dateParsingPattern);

    if (!matchA || !matchB) {
      // Fallback to alpha comparison if date parsing fails.
      return tableOrganizer.sort_alpha(a, b);
    }

    // Reformat to YYYYMMDD for easy comparison.
    const yearA = matchA[3];
    let dayA = matchA[2];
    let monthA = matchA[1];
    if (monthA.length === 1) monthA = '0' + monthA;
    if (dayA.length === 1) dayA = '0' + dayA;
    const formattedDateA = yearA + monthA + dayA;

    const yearB = matchB[3];
    let dayB = matchB[2];
    let monthB = matchB[1];
    if (monthB.length === 1) monthB = '0' + monthB;
    if (dayB.length === 1) dayB = '0' + dayB;
    const formattedDateB = yearB + monthB + dayB;

    if (formattedDateA === formattedDateB) return 0;
    return (formattedDateA < formattedDateB) ? -1 : 1;
  },

  // A stable sort implementation (Cocktail Shaker Sort).
  // Use this if preserving the original order of equal elements is critical.
  stableCocktailSort: function(itemsArray, comparisonCallback) {
    let lowIndex = 0;
    let highIndex = itemsArray.length - 1;
    let swapped = true;

    while (swapped) {
      swapped = false;
      // Forward pass
      for (let i = lowIndex; i < highIndex; ++i) {
        if (comparisonCallback(itemsArray[i], itemsArray[i + 1]) > 0) {
          const temp = itemsArray[i];
          itemsArray[i] = itemsArray[i + 1];
          itemsArray[i + 1] = temp;
          swapped = true;
        }
      }
      if (!swapped) break; // If no swaps, array is sorted.

      swapped = false;
      highIndex--; // Shrink the high end of the unsorted portion.

      // Backward pass
      for (let i = highIndex; i > lowIndex; --i) {
        if (comparisonCallback(itemsArray[i], itemsArray[i - 1]) < 0) {
          const temp = itemsArray[i];
          itemsArray[i] = itemsArray[i - 1];
          itemsArray[i - 1] = temp;
          swapped = true;
        }
      }
      lowIndex++; // Shrink the low end of the unsorted portion.
    }
  },

  // Internal flag to track initialization status.
  _initializationComplete: false,
  // Internal timer for DOM ready checks.
  _domReadyCheckTimer: null
};


/* ******************************************************************
   Core DOM Event and Iteration Utilities (Cross-Browser Compatibility)
   ****************************************************************** */

// Dean Edwards / Matthias Miller / John Resig / Adapted for `tableOrganizer`

// Attach `initialize` to DOMContentLoaded for modern browsers.
if (document.addEventListener) {
  document.addEventListener("DOMContentLoaded", tableOrganizer.initialize, false);
}

// Fallback for older browsers (Safari, etc.) that may not support DOMContentLoaded or have quirks.
// This uses a polling interval to check document.readyState.
if (/WebKit/i.test(navigator.userAgent)) { // Simple sniff for WebKit-based browsers (Safari).
  tableOrganizer._domReadyCheckTimer = setInterval(function() {
    if (/loaded|complete/.test(document.readyState)) {
      tableOrganizer.initialize();
    }
  }, 10);
}

// Ultimate fallback for all other browsers, using window.onload.
// This waits for all assets (images, stylesheets) to load, which can be slower.
window.onload = tableOrganizer.initialize;

// --- Cross-browser Event Handling Utilities ---
// Based on Dean Edwards' work, adapted for `tableOrganizer`.

// Adds an event listener to a DOM element.
function addDomEventHandler(targetElement, eventType, handlerFunction) {
  if (targetElement.addEventListener) {
    targetElement.addEventListener(eventType, handlerFunction, false);
  } else if (targetElement.attachEvent) { // IE < 9
    // Assign a unique ID to the handler for tracking.
    if (!handlerFunction._handlerId) handlerFunction._handlerId = addDomEventHandler.nextHandlerId++;
    // Create a storage for event handlers on the element.
    if (!targetElement._eventHandlers) targetElement._eventHandlers = {};
    if (!targetElement._eventHandlers[eventType]) {
      targetElement._eventHandlers[eventType] = {};
      // Store the existing 'on' handler if it exists.
      if (targetElement["on" + eventType]) {
        targetElement._eventHandlers[eventType][0] = targetElement["on" + eventType];
      }
    }
    // Store the new handler.
    targetElement._eventHandlers[eventType][handlerFunction._handlerId] = handlerFunction;
    // Assign a global dispatcher.
    targetElement["on" + eventType] = dispatchEvents;
  }
}
// Counter for unique handler IDs.
addDomEventHandler.nextHandlerId = 1;

// Removes an event listener.
function removeDomEventHandler(targetElement, eventType, handlerFunction) {
  if (targetElement.removeEventListener) {
    targetElement.removeEventListener(eventType, handlerFunction, false);
  } else if (targetElement.detachEvent && targetElement._eventHandlers && targetElement._eventHandlers[eventType]) {
    // Delete the specific handler.
    delete targetElement._eventHandlers[eventType][handlerFunction._handlerId];
  }
}

// Dispatches events for older IE versions.
function dispatchEvents(eventObject) {
  let returnValue = true;
  // Normalize event object for cross-browser consistency.
  eventObject = eventObject || normalizeEvent(((this.ownerDocument || this.document || this).parentWindow || window).event);
  
  // Retrieve handlers for the current event type.
  const handlers = this._eventHandlers[eventObject.type];
  
  // Execute each stored handler.
  for (const id in handlers) {
    if (handlers.hasOwnProperty(id)) { // Ensure it's an own property, not inherited.
      this._currentHandler = handlers[id];
      if (this._currentHandler(eventObject) === false) {
        returnValue = false;
      }
    }
  }
  return returnValue;
}

// Normalizes the event object for cross-browser compatibility (especially for IE).
function normalizeEvent(eventObject) {
  // Add W3C standard methods if missing.
  if (!eventObject.preventDefault) {
    eventObject.preventDefault = normalizeEvent.preventStandardDefault;
  }
  if (!eventObject.stopPropagation) {
    eventObject.stopPropagation = normalizeEvent.stopStandardPropagation;
  }
  return eventObject;
}
// Implementations for W3C methods.
normalizeEvent.preventStandardDefault = function() {
  this.returnValue = false;
};
normalizeEvent.stopStandardPropagation = function() {
  this.cancelBubble = true;
};

// --- Generic Iteration Utility ---
// A custom forEach implementation similar to Dean Edwards' original, but simplified.
// This is used internally by `tableOrganizer`.

tableOrganizer.utilityForEach = function(collection, callback, context) {
  if (!collection) {
    return;
  }
  context = context || null; // Default context to null if not provided.

  // Handle NodeList, HTMLCollection, or Array-like objects.
  if (typeof collection.length === 'number' && collection.item) { // Check for NodeList/HTMLCollection
    for (let i = 0; i < collection.length; i++) {
      callback.call(context, collection[i], i, collection);
    }
  } else if (Array.isArray(collection)) {
    for (let i = 0; i < collection.length; i++) {
      callback.call(context, collection[i], i, collection);
    }
  } else {
    // Fallback for generic object iteration (less common for DOM elements here).
    for (const key in collection) {
      if (Object.prototype.hasOwnProperty.call(collection, key)) {
        callback.call(context, collection[key], key, collection);
      }
    }
  }
};