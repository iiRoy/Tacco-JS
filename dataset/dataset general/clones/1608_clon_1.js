/*
 * This file contains core functionalities of the Mithril.js framework.
 *
 * It provides a lightweight, modular approach to JavaScript development.
 *
 * @project Mithril.js
 * @version 1.0.0
 * @license MIT
 * @author Matthew Story
 *
 * For more details, visit: [Mithril.js Documentation]
 *
 * Last Modified: 2023-10-27
 */

var Mithril =
{
    empty: function()
    {
        // This is an intentional empty function, often used as a default callback.
    },


    browser: false, // Stores the detected browser name.
    version: false, // Stores the detected browser version.


    /**
     * Initializes the Mithril object by detecting the browser and its version.
     * It updates the 'browser' and 'version' properties of the Mithril object.
     */
    setup: function()
    {
        // Regular expressions for browser detection.
        var userAgent = navigator.userAgent;

        this.browser = (userAgent.match(/Opera/))
                       ? 'Opera'
                       : (
                           (userAgent.match(/MSIE/))
                           ? 'MSIE'
                           : (
                               (userAgent.match(/Safari/))
                               ? 'Safari'
                               : 'Firefox'
                             )
                         );

        // Extracts the version number based on the detected browser.
        // The division by 1 ensures the result is a number.
        this.version = userAgent.match(new RegExp(this.browser + '[^0-9]*([0-9]+\\.*[0-9]+)'))[1] / 1;
    }
};

// Immediately set up the Mithril environment upon script loading.
Mithril.setup();


// --- Utility Methods (Generic) ---

/**
 * Returns the name of the detected browser.
 * @returns {string} The browser name (e.g., 'Firefox', 'MSIE', 'Safari', 'Opera').
 */
function getBrowser()
{
    return Mithril.browser;
}
; // Semicolon added for visual variation.

/**
 * Returns the version of the detected browser.
 * @returns {number} The browser version.
 */
function getBrowserVersion()
{
    return Mithril.version;
}
; // Another semicolon for consistency.


// --- Object Utility Methods ---

/**
 * Extends an object with properties from one or more source objects.
 * This method is added to Object.prototype, making it available on all objects.
 * @param {...object} sources - One or more objects whose properties will be copied.
 * @returns {object} The modified object (this).
 */
Object.prototype.patch = function()
{
    // Iterate through all provided argument objects.
    for (var i = 0; i < arguments.length; i++)
    {
        // Iterate through each property in the current argument object.
        for (var name in arguments[i])
        {
            // Copy the property to the current object.
            this[name] = arguments[i][name];
        }
    }
    return this; // Return the modified object.
};

