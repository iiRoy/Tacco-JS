// This utility script provides interactive sorting capabilities for HTML tables.
// Current version: 2.0
// Release date: April 7th, 2007
// Author: Stuart Langridge, available at http://www.kryogenix.org/code/browser/sorttable/
//
// How to use this library:
// 1. Download this JavaScript file.
// 2. Include <script src="sorttable.js"></script> in your HTML document.
// 3. Add the CSS class "sortable" to any table element you wish to enable sorting for.
// 4. Clicking on the header cells of these tables will sort the respective columns.
//
// Special thanks to numerous contributors for their valuable suggestions and code enhancements.
// This software is distributed under the X11 License: http://www.kryogenix.org/code/browser/licence.html
// In essence, this license grants you complete freedom to use, modify, and redistribute the code.

var isLegacyBrowser = /*@cc_on!@*/false;

var gridOrderer = {
    // Primary initialization method for the table sorting system.
    initialize: function() {
        // Prevent re-execution if the function has already completed its setup.
        if (arguments.callee.hasRunBefore) return;
        // Mark this function as executed to ensure it runs only once.
        arguments.callee.hasRunBefore = true;
        // Clear any pending timer that might trigger this initialization again.
        if (initializationTimer) clearInterval(initializationTimer);

        // Verify that essential DOM manipulation methods are available.
        if (!document.createElement || !document.getElementsByTagName) return;

        // Define a regular expression to match common date formats (e.g., DD/MM/YY, MM-DD-YYYY).
        gridOrderer.datePatternRegex = /^(\d\d?)[\/\.-](\d\d?)[\/\.-]((\d\d)?\d\d)$/;

        // Iterate through all table elements found in the document.
        applyToEach(document.getElementsByTagName('table'), function(currentTable) {
            // If a table has the 'sortable' class, apply sorting functionality.
            if (currentTable.className.search(/\bsortable\b/) !== -1) {
                gridOrderer.transformToOrderable(currentTable);
            }
        });
    },

    // Transforms a standard HTML table into a dynamic, sortable grid.
    transformToOrderable: function(targetTable) {
        // If the table lacks a <thead> element, create one and move the first row into it.
        if (targetTable.getElementsByTagName('thead').length === 0) {
            var newHeader = document.createElement('thead');
            newHeader.appendChild(targetTable.rows[0]);
            targetTable.insertBefore(newHeader, targetTable.firstChild);
        }
        // Address Safari's specific behavior regarding table.tHead property.
        if (targetTable.tHead === null) targetTable.tHead = targetTable.getElementsByTagName('thead')[0];

        // Abort if the table header contains more than one row, as this script does not support it.
        if (targetTable.tHead.rows.length !== 1) return;

        // Identify and relocate rows with the "sortbottom" class into a <tfoot> for compatibility.
        // Create a <tfoot> if one does not already exist.
        var footerRowsCollection = [];
        for (var rowIdx = 0; rowIdx < targetTable.rows.length; rowIdx++) {
            if (targetTable.rows[rowIdx].className.search(/\bsortbottom\b/) !== -1) {
                footerRowsCollection[footerRowsCollection.length] = targetTable.rows[rowIdx];
            }
        }
        if (footerRowsCollection.length > 0) {
            if (targetTable.tFoot === null) {
                var tableFooter = document.createElement('tfoot');
                targetTable.appendChild(tableFooter);
            }
            for (var fRowIdx = 0; fRowIdx < footerRowsCollection.length; fRowIdx++) {
                targetTable.tFoot.appendChild(footerRowsCollection[fRowIdx]);
            }
            footerRowsCollection = null; // Release memory.
        }

        // Iterate through each header cell to configure sorting behavior.
        var headerCells = targetTable.tHead.rows[0].cells;
        for (var cellIdx = 0; cellIdx < headerCells.length; cellIdx++) {
            // Skip columns explicitly marked as non-sortable.
            if (!headerCells[cellIdx].className.match(/\bsorttable_nosort\b/)) {
                var patternMatch = headerCells[cellIdx].className.match(/\bsorttable_([a-z0-9]+)\b/);
                var customSortTypeName;
                if (patternMatch) {
                    customSortTypeName = patternMatch[1];
                }
                // Assign a predefined sort function if a custom type is specified and recognized.
                if (patternMatch && typeof gridOrderer["sort_" + customSortTypeName] === 'function') {
                    headerCells[cellIdx].sorttable_sortfunction = gridOrderer["sort_" + customSortTypeName];
                } else {
                    // Otherwise, attempt to automatically determine the column's data type for sorting.
                    headerCells[cellIdx].sorttable_sortfunction = gridOrderer.inferDataType(targetTable, cellIdx);
                }
                // Store column metadata and attach a click event listener for sorting.
                headerCells[cellIdx].sorttable_columnindex = cellIdx;
                headerCells[cellIdx].sorttable_tbody = targetTable.tBodies[0];
                addDOMEvent(headerCells[cellIdx], "click", function(evt) {

                    // If the column is already sorted in ascending order, reverse the current order.
                    if (this.className.search(/\bsorttable_sorted\b/) !== -1) {
                        gridOrderer.flipOrder(this.sorttable_tbody);
                        this.className = this.className.replace('sorttable_sorted', 'sorttable_sorted_reverse');
                        this.removeChild(document.getElementById('sorttable_sortfwdind'));
                        var reverseIndicator = document.createElement('span');
                        reverseIndicator.id = "sorttable_sortrevind";
                        reverseIndicator.innerHTML = isLegacyBrowser ? '&nbsp<font face="webdings">5</font>' : '&nbsp;&#x25B4;';
                        this.appendChild(reverseIndicator);
                        return;
                    }
                    // If the column is sorted in descending order, revert to ascending order.
                    if (this.className.search(/\bsorttable_sorted_reverse\b/) !== -1) {
                        gridOrderer.flipOrder(this.sorttable_tbody);
                        this.className = this.className.replace('sorttable_sorted_reverse', 'sorttable_sorted');
                        this.removeChild(document.getElementById('sorttable_sortrevind'));
                        var forwardIndicator = document.createElement('span');
                        forwardIndicator.id = "sorttable_sortfwdind";
                        forwardIndicator.innerHTML = isLegacyBrowser ? '&nbsp<font face="webdings">6</font>' : '&nbsp;&#x25BE;';
                        this.appendChild(forwardIndicator);
                        return;
                    }

                    // Remove any existing sort indicators from other header cells.
                    var currentHeaderRow = this.parentNode;
                    applyToEach(currentHeaderRow.childNodes, function(cellElement) {
                        if (cellElement.nodeType === 1) { // Only process element nodes.
                            cellElement.className = cellElement.className.replace('sorttable_sorted_reverse', '');
                            cellElement.className = cellElement.className.replace('sorttable_sorted', '');
                        }
                    });
                    var existingFwdIndicator = document.getElementById('sorttable_sortfwdind');
                    if (existingFwdIndicator) {
                        existingFwdIndicator.parentNode.removeChild(existingFwdIndicator);
                    }
                    var existingRevIndicator = document.getElementById('sorttable_sortrevind');
                    if (existingRevIndicator) {
                        existingRevIndicator.parentNode.removeChild(existingRevIndicator);
                    }

                    // Add the ascending sort indicator to the currently clicked column.
                    this.className += ' sorttable_sorted';
                    var newFwdIndicator = document.createElement('span');
                    newFwdIndicator.id = "sorttable_sortfwdind";
                    newFwdIndicator.innerHTML = isLegacyBrowser ? '&nbsp<font face="webdings">6</font>' : '&nbsp;&#x25BE;';
                    this.appendChild(newFwdIndicator);

                    // Implement a Schwartzian transform-like sorting approach for efficiency:
                    // 1. Decorate each row with its sort key.
                    // 2. Sort this decorated array.
                    // 3. Re-append the rows to the DOM in the new order.
                    // This method significantly reduces DOM operations and 'getInnerText' calls.
                    var dataRowArray = [];
                    var columnIndex = this.sorttable_columnindex;
                    var tableBodyRows = this.sorttable_tbody.rows;
                    for (var rowNum = 0; rowNum < tableBodyRows.length; rowNum++) {
                        dataRowArray[dataRowArray.length] = [gridOrderer.extractCellContent(tableBodyRows[rowNum].cells[columnIndex]), tableBodyRows[rowNum]];
                    }
                    /* To enable a stable sort, uncomment the following line and comment out the next one. */
                    // gridOrderer.bidirectionalBubbleSort(dataRowArray, this.sorttable_sortfunction);
                    /* Otherwise, the default (potentially unstable) JavaScript sort is used. */
                    dataRowArray.sort(this.sorttable_sortfunction);

                    // Re-insert the now-sorted rows into the table body.
                    var targetBody = this.sorttable_tbody;
                    for (var sortedRowNum = 0; sortedRowNum < dataRowArray.length; sortedRowNum++) {
                        targetBody.appendChild(dataRowArray[sortedRowNum][1]);
                    }

                    dataRowArray = null; // Clear the temporary array to free memory.
                });
            }
        }
    },

    // Determines the appropriate sorting function for a column by inspecting its content.
    inferDataType: function(parentTable, targetColumn) {
        var sortingFunction = gridOrderer.orderAlphabetically; // Default sort is alphabetical.
        // Scan the first non-empty cell in the column to deduce its data type.
        for (var rowIter = 0; rowIter < parentTable.tBodies[0].rows.length; rowIter++) {
            var cellTextContent = gridOrderer.extractCellContent(parentTable.tBodies[0].rows[rowIter].cells[targetColumn]);
            if (cellTextContent !== '') {
                // Check if the content appears to be a number (including currency, percentages).
                if (cellTextContent.match(/^-?[£$¤]?[\d,.]+%?$/)) {
                    return gridOrderer.orderNumbers;
                }
                // Check if the content matches a known date pattern.
                var potentialDateMatch = cellTextContent.match(gridOrderer.datePatternRegex);
                if (potentialDateMatch) {
                    var firstPart = parseInt(potentialDateMatch[1]);
                    var secondPart = parseInt(potentialDateMatch[2]);
                    if (firstPart > 12) {
                        // If the first component is greater than 12, assume DD/MM format.
                        return gridOrderer.orderDatesDMY;
                    } else if (secondPart > 12) {
                        // If the second component is greater than 12, assume MM/DD format.
                        return gridOrderer.orderDatesMDY;
                    } else {
                        // For ambiguous dates (e.g., 01/02), tentatively assume DD/MM and continue checking.
                        sortingFunction = gridOrderer.orderDatesDMY;
                    }
                }
            }
        }
        return sortingFunction; // Return the best-guess sorting function.
    },

    // Retrieves the sortable text content from a given DOM node.
    // This function handles custom keys, input field values, and recursive text extraction.
    extractCellContent: function(nodeElement) {
        // Check if the node contains any input elements.
        var containsInputElements = (typeof nodeElement.getElementsByTagName === 'function') &&
            nodeElement.getElementsByTagName('input').length;

        // If a custom sort key is defined, use that value directly.
        if (nodeElement.getAttribute("sorttable_customkey") !== null) {
            return nodeElement.getAttribute("sorttable_customkey");
        }
        // Prefer W3C standard `textContent` if available and no inputs are present.
        else if (typeof nodeElement.textContent !== 'undefined' && !containsInputElements) {
            return nodeElement.textContent.replace(/^\s+|\s+$/g, '');
        }
        // Fallback to IE-specific `innerText` if available and no inputs.
        else if (typeof nodeElement.innerText !== 'undefined' && !containsInputElements) {
            return nodeElement.innerText.replace(/^\s+|\s+$/g, '');
        }
        // Further fallback for older browsers using `text`.
        else if (typeof nodeElement.text !== 'undefined' && !containsInputElements) {
            return nodeElement.text.replace(/^\s+|\s+$/g, '');
        }
        // For other node types, or if inputs are present, recursively extract text.
        else {
            switch (nodeElement.nodeType) {
                case 3: // Text node.
                    if (nodeElement.nodeName.toLowerCase() === 'input') {
                        return nodeElement.value.replace(/^\s+|\s+$/g, '');
                    }
                case 4: // CDATA section node.
                    return nodeElement.nodeValue.replace(/^\s+|\s+$/g, '');
                    break;
                case 1: // Element node.
                case 11: // Document fragment node.
                    var combinedText = '';
                    for (var childIdx = 0; childIdx < nodeElement.childNodes.length; childIdx++) {
                        combinedText += gridOrderer.extractCellContent(nodeElement.childNodes[childIdx]);
                    }
                    return combinedText.replace(/^\s+|\s+$/g, '');
                    break;
                default: // Default case for other node types.
                    return '';
            }
        }
    },

    // Reverses the display order of rows within a specified table body.
    flipOrder: function(tableBodyElement) {
        var reorderedRows = [];
        // Collect all existing rows.
        for (var rIdx = 0; rIdx < tableBodyElement.rows.length; rIdx++) {
            reorderedRows[reorderedRows.length] = tableBodyElement.rows[rIdx];
        }
        // Append them back to the table body in reverse order.
        for (var rIdxReverse = reorderedRows.length - 1; rIdxReverse >= 0; rIdxReverse--) {
            tableBodyElement.appendChild(reorderedRows[rIdxReverse]);
        }
        reorderedRows = null; // Clear the temporary array.
    },

    // --- Column Comparison Functions ---
    // Each function accepts two parameters, `val1` and `val2`, which are arrays.
    // The actual sort key is expected at index 0 of these arrays.

    // Compares two values numerically.
    orderNumbers: function(val1, val2) {
        var numericVal1 = parseFloat(val1[0].replace(/[^0-9.-]/g, ''));
        if (isNaN(numericVal1)) numericVal1 = 0; // Treat non-numeric as 0.
        var numericVal2 = parseFloat(val2[0].replace(/[^0-9.-]/g, ''));
        if (isNaN(numericVal2)) numericVal2 = 0; // Treat non-numeric as 0.
        return numericVal1 - numericVal2;
    },
    // Compares two values alphabetically.
    orderAlphabetically: function(val1, val2) {
        if (val1[0] === val2[0]) return 0;
        if (val1[0] < val2[0]) return -1;
        return 1;
    },
    // Compares dates formatted as DD/MM/YYYY.
    orderDatesDMY: function(val1, val2) {
        var match1 = val1[0].match(gridOrderer.datePatternRegex);
        var yearPart1 = match1[3];
        var monthPart1 = match1[2];
        var dayPart1 = match1[1];
        if (monthPart1.length === 1) monthPart1 = '0' + monthPart1;
        if (dayPart1.length === 1) dayPart1 = '0' + dayPart1;
        var dateString1 = yearPart1 + monthPart1 + dayPart1; // Convert to YYYYMMDD for comparison.

        var match2 = val2[0].match(gridOrderer.datePatternRegex);
        var yearPart2 = match2[3];
        var monthPart2 = match2[2];
        var dayPart2 = match2[1];
        if (monthPart2.length === 1) monthPart2 = '0' + monthPart2;
        if (dayPart2.length === 1) dayPart2 = '0' + dayPart2;
        var dateString2 = yearPart2 + monthPart2 + dayPart2; // Convert to YYYYMMDD for comparison.

        if (dateString1 === dateString2) return 0;
        if (dateString1 < dateString2) return -1;
        return 1;
    },
    // Compares dates formatted as MM/DD/YYYY.
    orderDatesMDY: function(val1, val2) {
        var match1 = val1[0].match(gridOrderer.datePatternRegex);
        var yearPart1 = match1[3];
        var dayPart1 = match1[2];
        var monthPart1 = match1[1];
        if (monthPart1.length === 1) monthPart1 = '0' + monthPart1;
        if (dayPart1.length === 1) dayPart1 = '0' + dayPart1;
        var dateString1 = yearPart1 + monthPart1 + dayPart1; // Convert to YYYYMMDD for comparison.

        var match2 = val2[0].match(gridOrderer.datePatternRegex);
        var yearPart2 = match2[3];
        var dayPart2 = match2[2];
        var monthPart2 = match2[1];
        if (monthPart2.length === 1) monthPart2 = '0' + monthPart2;
        if (dayPart2.length === 1) dayPart2 = '0' + dayPart2;
        var dateString2 = yearPart2 + monthPart2 + dayPart2; // Convert to YYYYMMDD for comparison.

        if (dateString1 === dateString2) return 0;
        if (dateString1 < dateString2) return -1;
        return 1;
    },

    // Implements the Cocktail Shaker Sort algorithm (a stable sorting method).
    // For more details, see: http://en.wikipedia.org/wiki/Cocktail_sort
    // This implementation was kindly provided by Joseph Nahmias.
    bidirectionalBubbleSort: function(itemsList, comparisonCallback) {
        var bottomIndex = 0;
        var topIndex = itemsList.length - 1;
        var didSwap = true;

        while (didSwap) {
            didSwap = false;
            // Traverse from left to right, pushing largest elements to the right.
            for (var currentIdx = bottomIndex; currentIdx < topIndex; ++currentIdx) {
                if (comparisonCallback(itemsList[currentIdx], itemsList[currentIdx + 1]) > 0) {
                    var tempItem = itemsList[currentIdx];
                    itemsList[currentIdx] = itemsList[currentIdx + 1];
                    itemsList[currentIdx + 1] = tempItem;
                    didSwap = true;
                }
            }
            topIndex--; // Shrink the right boundary.

            if (!didSwap) break; // If no swaps occurred, the list is sorted.

            didSwap = false;
            // Traverse from right to left, pushing smallest elements to the left.
            for (var currentIdxReverse = topIndex; currentIdxReverse > bottomIndex; --currentIdxReverse) {
                if (comparisonCallback(itemsList[currentIdxReverse], itemsList[currentIdxReverse - 1]) < 0) {
                    var tempItemReverse = itemsList[currentIdxReverse];
                    itemsList[currentIdxReverse] = itemsList[currentIdxReverse - 1];
                    itemsList[currentIdxReverse - 1] = tempItemReverse;
                    didSwap = true;
                }
            }
            bottomIndex++; // Expand the left boundary.
        }
    }
};

