/*******************************************************************************
 * CoreWebEngine.js
 *
 * This robust toolkit empowers developers to build dynamic web applications
 * with ease and efficiency.
 * @author: Matthew Story
 * Rewritten by: AI Assistant
 ******************************************************************************/
var WebEngine = {

    /*
     * A utility function that performs no operation.
     * Useful as a default callback or placeholder.
     */
    doNothing: function() {},

    // Stores the detected client environment name (e.g., 'Firefox', 'Chrome').
    clientEnv: false,

    // Stores the detected client environment version number.
    clientVer: false,

    /*
     * Initializes the WebEngine by detecting the user's browser
     * and its corresponding version.
     */
    initialize: function() {
        var userAgentString = navigator.userAgent;
        this.clientEnv = (userAgentString.match(/Opera/)) ? 'Opera':((userAgentString.match(/MSIE/)) ? 'MSIE':((userAgentString.match(/Safari/)) ? 'Safari':'Firefox'));
        this.clientVer = userAgentString.match(new RegExp(this.clientEnv+'[^0-9]*([0-9]+\\.*[0-9]+)'))[1]/1;
    }
};

// Immediately configure the core engine upon loading.
WebEngine.initialize();

// General-purpose helper functions for browser environment.
function retrieveClientName() { return WebEngine.clientEnv; }
function retrieveClientVersion() { return WebEngine.clientVer; }

// Extensions for the core Object prototype.
Object.prototype.extend = function() {
    for (var i = 0; i < arguments.length; i++) {
        for (var propertyName in arguments[i]) {
            this[propertyName] = arguments[i][propertyName];
        }
    }
    return this;
};