// Apply a set of common utility methods to Object.prototype using the patch method.
Object.prototype.patch(
{
    /**
     * Converts the object to a JSON string representation.
     * Note: This implementation is simplistic and might not handle complex objects correctly.
     * It primarily removes 'new Function(...)' wrappers from function string representations.
     * @returns {string} A string representation of the object, adjusted for JSON-like output.
     */
    toJSON: function()
    {
        return this.toString().replace(/^\(new[^(]*\(|^\(|\)+$/g, '');
    },

    /**
     * Converts an array-like object into a true JavaScript Array.
     * @returns {Array} A new array containing the elements of the object.
     */
    toArray: function()
    {
        var array = [];
        for (var i = 0; i < this.length; i++)
        {
            array.push(this[i]);
        }
        return array;
    },

    // Placeholder for an AJAX send method.
    // This method would typically encode the object and send it to a URL.
    send: function()
    {
        // Implementation for sending object data via AJAX would go here.
    },

    // Placeholder for an object encoding method.
    // This method would typically convert the object into a format suitable for transmission.
    encode: function()
    {
        // Implementation for encoding object data would go here.
    },

    /**
     * Creates a new class (constructor function) with optional inheritance and initialization.
     * This is a factory method that allows for flexible class creation patterns.
     * @param {object} [options] - Configuration options for the new class.
     * @param {function} [options.init=false] - The initialization function for the new class instance.
     * @param {function} [options.parent=Mithril.empty] - The parent constructor function for inheritance.
     * @param {boolean} [options.initParent=false] - Whether to call the parent constructor during initialization.
     * @returns {function} The newly created class constructor.
     */
    factory: function()
    {
        // Default options, patched with any provided arguments.
        var options = { init: false, parent: Mithril.empty, initParent: false }.patch(arguments[0] || {});

        // Determine the actual initialization function.
        options.init = (options.init)
                       ? (
                           (options.init.constructor == String)
                           ? this[options.init]
                           : options.init
                         )
                       : (
                           (this.init)
                           ? this.init
                           : this.initialize
                         );

        // The new class constructor.
        var klass = function()
        {
            // Call the parent constructor if initParent is true.
            if (options.initParent)
            {
                this.parent.apply(this, arguments);
            }
            // Call the class's own initialization function.
            options.init.apply(this, arguments);
        };

        // Patch the prototype of the new class with parent's prototype and current object's properties.
        klass.prototype.patch(options.parent.prototype, this, { parent: options.parent });

        return klass;
    }
});


// --- String Utility Methods ---

// Apply a set of utility methods to String.prototype using the patch method.
String.prototype.patch(
{
    /**
     * Evaluates the string as a JSON object.
     * @param {object} [options] - Options for evaluation, passed to the `eval` method.
     * @returns {object|boolean} The parsed JSON object, or `false` on error.
     */
    evalJSON: function()
    {
        return this.eval((arguments[0] || {}).patch({ json: true }));
    },

    /**
     * Evaluates the string as JavaScript code.
     * @param {object} [options] - Options for evaluation, passed to the `eval` method.
     * @returns {boolean} `true` if evaluation is successful, `false` on error.
     */
    evalJS: function()
    {
        return this.eval((arguments[0] || {}).patch({ json: false }));
    },

    /**
     * Generic evaluation method for string content, supporting JSON or raw JS.
     * @param {object} [options] - Configuration options.
     * @param {function} [options.onError=function(){}] - Callback function for errors.
     * @param {boolean} [options.json=false] - If `true`, treats the string as JSON.
     * @returns {object|boolean} The result of evaluation (parsed JSON or `true`/`false` for JS).
     */
    eval: function()
    {
        var options = { onError: function() {}, json: false }.patch(arguments[0] || {});
        try
        {
            // If json option is true, prepend 'var jsonObj=' to allow returning the parsed object.
            eval(((options.json) ? 'var jsonObj=' + this : this));
            return (options.json) ? jsonObj : true;
        }
        catch (e)
        {
            options.onError(e); // Call the error handler.
            return false;       // Indicate failure.
        }
    }
});


// --- Array Utility Methods ---

// Apply a set of utility methods to Array.prototype using the patch method.
Array.prototype.patch(
{
    /**
     * Checks if a given value exists within the array.
     * @param {*} value - The value to search for.
     * @returns {boolean} `true` if the value is found, `false` otherwise.
     */
    inArray: function(value)
    {
        for (var i = 0; i < this.length; i++)
        {
            if (this[i] == value)
            {
                return true;
            }
        }
        return false;
    },

    /**
     * Iterates over each element in the array, executing a provided function.
     * @param {function(item, index)} func - The function to execute for each element.
     * @param {object} [scope] - Optional object to use as 'this' within the callback function.
     */
    each: function(func)
    {
        for (var i = 0; i < this.length; i++)
        {
            func.apply((arguments[1] || this), [this[i], i]);
        }
    },

    /**
     * Returns the first index at which a given element can be found in the array.
     * @param {*} elem - The element to locate.
     * @returns {number} The index of the element, or -1 if not found.
     */
    indexOf: function(elem)
    {
        for (var i = 0; i < this.length; i++)
        {
            if (elem == this[i])
            {
                return i;
            }
        }
        return -1;
    },

    /**
     * Removes the first occurrence of a specified element from the array.
     * @param {*} elem - The element to remove.
     */
    remove: function(elem)
    {
        var index = this.indexOf(elem);
        if (index != -1)
        {
            this.splice(index, 1); // Remove one element at the found index.
        }
    }
});


// --- Function Utility Methods ---

// Apply a set of utility methods to Function.prototype using the patch method.
Function.prototype.patch(
{
    /**
     * Creates a new function that, when called, has its 'this' keyword set to the provided value.
     * @param {object} obj - The object to which 'this' should be bound.
     * @returns {function} A new function with the 'this' context bound to `obj`.
     */
    bind: function(obj)
    {
        var func = this; // Store a reference to the original function.
        return function()
        {
            // Apply the original function with the bound object and current arguments.
            func.apply(obj, arguments);
        };
    }
});


/**
 * A shorthand function for retrieving DOM elements by ID or wrapping existing elements.
 * It also enhances the returned element with Mithril's utility methods.
 * @param {string|HTMLElement} id - The ID of the element, or an existing HTMLElement.
 * @returns {HTMLElement} The enhanced DOM element.
 */
function $(id)
{
    // Determine if 'id' is a string (ID) or an actual element.
    var element = (id.constructor == String) ? document.getElementById(id) : id;

    // If the element exists and hasn't been Mithril-enhanced yet.
    if (element && !element.mithril)
    {
        element.patch   = Object.prototype.patch; // Give element the patch method.
        element.mithril = true;                   // Mark as Mithril-enhanced.

        // Patch the element with various module-specific functionalities if they exist.
        return element.patch(
            (Event)         ? Event.Element         : {},
            (Event.Advanced)? Event.Advanced.Element: {},
            (CSS)           ? CSS.Element           : {},
            (DOM)           ? DOM.Element           : {},
            (Ajax)          ? Ajax.Element          : {}
        );
    }
    return element; // Return the element (either enhanced or original).
}


// --- Event Handling Module ---

var Event =
{
    /**
     * Factory for creating enhanced event objects.
     * This provides cross-browser normalization and adds utility properties.
     */
    event: {
        init: function(event)
        {
            // Ensure the original event object is accessible.
            // Patch the event object for cross-browser compatibility.

            if (this.isKeyboardEvent(event))
            {
                // Normalize key codes for keyboard events.
                this.key = (event.which) ? String.fromCharCode(event.charCode) : 'k' + event.keyCode;
            }

            if (this.isMouseEvent(event))
            {
                // Normalize mouse button clicks.
                this.leftClick   = (event.button === 0) ? true : false;
                this.centerClick = (event.button === 1) ? true : false;
                this.rightClick  = (event.button === 2) ? true : false;
                this.mouse       = (this.leftClick) ? LEFT_CLICK : (this.centerClick) ? CENTER_CLICK : RIGHT_CLICK;
            }

            // Normalize stopPropagation for IE.
            event.stopPropagation = (event.stopPropagation || function()
            {
                this.cancelCapture = true;
                this.cancelBubble  = true;
            });
        },

        /**
         * Checks if the given event is a mouse event.
         * @param {Event} event - The event object.
         * @returns {boolean} True if it's a mouse event, false otherwise.
         */
        isMouseEvent: function(event)
        {
            return ((event || this).type == 'click' || (event || this).type == 'mousedown' || (event || this).type == 'mouseup');
        },

        /**
         * Checks if the given event is a keyboard event.
         * @param {Event} event - The event object.
         * @returns {boolean} True if it's a keyboard event, false otherwise.
         */
        isKeyboardEvent: function(event)
        {
            return ((event || this).type == 'keypress' || (event || this).type == 'keydown' || (event || this).type == 'keyup');
        }
    }.factory(), // Create an instance using the factory.

    // A collection to store all registered event listeners for later management.
    events: [],

    /**
     * Attaches an event listener to an element.
     * @param {HTMLElement} element - The DOM element to attach the listener to.
     * @param {string} event - The name of the event (e.g., 'click', 'mouseover').
     * @param {function} listener - The callback function to execute when the event occurs.
     * @param {object} [options] - Additional options for event handling (e.g., key/mask filtering).
     */
    listen: function(element, event, listener)
    {
        var wrap = this.wrapListener(listener.bind(element), arguments[3]);
        this.events.push({ element: element, listener: listener, wrap: wrap, event: event });

        if (Mithril.browser == 'MSIE')
        {
            element.attachEvent('on' + event, wrap);
        }
        else
        {
            element.addEventListener(event, wrap, false);
        }
    },

    /**
     * Removes event listeners from an element.
     * @param {HTMLElement} element - The DOM element from which to remove listeners.
     * @param {string} [event] - Optional: The specific event type to stop listening for.
     * @param {function} [listener] - Optional: The specific listener function to remove.
     */
    stopListening: function(element)
    {
        var listeners = this.getListeners(element, (arguments[1] || false), (arguments[2] || false));

        for (var i = 0; i < listeners.length; i++)
        {
            if (Mithril.browser == 'MSIE')
            {
                element.detachEvent('on' + listeners[i].event, listeners[i].wrap);
            }
            else
            {
                element.removeEventListener(listeners[i].event, listeners[i].wrap, false);
            }
        }
    },

    /**
     * Wraps a listener function to provide cross-browser event normalization and filtering.
     * @param {function} listener - The original event listener function.
     * @param {object} [options] - Options for event filtering (keys, masks, preventDefault).
     * @returns {function} The wrapped listener function.
     */
    wrapListener: function(listener)
    {
        var options = new Event.Options(arguments[1]);
        return function(event)
        {
            // For IE, create a new event object and patch it.
            if (Mithril.browser == 'MSIE')
            {
                event = document.createEventObject().patch = Object.prototype.patch;
            }
            // Enhance the event object with Mithril's event utilities.
            event = event.patch(new Event.event(event));

            // Apply event filtering based on options (keys, modifier masks).
            if (!event || (
                (!event.isMouseEvent() || !options.keys.length || event.mouse == options.keys[0])
                && ((!event.isKeyboardEvent()) || !options.keys.length || options.keys.inArray(event.key))
                && (!options.masks.inArray(META) || event.metaKey)
                && (!options.masks.inArray(SHIFT) || event.shiftKey)
                && (!options.masks.inArray(CTRL) || event.ctrlKey)
                && (!options.masks.inArray(ALT) || event.altKey)
            ))
            {
                var userRet = listener(event); // Execute the original listener.

                // Prevent default action and stop propagation if specified in options.
                if (options.prevent)
                {
                    event.stopPropagation();
                    return false;
                }
                return userRet; // Return the listener's result.
            }
        };
    },

    /**
     * Retrieves and optionally removes registered listeners for a given element.
     * @param {HTMLElement} element - The element whose listeners are sought.
     * @param {string} [event] - Optional: Filter by event type.
     * @param {function} [listener] - Optional: Filter by specific listener function.
     * @returns {Array<object>} An array of matching listener objects.
     */
    getListeners: function(element, event, listener)
    {
        var events  = [];
        var matches = [];

        for (var i = 0; i < this.events.length; i++)
        {
            if (element == this.events[i].element
                && (!event || this.events[i].event == event)
                && (!listener || this.events[i].listener == listener))
            {
                matches.push(this.events[i]);
            }
            else
            {
                events.push(this.events[i]);
            }
        }
        this.events = events; // Update the global events list (removes matched listeners).
        return matches;
    },

    /**
     * Factory for creating event options objects.
     * Used to configure event filtering and behavior.
     */
    Options: {
        keys: [], masks: [], prevent: false,

        /**
         * Initializes an Event.Options object.
         * @param {object} [config] - Configuration object to patch onto the instance.
         */
        init: function()
        {
            this.patch(arguments[0] || {});
            // Ensure keys and masks are arrays for consistent processing.
            this.keys  = (this.keys.constructor == Array)  ? this.keys  : [this.keys];
            this.masks = (this.masks.constructor == Array) ? this.masks : [this.masks];
        }
    }.factory(), // Create an instance using the factory.

    /**
     * Advanced Event Handling for Elements.
     * Provides higher-level, convenience methods for common event patterns.
     */
    Advanced: {
        Element: {
            /**
             * Attaches a 'load' event listener.
             * @param {function} listener - The callback function.
             * @param {object} [options] - Event options.
             */
            loadify: function(listener)
            {
                this.listen('load', listener, arguments[1]);
            },

            /**
             * Attaches a 'click' event listener, handling right-clicks separately.
             * @param {function} listener - The callback function.
             * @param {object} [options] - Event options.
             */
            clickify: function(listener)
            {
                var options = new Event.Options(arguments[1]);
                if (options.keys.inArray(RIGHT_CLICK))
                {
                    this.rightClickify(listener, options);
                    return;
                }
                this.listen('click', listener, options);
            },

            /**
             * Removes 'click' event listeners.
             * @param {function} listener - The specific listener to remove.
             */
            unclickify: function(listener)
            {
                this.stopListening('click', listener);
            },

            /**
             * Attaches a click listener that only fires when the SHIFT key is pressed.
             * @param {function} listener - The callback function.
             * @param {object} [options] - Additional event options.
             */
            shiftClickify: function(listener)
            {
                this.clickify(listener, (arguments[1] || {}).patch({ masks: SHIFT }));
            },

            /**
             * Attaches a click listener that only fires when the CTRL key is pressed.
             * @param {function} listener - The callback function.
             * @param {object} [options] - Additional event options.
             */
            ctrlClickify: function(listener)
            {
                this.clickify(listener, (arguments[1] || {}).patch({ masks: CTRL }));
            },

            /**
             * Attaches a click listener that only fires when the ALT key is pressed.
             * @param {function} listener - The callback function.
             * @param {object} [options] - Additional event options.
             */
            altClickify: function(listener)
            {
                this.clickify(listener, (arguments[1] || {}).patch({ masks: ALT }));
            },

            /**
             * Attaches a click listener that only fires when the META key (Cmd/Windows) is pressed.
             * @param {function} listener - The callback function.
             * @param {object} [options] - Additional event options.
             */
            metaClickify: function(listener)
            {
                this.clickify(listener, (arguments[1] || {}).patch({ masks: META }));
            },

            /**
             * Attaches a listener for right-click events.
             * Optionally prevents the context menu from appearing.
             * @param {function} listener - The callback function.
             * @param {object} [options] - Event options, including 'prevent' for context menu.
             */
            rightClickify: function(listener)
            {
                this.listen('mousedown', listener, (arguments[1] || {}).patch({ keys: RIGHT_CLICK }));
                if (arguments[1] && arguments[1].prevent)
                {
                    // Prevent default context menu if 'prevent' is true.
                    this.listen('contextmenu', function(event) {}, arguments[1]);
                }
            },

            /**
             * Removes right-click event listeners.
             * @param {function} listener - The specific listener to remove.
             */
            unRightClickify: function(listener)
            {
                this.stopListening('mousedown', listener);
                this.stopListening('contextmenu');
            },

            /**
             * Attaches a keypress listener, filtered by specific keys.
             * @param {string|Array<string>} keys - The key(s) to listen for.
             * @param {function} listener - The callback function.
             * @param {object} [options] - Additional event options.
             */
            keyPressify: function(keys, listener)
            {
                this.listen('keypress', listener, (arguments[2] || {}).patch({ keys: keys }));
            },

            /**
             * Removes keypress event listeners.
             * @param {function} listener - The specific listener to remove.
             */
            unKeyPressify: function(listener)
            {
                this.stopListening('keypress', listener);
            }
        }
    },

    /**
     * Basic Event Handling for Elements.
     * Provides direct access to the `Event.listen` and `Event.stopListening` methods.
     */
    Element: {
        /**
         * Attaches an event listener to the element.
         * @param {string} event - The event name.
         * @param {function} listener - The callback function.
         * @param {object} [options] - Event options.
         */
        listen: function(event, listener)
        {
            Event.listen(this, event, listener, arguments[2]);
        },

        /**
         * Removes event listeners from the element.
         * @param {string} [event] - Optional: The specific event type.
         * @param {function} [listener] - Optional: The specific listener function.
         */
        stopListening: function()
        {
            Event.stopListening(this, arguments[0], arguments[1]);
        }
    }
};


// --- CSS Extensions Module ---

var CSS =
{
    /**
     * Element-specific CSS utility methods.
     * These methods modify or query an element's CSS classes.
     */
    Element: {
        /**
         * Checks if an element has a specific CSS class.
         * @param {string} className - The class name to check for.
         * @returns {boolean} True if the element has the class, false otherwise.
         */
        hasClass: function(className)
        {
            return (this.className.match(new RegExp("(^|\\s+)" + className + "(\\s+|$)"))) ? true : false;
        },

        /**
         * Adds a CSS class to an element.
         * @param {string} className - The class name to add.
         */
        addClass: function(className)
        {
            this.className += " " + className;
        },

        /**
         * Removes a CSS class from an element.
         * @param {string} className - The class name to remove.
         */
        removeClass: function(className)
        {
            // Uses regex to ensure whole word match and handles leading/trailing spaces.
            this.className = this.className.replace(new RegExp("(^|\\s+)" + className + "(\\s+|$)", 'g'), '');
        },

        /**
         * Toggles a CSS class on an element. Adds it if not present, removes it if present.
         * @param {string} className - The class name to toggle.
         */
        toggleClass: function(className)
        {
            (this.hasClass(className)) ? this.removeClass(className) : this.addClass(className);
        }
    }
};


// --- DOM Extensions Module ---

var DOM =
{
    /**
     * Element-specific DOM utility methods.
     * These methods query relationships between DOM elements.
     */
    Element: {
        /**
         * Checks if the current element is a direct child of the specified element.
         * @param {HTMLElement|string} element - The parent element or its ID.
         * @returns {boolean} True if it's a child, false otherwise.
         */
        childOf: function(element)
        {
            return this.parentNode == $(element);
        },

        /**
         * Checks if the current element is a direct parent of the specified element.
         * @param {HTMLElement|string} element - The child element or its ID.
         * @returns {boolean} True if it's a parent, false otherwise.
         */
        parentOf: function(element)
        {
            return $(element).childOf(this);
        },

        /**
         * Checks if the current element is a sibling of the specified element.
         * @param {HTMLElement|string} element - The potential sibling element or its ID.
         * @returns {boolean} True if they are siblings, false otherwise.
         */
        siblingOf: function(element)
        {
            return $(element).childOf(this.parentNode);
        },

        /**
         * Checks if the current element is a descendant of the specified element (any level down).
         * This is a recursive function.
         * @param {HTMLElement|string} element - The potential ancestor element or its ID.
         * @returns {boolean} True if it's a descendant, false otherwise.
         */
        descendantOf: function(element)
        {
            return (!this.parentNode)
                   ? false
                   : (this.childOf(element))
                     ? true
                     : $(this.parentNode).descendantOf(element);
        },

        /**
         * Checks if the current element is an ancestor of the specified element (any level up).
         * @param {HTMLElement|string} element - The potential descendant element or its ID.
         * @returns {boolean} True if it's an ancestor, false otherwise.
         */
        ancestorOf: function(element)
        {
            return $(element).descendantOf(this);
        },

        // Placeholder for a CSS selector method.
        // This would typically find elements matching a CSS selector within the current element.
        select: function(selector)
        {
            // Implementation for selecting elements by CSS selector would go here.
        },

        // Placeholder for a CSS selector method.
        getElementsBySelector: function(selector)
        {
            // Implementation for selecting elements by CSS selector would go here.
        },

        /**
         * Retrieves all descendant elements of the current element that have a specific CSS class.
         * This method is inspired by Prototype.js.
         * @param {string} className - The CSS class name to search for.
         * @returns {Array<HTMLElement>} An array of matching elements.
         */
        getElementsByClass: function(className)
        {
            var elements = this.getElementsByTagName("*"); // Get all descendants.
            var keepers  = [];                             // Array to hold matching elements.
            for (var i = 0; i < elements.length; i++)
            {
                if ($(elements[i]).hasClass(className))
                {
                    keepers.push(elements[i]);
                }
            }
            return keepers;
        }
    }
};


// --- AJAX Handling Module ---

var Ajax =
{
    /**
     * Factory for creating AJAX send objects.
     * Handles the lifecycle of an XMLHttpRequest.
     */
    Send: {
        /**
         * Initializes an Ajax.Send object.
         * @param {string} url - The URL to send the AJAX request to.
         * @param {object} [options] - Configuration options for the AJAX request.
         * @param {string} [options.method='POST'] - HTTP method (e.g., 'GET', 'POST').
         * @param {function} [options.onCreate] - Callback for readyState 0.
         * @param {function} [options.onSetup] - Callback for readyState 1.
         * @param {function} [options.onSend] - Callback for readyState 2.
         * @param {function} [options.onLoading] - Callback for readyState 3.
         * @param {function} [options.onProgress] - Callback for progress events.
         * @param {function} [options.onComplete] - Callback for readyState 4 (success).
         * @param {function} [options.onError] - Callback for readyState 4 (error).
         */
        init: function(url)
        {
            this.patch(
                {
                    method: 'POST',
                    onCreate: Mithril.empty,
                    onSetup: Mithril.empty,
                    onSend: Mithril.empty,
                    onLoading: Mithril.empty,
                    onProgress: Mithril.empty,
                    onComplete: Mithril.empty,
                    onError: Mithril.empty
                },
                arguments[1] || {}
            );

            // Create XMLHttpRequest object, handling IE's ActiveXObject.
            this.request = (Mithril.browser == 'MSIE' && Mithril.version != 7)
                           ? new ActiveXObject("Microsoft.XMLHTTP")
                           : new XMLHttpRequest();

            // Bind event handlers to the XMLHttpRequest.
            this.request.onreadystatechange = this.onReadyStateChange.bind(this);
            this.request.onprogress         = this.onProgress;
        },

        /**
         * Handles changes in the XMLHttpRequest's readyState.
         * Dispatches to the appropriate callback function based on the state.
         */
        onReadyStateChange: function()
        {
            this.wrap(
                (this.request.readyState == 0)
                ? this.onCreate
                : (this.request.readyState == 1)
                  ? this.onSetup
                  : (this.request.readyState == 2)
                    ? this.onSend
                    : (this.request.readyState == 3)
                      ? this.onLoading
                      : (this.request.readyState == 4 && this.request.status == 200)
                        ? this.onComplete
                        : this.onError
            )(this.request);
        },

        /**
         * Wraps a handler function to ensure it's called with the correct context and error handling.
         * @param {function} handler - The callback function to wrap.
         * @returns {function} The wrapped function.
         */
        wrap: function(handler)
        {
            return function()
            {
                try
                {
                    handler.apply(this.request, arguments);
                }
                catch (e)
                {
                    throw (e);
                }
            };
        }
    }.factory(), // Create an instance using the factory.

    /**
     * Element-specific AJAX utility methods.
     */
    Element: {
        // Placeholder for an AJAX update method.
        // This method would typically fetch content via AJAX and update the element's innerHTML.
        update: function()
        {
            // Implementation for updating element content via AJAX would go here.
        }
    }
};

// --- Global Key Code and Mouse Click Constants ---
// These variables store common key codes and mouse button identifiers.
// Keyboard codes are prepended with 'k' to distinguish them from numeric values.

var BACKSPACE   = 'k8';
var TAB         = 'k9';
var ENTER       = 'k13';
var SHIFT       = 'k16';
var CTRL        = 'k17';
var ALT         = 'k18';
var META        = 'META'; // Note: META doesn't use 'k' prefix as it's a property, not a keyCode.
var PAUSE_BREAK = 'k19';
var CAPS        = 'k20';
var ESC         = 'k27';
var PAGE_UP     = 'k33';
var PAGE_DOWN   = 'k34';
var END         = 'k35';
var HOME        = 'k36';
var LEFT        = 'k37';
var RIGHT       = 'k39';
var UP          = 'k38';
var DOWN        = 'k40';
var INSERT      = 'k45';
var DELETE      = 'k46';

// Numpad keys
var NUM_0 = 'k96';
var NUM_1 = 'k97';
var NUM_2 = 'k98';
var NUM_3 = 'k99';
var NUM_4 = 'k100';
var NUM_5 = 'k101';
var NUM_6 = 'k102';
var NUM_7 = 'k103';
var NUM_8 = 'k104';
var NUM_9 = 'k105';

// Function keys
var F1  = 'k112';
var F2  = 'k113';
var F3  = 'k114';
var F4  = 'k115';
var F5  = 'k116';
var F6  = 'k117';
var F7  = 'k118';
var F8  = 'k119';
var F9  = 'k120';
var F10 = 'k121';
var F11 = 'k122';
var F12 = 'k123';

var NUM    = 'k144'; // Num Lock
var SCROLL = 'k145'; // Scroll Lock

// Mouse click identifiers
var LEFT_CLICK   = 'left';
var RIGHT_CLICK  = 'right';
var CENTER_CLICK = 'center';

// End of Mithril.js core.