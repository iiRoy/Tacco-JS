// Chrono.js - Core Utilities and Environment Setup
// A modernized, refactored library for client-side operations.
// @author: A. N. Other (inspired by Matthew Story)
// @version: 2.0.0
// License: MIT

const Chrono = {
    noop: () => {}, // An empty function for placeholders
    clientEnv: null, // Stores detected user agent information
    agentVersion: null, // Stores detected user agent version
    
    /**
     * Initializes the client environment by detecting browser and version.
     * This method should be called once on script load.
     */
    initializeEnvironment: function() {
        const userAgentString = navigator.userAgent;
        let detectedBrowser = 'Unknown';
        let browserVersion = 0;

        // Determine the browser based on user agent string
        if (userAgentString.includes('Opera') || userAgentString.includes('OPR')) {
            detectedBrowser = 'Opera';
        } else if (userAgentString.includes('MSIE') || userAgentString.includes('Trident')) {
            detectedBrowser = 'MSIE'; // Older IE
            if (userAgentString.includes('Trident') && userAgentString.includes('rv:')) {
                detectedBrowser = 'IE11+'; // Modern IE
            }
        } else if (userAgentString.includes('Safari') && !userAgentString.includes('Chrome')) {
            detectedBrowser = 'Safari';
        } else if (userAgentString.includes('Firefox')) {
            detectedBrowser = 'Firefox';
        } else if (userAgentString.includes('Chrome')) {
            detectedBrowser = 'Chrome'; // Chrome often includes Safari in its UA string, so check after Safari
        }
        
        this.clientEnv = detectedBrowser;

        // Extract version number
        const versionRegex = new RegExp(detectedBrowser + '[^0-9]*([0-9]+\\.*[0-9]+)');
        const match = userAgentString.match(versionRegex);
        if (match && match[1]) {
            browserVersion = parseFloat(match[1]); // Convert to float for numerical comparison
        } else if (detectedBrowser === 'IE11+') {
            const ie11Match = userAgentString.match(/rv:([0-9]+\.[0-9]+)/);
            if (ie11Match && ie11Match[1]) {
                browserVersion = parseFloat(ie11Match[1]);
            }
        }

        this.agentVersion = browserVersion;
    }
};

// Immediately initialize the environment upon script loading.
Chrono.initializeEnvironment();

// Global utility functions for browser information
const retrieveClientAgent = () => Chrono.clientEnv;
const fetchAgentVersion = () => Chrono.agentVersion;

/**
 * Universal object extension utility.
 * Merges properties from one or more source objects into the target object.
 * @param {...object} sources - One or more objects whose properties will be copied.
 * @returns {object} The modified target object.
 */
Object.prototype.extendWith = function(...sources) {
    for (const source of sources) {
        if (source && typeof source === 'object') {
            for (const key in source) {
                // Ensure the property belongs to the source object itself, not its prototype chain
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    this[key] = source[key];
                }
            }
        } else if (source !== null && typeof source !== 'undefined') {
            console.warn("extendWith: Ignoring non-object source:", source);
        }
    }
    return this;
};

