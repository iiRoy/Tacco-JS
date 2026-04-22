const InterfaceCore = (function() {
    let identifierSeed = 0;
    const generatedIdentifiers = new WeakSet();
    const identifierPrefix = 'app-unit-';

    const globalRepository = {
        revision: "2.0.0",
        controlKeys: {
            BACK_SPACE: 8,
            COMMA_SEPARATOR: 188,
            KEY_DELETE: 46,
            ARROW_DOWN: 40,
            KEY_END: 35,
            KEY_ENTER: 13,
            KEY_ESCAPE: 27,
            KEY_HOME: 36,
            ARROW_LEFT: 37,
            NUM_ADD: 107,
            NUM_DECIMAL: 110,
            NUM_DIVIDE: 111,
            NUM_ENTER: 108,
            NUM_MULTIPLY: 106,
            NUM_SUBTRACT: 109,
            PAGE_DOWN_KEY: 34,
            PAGE_UP_KEY: 33,
            PERIOD_CHAR: 190,
            ARROW_RIGHT: 39,
            SPACE_BAR: 32,
            TAB_KEY: 9,
            ARROW_UP: 38
        },
        elementContains: (parentElem, childElem) => parentElem.contains(childElem)
    };

    const obtainStyleValue = (element, property) => {
        if (!element || element.nodeType !== Node.ELEMENT_NODE) return '';
        return window.getComputedStyle(element).getPropertyValue(property);
    };

    globalRepository.checkScrollability = (element, direction) => {
        if (!element || element.nodeType !== Node.ELEMENT_NODE) return false;

        const currentOverflow = obtainStyleValue(element, 'overflow');
        if (currentOverflow === 'hidden') return false;

        const isHorizontal = direction === 'horizontal';
        const scrollDimension = isHorizontal ? 'scrollWidth' : 'scrollHeight';
        const clientDimension = isHorizontal ? 'clientWidth' : 'clientHeight';
        const scrollPosition = isHorizontal ? 'scrollLeft' : 'scrollTop';

        if (element[scrollDimension] > element[clientDimension]) {
            return true;
        }

        const originalScrollPos = element[scrollPosition];
        element[scrollPosition] = 1;
        const hasScrolled = element[scrollPosition] > 0;
        element[scrollPosition] = originalScrollPos;
        return hasScrolled;
    };

    globalRepository.isCoordinateWithinAxis = (val, axisStart, axisSize) =>
        (val > axisStart) && (val < (axisStart + axisSize));

    globalRepository.isPointOverElement = (yCoord, xCoord, topPos, leftPos, elemHeight, elemWidth) =>
        globalRepository.isCoordinateWithinAxis(yCoord, topPos, elemHeight) &&
        globalRepository.isCoordinateWithinAxis(xCoord, leftPos, elemWidth);

    class DOMElementManager {
        constructor(elements) {
            this.elements = [];
            if (elements instanceof NodeList || Array.isArray(elements)) {
                 this.elements = Array.from(elements);
            } else if (elements instanceof HTMLElement) {
                this.elements = [elements];
            } else if (typeof elements === 'string') {
                this.elements = Array.from(document.querySelectorAll(elements));
            } else if (elements && elements.nodeType === Node.ELEMENT_NODE) { // For single DOM node
                this.elements = [elements];
            }
        }

        traverse(callback) {
            this.elements.forEach((elem, index) => callback.call(elem, index, elem));
            return this;
        }

        setFocus(delayMilliseconds, actionCallback) {
            if (typeof delayMilliseconds === "number") {
                this.traverse(function() {
                    const currentElement = this;
                    setTimeout(() => {
                        currentElement.focus();
                        if (actionCallback) {
                            actionCallback.call(currentElement);
                        }
                    }, delayMilliseconds);
                });
            } else {
                this.traverse(function() {
                    this.focus();
                });
            }
            return this;
        }

        findScrollContainer() {
            if (this.elements.length === 0) return new DOMElementManager(null);
            const targetElement = this.elements[0];
            if (!targetElement || targetElement.nodeType !== Node.ELEMENT_NODE) return new DOMElementManager(null);

            const initialPosition = obtainStyleValue(targetElement, 'position');
            let potentialParent = targetElement.parentNode;

            while (potentialParent && potentialParent !== document.body && potentialParent !== document.documentElement) {
                const parentPosition = obtainStyleValue(potentialParent, 'position');
                const parentOverflowX = obtainStyleValue(potentialParent, 'overflow-x');
                const parentOverflowY = obtainStyleValue(potentialParent, 'overflow-y');

                const isPositioned = ['relative', 'absolute', 'fixed'].includes(parentPosition);
                const isScrollable = ['auto', 'scroll'].includes(parentOverflowX) || ['auto', 'scroll'].includes(parentOverflowY);

                const shouldCheckPosition = (['static', 'relative'].includes(initialPosition) && isPositioned) || (initialPosition === 'absolute');

                if (isScrollable && (!shouldCheckPosition || isPositioned)) {
                    return new DOMElementManager(potentialParent);
                }
                potentialParent = potentialParent.parentNode;
            }

            if (initialPosition === 'fixed' || !potentialParent) {
                return new DOMElementManager(document.documentElement);
            }
            return new DOMElementManager(null);
        }

        getOrSetDepthOrder(newDepth) {
            if (newDepth !== undefined) {
                this.traverse(function() {
                    this.style.zIndex = newDepth;
                });
                return this;
            }

            if (this.elements.length === 0) return 0;
            let currentElement = this.elements[0];

            while (currentElement && currentElement !== document.body && currentElement !== document.documentElement) {
                const currentPosition = obtainStyleValue(currentElement, 'position');
                if (['absolute', 'relative', 'fixed'].includes(currentPosition)) {
                    const depthValue = parseInt(obtainStyleValue(currentElement, 'z-index'), 10);
                    if (!isNaN(depthValue) && depthValue !== 0) {
                        return depthValue;
                    }
                }
                currentElement = currentElement.parentNode;
            }
            return 0;
        }

        assignUniqueElementId() {
            this.traverse(function() {
                if (!this.id || generatedIdentifiers.has(this.id)) {
                    let newId;
                    do {
                        newId = identifierPrefix + (++identifierSeed);
                    } while (document.getElementById(newId));
                    this.id = newId;
                    generatedIdentifiers.add(this.id);
                }
            });
            return this;
        }

        clearAssignedElementId() {
            this.traverse(function() {
                if (this.id && this.id.startsWith(identifierPrefix) && generatedIdentifiers.has(this.id)) {
                    this.removeAttribute('id');
                    generatedIdentifiers.delete(this.id);
                }
            });
            return this;
        }

        applyStyle(prop, val) {
            this.traverse(function() {
                if (typeof prop === 'object') {
                    for (const key in prop) {
                        this.style[key] = prop[key];
                    }
                } else {
                    this.style[prop] = val;
                }
            });
            return this;
        }

        accessAttribute(attrName, attrValue) {
            if (attrValue !== undefined) {
                this.traverse(function() {
                    this.setAttribute(attrName, attrValue);
                });
                return this;
            }
            return this.elements.length > 0 ? this.elements[0].getAttribute(attrName) : null;
        }

        findAncestors() {
            if (this.elements.length === 0) return new DOMElementManager(null);
            let current = this.elements[0];
            const ancestors = [];
            while ((current = current.parentNode) && current.nodeType === Node.ELEMENT_NODE && current !== document.documentElement) {
                ancestors.push(current);
            }
            return new DOMElementManager(ancestors);
        }

        filterElements(predicate) {
            return new DOMElementManager(this.elements.filter(predicate));
        }

        firstElement() {
            return new DOMElementManager(this.elements.length > 0 ? this.elements[0] : null);
        }

        get count() {
            return this.elements.length;
        }

        addEventHandler(eventName, handler, selector) {
            this.traverse(function() {
                if (selector) {
                    this.addEventListener(eventName, function(event) {
                        if (event.target.matches(selector)) {
                            handler.call(event.target, event);
                        } else {
                            let current = event.target;
                            while (current && current !== this) {
                                if (current.matches(selector)) {
                                    handler.call(current, event);
                                    break;
                                }
                                current = current.parentNode;
                            }
                        }
                    });
                } else {
                    this.addEventListener(eventName, handler);
                }
            });
            return this;
        }

        removeEventHandler(eventName, handler) {
            this.traverse(function() {
                this.removeEventListener(eventName, handler);
            });
            return this;
        }

        calculateBoxDimension(type, includeMargin) {
            if (this.elements.length === 0) return 0;
            const element = this.elements[0];
            const rect = element.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(element);

            let value;
            if (type === 'width') {
                value = rect.width;
                if (includeMargin) {
                    value += parseFloat(computedStyle.marginLeft) + parseFloat(computedStyle.marginRight);
                }
            } else {
                value = rect.height;
                if (includeMargin) {
                    value += parseFloat(computedStyle.marginTop) + parseFloat(computedStyle.marginBottom);
                }
            }
            return value;
        }
    }

    const getDOM = (selectorOrElement) => new DOMElementManager(selectorOrElement);

    globalRepository.environmentSupport = {};

    document.addEventListener('DOMContentLoaded', () => {
        const testContainer = document.createElement('div');
        document.body.appendChild(testContainer);

        testContainer.style.minHeight = "100px";
        testContainer.style.height = "auto";
        testContainer.style.padding = "0";
        testContainer.style.borderWidth = "0";
        testContainer.offsetHeight;
        globalRepository.environmentSupport.minimumHeight = testContainer.offsetHeight === 100;

        globalRepository.environmentSupport.canPreventSelection = 'onselectstart' in testContainer;

        document.body.removeChild(testContainer).style.display = "none";
    });

    const isVisible = (element) => {
        if (!element || element.nodeType !== Node.ELEMENT_NODE) return false;
        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0) {
            return false;
        }
        let current = element;
        while (current && current !== document.documentElement) {
            const currentStyle = window.getComputedStyle(current);
            if (currentStyle.display === 'none' || currentStyle.visibility === 'hidden' || parseFloat(currentStyle.opacity) === 0) {
                return false;
            }
            current = current.parentNode;
        }
        return true;
    };

    const isFocusableElement = (element, checkTabIndex) => {
        if (!element || element.nodeType !== Node.ELEMENT_NODE) return false;
        const tagName = element.tagName.toLowerCase();

        const isInteractive = ['input', 'select', 'textarea', 'button', 'object'].includes(tagName);
        if (isInteractive) {
            return !element.disabled && isVisible(element);
        }

        if (tagName === 'a') {
            return (element.hasAttribute('href') || checkTabIndex) && isVisible(element);
        }

        if (checkTabIndex) {
            const tabIndex = parseInt(element.getAttribute('tabindex'), 10);
            return !isNaN(tabIndex) && tabIndex >= 0 && isVisible(element);
        }

        return false;
    };

    globalRepository.isElementFocusable = isFocusableElement;

    globalRepository.isElementTabbable = (element) => {
        const tabIndexAttr = element.getAttribute('tabindex');
        const isTabIndexValid = tabIndexAttr !== null && !isNaN(parseInt(tabIndexAttr, 10)) && parseInt(tabIndexAttr, 10) >= 0;
        return isFocusableElement(element, isTabIndexValid);
    };

    const selectionPreventer = (event) => event.preventDefault();

    globalRepository.selectionDisabler = (targetElements) => {
        getDOM(targetElements).traverse(function() {
            const eventType = globalRepository.environmentSupport.canPreventSelection ? "selectstart" : "mousedown";
            this.addEventListener(eventType, selectionPreventer, { capture: true });
            this.__selectionPreventer = this.__selectionPreventer || {};
            this.__selectionPreventer[eventType] = selectionPreventer;
        });
        return getDOM(targetElements);
    };

    globalRepository.selectionEnabler = (targetElements) => {
        getDOM(targetElements).traverse(function() {
            const eventType = globalRepository.environmentSupport.canPreventSelection ? "selectstart" : "mousedown";
            if (this.__selectionPreventer && this.__selectionPreventer[eventType]) {
                this.removeEventListener(eventType, this.__selectionPreventer[eventType], { capture: true });
                delete this.__selectionPreventer[eventType];
            }
        });
        return getDOM(targetElements);
    };

    globalRepository.modularSystem = {
        registries: {},

        enrollModule: function(moduleName, moduleOption, processFunction) {
            if (!this.registries[moduleName]) {
                this.registries[moduleName] = {};
            }
            if (!this.registries[moduleName][moduleOption]) {
                this.registries[moduleName][moduleOption] = [];
            }
            this.registries[moduleName][moduleOption].push(processFunction);
        },

        invokeModuleProcesses: function(instanceRef, optionName, argsArray) {
            if (!instanceRef || !instanceRef.associatedElement || !instanceRef.associatedElement.parentNode) {
                return;
            }
            const moduleName = instanceRef.moduleIdentifier;
            const processes = this.registries[moduleName]?.[optionName];

            if (processes) {
                processes.forEach(processFunc => {
                    if (instanceRef.currentOptions[optionName]) {
                        processFunc.apply(instanceRef.associatedElement, argsArray);
                    }
                });
            }
        }
    };

    return {
        interface: globalRepository,
        dom: getDOM,
    };

})();