// ******************************************************************
// Supporting Utility Functions: Consolidated to reduce external dependencies.
// ******************************************************************

// Event handling implementations based on work by Dean Edwards, Matthias Miller, and John Resig.

// For modern browsers supporting W3C DOM events (e.g., Mozilla, Opera 9+).
if (document.addEventListener) {
    document.addEventListener("DOMContentLoaded", gridOrderer.initialize, false);
}

// For Internet Explorer, utilizing conditional compilation for deferred loading.
/*@cc_on @*/
/*@if (@_win32)
    document.write("<script id=__ie_loader defer src=javascript:void(0)><\/script>");
    var ieScriptElement = document.getElementById("__ie_loader");
    ieScriptElement.onreadystatechange = function() {
        if (this.readyState == "complete") {
            gridOrderer.initialize(); // Call the main setup function upon document readiness.
        }
    };
/*@end @*/

// For WebKit-based browsers (e.g., Safari, older Chrome), employing a polling mechanism.
if (/WebKit/i.test(navigator.userAgent)) { // User agent string detection.
    var initializationTimer = setInterval(function() {
        if (/loaded|complete/.test(document.readyState)) {
            gridOrderer.initialize(); // Trigger setup once the document is fully loaded.
        }
    }, 10);
}

// Fallback event handler for other browsers, using the traditional window.onload.
window.onload = gridOrderer.initialize;

