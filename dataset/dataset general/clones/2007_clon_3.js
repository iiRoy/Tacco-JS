/**
 * This file is a derivative work, re-engineered from an older library.
 * It's designed for modern JavaScript environments and may not be suitable
 * for legacy browsers without transpilation.
 *
 * This version aims to provide similar core functionalities with a different
 * internal structure and naming conventions.
 *
 * Original Source: jQuery JavaScript Library v1.3.2
 * Original Copyright (c) 2009 John Resig, http://jquery.com/
 *
 * This derivative work is provided without warranty, express or implied.
 */

(function() {

    // Reference to the global object, aliased for minification and clarity.
    const globalScope = this;

    // A consistent way to reference the undefined primitive value.
    const nothing = undefined;

    // Store original global references in case of conflicts.
    const originalLib = globalScope.MyLibrary;
    const originalDollar = globalScope.$;

    // Regular expression for quickly identifying HTML strings or simple ID selectors.
    // Captures: 1: HTML string, 3: ID string
    const elementPattern = /^[^<]*(<(.|\s)+>)[^>]*$|^#([\w-]+)$/;

    // Checks if a selector is a simple class or tag name (not complex CSS).
    const simpleSelectorCheck = /^.[^:#\[\.,]*$/;

    // The main entry point for our library.
    // It's both a function and an object acting as a namespace.
    const MyLibrary = globalScope.MyLibrary = globalScope.$ = function(query, contextNode) {
        // The MyLibrary object is an instance of MyLibrary.prototype.initialize.
        return new MyLibrary.prototype.initialize(query, contextNode);
    };

    // Public API, exposed via MyLibrary.fn for brevity and historical reasons.
    MyLibrary.fn = MyLibrary.prototype = {

        // The constructor for creating new MyLibrary instances.
        initialize: function(itemQuery, scopeContext) {
            // Ensure a query is always provided, defaulting to the document if none.
            itemQuery = itemQuery || document;

            // Handle cases where a direct DOM element is passed.
            if (itemQuery.nodeType) {
                this[0] = itemQuery;
                this.length = 1;
                this.context = itemQuery;
                return this;
            }

            // Handle string-based queries (HTML or selectors).
            if (typeof itemQuery === "string") {
                const queryMatch = elementPattern.exec(itemQuery);

                // If it's a recognized pattern and no specific context is given for an ID.
                if (queryMatch && (queryMatch[1] || !scopeContext)) {

                    // Case 1: HTML string (e.g., `$('<div>')`)
                    if (queryMatch[1]) {
                        itemQuery = MyLibrary.parseHtml(queryMatch[1], scopeContext);
                    }
                    // Case 2: ID selector (e.g., `$('#myId')`)
                    else {
                        const targetElement = document.getElementById(queryMatch[3]);

                        // Edge case for IE/Opera returning elements by name instead of ID.
                        if (targetElement && targetElement.id !== queryMatch[3]) {
                            // Re-evaluate the selector using a broader search.
                            return MyLibrary().findElements(itemQuery);
                        }

                        // Create a new MyLibrary instance with the found element.
                        const newInstance = MyLibrary(targetElement || []);
                        newInstance.context = document;
                        newInstance.elementPath = itemQuery;
                        return newInstance;
                    }
                }
                // Case 3: Complex selector or selector with context (e.g., `$('p', '#container')`)
                else {
                    return MyLibrary(scopeContext).findElements(itemQuery);
                }

                // If `itemQuery` was an HTML string, it's now an array of DOM elements.
                // Fall through to the `populateCollection` call below.
            }
            // Handle function-based queries (document ready shortcut).
            else if (MyLibrary.isFunction(itemQuery)) {
                return MyLibrary(document).onReady(itemQuery);
            }

            // Preserve the original selector and context from a previous MyLibrary object.
            if (itemQuery.elementPath && itemQuery.context) {
                this.elementPath = itemQuery.elementPath;
                this.context = itemQuery.context;
            }

            // Populate the collection with the resolved elements.
            return this.populateCollection(MyLibrary.isArray(itemQuery) ?
                itemQuery :
                MyLibrary.toArray(itemQuery));
        },

        // The selector string that originally created this collection.
        elementPath: "",

        // The current library version.
        libVersion: "1.0.0-alpha",

        // Returns the number of elements in the current collection.
        count: function() {
            return this.length;
        },

        // Retrieves an element from the collection by its index.
        // If no index is provided, returns the entire collection as a plain array.
        getCollectionItem: function(idx) {
            return idx === nothing ?
                Array.from(this) : // Return a clean array copy
                this[idx];          // Return the specific element
        },

        // Pushes the current collection onto a stack,
        // then sets the collection to a new array of elements.
        stackElements: function(newItems, operationName, operationQuery) {
            const newCollection = MyLibrary(newItems);

            // Maintain a reference to the previous state.
            newCollection.previousCollection = this;
            newCollection.context = this.context;

            // Build the selector path for debugging/identification.
            if (operationName === "findElements") {
                newCollection.elementPath = this.elementPath + (this.elementPath ? " " : "") + operationQuery;
            } else if (operationName) {
                newCollection.elementPath = this.elementPath + "." + operationName + "(" + operationQuery + ")";
            }

            return newCollection;
        },

        // Replaces the current collection with a new array of elements.
        // This is a destructive operation; use `stackElements` to preserve history.
        populateCollection: function(elementsArray) {
            this.length = 0; // Reset length
            Array.prototype.push.apply(this, elementsArray); // Efficiently add new elements
            return this;
        },

        // Iterates over each element in the collection, executing a callback.
        iterateOver: function(callbackFunc, additionalArgs) {
            return MyLibrary.processEach(this, callbackFunc, additionalArgs);
        },

        // Finds the zero-based index of a specific element within the collection.
        findPosition: function(targetElement) {
            // If a MyLibrary object is passed, use its first element.
            const actualTarget = targetElement && targetElement.libVersion ? targetElement[0] : targetElement;
            return MyLibrary.findInArray(actualTarget, this);
        },

        // Manages attributes and properties of elements in the collection.
        attributeManager: function(attrName, attrValue, attrType) {
            let attributeOptions = attrName;

            // If only an attribute name is provided, return the value of the first element.
            if (typeof attrName === "string" && attrValue === nothing) {
                return this[0] && MyLibrary[attrType || "getAttribute"](this[0], attrName);
            }

            // If a single attribute is being set, convert it to an options object.
            if (typeof attrName === "string") {
                attributeOptions = {};
                attributeOptions[attrName] = attrValue;
            }

            // Iterate and set attributes/properties.
            return this.iterateOver(function(index) {
                for (let prop in attributeOptions) {
                    MyLibrary.setAttribute(
                        attrType ? this.style : this,
                        prop,
                        MyLibrary.resolvePropertyValue(this, attributeOptions[prop], attrType, index, prop)
                    );
                }
            });
        },

        // Manages CSS styles for elements in the collection.
        styleManager: function(cssProp, cssValue) {
            // Prevent setting negative width/height.
            if ((cssProp === 'width' || cssProp === 'height') && parseFloat(cssValue) < 0) {
                cssValue = nothing;
            }
            return this.attributeManager(cssProp, cssValue, "getComputedStyle");
        },

        // Gets or sets the text content of elements.
        textContentHandler: function(contentValue) {
            // If setting text: clear existing content and append new text node.
            if (typeof contentValue !== 'object' && contentValue !== null) {
                const doc = (this[0] && this[0].ownerDocument) || document;
                return this.clearContents().addContent(doc.createTextNode(contentValue));
            }

            // If getting text: concatenate text content from all child nodes.
            let fullText = "";
            MyLibrary.processEach(contentValue || this, function() {
                MyLibrary.processEach(this.childNodes, function() {
                    // Ignore comment nodes.
                    if (this.nodeType !== 8) {
                        fullText += (this.nodeType !== 1) ?
                            this.nodeValue :
                            MyLibrary.fn.textContentHandler([this]); // Recursively get text for child elements
                    }
                });
            });

            return fullText;
        },

        // Wraps all matched elements with a single, shared HTML structure.
        encompassAll: function(wrapperHtml) {
            if (this[0]) {
                const wrapperElement = MyLibrary(wrapperHtml, this[0].ownerDocument).clone(true); // Clone with data/events

                // Insert the wrapper before the first matched element.
                if (this[0].parentNode) {
                    wrapperElement.insertBefore(this[0]);
                }

                // Find the innermost element of the wrapper and append all matched elements to it.
                wrapperElement.map(function() {
                    let currentElem = this;
                    while (currentElem.firstChild) {
                        currentElem = currentElem.firstChild;
                    }
                    return currentElem;
                }).addContent(this);
            }
            return this;
        },

        // Wraps the inner child contents of each matched element with an HTML structure.
        encompassInner: function(wrapperHtml) {
            return this.iterateOver(function() {
                MyLibrary(this).getContents().encompassAll(wrapperHtml);
            });
        },

        // Wraps each matched element individually with a new HTML structure.
        encompass: function(wrapperHtml) {
            return this.iterateOver(function() {
                MyLibrary(this).encompassAll(wrapperHtml);
            });
        },

        // Appends content to the inside of each matched element.
        appendContent: function() {
            return this.manipulateDomElements(arguments, true, function(domElement) {
                if (this.nodeType === 1) { // Ensure it's an element node
                    this.appendChild(domElement);
                }
            });
        },

        // Prepends content to the inside of each matched element.
        prependContent: function() {
            return this.manipulateDomElements(arguments, true, function(domElement) {
                if (this.nodeType === 1) { // Ensure it's an element node
                    this.insertBefore(domElement, this.firstChild);
                }
            });
        },

        // Inserts content immediately before each matched element.
        beforeContent: function() {
            // Functionality is similar to append/prepend but targets parent.
            // Will be implemented in `manipulateDomElements` based on the callback.
        }

        // ... additional methods would follow here
        // The original code only provided up to `beforeContent`, so stopping here.
    };

    // --- Utility Methods (formerly jQuery static methods) ---

    MyLibrary.extend = MyLibrary.fn.extend = function() {
        let options, name, src, copy, copyIsArray, clone;
        let target = arguments[0] || {};
        let i = 1;
        let length = arguments.length;
        let deep = false;

        // Handle a deep copy situation
        if (typeof target === "boolean") {
            deep = target;
            target = arguments[1] || {};
            // skip the boolean and the target
            i = 2;
        }

        // Handle case when target is not an object or function
        if (typeof target !== "object" && !MyLibrary.isFunction(target)) {
            target = {};
        }

        // If no target is provided, extend MyLibrary itself.
        if (length === i) {
            target = this;
            --i;
        }

        for (; i < length; i++) {
            // Only deal with non-null/undefined values
            if ((options = arguments[i]) != null) {
                // Extend the base object
                for (name in options) {
                    src = target[name];
                    copy = options[name];

                    // Prevent never-ending loop
                    if (target === copy) {
                        continue;
                    }

                    // Recurse if we're merging plain objects or arrays
                    if (deep && copy && (MyLibrary.isPlainObject(copy) || (copyIsArray = MyLibrary.isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && MyLibrary.isArray(src) ? src : [];
                        } else {
                            clone = src && MyLibrary.isPlainObject(src) ? src : {};
                        }

                        // Never move original objects, clone them
                        target[name] = MyLibrary.extend(deep, clone, copy);

                    // Don't bring in undefined values
                    } else if (copy !== nothing) {
                        target[name] = copy;
                    }
                }
            }
        }

        // Return the modified object
        return target;
    };

    MyLibrary.extend({
        // Generic iteration utility.
        processEach: function(collection, callback, extraArgs) {
            let i = 0,
                length = collection.length;
            const isArrayLike = length === 0 || MyLibrary.isNumber(length) && length > 0 && (length - 1) in collection;

            if (isArrayLike) {
                for (; i < length; i++) {
                    if (callback.apply(collection[i], extraArgs || [i, collection[i]]) === false) {
                        break;
                    }
                }
            } else {
                for (i in collection) {
                    if (callback.apply(collection[i], extraArgs || [i, collection[i]]) === false) {
                        break;
                    }
                }
            }

            return collection;
        },

        // Converts an array-like object (e.g., NodeList) into a true Array.
        toArray: function(list, startIdx) {
            return Array.prototype.slice.call(list, startIdx || 0);
        },

        // Checks if an item is present in an array and returns its index.
        findInArray: function(value, arr, fromIndex) {
            if (arr.indexOf) {
                return arr.indexOf(value, fromIndex);
            }

            for (let i = fromIndex || 0, length = arr.length; i < length; i++) {
                if (arr[i] === value) {
                    return i;
                }
            }
            return -1;
        },

        // Checks if a variable is a function.
        isFunction: function(obj) {
            return typeof obj === "function";
        },

        // Checks if a variable is an array.
        isArray: Array.isArray || function(obj) {
            return Object.prototype.toString.call(obj) === "[object Array]";
        },

        // Checks if a variable is a plain object (created by `{}` or `new Object()`).
        isPlainObject: function(obj) {
            // Not plain if it is a DOM node, window, or has a constructor.
            if (!obj || typeof obj !== "object" || obj.nodeType || obj === obj.window) {
                return false;
            }

            // Check if it has a constructor and that the constructor is `Object`.
            if (obj.constructor && !Object.prototype.hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf")) {
                return false;
            }

            // If the prototype is `Object.prototype` or null, it's a plain object.
            return true;
        },

        // Checks if a variable is a number.
        isNumber: function(obj) {
            return typeof obj === "number" && isFinite(obj);
        },

        // Parses an HTML string into a set of DOM elements.
        parseHtml: function(htmlString, context) {
            context = context && context.nodeType ? context.ownerDocument || context : document;
            const tempDiv = context.createElement("div");
            tempDiv.innerHTML = htmlString;
            return MyLibrary.toArray(tempDiv.childNodes);
        },

        // Get attribute value.
        getAttribute: function(elem, name) {
            return elem.getAttribute(name);
        },

        // Set attribute value.
        setAttribute: function(elem, name, value) {
            elem.setAttribute(name, value);
        },

        // Resolve property value (e.g., for `attr` or `css` callbacks).
        resolvePropertyValue: function(elem, value, type, index, name) {
            if (MyLibrary.isFunction(value)) {
                return value.call(elem, index, MyLibrary[type || "getAttribute"](elem, name));
            }
            return value;
        },

        // Placeholder for `curCSS` equivalent for computed styles.
        getComputedStyle: function(elem, name) {
            // This would involve `window.getComputedStyle` in a real implementation.
            // For this clone, it's simplified.
            return elem.style[name] || '';
        }
    });

    // Restore original global variables if `noConflict` is called.
    MyLibrary.noConflict = function(deep) {
        if (globalScope.$ === MyLibrary) {
            globalScope.$ = originalDollar;
        }
        if (deep && globalScope.MyLibrary === MyLibrary) {
            globalScope.MyLibrary = originalLib;
        }
        return MyLibrary;
    };

    // Additional methods for DOM manipulation (partial implementation for `beforeContent`).
    MyLibrary.fn.extend({
        manipulateDomElements: function(contentItems, reverse, callback) {
            const elements = this;
            const fragment = document.createDocumentFragment();
            const firstElement = elements[0] || null;
            let i = 0;
            const args = MyLibrary.toArray(contentItems, 0);

            // Process content elements.
            for (let k = 0; k < args.length; k++) {
                let currentArg = args[k];

                if (typeof currentArg === "string") {
                    currentArg = MyLibrary.parseHtml(currentArg);
                } else if (currentArg && currentArg.nodeType) {
                    currentArg = [currentArg];
                } else if (currentArg && currentArg.libVersion) {
                    currentArg = MyLibrary.toArray(currentArg);
                } else {
                    continue; // Skip unsupported types
                }

                for (let j = 0; j < currentArg.length; j++) {
                    const node = currentArg[j];
                    // Append to fragment for efficiency.
                    if (node.nodeType) {
                        fragment.appendChild(node);
                    }
                }
            }

            // If there's a fragment, iterate and apply.
            if (fragment.childNodes.length > 0) {
                const nodesToInsert = MyLibrary.toArray(fragment.childNodes);

                // For append/prepend, iterate through the collection.
                // For before/after, iterate through collection parents.
                elements.iterateOver(function() {
                    const target = this;
                    for (let n = 0; n < nodesToInsert.length; n++) {
                        // Clone nodes for all but the first target element.
                        const node = (elements.length > 1 && n > 0) ? nodesToInsert[n].cloneNode(true) : nodesToInsert[n];
                        callback.call(target, node);
                    }
                });
            }

            return this;
        }
    });

    // Complete `beforeContent` implementation.
    MyLibrary.fn.beforeContent = function() {
        return this.manipulateDomElements(arguments, false, function(elem) {
            if (this.parentNode) {
                this.parentNode.insertBefore(elem, this);
            }
        });
    };

    // Add a simple `onReady` handler.
    MyLibrary.fn.onReady = function(handler) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', handler);
        } else {
            handler();
        }
        return this;
    };

    // Simple `find` equivalent.
    MyLibrary.fn.findElements = function(selector) {
        const results = [];
        this.iterateOver(function() {
            const matches = this.querySelectorAll(selector);
            Array.prototype.push.apply(results, MyLibrary.toArray(matches));
        });
        return this.stackElements(results, "findElements", selector);
    };

    // Simple `empty` equivalent.
    MyLibrary.fn.clearContents = function() {
        return this.iterateOver(function() {
            while (this.firstChild) {
                this.removeChild(this.firstChild);
            }
        });
    };

    // Simple `append` alias for `addContent` to match `appendContent` signature.
    MyLibrary.fn.addContent = MyLibrary.fn.appendContent;

    // Simple `contents` equivalent.
    MyLibrary.fn.getContents = function() {
        const allContents = [];
        this.iterateOver(function() {
            Array.prototype.push.apply(allContents, MyLibrary.toArray(this.childNodes));
        });
        return this.stackElements(allContents, "getContents", "");
    };

})(this);