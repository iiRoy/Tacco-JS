const ComponentKit = {};

const elementDataStore = new WeakMap();

// Deep merge utility, replacing $.extend(true, ...)
function deepMerge(...objects) {
    const target = {};

    const merger = (obj) => {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                    target[key] = deepMerge(target[key] || {}, obj[key]);
                } else {
                    target[key] = obj[key];
                }
            }
        }
    };

    objects.forEach(obj => {
        if (obj) merger(obj);
    });

    return target;
}

// Global factory function for DomWrapper, mimicking jQuery's $()
const selectDom = (selectorOrElement) => new DomWrapper(selectorOrElement);

// Helper function for event listeners that need to prevent default
function preventDefaultBehavior(event) {
    event.preventDefault();
    return false;
}

// Mimics jQuery object functionality
class DomWrapper {
    constructor(elements) {
        if (typeof elements === 'string') {
            this.elements = Array.from(document.querySelectorAll(elements));
        } else if (elements instanceof HTMLElement || elements instanceof Document || elements instanceof Window) {
            this.elements = [elements];
        } else if (Array.isArray(elements) || elements instanceof NodeList || elements instanceof HTMLCollection) {
            this.elements = Array.from(elements);
        } else {
            this.elements = [];
        }
    }

    get length() {
        return this.elements.length;
    }

    // Mimic .eq(0)
    first() {
        return this.elements.length > 0 ? new DomWrapper(this.elements[0]) : new DomWrapper([]);
    }

    // Mimic .each()
    processEach(callback) {
        this.elements.forEach((element, index) => callback.call(element, index, element));
        return this;
    }

    // Mimic .css()
    applyStyle(property, value) {
        if (value === undefined) { // Getter
            if (this.elements.length > 0) {
                return getComputedStyle(this.elements[0])[property];
            }
            return undefined;
        }
        // Setter
        this.elements.forEach(element => {
            element.style[property] = value;
        });
        return this;
    }

    // Mimic .attr()
    manageAttribute(attributeName, attributeValue) {
        if (attributeValue === undefined) { // Getter
            if (this.elements.length > 0) {
                return this.elements[0].getAttribute(attributeName);
            }
            return undefined;
        }
        // Setter
        this.elements.forEach(element => {
            element.setAttribute(attributeName, attributeValue);
        });
        return this;
    }

    // Mimic .removeAttr()
    clearAttribute(attributeName) {
        this.elements.forEach(element => {
            element.removeAttribute(attributeName);
        });
        return this;
    }

    // Mimic .bind() / .on()
    listen(eventName, handler, options) {
        this.elements.forEach(element => {
            element.addEventListener(eventName, handler, options);
        });
        return this;
    }

    // Mimic .unbind() / .off()
    stopListening(eventName, handler, options) {
        this.elements.forEach(element => {
            element.removeEventListener(eventName, handler, options);
        });
        return this;
    }

    // Mimic .trigger() / .triggerHandler()
    dispatchCustomEvent(eventName, detail) {
        this.elements.forEach(element => {
            const event = new CustomEvent(eventName, {
                bubbles: true,
                cancelable: true,
                detail: detail
            });
            element.dispatchEvent(event);
        });
        return this;
    }

    // Mimic .addClass()
    addStyleClass(className) {
        this.elements.forEach(element => element.classList.add(className));
        return this;
    }

    // Mimic .removeClass()
    removeStyleClass(className) {
        this.elements.forEach(element => element.classList.remove(className));
        return this;
    }