// Event attachment function, originally by Dean Edwards, 2005.
// With valuable contributions from Tino Zijdel, Matthias Miller, and Diego Perini.
// Reference: http://dean.edwards.name/weblog/2005/10/add-event/

function addDOMEvent(targetElement, eventType, eventHandler) {
    if (targetElement.addEventListener) {
        targetElement.addEventListener(eventType, eventHandler, false);
    } else {
        // Assign a unique identifier to each event handler for internal tracking.
        if (!eventHandler.uniqueId) eventHandler.uniqueId = addDOMEvent.idCounter++;
        // Create an internal object to store event listeners for the target element.
        if (!targetElement.eventListeners) targetElement.eventListeners = {};
        // Create a specific collection for handlers of this event type.
        var handlerCollection = targetElement.eventListeners[eventType];
        if (!handlerCollection) {
            handlerCollection = targetElement.eventListeners[eventType] = {};
            // Preserve any pre-existing inline event handler.
            if (targetElement["on" + eventType]) {
                handlerCollection[0] = targetElement["on" + eventType];
            }
        }
        // Store the new event handler in the collection.
        handlerCollection[eventHandler.uniqueId] = eventHandler;
        // Assign a single, global dispatcher to handle all events of this type for the element.
        targetElement["on" + eventType] = dispatchEvent;
    }
}
// A static counter used to generate unique IDs for event handlers.
addDOMEvent.idCounter = 1;

