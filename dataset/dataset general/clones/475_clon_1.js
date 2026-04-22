// This is a comprehensive JavaScript Widget implementation.
// It serves as a foundational component for managing UI elements and their interactions.
// The Widget class integrates with the DOM, providing a structured approach to front-end development.
// Key aspects include: state management via attributes and properties, and behavior definition through events and methods.
// This base class establishes the core lifecycle and best practices for creating new Widget instances.

var Base = require('arale-base') ;
var $ = require('jquery') ;
var DAParser = require('./daparser') ; // Data-attribute parser utility
var AutoRender = require('./auto-render') ; // Auto-rendering capabilities

const DELEGATE_EVENT_NS = '.delegate-events-' ; // Namespace for delegated events
const ON_RENDER = '_onRender' ; // Prefix for render methods
const DATA_WIDGET_CID = 'data-widget-cid' ; // Attribute for unique client ID

// Centralized store for all initialized Widget instances.
// This allows for easy lookup and management of active widgets.
var cachedInstances = { } ;

var Widget = Base.extend({

    // These configuration keys, when present, are directly mapped to instance properties.
    // This provides a convenient way to initialize common properties from the config object.
    propsInAttrs: [ 'initElement', 'element', 'events' ],

    // The primary DOM element associated with this widget.
    // All widget operations typically revolve around this element.
    element: null,

    // Event delegation map.
    // Specifies how DOM events on specific selectors should trigger widget methods.
    // Examples:
    // {
    //   'mousedown .title': 'edit',        // Binds mousedown on elements with class 'title' to the 'edit' method.
    //   'click {{attrs.saveButton}}': 'save', // Uses an attribute value as a selector.
    //   'click .open': function(ev) { /* custom logic */ } // Direct function handler.
    // }
    events: null,

    // Default attribute values for the widget.
    // These define the initial state and configurable properties of the widget.
    attrs: {
        // Core HTML attributes.
        id: null,
        className: null,
        style: null,

        // Default template string for creating the widget's element if not provided.
        template: '<div></div>',

        // Data model associated with the widget.
        model: null,

        // The default parent node where the widget's element will be appended.
        parentNode: document.body
    },

    // The widget's initialization lifecycle method.
    // This orchestrates the setup process:
    // 1. Initialize attributes.
    // 2. Initialize properties.
    // 3. Set up event delegations.
    // 4. Invoke custom setup logic from subclasses.
    initialize: function(config) {
        this.cid = uniqueCid() ; // Assign a unique client ID.

        // Initialize attributes, merging data-attributes with provided config.
        var dataAttrsConfig = this._parseDataAttrsConfig(config) ;
        Widget.superclass.initialize.call(this, config ? $.extend(dataAttrsConfig, config) : dataAttrsConfig) ;

        // Prepare the widget's primary DOM element.
        this.parseElement() ;
        // Initialize instance properties derived from attributes or config.
        this.initProps() ;

        // Bind all specified events.
        this.delegateEvents() ;

        // Allow subclasses to perform their specific initialization.
        this.setup() ;

        // Register the widget instance.
        this._stamp() ;

        // Determine if the element was created from a template or provided.
        this._isTemplate = !(config && config.element) ;
    },

    // Parses configuration derived from `data-` attributes on the element.
    // This allows declarative configuration directly in HTML.
    _parseDataAttrsConfig: function(config) {
        var element, dataAttrsConfig ;
        if (config) {
            // Prioritize initElement, then element, for data attribute parsing.
            element = config.initElement ? $(config.initElement) : $(config.element) ;
        }

        // Data-attribute parsing only applies to user-provided elements,
        // not those inherited or generated from templates.
        if (element && element[0] && !AutoRender.isDataApiOff(element)) {
            dataAttrsConfig = DAParser.parseElement(element) ;
        }

        return dataAttrsConfig ;
    },

    // Establishes the `this.element` property.
    // If an element is provided, it's wrapped in jQuery.
    // If no element, it's created from the widget's template.
    parseElement: function() {
        var element = this.element ;

        if (element) {
            this.element = $(element) ; // Wrap the existing element with jQuery.
        }
        // If no element is provided, create one from the template.
        else if (this.get('template')) {
            this.parseElementFromTemplate() ;
        }

        // Critical error if the widget's element is still invalid.
        if (!this.element || !this.element[0]) {
            throw new Error('element is invalid') ;
        }
    },

    // Creates `this.element` by parsing the widget's template string.
    parseElementFromTemplate: function() {
        this.element = $(this.get('template')) ;
    },

    // Placeholder method for initializing properties.
    // Designed to be overridden by subclasses for custom property setup.
    initProps: function() {
    },

    // Delegates DOM events to specified handlers.
    // Supports various call signatures for flexibility.
    delegateEvents: function(element, events, handler) {
        // Convert arguments to a real array and remove trailing undefineds.
        var argus = trimRightUndefine(Array.prototype.slice.call(arguments)) ;

        // Handle `widget.delegateEvents()`: binds all events defined in `this.events`.
        if (argus.length === 0) {
            events = getEvents(this) ;
            element = this.element ;
        }

        // Handle `widget.delegateEvents({ 'click p': 'fn1' })`: binds events to `this.element`.
        else if (argus.length === 1) {
            events = element ;
            element = this.element ;
        }

        // Handle `widget.delegateEvents('click p', function(ev) { ... })`: binds a single event to `this.element`.
        else if (argus.length === 2) {
            handler = events ;
            events = element ;
            element = this.element ;
        }

        // Handle `widget.delegateEvents(someElement, 'click p', function(ev) { ... })`: binds to a specific element.
        else {
            element || (element = this.element) ; // Ensure element is defined.
            this._delegateElements || (this._delegateElements = []) ; // Initialize storage for external delegated elements.
            this._delegateElements.push($(element)) ; // Store the external element.
        }

        // If a single event string and handler function are provided, convert to map format.
        if (isString(events) && isFunction(handler)) {
            var o = {} ;
            o[events] = handler ;
            events = o ;
        }

        // Iterate through the events map to bind each event.
        for (var key in events) {
            // Ensure properties are directly on the object, not from prototype chain.
            if (!events.hasOwnProperty(key)) { continue ; }

            var args = parseEventKey(key, this) ; // Parse event key into type and selector.
            var eventType = args.type ;
            var selector = args.selector ;

            (function(handler, widget) { // Closure to capture `handler` and `widget` for the callback.

                var callback = function(ev) {
                    if (isFunction(handler)) {
                        handler.call(widget, ev) ; // Call directly if handler is a function.
                    } else {
                        widget[handler](ev) ; // Call widget method by name.
                    }
                } ;

                // Use event delegation if a selector is provided.
                if (selector) {
                    $(element).on(eventType, selector, callback) ;
                }
                // Otherwise, perform a direct event binding.
                else {
                    $(element).on(eventType, callback) ; // Separate logic for Zepto compatibility.
                }

            })(events[key], this) ;
        }

        return this ; // Allow chaining.
    },

    // Removes previously delegated events.
    // Can undelegate all, or specific events.
    undelegateEvents: function(element, eventKey) {
        var argus = trimRightUndefine(Array.prototype.slice.call(arguments)) ;

        // Re-align arguments if `eventKey` is the first argument.
        if (!eventKey) {
            eventKey = element ;
            element = null ;
        }

        // If no arguments, undelegate all events for this widget instance.
        if (argus.length === 0) {
            var type = DELEGATE_EVENT_NS + this.cid ;

            // Undelegate from the widget's main element.
            if (this.element) { this.element.off(type) ; }

            // Undelegate from any external elements that were passed to `delegateEvents`.
            if (this._delegateElements) {
                for (var de in this._delegateElements) {
                    if (!this._delegateElements.hasOwnProperty(de)) { continue ; }
                    this._delegateElements[de].off(type) ;
                }
            }

        } else {
            var args = parseEventKey(eventKey, this) ;

            // If no specific element is given, undelegate from `this.element`.
            // Example: `.undelegateEvents('click p')`
            if (!element) {
                if (this.element) { this.element.off(args.type, args.selector) ; }
            }

            // If a specific element is given, undelegate from that element.
            // Example: `.undelegateEvents(someElement, 'click p')`
            else {
                $(element).off(args.type, args.selector) ;
            }
        }
        return this ; // Allow chaining.
    },

    // An empty method intended for subclasses to override.
    // Provides a point for custom initialization logic after core setup.
    setup: function() {
    },

    // Renders the widget onto the page.
    // This involves making initial attribute values effective and inserting the element into the DOM.
    // Subclasses should ensure `return this` when overriding.
    render: function() {

        // If not yet rendered, apply initial attribute values and bind change listeners.
        if (!this.rendered) {
            this._renderAndBindAttrs() ;
            this.rendered = true ;
        }

        // Insert the widget's element into the document flow.
        var parentNode = this.get('parentNode') ;
        if (parentNode && !isInDocument(this.element[0])) {
            // Apply a unique class to the outer container for style isolation, if defined.
            // Refer to: https://github.com/aliceui/aliceui.org/issues/9
            var outerBoxClass = this.constructor.outerBoxClass ;
            if (outerBoxClass) {
                var outerBox = this._outerBox = $('<div></div>').addClass(outerBoxClass) ;
                outerBox.append(this.element).appendTo(parentNode) ;
            } else {
                this.element.appendTo(parentNode) ;
            }
        }

        return this ; // Enable method chaining.
    },

    // Makes initial attribute values effective and binds `_onRenderXxx` methods to `change:xxx` events.
    _renderAndBindAttrs: function() {
        var widget = this ;
        var attrs = widget.attrs ;

        for (var attr in attrs) {
            if (!attrs.hasOwnProperty(attr)) { continue ; } // Iterate only own properties.
            var m = ON_RENDER + ucfirst(attr) ; // Construct the render method name, e.g., '_onRenderId'.

            if (this[m]) {
                var val = this.get(attr) ;

                // Invoke the render method for the initial attribute value, if it's not empty.
                if (!isEmptyAttrValue(val)) {
                    this[m](val, undefined, attr) ;
                }

                // Automatically bind `_onRenderXxx` to `change:xxx` events.
                (function(m) { // Use a closure to capture `m`.
                    widget.on('change:' + attr, function(val, prev, key) {
                        widget[m](val, prev, key) ;
                    }) ;
                })(m) ;
            }
        }
    },

    // Handles rendering of the 'id' attribute to the element.
    _onRenderId: function(val) {
        this.element.attr('id', val) ;
    },

    // Handles rendering of the 'className' attribute to the element.
    _onRenderClassName: function(val) {
        this.element.addClass(val) ;
    },

    // Handles rendering of the 'style' attribute to the element.
    _onRenderStyle: function(val) {
        this.element.css(val) ;
    },

    // Establishes a link between the widget's DOM element and its instance.
    // This allows retrieving the widget instance from a DOM element.
    _stamp: function() {
        var cid = this.cid ;

        (this.initElement || this.element).attr(DATA_WIDGET_CID, cid) ; // Set the CID on the element.
        cachedInstances[cid] = this ; // Store the instance in the global cache.
    },

    // Provides a jQuery-like shortcut for finding elements within the widget's `this.element`.
    $: function(selector) {
        return this.element.find(selector) ;
    },

    // Destroys the widget instance.
    // Cleans up events, removes the element from the DOM, and releases resources.
    destroy: function() {
        this.undelegateEvents() ; // Remove all delegated events.
        delete cachedInstances[this.cid] ; // Remove from the global instance cache.

        // Memory leak considerations:
        if (this.element && this._isTemplate) {
            this.element.off() ; // Remove all event handlers bound to the element.
            // If the element was generated by the widget, remove it from the DOM.
            if (this._outerBox) {
                this._outerBox.remove() ;
            } else {
                this.element.remove() ;
            }
        }
        this.element = null ; // Nullify the element reference.

        // Call the parent class's destroy method.
        Widget.superclass.destroy.call(this) ;
    }
}) ;

