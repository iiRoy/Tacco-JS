var nextComponentId = 0;
var activeUnitRegistry = new Map();
var componentIdentifierAttribute = 'unit-instance-tag';

function generateComponentTag() {
    return `comp-${nextComponentId++}`;
}

var objectToString = Object.prototype.toString;

function isText(val) { return objectToString.call(val) === '[object String]'; }
function isExecutable(val) { return objectToString.call(val) === '[object Function]'; }
function capitalizeFirst(str) { return str.charAt(0).toUpperCase() + str.substring(1); }

function isElementContained(ancestor, descendant) {
    if (ancestor.contains) {
        return ancestor.contains(descendant);
    }
    return !!(ancestor.compareDocumentPosition(descendant) & 16);
}

function isElementVisible(element) {
    return isElementContained(document.documentElement, element);
}

function normalizeArgs(argsArray) {
    let processedArgs = [...argsArray];
    while (processedArgs.length > 0 && processedArgs[processedArgs.length - 1] === undefined) {
        processedArgs.pop();
    }
    return processedArgs;
}

var eventSplitterPattern = /^(\S+)\s*(.*)$/;
var expressionPlaceholderPattern = /\{\{([^}]+)\}\}/g;
var invalidSelectionMarker = 'INVALID_SELECTION';
var interactionEventNamespace = '.component-interactions-';

function parseInteractionKey(interactionKey, componentInstance) {
    var parts = interactionKey.match(eventSplitterPattern);
    var eventName = parts[1] + interactionEventNamespace + componentInstance.instanceTag;
    var selectorText = parts[2] || undefined;

    if (selectorText && selectorText.includes('{{')) {
        selectorText = resolveSelectorExpression(selectorText, componentInstance);
    }

    return {
        eventKind: eventName,
        targetSelector: selectorText
    };
}

function resolveSelectorExpression(selectorExpression, componentInstance) {
    return selectorExpression.replace(expressionPlaceholderPattern, function(match, path) {
        var pathSegments = path.split('.');
        var currentRef = componentInstance;
        var segment;

        while (segment = pathSegments.shift()) {
            if (currentRef && typeof currentRef.getProp === 'function') {
                currentRef = currentRef.getProp(segment);
            } else if (currentRef && typeof currentRef === 'object' && currentRef !== null) {
                currentRef = currentRef[segment];
            } else {
                currentRef = undefined;
                break;
            }
        }

        if (isText(currentRef)) {
            return currentRef;
        }
        return invalidSelectionMarker;
    });
}

function getComponentInteractionMap(componentInstance) {
    if (isExecutable(componentInstance.eventDefinitions)) {
        componentInstance.eventDefinitions = componentInstance.eventDefinitions();
    }
    return componentInstance.eventDefinitions;
}

function isConfigValueEmpty(value) {
    return value == null || value === undefined;
}

var DataAttributeParser = {
    extractFromElement: function(domElement) {
        var config = {};
        if (!domElement || !domElement.attributes) return config;

        Array.from(domElement.attributes).forEach(function(attr) {
            if (attr.name.startsWith('data-widget-')) {
                var propName = attr.name.substring(12).replace(/-([a-z])/g, function(g) { return g[1].toUpperCase(); });
                try {
                    config[propName] = JSON.parse(attr.value);
                } catch (e) {
                    config[propName] = attr.value;
                }
            }
        });
        return config;
    }
};

var AutoRenderUtility = {
    isDataApiDisabled: function(domElement) {
        return domElement && domElement.hasAttribute('data-api-off');
    }
};