const AppUI = InterfaceCore.interface;
const queryDOM = InterfaceCore.dom;

AppUI.calendar = {
    release: "2.0.0"
};

let widgetUniqueIdCounter = 0;
let activeWidgetInstance = null;

class CalendarWidget {
    constructor() {
        this.traceEnabled = false;
        this.currentActiveInstance = null;
        this.wasKeyEvent = false;
        this.disabledControls = [];
        this.widgetIsVisible = false;
        this.inDialogueMode = false;
        this.mainContainerId = 'app-calendar-container';
        this.regionalSettings = {};
        this.regionalSettings[''] = {
            exitLabel: 'Conclude',
            backLabel: 'Previous',
            forwardLabel: 'Next',
            todayLabel: 'Present',
            monthNamesFull: ['January','February','March','April','May','June',
            'July','August','September','October','November','December'],
            monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            dayNamesFull: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            dayNamesMin: ['Su','Mo','Tu','We','Th','Fr','Sa'],
            weekHeaderLabel: 'Wk',
            datePattern: 'MM/DD/YYYY',
            startOfWeek: 0,
            rightToLeftLayout: false,
            yearAfterMonth: false,
            yearAppendText: ''
        };

        this.defaultOptions = {
            displayTrigger: 'focus',
            animationEffect: 'fade-in',
            animationOptions: {},
            initialDate: null,
            constraintInput: true,
            displayButtonPanel: false,
            autoSizeInput: false,
            initialDisabled: false
        };
        Object.assign(this.defaultOptions, this.regionalSettings['']);

        const widgetDivElement = document.createElement('div');
        widgetDivElement.id = this.mainContainerId;
        widgetDivElement.className = 'app-calendar app-widget app-widget-content app-helper-clearfix app-corner-all';
        this.widgetDiv = widgetDivElement;

        this.widgetDiv.addEventListener('mouseenter', () => this.widgetDiv.classList.add('hovered'));
        this.widgetDiv.addEventListener('mouseleave', () => this.widgetDiv.classList.remove('hovered'));
    }

