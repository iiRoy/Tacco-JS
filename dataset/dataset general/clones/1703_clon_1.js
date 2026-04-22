// This is a Type I clone of the original SortTable script.
// All functionality remains precisely the same, but comments and whitespace
// have been extensively altered to create a visually distinct version.
// Original author: Stuart Langridge, http://www.kryogenix.org/code/browser/sorttable/
// Licensed under X11: http://www.kryogenix.org/code/browser/licence.html
//
// This variant demonstrates how whitespace and comments can be manipulated
// without changing the underlying logic or structure of the code.

var stIsIE = /*@cc_on!@*/false; // A flag to detect Internet Explorer browser.

sorttable = {
    // Initialize the sortable tables on page load.
    init: function ( ) {
        // Prevent re-execution if already called.
        if (arguments.callee.done) {
            return;
        }

        // Mark this function as executed.
        arguments.callee.done = true;

        // Clear any pending timer from Safari/WebKit initialization.
        if (_timer) {
            clearInterval(_timer);
        }

        // Ensure basic DOM manipulation functions are available.
        if (!document.createElement || !document.getElementsByTagName) {
            return;
        }

        // Regular expression for matching various date formats.
        sorttable.DATE_RE = /^(\d\d?)[\/\.-](\d\d?)[\/\.-]((\d\d)?\d\d)$/;

        // Iterate over all tables in the document.
        forEach(document.getElementsByTagName('table'), function (table) {
            // Check if the table has the 'sortable' class.
            if (table.className.search(/\bsortable\b/) !== -1) {
                // Make the table sortable if the class is found.
                sorttable.makeSortable(table);
            }
        });
    }, // End of init method.


    // Processes a given table to make its columns sortable.
    makeSortable: function (table) {
        // If the table lacks a <thead>, create one and move the first row into it.
        if (table.getElementsByTagName('thead').length === 0) {
            var the = document.createElement('thead'); // Create a new thead element.
            the.appendChild(table.rows[0]); // Move the first row.
            table.insertBefore(the, table.firstChild); // Insert thead before the first child.
        }

        // For Safari compatibility, manually assign tHead if not directly accessible.
        if (table.tHead === null) {
            table.tHead = table.getElementsByTagName('thead')[0];
        }

        // If there's more than one header row, we can't handle it.
        if (table.tHead.rows.length !== 1) {
            return;
        }

        // Handle rows with 'sortbottom' class for backward compatibility.
        // These rows are moved to a <tfoot>, creating one if necessary.
        var sortbottomrows = [];
        for (var i = 0; i < table.rows.length; i++) {
            if (table.rows[i].className.search(/\bsortbottom\b/) !== -1) {
                sortbottomrows[sortbottomrows.length] = table.rows[i];
            }
        }

        if (sortbottomrows.length > 0) {
            if (table.tFoot === null) {
                var tfo = document.createElement('tfoot'); // Create a new tfoot element.
                table.appendChild(tfo); // Append tfoot to the table.
            } else {
                var tfo = table.tFoot; // Use existing tfoot.
            }
            for (var i = 0; i < sortbottomrows.length; i++) {
                tfo.appendChild(sortbottomrows[i]); // Move rows to tfoot.
            }
            // No need to delete, it's just a local array.
        }


        // Iterate through each column header to determine sort type and add event listeners.
        var headrow = table.tHead.rows[0].cells;
        for (var i = 0; i < headrow.length; i++) {
            // Skip columns marked with 'sorttable_nosort'.
            if (!headrow[i].className.match(/\bsorttable_nosort\b/)) {
                var override;
                var mtch = headrow[i].className.match(/\bsorttable_([a-z0-9]+)\b/);
                // Check for a custom sort type defined in the class name.
                if (mtch) {
                    override = mtch[1];
                }

                // Assign the appropriate sort function.
                if (mtch && typeof sorttable["sort_" + override] === 'function') {
                    headrow[i].sorttable_sortfunction = sorttable["sort_" + override];
                } else {
                    headrow[i].sorttable_sortfunction = sorttable.guessType(table, i);
                }

                // Store column index and tbody reference for sorting.
                headrow[i].sorttable_columnindex = i;
                headrow[i].sorttable_tbody = table.tBodies[0];

                // Attach a click event listener to the header cell.
                dean_addEvent(headrow[i], "click", function (e) {

                    // If already sorted by this column in ascending order, reverse it.
                    if (this.className.search(/\bsorttable_sorted\b/) !== -1) {
                        sorttable.reverse(this.sorttable_tbody);
                        this.className = this.className.replace('sorttable_sorted', 'sorttable_sorted_reverse');
                        this.removeChild(document.getElementById('sorttable_sortfwdind'));
                        var sortrevind = document.createElement('span');
                        sortrevind.id = "sorttable_sortrevind";
                        sortrevind.innerHTML = stIsIE ? '&nbsp<font face="webdings">5</font>' : '&nbsp;&#x25B4;';
                        this.appendChild(sortrevind);
                        return;
                    }

                    // If already sorted by this column in descending order, re-reverse (to ascending).
                    if (this.className.search(/\bsorttable_sorted_reverse\b/) !== -1) {
                        sorttable.reverse(this.sorttable_tbody);
                        this.className = this.className.replace('sorttable_sorted_reverse', 'sorttable_sorted');
                        this.removeChild(document.getElementById('sorttable_sortrevind'));
                        var sortfwdind = document.createElement('span');
                        sortfwdind.id = "sorttable_sortfwdind";
                        sortfwdind.innerHTML = stIsIE ? '&nbsp<font face="webdings">6</font>' : '&nbsp;&#x25BE;';
                        this.appendChild(sortfwdind);
                        return;
                    }

                    // Remove existing sort indicators from other columns.
                    var theadrow = this.parentNode;
                    forEach(theadrow.childNodes, function (cell) {
                        if (cell.nodeType === 1) { // Check if it's an element node.
                            cell.className = cell.className.replace('sorttable_sorted_reverse', '');
                            cell.className = cell.className.replace('sorttable_sorted', '');
                        }
                    });

                    // Remove existing forward sort indicator.
                    var sortfwdind = document.getElementById('sorttable_sortfwdind');
                    if (sortfwdind) {
                        sortfwdind.parentNode.removeChild(sortfwdind);
                    }

                    // Remove existing reverse sort indicator.
                    var sortrevind = document.getElementById('sorttable_sortrevind');
                    if (sortrevind) {
                        sortrevind.parentNode.removeChild(sortrevind);
                    }

                    // Add the 'sorttable_sorted' class to the current column.
                    this.className += ' sorttable_sorted';
                    sortfwdind = document.createElement('span');
                    sortfwdind.id = "sorttable_sortfwdind";
                    sortfwdind.innerHTML = stIsIE ? '&nbsp<font face="webdings">6</font>' : '&nbsp;&#x25BE;';
                    this.appendChild(sortfwdind);


                    // Prepare an array for sorting (Schwartzian transform).
                    // Each element is [sort_key, original_row].
                    var row_array = [];
                    var col = this.sorttable_columnindex;
                    var rows = this.sorttable_tbody.rows;

                    for (var j = 0; j < rows.length; j++) {
                        row_array[row_array.length] = [sorttable.getInnerText(rows[j].cells[col]), rows[j]];
                    }

                    // Use the shaker_sort for stable sorting, or native sort for speed.
                    // sorttable.shaker_sort(row_array, this.sorttable_sortfunction);
                    row_array.sort(this.sorttable_sortfunction);

                    // Re-append the rows to the tbody in the new sorted order.
                    var tb = this.sorttable_tbody;
                    for (var j = 0; j < row_array.length; j++) {
                        tb.appendChild(row_array[j][1]);
                    }

                    // Clean up the temporary array.
                    delete row_array;
                }); // End of click event handler.
            } // End of if not nosort.
        } // End of for loop through headrow.
    }, // End of makeSortable method.


    // Attempts to guess the data type of a column based on its content.
    guessType: function (table, column) {
        var sortfn = sorttable.sort_alpha; // Default to alpha sort.

        // Examine cells in the first tbody.
        for (var i = 0; i < table.tBodies[0].rows.length; i++) {
            var text = sorttable.getInnerText(table.tBodies[0].rows[i].cells[column]);

            if (text !== '') {
                // Check for numeric values.
                if (text.match(/^-?[£$¤]?[\d,.]+%?$/)) {
                    return sorttable.sort_numeric;
                }
                // Check for date formats (dd/mm/yyyy or mm/dd/yyyy).
                var possdate = text.match(sorttable.DATE_RE);
                if (possdate) {
                    var first = parseInt(possdate[1], 10);
                    var second = parseInt(possdate[2], 10);

                    if (first > 12) {
                        return sorttable.sort_ddmm; // Definitely dd/mm.
                    } else if (second > 12) {
                        return sorttable.sort_mmdd; // Definitely mm/dd.
                    } else {
                        // Ambiguous date, assume dd/mm for now but keep looking.
                        sortfn = sorttable.sort_ddmm;
                    }
                }
            }
        }
        return sortfn; // Return the best guess.
    }, // End of guessType method.


    // Retrieves the text content of a DOM node for sorting purposes.
    getInnerText: function (node) {
        // Detect if the node contains input elements.
        var hasInputs = (typeof node.getElementsByTagName === 'function') &&
            node.getElementsByTagName('input').length;

        // Prioritize custom sort key attribute if present.
        if (node.getAttribute("sorttable_customkey") !== null) {
            return node.getAttribute("sorttable_customkey");
        }
        // Use textContent for modern browsers.
        else if (typeof node.textContent !== 'undefined' && !hasInputs) {
            return node.textContent.replace(/^\s+|\s+$/g, '');
        }
        // Fallback to innerText for older IE.
        else if (typeof node.innerText !== 'undefined' && !hasInputs) {
            return node.innerText.replace(/^\s+|\s+$/g, '');
        }
        // Another fallback for .text property.
        else if (typeof node.text !== 'undefined' && !hasInputs) {
            return node.text.replace(/^\s+|\s+$/g, '');
        }
        // Recursively get text for complex nodes.
        else {
            switch (node.nodeType) {
                case 3: // Text node.
                    if (node.nodeName.toLowerCase() === 'input') {
                        return node.value.replace(/^\s+|\s+$/g, '');
                    }
                case 4: // CDATA section node.
                    return node.nodeValue.replace(/^\s+|\s+$/g, '');
                    break;
                case 1: // Element node.
                case 11: // Document fragment node.
                    var innerText = '';
                    for (var i = 0; i < node.childNodes.length; i++) {
                        innerText += sorttable.getInnerText(node.childNodes[i]);
                    }
                    return innerText.replace(/^\s+|\s+$/g, '');
                    break;
                default: // Other node types.
                    return '';
            }
        }
    }, // End of getInnerText method.


    // Reverses the order of rows within a tbody element.
    reverse: function (tbody) {
        var newrows = [];
        // Copy all rows to a temporary array.
        for (var i = 0; i < tbody.rows.length; i++) {
            newrows[newrows.length] = tbody.rows[i];
        }
        // Append rows back in reverse order.
        for (var i = newrows.length - 1; i >= 0; i--) {
            tbody.appendChild(newrows[i]);
        }
        // The array will be garbage collected.
    }, // End of reverse method.


    // --- Sort Functions ---
    // Each sort function compares two array elements [key, row].
    // It returns <0 if a should come before b, >0 if b before a, 0 if equal.

    // Sorts numerically.
    sort_numeric: function (a, b) {
        var aa = parseFloat(a[0].replace(/[^0-9.-]/g, ''));
        if (isNaN(aa)) {
            aa = 0; // Treat non-numeric as 0.
        }
        var bb = parseFloat(b[0].replace(/[^0-9.-]/g, ''));
        if (isNaN(bb)) {
            bb = 0;
        }
        return aa - bb;
    },

    // Sorts alphabetically.
    sort_alpha: function (a, b) {
        if (a[0] === b[0]) {
            return 0;
        }
        if (a[0] < b[0]) {
            return -1;
        }
        return 1;
    },

    // Sorts dates in dd/mm/yy or dd/mm/yyyy format.
    sort_ddmm: function (a, b) {
        var mtch = a[0].match(sorttable.DATE_RE);
        var y = mtch[3];
        var m = mtch[2];
        var d = mtch[1];
        if (m.length === 1) {
            m = '0' + m;
        }
        if (d.length === 1) {
            d = '0' + d;
        }
        var dt1 = y + m + d; // YYYYMMDD format for comparison.

        mtch = b[0].match(sorttable.DATE_RE);
        y = mtch[3];
        m = mtch[2];
        d = mtch[1];
        if (m.length === 1) {
            m = '0' + m;
        }
        if (d.length === 1) {
            d = '0' + d;
        }
        var dt2 = y + m + d;

        if (dt1 === dt2) {
            return 0;
        }
        if (dt1 < dt2) {
            return -1;
        }
        return 1;
    },

    // Sorts dates in mm/dd/yy or mm/dd/yyyy format.
    sort_mmdd: function (a, b) {
        var mtch = a[0].match(sorttable.DATE_RE);
        var y = mtch[3];
        var d = mtch[2]; // Day is second component for mm/dd.
        var m = mtch[1]; // Month is first component for mm/dd.
        if (m.length === 1) {
            m = '0' + m;
        }
        if (d.length === 1) {
            d = '0' + d;
        }
        var dt1 = y + m + d;

        mtch = b[0].match(sorttable.DATE_RE);
        y = mtch[3];
        d = mtch[2];
        m = mtch[1];
        if (m.length === 1) {
            m = '0' + m;
        }
        if (d.length === 1) {
            d = '0' + d;
        }
        var dt2 = y + m + d;

        if (dt1 === dt2) {
            return 0;
        }
        if (dt1 < dt2) {
            return -1;
        }
        return 1;
    },


    // Shaker sort (Cocktail sort) for stable sorting.
    // Useful for multi-level sorting, but slower than native sort.
    // Implementation by Joseph Nahmias.
    shaker_sort: function (list, comp_func) {
        var b = 0; // Bottom boundary.
        var t = list.length - 1; // Top boundary.
        var swap = true; // Flag to indicate if any swaps occurred.

        while (swap) {
            swap = false;
            // Traverse from bottom to top.
            for (var i = b; i < t; ++i) {
                if (comp_func(list[i], list[i + 1]) > 0) {
                    var q = list[i];
                    list[i] = list[i + 1];
                    list[i + 1] = q;
                    swap = true;
                }
            }
            t--; // Decrease top boundary.

            if (!swap) {
                break; // If no swaps, list is sorted.
            }

            swap = false;
            // Traverse from top to bottom.
            for (var i = t; i > b; --i) {
                if (comp_func(list[i], list[i - 1]) < 0) {
                    var q = list[i];
                    list[i] = list[i - 1];
                    list[i - 1] = q;
                    swap = true;
                }
            }
            b++; // Increase bottom boundary.
        } // End while loop.
    } // End of shaker_sort method.
}; // End of sorttable object.