function createObservableObject(initialState) {
    initialState = initialState || {};
    var internalState = { ...initialState };
    var listeners = new Map();

    function onAttributeChange(attributeName, callback) {
        if (!listeners.has(attributeName)) {
            listeners.set(attributeName, new Set());
        }
        listeners.get(attributeName).add(callback);
    }

    function offAttributeChange(attributeName, callback) {
        if (listeners.has(attributeName)) {
            listeners.get(attributeName).delete(callback);
            if (listeners.get(attributeName).size === 0) {
                listeners.delete(attributeName);
            }
        }
    }

    function triggerAttributeChange(attributeName, newValue, oldValue, key) {
        if (listeners.has(attributeName)) {
            listeners.get(attributeName).forEach(function(cb) { cb(newValue, oldValue, key); });
        }
    }

    var stateProxy = new Proxy(internalState, {
        set: function(target, prop, value) {
            var oldValue = target[prop];
            if (oldValue !== value) {
                target[prop] = value;
                triggerAttributeChange(`change:${prop}`, value, oldValue, prop);
            }
            return true;
        },
        get: function(target, prop) {
            return target[prop];
        }
    });

    return {
        getProp: function(key) { return stateProxy[key]; },
        setProp: function(key, value) { stateProxy[key] = value; },
        onPropChange: onAttributeChange,
        offPropChange: offAttributeChange,
        _internalState: internalState
    };
}

