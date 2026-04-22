/**
 * EventDelegator.js - Core Event Delegation Module
 *
 * This module provides a flexible meta-framework for managing scoped events
 * and component lifecycles across various JavaScript DOM manipulation libraries.
 *
 * Copyright (c) 2012 Michelle Steigerwalt, http://evejs.com/
 *
 * This software is provided under the MIT License.
 * For full license text, please refer to the original Eve.js distribution.
 * Permission is granted for use, modification, and distribution.
 */
(function(globalRef) {

    // Internal configuration and state management
    const internalState = {
        componentRegistry: {}, // Stores defined components
        activeRegions: {},     // Stores active scope instances
        linkedModules: {},     // Stores attached module instances
        contextExtensions: {}, // Custom functions to extend scope contexts
        tracedComponents: new Set(), // Components enabled for detailed logging
        traceAll: false,       // Flag to enable logging for all components
        activeEngine: null,    // The detected DOM manipulation engine (jQuery, Zepto, etc.)
        domAdapter: null,      // The specific DOM utility object for the active engine
        defaultRootElement: document.documentElement // Default root for event delegation
    };

    // --- Utility functions for internal use ---

    // A simple utility for object merging (shallow)
    const mergeObjects = (target, source) => {
        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }
        return target;
    };

    // Standardizes string input for framework names
    const normalizeEngineName = (engineName) => String(engineName).toLowerCase();

    // Ascertains the active DOM manipulation engine in the global context.
    // This function attempts to identify and configure the environment.
    const ascertainDomEngine = () => {
        if (internalState.activeEngine) {
            return internalState.activeEngine;
        }

        const knownEngines = ['Zepto', 'jQuery', 'MooTools', 'YUI', 'Prototype', 'dojo'];

        for (const engineName of knownEngines) {
            if (globalRef[engineName]) {
                EventDelegator.configureEngine(engineName);
                return engineName;
            }
        }
        // If no supported engine is found, log a non-fatal warning
        if (globalRef.console && globalRef.console.warn) {
            globalRef.console.warn("EventDelegator: No supported JavaScript engine detected. Functionality may be limited.");
        }
        return null; // Indicate no engine was found
    };

    // Checks if a specific DOM engine is currently active.
    const isEngineOperational = (potentialEngine) => {
        const currentEngine = internalState.activeEngine || ascertainDomEngine();
        return potentialEngine ? (currentEngine === normalizeEngineName(potentialEngine)) : currentEngine;
    };

    // Provides structured logging for component activities.
    const logActivity = (componentIdentifier, activityMessage) => {
        if (!globalRef.console) {
            return; // No console available
        }

        let shouldLog = internalState.traceAll;
        if (!shouldLog) {
            shouldLog = internalState.tracedComponents.has(componentIdentifier);
        }

        if (!shouldLog) {
            return; // Logging not enabled for this component
        }

        const timestamp = new Date().toISOString().split('T')[1].slice(0, -1); // HH:MM:SS.ms
        const paddedIdentifier = (componentIdentifier + ' '.repeat(15)).substring(0, 15);
        globalRef.console.debug(`[${timestamp}] ${paddedIdentifier} | ${activityMessage}`);
    };

    // Prepares a module or scope instance by injecting common utilities and extensions.
    // This function applies the ScopedContext prototype and any custom extensions.
    const prepareScopedInstance = (initialFunction, instanceObject, targetCollection, instanceIdentifier) => {
        // Ensure the instanceObject has the ScopedContext capabilities
        mergeObjects(instanceObject, ScopedContext);

        // Apply any global context extensions
        mergeObjects(instanceObject, internalState.contextExtensions);

        // Execute the initial function in the context of the prepared instanceObject
        // and store its return value in the target collection.
        if (isEngineOperational("YUI")) {
            globalRef.YUI().use('node', (Y) => {
                internalState.domAdapter = Y.one;
                targetCollection[instanceIdentifier] = initialFunction.apply(instanceObject);
            });
        } else if (isEngineOperational("dojo")) {
            globalRef.require(["dojo/NodeList-dom", "dojo/NodeList-traverse"], (dom) => {
                internalState.domAdapter = dom;
                targetCollection[instanceIdentifier] = initialFunction.apply(instanceObject);
            });
        } else {
            // For other frameworks or if no specific adapter is needed
            targetCollection[instanceIdentifier] = initialFunction.apply(instanceObject);
        }
    };

    // --- Core API of the EventDelegator ---

    globalRef.EventDelegator = {

        // Configures the JavaScript DOM engine to be used by the framework.
        configureEngine: (engineName) => {
            const normalizedName = normalizeEngineName(engineName);
            internalState.activeEngine = normalizedName;

            // Handle no-conflict scenarios for jQuery/Zepto
            if (normalizedName === 'jquery' && globalRef.jQuery) {
                globalRef.$ = globalRef.jQuery;
            } else if (normalizedName === 'zepto' && globalRef.Zepto) {
                globalRef.$ = globalRef.Zepto;
            }
            logActivity("Core", `Engine configured: ${normalizedName}`);
            return EventDelegator; // Allow chaining
        },

        // Toggles tracing for specific components or globally.
        toggleTracing: (componentIdentifier = null) => {
            if (componentIdentifier) {
                if (internalState.tracedComponents.has(componentIdentifier)) {
                    internalState.tracedComponents.delete(componentIdentifier);
                    logActivity(componentIdentifier, "Tracing disabled.");
                } else {
                    internalState.tracedComponents.add(componentIdentifier);
                    logActivity(componentIdentifier, "Tracing enabled.");
                }
            } else {
                internalState.traceAll = !internalState.traceAll;
                logActivity("Core", `Global tracing ${internalState.traceAll ? 'enabled' : 'disabled'}.`);
            }
            return EventDelegator;
        },

        // Defines and stores a new component within the registry.
        enrollComponent: (name, componentDefinition) => {
            if (!name || typeof name !== 'string') {
                throw new TypeError("Component name must be a non-empty string.");
            }
            if (!componentDefinition || typeof componentDefinition !== 'function') {
                throw new TypeError("Component definition must be a function.");
            }

            if (internalState.componentRegistry[name]) {
                // For Type III, changed from throw to configurable behavior (e.g., warn and return)
                if (globalRef.console && globalRef.console.warn) {
                    globalRef.console.warn(`EventDelegator: Component '${name}' already registered. Overwriting.`);
                }
                // Optionally, could return false or throw if strict mode is desired.
            }
            internalState.componentRegistry[name] = componentDefinition;
            logActivity(name, "Component enrolled.");
            return EventDelegator;
        },

        // Extends the base context object for all future scopes and attached modules.
        augmentContext: (key, extensionFunction) => {
            if (!key || typeof key !== 'string') {
                throw new TypeError("Extension key must be a non-empty string.");
            }
            if (typeof extensionFunction !== 'function') {
                throw new TypeError("Extension must be a function.");
            }
            internalState.contextExtensions[key] = extensionFunction;
            logActivity("Core", `Context augmented with '${key}'.`);
            return EventDelegator;
        },

        // Defines a new isolated region (scope) for event delegation and module management.
        createScope: (regionIdentifier, scopeInitializer) => {
            if (!regionIdentifier || typeof regionIdentifier !== 'string') {
                throw new TypeError("Scope identifier must be a non-empty string.");
            }
            if (typeof scopeInitializer !== 'function') {
                throw new TypeError("Scope initializer must be a function.");
            }

            if (internalState.activeRegions[regionIdentifier]) {
                if (globalRef.console && globalRef.console.warn) {
                    globalRef.console.warn(`EventDelegator: Duplicate region identifier: '${regionIdentifier}'.`);
                }
            }

            prepareScopedInstance(scopeInitializer, {
                identifier: regionIdentifier,
                regionPath: regionIdentifier // Renamed from 'namespace'
            }, internalState.activeRegions, regionIdentifier);

            logActivity(regionIdentifier, "Scope created.");
            return EventDelegator;
        },

        // Links a registered component to a specific DOM region or namespace.
        associateModule: (componentName, regionPath, ...extraArgs) => {
            if (!componentName || typeof componentName !== 'string') {
                throw new TypeError("Component name must be a non-empty string.");
            }
            if (typeof regionPath !== 'string') {
                // Ensure regionPath is always a string, even if empty
                regionPath = '';
            }

            // Construct a unique key for this module-region association
            const associationKey = `${componentName}::${regionPath}`;

            // Prevent re-attaching the same module to the same region
            if (internalState.linkedModules[associationKey]) {
                logActivity(componentName, `Module '${componentName}' already associated with region '${regionPath}'. Skipping.`);
                return false;
            }

            const componentDefinition = internalState.componentRegistry[componentName];
            if (!componentDefinition) {
                if (globalRef.console && globalRef.console.warn) {
                    globalRef.console.warn(`EventDelegator: Component '${componentName}' not found in registry. Cannot associate.`);
                }
                return false;
            }

            // Create a wrapper function for the component definition, passing extra args
            const moduleWrapper = function() {
                return componentDefinition.apply(this, extraArgs);
            };

            prepareScopedInstance(moduleWrapper, {
                regionPath: regionPath,
                identifier: componentName
            }, internalState.linkedModules, associationKey);

            logActivity(componentName, `Module associated with region '${regionPath}'.`);
            return true;
        }
    };

    // --- Prototype for Scoped Contexts ---
    // All scopes and attached modules inherit these methods.
    const ScopedContext = {

        // Delegates an event to a selector within the current scope.
        delegateAction: function(selectorOrEvent, eventTypeOrHandler, eventHandler) {
            let actualSelector = '';
            let actualEventType = selectorOrEvent;
            let actualHandler = eventTypeOrHandler;

            // Handle optional selector parameter (similar to original 'listen' logic)
            if (typeof selectorOrEvent === 'string' && typeof eventTypeOrHandler === 'string') {
                actualSelector = selectorOrEvent;
                actualEventType = eventTypeOrHandler;
                actualHandler = eventHandler;
            } else if (typeof selectorOrEvent === 'string' && typeof eventTypeOrHandler === 'function') {
                 // Assume selector is omitted, eventTypeOrHandler is handler, selectorOrEvent is event
                actualSelector = '';
                actualEventType = selectorOrEvent;
                actualHandler = eventTypeOrHandler;
            } else if (typeof selectorOrEvent === 'function') {
                // Both selector and event are omitted, only handler provided (invalid for this signature)
                throw new TypeError("Invalid arguments for delegateAction: missing event type.");
            }

            if (typeof actualHandler !== 'function') {
                throw new TypeError("Event handler must be a function.");
            }

            // Determine the root element for delegation. If an event is currently active in this context,
            // we delegate from the element that triggered it, otherwise from the default root.
            const delegationRoot = (this.currentEvent) ? this.locateElements() : internalState.defaultRootElement;

            const componentName = this.identifier;
            const fullSelector = (this.regionPath + ' ' + actualSelector).trim();

            const eventProcessor = (eventObject, targetElement) => {
                logActivity(componentName, `Event: ${fullSelector}:${actualEventType}`);
                // Create a temporary context for the handler execution
                const handlerContext = Object.assign({}, this, { currentEvent: eventObject });

                // Normalize event target across different frameworks
                if (isEngineOperational("MooTools")) {
                    eventObject.target = targetElement; // MooTools passes target as second arg
                } else if (isEngineOperational("jQuery") || isEngineOperational("Zepto")) {
                    eventObject.target = eventObject.currentTarget;
                } else if (isEngineOperational("dojo")) {
                    eventObject.target = eventObject.explicitOriginalTarget || eventObject.target;
                }

                actualHandler.apply(handlerContext, [eventObject, targetElement]);
            };

            // Framework-specific event delegation implementations
            if (isEngineOperational("jQuery") || isEngineOperational("Zepto")) {
                globalRef.$(delegationRoot).delegate(fullSelector, actualEventType, eventProcessor);
            } else if (isEngineOperational('MooTools')) {
                // MooTools has a less intuitive delegation syntax
                globalRef.$(delegationRoot).addEvent(`${actualEventType}:relay(${fullSelector})`, eventProcessor);
            } else if (isEngineOperational("YUI")) {
                internalState.domAdapter(delegationRoot).delegate(actualEventType, eventProcessor, fullSelector);
            } else if (isEngineOperational("Prototype")) {
                globalRef.$(delegationRoot).on(actualEventType, fullSelector, eventProcessor);
            } else if (isEngineOperational("dojo")) {
                globalRef.require(["dojo/on"], (on) => {
                    on(delegationRoot, `${fullSelector}:${actualEventType}`, eventProcessor);
                });
            } else {
                if (globalRef.console && globalRef.console.warn) {
                    globalRef.console.warn(`EventDelegator: No delegation mechanism found for current engine. Event '${actualEventType}' on '${fullSelector}' may not be handled.`);
                }
            }
        },

        // Locates DOM elements within the current scope's context.
        locateElements: function(querySelector = '') {
            const normalizedQuery = (querySelector || '').trim();
            const currentEngine = isEngineOperational();

            // Determine the starting point for the query
            let queryRoot = (this.currentEvent) ? this.currentEvent.target : internalState.defaultRootElement;

            // Wrap the root element with the engine's selector function if available
            if (currentEngine === 'jquery' && globalRef.jQuery) queryRoot = globalRef.jQuery(queryRoot);
            else if (currentEngine === 'zepto' && globalRef.Zepto) queryRoot = globalRef.Zepto(queryRoot);
            else if (internalState.domAdapter) queryRoot = internalState.domAdapter(queryRoot);

            // Map of engine-specific DOM manipulation methods
            const engineMethodMap = {
                jQuery:    { match: 'is',       ancestor: 'parents', find: 'find' },
                Zepto:     { match: 'is',       ancestor: 'parents', find: 'find' },
                MooTools:  { match: 'match',    ancestor: 'getParent', find: 'getElements' },
                Prototype: { match: 'match',    ancestor: 'up',      find: 'select' },
                YUI:       { match: 'test',     ancestor: 'ancestor', find: 'all' },
                dojo:      { match: null,       ancestor: 'closest', find: 'query' } // Dojo match is often handled differently
            };

            const engineMethods = engineMethodMap[currentEngine];
            if (!engineMethods) {
                if (globalRef.console && globalRef.console.warn) {
                    globalRef.console.warn(`EventDelegator: No DOM query adapter for engine '${currentEngine}'. Cannot locate elements.`);
                }
                return []; // Return an empty array if no adapter
            }

            const { match, ancestor, find } = engineMethods;
            let targetScope = queryRoot;

            // If an event triggered this, we need to find the element that matches the scope's regionPath
            if (this.currentEvent) {
                const regionMatchesTarget = match && targetScope[match](this.regionPath);
                if (regionMatchesTarget) {
                    // The event target itself is the region root
                    targetScope = queryRoot;
                } else {
                    // Find the closest ancestor that matches the regionPath
                    targetScope = targetScope[ancestor](this.regionPath);
                }
            }

            // If no targetScope found or it's not a valid element, return empty
            if (!targetScope || !targetScope[find]) {
                return [];
            }

            // Perform the final query
            const finalQuery = (this.currentEvent) ? normalizedQuery : `${this.regionPath} ${normalizedQuery}`;
            return targetScope[find](finalQuery.trim());
        },

        // Retrieves the first element matching a selector within the current context.
        getFirstElement: function(querySelector, preQueryResult) {
            let resultElements = preQueryResult;
            if (arguments.length < 2) {
                resultElements = this.locateElements(querySelector);
            }

            if (isEngineOperational('YUI') && resultElements && typeof resultElements.getDOMNodes === 'function') {
                resultElements = resultElements.getDOMNodes();
            }

            return resultElements && resultElements.length > 0 ? resultElements[0] : null;
        },

        // Creates a nested scope, extending the current region path.
        nestScope: function(subIdentifier, subScopeInitializer) {
            if (!subIdentifier || typeof subIdentifier !== 'string') {
                throw new TypeError("Sub-scope identifier must be a non-empty string.");
            }
            if (typeof subScopeInitializer !== 'function') {
                throw new TypeError("Sub-scope initializer must be a function.");
            }

            const nestedRegionPath = `${this.regionPath} ${subIdentifier}`;
            EventDelegator.createScope(nestedRegionPath, subScopeInitializer);
            return this; // Allow chaining within the scope context
        },

        // Links a component to a sub-region within the current scope.
        linkModule: function(moduleName, subRegion = '') {
            if (!moduleName || typeof moduleName !== 'string') {
                throw new TypeError("Module name must be a non-empty string.");
            }
            const fullRegionPath = `${this.regionPath} ${subRegion}`.trim();
            EventDelegator.associateModule(moduleName, fullRegionPath);
            return this; // Allow chaining within the scope context
        }
    };

})(typeof self !== 'undefined' ? self : this); // Use 'self' for web workers, fallback to 'this' (window/global)

// Export for CommonJS environments (Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = this.EventDelegator;
}