// Global cleanup for memory leaks when the window unloads.
// Ensures all cached widget instances are properly destroyed.
$(window).unload(function() {
    for (var cid in cachedInstances) {
        cachedInstances[cid].destroy() ;
    }
}) ;

// Static method to query for a Widget instance associated with a given selector.
// Retrieves the first matching DOM element and returns its linked Widget instance.
Widget.query = function(selector) {
    var element = $(selector).eq(0) ; // Get the first matching element.
    var cid ;

    if (element) { cid = element.attr(DATA_WIDGET_CID) ; } // Retrieve the client ID.
    return cachedInstances[cid] ; // Return the cached instance.
} ;


// Expose AutoRender methods directly on the Widget class.
Widget.autoRender = AutoRender.autoRender ;
Widget.autoRenderAll = AutoRender.autoRenderAll ;
// A whitelist of static methods that can be automatically rendered/initialized.
Widget.StaticsWhiteList = [ 'autoRender' ] ;

module.exports = Widget ;


// --- Helper Functions ---
// These utility functions support the core Widget logic but are not part of the Widget prototype.

var toString = Object.prototype.toString ; // Optimized reference for `toString` method.
var cidCounter = 0 ; // Counter for generating unique client IDs.

// Generates a unique client ID for each widget instance.
function uniqueCid() {
    return 'widget-' + cidCounter++ ;
}