function createDisplayComponent(configuration) {
    configuration = configuration || {};
    var component = {};

    var propertyManager = createObservableObject({
        identifier: null,
        designation: null,
        visualStyle: null,
        blueprint: '<div></div>',
        dataModel: null,
        parentHost: document.body
    });
    component.getProp = propertyManager.getProp;
    component.setProp = propertyManager.setProp;
    component.onPropChange = propertyManager.onPropChange;
    component.offPropChange = propertyManager.offPropChange;
    component._config = propertyManager._internalState;

    var defaultSettings = {
        directPropertyMapping: ['initialHostElement', 'mainHostElement', 'eventDefinitions'],
        identifier: null,
        designation: null,
        visualStyle: null,
        blueprint: '<div></div>',
        dataModel: null,
        parentHost: document.body
    };

    Object.assign(component._config, defaultSettings);
    Object.assign(component._config, configuration);

    component.instanceTag = generateComponentTag();
    component.mainHostElement = null;
    component.initialHostElement = null;
    component.eventDefinitions = null;
    component._externalDelegates = [];
    component.isDisplayed = false;
    component._fromBlueprint = false;

    component._initiateUnitLifeCycle = function(initialConfiguration) {
        var dataConfiguration = {};
        var passedHostElement;

        if (initialConfiguration) {
            passedHostElement = initialConfiguration.initialHostElement || initialConfiguration.mainHostElement;
            if (passedHostElement) {
                component.initialHostElement = passedHostElement;
            }
        }

        if (component.initialHostElement && !AutoRenderUtility.isDataApiDisabled(component.initialHostElement)) {
            dataConfiguration = DataAttributeParser.extractFromElement(component.initialHostElement);
        }

        Object.assign(component._config, dataConfiguration, initialConfiguration);

        defaultSettings.directPropertyMapping.forEach(function(propName) {
            if (component._config[propName] !== undefined) {
                component[propName] = component._config[propName];
                delete component._config[propName];
            }
        });

        component._establishHostElement();
        component._initializeDirectProps();
        component._attachInteractionHandlers();
        component._finalizePreparation();
        component._markAndRegisterUnit();

        component._fromBlueprint = !(initialConfiguration && initialConfiguration.mainHostElement);
    };

    component._establishHostElement = function() {
        var currentElement = component.mainHostElement;

        if (currentElement) {
            if (isText(currentElement)) {
                component.mainHostElement = document.querySelector(currentElement);
            } else if (currentElement.jquery) {
                component.mainHostElement = currentElement[0];
            }
        } else if (component.getProp('blueprint')) {
            component._fabricateHostFromBlueprint();
        }

        if (!component.mainHostElement) {
            throw new Error('Host element is invalid or could not be established.');
        }
    };

    component._fabricateHostFromBlueprint = function() {
        var tempContainer = document.createElement('div');
        tempContainer.innerHTML = component.getProp('blueprint');
        component.mainHostElement = tempContainer.firstElementChild;
        if (!component.mainHostElement) {
            throw new Error('Blueprint did not result in a valid element.');
        }
    };

    component._initializeDirectProps = function() { };

    component._attachInteractionHandlers = function(targetElement, interactionMap, handlerFunction) {
        var processedArgs = normalizeArgs(Array.from(arguments));
        var eventConfig;
        var elementToBind;

        if (processedArgs.length === 0) {
            eventConfig = getComponentInteractionMap(component);
            elementToBind = component.mainHostElement;
        } else if (processedArgs.length === 1) {
            eventConfig = targetElement;
            elementToBind = component.mainHostElement;
        } else if (processedArgs.length === 2) {
            handlerFunction = interactionMap;
            eventConfig = targetElement;
            elementToBind = component.mainHostElement;
        } else {
            elementToBind = targetElement;
            eventConfig = interactionMap;
            component._externalDelegates.push(elementToBind);
        }

        if (isText(eventConfig) && isExecutable(handlerFunction)) {
            var temp = {};
            temp[eventConfig] = handlerFunction;
            eventConfig = temp;
        }

        for (var key in eventConfig) {
            if (!eventConfig.hasOwnProperty(key)) continue;

            var _parseInteractionKey = parseInteractionKey(key, component),
                eventKind = _parseInteractionKey.eventKind,
                targetSelector = _parseInteractionKey.targetSelector;

            var currentHandler = eventConfig[key];

            var callbackWrapper = function(event) {
                var actualTarget = event.target;
                if (targetSelector) {
                    actualTarget = event.target.closest(targetSelector);
                    if (!actualTarget || !elementToBind.contains(actualTarget)) {
                        return;
                    }
                }
                if (isExecutable(currentHandler)) {
                    currentHandler.call(component, event);
                } else {
                    if (isExecutable(component[currentHandler])) {
                        component[currentHandler](event);
                    }
                }
            };

            if (!elementToBind._eventWrappers) {
                elementToBind._eventWrappers = new Map();
            }
            if (!elementToBind._eventWrappers.has(eventKind)) {
                elementToBind._eventWrappers.set(eventKind, new Map());
            }
            elementToBind._eventWrappers.get(eventKind).set(key, callbackWrapper);

            elementToBind.addEventListener(eventKind.split(interactionEventNamespace)[0], callbackWrapper, true);
        }
        return component;
    };

    component._detachInteractionHandlers = function(targetElement, interactionKey) {
        var processedArgs = normalizeArgs(Array.from(arguments));
        var specificElement = null;
        var specificInteractionKey = null;

        if (processedArgs.length === 0) {
            var eventPrefix = interactionEventNamespace + component.instanceTag;

            var removeListenersFromElement = function(el) {
                if (el && el._eventWrappers) {
                    el._eventWrappers.forEach(function(mapOfKeys, eventKind) {
                        if (eventKind.includes(eventPrefix)) {
                            mapOfKeys.forEach(function(wrapper) {
                                el.removeEventListener(eventKind.split(interactionEventNamespace)[0], wrapper, true);
                            });
                            mapOfKeys.clear();
                        }
                    });
                }
            };

            removeListenersFromElement(component.mainHostElement);
            component._externalDelegates.forEach(removeListenersFromElement);
            component._externalDelegates.length = 0;

        } else {
            if (processedArgs.length === 1) {
                specificInteractionKey = targetElement;
                specificElement = component.mainHostElement;
            } else {
                specificElement = targetElement;
                specificInteractionKey = interactionKey;
            }

            if (!specificElement || !specificInteractionKey) return component;

            var _parseInteractionKey2 = parseInteractionKey(specificInteractionKey, component),
                eventKind = _parseInteractionKey2.eventKind;

            var baseEventName = eventKind.split(interactionEventNamespace)[0];

            if (specificElement._eventWrappers && specificElement._eventWrappers.has(eventKind)) {
                var wrappersMap = specificElement._eventWrappers.get(eventKind);
                var keysToRemove = [];

                wrappersMap.forEach(function(wrapper, originalKey) {
                    if (originalKey === specificInteractionKey) {
                        specificElement.removeEventListener(baseEventName, wrapper, true);
                        keysToRemove.push(originalKey);
                    }
                });

                keysToRemove.forEach(function(k) { wrappersMap.delete(k); });
                if (wrappersMap.size === 0) {
                    specificElement._eventWrappers.delete(eventKind);
                }
            }
        }
        return component;
    };

    component._finalizePreparation = function() { };

    component._displayUnitToPage = function() {
        if (!component.isDisplayed) {
            component._syncConfigToView();
            component.isDisplayed = true;
        }

        var targetParent = component.getProp('parentHost');
        if (targetParent && !isElementVisible(component.mainHostElement)) {
            var outerWrapperClass = component._config.outerBoxClass;
            if (outerWrapperClass) {
                var wrapper = document.createElement('div');
                wrapper.className = outerWrapperClass;
                wrapper.appendChild(component.mainHostElement);
                targetParent.appendChild(wrapper);
                component._outerWrapper = wrapper;
            } else {
                targetParent.appendChild(component.mainHostElement);
            }
        }
        return component;
    };

    component._syncConfigToView = function() {
        for (var configKey in component._config) {
            if (!component._config.hasOwnProperty(configKey)) continue;

            var handlerName = `_handleConfigChange${capitalizeFirst(configKey)}`;
            if (component[handlerName]) {
                var initialValue = component.getProp(configKey);
                if (!isConfigValueEmpty(initialValue)) {
                    component[handlerName](initialValue, undefined, configKey);
                }

                component.onPropChange(`change:${configKey}`, (function(hName) {
                    return function(newValue, oldValue, key) {
                        if (component[hName]) {
                            component[hName](newValue, oldValue, key);
                        }
                    };
                })(handlerName));
            }
        }
    };

    component._handleConfigChangeIdentifier = function(value) {
        if (component.mainHostElement) {
            component.mainHostElement.setAttribute('id', value);
        }
    };

    component._handleConfigChangeDesignation = function(value) {
        if (component.mainHostElement) {
            component.mainHostElement.className = value;
        }
    };

    component._handleConfigChangeVisualStyle = function(value) {
        if (component.mainHostElement) {
            if (typeof value === 'object' && value !== null) {
                for (var prop in value) {
                    if (value.hasOwnProperty(prop)) {
                        component.mainHostElement.style[prop] = value[prop];
                    }
                }
            } else if (isText(value)) {
                component.mainHostElement.style.cssText = value;
            }
        }
    };

    component._markAndRegisterUnit = function() {
        var tag = component.instanceTag;
        (component.initialHostElement || component.mainHostElement).setAttribute(componentIdentifierAttribute, tag);
        activeUnitRegistry.set(tag, component);
    };

    component._queryHost = function(querySelector) {
        return component.mainHostElement ? component.mainHostElement.querySelectorAll(querySelector) : [];
    };

    component._terminateUnit = function() {
        component._detachInteractionHandlers();
        activeUnitRegistry.delete(component.instanceTag);

        if (component.mainHostElement && component._fromBlueprint) {
            component.mainHostElement.remove();
            if (component._outerWrapper) {
                component._outerWrapper.remove();
            }
        }
        component.mainHostElement = null;
    };

    component._initiateUnitLifeCycle(configuration);

    return component;
}

function findUnitBySelector(cssSelector) {
    var targetElement = document.querySelector(cssSelector);
    if (targetElement) {
        var tag = targetElement.getAttribute(componentIdentifierAttribute);
        return activeUnitRegistry.get(tag);
    }
    return undefined;
}

window.addEventListener('beforeunload', function() {
    activeUnitRegistry.forEach(function(unit) {
        if (unit && typeof unit._terminateUnit === 'function') {
            unit._terminateUnit();
        }
    });
});

var ComponentAutoRenderer = {
    initiateRender: function(selector) { /* ... logic ... */ },
    initiateAllRenders: function() { /* ... logic ... */ },
    allowedStatics: ['initiateRender']
};

var ComponentAPI = {
    create: createDisplayComponent,
    query: findUnitBySelector,
    autoRender: ComponentAutoRenderer.initiateRender,
    autoRenderAll: ComponentAutoRenderer.initiateAllRenders,
    allowedStatics: ComponentAutoRenderer.allowedStatics
};

module.exports = ComponentAPI;