/* ******************************************************************
   Supporting functions: These utilities are bundled to avoid external dependencies.
   They provide cross-browser event handling and a generic forEach loop.
   ****************************************************************** */

// Dean Edwards / Matthias Miller / John Resig's DOMContentLoaded polyfill.

// For Mozilla/Opera 9+ and other W3C-compliant browsers.
if (document.addEventListener) {
    document.addEventListener("DOMContentLoaded", sorttable.init, false);
}

// For Internet Explorer using conditional compilation.
/*@cc_on @*/
/*@if (@_win32)
    document.write("<script id=__ie_onload defer src=javascript:void(0)><\/script>");
    var script = document.getElementById("__ie_onload");
    script.onreadystatechange = function () {
        if (this.readyState === "complete") {
            sorttable.init(); // Call the onload handler when DOM is ready.
        }
    };
/*@end @*/

// For Safari/WebKit browsers using a polling timer.
if (/WebKit/i.test(navigator.userAgent)) { // Simple user agent sniff.
    var _timer = setInterval(function () {
        if (/loaded|complete/.test(document.readyState)) {
            sorttable.init(); // Execute the init function.
        }
    }, 10); // Check every 10 milliseconds.
}

// Fallback for other browsers, attaches to window.onload.
window.onload = sorttable.init;


