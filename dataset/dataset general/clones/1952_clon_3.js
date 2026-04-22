/*
 * UxKit UI 2.0.0
 *
 * Copyright (c) 2024 Project Authors (http://uxkit.dev/about)
 * Licensed under the Apache 2.0 License (LICENSE.txt)
 *
 * http://docs.uxkit.dev/UI-Components
 */
;UxKit.utils || (function(jq) {

    // Preserve the original jQuery remove function for later use
    const initialRemoveFn = jq.fn.remove;

    // Determine if the browser is an older version of Mozilla for specific compatibility fixes
    const isOldMozilla = (function() {
        if (!jq.browser || !jq.browser.mozilla) {
            return false;
        }
        const browserVersion = parseFloat(jq.browser.version);
        return browserVersion < 1.90; // Targeting Firefox 2.x and older
    })();

    /**
     * Core utility functions and base object for UxKit components.
     * Provides common methods and configuration for the UI library.
     */
    UxKit.tools = {
        release: "2.0.0", // Current version of the UxKit library

        /**
         * The 'extension' object is deprecated. Developers should use a proxy pattern
         * or direct composition for component extensions.
         * This block handles adding and calling component-specific handlers.
         */
        extension: {
            /**
             * Registers a set of handlers for a specific component and event type.
             * @param {string} componentName - The name of the UI component (e.g., 'dialog').
             * @param {string} settingIdentifier - The identifier for the setting that triggers these handlers.
             * @param {object} handlersMap - An object mapping event names to handler functions.
             */
            register: function(componentName, settingIdentifier, handlersMap) {
                console.warn(`UxKit.tools.extension.register is deprecated. Consider direct event binding.`);
                const componentPrototype = UxKit.components[componentName].prototype;
                for (let eventKey in handlersMap) {
                    if (Object.prototype.hasOwnProperty.call(handlersMap, eventKey)) {
                        componentPrototype.extensions = componentPrototype.extensions || {};
                        componentPrototype.extensions[eventKey] = componentPrototype.extensions[eventKey] || [];
                        // Store handlers as objects for better readability
                        componentPrototype.extensions[eventKey].push({
                            setting: settingIdentifier,
                            action: handlersMap[eventKey]
                        });
                    }
                }
            },

            /**
             * Executes registered handlers for a specific event on a component instance.
             * @param {object} componentInstance - The instance of the UI component.
             * @param {string} eventName - The name of the event to call handlers for.
             * @param {Array} eventArguments - Arguments to pass to the handler functions.
             */
            execute: function(componentInstance, eventName, eventArguments) {
                const registeredHandlers = componentInstance.extensions[eventName];

                // Exit if no handlers or if the component's element is no longer in the DOM
                if (!registeredHandlers || !componentInstance.hostElement[0] || !componentInstance.hostElement[0].parentNode) {
                    return;
                }

                // Iterate through and execute applicable handlers
                for (let idx = 0; idx < registeredHandlers.length; idx++) {
                    const handlerEntry = registeredHandlers[idx];
                    // Check if the component's options enable this specific handler
                    if (componentInstance.configSettings[handlerEntry.setting]) {
                        handlerEntry.action.apply(componentInstance.hostElement, eventArguments);
                    }
                }
            }
        },

        /**
         * Checks if a DOM element is contained within another.
         * @param {HTMLElement} ancestorEl - The potential ancestor element.
         * @param {HTMLElement} descendantEl - The potential descendant element.
         * @returns {boolean} True if descendantEl is contained within ancestorEl, false otherwise.
         */
        nodeContains: function(ancestorEl, descendantEl) {
            if (document.compareDocumentPosition) {
                // Use the more robust compareDocumentPosition for modern browsers
                return (ancestorEl.compareDocumentPosition(descendantEl) & 16); // Node.DOCUMENT_POSITION_CONTAINS
            } else {
                // Fallback for older browsers: check if they are the same element or if ancestor contains descendant
                return ancestorEl !== descendantEl && ancestorEl.contains(descendantEl);
            }
        },

        /**
         * Determines if an element has scrollable content in a given direction.
         * This checks if the element's content exceeds its visible area and can be scrolled.
         * @param {HTMLElement} domElement - The DOM element to check.
         * @param {string} [directionHint] - Optional: 'left' for horizontal scroll, otherwise checks vertical.
         * @returns {boolean} True if the element is scrollable, false otherwise.
         */
        canScroll: function(domElement, directionHint) {
            // If overflow is explicitly hidden, content might be clipped but not scrollable by user
            if (jq(domElement).css('overflow') === 'hidden') {
                return false;
            }

            const scrollProperty = (directionHint && directionHint === 'left') ? 'scrollLeft' : 'scrollTop';
            let scrollableStatus = false;

            // Check if the current scroll position is non-zero
            if (domElement[scrollProperty] > 0) {
                return true;
            }

            // Temporarily attempt to scroll to see if it's possible
            const originalScrollValue = domElement[scrollProperty];
            domElement[scrollProperty] = 1; // Try to scroll by 1 pixel
            scrollableStatus = (domElement[scrollProperty] > 0);
            domElement[scrollProperty] = originalScrollValue; // Restore original scroll position

            return scrollableStatus;
        },

        /**
         * Checks if a coordinate falls within the bounds of an axis.
         * @param {number} coord - The coordinate value (e.g., X or Y).
         * @param {number} refPos - The starting position of the axis (e.g., top or left).
         * @param {number} dimension - The size of the axis (e.g., height or width).
         * @returns {boolean} True if the coordinate is within the axis boundaries.
         */
        checkAxisOverlap: function(coord, refPos, dimension) {
            return (coord > refPos) && (coord < (refPos + dimension));
        },

        /**
         * Determines if a given (X, Y) coordinate pair is over a specified rectangular area.
         * @param {number} yCoord - The Y-coordinate.
         * @param {number} xCoord - The X-coordinate.
         * @param {number} upperBound - The top position of the area.
         * @param {number} leftBound - The left position of the area.
         * @param {number} heightVal - The height of the area.
         * @param {number} widthVal - The width of the area.
         * @returns {boolean} True if the coordinates are within the area.
         */
        checkBoundsOverlap: function(yCoord, xCoord, upperBound, leftBound, heightVal, widthVal) {
            return UxKit.tools.checkAxisOverlap(yCoord, upperBound, heightVal) &&
                   UxKit.tools.checkAxisOverlap(xCoord, leftBound, widthVal);
        },

        /**
         * Defines standard key codes for keyboard events.
         */
        keyMap: {
            KEY_BACKSPACE: 8,
            KEY_TAB: 9,
            KEY_ENTER: 13,
            KEY_SHIFT: 16,
            KEY_CONTROL: 17,
            KEY_CAPS_LOCK: 20,
            KEY_ESCAPE: 27,
            KEY_SPACE: 32,
            KEY_PAGE_UP: 33,
            KEY_PAGE_DOWN: 34,
            KEY_END: 35,
            KEY_HOME: 36,
            KEY_LEFT_ARROW: 37,
            KEY_UP_ARROW: 38,
            KEY_RIGHT_ARROW: 39,
            KEY_DOWN_ARROW: 40,
            KEY_INSERT: 45,
            KEY_DELETE: 46,
            KEY_NUMPAD_MULTIPLY: 106,
            KEY_NUMPAD_ADD: 107,
            KEY_NUMPAD_ENTER: 108,
            KEY_NUMPAD_SUBTRACT: 109,
            KEY_NUMPAD_DECIMAL: 110,
            KEY_NUMPAD_DIVIDE: 111,
            KEY_COMMA: 188,
            KEY_PERIOD: 190
        }
    };

    // WAI-ARIA attribute normalization for older browsers (e.g., Firefox 2)
    if (isOldMozilla) {
        const originalAttrFn = jq.attr;
        const initialRemoveAttrFn = jq.fn.removeAttr;
        const ariaNamespaceUri = "http://www.w3.org/2005/07/aaa"; // ARIA namespace
        const ariaAttributePrefix = /^aria-/; // Regex to detect ARIA attributes
        const ariaRolePrefix = /^ux-role:/; // Custom prefix for role attributes

        /**
         * Overrides jQuery's attr method to handle ARIA attributes specifically.
         * For 'role', it prefixes with 'ux-role:'. For 'aria-' attributes, it uses setAttributeNS.
         */
        jq.attr = function(element, attributeName, attributeValue) {
            const hasValue = attributeValue !== undefined;

            if (attributeName === 'role') {
                return hasValue
                    ? originalAttrFn.call(this, element, attributeName, "ux-role:" + attributeValue)
                    : (originalAttrFn.apply(this, arguments) || "").replace(ariaRolePrefix, "");
            } else if (ariaAttributePrefix.test(attributeName)) {
                // For ARIA attributes, use setAttributeNS
                const prefixedAriaName = attributeName.replace(ariaAttributePrefix, "ux-aria:");
                if (hasValue) {
                    element.setAttributeNS(ariaNamespaceUri, prefixedAriaName, attributeValue);
                    return element.getAttributeNS(ariaNamespaceUri, prefixedAriaName); // Return the set value
                } else {
                    return originalAttrFn.call(this, element, prefixedAriaName); // Retrieve value
                }
            } else {
                // For all other attributes, call the original method
                return originalAttrFn.apply(this, arguments);
            }
        };

        /**
         * Overrides jQuery's removeAttr method to handle ARIA attributes.
         * For 'aria-' attributes, it uses removeAttributeNS.
         */
        jq.fn.removeAttr = function(attributeName) {
            if (ariaAttributePrefix.test(attributeName)) {
                // If it's an ARIA attribute, remove using namespace
                const prefixedAriaName = attributeName.replace(ariaAttributePrefix, "ux-aria:");
                return this.each(function() {
                    this.removeAttributeNS(ariaNamespaceUri, prefixedAriaName);
                });
            } else {
                // For other attributes, call the original method
                return initialRemoveAttrFn.call(this, attributeName);
            }
        };
    }

    // Extend jQuery's prototype with UxKit-specific utility methods
    jq.fn.extend({
        /**
         * Overrides jQuery's native remove method to trigger a custom event
         * before DOM removal, allowing components to clean up.
         */
        remove: function() {
            // Trigger a 'destroyElement' event on all elements about to be removed
            // Safari has a native 'remove' event, so we use triggerHandler to avoid conflicts.
            this.find("*").add(this).each(function() {
                jq(this).triggerHandler("destroyElement");
            });
            console.log(`UxKit: Triggered 'destroyElement' before removing elements.`);
            // Call the original jQuery remove function
            return initialRemoveFn.apply(this, arguments);
        },

        /**
         * Enables user text selection for the matched elements.
         * This reverts changes made by `preventUserSelection`.
         */
        allowUserSelection: function() {
            return this
                .attr('data-user-select', 'off') // Custom attribute for tracking state
                .css('MozUserSelect', '') // Reset Mozilla-specific style
                .css('WebkitUserSelect', '') // Reset Webkit-specific style
                .unbind('selectStartEvent.ux'); // Unbind custom selectstart event
        },

        /**
         * Disables user text selection for the matched elements.
         * Useful for drag-and-drop interfaces to prevent unwanted text highlighting.
         */
        preventUserSelection: function() {
            return this
                .attr('data-user-select', 'on') // Custom attribute for tracking state
                .css('MozUserSelect', 'none') // Prevent selection in Mozilla
                .css('WebkitUserSelect', 'none') // Prevent selection in Webkit
                .bind('selectStartEvent.ux', function() {
                    // Prevent default selectstart behavior
                    return false;
                });
        },

        /**
         * Finds the first scrollable parent element of the matched elements.
         * If no scrollable parent is found, or if the element is fixed, returns the document body.
         * @returns {jQuery} A jQuery object containing the scrollable parent or the document body.
         */
        findScrollContainer: function() {
            let containerCandidate;
            const currentPosition = this.css('position');

            // Logic for elements with 'static' or 'relative' position (and IE specific check)
            const isPositionedForParents = (jq.browser.msie && (/(static|relative)/).test(currentPosition)) || (/absolute/).test(currentPosition);

            if (isPositionedForParents) {
                containerCandidate = this.parents().filter(function() {
                    const el = jq(this);
                    const elPosition = el.css('position');
                    const elOverflow = el.css('overflow') + el.css('overflow-y') + el.css('overflow-x');
                    const isPositioned = (/(relative|absolute|fixed)/).test(elPosition);
                    const isScrollable = (/(auto|scroll)/).test(elOverflow);
                    return isPositioned && isScrollable;
                }).eq(0);
            } else {
                // Simpler check for non-positioned elements
                containerCandidate = this.parents().filter(function() {
                    const el = jq(this);
                    const elOverflow = el.css('overflow') + el.css('overflow-y') + el.css('overflow-x');
                    return (/(auto|scroll)/).test(elOverflow);
                }).eq(0);
            }

            // If element is fixed or no scrollable parent found, consider document body as scroll container
            const isFixed = (/fixed/).test(currentPosition);
            return isFixed || !containerCandidate.length ? jq(document.body) : containerCandidate;
        }
    });

    // Add custom selectors to jQuery's expression engine
    jq.extend(jq.expr[':'], {
        /**
         * Selector to check if an element has a specific jQuery data entry.
         * Usage: `$(selector).is(':hasDataAttribute(key)')`
         * @param {HTMLElement} elem - The DOM element.
         * @param {number} i - The index of the element in the matched set.
         * @param {Array} match - The regex match array, where match[3] is the data key.
         * @returns {boolean} True if the element has data associated with the key.
         */
        hasDataAttribute: function(elem, i, match) {
            return !!jq.data(elem, match[3]);
        },

        /**
         * Selector to determine if an element is capable of receiving keyboard focus.
         * Accounts for disabled states, link hrefs, and tabindex attributes.
         * @param {HTMLElement} element - The DOM element to check.
         * @returns {boolean} True if the element is focusable.
         */
        canReceiveFocus: function(element) {
            const elementTag = element.nodeName.toLowerCase();
            const tabOrderIndex = jq.attr(element, 'tabindex');

            let isElementFocusable = false;

            // Check common interactive elements
            if ((/input|select|textarea|button|object/).test(elementTag)) {
                isElementFocusable = !element.disabled;
            }
            // Check links and area elements
            else if (elementTag === 'a' || elementTag === 'area') {
                isElementFocusable = element.href || !isNaN(tabOrderIndex);
            }
            // Check any other element with a tabindex
            else {
                isElementFocusable = !isNaN(tabOrderIndex);
            }

            // Additionally, the element and its ancestors must be visible
            const visibilityCheckTarget = (elementTag === 'area' ? 'parents' : 'closest');
            const isVisible = !jq(element)[visibilityCheckTarget](':hidden').length;

            return isElementFocusable && isVisible;
        },

        /**
         * Selector to determine if an element is tabbable (can be reached by Tab key).
         * An element is tabbable if it's focusable and has a non-negative tabindex.
         * @param {HTMLElement} element - The DOM element to check.
         * @returns {boolean} True if the element is tabbable.
         */
        isTabbableElement: function(element) {
            const tabOrderIndex = jq.attr(element, 'tabindex');
            // Element must have a non-negative tabindex OR no tabindex (implicitly 0), and must be focusable.
            return (tabOrderIndex >= 0 || isNaN(tabOrderIndex)) && jq(element).is(':canReceiveFocus');
        }
    });

    /**
     * Helper function to determine if a method is a 'getter' based on component definitions.
     * @param {string} compNamespace - The component's namespace.
     * @param {string} compName - The component's name.
     * @param {string} accessorMethod - The method name being checked.
     * @param {Array} methodArgs - Arguments passed to the method.
     * @returns {boolean} True if the method is a getter.
     */
    function canAccessProperty(compNamespace, compName, accessorMethod, methodArgs) {
        /**
         * Retrieves an array of method names defined as getters or getter/setters for a component.
         * @param {string} methodType - 'getter' or 'getterSetter'.
         * @returns {Array<string>} List of method names.
         */
        function getPropertyAccessors(methodType) {
            const methods = UxKit.components[compNamespace][compName][methodType] || [];
            return (typeof methods === 'string' ? methods.split(/,?\s+/) : methods);
        }

        let getterMethods = getPropertyAccessors('getter');
        // If only one argument and it's a string, also consider getter/setter methods
        if (methodArgs.length === 1 && typeof methodArgs[0] === 'string') {
            getterMethods = getterMethods.concat(getPropertyAccessors('getterSetter'));
        }
        return getterMethods.includes(accessorMethod);
    }

    /**
     * `UxKit.defineComponent` is a factory function for creating new UI components.
     * It handles boilerplate for jQuery plugin integration, option management, and eventing.
     * @param {string} componentIdentifier - Full name of the component (e.g., "ux.draggable").
     * @param {object} componentPrototype - Object containing methods and properties for the component.
     */
    UxKit.defineComponent = function(componentIdentifier, componentPrototype) {
        const parts = componentIdentifier.split(".");
        const compNamespace = parts[0];
        const compName = parts[1];

        // Create the jQuery plugin method (e.g., $.fn.draggable)
        jq.fn[compName] = function(configSettings) {
            const isMethodInvocation = (typeof configSettings === 'string');
            const invocationArguments = Array.prototype.slice.call(arguments, 1);

            // Prevent calling methods starting with '_' (internal methods)
            if (isMethodInvocation && configSettings.startsWith('_')) {
                console.warn(`UxKit: Attempted to call private method '${configSettings}' on component '${compName}'.`);
                return this;
            }

            // Handle getter methods: if it's a method call and configured as a getter
            if (isMethodInvocation && canAccessProperty(compNamespace, compName, configSettings, invocationArguments)) {
                const componentInstance = jq.data(this[0], compName);
                if (componentInstance) {
                    // Execute the getter method on the first element's instance
                    return componentInstance[configSettings].apply(componentInstance, invocationArguments);
                }
                return undefined; // No instance, no value
            }

            // Handle initialization and non-getter methods for each matched element
            return this.each(function() {
                let componentInstance = jq.data(this, compName);

                if (!componentInstance) {
                    // If no instance exists and it's not a method call (or a method call on a non-existent instance)
                    // Create a new instance and store it, then initialize.
                    if (!isMethodInvocation) {
                        const newInstance = new UxKit.components[compNamespace][compName](this, configSettings);
                        jq.data(this, compName, newInstance);
                        newInstance._initialize();
                    }
                } else if (isMethodInvocation) {
                    // If an instance exists and it's a method call, execute the method
                    if (jq.isFunction(componentInstance[configSettings])) {
                        componentInstance[configSettings].apply(componentInstance, invocationArguments);
                    } else {
                        console.warn(`UxKit: Method '${configSettings}' not found or not a function on component '${compName}'.`);
                    }
                }
            });
        };

        // Create the component constructor in the UxKit.components namespace
        UxKit.components = UxKit.components || {};
        UxKit.components[compNamespace] = UxKit.components[compNamespace] || {};
        UxKit.components[compNamespace][compName] = function(hostElement, configSettings) {
            const thisRef = this; // Capture 'this' for use in event handlers

            this.compNamespace = compNamespace;
            this.componentName = compName;
            this.eventPrefix = UxKit.components[compNamespace][compName].eventPrefix || compName;
            this.baseClass = compNamespace + '-' + compName;

            // Merge default options, component-specific defaults, metadata options, and instance options
            this.configSettings = jq.extend({},
                UxKit.defineComponent.defaultSettings,
                UxKit.components[compNamespace][compName].defaultSettings,
                jq.metadata && jq.metadata.get(hostElement)[compName], // Read metadata if available
                configSettings
            );

            // Wrap the host element with jQuery and bind component-specific events
            const $hostElement = jq(hostElement);
            this.hostElement = $hostElement
                .bind('updateData.' + compName, function(event, key, value) {
                    // Ensure the event originated from this specific element
                    if (event.target === hostElement) {
                        return thisRef._updateInternalData(key, value);
                    }
                })
                .bind('retrieveData.' + compName, function(event, key) {
                    if (event.target === hostElement) {
                        return thisRef._fetchInternalData(key);
                    }
                })
                .bind('destroyElement', function() { // Custom event triggered by jq.fn.remove
                    return thisRef.dispose();
                });
        };

        // Extend the component's prototype with the base component prototype and the provided prototype
        UxKit.components[compNamespace][compName].prototype = jq.extend({}, UxKit.defineComponent.prototype, componentPrototype);

        // Define default getter/setter for 'option' method
        UxKit.components[compNamespace][compName].getterSetter = 'configure';
    };

    /**
     * The base prototype for all UxKit components.
     * Provides common lifecycle methods, option management, and event triggering.
     */
    UxKit.defineComponent.prototype = {
        /**
         * Placeholder for component initialization logic. Should be overridden by specific components.
         * Called once after component creation.
         * @private
         */
        _initialize: function() {},

        /**
         * Cleans up the component instance. Removes data, classes, and ARIA attributes.
         * Should be called when the component is no longer needed.
         */
        dispose: function() {
            if (this.hostElement && this.hostElement.length > 0) {
                this.hostElement
                    .removeData(this.componentName) // Remove stored instance data
                    .removeClass(this.baseClass + '-deactivated' + ' ' + this.compNamespace + '-state-deactivated') // Remove disabled classes
                    .removeAttr('aria-disabled'); // Remove ARIA disabled attribute
            }
            // Clear any internal timers or event handlers if they exist
            if (this._delayTimerId) {
                clearTimeout(this._delayTimerId);
            }
            // This is just an example, specific components might need more cleanup
            console.log(`UxKit: Component '${this.componentName}' disposed.`);
        },

        /**
         * Manages component configuration settings. Can get or set options.
         * @param {string|object} configKey - The name of the option to get/set, or an object of key-value pairs to set.
         * @param {*} [configValue] - The value to set for the option, if `configKey` is a string.
         * @returns {*} The value of the option if getting, or `undefined` if setting.
         */
        configure: function(configKey, configValue) {
            let configObject = configKey;
            const thisRef = this;

            // If configKey is a string, it's either a getter or a single setter
            if (typeof configKey === "string") {
                if (configValue === undefined) {
                    return this._fetchInternalData(configKey); // Getter
                }
                // Single setter: convert to an object for consistent processing
                configObject = {};
                configObject[configKey] = configValue;
            }

            // Iterate through the (possibly converted) config object and set values
            jq.each(configObject, function(key, value) {
                thisRef._updateInternalData(key, value);
            });
        },

        /**
         * Retrieves a specific configuration setting from the component's options.
         * @param {string} key - The name of the setting.
         * @returns {*} The value of the setting.
         * @private
         */
        _fetchInternalData: function(key) {
            return this.configSettings[key];
        },

        /**
         * Updates a specific configuration setting and applies related side effects.
         * @param {string} key - The name of the setting to update.
         * @param {*} value - The new value for the setting.
         * @private
         */
        _updateInternalData: function(key, value) {
            this.configSettings[key] = value;

            // Special handling for the 'isDisabled' option
            if (key === 'isDisabled') {
                this.hostElement
                    [value ? 'addClass' : 'removeClass'](
                        this.baseClass + '-deactivated' + ' ' +
                        this.compNamespace + '-state-deactivated')
                    .attr("aria-disabled", String(value)); // Ensure attribute value is a string
            }
            // Components can override this method to add more specific side effects for other options.
        },

        /**
         * Activates the component, setting its 'isDisabled' option to false.
         */
        activateComponent: function() {
            this._updateInternalData('isDisabled', false);
        },

        /**
         * Deactivates the component, setting its 'isDisabled' option to true.
         */
        deactivateComponent: function() {
            this._updateInternalData('isDisabled', true);
        },

        /**
         * Triggers a custom event on the component's host element.
         * Also calls any associated callback function defined in the options.
         * @param {string} eventType - The base name of the event (e.g., 'start', 'change').
         * @param {Event} [originalEvent] - The original DOM event that triggered this component event.
         * @param {object} [eventPayload] - Additional data to pass with the event.
         * @returns {boolean} False if the event was prevented, true otherwise.
         * @private
         */
        _emitEvent: function(eventType, originalEvent, eventPayload) {
            const eventHandlerFn = this.configSettings[eventType];
            const fullEventType = (eventType === this.eventPrefix ? eventType : this.eventPrefix + eventType);

            // Create a new jQuery event object, preserving properties from the original event
            const syntheticEvent = jq.Event(originalEvent);
            syntheticEvent.type = fullEventType;

            // Copy properties from the original event if it exists
            if (originalEvent && syntheticEvent.originalEvent) {
                for (let i = jq.event.props.length - 1; i >= 0; i--) {
                    const prop = jq.event.props[i];
                    if (syntheticEvent.originalEvent[prop] !== undefined) {
                        syntheticEvent[prop] = syntheticEvent.originalEvent[prop];
                    }
                }
            }

            // Trigger the custom event on the host element
            this.hostElement.trigger(syntheticEvent, eventPayload);

            // Check if the event was prevented by a handler or the callback returned false
            const isCallbackPrevented = jq.isFunction(eventHandlerFn) &&
                                        eventHandlerFn.call(this.hostElement[0], syntheticEvent, eventPayload) === false;

            return !(isCallbackPrevented || syntheticEvent.isDefaultPrevented());
        }
    };

    // Default configuration settings for all UxKit components
    UxKit.defineComponent.defaultSettings = {
        isDisabled: false // Default state for all components
    };

    /**
     * Mouse Interaction Plugin for UxKit components.
     * Provides common mouse tracking logic for draggable, resizable, etc.
     * Components needing mouse interaction should extend this.
     */
    UxKit.tools.MouseTracker = {
        // Internal state for mouse tracking
        _currentMouseState: {
            isMouseStarted: false,
            shouldPreventClick: false,
            initialMouseEvent: null,
            delaySatisfied: false
        },
        _delayTimerId: null, // Timer for mouse delay

        /**
         * Initializes mouse tracking for the component. Binds mousedown and click events.
         * @private
         */
        _initMouseTracking: function() {
            const currentInst = this; // Reference to the component instance

            this.hostElement
                .bind('pointerDown.' + this.componentName, function(event) {
                    return currentInst._handleMouseDown(event);
                })
                .bind('clickPreventer.' + this.componentName, function(event) {
                    // Prevent click events if _shouldPreventClick is true (e.g., after a drag)
                    if (currentInst._currentMouseState.shouldPreventClick) {
                        currentInst._currentMouseState.shouldPreventClick = false;
                        event.stopImmediatePropagation(); // Stop propagation immediately
                        return false; // Prevent default click action
                    }
                });

            // For IE, prevent text selection during mouse interactions
            if (jq.browser.msie) {
                this._originalUnselectable = this.hostElement.attr('unselectable');
                this.hostElement.attr('unselectable', 'on');
            }
        },

        /**
         * Cleans up mouse tracking event handlers and restores original DOM state.
         * @private
         */
        _destroyMouseTracking: function() {
            this.hostElement.unbind('pointerDown.' + this.componentName);
            this.hostElement.unbind('clickPreventer.' + this.componentName);

            // Restore text selection in IE
            if (jq.browser.msie && this._originalUnselectable !== undefined) {
                this.hostElement.attr('unselectable', this._originalUnselectable);
            }
            this._resetMouseState(); // Reset internal mouse state
        },

        /**
         * Resets the internal mouse tracking state variables.
         * @private
         */
        _resetMouseState: function() {
            this._currentMouseState.isMouseStarted = false;
            this._currentMouseState.shouldPreventClick = false;
            this._currentMouseState.initialMouseEvent = null;
            this._currentMouseState.delaySatisfied = false;
            if (this._delayTimerId) {
                clearTimeout(this._delayTimerId);
                this._delayTimerId = null;
            }
            jq(document)
                .unbind('pointerMove.' + this.componentName, this._moveHandler)
                .unbind('pointerUp.' + this.componentName, this._upHandler);
        },

        /**
         * Handles the initial mousedown event. Determines if a mouse interaction should start.
         * @param {Event} event - The mousedown event.
         * @returns {boolean} True if the event should propagate, false if handled.
         * @private
         */
        _handleMouseDown: function(event) {
            // Prevent multiple widgets from handling the same mouse event
            event.originalEvent = event.originalEvent || {};
            if (event.originalEvent.pointerHandled) {
                return true;
            }

            // If a mouse operation was started but mouseup was missed (e.g., out of window), clean up
            if (this._currentMouseState.isMouseStarted) {
                this._handleMouseUp(event);
            }

            this._currentMouseState.initialMouseEvent = event; // Store initial event
            this._currentMouseState.isMouseStarted = false; // Reset started state

            const currentInst = this;
            const isLeftClick = (event.which === 1);
            let isCanceledElement = false;

            // Check if the event target matches a 'cancel' selector
            if (typeof this.configSettings.cancel === "string") {
                isCanceledElement = jq(event.target).parents().add(event.target).filter(this.configSettings.cancel).length > 0;
            }

            // Only proceed if it's a left click, not on a canceled element, and _captureMouseStart allows it
            if (!isLeftClick || isCanceledElement || !this._captureMouseStart(event)) {
                return true;
            }

            this._currentMouseState.delaySatisfied = !this.configSettings.delay;
            if (!this._currentMouseState.delaySatisfied) {
                this._delayTimerId = setTimeout(function() {
                    currentInst._currentMouseState.delaySatisfied = true;
                }, this.configSettings.delay);
            }

            // Check distance and delay thresholds
            if (this._isDistanceThresholdMet(event) && this._currentMouseState.delaySatisfied) {
                try {
                    this._currentMouseState.isMouseStarted = (this._onMouseStart(event) !== false);
                } catch (e) {
                    console.error(`UxKit: Error during _onMouseStart for ${this.componentName}:`, e);
                    this._resetMouseState(); // Ensure state is reset on error
                    return true;
                }
                if (!this._currentMouseState.isMouseStarted) {
                    event.preventDefault();
                    return true;
                }
            }

            // Bind global mouse move and up handlers
            this._moveHandler = function(e) { return currentInst._handleMouseMove(e); };
            this._upHandler = function(e) { return currentInst._handleMouseUp(e); };
            jq(document)
                .bind('pointerMove.' + this.componentName, this._moveHandler)
                .bind('pointerUp.' + this.componentName, this._upHandler);

            // Prevent text selection (Safari needs special handling)
            if (!jq.browser.safari) {
                event.preventDefault();
            }

            event.originalEvent.pointerHandled = true;
            return true;
        },

        /**
         * Handles mouse movement events during an active interaction.
         * @param {Event} event - The mousemove event.
         * @returns {boolean} False if the event was handled and default prevented.
         * @private
         */
        _handleMouseMove: function(event) {
            // IE check: if mouseup happened outside window, event.button might be 0
            if (jq.browser.msie && event.button === 0) {
                return this._handleMouseUp(event);
            }

            if (this._currentMouseState.isMouseStarted) {
                this._onMouseDrag(event);
                return event.preventDefault();
            }

            // If not yet started, check if distance/delay thresholds are now met
            if (this._isDistanceThresholdMet(event) && this._currentMouseState.delaySatisfied) {
                this._currentMouseState.isMouseStarted = (this._onMouseStart(this._currentMouseState.initialMouseEvent, event) !== false);
                if (this._currentMouseState.isMouseStarted) {
                    this._onMouseDrag(event);
                } else {
                    this._handleMouseUp(event); // If start failed, clean up
                }
            }

            return !this._currentMouseState.isMouseStarted;
        },

        /**
         * Handles the mouseup event, ending the mouse interaction.
         * @param {Event} event - The mouseup event.
         * @returns {boolean} Always false to stop event propagation (since interaction is ending).
         * @private
         */
        _handleMouseUp: function(event) {
            // Unbind global mouse event handlers
            jq(document)
                .unbind('pointerMove.' + this.componentName, this._moveHandler)
                .unbind('pointerUp.' + this.componentName, this._upHandler);

            if (this._currentMouseState.isMouseStarted) {
                this._currentMouseState.isMouseStarted = false;
                // Prevent click event if the mouseup happened on the same target as mousedown (e.g., after a short drag)
                this._currentMouseState.shouldPreventClick = (event.target === this._currentMouseState.initialMouseEvent.target);
                this._onMouseStop(event); // Call the component's stop method
            }
            this._resetMouseState(); // Ensure all state is clean
            return false;
        },

        /**
         * Checks if the mouse has moved beyond the minimum distance threshold.
         * @param {Event} event - The current mouse event.
         * @returns {boolean} True if the distance threshold is met.
         * @private
         */
        _isDistanceThresholdMet: function(event) {
            const initialEvent = this._currentMouseState.initialMouseEvent;
            if (!initialEvent) return false; // Should not happen if _mouseDown was called

            const deltaX = Math.abs(initialEvent.pageX - event.pageX);
            const deltaY = Math.abs(initialEvent.pageY - event.pageY);

            return (Math.max(deltaX, deltaY) >= this.configSettings.distance);
        },

        // Placeholder methods to be implemented by extending components
        _captureMouseStart: function(event) { return true; }, // Determines if mouse interaction should begin
        _onMouseStart: function(event) {}, // Called when mouse interaction starts
        _onMouseDrag: function(event) {},  // Called during mouse movement while interaction is active
        _onMouseStop: function(event) {}   // Called when mouse interaction ends
    };

})(jQuery); // Pass jQuery as 'jq' to allow for renaming internally