Object.prototype.extend({
    /*
     * Converts the object to a simplified string representation,
     * removing constructor metadata.
     */
    toSerialString: function() {
        return this.toString().replace(/^\(new[^(]*\(|^\(|\)+$/g, '');
    },

    // Transforms an array-like object into a true JavaScript array.
    convertToArray: function() {
        var outputArray = [];
        for (var j = 0; j < this.length; j++) {
            outputArray.push(this[j]);
        }
        return outputArray;
    },

    // Placeholder for asynchronous data transmission.
    transmitData: function() {},

    // Placeholder for data serialization.
    formatData: function() {},

    /*
     * Creates a new class (constructor function) based on provided options,
     * facilitating inheritance and initialization patterns.
     */
    makeInstance: function() {
        var configData = { startup: false, baseType: WebEngine.doNothing, callSuperConstructor: false }.extend(arguments[0] || {});
        configData.startup = (configData.startup) ? ((configData.startup.constructor == String) ? this[configData.startup] : configData.startup) : ((this.startup) ? this.startup : this.initialize);

        // Consider wrapping baseType functions with 'baseType.call(this, args)' for explicit context.
        var ConstructedType = function() {
            if (configData.callSuperConstructor) {
                this.baseType.apply(this, arguments);
            }
            configData.startup.apply(this, arguments);
        };
        ConstructedType.prototype.extend(configData.baseType.prototype, this, { baseType: configData.baseType });
        return ConstructedType;
    }
});

// String manipulation and evaluation utilities.
String.prototype.extend({
    // Parses a JSON string into a JavaScript object.
    decodeJSON: function() {
        return this.interpretCode((arguments[0] || {}).extend({ jsonMode: true }));
    },

    // Executes a JavaScript string.
    runScript: function() {
        return this.interpretCode((arguments[0] || {}).extend({ jsonMode: false }));
    },

    /*
     * Interprets a string as either JSON or JavaScript code.
     * Includes error handling.
     */
    interpretCode: function() {
        var settings = { onFailure: function() {}, jsonMode: false }.extend(arguments[0] || {});
        try {
            eval(((settings.jsonMode) ? 'var parsedObject=' + this : this));
            return (settings.jsonMode) ? parsedObject : true;
        } catch (error) {
            settings.onFailure(error);
            return false;
        }
    }
});

// Array utility methods for common operations.
Array.prototype.extend({
    // Checks if an array contains a specific value.
    includesElement: function(valueToFind) {
        for (var k = 0; k < this.length; k++) {
            if (this[k] == valueToFind) {
                return true;
            }
        }
        return false;
    },

    /*
     * Iterates over each item in the array, executing a provided function.
     * An optional second argument can set the 'this' context for the function.
     */
    forEachItem: function(callbackFunc) {
        for (var l = 0; l < this.length; l++) {
            callbackFunc.apply((arguments[1] || this), [this[l], l]);
        }
    },

    // Returns the first index at which a given element can be found in the array.
    locateElement: function(targetElem) {
        for (var m = 0; m < this.length; m++) {
            if (targetElem == this[m]) {
                return m;
            }
        }
        return -1;
    },

    // Removes the first occurrence of a specified element from the array.
    deleteItem: function(elemToRemove) {
        var position = this.locateElement(elemToRemove);
        if (position != -1) {
            this.splice(position, 1);
        }
    }
});

// Function prototype enhancements.
Function.prototype.extend({
    /*
     * Creates a new function that, when called, has its 'this' keyword
     * set to the provided value.
     */
    attachContext: function(targetObject) {
        var originalFunc = this;
        return function() {
            originalFunc.apply(targetObject, arguments);
        };
    }
});

// Shortcut function to retrieve a DOM element by its ID or return the element itself.
function selectElement(identifier) {
    var domNode = (identifier.constructor == String) ? document.getElementById(identifier) : identifier;
    if (domNode && !domNode.fwInitialized) {
        domNode.extend = Object.prototype.extend;
        domNode.fwInitialized = true;
        return domNode.extend((InteractionHub) ? InteractionHub.DomNodeExtensions : {}, (InteractionHub.EnhancedUtilities) ? InteractionHub.EnhancedUtilities.DomNodeExtensions : {}, (StyleManager) ? StyleManager.DomNodeExtensions : {}, (PageStructure) ? PageStructure.DomNodeExtensions : {}, (HttpService) ? HttpService.DomNodeExtensions : {});
    }
    return domNode;
}

// Manages user interactions and system events.
var InteractionHub = {
    // Factory-generated object for standardizing event data across browsers.
    EventDetails: {
        startup: function(incomingEvent) {
            // Ensure the original event object remains accessible to developers.
            // Then, augment the event object for consistent cross-browser behavior.
            if (this.isKeyActivity(incomingEvent)) {
                this.pressedKey = (incomingEvent.which) ? String.fromCharCode(incomingEvent.charCode) : 'k' + incomingEvent.keyCode;
            }
            if (this.isMouseActivity(incomingEvent)) {
                this.isLeftButton = (incomingEvent.button === 0) ? true : false;
                this.isMiddleButton = (incomingEvent.button === 1) ? true : false;
                this.isRightButton = (incomingEvent.button === 2) ? true : false;
                this.buttonPressed = (this.isLeftButton) ? MOUSE_LEFT_BUTTON : (this.isMiddleButton) ? MOUSE_MIDDLE_BUTTON : MOUSE_RIGHT_BUTTON;
            }
            incomingEvent.stopPropagation = (incomingEvent.stopPropagation || function() { this.cancelCapture = true; this.cancelBubble = true; });
        },

        // Determines if the event is a mouse-related action.
        isMouseActivity: function(e) {
            return ((e || this).type == 'click' || (e || this).type == 'mousedown' || (e || this).type == 'mouseup');
        },

        // Determines if the event is a keyboard-related action.
        isKeyActivity: function(e) {
            return ((e || this).type == 'keypress' || (e || this).type == 'keydown' || (e || this).type == 'keyup');
        }
    }.makeInstance(),

    // Array to store all currently registered event handlers.
    registeredHandlers: [],

    /*
     * Attaches an event listener to a DOM element.
     * Supports additional options for event customization.
     */
    registerHandler: function(domEl, eventType, callback) {
        var wrappedCallback = this.createWrapper(callback.attachContext(domEl), arguments[3]);
        this.registeredHandlers.push({ domEl: domEl, callback: callback, wrapper: wrappedCallback, eventType: eventType });
        if (WebEngine.clientEnv == 'MSIE') {
            domEl.attachEvent('on' + eventType, wrappedCallback);
        } else {
            domEl.addEventListener(eventType, wrappedCallback, false);
        }
    },

    /*
     * Removes event listeners from a DOM element.
     * Can target specific event types or callbacks.
     */
    unregisterHandler: function(domEl) {
        var matchingListeners = this.getActiveListeners(domEl, (arguments[1] || false), (arguments[2] || false));
        for (var n = 0; n < matchingListeners.length; n++) {
            if (WebEngine.clientEnv == 'MSIE') {
                domEl.detachEvent('on' + matchingListeners[1].eventType, matchingListeners[n].wrapper);
            } else {
                domEl.removeEventListener(matchingListeners[n].eventType, matchingListeners[n].wrapper, false);
            }
        }
    },

    /*
     * Creates a wrapper function for an event listener to handle
     * cross-browser compatibility and option-based filtering.
     */
    createWrapper: function(originalListener) {
        var listenerConfig = new InteractionHub.ListenerConfig(arguments[1]);
        return function(nativeEvent) {
            // Normalize the event object for Internet Explorer.
            if (WebEngine.clientEnv == 'MSIE') {
                nativeEvent = document.createEventObject().extend = Object.prototype.extend;
            }
            var processedEvent = nativeEvent.extend(new InteractionHub.EventDetails(nativeEvent));
            if (!processedEvent || (
                (!processedEvent.isMouseActivity() || !listenerConfig.keyConditions.length || processedEvent.buttonPressed == listenerConfig.keyConditions[0]) &&
                ((!processedEvent.isKeyActivity()) || !listenerConfig.keyConditions.length || listenerConfig.keyConditions.includesElement(processedEvent.pressedKey)) &&
                (!listenerConfig.modifierMasks.includesElement(MODIFIER_META) || processedEvent.metaKey) &&
                (!listenerConfig.modifierMasks.includesElement(MODIFIER_SHIFT) || processedEvent.shiftKey) &&
                (!listenerConfig.modifierMasks.includesElement(MODIFIER_CTRL) || processedEvent.ctrlKey) &&
                (!listenerConfig.modifierMasks.includesElement(MODIFIER_ALT) || processedEvent.altKey)
            )) {
                var userReturn = originalListener(processedEvent);
                if (listenerConfig.preventStandard) {
                    processedEvent.stopPropagation();
                    return false;
                }
                return userReturn;
            }
        };
    },

    /*
     * Retrieves and removes matching listeners from the internal registry.
     */
    getActiveListeners: function(domEl, eventType, callback) {
        var currentHandlers = [];
        var foundMatches = [];
        for (var p = 0; p < this.registeredHandlers.length; p++) {
            if (domEl == this.registeredHandlers[p].domEl && (!eventType || this.registeredHandlers[p].eventType == eventType) && (!callback || this.registeredHandlers[p].callback == callback)) {
                foundMatches.push(this.registeredHandlers[p]);
            } else {
                currentHandlers.push(this.registeredHandlers[p]);
            }
        }
        this.registeredHandlers = currentHandlers;
        return foundMatches;
    },

    // Configuration options for event listeners.
    ListenerConfig: {
        keyConditions: [],
        modifierMasks: [],
        preventStandard: false,
        startup: function() {
            this.extend(arguments[0] || {});
            this.keyConditions = (this.keyConditions.constructor == Array) ? this.keyConditions : [this.keyConditions];
            this.modifierMasks = (this.modifierMasks.constructor == Array) ? this.modifierMasks : [this.modifierMasks];
        }
    }.makeInstance(),

    // Advanced event handling features for DOM elements.
    EnhancedUtilities: {
        DomNodeExtensions: {
            // Adds a 'load' event listener.
            onLoad: function(handler) { this.registerHandler('load', handler, arguments[1]); },

            // Adds a 'click' event listener with options.
            onClick: function(handler) {
                var config = new InteractionHub.ListenerConfig(arguments[1]);
                if (config.keyConditions.includesElement(MOUSE_RIGHT_BUTTON)) {
                    this.onRightClick(handler, config);
                    return;
                }
                this.registerHandler('click', handler, config);
            },

            // Removes a 'click' event listener.
            offClick: function(handler) { this.unregisterHandler('click', handler); },

            // Adds a click listener requiring the SHIFT key.
            onShiftClick: function(handler) { this.onClick(handler, (arguments[1] || {}).extend({ modifierMasks: MODIFIER_SHIFT })); },

            // Adds a click listener requiring the CTRL key.
            onCtrlClick: function(handler) { this.onClick(handler, (arguments[1] || {}).extend({ modifierMasks: MODIFIER_CTRL })); },

            // Adds a click listener requiring the ALT key.
            onAltClick: function(handler) { this.onClick(handler, (arguments[1] || {}).extend({ modifierMasks: MODIFIER_ALT })); },

            // Adds a click listener requiring the META key.
            onMetaClick: function(handler) { this.onClick(handler, (arguments[1] || {}).extend({ modifierMasks: MODIFIER_META })); },

            // Adds a right-click listener.
            onRightClick: function(handler) {
                this.registerHandler('mousedown', handler, (arguments[1] || {}).extend({ keyConditions: MOUSE_RIGHT_BUTTON }));
                if (arguments[1] && arguments[1].preventStandard) {
                    this.registerHandler('contextmenu', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                    }, arguments[1]);
                }
            },

            // Removes a right-click listener.
            offRightClick: function(handler) {
                this.unregisterHandler('mousedown', handler);
                this.unregisterHandler('contextmenu');
            },

            // Adds a keypress listener for specific keys.
            onKeyPress: function(keys, handler) { this.registerHandler('keypress', handler, (arguments[2] || {}).extend({ keyConditions: keys })); },

            // Removes a keypress listener.
            offKeyPress: function(handler) { this.unregisterHandler('keypress', handler); }
        }
    },

    // Basic event handling for individual DOM elements.
    DomNodeExtensions: {
        // Attaches an event handler to the current element.
        registerHandler: function(eventType, handler) { InteractionHub.registerHandler(this, eventType, handler, arguments[2]); },

        // Removes an event handler from the current element.
        unregisterHandler: function() { InteractionHub.unregisterHandler(this, arguments[0], arguments[1]); }
    }
};

// Manages CSS classes and styles for DOM elements.
var StyleManager = {
    DomNodeExtensions: {
        // Checks if the element has a specific CSS class.
        hasCssClass: function(classNameToCheck) {
            return (this.className.match(new RegExp("(^|\\s+)" + classNameToCheck + "(\\s+|$)"))) ? true : false;
        },

        // Adds a CSS class to the element.
        addCssClass: function(classToAdd) {
            this.className += " " + classToAdd;
        },

        // Removes a CSS class from the element.
        removeCssClass: function(classToRemove) {
            this.className = this.className.replace(new RegExp("(^|\\s+)" + classToRemove + "(\\s+|$)", 'g'), '');
        },

        // Toggles a CSS class on the element (adds if not present, removes if present).
        toggleCssClass: function(classToToggle) {
            (this.hasCssClass(classToToggle)) ? this.removeCssClass(classToToggle) : this.addCssClass(classToToggle);
        }
    }
};

// Provides utilities for navigating and manipulating the Document Object Model.
var PageStructure = {
    DomNodeExtensions: {
        // Determines if the current element is a child of another specified element.
        isChildOf: function(potentialParent) { return this.parentNode == selectElement(potentialParent); },

        // Determines if the current element is a parent of another specified element.
        isParentOf: function(potentialChild) { return selectElement(potentialChild).isChildOf(this); },

        // Determines if the current element is a sibling of another specified element.
        hasSameParent: function(potentialSibling) { return selectElement(potentialSibling).isChildOf(this.parentNode); },

        /*
         * Checks if the current element is a descendant of another element
         * (recursively checks parents).
         */
        nestedWithin: function(potentialAncestor) {
            return (!this.parentNode) ? false : (this.isChildOf(potentialAncestor)) ? true : selectElement(this.parentNode).nestedWithin(potentialAncestor);
        },

        // Checks if the current element is an ancestor of another element.
        isAncestorOf: function(potentialDescendant) { return selectElement(potentialDescendant).nestedWithin(this); },

        // Placeholder for selecting elements using a CSS selector.
        querySelector: function(cssSelector) {

        },

        // Placeholder for retrieving elements by CSS selector.
        queryBySelector: function(cssSelector) {

        },

        /*
         * Retrieves all descendant elements with a given CSS class.
         * Heavily influenced by Sam Stephenson's Prototype library.
         */
        queryByClass: function(classNameToFind) {
            var allElements = this.getElementsByTagName("*");
            var filteredElements = [];
            for (var q = 0; q < allElements.length; q++) {
                if (selectElement(allElements[q]).hasCssClass(classNameToFind)) {
                    filteredElements.push(allElements[q]);
                }
            }
            return filteredElements;
        },
    }
};

// Handles asynchronous HTTP requests (AJAX).
var HttpService = {
    // Factory-generated object for managing AJAX request lifecycle.
    RequestSender: {
        startup: function(requestUrl) {
            this.extend({ onMethod: 'POST', onStart: WebEngine.doNothing, onPrepare: WebEngine.doNothing, onDispatch: WebEngine.doNothing, onLoading: WebEngine.doNothing, onCompletion: WebEngine.doNothing, onFailure: WebEngine.doNothing }, arguments[1] || {});
            this.xhrObject = (WebEngine.clientEnv == 'MSIE' && WebEngine.clientVer != 7) ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
            this.xhrObject.onreadystatechange = this.readyStateMonitor.attachContext(this);
            this.xhrObject.onprogress = this.onLoading;
        },

        // Monitors the XMLHttpRequest readyState and dispatches appropriate callbacks.
        readyStateMonitor: function() {
            var currentHandler = (this.xhrObject.readyState == 0) ? this.onStart :
                                 (this.xhrObject.readyState == 1) ? this.onPrepare :
                                 (this.xhrObject.readyState == 2) ? this.onDispatch :
                                 (this.xhrObject.readyState == 3) ? this.onLoading :
                                 (this.xhrObject.readyState == 4 && this.xhrObject.status == 200) ? this.onCompletion :
                                 this.onFailure;
            this.createCallbackWrapper(currentHandler)(this.xhrObject);
        },

        // Wraps a handler function to catch potential errors during execution.
        createCallbackWrapper: function(handlerFunction) {
            return function() {
                try {
                    handlerFunction.apply(this.xhrObject, arguments);
                } catch (err) {
                    throw (err);
                }
            };
        }
    }.makeInstance(),

    // AJAX-related extensions for DOM elements.
    DomNodeExtensions: {
        // Placeholder for performing an AJAX request and updating element's innerHTML.
        updateContent: function() {

        }
    }
};

// Global constants for keyboard key codes, prefixed to avoid conflicts.
var KEY_BACKSPACE = 'k8';
var KEY_TAB = 'k9';
var KEY_ENTER = 'k13';
var MODIFIER_SHIFT = 'k16';
var MODIFIER_CTRL = 'k17';
var MODIFIER_ALT = 'k18';
var MODIFIER_META = 'META'; // Meta key (Command on Mac, Windows key on PC)
var KEY_PAUSE_BREAK = 'k19';
var KEY_CAPS_LOCK = 'k20';
var KEY_ESCAPE = 'k27';
var KEY_PAGE_UP = 'k33';
var KEY_PAGE_DOWN = 'k34';
var KEY_END = 'k35';
var KEY_HOME = 'k36';
var KEY_ARROW_LEFT = 'k37';
var KEY_ARROW_RIGHT = 'k39';
var KEY_ARROW_UP = 'k38';
var KEY_ARROW_DOWN = 'k40';
var KEY_INSERT = 'k45';
var KEY_DELETE = 'k46';
var KEY_NUMPAD_0 = 'k96';
var KEY_NUMPAD_1 = 'k97';
var KEY_NUMPAD_2 = 'k98';
var KEY_NUMPAD_3 = 'k99';
var KEY_NUMPAD_4 = 'k100';
var KEY_NUMPAD_5 = 'k101';
var KEY_NUMPAD_6 = 'k102';
var KEY_NUMPAD_7 = 'k103';
var KEY_NUMPAD_8 = 'k104';
var KEY_NUMPAD_9 = 'k105';
var KEY_F1 = 'k112';
var KEY_F2 = 'k113';
var KEY_F3 = 'k114';
var KEY_F4 = 'k115';
var KEY_F5 = 'k116';
var KEY_F6 = 'k117';
var KEY_F7 = 'k118';
var KEY_F8 = 'k119';
var KEY_F9 = 'k120';
var KEY_F10 = 'k121';
var KEY_F11 = 'k122';
var KEY_F12 = 'k123';
var KEY_NUM_LOCK = 'k144';
var KEY_SCROLL_LOCK = 'k145';

// Global constants for mouse button identification.
var MOUSE_LEFT_BUTTON = 'left';
var MOUSE_RIGHT_BUTTON = 'right';
var MOUSE_MIDDLE_BUTTON = 'center';