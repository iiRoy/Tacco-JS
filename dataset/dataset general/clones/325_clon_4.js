(function(globalContext) {

const componentDefinitions = new Map();
const namespaceMap = new Map();
const activeInstances = new Map();
const commonBehaviors = new Map();

let currentFramework = null;
let domQueryEngine = null;

const debugModules = new Set();
let globalDebugEnabled = false;

const identifyDomUtility = () => {
    if (currentFramework) return currentFramework;

    const potentialUtilities = [
        { name: 'zepto', globalObject: 'Zepto', factory: (w) => w.Zepto },
        { name: 'jquery', globalObject: 'jQuery', factory: (w) => w.jQuery },
        { name: 'mootools', globalObject: 'MooTools', factory: (w) => w.$ },
        { name: 'prototype', globalObject: 'Prototype', factory: (w) => w.$ },
        { name: 'yui', globalObject: 'YUI', factory: null }, // YUI needs async load
        { name: 'dojo', globalObject: 'dojo', factory: null } // Dojo needs async load
    ];

    for (const utility of potentialUtilities) {
        if (globalContext[utility.globalObject]) {
            setDomUtility(utility.name);
            if (utility.factory) {
                domQueryEngine = utility.factory(globalContext);
            }
            return utility.name;
        }
    }
    console.error("Orchestrator: No recognized JavaScript DOM utility found.");
    return null;
};

const setDomUtility = (utilityAlias) => {
    currentFramework = (utilityAlias + "").toLowerCase();
    if (currentFramework === 'jquery' && typeof globalContext.jQuery !== 'undefined') globalContext.$ = globalContext.jQuery;
    if (currentFramework === 'zepto' && typeof globalContext.Zepto !== 'undefined') globalContext.$ = globalContext.Zepto;
};

const checkDomUtility = (testName) => {
    const activeUtility = currentFramework || identifyDomUtility();
    return testName ? (activeUtility === testName.toLowerCase()) : activeUtility;
};

const logMessage = (sourceId, content) => {
    if (!globalContext.console) return;
    let shouldLog = globalDebugEnabled;
    if (!globalDebugEnabled) {
        shouldLog = debugModules.has(sourceId);
    }
    if (!shouldLog) return;
    let formattedSource = sourceId.substring(0, 10).padEnd(10, ' ') + " - ";
    console.info(formattedSource, content);
};

const activateContextualFunction = (userFunction, contextObject, targetMap, mapKey) => {
    Object.assign(contextObject, Object.fromEntries(commonBehaviors));

    const performExecution = (obj) => {
        targetMap.set(mapKey, userFunction.apply(obj));
    };

    switch (checkDomUtility()) {
        case "yui":
            globalContext.YUI().use('node', (Y) => {
                domQueryEngine = Y.one;
                performExecution(contextObject);
            });
            break;
        case "dojo":
            globalContext.require(["dojo/query"], (query) => {
                domQueryEngine = query;
                performExecution(contextObject);
            });
            break;
        default:
            performExecution(contextObject);
            break;
    }
};

const createInteractionContext = (contextId, contextPath, parentEvent = null) => {
    const currentContext = {
        name: contextId,
        path: contextPath,
        triggeredEvent: parentEvent,

        observeEvent: function(targetSelector, eventType, eventHandler) {
            if (!eventHandler) {
                eventHandler = eventType;
                eventType = targetSelector;
                targetSelector = '';
            }
            targetSelector = targetSelector || '';

            const effectiveScopeElement = (this.triggeredEvent)
                ? this.locateElements().fetchFirstElement()
                : document.body;

            const fullSelector = (this.path + ' ' + targetSelector).trim();
            const boundHandler = (evt, customTarget) => {
                logMessage(this.name, `${fullSelector}:${eventType}`);
                const handlerContext = { ...this, triggeredEvent: evt };

                switch (checkDomUtility()) {
                    case "mootools": evt.target = customTarget; break;
                    case "jquery":
                    case "zepto": evt.target = evt.currentTarget; break;
                    case "dojo": evt.target = evt.explicitOriginalTarget; break;
                }

                eventHandler.apply(handlerContext, [evt, customTarget]);
            };

            switch (checkDomUtility()) {
                case "jquery":
                case "zepto":
                    globalContext.$(effectiveScopeElement).delegate(fullSelector, eventType, boundHandler);
                    break;
                case "mootools":
                    globalContext.$(effectiveScopeElement).addEvent(`${eventType}:relay(${fullSelector})`, boundHandler);
                    break;
                case "yui":
                    if (domQueryEngine) domQueryEngine(effectiveScopeElement).delegate(eventType, boundHandler, fullSelector);
                    else {
                         globalContext.YUI().use('node', (Y) => {
                             domQueryEngine = Y.one;
                             domQueryEngine(effectiveScopeElement).delegate(eventType, boundHandler, fullSelector);
                         });
                    }
                    break;
                case "prototype":
                    globalContext.$(effectiveScopeElement).on(eventType, fullSelector, boundHandler);
                    break;
                case "dojo":
                    globalContext.require(["dojo/on"], (on) => {
                        on(effectiveScopeElement, `${fullSelector}:${eventType}`, boundHandler);
                    });
                    break;
                default:
                    console.warn(`Orchestrator: No delegation method for ${currentFramework}. Fallback to direct event listener (may not work for delegation).`);
                    effectiveScopeElement.addEventListener(eventType, (e) => {
                        if (e.target.matches(fullSelector)) {
                            boundHandler(e);
                        }
                    });
                    break;
            }
        },

        locateElements: function(queryCriterion = '') {
            queryCriterion = (queryCriterion || '').trim();
            let initialElement = (this.triggeredEvent) ? this.triggeredEvent.target : document.body;

            let wrappedInitialElement = initialElement;
            switch (checkDomUtility()) {
                case 'jquery': wrappedInitialElement = globalContext.jQuery(initialElement); break;
                case 'zepto': wrappedInitialElement = globalContext.Zepto(initialElement); break;
                case 'mootools':
                case 'prototype': wrappedInitialElement = globalContext.$(initialElement); break;
                case 'yui': if (domQueryEngine) wrappedInitialElement = domQueryEngine(initialElement); break; // Y.one wraps
                // dojo/query is a function, not a wrapper for elements, handled later
            }

            const utilityMapping = new Map([
                ['jquery', { check: 'is', traverseUp: 'parents', selectMany: 'find' }],
                ['zepto', { check: 'is', traverseUp: 'parents', selectMany: 'find' }],
                ['mootools', { check: 'match', traverseUp: 'getParent', selectMany: 'getElements' }],
                ['prototype', { check: 'match', traverseUp: 'up', selectMany: 'select' }],
                ['yui', { check: 'test', traverseUp: 'ancestor', selectMany: 'all' }],
                ['dojo', { check: '', traverseUp: 'closest', selectMany: 'query' }]
            ]);

            const activeUtility = checkDomUtility();
            if (utilityMapping.has(activeUtility)) {
                const { check, traverseUp, selectMany } = utilityMapping.get(activeUtility);

                if (activeUtility !== 'dojo' && wrappedInitialElement && typeof wrappedInitialElement[check] === 'function' && wrappedInitialElement[check](this.path)) {
                    return {
                        fetchFirstElement: () => wrappedInitialElement[0] || wrappedInitialElement,
                        get: (idx) => wrappedInitialElement[idx],
                        length: wrappedInitialElement.length || 1, // jQuery/Zepto objects have length, YUI/MooTools/Prototype might not for single element
                        each: function(callback) { if (wrappedInitialElement.forEach) wrappedInitialElement.forEach(callback); else if (wrappedInitialElement.length) Array.from(wrappedInitialElement).forEach(callback); else callback(wrappedInitialElement); }
                    };
                }

                let potentialContainer;
                if (this.triggeredEvent) {
                    potentialContainer = wrappedInitialElement && typeof wrappedInitialElement[traverseUp] === 'function' ? wrappedInitialElement[traverseUp](this.path) : null;
                } else {
                    potentialContainer = wrappedInitialElement;
                }

                if (!potentialContainer || (potentialContainer.length === 0 && activeUtility !== 'yui')) {
                    potentialContainer = domQueryEngine ? domQueryEngine(document.body) : (globalContext.$ ? globalContext.$(document.body) : document.body);
                }

                const finalQuery = (this.triggeredEvent) ? queryCriterion : `${this.path} ${queryCriterion}`;

                if (activeUtility === 'dojo') {
                    const contextNode = (potentialContainer && potentialContainer.length > 0) ? potentialContainer[0] : document.body;
                    return domQueryEngine(finalQuery, contextNode);
                } else {
                    return potentialContainer[selectMany](finalQuery);
                }
            }

            const effectiveQuerySelector = this.path ? `${this.path} ${queryCriterion}` : queryCriterion;
            const allMatching = Array.from(document.querySelectorAll(effectiveQuerySelector));
            return {
                fetchFirstElement: () => allMatching[0],
                get: (idx) => allMatching[idx],
                length: allMatching.length,
                each: function(callback) { allMatching.forEach(callback); }
            };
        },

        fetchFirstElement: function(queryCriterion, elementCollection) {
            elementCollection = (arguments.length === 2) ? elementCollection : this.locateElements(queryCriterion);
            if (checkDomUtility('YUI') && elementCollection && typeof elementCollection.getDOMNodes === 'function') {
                elementCollection = elementCollection.getDOMNodes();
            }
            return elementCollection && (elementCollection.length > 0 || elementCollection instanceof HTMLElement || elementCollection.nodeType) ? (elementCollection[0] || elementCollection) : null;
        },

        nestNamespace: function(nestedId, configFunction) {
            orchestrationSystem.defineNamespace(`${this.path} ${nestedId}`, configFunction);
        },

        linkComponent: function(componentId, instancePath) {
            orchestrationSystem.instantiateComponent(componentId, `${this.path} ${instancePath || ''}`);
        }
    };

    return currentContext;
};

globalContext.orchestrationSystem = {

    configureDomUtility: function(utilityName) {
        setDomUtility(utilityName);
    },

    enableLogging: function(moduleIdentifier) {
        if (moduleIdentifier) {
            debugModules.add(moduleIdentifier);
        } else {
            globalDebugEnabled = true;
        }
    },

    addComponentDefinition: function(componentId, componentDefinition) {
        logMessage(componentId, "definition added");
        if (componentDefinitions.has(componentId)) {
            throw new Error(`Component definition already exists: ${componentId}`);
        }
        componentDefinitions.set(componentId, componentDefinition);
        return this;
    },

    addSharedBehavior: function(behaviorKey, behaviorFunction) {
        commonBehaviors.set(behaviorKey, behaviorFunction);
    },

    defineNamespace: function(namespacePath, configurationFunction) {
        if (namespaceMap.has(namespacePath)) {
            console.warn(`Orchestrator: Duplicate namespace path: ${namespacePath}`);
        }
        const newContext = createInteractionContext(namespacePath, namespacePath);
        activateContextualFunction(configurationFunction, newContext, namespaceMap, namespacePath);
    },

    instantiateComponent: function(componentId, instanceNamespace) {
        const componentFunction = componentDefinitions.get(componentId);
        if (!componentFunction) {
            console.warn(`Orchestrator: Component definition not found: ${componentId}`);
            return false;
        }

        logMessage(componentId, `instantiated at ${instanceNamespace}`);

        const instanceKey = `${componentId}::${instanceNamespace}`;
        if (activeInstances.has(instanceKey)) {
            return false;
        }

        const instanceContext = createInteractionContext(componentId, instanceNamespace);
        const extraArguments = Array.prototype.slice.call(arguments, 2);

        const wrappedComponentFunction = function() {
            return componentFunction.apply(this, extraArguments);
        };

        activateContextualFunction(wrappedComponentFunction, instanceContext, activeInstances, instanceKey);
        return true;
    }
};

})(this);

if (this.module && this.module.exports) this.module.exports = this.orchestrationSystem;