(function(globalContext) {

if (typeof globalContext.document !== "undefined") {
    return;
}

globalContext.selfReference = globalContext;
globalContext.coreKit = globalContext;

function createDiagnosticRelay(targetContext) {
    const diagnosticRelay = {};
    const messageKind = "diag";
    ['log', 'error', 'warn', 'trace'].forEach(levelName => {
        diagnosticRelay[levelName] = function(...messageContents) {
            targetContext.postMessage({
                messageKind: messageKind,
                logLevel: levelName,
                messagePayload: messageContents
            });
        };
    });
    return diagnosticRelay;
}
globalContext.reportChannel = createDiagnosticRelay(globalContext);

globalContext.addEventListener('error', (eventDetails) => {
    const errorDescription = eventDetails.message || (eventDetails.error && eventDetails.error.message);
    const errorObject = eventDetails.error;
    const formattedErrorOutput = errorObject && errorObject.stack ? errorObject.stack : errorDescription;
    globalContext.reportChannel.error(`Worker malfunction: ${formattedErrorOutput}`);
    eventDetails.preventDefault();
});

function resolvePath(parentIdentifier, componentName) {
    const exclamationMarkMatch = componentName.match(/!/);
    if (exclamationMarkMatch) {
        const pathSegments = componentName.split('!');
        return resolvePath(parentIdentifier, pathSegments[0]) + '!' + resolvePath(parentIdentifier, pathSegments[1]);
    }

    if (componentName.startsWith('.')) {
        const parentPathSegments = parentIdentifier ? parentIdentifier.split('/') : [];
        const absolutePathParts = parentPathSegments.slice(0, -1);

        const currentComponentParts = componentName.split('/');
        for (let part of currentComponentParts) {
            if (part === '..') {
                absolutePathParts.pop();
            } else if (part !== '.' && part !== '') {
                absolutePathParts.push(part);
            }
        }
        return absolutePathParts.join('/');
    }
    return componentName;
}
globalContext.resolvePath = resolvePath;

const _componentRegistry = new Map();
const _namespaceMap = new Map();
let _currentLoadingComponentId = null;

function obtainModule(firstIdentifier, secondIdentifier) {
    let parentIdentifier = null;
    let componentIdentifier = null;

    if (secondIdentifier === undefined) {
        componentIdentifier = firstIdentifier;
    } else {
        parentIdentifier = firstIdentifier;
        componentIdentifier = secondIdentifier;
    }

    if (typeof componentIdentifier !== 'string') {
        throw new Error("Module acquisition requires string identifiers.");
    }

    const normalizedIdentifier = globalContext.resolvePath(parentIdentifier, componentIdentifier);

    let registeredComponent = _componentRegistry.get(normalizedIdentifier);
    if (registeredComponent) {
        if (!registeredComponent.isInstantiated) {
            registeredComponent.isInstantiated = true;
            const factoryExecutionResult = registeredComponent.buildFunction.call(registeredComponent);
            if (factoryExecutionResult !== undefined) {
                registeredComponent.exportBundle = factoryExecutionResult;
            }
        }
        return registeredComponent.exportBundle;
    }

    const pathSegments = normalizedIdentifier.split('/');
    if (pathSegments.length > 0 && _namespaceMap.has(pathSegments[0])) {
        pathSegments[0] = _namespaceMap.get(pathSegments[0]);
    }
    const scriptPath = pathSegments.join('/') + '.js';

    _currentLoadingComponentId = normalizedIdentifier;
    try {
        importScripts(scriptPath);
    } catch (e) {
        globalContext.reportChannel.error(`Failed to load script: ${scriptPath}`, e);
        throw e;
    }
    
    registeredComponent = _componentRegistry.get(normalizedIdentifier);
    if (!registeredComponent) {
        throw new Error(`Component '${normalizedIdentifier}' not established after loading script '${scriptPath}'.`);
    }

    return obtainModule(null, normalizedIdentifier);
}
globalContext.obtainModule = obtainModule;
globalContext.obtainModule.registry = _componentRegistry;
globalContext.obtainModule.namespaceMap = _namespaceMap;

function establishModule(...args) {
    let componentIdentifier, dependencies, buildFunction;

    if (args.length === 3) {
        [componentIdentifier, dependencies, buildFunction] = args;
    } else if (args.length === 2) {
        if (typeof args[0] === 'string') {
            [componentIdentifier, buildFunction] = args;
            dependencies = [];
        } else {
            [dependencies, buildFunction] = args;
            componentIdentifier = _currentLoadingComponentId;
        }
    } else if (args.length === 1) {
        [buildFunction] = args;
        dependencies = [];
        componentIdentifier = _currentLoadingComponentId;
    } else {
        throw new Error("Invalid arguments for module establishment.");
    }

    if (typeof componentIdentifier !== 'string' || !componentIdentifier) {
        componentIdentifier = _currentLoadingComponentId;
        if (!componentIdentifier) {
            throw new Error("Module identifier missing and cannot be inferred.");
        }
    }

    if (!dependencies || dependencies.length === 0) {
        dependencies = ['obtainModule', 'exportBundle', 'moduleContext'];
    }

    if (componentIdentifier.startsWith("text!")) {
        return;
    }

    const componentRecord = {
        exportBundle: {},
        isInstantiated: false,
        buildFunction: function() {
            const currentModuleContext = this;
            const dependencyInstances = dependencies.map(depName => {
                switch (depName) {
                    case 'obtainModule': return (childId) => globalContext.obtainModule(componentIdentifier, childId);
                    case 'exportBundle': return currentModuleContext.exportBundle;
                    case 'moduleContext': return currentModuleContext;
                    default: return globalContext.obtainModule(componentIdentifier, depName);
                }
            });
            
            const executionResult = buildFunction.apply(currentModuleContext, dependencyInstances);
            if (executionResult !== undefined) {
                currentModuleContext.exportBundle = executionResult;
            }
            return currentModuleContext;
        }
    };
    globalContext.obtainModule.registry.set(componentIdentifier, componentRecord);
    _currentLoadingComponentId = null;
}
globalContext.establishModule = establishModule;
globalContext.establishModule.amdFlag = {};

function setupRootPaths(namespaceMapping) {
    globalContext.obtainModule.namespaceMap = new Map(Object.entries(namespaceMapping));
}
globalContext.setupRootPaths = setupRootPaths;

function createTransmitter() {
    const DataEmitterPrototype = {};
    
    globalContext.obtainModule('coreKit/utility/string_array_tools').initiateEventCapabilities(DataEmitterPrototype);

    Object.assign(DataEmitterPrototype, {
        responseInvoker: function(payloadContent, invocationId) {
            globalContext.postMessage({
                messageKind: "reply",
                identifier: invocationId,
                payload: payloadContent
            });
        },
        signalEvent: function(eventName, payloadContent) {
            globalContext.postMessage({
                messageKind: "notification",
                eventLabel: eventName,
                payload: payloadContent
            });
        }
    });

    function DataEmitter() { /* constructor */ }
    DataEmitter.prototype = DataEmitterPrototype;
    DataEmitter.prototype.constructor = DataEmitter;

    return new DataEmitter();
}
globalContext.createTransmitter = createTransmitter;

let centralProcessor = null;
let messageTransmitter = null;

globalContext.receiveDirective = function(eventPayload) {
    const incomingMessage = eventPayload.data;

    if (incomingMessage.instruction) {
        if (centralProcessor && typeof centralProcessor[incomingMessage.instruction] === 'function') {
            centralProcessor[incomingMessage.instruction].apply(centralProcessor, incomingMessage.parameters);
        } else {
            throw new Error(`Unknown operation: ${incomingMessage.instruction}`);
        }
    } else if (incomingMessage.initializationCommand) {
        globalContext.setupRootPaths(incomingMessage.namespaceMapping);
        globalContext.obtainModule('coreKit/compatibility/legacy_support');
        messageTransmitter = globalContext.createTransmitter();
        const componentType = globalContext.obtainModule(incomingMessage.modulePath)[incomingMessage.className];
        centralProcessor = new componentType(messageTransmitter);
    } else if (incomingMessage.broadcastEvent && messageTransmitter) {
        messageTransmitter._dispatchSignal(incomingMessage.broadcastEvent, incomingMessage.payload);
    }
};
globalContext.addEventListener('message', globalContext.receiveDirective);


globalContext.establishModule('coreKit/markup/document_analyzer', ['obtainModule', 'exportBundle', 'moduleContext', 'coreKit/utility/object_manipulation', 'coreKit/utility/string_array_tools', 'coreKit/worker/reflector', 'coreKit/markup/html_parser'], function(obtainModule, exportBundle, moduleContext) {

var objectUtil = obtainModule("coreKit/utility/object_manipulation");
var stringArrayUtil = obtainModule("coreKit/utility/string_array_tools");
var Reflector = obtainModule("coreKit/worker/reflector").Reflector;
var MarkupParser = obtainModule("coreKit/markup/html_parser").MarkupParser;

var issueClassifications = {
    "expected-doctype-but-got-start-tag": "info",
    "expected-doctype-but-got-chars": "info",
    "non-html-root": "info",
};

var DocumentAnalyzer = exportBundle.DocumentAnalyzer = function(transmitter) {
    Reflector.call(this, transmitter);
    this.setDelay(400);
    this.analysisContext = null;
};

objectUtil.extendPrototype(DocumentAnalyzer, Reflector);

(function() {

    this.setOptions = function(configOptions) {
        this.analysisContext = configOptions.context;
    };

    this.processUpdate = function() {
        const documentValue = this.documentContent.getValue();
        if (!documentValue) {
            return;
        }

        const parserInstance = new MarkupParser();
        const gatheredIssues = [];
        const noOpFunction = () => {};

        parserInstance.contentHandler = {
           startDocument: noOpFunction,
           endDocument: noOpFunction,
           startElement: noOpFunction,
           endElement: noOpFunction,
           characters: noOpFunction
        };
        parserInstance.errorHandler = {
            error: function(errorMessage, locationDetails, issueCode) {
                gatheredIssues.push({
                    row: locationDetails.line,
                    column: locationDetails.column,
                    text: errorMessage,
                    type: issueClassifications[issueCode] || "error"
                });
            }
        };

        if (this.analysisContext) {
            parserInstance.parseFragment(documentValue, this.analysisContext);
        } else {
            parserInstance.parse(documentValue);
        }
        this.transmitter.signalEvent("analysisIssues", gatheredIssues);
    };

}).call(DocumentAnalyzer.prototype);

});

globalContext.establishModule('coreKit/utility/object_manipulation', ['obtainModule', 'exportBundle', 'moduleContext'], function(obtainModule, exportBundle, moduleContext) {

exportBundle.extendPrototype = function(childCtor, parentCtor) {
    childCtor.parent = parentCtor;
    
    const TemporaryPrototype = function() {};
    TemporaryPrototype.prototype = parentCtor.prototype;
    childCtor.prototype = new TemporaryPrototype();

    Object.defineProperty(childCtor.prototype, 'constructor', {
        value: childCtor,
        enumerable: false,
        writable: true,
        configurable: true
    });
};

exportBundle.applyProperties = function(destinationObject, sourceObject) {
    Object.keys(sourceObject).forEach(key => {
        destinationObject[key] = sourceObject[key];
    });
    return destinationObject;
};

exportBundle.integrateCapabilities = function(targetPrototype, capabilitySource) {
    exportBundle.applyProperties(targetPrototype, capabilitySource);
};

});

globalContext.establishModule('coreKit/utility/string_array_tools', ['obtainModule', 'exportBundle', 'moduleContext'], function(obtainModule, exportBundle, moduleContext) {

exportBundle.finalElement = function(inputArray) {
    return inputArray[inputArray.length - 1];
};

exportBundle.mirrorString = function(inputString) {
    return [...inputString].reduce((reversed, char) => char + reversed, '');
};

exportBundle.replicateString = function (inputString, repetitionCount) {
    if (repetitionCount < 0) return '';
    return Array(repetitionCount + 1).join(inputString);
};

const leadingWhitespacePattern = /^\s+/;
const trailingWhitespacePattern = /\s+$/;

exportBundle.pruneLeadingWhitespace = function (inputString) {
    return inputString.replace(leadingWhitespacePattern, '');
};

exportBundle.pruneTrailingWhitespace = function (inputString) {
    return inputString.replace(trailingWhitespacePattern, '');
};

exportBundle.duplicateObjectShallow = function(originalObject) {
    return Object.assign({}, originalObject);
};

exportBundle.duplicateArrayShallow = function(originalArray){
    return originalArray.map(item => {
        if (item && typeof item === "object") {
            return exportBundle.duplicateObjectShallow(item);
        }
        return item;
    });
};

exportBundle.replicateDeeply = function (inputObject) {
    if (typeof inputObject !== "object" || inputObject === null) {
        return inputObject;
    }
    const objectConstructor = inputObject.constructor;
    if (objectConstructor === RegExp || objectConstructor === Date) {
        return new objectConstructor(inputObject);
    }
    
    return Object.entries(inputObject).reduce((accumulator, [key, value]) => {
        accumulator[key] = exportBundle.replicateDeeply(value);
        return accumulator;
    }, new objectConstructor());
};

exportBundle.indexArray = function(inputArray) {
    return inputArray.reduce((mapAccumulator, currentItem) => {
        mapAccumulator[currentItem] = true;
        return mapAccumulator;
    }, {});
};

exportBundle.constructMapFromProps = function(properties) {
    return new Map(Object.entries(properties));
};

exportBundle.extractElement = function(targetArray, valueToRemove) {
    const newArray = targetArray.filter(item => item !== valueToRemove);
    if (newArray.length < targetArray.length) {
        targetArray.length = 0;
        targetArray.push(...newArray);
    }
};

exportBundle.sanitizeRegexPattern = function(inputString) {
    return inputString.split('').map(char => {
        if (/[.*+?^${}()|[\]\/\\]/.test(char)) {
            return '\\' + char;
        }
        return char;
    }).join('');
};

exportBundle.sanitizeHtmlText = function(inputString) {
    const replacements = {
        '&': '&#38;',
        '"': '&#34;',
        "'": '&#39;',
        '<': '&#60;'
    };
    return inputString.replace(/[&"'<]/g, match => replacements[match]);
};

exportBundle.locatePatternOccurrences = function(inputString, regexPattern) {
    const foundMatches = [];
    let matchResult;
    const globalRegex = new RegExp(regexPattern.source, regexPattern.flags.includes('g') ? regexPattern.flags : regexPattern.flags + 'g');

    while ((matchResult = globalRegex.exec(inputString)) !== null) {
        foundMatches.push({
            startOffset: matchResult.index,
            matchLength: matchResult[0].length
        });
    }
    return foundMatches;
};

exportBundle.scheduleDelayedExecution = function(actionFunction) {
    let timeoutHandle = null;
    const executeAction = () => {
        timeoutHandle = null;
        actionFunction();
    };

    const delayedControl = {
        initiate: function(delayMs) {
            this.cancelPending();
            timeoutHandle = setTimeout(executeAction, delayMs || 0);
            return this;
        },
        performNow: function() {
            this.cancelPending();
            actionFunction();
            return this;
        },
        cancelPending: function() {
            clearTimeout(timeoutHandle);
            timeoutHandle = null;
            return this;
        },
        isActive: function() {
            return timeoutHandle !== null;
        }
    };
    return delayedControl;
};

exportBundle.throttleFunctionExecution = function(actionFunction, defaultDelay) {
    let timeoutRef = null;
    const performAction = () => {
        timeoutRef = null;
        actionFunction();
    };

    const throttledControl = {
        trigger: function(customDelay) {
            if (timeoutRef === null) {
                timeoutRef = setTimeout(performAction, customDelay || defaultDelay);
            }
        },
        resetAndTrigger: function(customDelay) {
            this.cancelCurrent();
            timeoutRef = setTimeout(performAction, customDelay || defaultDelay);
        },
        performImmediate: function() {
            this.cancelCurrent();
            actionFunction();
        },
        cancelCurrent: function() {
            if (timeoutRef !== null) {
                clearTimeout(timeoutRef);
                timeoutRef = null;
            }
        },
        isCurrentlyActive: function() {
            return timeoutRef !== null;
        }
    };
    return throttledControl;
};

exportBundle.initiateEventCapabilities = (targetObject) => {
    const eventListenersMap = new Map();

    Object.assign(targetObject, {
        subscribe: (eventName, handler) => {
            if (!eventListenersMap.has(eventName)) {
                eventListenersMap.set(eventName, new Set());
            }
            eventListenersMap.get(eventName).add(handler);
        },
        unsubscribe: (eventName, handler) => {
            if (eventListenersMap.has(eventName)) {
                eventListenersMap.get(eventName).delete(handler);
            }
        },
        _dispatchSignal: (eventName, ...args) => {
            if (eventListenersMap.has(eventName)) {
                eventListenersMap.get(eventName).forEach(handler => handler(...args));
            }
        }
    });
};

});

globalContext.establishModule('coreKit/compatibility/legacy_support', ['obtainModule', 'exportBundle', 'moduleContext'], function(obtainModule, exportBundle, moduleContext) {

function TemporaryPrototype() {}

if (!Function.prototype.bind) {
    Object.defineProperty(Function.prototype, 'bind', {
        value: function bindMethod(bindingContext) {
            const originalFunction = this;
            if (typeof originalFunction !== "function") {
                throw new TypeError("Function.prototype.bind called on incompatible " + originalFunction);
            }
            const predefinedArguments = Array.prototype.slice.call(arguments, 1);

            const boundFunction = function () {
                if (this instanceof boundFunction) {
                    const instanceResult = originalFunction.apply(
                        this,
                        predefinedArguments.concat(Array.prototype.slice.call(arguments))
                    );
                    if (Object(instanceResult) === instanceResult) {
                        return instanceResult;
                    }
                    return this;
                } else {
                    return originalFunction.apply(
                        bindingContext,
                        predefinedArguments.concat(Array.prototype.slice.call(arguments))
                    );
                }
            };

            if (originalFunction.prototype) {
                TemporaryPrototype.prototype = originalFunction.prototype;
                boundFunction.prototype = new TemporaryPrototype();
                TemporaryPrototype.prototype = null;
            }
            return boundFunction;
        },
        configurable: true,
        writable: true
    });
}

const functionCallMethod = Function.prototype.call;
const arrayPrototypeReference = Array.prototype;
const objectPrototypeReference = Object.prototype;
const arraySliceMethod = arrayPrototypeReference.slice;

const objectToStringBound = functionCallMethod.bind(objectPrototypeReference.toString);
const objectHasOwnPropertyBound = functionCallMethod.bind(objectPrototypeReference.hasOwnProperty);

});

globalContext.establishModule('coreKit/worker/reflector', ['obtainModule', 'exportBundle', 'moduleContext'], function(obtainModule, exportBundle, moduleContext) {
    var objectUtil = obtainModule("coreKit/utility/object_manipulation");
    var stringArrayUtil = obtainModule("coreKit/utility/string_array_tools");

    var Reflector = exportBundle.Reflector = function(transmitter) {
        this.transmitter = transmitter;
        this.documentContent = {
            getValue: () => this._currentDocumentValue || ''
        };
        this._currentDocumentValue = '';
        this._updateDelay = 0;
        this._deferredUpdate = stringArrayUtil.scheduleDelayedExecution(() => this.processUpdate());
    };

    (function() {
        this.setDocument = function(text) {
            this._currentDocumentValue = text;
            this._deferredUpdate.initiate(this._updateDelay);
        };
        this.setDelay = function(delay) {
            this._updateDelay = delay;
        };
        this.processUpdate = function() {
        };
    }).call(Reflector.prototype);
});

globalContext.establishModule('coreKit/markup/html_parser', ['obtainModule', 'exportBundle', 'moduleContext'], function(obtainModule, exportBundle, moduleContext) {
    var MarkupParser = exportBundle.MarkupParser = function() {
        this.contentHandler = {};
        this.errorHandler = {};
    };

    (function() {
        this.parseFragment = function(htmlString, context) {
            if (this.errorHandler.error && htmlString.includes('<unclosed')) {
                this.errorHandler.error('Unclosed tag detected', {line: 0, column: 0}, 'unclosed-tag');
            }
        };
        this.parse = function(htmlString) {
            this.parseFragment(htmlString, null);
        };
    }).call(MarkupParser.prototype);
});


})(self);