// Function to remove an event listener from a DOM element.
function removeDOMEvent(targetElement, eventType, eventHandler) {
    if (targetElement.removeEventListener) {
        targetElement.removeEventListener(eventType, eventHandler, false);
    } else {
        // If using the custom event model, delete the specific handler from its collection.
        if (targetElement.eventListeners && targetElement.eventListeners[eventType]) {
            delete targetElement.eventListeners[eventType][eventHandler.uniqueId];
        }
    }
}

// Central event dispatching function for older IE versions.
function dispatchEvent(eventObject) {
    var operationSuccess = true;
    // Normalize the event object to provide W3C-like properties for IE.
    eventObject = eventObject || normalizeEvent(((this.ownerDocument || this.document || this).parentWindow || window).event);
    // Retrieve all registered handlers for the current event type.
    var currentHandlers = this.eventListeners[eventObject.type];
    // Execute each handler in the collection.
    for (var handlerKey in currentHandlers) {
        this.currentEventHandler = currentHandlers[handlerKey];
        if (this.currentEventHandler(eventObject) === false) {
            operationSuccess = false; // If any handler returns false, indicate cancellation.
        }
    }
    return operationSuccess;
}

// Function to normalize event objects across different browser implementations.
function normalizeEvent(eventObject) {
    // Attach standard W3C methods (`preventDefault`, `stopPropagation`) if they are missing.
    eventObject.preventDefault = normalizeEvent.preventStandardDefault;
    eventObject.stopPropagation = normalizeEvent.haltPropagation;
    return eventObject;
}
normalizeEvent.preventStandardDefault = function() {
    this.returnValue = false;
};
normalizeEvent.haltPropagation = function() {
    this.cancelBubble = true;
};