    // Mimic .remove() - custom behavior
    eradicate() {
        this.elements.forEach(element => {
            const descendants = element.querySelectorAll('*');
            new DomWrapper(descendants).dispatchCustomEvent('componentRemoved');
            new DomWrapper(element).dispatchCustomEvent('componentRemoved');

            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
        return this;
    }

    // Mimic .parents()
    findAncestors(selector) {
        const ancestors = new Set();
        this.elements.forEach(element => {
            let current = element.parentElement;
            while (current) {
                if (!selector || current.matches(selector)) {
                    ancestors.add(current);
                }
                current = current.parentElement;
            }
        });
        return new DomWrapper(Array.from(ancestors));
    }

    // Mimic .add()
    combine(otherDomWrapper) {
        const combined = new Set(this.elements);
        otherDomWrapper.elements.forEach(el => combined.add(el));
        return new DomWrapper(Array.from(combined));
    }

    // Mimic .filter()
    filterElements(predicate) {
        return new DomWrapper(this.elements.filter(predicate));
    }

    // Mimic .is()
    matchesSelector(selector) {
        if (this.elements.length === 0) return false;
        return this.elements[0].matches(selector);
    }

    // Mimic .closest()
    findClosest(selector) {
        if (this.elements.length === 0) return new DomWrapper([]);
        const closestElement = this.elements[0].closest(selector);
        return closestElement ? new DomWrapper(closestElement) : new DomWrapper([]);
    }

    // Mimic .focus()
    focusElement(delayMs, callback) {
        if (typeof delayMs === 'number') {
            this.processEach(function() {
                const currentElement = this;
                setTimeout(() => {
                    currentElement.focus();
                    if (callback) callback.call(currentElement);
                }, delayMs);
            });
        } else {
            this.processEach(function() {
                this.focus();
            });
        }
        return this;
    }

    // Replacing $.data / $.fn.removeData - using WeakMap for private data storage
    storeData(key, value) {
        this.processEach(function() {
            if (!elementDataStore.has(this)) {
                elementDataStore.set(this, {});
            }
            elementDataStore.get(this)[key] = value;
        });
        return this;
    }

    retrieveData(key) {
        if (this.elements.length > 0) {
            const data = elementDataStore.get(this.elements[0]);
            return data ? data[key] : undefined;
        }
        return undefined;
    }

    clearData(key) {
        this.processEach(function() {
            if (elementDataStore.has(this)) {
                delete elementDataStore.get(this)[key];
            }
        });
        return this;
    }

    allowSelection() {
        return this
            .manageAttribute('unselectable', 'off')
            .applyStyle('user-select', '')
            .applyStyle('-moz-user-select', '')
            .stopListening('selectstart', preventDefaultBehavior);
    }

    preventSelection() {
        return this
            .manageAttribute('unselectable', 'on')
            .applyStyle('user-select', 'none')
            .applyStyle('-moz-user-select', 'none')
            .listen('selectstart', preventDefaultBehavior);
    }

    // Replacing $.fn.scrollParent
    findScrollingParent() {
        if (this.elements.length === 0) return selectDom(document);

        const currentElement = this.elements[0];
        const elementComputedStyle = getComputedStyle(currentElement);
        const elementPosition = elementComputedStyle.position;

        if (elementPosition === 'fixed') {
            return selectDom(document);
        }

        let parent = currentElement.parentElement;
        while (parent && parent !== document.body && parent !== document.documentElement) {
            const parentComputedStyle = getComputedStyle(parent);
            const parentPosition = parentComputedStyle.position;
            const overflowY = parentComputedStyle.overflowY;
            const overflowX = parentComputedStyle.overflowX;

            const isParentScrollable = (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') ||
                                       (overflowX === 'auto' || overflowX === 'scroll' || overflowX === 'overlay');

            // Original logic: if element is absolute, or (IE and element is static/relative),
            // then parent must be positioned AND scrollable. Otherwise, just scrollable.
            // This is a simplified interpretation of the original's complex jQuery.browser check.
            const needsPositionedParent = (elementPosition === 'absolute' || elementPosition === 'relative');

            if (isParentScrollable) {
                if (needsPositionedParent && (parentPosition === 'relative' || parentPosition === 'absolute' || parentPosition === 'fixed')) {
                    return selectDom(parent);
                } else if (!needsPositionedParent) {
                    return selectDom(parent);
                }
            }
            parent = parent.parentElement;
        }

        return selectDom(document);
    }
}

// Replacing jQuery.ui.keyCode
ComponentKit.keyCodes = Object.freeze({
    BACKSPACE_KEY: 8,
    CAPS_LOCK_KEY: 20,
    COMMA_KEY: 188,
    CONTROL_KEY: 17,
    DELETE_KEY: 46,
    DOWN_KEY: 40,
    END_KEY: 35,
    ENTER_KEY: 13,
    ESCAPE_KEY: 27,
    HOME_KEY: 36,
    INSERT_KEY: 45,
    LEFT_KEY: 37,
    NUMPAD_ADD_KEY: 107,
    NUMPAD_DECIMAL_KEY: 110,
    NUMPAD_DIVIDE_KEY: 111,
    NUMPAD_ENTER_KEY: 108,
    NUMPAD_MULTIPLY_KEY: 106,
    NUMPAD_SUBTRACT_KEY: 109,
    PAGE_DOWN_KEY: 34,
    PAGE_UP_KEY: 33,
    PERIOD_KEY: 190,
    RIGHT_KEY: 39,
    SHIFT_KEY: 16,
    SPACE_KEY: 32,
    TAB_KEY: 9,
    UP_KEY: 38
});

// Replacing $.ui.contains
ComponentKit.domContains = (elementA, elementB) => {
    if (elementA.compareDocumentPosition) {
        return (elementA.compareDocumentPosition(elementB) & Node.DOCUMENT_POSITION_CONTAINED_BY) !== 0;
    }
    return elementA !== elementB && elementA.contains(elementB);
};

// Replacing $.ui.hasScroll
ComponentKit.hasContentScroll = (targetElement, axis) => {
    const computedStyle = getComputedStyle(targetElement);
    if (computedStyle.overflow === 'hidden') {
        return false;
    }

    let scrollProp = '';
    if (axis === 'horizontal') {
        scrollProp = 'scrollLeft';
    } else {
        scrollProp = 'scrollTop';
    }

    if (targetElement[scrollProp] > 0) {
        return true;
    }

    const originalScroll = targetElement[scrollProp];
    targetElement[scrollProp] = 1;
    const canScroll = (targetElement[scrollProp] > 0);
    targetElement[scrollProp] = originalScroll;
    return canScroll;
};

// Replacing $.ui.isOverAxis
ComponentKit.isWithinAxis = (coordinate, referenceStart, size) => {
    return (coordinate > referenceStart) && (coordinate < (referenceStart + size));
};

// Replacing $.ui.isOver
ComponentKit.isPointOverElement = (yCoord, xCoord, topPos, leftPos, elementHeight, elementWidth) => {
    return ComponentKit.isWithinAxis(yCoord, topPos, elementHeight) &&
           ComponentKit.isWithinAxis(xCoord, leftPos, elementWidth);
};

// --- Custom selectors (replacing $.expr[':']) ---
ComponentKit.selectorUtilities = {
    // Replaces `$.expr[':'].data`
    hasAssociatedData: (element, dataKey) => {
        return !!selectDom(element).retrieveData(dataKey);
    },

    // Replaces `$.expr[':'].focusable`
    isFocusable: (element) => {
        const nodeTagName = element.tagName.toLowerCase();
        const tabIndexAttr = element.getAttribute('tabindex');
        const tabIndexValue = parseInt(tabIndexAttr, 10);

        const isNaturallyFocusable = /^(?:input|select|textarea|button|object)$/.test(nodeTagName) && !element.disabled;
        const isLinkOrAreaWithHref = /^(?:a|area)$/.test(nodeTagName) && element.href !== null;
        const isTabIndexExplicitlyFocusable = !isNaN(tabIndexValue) && tabIndexValue >= 0;

        const isElementFocusCandidate = isNaturallyFocusable || isLinkOrAreaWithHref || isTabIndexExplicitlyFocusable;

        if (!isElementFocusCandidate) return false;

        let current = element;
        while (current) {
            const computedStyle = getComputedStyle(current);
            if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden' ||
                (current.offsetWidth === 0 && current.offsetHeight === 0 && current.tagName.toLowerCase() !== 'body' && current.tagName.toLowerCase() !== 'html')) {
                return false;
            }
            current = current.parentElement;
        }

        return true;
    },

    // Replaces `$.expr[':'].tabbable`
    isTabbable: (element) => {
        const tabIndexAttr = element.getAttribute('tabindex');
        const tabIndexValue = parseInt(tabIndexAttr, 10);

        const isTabIndexValidForTabbing = isNaN(tabIndexValue) ? true : (tabIndexValue >= 0);
        return isTabIndexValidForTabbing && ComponentKit.selectorUtilities.isFocusable(element);
    }
};

// Base class for all components, replacing $.widget.prototype
class BaseComponent {
    constructor(domElement, componentOptions) {
        this.hostElement = domElement;
        this.componentIdentifier = null;
        this.componentType = null;
        this.eventPrefix = null;
        this.baseClass = null;

        this.settings = deepMerge(
            BaseComponent.defaults,
            this.constructor.defaults,
            componentOptions
        );

        selectDom(this.hostElement)
            .listen('modifyProperty', this.handleModifyProperty.bind(this))
            .listen('queryProperty', this.handleQueryProperty.bind(this))
            .listen('componentRemoved', this.destroyComponent.bind(this));
    }

    initialize() {}

    destroyComponent() {
        selectDom(this.hostElement)
            .clearData(this.componentIdentifier)
            .removeStyleClass(this.baseClass)
            .removeStyleClass(this.componentType + '-state-disabled')
            .clearAttribute('aria-disabled');

        selectDom(this.hostElement)
            .stopListening('modifyProperty', this.handleModifyProperty.bind(this))
            .stopListening('queryProperty', this.handleQueryProperty.bind(this))
            .stopListening('componentRemoved', this.destroyComponent.bind(this));

        if (typeof this.cleanup === 'function') {
            this.cleanup();
        }
    }

    manageOptions(key, value) {
        if (typeof key === 'string') {
            if (value === undefined) {
                return this.retrieveProperty(key);
            }
            const options = {};
            options[key] = value;
            return this.updateProperties(options);
        }
        return this.updateProperties(key);
    }

    retrieveProperty(key) {
        return this.settings[key];
    }

    updateProperty(key, value) {
        this.settings[key] = value;

        if (key === 'disabled') {
            selectDom(this.hostElement)
                [value ? 'addStyleClass' : 'removeStyleClass'](
                    this.baseClass + '-disabled ' +
                    this.componentType + '-state-disabled')
                .manageAttribute('aria-disabled', value.toString());
        }
    }

    updateProperties(optionsObject) {
        Object.keys(optionsObject).forEach(key => {
            this.updateProperty(key, optionsObject[key]);
        });
        return this;
    }

    activate() {
        this.updateProperty('disabled', false);
        return this;
    }

    deactivate() {
        this.updateProperty('disabled', true);
        return this;
    }

    emitEvent(eventType, eventData) {
        const callback = this.settings[eventType];
        const fullEventName = (eventType === this.eventPrefix)
            ? eventType
            : this.eventPrefix + eventType;

        const customEvent = new CustomEvent(fullEventName, {
            bubbles: true,
            cancelable: true,
            detail: eventData || {}
        });

        if (eventData && eventData.originalEvent) {
            Object.assign(customEvent.detail, eventData.originalEvent);
        }

        selectDom(this.hostElement).dispatchCustomEvent(fullEventName, customEvent.detail);

        let callbackResult = true;
        if (typeof callback === 'function') {
            callbackResult = callback.call(this.hostElement, customEvent, customEvent.detail) !== false;
        }

        return !(customEvent.defaultPrevented || !callbackResult);
    }

    handleModifyProperty(event) {
        if (event.target === this.hostElement && event.detail) {
            this.updateProperty(event.detail.key, event.detail.value);
        }
    }

    handleQueryProperty(event) {
        if (event.target === this.hostElement && event.detail) {
            event.detail.result = this.retrieveProperty(event.detail.key);
        }
    }
}

BaseComponent.defaults = {
    disabled: false
};

// Component Factory, replacing `$.widget`
ComponentKit.createComponent = (componentPath, componentPrototype) => {
    const parts = componentPath.split(".");
    const typeName = parts[0];
    const componentName = parts[1];
    const fullComponentName = typeName + '-' + componentName;

    const SpecificComponent = class extends BaseComponent {
        constructor(domElement, options) {
            super(domElement, options);
            this.componentIdentifier = componentName;
            this.componentType = typeName;
            this.eventPrefix = SpecificComponent.eventPrefix || componentName;
            this.baseClass = fullComponentName;

            this.settings = deepMerge(
                BaseComponent.defaults,
                SpecificComponent.defaults,
                options
            );

            Object.assign(this, componentPrototype);

            selectDom(this.hostElement).addStyleClass(this.baseClass);

            this.initialize();
        }
    };

    SpecificComponent.defaults = {};

    ComponentKit[typeName] = ComponentKit[typeName] || {};
    ComponentKit[typeName][componentName] = SpecificComponent;

    DomWrapper.prototype[componentName] = function(optionsOrMethod, ...args) {
        let returnValue = this;
        const isMethodCall = (typeof optionsOrMethod === 'string');

        if (isMethodCall && optionsOrMethod.startsWith('_')) {
            console.warn(`Attempted to call private method: ${optionsOrMethod}`);
            return returnValue;
        }

        this.processEach(function() {
            let instance = selectDom(this).retrieveData(componentName);

            if (isMethodCall) {
                if (instance && typeof instance[optionsOrMethod] === 'function') {
                    const methodResult = instance[optionsOrMethod](...args);
                    if (methodResult !== instance && methodResult !== undefined) {
                        returnValue = methodResult;
                        // For getters, only the first element's result is returned
                        if (this === returnValue.elements[0] && this === selectDom(this).elements[0]) {
                             return; // Exit current iteration
                        }
                    }
                } else {
                    console.warn(`Component "${componentName}" method "${optionsOrMethod}" not found or not initialized.`);
                }
            } else {
                if (!instance) {
                    instance = new SpecificComponent(this, optionsOrMethod);
                    selectDom(this).storeData(componentName, instance);
                } else {
                    if (optionsOrMethod) {
                        instance.manageOptions(optionsOrMethod);
                    }
                }
            }
        });

        return returnValue;
    };

    ComponentKit.selectorUtilities[fullComponentName] = (element) => {
        return !!selectDom(element).retrieveData(componentName);
    };
};

// Global flag to track if a mouse interaction is currently handled
window._globalMouseHandled = false;

// Mouse Interaction Module, replacing $.ui.mouse
class MouseInteractionMixin {
    constructor() {
        this.unselectableState = null;
        this.mouseActivityStarted = false;
        this.initialMouseEvent = null;
        this.delayMet = false;
        this.delayTimer = null;
        this.interactionActive = false;
        this.shouldPreventClick = false;

        this.moveDelegate = this.handleMouseMove.bind(this);
        this.upDelegate = this.handleMouseUp.bind(this);
    }

    initMouseHandling() {
        selectDom(this.hostElement)
            .listen('mousedown', this.handleMouseDown.bind(this))
            .listen('click', this.handleClick.bind(this));

        this.unselectableState = selectDom(this.hostElement).manageAttribute('unselectable');
        selectDom(this.hostElement).preventSelection();

        this.mouseActivityStarted = false;
    }

    destroyMouseHandling() {
        selectDom(this.hostElement)
            .stopListening('mousedown', this.handleMouseDown.bind(this))
            .stopListening('click', this.handleClick.bind(this));

        if (this.unselectableState !== null) {
            selectDom(this.hostElement).manageAttribute('unselectable', this.unselectableState);
        } else {
            selectDom(this.hostElement).clearAttribute('unselectable');
        }
        selectDom(this.hostElement).allowSelection();

        selectDom(document)
            .stopListening('mousemove', this.moveDelegate)
            .stopListening('mouseup', this.upDelegate);

        if (typeof this.mouseCleanup === 'function') {
            this.mouseCleanup();
        }
    }

    handleMouseDown(event) {
        if (window._globalMouseHandled) { return; }

        if (this.interactionActive) {
            this.handleMouseUp(event);
        }

        this.initialMouseEvent = event;

        const isLeftButton = (event.button === 0);
        const cancelSelector = this.retrieveProperty('cancel');
        const isElementCancelled = cancelSelector && (selectDom(event.target).findAncestors(cancelSelector).length > 0 || selectDom(event.target).matchesSelector(cancelSelector));

        if (!isLeftButton || isElementCancelled || !this.captureMouse(event)) {
            return;
        }

        this.delayMet = !this.retrieveProperty('delay');
        if (!this.delayMet) {
            clearTimeout(this.delayTimer);
            this.delayTimer = setTimeout(() => {
                this.delayMet = true;
                if (this.checkMouseDistance(event)) {
                    this.startMouseInteraction(event);
                }
            }, this.retrieveProperty('delay'));
        }

        if (this.checkMouseDistance(event) && this.checkMouseDelay(event)) {
            this.startMouseInteraction(event);
        }

        selectDom(document)
            .listen('mousemove', this.moveDelegate)
            .listen('mouseup', this.upDelegate);

        event.preventDefault();
        window._globalMouseHandled = true;
    }

    handleMouseMove(event) {
        if (event.buttons === 0) {
            return this.handleMouseUp(event);
        }

        if (this.interactionActive) {
            this.dragMouse(event);
            return event.preventDefault();
        }

        if (this.checkMouseDistance(event) && this.checkMouseDelay(event)) {
            this.interactionActive = (this.startMouseInteraction(this.initialMouseEvent, event) !== false);
            if (this.interactionActive) {
                this.dragMouse(event);
            } else {
                this.handleMouseUp(event);
            }
        }

        return !this.interactionActive;
    }

    handleMouseUp(event) {
        selectDom(document)
            .stopListening('mousemove', this.moveDelegate)
            .stopListening('mouseup', this.upDelegate);

        if (this.interactionActive) {
            this.interactionActive = false;
            this.shouldPreventClick = (event.target === this.initialMouseEvent.target);
            this.stopMouseInteraction(event);
        }

        clearTimeout(this.delayTimer);
        window._globalMouseHandled = false;
        return false;
    }

    checkMouseDistance(event) {
        const distance = this.retrieveProperty('distance');
        if (distance <= 0) { return true; }
        if (!this.initialMouseEvent) { return false; }

        const dx = Math.abs(this.initialMouseEvent.pageX - event.pageX);
        const dy = Math.abs(this.initialMouseEvent.pageY - event.pageY);
        return Math.max(dx, dy) >= distance;
    }

    checkMouseDelay(event) {
        return this.retrieveProperty('delay') <= 0 || this.delayMet;
    }

    captureMouse(event) {
        return true;
    }

    startMouseInteraction(initialEvent, currentEvent) {
        this.mouseActivityStarted = true;
        this.emitEvent('mouseStart', { originalEvent: initialEvent, currentEvent: currentEvent });
    }

    dragMouse(event) {
        this.emitEvent('mouseDrag', { originalEvent: this.initialMouseEvent, currentEvent: event });
    }

    stopMouseInteraction(event) {
        this.mouseActivityStarted = false;
        this.emitEvent('mouseStop', { originalEvent: this.initialMouseEvent, currentEvent: event });
    }

    handleClick(event) {
        if (this.shouldPreventClick) {
            event.stopImmediatePropagation();
            event.preventDefault();
            this.shouldPreventClick = false;
            return false;
        }
    }
}