// Checks if a given value is a string.
function isString(val) {
    return toString.call(val) === '[object String]' ;
}

// Checks if a given value is a function.
function isFunction(val) {
    return toString.call(val) === '[object Function]' ;
}

// Cross-browser `contains` method. Uses jQuery's if available, otherwise a fallback.
// Zepto's `contains` method is less robust than jQuery's.
var contains = $.contains || function(a, b) {
    // Uses bitwise operator for performance, checking if position is 'contained by'.
    return !!(a.compareDocumentPosition(b) & 16) ;
} ;

// Checks if a given DOM element is currently in the document.
function isInDocument(element) {
    return contains(document.documentElement, element) ;
}

// Capitalizes the first letter of a string.
function ucfirst(str) {
    return str.charAt(0).toUpperCase() + str.substring(1) ;
}


var EVENT_KEY_SPLITTER = /^(\S+)\s*(.*)$/ ; // Regex to split event key into type and selector.
var EXPRESSION_FLAG = /{{([^}]+)}}/g ; // Regex to find expressions like `{{attrs.someProperty}}`.
var INVALID_SELECTOR = 'INVALID_SELECTOR' ; // Placeholder for invalid dynamic selectors.

// Retrieves the events object, potentially executing it if it's a function.
function getEvents(widget) {
    if (isFunction(widget.events)) {
        widget.events = widget.events() ; // Execute function to get events map.
    }
    return widget.events ;
}