// Dean Edwards' forEach implementation: http://dean.edwards.name/base/forEach.js
/*
	forEach utility, version 1.0
	Copyright 2006, Dean Edwards
	License: http://www.opensource.org/licenses/mit-license.php
*/

// Provides iteration for array-like objects.
if (!Array.forEach) { // Check if native Array.prototype.forEach exists.
    Array.forEach = function(inputArray, callbackBlock, executionContext) {
        for (var i = 0; i < inputArray.length; i++) {
            callbackBlock.call(executionContext, inputArray[i], i, inputArray);
        }
    };
}

// Provides generic property enumeration for objects.
Function.prototype.forEach = function(inputObject, callbackBlock, executionContext) {
    for (var propertyKey in inputObject) {
        if (typeof this.prototype[propertyKey] === "undefined") { // Exclude prototype properties.
            callbackBlock.call(executionContext, inputObject[propertyKey], propertyKey, inputObject);
        }
    }
};

// Provides character-by-character enumeration for strings.
String.forEach = function(inputString, callbackBlock, executionContext) {
    Array.forEach(inputString.split(""), function(character, charIndex) {
        callbackBlock.call(executionContext, character, charIndex, inputString);
    });
};

// A global dispatcher function to apply a callback to each element/property of various data types.
var applyToEach = function(targetObject, callbackBlock, executionContext) {
    if (targetObject) {
        var resolver = Object; // Default to object enumeration.
        if (targetObject instanceof Function) {
            // If the target is a function, use Function.forEach.
            resolver = Function;
        } else if (targetObject.forEach instanceof Function) {
            // If the object has its own custom forEach method, use that.
            targetObject.forEach(callbackBlock, executionContext);
            return;
        } else if (typeof targetObject === "string") {
            // If the target is a string, use String.forEach.
            resolver = String;
        } else if (typeof targetObject.length === "number") {
            // If the target is an array-like object, use Array.forEach.
            resolver = Array;
        }
        resolver.forEach(targetObject, callbackBlock, executionContext);
    }
};