    logActivity() {
        if (this.traceEnabled) {
            console.log.apply(console, arguments);
        }
    }

    getWidgetElement() {
        return this.widgetDiv;
    }

    updateGlobalOptions(newOptions) {
        Object.assign(this.defaultOptions, newOptions || {});
        return this;
    }

    _createWidgetInstance(targetElement, isInline) {
        const instanceData = {
            target: targetElement,
            isInline: isInline,
            elementId: targetElement.id,
            settings: {}
        };
        return instanceData;
    }

    initializeCalendar(targetControl, instanceOptions) {
        let elementOptions = null;
        for (const optKey in this.defaultOptions) {
            const attrVal = targetControl.getAttribute('data-calendar-' + optKey.toLowerCase());
            if (attrVal !== null) {
                elementOptions = elementOptions || {};
                try {
                    elementOptions[optKey] = JSON.parse(attrVal);
                } catch (err) {
                    elementOptions[optKey] = attrVal;
                }
            }
        }

        const controlTag = targetControl.tagName.toLowerCase();
        const isControlInline = (controlTag === 'div' || controlTag === 'span');

        if (!targetControl.id) {
            targetControl.id = 'calendar-control-' + (++widgetUniqueIdCounter);
        }

        const newInstance = this._createWidgetInstance(targetControl, isControlInline);
        newInstance.settings = Object.assign({}, instanceOptions || {}, elementOptions || {});

        if (controlTag === 'input') {
            this._setupInputControl(targetControl, newInstance);
        } else if (isControlInline) {
            this._setupInlineControl(targetControl, newInstance);
        }
        return newInstance;
    }

    _setupInputControl(inputElement, instance) {
        inputElement.classList.add('has-calendar-control');
        inputElement.addEventListener('focus', () => {
            this.currentActiveInstance = instance;
            this.logActivity('Input focused, showing calendar for', instance.elementId);
            this.widgetIsVisible = true;
            queryDOM(this.widgetDiv).applyStyle('display', 'block');
        });
    }

    _setupInlineControl(containerElement, instance) {
        containerElement.classList.add('has-calendar-control');
        containerElement.classList.add('app-calendar-inline');
        this.currentActiveInstance = instance;
        this.logActivity('Inline calendar setup for', instance.elementId);
        containerElement.appendChild(this.widgetDiv);
        this.widgetIsVisible = true;
    }
}

AppUI.calendarManager = new CalendarWidget();

DOMElementManager.prototype.initCalendar = function(options) {
    this.traverse(function() {
        AppUI.calendarManager.initializeCalendar(this, options);
    });
    return this;
};