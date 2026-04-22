const CoreUtil = (() => {
    let agentNameIdentifier = null;
    let agentSoftwareVersion = null;

    const performNoOperation = () => {};

    const determineAgentDetails = () => {
        const userAgentString = navigator.userAgent;
        if (userAgentString.includes('Opera')) {
            agentNameIdentifier = 'Opera';
        } else if (userAgentString.includes('MSIE')) {
            agentNameIdentifier = 'MSIE';
        } else if (userAgentString.includes('Safari')) {
            agentNameIdentifier = 'Safari';
        } else {
            agentNameIdentifier = 'Firefox';
        }

        const versionRegex = new RegExp(agentNameIdentifier + '[^0-9]*([0-9]+\\.*[0-9]+)');
        const versionMatch = userAgentString.match(versionRegex);
        agentSoftwareVersion = versionMatch ? parseFloat(versionMatch[1]) : 0;
    };

    determineAgentDetails();

    return {
        performNoOperation,
        getAgentName: () => agentNameIdentifier,
        getAgentVersion: () => agentSoftwareVersion
    };
})();

// Object property assignment utility (replaces Object.prototype.patch)
const propertyAssigner = {
    mergeProperties: (targetObject, ...sourceObjects) => {
        sourceObjects.forEach(source => {
            if (source) {
                for (const propertyKey in source) {
                    if (Object.prototype.hasOwnProperty.call(source, propertyKey)) {
                        targetObject[propertyKey] = source[propertyKey];
                    }
                }
            }
        });
        return targetObject;
    },
    // Replicates the original's specific toJSON behavior for string manipulation
    toUnwrappedString: (inputObject) => {
        if (typeof inputObject.toString === 'function') {
            return inputObject.toString().replace(/^\(new[^(]*\(|^\(|\)+$/g, '');
        }
        return String(inputObject);
    },
    toNumericIndexedArray: (inputObject) => {
        const result = [];
        if (inputObject && typeof inputObject.length === 'number' && inputObject.length >= 0) {
            for (let position = 0; position < inputObject.length; position++) {
                result.push(inputObject[position]);
            }
        }
        return result;
    }
};

// Constructor function builder (replaces Object.prototype.factory)
const ConstructorBuilder = {
    createConstructor: (configuration) => {
        const defaultOptions = {
            initializerFunction: false,
            baseConstructor: CoreUtil.performNoOperation,
            invokeBaseInitializer: false
        };
        const activeOptions = propertyAssigner.mergeProperties({}, defaultOptions, configuration || {});

        let finalInitializer = activeOptions.initializerFunction;
        if (!finalInitializer) {
            finalInitializer = configuration && configuration.init ? configuration.init : configuration && configuration.initialize ? configuration.initialize : CoreUtil.performNoOperation;
            if (typeof finalInitializer === 'string' && configuration && configuration[finalInitializer]) {
                finalInitializer = configuration[finalInitializer];
            }
        }
        if (typeof finalInitializer !== 'function') finalInitializer = CoreUtil.performNoOperation;

        const NewConstructor = function(...argumentsPassed) {
            if (activeOptions.invokeBaseInitializer && typeof this.baseConstructor === 'function') {
                this.baseConstructor.apply(this, argumentsPassed);
            }
            finalInitializer.apply(this, argumentsPassed);
        };

        propertyAssigner.mergeProperties(NewConstructor.prototype, activeOptions.baseConstructor.prototype, configuration, {
            baseConstructor: activeOptions.baseConstructor
        });
        return NewConstructor;
    }
};

// String evaluation utilities (replaces String.prototype.evalJSON, evalJS, eval)
const StringEvaluator = {
    processString: (inputString, evaluationOptions) => {
        const standardOptions = {
            onEvaluationError: CoreUtil.performNoOperation,
            isJsonFormat: false
        };
        const mergedOptions = propertyAssigner.mergeProperties({}, standardOptions, evaluationOptions || {});
        try {
            if (mergedOptions.isJsonFormat) {
                return JSON.parse(inputString);
            } else {
                // Using Function constructor as a safer alternative to direct eval for executing JS string
                new Function(inputString)();
                return true;
            }
        } catch (error) {
            mergedOptions.onEvaluationError(error);
            return false;
        }
    },
    parseJsonString: (inputString, options) => {
        return StringEvaluator.processString(inputString, propertyAssigner.mergeProperties({}, options || {}, {
            isJsonFormat: true
        }));
    },
    executeJsString: (inputString, options) => {
        return StringEvaluator.processString(inputString, propertyAssigner.mergeProperties({}, options || {}, {
            isJsonFormat: false
        }));
    }
};

// Array helper functions (replaces Array.prototype.inArray, each, indexOf, remove)
const ArrayManipulator = {
    hasElement: (targetArray, valueToCheck) => targetArray.includes(valueToCheck),
    iterateElements: (targetArray, callbackFunction, executionScope) => {
        targetArray.forEach((item, index) => callbackFunction.apply(executionScope || targetArray, [item, index]));
    },
    findElementIndex: (targetArray, elementToFind) => targetArray.indexOf(elementToFind),
    removeSpecificElement: (targetArray, elementToRemove) => {
        const elementIndex = targetArray.indexOf(elementToRemove);
        if (elementIndex !== -1) {
            targetArray.splice(elementIndex, 1);
        }
    }
};

// Function context binding (replaces Function.prototype.bind)
const FunctionBinder = {
    bindFunctionContext: (targetFunction, contextObject) => targetFunction.bind(contextObject)
};

// Renamed key and mouse constants
const KEY_CODE_BACKSPACE = 'k8';
const KEY_CODE_TAB = 'k9';
const KEY_CODE_ENTER = 'k13';
const KEY_CODE_SHIFT = 'k16';
const KEY_CODE_CTRL = 'k17';
const KEY_CODE_ALT = 'k18';
const KEY_CODE_META = 'META';
const KEY_CODE_PAUSE_BREAK = 'k19';
const KEY_CODE_CAPS = 'k20';
const KEY_CODE_ESCAPE = 'k27';
const KEY_CODE_PAGE_UP = 'k33';
const KEY_CODE_PAGE_DOWN = 'k34';
const KEY_CODE_END = 'k35';
const KEY_CODE_HOME = 'k36';
const KEY_CODE_LEFT_ARROW = 'k37';
const KEY_CODE_RIGHT_ARROW = 'k39';
const KEY_CODE_UP_ARROW = 'k38';
const KEY_CODE_DOWN_ARROW = 'k40';
const KEY_CODE_INSERT = 'k45';
const KEY_CODE_DELETE = 'k46';
const KEY_CODE_NUMPAD_0 = 'k96';
const KEY_CODE_NUMPAD_1 = 'k97';
const KEY_CODE_NUMPAD_2 = 'k98';
const KEY_CODE_NUMPAD_3 = 'k99';
const KEY_CODE_NUMPAD_4 = 'k100';
const KEY_CODE_NUMPAD_5 = 'k101';
const KEY_CODE_NUMPAD_6 = 'k102';
const KEY_CODE_NUMPAD_7 = 'k103';
const KEY_CODE_NUMPAD_8 = 'k104';
const KEY_CODE_NUMPAD_9 = 'k105';
const KEY_CODE_F1 = 'k112';
const KEY_CODE_F2 = 'k113';
const KEY_CODE_F3 = 'k114';
const KEY_CODE_F4 = 'k115';
const KEY_CODE_F5 = 'k116';
const KEY_CODE_F6 = 'k117';
const KEY_CODE_F7 = 'k118';
const KEY_CODE_F8 = 'k119';
const KEY_CODE_F9 = 'k120';
const KEY_CODE_F10 = 'k121';
const KEY_CODE_F11 = 'k122';
const KEY_CODE_F12 = 'k123';
const KEY_CODE_NUM_LOCK = 'k144';
const KEY_CODE_SCROLL_LOCK = 'k145';

const MOUSE_BUTTON_LEFT = 'left';
const MOUSE_BUTTON_RIGHT = 'right';
const MOUSE_BUTTON_CENTER = 'center';

// Event Management System (replaces Event object)
const EventManager = (() => {
    const activeElementListeners = new WeakMap();

    const ListenerSettings = ConstructorBuilder.createConstructor({
        initializerFunction: function(configurationData) {
            propertyAssigner.mergeProperties(this, {
                triggeringKeys: [],
                modifierFlags: [],
                preventBrowserDefault: false
            }, configurationData || {});
            this.triggeringKeys = Array.isArray(this.triggeringKeys) ? this.triggeringKeys : [this.triggeringKeys];
            this.modifierFlags = Array.isArray(this.modifierFlags) ? this.modifierFlags : [this.modifierFlags];
        }
    });

    const NormalizedEventData = ConstructorBuilder.createConstructor({
        initializerFunction: function(originalEvent) {
            propertyAssigner.mergeProperties(this, originalEvent);

            this.isKeyboardEvent = (eventType) => ['keypress', 'keydown', 'keyup'].includes(eventType || this.type);
            this.isMouseEvent = (eventType) => ['click', 'mousedown', 'mouseup'].includes(eventType || this.type);

            if (this.isKeyboardEvent()) {
                this.eventKeyIdentifier = originalEvent.which ? String.fromCharCode(originalEvent.charCode) : 'k' + originalEvent.keyCode;
            }
            if (this.isMouseEvent()) {
                this.isLeftClick = (originalEvent.button === 0);
                this.isCenterClick = (originalEvent.button === 1);
                this.isRightClick = (originalEvent.button === 2);
                this.mouseInteractionType = this.isLeftClick ? MOUSE_BUTTON_LEFT : this.isCenterClick ? MOUSE_BUTTON_CENTER : MOUSE_BUTTON_RIGHT;
            }

            this.stopEventPropagation = originalEvent.stopPropagation || function() {
                this.cancelCapture = true;
                this.cancelBubble = true;
            };
        }
    });

    const createEventWrapper = (userHandler, settings) => {
        const options = new ListenerSettings(settings);
        return function(nativeEvent) {
            let processedEvent = nativeEvent;
            if (CoreUtil.getAgentName() === 'MSIE') {
                // Mimic original's intention to prepare event for patching
                processedEvent = {};
                propertyAssigner.mergeProperties(processedEvent, nativeEvent);
                processedEvent.stopEventPropagation = nativeEvent.stopPropagation || function() {
                    this.cancelCapture = true;
                    this.cancelBubble = true;
                };
            }
            processedEvent = new NormalizedEventData(processedEvent);

            const keyCondition = !processedEvent.isKeyboardEvent() || !options.triggeringKeys.length || ArrayManipulator.hasElement(options.triggeringKeys, processedEvent.eventKeyIdentifier);
            const mouseCondition = !processedEvent.isMouseEvent() || !options.triggeringKeys.length || processedEvent.mouseInteractionType === options.triggeringKeys[0];

            const metaCondition = !ArrayManipulator.hasElement(options.modifierFlags, KEY_CODE_META) || processedEvent.metaKey;
            const shiftCondition = !ArrayManipulator.hasElement(options.modifierFlags, KEY_CODE_SHIFT) || processedEvent.shiftKey;
            const ctrlCondition = !ArrayManipulator.hasElement(options.modifierFlags, KEY_CODE_CTRL) || processedEvent.ctrlKey;
            const altCondition = !ArrayManipulator.hasElement(options.modifierFlags, KEY_CODE_ALT) || processedEvent.altKey;

            if (keyCondition && mouseCondition && metaCondition && shiftCondition && ctrlCondition && altCondition) {
                const handlerResult = userHandler.call(this, processedEvent);
                if (options.preventBrowserDefault) {
                    processedEvent.stopEventPropagation();
                    return false;
                }
                return handlerResult;
            }
        };
    };

    const registerListener = (domElement, eventType, handlerCallback, listenerSettings) => {
        const boundCallback = FunctionBinder.bindFunctionContext(handlerCallback, domElement);
        const wrappedCallback = createEventWrapper(boundCallback, listenerSettings);

        let listenersData = activeElementListeners.get(domElement);
        if (!listenersData) {
            listenersData = [];
            activeElementListeners.set(domElement, listenersData);
        }
        listenersData.push({
            type: eventType,
            original: handlerCallback,
            wrapped: wrappedCallback
        });

        if (CoreUtil.getAgentName() === 'MSIE') {
            domElement.attachEvent('on' + eventType, wrappedCallback);
        } else {
            domElement.addEventListener(eventType, wrappedCallback, false);
        }
    };

    const unregisterListener = (domElement, eventType, handlerCallback) => {
        let listenersData = activeElementListeners.get(domElement);
        if (!listenersData) return;

        const updatedListeners = [];
        for (let i = 0; i < listenersData.length; i++) {
            const listenerEntry = listenersData[i];
            const typeMatches = !eventType || listenerEntry.type === eventType;
            const handlerMatches = !handlerCallback || listenerEntry.original === handlerCallback;

            if (typeMatches && handlerMatches) {
                if (CoreUtil.getAgentName() === 'MSIE') {
                    domElement.detachEvent('on' + listenerEntry.type, listenerEntry.wrapped);
                } else {
                    domElement.removeEventListener(listenerEntry.type, listenerEntry.wrapped, false);
                }
            } else {
                updatedListeners.push(listenerEntry);
            }
        }
        activeElementListeners.set(domElement, updatedListeners);
    };

    return {
        registerListener,
        unregisterListener,
        ListenerSettings
    };
})();

// CSS class manipulation utilities
const CssClassManager = {
    checkHasClass: (domElement, className) => domElement.classList.contains(className),
    appendClass: (domElement, className) => domElement.classList.add(className),
    removeClass: (domElement, className) => domElement.classList.remove(className),
    flipClass: (domElement, className) => domElement.classList.toggle(className)
};

// DOM hierarchy and selection utilities
const DomHierarchyNavigator = {
    isDirectChildOf: (elementToTest, possibleParent) => elementToTest.parentNode === possibleParent,
    isDirectParentOf: (elementToTest, possibleChild) => possibleChild.parentNode === elementToTest,
    isCoSiblingWith: (elementToTest, possibleSibling) => elementToTest.parentNode === possibleSibling.parentNode && elementToTest !== possibleSibling,
    isAnInclusiveDescendantOf: (elementToTest, possibleAncestor) => {
        let currentElement = elementToTest.parentNode;
        while (currentElement) {
            if (currentElement === possibleAncestor) return true;
            currentElement = currentElement.parentNode;
        }
        return false;
    },
    isAnInclusiveAncestorOf: (elementToTest, possibleDescendant) => DomHierarchyNavigator.isAnInclusiveDescendantOf(possibleDescendant, elementToTest),
    retrieveElementsByClass: (parentElement, className) => {
        return Array.from(parentElement.querySelectorAll('.' + className));
    }
};

// HTTP Request Service (replaces Ajax object)
const HttpRequestService = (() => {
    const RequestHandler = ConstructorBuilder.createConstructor({
        initializerFunction: function(requestUrl, options) {
            propertyAssigner.mergeProperties(this, {
                requestMethod: 'POST',
                onCreation: CoreUtil.performNoOperation,
                onConfiguration: CoreUtil.performNoOperation,
                onSending: CoreUtil.performNoOperation,
                onProgressUpdate: CoreUtil.performNoOperation,
                onCompletion: CoreUtil.performNoOperation,
                onFailure: CoreUtil.performNoOperation
            }, options || {});
            this.httpRequest = (CoreUtil.getAgentName() === 'MSIE' && CoreUtil.getAgentVersion() < 7) ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
            this.httpRequest.onreadystatechange = FunctionBinder.bindFunctionContext(this.handleRequestStateChange, this);
            this.httpRequest.onprogress = FunctionBinder.bindFunctionContext(this.onProgressUpdate, this);
        },
        handleRequestStateChange: function() {
            const stateCallbacks = {
                0: this.onCreation,
                1: this.onConfiguration,
                2: this.onSending,
                3: this.onProgressUpdate,
                4: this.onCompletion
            };
            const chosenCallback = (this.httpRequest.readyState === 4 && this.httpRequest.status !== 200) ? this.onFailure : stateCallbacks[this.httpRequest.readyState];

            const wrappedCallbackExecution = function() {
                try {
                    chosenCallback.apply(this, arguments);
                } catch (error) {
                    throw(error);
                }
            };
            wrappedCallbackExecution.call(this.httpRequest, this.httpRequest);
        }
    });

    return {
        RequestHandler
    };
})();

// Unified DOM Element Interface (replaces $ function and element-specific prototype patching)
class DomElementInterface {
    constructor(identifierOrElement) {
        if (typeof identifierOrElement === 'string') {
            this.wrappedElement = document.getElementById(identifierOrElement);
        } else {
            this.wrappedElement = identifierOrElement;
        }

        if (!this.wrappedElement) {
            throw new Error('Associated DOM element not found or invalid.');
        }

        // Event methods
        this.addEventHandler = (type, handler, config) => EventManager.registerListener(this.wrappedElement, type, handler, config);
        this.removeEventHandler = (type, handler) => EventManager.unregisterListener(this.wrappedElement, type, handler);

        this.onPageLoad = (handler, config) => this.addEventHandler('load', handler, config);
        this.onSingleClick = (handler, config) => {
            const opts = new EventManager.ListenerSettings(config);
            if (ArrayManipulator.hasElement(opts.triggeringKeys, MOUSE_BUTTON_RIGHT)) {
                this.onRightMouseClick(handler, opts);
                return;
            }
            this.addEventHandler('click', handler, opts);
        };
        this.offSingleClick = (handler) => this.removeEventHandler('click', handler);
        this.onShiftClick = (handler, config) => this.onSingleClick(handler, propertyAssigner.mergeProperties({}, config || {}, {
            modifierFlags: KEY_CODE_SHIFT
        }));
        this.onControlClick = (handler, config) => this.onSingleClick(handler, propertyAssigner.mergeProperties({}, config || {}, {
            modifierFlags: KEY_CODE_CTRL
        }));
        this.onAltClick = (handler, config) => this.onSingleClick(handler, propertyAssigner.mergeProperties({}, config || {}, {
            modifierFlags: KEY_CODE_ALT
        }));
        this.onMetaClick = (handler, config) => this.onSingleClick(handler, propertyAssigner.mergeProperties({}, config || {}, {
            modifierFlags: KEY_CODE_META
        }));
        this.onRightMouseClick = (handler, config) => {
            const combinedConfig = propertyAssigner.mergeProperties({}, config || {}, {
                triggeringKeys: MOUSE_BUTTON_RIGHT
            });
            this.addEventHandler('mousedown', handler, combinedConfig);
            if (config && config.preventBrowserDefault) {
                this.addEventHandler('contextmenu', CoreUtil.performNoOperation, combinedConfig);
            }
        };
        this.offRightMouseClick = (handler) => {
            this.removeEventHandler('mousedown', handler);
            this.removeEventHandler('contextmenu');
        };
        this.onKeyStroke = (keys, handler, config) => this.addEventHandler('keypress', handler, propertyAssigner.mergeProperties({}, config || {}, {
            triggeringKeys: keys
        }));
        this.offKeyStroke = (handler) => this.removeEventHandler('keypress', handler);

        // CSS class methods
        this.hasCssClass = (name) => CssClassManager.checkHasClass(this.wrappedElement, name);
        this.addCssClass = (name) => CssClassManager.appendClass(this.wrappedElement, name);
        this.removeCssClass = (name) => CssClassManager.removeClass(this.wrappedElement, name);
        this.toggleCssClass = (name) => CssClassManager.flipClass(this.wrappedElement, name);

        // DOM hierarchy methods
        this.isChildOf = (parent) => DomHierarchyNavigator.isDirectChildOf(this.wrappedElement, parent.wrappedElement || parent);
        this.isParentOf = (child) => DomHierarchyNavigator.isDirectParentOf(this.wrappedElement, child.wrappedElement || child);
        this.isSiblingOf = (sibling) => DomHierarchyNavigator.isCoSiblingWith(this.wrappedElement, sibling.wrappedElement || sibling);
        this.isDescendantOf = (ancestor) => DomHierarchyNavigator.isAnInclusiveDescendantOf(this.wrappedElement, ancestor.wrappedElement || ancestor);
        this.isAncestorOf = (descendant) => DomHierarchyNavigator.isAnInclusiveAncestorOf(this.wrappedElement, descendant.wrappedElement || descendant);
        this.selectElementsByClass = (className) => DomHierarchyNavigator.retrieveElementsByClass(this.wrappedElement, className).map(el => new DomElementInterface(el));

        // AJAX content update (original was empty)
        this.updateElementContent = () => {};
    }
}

// Global factory for DomElementInterface (replaces $ global function)
const getDomInterface = (elementIdOrObject) => {
    if (elementIdOrObject instanceof DomElementInterface) {
        return elementIdOrObject;
    }
    return new DomElementInterface(elementIdOrObject);
};

// Global accessor for browser information (replaces getBrowser/getBrowserVersion)
const retrieveBrowserDetails = () => ({
    browserName: CoreUtil.getAgentName(),
    browserVersion: CoreUtil.getAgentVersion()
});