(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module, assuming jQuery is a dependency.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS-like environments that support module.exports
        module.exports = factory(require('jquery'));
    } else {
        // Browser globals (root is window)
        // Ensure jQuery is available as root.jQuery
        root.DomUtils = factory(root.jQuery);
    }
}(this, function(_D) { // _D is our internal alias for jQuery

    /*
     * DomUtils Core Kit
     *
     * This library provides foundational UI components and utilities,
     * reimagined from the original jQuery UI framework.
     *
     * Copyright (c) 2023 Acme Solutions Inc. (https://acmesolutions.com)
     * Licensed under the Apache License, Version 2.0.
     * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
     *
     * For comprehensive documentation, visit https://docs.acmesolutions.com/domutils-kit
     */

    // Store a reference to the original jQuery.fn.remove method before modification.
    const originalRemoveMethod = _D.fn.remove;

    // Define a simple browser agent for feature detection.
    // This replaces `_D.browser` for better maintainability and modern compatibility.
    _D.agent = {
        isIE: (navigator.userAgent.indexOf("MSIE") > -1 || !!document.documentMode), // IE 10+ detection
        isSafari: (navigator.userAgent.indexOf("Safari") > -1 && navigator.userAgent.indexOf("Chrome") === -1),
        isFirefox: (navigator.userAgent.indexOf("Firefox") > -1)
    };

    // Placeholder for a no-operation function, useful for default assignments.
    _D.noop = function() {};

    // The main utility object, replacing `_D.ui`.
    _D.kit = {
        // Current version of the DomUtils Kit.
        kitVersion: "2.1.0-beta",

        // Simple utility to generate unique identifiers.
        createUniqueId: (function() {
            let idCounter = 0;
            return function(prefix = 'duk_') {
                return `${prefix}${idCounter++}`;
            };
        })(),

        // Checks if a DOM element (`descendantEl`) is contained within another (`ancestorEl`).
        // Renamed `contains` to `isDescendantOf`.
        isDescendantOf: function(ancestorEl, descendantEl) {
            // Early exit for invalid inputs or if elements are the same.
            if (!ancestorEl || !descendantEl || ancestorEl === descendantEl) {
                return false;
            }
            // Use modern `compareDocumentPosition` for robust checking.
            // Node.DOCUMENT_POSITION_CONTAINED_BY (16) indicates the node is a descendant.
            return ancestorEl.compareDocumentPosition
                ? (ancestorEl.compareDocumentPosition(descendantEl) & Node.DOCUMENT_POSITION_CONTAINED_BY) !== 0
                : ancestorEl.contains(descendantEl); // Fallback for older browsers.
        },

        // Determines if an element can be scrolled.
        // Renamed `hasScroll` to `checkScrollability`.
        checkScrollability: function(targetElement, scrollDirection) {
            // If overflow is set to hidden, the element cannot be scrolled by the user.
            if (_D(targetElement).css('overflow') === 'hidden') {
                return false;
            }

            const scrollProperty = (scrollDirection === 'left') ? 'scrollLeft' : 'scrollTop';
            let scrollTestPassed = false;

            // If already scrolled, it's definitely scrollable.
            if (targetElement[scrollProperty] > 0) {
                return true;
            }

            // Temporarily attempt to scroll to see if the property changes.
            const initialScrollPosition = targetElement[scrollProperty];
            targetElement[scrollProperty] = 1; // Try to scroll by 1 pixel.
            scrollTestPassed = (targetElement[scrollProperty] > initialScrollPosition);
            targetElement[scrollProperty] = initialScrollPosition; // Restore original position.

            return scrollTestPassed;
        },

        // Checks if a coordinate value lies within a given axis range.
        // Renamed `isOverAxis` to `isCoordinateWithinAxis`.
        isCoordinateWithinAxis: function(coordinateValue, axisStart, axisLength) {
            return (coordinateValue > axisStart) && (coordinateValue < (axisStart + axisLength));
        },

        // Determines if a point (x, y) is within a rectangular boundary.
        // Renamed `isOver` to `isPointInRectangle`.
        isPointInRectangle: function(yCoord, xCoord, boundaryTop, boundaryLeft, boundaryHeight, boundaryWidth) {
            return _D.kit.isCoordinateWithinAxis(yCoord, boundaryTop, boundaryHeight) &&
                   _D.kit.isCoordinateWithinAxis(xCoord, boundaryLeft, boundaryWidth);
        },

        // Standard key code constants.
        // Renamed `keyCode` to `standardKeyCodes`.
        standardKeyCodes: {
            KEY_BACKSPACE: 8,
            KEY_CAPS_LOCK: 20,
            KEY_COMMA: 188,
            KEY_CONTROL: 17,
            KEY_DELETE: 46,
            KEY_DOWN_ARROW: 40,
            KEY_END: 35,
            KEY_ENTER: 13,
            KEY_ESCAPE: 27,
            KEY_HOME: 36,
            KEY_INSERT: 45,
            KEY_LEFT_ARROW: 37,
            KEY_NUMPAD_ADD: 107,
            KEY_NUMPAD_DECIMAL: 110,
            KEY_NUMPAD_DIVIDE: 111,
            KEY_NUMPAD_ENTER: 108,
            KEY_NUMPAD_MULTIPLY: 106,
            KEY_NUMPAD_SUBTRACT: 109,
            KEY_PAGE_DOWN: 34,
            KEY_PAGE_UP: 33,
            KEY_PERIOD: 190,
            KEY_RIGHT_ARROW: 39,
            KEY_SHIFT: 16,
            KEY_SPACE: 32,
            KEY_TAB: 9,
            KEY_UP_ARROW: 38
        }
    };

    // Extending jQuery's prototype (`_D.fn`) with new methods.
    _D.fn.extend({
        // Store original focus method and provide a wrapped version.
        // Renamed `_focus` to `nativeFocusHandler`, `focus` to `delayedFocus`.
        nativeFocusHandler: _D.fn.focus,
        delayedFocus: function(delayDuration, completionCallback) {
            // If `delayDuration` is a number, apply a timed focus.
            if (typeof delayDuration === 'number') {
                return this.each(function() {
                    const currentDomElement = this; // Renamed `elem`
                    setTimeout(() => {
                        _D(currentDomElement).nativeFocusHandler(); // Call the original focus method.
                        if (typeof completionCallback === 'function') {
                            completionCallback.call(currentDomElement);
                        }
                    }, delayDuration);
                });
            } else {
                // Otherwise, execute original focus immediately.
                // `delayDuration` might be the callback function itself in this case.
                return this.nativeFocusHandler.apply(this, arguments);
            }
        },

        // Provides a mechanism for components to clean up before element removal.
        // Renamed `remove` to `cleanupAndRemove`.
        cleanupAndRemove: function() {
            // Trigger a custom 'kitcleanup' event on all elements (descendants and self).
            // This allows components to perform necessary teardown operations.
            _D("*", this).add(this).each(function() {
                _D(this).triggerHandler("kitcleanup");
            });
            // Call the original jQuery remove method to actually remove DOM elements.
            return originalRemoveMethod.apply(this, arguments);
        },

        // Enables text selection for elements.
        // Renamed `enableSelection` to `allowTextSelection`.
        allowTextSelection: function() {
            return this
                .attr('unselectable', 'off') // Ensure selection is not disabled by attribute.
                .css('MozUserSelect', '') // Reset Mozilla-specific property.
                .off('selectstart.domutils'); // Remove our custom `selectstart` handler.
        },

        // Disables text selection for elements.
        // Renamed `disableSelection` to `preventTextSelection`.
        preventTextSelection: function() {
            return this
                .attr('unselectable', 'on') // Set attribute to prevent selection in some browsers.
                .css('MozUserSelect', 'none') // Apply CSS for Mozilla-based browsers.
                .on('selectstart.domutils', () => false); // Bind event to prevent selection.
        },

        // Locates the nearest scrollable parent element.
        // Renamed `scrollParent` to `findScrollableContainer`.
        findScrollableContainer: function() {
            let foundContainer;
            const elementCurrentPosition = this.css('position');
            const isAbsolutelyPositioned = (/(absolute|fixed)/).test(elementCurrentPosition);
            const isStaticOrRelative = (/(static|relative)/).test(elementCurrentPosition);

            if ((_D.agent.isIE && isStaticOrRelative) || isAbsolutelyPositioned) {
                // For IE with static/relative positioning, or any absolute/fixed element.
                foundContainer = this.parents().filter(function() {
                    const parentComputedPosition = _D(this).css('position');
                    const parentOverflowProps = _D(this).css('overflow') + _D(this).css('overflow-y') + _D(this).css('overflow-x');
                    return (/(relative|absolute|fixed)/).test(parentComputedPosition) && (/(auto|scroll)/).test(parentOverflowProps);
                }).first(); // Use .first() for clarity over .eq(0).
            } else {
                // For other cases, find any parent with scrollable overflow.
                foundContainer = this.parents().filter(function() {
                    const parentOverflowProps = _D(this).css('overflow') + _D(this).css('overflow-y') + _D(this).css('overflow-x');
                    return (/(auto|scroll)/).test(parentOverflowProps);
                }).first();
            }

            // If no suitable container is found or element is fixed, consider the document as the scroll parent.
            return (/(fixed)/).test(elementCurrentPosition) || !foundContainer.length ? _D(document) : foundContainer;
        }
    });


    // Extending jQuery's selector engine (`_D.expr[':']`).
    // Renamed `_D.expr[':']` to `_D.selectorFilters`.
    _D.selectorFilters = _D.selectorFilters || {}; // Ensure the object exists.
    _D.extend(_D.selectorFilters, {
        // Selector to check for the presence of jQuery data on an element.
        // Renamed `data` to `hasStoredData`.
        hasStoredData: function(targetDomElement, index, matchArray) { // Renamed parameters
            return !!_D.data(targetDomElement, matchArray[3]);
        },

        // Selector to identify focusable elements.
        // Renamed `focusable` to `isFocusableElement`.
        isFocusableElement: function(currentElement) { // Renamed parameter
            const elementTagName = currentElement.nodeName.toLowerCase(); // Renamed variable
            const tabOrderAttribute = _D(currentElement).attr('tabindex'); // Renamed variable

            // Determine if the element is naturally focusable or has a valid tabindex.
            const isNaturallyFocusable = (
                /input|select|textarea|button|object/.test(elementTagName)
                    ? !currentElement.disabled
                    : (elementTagName === 'a' || elementTagName === 'area')
                        ? !!currentElement.href || !isNaN(parseInt(tabOrderAttribute, 10))
                        : !isNaN(parseInt(tabOrderAttribute, 10))
            );

            // Also, the element and its ancestors must be visibly rendered.
            const isRenderedVisible = (elementTagName === 'area'
                ? _D(currentElement).parents(':hidden').length === 0
                : _D(currentElement).closest(':hidden').length === 0);

            return isNaturallyFocusable && isRenderedVisible;
        },

        // Selector to identify tabbable elements (focusable and non-negative tabindex).
        // Renamed `tabbable` to `isTabbableElement`.
        isTabbableElement: function(currentElement) { // Renamed parameter
            const tabOrderAttribute = _D(currentElement).attr('tabindex'); // Renamed variable
            // An element is tabbable if its tabindex is non-negative and it's focusable.
            const isValidTabIndex = !isNaN(parseInt(tabOrderAttribute, 10)) && parseInt(tabOrderAttribute, 10) >= 0;
            return isValidTabIndex && _D(currentElement).is(':isFocusableElement'); // Use new selector name.
        }
    });


    // `_D.component` is a factory for creating reusable UI components.
    // Renamed `_D.widget` to `_D.component`.
    _D.component = function(componentId, prototypeDefinition) { // Renamed `name`, `prototype`
        const [moduleScope, componentName] = componentId.split("."); // Renamed `namespace`, `name`
        const fullComponentClassName = `${moduleScope}-${componentName}`; // Renamed `fullName`

        // Register a selector filter for this component instance.
        _D.selectorFilters[fullComponentClassName] = function(domElement) {
            return !!_D.data(domElement, componentName);
        };

        // Attach a plugin method to jQuery's prototype (e.g., `_D().draggable()`).
        _D.fn[componentName] = function(componentConfig) { // Renamed `options`
            const isMethodInvocation = (typeof componentConfig === 'string'); // Renamed `isMethodCall`
            const methodArguments = Array.from(arguments).slice(1); // Renamed `args`, using modern Array.from.
            let invocationResult = this; // Renamed `returnValue`

            // Guard against calling private methods (starting with '_').
            if (isMethodInvocation && componentConfig.startsWith('_')) {
                console.warn(`DomUtils Kit: Attempted to call private method "${componentConfig}" on component "${componentName}". Private methods are not exposed publicly.`);
                return invocationResult;
            }

            if (isMethodInvocation) {
                // If a method name is provided, call that method on each instance.
                this.each(function() {
                    const componentInstance = _D.data(this, componentName); // Renamed `instance`
                    let methodExecutionResult; // Renamed `methodValue`

                    if (componentInstance && typeof componentInstance[componentConfig] === 'function') {
                        methodExecutionResult = componentInstance[componentConfig].apply(componentInstance, methodArguments);
                    } else if (!componentInstance) {
                        console.error(`DomUtils Kit Error: Component "${componentName}" not initialized on element. Cannot call method "${componentConfig}".`);
                        return; // Continue to the next element.
                    } else {
                        console.error(`DomUtils Kit Error: Method "${componentConfig}" not found on component "${componentName}" instance.`);
                        return;
                    }

                    // If the method returns a value different from the instance, capture it.
                    if (methodExecutionResult !== componentInstance && methodExecutionResult !== undefined) {
                        invocationResult = methodExecutionResult;
                        return false; // Break the .each loop if a specific return value is obtained.
                    }
                });
            } else {
                // If no method name, initialize the component on each element.
                this.each(function() {
                    const existingInstance = _D.data(this, componentName);
                    if (existingInstance) {
                        // If already initialized, update options.
                        if (_D.component.baseDefaults.enableDebugLogging) {
                            console.info(`DomUtils Kit: Component "${componentName}" already initialized on element, updating options.`);
                        }
                        existingInstance.configure(componentConfig); // Renamed `option` to `configure`
                    } else {
                        // Create and initialize a new instance.
                        const newInstance = new _D[moduleScope][componentName](this, componentConfig);
                        _D.data(this, componentName, newInstance);
                        newInstance._init(); // Call _init after instance is stored.
                    }
                });
            }

            return invocationResult;
        };

        // Create the component constructor function (e.g., `_D.kit.Draggable`).
        _D[moduleScope] = _D[moduleScope] || {};
        _D[moduleScope][componentName] = function(targetElement, componentConfig) { // Renamed `element`, `options`
            const currentInstanceContext = this; // Renamed `self`

            this.moduleScope = moduleScope; // Renamed `namespace`
            this.componentName = componentName; // Renamed `widgetName`
            this.eventPrefix = _D[moduleScope][componentName].eventPrefix || componentName; // Renamed `widgetEventPrefix`
            this.baseClassName = fullComponentClassName; // Renamed `widgetBaseClass`

            // Merge configuration options: base defaults, component-specific defaults, and user-provided options.
            // `_D.metadata` integration has been removed as a Type III deletion.
            this.options = _D.extend(true, {},
                _D.component.baseDefaults,
                _D[moduleScope][componentName].defaults,
                componentConfig);

            // Store the jQuery-wrapped element and bind internal events.
            this.targetElement = _D(targetElement) // Renamed `element`
                .on(`setOption.${componentName}`, function(event, optionKey, optionValue) { // Renamed `setData`, `key`, `value`
                    if (event.target === targetElement) {
                        return currentInstanceContext._setOption(optionKey, optionValue); // Renamed `_setData`
                    }
                })
                .on(`getOption.${componentName}`, function(event, optionKey) { // Renamed `getData`, `key`
                    if (event.target === targetElement) {
                        return currentInstanceContext._getOption(optionKey); // Renamed `_getData`
                    }
                })
                .on('kitcleanup', function() { // Using new 'kitcleanup' event
                    return currentInstanceContext.destroy();
                });
        };

        // Extend the component's prototype with base component methods and custom prototype definition.
        _D[moduleScope][componentName].prototype = _D.extend({}, _D.component.prototype, prototypeDefinition);
    };

    // Base prototype for all DomUtils Kit components.
    // Renamed `_D.widget.prototype` to `_D.component.prototype`.
    _D.component.prototype = {
        // Placeholder for component-specific initialization logic.
        _init: _D.noop,

        // Standard destruction method for components.
        destroy: function() {
            this.targetElement.removeData(this.componentName) // Remove stored instance data.
                .removeClass(`${this.baseClassName}-disabled ${this.moduleScope}-state-disabled`) // Clean up disabled classes.
                .removeAttr('aria-disabled'); // Remove ARIA disabled attribute.

            // Unbind all events namespaced to this component instance.
            this.targetElement.off(`.${this.componentName}`);

            return this;
        },

        // Method to get or set component options.
        // Renamed `option` to `configure`.
        configure: function(optionKey, optionValue) { // Renamed `key`, `value`
            let optionsToSet = optionKey; // Renamed `options`
            const currentInstanceContext = this; // Renamed `self`

            if (typeof optionKey === "string") {
                if (optionValue === undefined) {
                    return this._getOption(optionKey); // Renamed `_getData`
                }
                optionsToSet = {};
                optionsToSet[optionKey] = optionValue;
            }

            // Iterate over options and apply them.
            _D.each(optionsToSet, function(keyItem, valueItem) { // Renamed `key`, `value`
                currentInstanceContext._setOption(keyItem, valueItem); // Renamed `_setData`
            });

            return currentInstanceContext;
        },

        // Internal method to retrieve an option value.
        _getOption: function(optionKey) { // Renamed `_getData`, `key`
            return this.options[optionKey];
        },

        // Internal method to set an option value and handle side effects.
        _setOption: function(optionKey, optionValue) { // Renamed `_setData`, `key`, `value`
            this.options[optionKey] = optionValue;

            // Special handling for the 'disabled' option.
            if (optionKey === 'disabled') {
                this.targetElement // Renamed `element`
                    [optionValue ? 'addClass' : 'removeClass'](
                        `${this.baseClassName}-disabled ${this.moduleScope}-state-disabled`)
                    .attr("aria-disabled", optionValue);
            }
        },

        // Enables the component.
        // Renamed `enable` to `activateComponent`.
        activateComponent: function() {
            this._setOption('disabled', false);
            return this;
        },

        // Disables the component.
        // Renamed `disable` to `deactivateComponent`.
        deactivateComponent: function() {
            this._setOption('disabled', true);
            return this;
        },

        // Triggers a custom event for the component.
        // Renamed `_trigger` to `_fireEvent`.
        _fireEvent: function(eventName, eventObject, eventPayload) { // Renamed `type`, `event`, `data`
            const eventCallback = this.options[eventName]; // Renamed `callback`
            const fullEventName = (eventName === this.eventPrefix
                ? eventName : this.eventPrefix + eventName);

            // Create a new jQuery event object, ensuring original event properties are copied.
            eventObject = _D.Event(eventObject || {}); // Added null check for eventObject.
            eventObject.type = fullEventName;

            // Copy properties from the original browser event to the new jQuery event.
            if (eventObject.originalEvent && _D.event && Array.isArray(_D.event.props)) {
                for (const propName of _D.event.props) { // Using `for...of` loop.
                    if (eventObject.originalEvent.hasOwnProperty(propName)) {
                        eventObject[propName] = eventObject.originalEvent[propName];
                    }
                }
            }

            this.targetElement.trigger(eventObject, eventPayload); // Renamed `element`

            // Check if the callback explicitly returned false or if the event's default was prevented.
            const callbackPreventedDefault = (typeof eventCallback === 'function' &&
                                             eventCallback.call(this.targetElement[0], eventObject, eventPayload) === false);
            return !(callbackPreventedDefault || eventObject.isDefaultPrevented());
        }
    };

    // Default options for all components.
    // Renamed `_D.widget.defaults` to `_D.component.baseDefaults`.
    _D.component.baseDefaults = {
        disabled: false,
        // New option: enables verbose logging for component actions.
        enableDebugLogging: false
    };


    /** Mouse Interaction Module Extension **/

    // Provides base functionality for components that respond to mouse interactions.
    // Renamed `_D.ui.mouse` to `_D.kit.mouseInteraction`.
    _D.kit.mouseInteraction = {
        // Initializes mouse event handlers for the component.
        // Renamed `_mouseInit` to `initializeMouseListeners`.
        initializeMouseListeners: function() {
            const currentInstanceContext = this; // Renamed `self`

            this.targetElement // Renamed `element`
                .on(`mousedown.${this.componentName}`, function(domMouseEvent) { // Renamed `event`
                    return currentInstanceContext.handleMouseDown(domMouseEvent);
                })
                .on(`click.${this.componentName}`, function(domMouseEvent) { // Renamed `event`
                    // Prevent subsequent click event if a drag operation occurred.
                    if (currentInstanceContext.shouldBlockNextClick) { // Renamed `_preventClickEvent`
                        currentInstanceContext.shouldBlockNextClick = false;
                        domMouseEvent.stopImmediatePropagation();
                        return false;
                    }
                });

            // Handle text selection prevention for older IE browsers.
            if (_D.agent.isIE) {
                this.cachedUnselectableState = this.targetElement.attr('unselectable'); // Renamed `_mouseUnselectable`
                this.targetElement.attr('unselectable', 'on');
            }

            this.interactionIsActive = false; // Renamed `started`
        },

        // Cleans up mouse event handlers.
        // Renamed `_mouseDestroy` to `teardownMouseListeners`.
        teardownMouseListeners: function() {
            this.targetElement.off(`.${this.componentName}`); // Unbind all namespaced events.

            // Restore IE text selection state.
            if (_D.agent.isIE) {
                this.targetElement.attr('unselectable', this.cachedUnselectableState);
            }
        },

        // Handler for the `mousedown` event.
        // Renamed `_mouseDown` to `handleMouseDown`.
        handleMouseDown: function(domMouseEvent) { // Renamed `event`
            // Ensure only one component handles the mouse interaction for a given event.
            if (domMouseEvent.originalEvent && domMouseEvent.originalEvent.mouseHandled) {
                return;
            }

            // If a previous mouse interaction was active but `mouseup` was missed, clean it up.
            if (this.interactionIsActive) { // Renamed `_mouseStarted`
                this.handleMouseUp(domMouseEvent);
            }

            this.initialMouseDownEvent = domMouseEvent; // Renamed `_mouseDownEvent`

            const isLeftButton = (domMouseEvent.which === 1); // Renamed `btnIsLeft`
            const isTargetCanceled = (typeof this.options.cancel === "string"
                ? _D(domMouseEvent.target).parents().add(domMouseEvent.target).filter(this.options.cancel).length > 0
                : false); // Renamed `elIsCancel`

            // Exit if not a left-click, or if the target element is configured to cancel interaction,
            // or if the component's `captureMouseInput` method explicitly prevents it.
            if (!isLeftButton || isTargetCanceled || !this.captureMouseInput(domMouseEvent)) { // Renamed `_mouseCapture`
                return true; // Allow default browser behavior.
            }

            this.delayRequirementMet = !this.options.delay; // Renamed `mouseDelayMet`
            if (!this.delayRequirementMet) {
                this.delayTimerId = setTimeout(() => { // Renamed `_mouseDelayTimer`, use arrow function.
                    this.delayRequirementMet = true;
                }, this.options.delay);
            }

            // If distance and delay conditions are met immediately (e.g., delay is 0).
            if (this.checkMouseDistance(domMouseEvent) && this.checkMouseDelay()) { // Renamed `_mouseDistanceMet`, `_mouseDelayMet`
                this.interactionIsActive = (this.initiateMouseStart(domMouseEvent) !== false); // Renamed `_mouseStarted`, `_mouseStart`
                if (!this.interactionIsActive) {
                    domMouseEvent.preventDefault();
                    return true;
                }
            }

            // Bind global mouse move and up handlers to `document` to capture events
            // even if the mouse leaves the original element.
            this.mouseMoveDelegate = (e) => this.handleMouseMove(e); // Renamed `_mouseMoveDelegate`
            this.mouseUpDelegate = (e) => this.handleMouseUp(e); // Renamed `_mouseUpDelegate`

            _D(document)
                .on(`mousemove.${this.componentName}`, this.mouseMoveDelegate)
                .on(`mouseup.${this.componentName}`, this.mouseUpDelegate);

            // Prevent default browser actions like text selection.
            domMouseEvent.preventDefault();

            // Mark the original event as handled to prevent other components from processing it.
            if (domMouseEvent.originalEvent) {
                domMouseEvent.originalEvent.mouseHandled = true;
            }
            return true;
        },

        // Handler for the `mousemove` event.
        // Renamed `_mouseMove` to `handleMouseMove`.
        handleMouseMove: function(domMouseEvent) { // Renamed `event`
            // If the mouse interaction is already active, perform the drag action.
            if (this.interactionIsActive) {
                this.performMouseDrag(domMouseEvent); // Renamed `_mouseDrag`
                return domMouseEvent.preventDefault();
            }

            // If not yet active, check if distance and delay conditions are met to start interaction.
            if (this.checkMouseDistance(domMouseEvent) && this.checkMouseDelay()) {
                this.interactionIsActive = (this.initiateMouseStart(this.initialMouseDownEvent, domMouseEvent) !== false);
                if (this.interactionIsActive) {
                    this.performMouseDrag(domMouseEvent);
                } else {
                    this.handleMouseUp(domMouseEvent); // If start failed, trigger a mouseup.
                }
            }

            return !this.interactionIsActive;
        },

        // Handler for the `mouseup` event.
        // Renamed `_mouseUp` to `handleMouseUp`.
        handleMouseUp: function(domMouseEvent) { // Renamed `event`
            // Unbind global mouse event handlers.
            _D(document)
                .off(`mousemove.${this.componentName}`, this.mouseMoveDelegate)
                .off(`mouseup.${this.componentName}`, this.mouseUpDelegate);

            if (this.interactionIsActive) {
                this.interactionIsActive = false;
                // Determine if the next click event should be blocked (e.g., after a drag).
                this.shouldBlockNextClick = (domMouseEvent.target === this.initialMouseDownEvent.target); // Renamed `_preventClickEvent`, `_mouseDownEvent`
                this.concludeMouseStop(domMouseEvent); // Renamed `_mouseStop`
            }

            // Clear any pending delay timer.
            if (this.delayTimerId) {
                clearTimeout(this.delayTimerId);
                this.delayTimerId = null;
            }

            return false; // Prevent default browser action.
        },

        // Helper to check if mouse movement has exceeded the configured distance threshold.
        // Renamed `_mouseDistanceMet` to `checkMouseDistance`.
        checkMouseDistance: function(currentMouseEvent) {
            const distanceThreshold = this.options.distance || 0; // Default to 0 distance.
            if (distanceThreshold === 0) {
                return true;
            }
            const deltaX = currentMouseEvent.pageX - this.initialMouseDownEvent.pageX;
            const deltaY = currentMouseEvent.pageY - this.initialMouseDownEvent.pageY;
            // Use squared distance for efficiency (avoid Math.sqrt).
            return (deltaX * deltaX + deltaY * deltaY >= distanceThreshold * distanceThreshold);
        },

        // Helper to check if the mouse delay period has passed.
        // Renamed `_mouseDelayMet` to `checkMouseDelay`.
        checkMouseDelay: function() {
            return this.delayRequirementMet;
        },

        // Placeholder methods to be implemented by specific components extending mouse interaction.
        captureMouseInput: _D.noop,     // Renamed `_mouseCapture`
        initiateMouseStart: _D.noop,    // Renamed `_mouseStart`
        performMouseDrag: _D.noop,      // Renamed `_mouseDrag`
        concludeMouseStop: _D.noop      // Renamed `_mouseStop`
    };

    return _D.kit; // Return the DomUtils Kit object.
}));