// Augment Object prototype with additional helpful methods
Object.prototype.extendWith({
    /**
     * Converts the object into a JSON-like string representation, removing
     * specific constructor patterns often found in stringified objects.
     * Note: This is a custom stringification, not a standard JSON.stringify.
     * @returns {string} The processed string representation.
     */
    serializeAsText: function() {
        // This regex aims to strip common object constructor syntax from a stringified object.
        // It's specific to the original implementation's intent.
        return this.toString().replace(/^\(new[^(]*\(|^\(|\)+$/g, '');
    },

    /**
     * Attempts to convert an array-like object into a true Array.
     * Requires the object to have a 'length' property.
     * @returns {Array} A new array containing the elements.
     */
    convertToArray: function() {
        if (typeof this.length !== 'number' || this.length < 0) {
            console.warn("convertToArray: Object does not appear to be array-like (missing valid 'length' property).");
            return [];
        }
        return Array.prototype.slice.call(this); // Efficient conversion
    },

    // Placeholder for sending object data asynchronously
    transmitData: Chrono.noop,

    // Placeholder for encoding object data
    encodeData: Chrono.noop,

    /**
     * Creates a new class factory based on provided options, allowing for
     * inheritance-like structures and initialization logic.
     * @param {object} [config] - Configuration options for the factory.
     * @param {boolean} [config.init=false] - The initialization method for the new class.
     * @param {Function} [config.parent=Chrono.noop] - The parent class/constructor.
     * @param {boolean} [config.initParent=false] - Whether to call the parent's init method.
     * @returns {Function} A new constructor function (class).
     */
    createClassFactory: function(config) {
        // Default options, extended by user-provided configuration
        const options = {
            init: false,
            parent: Chrono.noop,
            initParent: false
        }.extendWith(config || {});

        // Determine the actual initialization method
        let initializer = options.init;
        if (!initializer) {
            initializer = this.init || this.initialize;
        } else if (typeof initializer === 'string' && this[initializer]) {
            initializer = this[initializer];
        } else if (typeof initializer !== 'function') {
            initializer = Chrono.noop; // Fallback if init is invalid
        }

        // Define the new constructor function
        const NewClass = function(...args) {
            if (options.initParent && typeof this.parent === 'function') {
                this.parent.apply(this, args); // Call parent constructor
            }
            if (typeof initializer === 'function') {
                initializer.apply(this, args); // Call the specific initializer
            }
        };

        // Apply prototype inheritance and mixins
        NewClass.prototype.extendWith(options.parent.prototype, this, { parent: options.parent });
        return NewClass;
    }
});

// Augment String prototype with code evaluation capabilities
String.prototype.extendWith({
    /**
     * Evaluates the string as JSON, attempting to parse it into a JavaScript object.
     * @param {object} [opts] - Options for evaluation, e.g., onError callback.
     * @returns {object|boolean} The parsed JSON object or false on error.
     */
    parseJsonString: function(opts) {
        return this.evaluateCode((opts || {}).extendWith({ isJson: true }));
    },

    /**
     * Executes the string as JavaScript code.
     * @param {object} [opts] - Options for evaluation, e.g., onError callback.
     * @returns {boolean} True if evaluation succeeds, false otherwise.
     */
    executeJsString: function(opts) {
        return this.evaluateCode((opts || {}).extendWith({ isJson: false }));
    },

    /**
     * Generic code evaluation method.
     * @param {object} [options] - Configuration for evaluation.
     * @param {Function} [options.onError=Chrono.noop] - Callback for errors during evaluation.
     * @param {boolean} [options.isJson=false] - If true, attempts to parse as JSON.
     * @returns {any|boolean} The result of JSON parsing or true/false for JS execution.
     */
    evaluateCode: function(options) {
        const evalOptions = { onError: Chrono.noop, isJson: false }.extendWith(options || {});
        let evaluationResult = null;
        let success = true;

        try {
            if (evalOptions.isJson) {
                // For JSON, we explicitly assign to a variable to capture the result
                // Using a unique variable name to avoid global scope pollution (though eval still impacts current scope)
                const jsonWrapper = `var jsonPayloadResult = ${this};`;
                eval(jsonWrapper); // `eval` in this context will define `jsonPayloadResult`
                evaluationResult = typeof jsonPayloadResult !== 'undefined' ? jsonPayloadResult : null;
            } else {
                eval(this.toString()); // Execute as raw JS
                evaluationResult = true;
            }
        } catch (error) {
            evalOptions.onError(error);
            success = false;
            evaluationResult = false; // Indicate failure
        }
        return evaluationResult;
    }
});

// Augment Array prototype with custom array utilities
Array.prototype.extendWith({
    /**
     * Checks if an array contains a specific value.
     * @param {any} item - The value to search for.
     * @returns {boolean} True if the value is found, false otherwise.
     */
    includesItem: function(item) {
        // Modern browsers have native Array.prototype.includes, but adhering to original's manual loop
        for (let i = 0; i < this.length; i++) {
            if (this[i] === item) { // Using strict equality
                return true;
            }
        }
        return false;
    },

    /**
     * Iterates over each element in the array, executing a provided function.
     * @param {Function} callback - The function to execute for each element.
     *                              It receives (element, index) as arguments.
     * @param {object} [context] - The `this` context for the callback function.
     */
    forEachElement: function(callback, context) {
        if (typeof callback !== 'function') {
            console.error("forEachElement: Callback must be a function.");
            return;
        }
        const effectiveContext = context || this;
        for (let i = 0; i < this.length; i++) {
            // Check for sparse arrays or deleted elements
            if (Object.prototype.hasOwnProperty.call(this, i)) {
                callback.apply(effectiveContext, [this[i], i]);
            }
        }
    },

    /**
     * Returns the first index at which a given element can be found in the array.
     * @param {any} searchElement - The element to locate.
     * @returns {number} The index of the element, or -1 if not found.
     */
    findIndexOf: function(searchElement) {
        // Using native indexOf for efficiency, but keeping the name for consistency
        return this.indexOf(searchElement);
    },

    /**
     * Removes the first occurrence of a specified element from the array.
     * @param {any} elementToRemove - The element to remove.
     */
    removeItem: function(elementToRemove) {
        const targetIndex = this.findIndexOf(elementToRemove);
        if (targetIndex > -1) {
            this.splice(targetIndex, 1);
        }
    }
});

// Augment Function prototype with a context binding utility
Function.prototype.extendWith({
    /**
     * Creates a new function that, when called, has its `this` keyword set
     * to the provided value, with a given sequence of arguments preceding
     * any provided when the new function is called.
     * @param {object} contextObject - The object to which the `this` keyword can be bound.
     * @returns {Function} A new function with the specified context.
     */
    bindContext: function(contextObject) {
        const originalFunction = this;
        // Using native bind for robustness and performance
        return originalFunction.bind(contextObject);
    }
});

/**
 * Global utility function to retrieve a DOM element by ID or return the element itself.
 * Also extends the element with Chrono's DOM manipulation capabilities.
 * @param {string|HTMLElement} identifier - The ID of the element or the element object.
 * @returns {HTMLElement|null} The extended DOM element or null if not found.
 */
const getElement = (identifier) => {
    let targetElement;

    // Resolve the element: by ID string or directly if already an object
    if (typeof identifier === 'string') {
        targetElement = document.getElementById(identifier);
        if (!targetElement) {
            console.warn(`getElement: Element with ID '${identifier}' not found.`);
            return null;
        }
    } else if (identifier instanceof HTMLElement) {
        targetElement = identifier;
    } else {
        console.error("getElement: Invalid identifier. Must be a string ID or an HTMLElement.");
        return null;
    }

    // Extend the element with Chrono's specific functionalities if not already done
    if (targetElement && !targetElement._chronoExtended) {
        // Assign the extendWith method directly to the element for chainability
        targetElement.extendWith = Object.prototype.extendWith;
        targetElement._chronoExtended = true; // Mark as extended

        // Apply relevant module extensions
        // Check if modules are defined before patching
        targetElement.extendWith(
            (typeof InteractionHub !== 'undefined' && InteractionHub.Element) ? InteractionHub.Element : {},
            (typeof InteractionHub !== 'undefined' && InteractionHub.Advanced && InteractionHub.Advanced.Element) ? InteractionHub.Advanced.Element : {},
            (typeof StyleUtil !== 'undefined' && StyleUtil.Element) ? StyleUtil.Element : {},
            (typeof StructureManipulator !== 'undefined' && StructureManipulator.Element) ? StructureManipulator.Element : {},
            (typeof AsyncRequester !== 'undefined' && AsyncRequester.Element) ? AsyncRequester.Element : {}
        );
    }
    return targetElement;
};

// Event Handling System
const InteractionHub = {
    // Internal EventDescriptor class for normalizing event objects
    EventDescriptor: {
        setupEventDetails: function(originalEvent) {
            // Ensure we have an event object to work with
            const currentEvent = originalEvent || window.event;
            if (!currentEvent) {
                console.warn("EventDescriptor: No event object provided or available globally.");
                return this; // Return itself or a default event object
            }

            // Patch the event object with cross-browser properties
            // Using extendWith directly on the event object for flexibility
            currentEvent.extendWith = Object.prototype.extendWith; // Ensure event can be patched

            // Constants for event types
            const KEY_EVENT_TYPES = ['keypress', 'keydown', 'keyup'];
            const MOUSE_EVENT_TYPES = ['click', 'mousedown', 'mouseup', 'contextmenu'];

            // Keyboard event specifics
            if (KEY_EVENT_TYPES.includes(currentEvent.type)) {
                currentEvent.keyIdentifier = (currentEvent.which || currentEvent.keyCode);
                currentEvent.charValue = (currentEvent.which) ? String.fromCharCode(currentEvent.which) : '';
            }
            
            // Mouse event specifics
            if (MOUSE_EVENT_TYPES.includes(currentEvent.type)) {
                // Normalize button clicks (0: left, 1: middle, 2: right)
                currentEvent.isLeftClick = (currentEvent.button === 0);
                currentEvent.isCenterClick = (currentEvent.button === 1);
                currentEvent.isRightClick = (currentEvent.button === 2);
                
                currentEvent.mouseButton = currentEvent.isLeftClick ? MOUSE_LEFT_BUTTON :
                                           currentEvent.isCenterClick ? MOUSE_CENTER_BUTTON :
                                           currentEvent.isRightClick ? MOUSE_RIGHT_BUTTON : null;
            }

            // Cross-browser stopPropagation and preventDefault
            currentEvent.stopPropagation = currentEvent.stopPropagation || function() {
                this.cancelBubble = true;
            };
            currentEvent.preventDefault = currentEvent.preventDefault || function() {
                this.returnValue = false;
            };

            // Helper methods for event type checking
            currentEvent.isPointerEvent = () => MOUSE_EVENT_TYPES.includes(currentEvent.type);
            currentEvent.isKeyEvent = () => KEY_EVENT_TYPES.includes(currentEvent.type);
            
            return currentEvent;
        }
    }.createClassFactory(), // Use the factory to create the EventDescriptor constructor

    registeredListeners: [], // Stores all attached event listeners

    /**
     * Attaches an event listener to a DOM element.
     * @param {HTMLElement} targetElement - The element to attach the listener to.
     * @param {string} eventName - The type of event (e.g., 'click', 'keydown').
     * @param {Function} handlerFunction - The function to execute when the event fires.
     * @param {object} [options] - Additional options for the event handler.
     */
    attachListener: function(targetElement, eventName, handlerFunction, options) {
        if (!targetElement || typeof targetElement.addEventListener !== 'function') {
            console.error("attachListener: Invalid target element provided.", targetElement);
            return;
        }
        if (typeof handlerFunction !== 'function') {
            console.error("attachListener: Handler must be a function.", handlerFunction);
            return;
        }

        // Create a bound and wrapped handler
        const wrappedHandler = this.createWrappedHandler(handlerFunction.bindContext(targetElement), options);
        
        // Store listener details for later removal
        this.registeredListeners.push({
            element: targetElement,
            originalHandler: handlerFunction,
            wrappedHandler: wrappedHandler,
            eventType: eventName
        });

        // Attach event listener based on browser capabilities
        if (Chrono.clientEnv === 'MSIE' && Chrono.agentVersion < 9) { // Older IE versions
            targetElement.attachEvent('on' + eventName, wrappedHandler);
        } else {
            targetElement.addEventListener(eventName, wrappedHandler, false);
        }
    },

    /**
     * Detaches event listeners from a DOM element.
     * @param {HTMLElement} targetElement - The element from which to remove listeners.
     * @param {string} [eventName] - Optional: The specific event type to remove.
     * @param {Function} [handlerFunction] - Optional: The specific handler function to remove.
     */
    detachListener: function(targetElement, eventName, handlerFunction) {
        if (!targetElement) {
            console.error("detachListener: Invalid target element provided.");
            return;
        }

        const listenersToRemove = this.queryListeners(targetElement, eventName, handlerFunction);
        
        for (const listener of listenersToRemove) {
            if (Chrono.clientEnv === 'MSIE' && Chrono.agentVersion < 9) {
                listener.element.detachEvent('on' + listener.eventType, listener.wrappedHandler);
            } else {
                listener.element.removeEventListener(listener.eventType, listener.wrappedHandler, false);
            }
        }
        
        // Update the global list of registered listeners
        // Filter out the removed listeners from the main array
        this.registeredListeners = this.registeredListeners.filter(
            l => !listenersToRemove.includes(l)
        );
    },

    /**
     * Creates a wrapper function for an event listener to handle cross-browser
     * event object normalization and option-based filtering (keys, masks, prevention).
     * @param {Function} listenerCallback - The original event handler.
     * @param {object} [handlerOptions] - Options for event filtering and behavior.
     * @returns {Function} The wrapped event handler.
     */
    createWrappedHandler: function(listenerCallback, handlerOptions) {
        const options = new InteractionHub.HandlerOptions(handlerOptions);

        return (rawEvent) => {
            // For older IE, create a synthetic event object and patch it
            let processedEvent = rawEvent;
            if (Chrono.clientEnv === 'MSIE' && Chrono.agentVersion < 9 && !rawEvent.stopPropagation) {
                // Create a basic object that mimics an event and extend it.
                processedEvent = {};
                processedEvent.extendWith = Object.prototype.extendWith;
                processedEvent.extendWith(rawEvent); // Copy properties from raw IE event
            }
            
            // Normalize the event object using EventDescriptor
            processedEvent = new InteractionHub.EventDescriptor(processedEvent);

            // Apply event filtering based on options (keys, modifiers)
            const hasKeyFilters = options.keyFilters.length > 0;
            const passesKeyFilter = !hasKeyFilters ||
                                    (processedEvent.isPointerEvent() && options.keyFilters.includes(processedEvent.mouseButton)) ||
                                    (processedEvent.isKeyEvent() && options.keyFilters.includes(processedEvent.keyIdentifier));

            const hasModifierMasks = options.modifierMasks.length > 0;
            const passesModifierFilter = !hasModifierMasks || (
                                         (!options.modifierMasks.includes(KEY_META) || processedEvent.metaKey) &&
                                         (!options.modifierMasks.includes(KEY_SHIFT) || processedEvent.shiftKey) &&
                                         (!options.modifierMasks.includes(KEY_CTRL) || processedEvent.ctrlKey) &&
                                         (!options.modifierMasks.includes(KEY_ALT) || processedEvent.altKey)
                                        );

            if (passesKeyFilter && passesModifierFilter) {
                const userResult = listenerCallback(processedEvent);
                if (options.preventEventDefaults) {
                    processedEvent.stopPropagation();
                    processedEvent.preventDefault();
                    return false; // Prevent default behavior for older browsers
                }
                return userResult;
            }
            // If filters don't pass, do nothing.
            return undefined; // Explicitly return undefined if event is filtered out
        };
    },

    /**
     * Retrieves a list of registered listeners matching specified criteria.
     * @param {HTMLElement} element - The target DOM element.
     * @param {string} [eventType] - Optional: Filter by event type.
     * @param {Function} [originalHandler] - Optional: Filter by the original handler function.
     * @returns {Array<object>} An array of matching listener objects.
     */
    queryListeners: function(element, eventType, originalHandler) {
        return this.registeredListeners.filter(listener =>
            listener.element === element &&
            (!eventType || listener.eventType === eventType) &&
            (!originalHandler || listener.originalHandler === originalHandler)
        );
    },
    
    // Configuration for event handler options (keys, modifiers, preventDefault)
    HandlerOptions: {
        keyFilters: [], // Specific keys/buttons to filter for
        modifierMasks: [], // Modifier keys (shift, ctrl, alt, meta)
        preventEventDefaults: false, // Whether to prevent default event behavior

        setupEventDetails: function(config) {
            this.extendWith(config || {});
            // Ensure keyFilters and modifierMasks are always arrays
            this.keyFilters = Array.isArray(this.keyFilters) ? this.keyFilters : [this.keyFilters];
            this.modifierMasks = Array.isArray(this.modifierMasks) ? this.modifierMasks : [this.modifierMasks];
        }
    }.createClassFactory(),

    // Element-specific event attachment/detachment methods
    Element: {
        attachListener: function(eventName, handler) {
            InteractionHub.attachListener(this, eventName, handler, arguments[2]);
        },
        detachListener: function(eventName, handler) {
            InteractionHub.detachListener(this, eventName, handler);
        }
    },

    // Advanced Element-specific event methods with common patterns
    Advanced: {
        Element: {
            onLoadEvent: function(handler, options) { this.attachListener('load', handler, options); },
            onClickEvent: function(handler, options) {
                const opts = new InteractionHub.HandlerOptions(options);
                if (opts.keyFilters.includes(MOUSE_RIGHT_BUTTON)) {
                    this.onRightClick(handler, opts); // Delegate to right-click specific handler
                    return;
                }
                this.attachListener('click', handler, opts);
            },
            offClickEvent: function(handler) { this.detachListener('click', handler); },
            onShiftClick: function(handler, options) {
                const opts = (options || {}).extendWith({ modifierMasks: KEY_SHIFT });
                this.onClickEvent(handler, opts);
            },
            onCtrlClick: function(handler, options) {
                const opts = (options || {}).extendWith({ modifierMasks: KEY_CTRL });
                this.onClickEvent(handler, opts);
            },
            onAltClick: function(handler, options) {
                const opts = (options || {}).extendWith({ modifierMasks: KEY_ALT });
                this.onClickEvent(handler, opts);
            },
            onMetaClick: function(handler, options) {
                const opts = (options || {}).extendWith({ modifierMasks: KEY_META });
                this.onClickEvent(handler, opts);
            },
            onRightClick: function(handler, options) {
                const opts = (options || {}).extendWith({ keyFilters: MOUSE_RIGHT_BUTTON });
                this.attachListener('mousedown', handler, opts);
                // If preventEventDefaults is requested for right-click, also prevent contextmenu
                if (opts.preventEventDefaults) {
                    this.attachListener('contextmenu', (e) => { e.preventDefault(); }, opts);
                }
            },
            offRightClick: function(handler) {
                this.detachListener('mousedown', handler);
                this.detachListener('contextmenu'); // Remove generic contextmenu stopper
            },
            onKeyPressEvent: function(keys, handler, options) {
                const opts = (options || {}).extendWith({ keyFilters: keys });
                this.attachListener('keypress', handler, opts);
            },
            offKeyPressEvent: function(handler) { this.detachListener('keypress', handler); }
        }
    }
};

// CSS Manipulation Utilities
const StyleUtil = {
    Element: {
        /**
         * Checks if the element has a specific CSS class.
         * @param {string} className - The class name to check.
         * @returns {boolean} True if the class is present, false otherwise.
         */
        hasStyleClass: function(className) {
            if (!className || typeof className !== 'string') {
                console.warn("hasStyleClass: Invalid class name provided.");
                return false;
            }
            if (!this.className) return false;
            // Use classList for modern browsers, fallback to regex for older ones
            if (this.classList) {
                return this.classList.contains(className);
            }
            const classRegex = new RegExp(`(^|\\s+)${className}(\\s+|$)`);
            return classRegex.test(this.className);
        },

        /**
         * Adds one or more CSS classes to the element.
         * @param {string} classNames - Space-separated class names to add.
         */
        addStyleClass: function(classNames) {
            if (!classNames || typeof classNames !== 'string') {
                console.warn("addStyleClass: Invalid class names provided.");
                return;
            }
            const classesToAdd = classNames.split(/\s+/).filter(cls => cls.length > 0);
            if (this.classList) {
                this.classList.add(...classesToAdd);
            } else {
                classesToAdd.forEach(cls => {
                    if (!this.hasStyleClass(cls)) {
                        this.className += (this.className ? ' ' : '') + cls;
                    }
                });
            }
        },

        /**
         * Removes one or more CSS classes from the element.
         * @param {string} classNames - Space-separated class names to remove.
         */
        removeStyleClass: function(classNames) {
            if (!classNames || typeof classNames !== 'string') {
                console.warn("removeStyleClass: Invalid class names provided.");
                return;
            }
            const classesToRemove = classNames.split(/\s+/).filter(cls => cls.length > 0);
            if (this.classList) {
                this.classList.remove(...classesToRemove);
            } else {
                classesToRemove.forEach(cls => {
                    if (cls) {
                        this.className = this.className.replace(new RegExp(`(^|\\s+)${cls}(\\s+|$)`, 'g'), ' ').trim();
                    }
                });
            }
        },

        /**
         * Toggles a CSS class on the element. If the class is present, it's removed; otherwise, it's added.
         * @param {string} className - The class name to toggle.
         */
        toggleStyleClass: function(className) {
            if (!className || typeof className !== 'string') {
                console.warn("toggleStyleClass: Invalid class name provided.");
                return;
            }
            if (this.classList) {
                this.classList.toggle(className);
            } else {
                if (this.hasStyleClass(className)) {
                    this.removeStyleClass(className);
                } else {
                    this.addStyleClass(className);
                }
            }
        }
    }
};

// DOM Manipulation Utilities
const StructureManipulator = {
    Element: {
        /**
         * Checks if the current element is a direct child of another element.
         * @param {string|HTMLElement} potentialParent - The potential parent element or its ID.
         * @returns {boolean} True if it's a direct child, false otherwise.
         */
        isChildOf: function(potentialParent) {
            const parentElement = getElement(potentialParent);
            return parentElement && (this.parentNode === parentElement);
        },

        /**
         * Checks if the current element is a direct parent of another element.
         * @param {string|HTMLElement} potentialChild - The potential child element or its ID.
         * @returns {boolean} True if it's a direct parent, false otherwise.
         */
        isParentOf: function(potentialChild) {
            const childElement = getElement(potentialChild);
            return childElement && (childElement.parentNode === this);
        },

        /**
         * Checks if the current element is a sibling of another element.
         * @param {string|HTMLElement} potentialSibling - The potential sibling element or its ID.
         * @returns {boolean} True if they share the same parent, false otherwise.
         */
        isSiblingOf: function(potentialSibling) {
            const siblingElement = getElement(potentialSibling);
            if (!this.parentNode || !siblingElement || !siblingElement.parentNode) return false;
            return this.parentNode === siblingElement.parentNode && this !== siblingElement;
        },

        /**
         * Checks if the current element is a descendant of another element (any level).
         * @param {string|HTMLElement} potentialAncestor - The potential ancestor element or its ID.
         * @returns {boolean} True if it's a descendant, false otherwise.
         */
        isDescendantOf: function(potentialAncestor) {
            let currentElement = this;
            const ancestorElement = getElement(potentialAncestor);
            if (!ancestorElement) return false;

            while (currentElement && currentElement !== document.body) { // Stop at body to prevent infinite loop or checking non-DOM elements
                if (currentElement.parentNode === ancestorElement) {
                    return true;
                }
                currentElement = currentElement.parentNode;
            }
            return false;
        },

        /**
         * Checks if the current element is an ancestor of another element (any level).
         * @param {string|HTMLElement} potentialDescendant - The potential descendant element or its ID.
         * @returns {boolean} True if it's an ancestor, false otherwise.
         */
        isAncestorOf: function(potentialDescendant) {
            const descendantElement = getElement(potentialDescendant);
            return descendantElement && descendantElement.isDescendantOf(this);
        },

        /**
         * Selects elements within the current element using a CSS selector.
         * (Placeholder for more complex selector engine)
         * @param {string} selector - The CSS selector string.
         * @returns {NodeList} A NodeList of matching elements.
         */
        selectElements: function(selector) {
            if (this.querySelectorAll) {
                return this.querySelectorAll(selector);
            }
            console.warn("selectElements: querySelectorAll not supported on this element.");
            return [];
        },

        /**
         * Retrieves all descendant elements that match a given CSS class name.
         * @param {string} className - The CSS class name to search for.
         * @returns {Array<HTMLElement>} An array of matching elements.
         */
        findElementsByClass: function(className) {
            if (this.getElementsByClassName) {
                // Convert HTMLCollection to Array for consistency
                return Array.from(this.getElementsByClassName(className));
            }

            // Fallback for older browsers (less efficient)
            const allDescendants = this.getElementsByTagName('*');
            const matchingElements = [];
            for (let i = 0; i < allDescendants.length; i++) {
                const element = getElement(allDescendants[i]); // Ensure element is extended
                if (element && element.hasStyleClass(className)) {
                    matchingElements.push(element);
                }
            }
            return matchingElements;
        }
    }
};

// Asynchronous Request Handling (AJAX)
const AsyncRequester = {
    // Class for sending AJAX requests
    RequestSender: {
        xhrObject: null, // The XMLHttpRequest object
        requestMethod: 'POST',
        urlEndpoint: '',
        onCreation: Chrono.noop,
        onConfiguration: Chrono.noop,
        onDispatch: Chrono.noop,
        onDataLoading: Chrono.noop,
        onTransferProgress: Chrono.noop,
        onCompletion: Chrono.noop,
        onFailure: Chrono.noop,

        /**
         * Initializes an AJAX request sender.
         * @param {string} url - The URL endpoint for the request.
         * @param {object} [config] - Configuration options for the request.
         */
        setupRequest: function(url, config) {
            this.urlEndpoint = url;
            this.extendWith({
                requestMethod: 'POST',
                onCreation: Chrono.noop,
                onConfiguration: Chrono.noop,
                onDispatch: Chrono.noop,
                onDataLoading: Chrono.noop,
                onTransferProgress: Chrono.noop,
                onCompletion: Chrono.noop,
                onFailure: Chrono.noop
            }, config || {});

            // Determine the appropriate XMLHttpRequest object
            if (Chrono.clientEnv === 'MSIE' && Chrono.agentVersion < 7) { // Very old IE versions
                try {
                    this.xhrObject = new ActiveXObject("Microsoft.XMLHTTP");
                } catch (e) {
                    console.error("AsyncRequester: ActiveXObject not supported or failed to create.", e);
                    this.xhrObject = null;
                }
            } else if (typeof XMLHttpRequest !== 'undefined') {
                this.xhrObject = new XMLHttpRequest();
            } else {
                console.error("AsyncRequester: XMLHttpRequest not supported in this environment.");
                this.xhrObject = null;
            }

            if (this.xhrObject) {
                this.xhrObject.onreadystatechange = this.handleStateChange.bindContext(this);
                // Modern browsers support onprogress event directly
                if (this.xhrObject.upload && typeof this.onTransferProgress === 'function') {
                    this.xhrObject.upload.onprogress = this.onTransferProgress.bindContext(this);
                } else if (typeof this.onTransferProgress === 'function') {
                    this.xhrObject.onprogress = this.onTransferProgress.bindContext(this);
                }
            } else {
                console.error("AsyncRequester: Failed to initialize XHR object.");
            }
        },

        /**
         * Handles changes in the XMLHttpRequest's readyState.
         */
        handleStateChange: function() {
            if (!this.xhrObject) return; // Guard clause

            const xhr = this.xhrObject;
            const readyState = xhr.readyState;
            const statusCode = xhr.status;

            // Map readyStates to their respective callbacks
            const stateHandlers = {
                0: this.onCreation,    // UNSENT
                1: this.onConfiguration, // OPENED
                2: this.onDispatch,    // HEADERS_RECEIVED
                3: this.onDataLoading  // LOADING (Receiving response body)
            };

            // Call the appropriate handler, wrapped for error safety
            if (stateHandlers[readyState]) {
                this.wrapCallback(stateHandlers[readyState])(xhr);
            }

            // Handle completion or error state (readyState 4)
            if (readyState === 4) {
                if (statusCode >= 200 && statusCode < 300) { // Success range
                    this.wrapCallback(this.onCompletion)(xhr);
                } else {
                    this.wrapCallback(this.onFailure)(xhr);
                }
            }
        },

        /**
         * Wraps a callback function with error handling.
         * @param {Function} callback - The function to wrap.
         * @returns {Function} A new function that executes the callback with error protection.
         */
        wrapCallback: function(callback) {
            return (...args) => {
                try {
                    if (typeof callback === 'function') {
                        callback.apply(this.xhrObject, args); // Apply context as original XHR object
                    }
                } catch (e) {
                    console.error("Error during AJAX callback execution:", e);
                    // Optionally re-throw or handle more gracefully
                    throw e;
                }
            };
        }
    }.createClassFactory(),

    // Element-specific AJAX utilities
    Element: {
        /**
         * Performs an AJAX request and updates the innerHTML of the current element
         * with the response content.
         * @param {string} url - The URL to request.
         * @param {object} [config] - Configuration for the AJAX request.
         */
        updateContent: function(url, config) {
            const elementToUpdate = this; // Capture 'this' for the callback scope
            const requestConfig = {
                onCompletion: function(xhr) {
                    if (xhr.responseText) {
                        elementToUpdate.innerHTML = xhr.responseText;
                    }
                    if (typeof config.onCompletion === 'function') {
                        config.onCompletion.call(this, xhr); // Call original completion handler if exists
                    }
                },
                onFailure: function(xhr) {
                    console.error(`Failed to update element content from ${url}. Status: ${xhr.status}`);
                    if (typeof config.onFailure === 'function') {
                        config.onFailure.call(this, xhr);
                    }
                }
            }.extendWith(config || {}); // Merge with provided config

            const sender = new AsyncRequester.RequestSender(url, requestConfig);
            if (sender.xhrObject) {
                // Assuming the original 'send' method would also open and send
                // For simplicity, directly opening and sending here
                sender.xhrObject.open(sender.requestMethod, sender.urlEndpoint, true);
                sender.xhrObject.send(null); // Or provide data if method is POST and data is available
            }
        }
    }
};

// Key Code Constants (renamed and slightly reordered for readability)
const KEY_BACKSPACE = 8;
const KEY_TAB = 9;
const KEY_ENTER = 13;
const KEY_SHIFT = 16;
const KEY_CTRL = 17;
const KEY_ALT = 18;
const KEY_PAUSE_BREAK = 19;
const KEY_CAPS_LOCK = 20;
const KEY_ESCAPE = 27;
const KEY_SPACE = 32; // Added spacebar
const KEY_PAGE_UP = 33;
const KEY_PAGE_DOWN = 34;
const KEY_END = 35;
const KEY_HOME = 36;
const KEY_LEFT_ARROW = 37;
const KEY_UP_ARROW = 38;
const KEY_RIGHT_ARROW = 39;
const KEY_DOWN_ARROW = 40;
const KEY_INSERT = 45;
const KEY_DELETE = 46;

// Numeric Keypad Keys
const KEY_NUMPAD_0 = 96;
const KEY_NUMPAD_1 = 97;
const KEY_NUMPAD_2 = 98;
const KEY_NUMPAD_3 = 99;
const KEY_NUMPAD_4 = 100;
const KEY_NUMPAD_5 = 101;
const KEY_NUMPAD_6 = 102;
const KEY_NUMPAD_7 = 103;
const KEY_NUMPAD_8 = 104;
const KEY_NUMPAD_9 = 105;

// Function Keys
const KEY_F1 = 112;
const KEY_F2 = 113;
const KEY_F3 = 114;
const KEY_F4 = 115;
const KEY_F5 = 116;
const KEY_F6 = 117;
const KEY_F7 = 118;
const KEY_F8 = 119;
const KEY_F9 = 120;
const KEY_F10 = 121;
const KEY_F11 = 122;
const KEY_F12 = 123;

const KEY_NUM_LOCK = 144;
const KEY_SCROLL_LOCK = 145;
const KEY_META = 'META'; // Meta key is often not a simple keycode

// Mouse Button Constants (using descriptive strings)
const MOUSE_LEFT_BUTTON = 'left';
const MOUSE_RIGHT_BUTTON = 'right';
const MOUSE_CENTER_BUTTON = 'center';