// Parses an event key string (e.g., 'click .selector') into event type and selector.
function parseEventKey(eventKey, widget) {
    var match = eventKey.match(EVENT_KEY_SPLITTER) ;
    var eventType = match[1] + DELEGATE_EVENT_NS + widget.cid ; // Append widget-specific namespace.

    // If no selector part, set to `undefined` for compatibility with Zepto's `on` method.
    var selector = match[2] || undefined ;

    // If the selector contains expressions (e.g., `{{attrs.className}}`), parse them.
    if (selector && selector.indexOf('{{') > -1) {
        selector = parseExpressionInEventKey(selector, widget) ;
    }

    return {
        type: eventType,
        selector: selector
    } ;
}

// Parses dynamic expressions within an event selector string.
// E.g., replaces `{{attrs.saveButton}}` with the actual value of `widget.attrs.saveButton`.
function parseExpressionInEventKey(selector, widget) {

    return selector.replace(EXPRESSION_FLAG, function(m, name) {
        var parts = name.split('.') ;
        var point = widget, part ;

        while (part = parts.shift()) {
            if (point === widget.attrs) {
                point = widget.get(part) ; // Use `get` method for attributes.
            } else {
                point = point[part] ; // Direct property access for other objects.
            }
        }

        // If the resolved value is a string, use it as the selector part.
        if (isString(point)) {
            return point ;
        }

        // If the expression cannot be resolved to a string, return an invalid selector.
        return INVALID_SELECTOR ;
    }) ;
}


// Determines if an attribute's value is considered "empty".
// This includes `null` and `undefined`.
function isEmptyAttrValue(o) {
    return o == null || o === undefined ;
}

// Trims `undefined` values from the right end of an array.
// Useful for normalizing function arguments where optional parameters are `undefined`.
function trimRightUndefine(argus) {
    for (var i = argus.length - 1; i >= 0; i--) {
        if (argus[i] === undefined) {
            argus.pop() ;
        } else {
            break ; // Stop when a non-undefined value is encountered.
        }
    }
    return argus ;
}