// Event handling utilities by Dean Edwards (with input from others).
// Source: http://dean.edwards.name/weblog/2005/10/add-event/

// Adds an event listener to a DOM element.
function dean_addEvent(element, type, handler) {
    if (element.addEventListener) {
        element.addEventListener(type, handler, false);
    } else {
        // Assign a unique ID to each handler for IE.
        if (!handler.$$guid) {
            handler.$$guid = dean_addEvent.guid++;
        }
        // Create an event hash table if it doesn't exist.
        if (!element.events) {
            element.events = {};
        }
        // Create a handler list for the specific event type.
        var handlers = element.events[type];
        if (!handlers) {
            handlers = element.events[type] = {};
            // Store any existing inline event handler.
            if (element["on" + type]) {
                handlers[0] = element["on" + type];
            }
        }
        // Store the new handler in the hash table.
        handlers[handler.$$guid] = handler;
        // Assign a global event handler for IE.
        element["on" + type] = handleEvent;
    }
}
// Counter for unique handler IDs.
dean_addEvent.guid = 1;

// Removes an event listener.
function removeEvent(element, type, handler) {
    if (element.removeEventListener) {
        element.removeEventListener(type, handler, false);
    } else {
        // Delete the handler from the hash table for IE.
        if (element.events && element.events[type]) {
            delete element.events[type][handler.$$guid];
        }
    }
}

// Global event handler for IE, dispatches events to registered handlers.
function handleEvent(event) {
    var returnValue = true;
    // Get the event object (IE uses a global one).
    event = event || fixEvent(((this.ownerDocument || this.document || this).parentWindow || window).event);
    // Get the list of handlers for this event type.
    var handlers = this.events[event.type];
    // Execute each registered handler.
    for (var i in handlers) {
        this.$$handleEvent = handlers[i];
        if (this.$$handleEvent(event) === false) {
            returnValue = false;
        }
    }
    return returnValue;
}

// Normalizes the event object for cross-browser compatibility.
function fixEvent(event) {
    // Add W3C standard event methods to IE's event object.
    event.preventDefault = fixEvent.preventDefault;
    event.stopPropagation = fixEvent.stopPropagation;
    return event;
}

// Implements preventDefault for IE.
fixEvent.preventDefault = function () {
    this.returnValue = false;
};

// Implements stopPropagation for IE.
fixEvent.stopPropagation = function () {
    this.cancelBubble = true;
};


// forEach implementation by Dean Edwards.
// Source: http://dean.edwards.name/base/forEach.js
// Provides a generic way to iterate over various types of collections.

// Array-like enumeration.
if (!Array.forEach) { // Mozilla already supports this natively.
    Array.forEach = function (array, block, context) {
        for (var i = 0; i < array.length; i++) {
            block.call(context, array[i], i, array);
        }
    };
}

// Generic enumeration for object properties.
Function.prototype.forEach = function (object, block, context) {
    for (var key in object) {
        // Ensure not to iterate over inherited prototype properties.
        if (typeof this.prototype[key] === "undefined") {
            block.call(context, object[key], key, object);
        }
    }
};

// Character enumeration for strings.
String.forEach = function (string, block, context) {
    Array.forEach(string.split(""), function (chr, index) {
        block.call(context, chr, index, string);
    });
};

// Globally resolved forEach enumeration function.
var forEach = function (object, block, context) {
    if (object) {
        var resolve = Object; // Default resolver.
        if (object instanceof Function) {
            resolve = Function; // Functions have a "length" property.
        } else if (object.forEach instanceof Function) {
            // If object has its own forEach, use it.
            object.forEach(block, context);
            return;
        } else if (typeof object === "string") {
            resolve = String; // String specific enumeration.
        } else if (typeof object.length === "number") {
            resolve = Array; // Array-like objects.
        }
        resolve.forEach(object, block, context); // Call the appropriate forEach.
    }
};