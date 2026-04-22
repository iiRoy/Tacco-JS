// Global configuration object for managing application behavior and settings.
const ApplicationSettings = {
    // ID of the DOM element where log messages will be displayed.
    outputElementId: 'appLogDisplayArea',
    // Flag to enable or disable verbose logging in the console.
    enableVerboseDebugLogging: true,
    // Default name to use if a user name is not provided.
    defaultProfileName: 'AnonymousUser',
    // Custom event name for module loading failures.
    moduleLoadingFailureEvent: 'assetLoadProblem'
};

/**
 * Core utility class for managing application scopes, module loading, and event handling.
 * This class serves as a sophisticated replacement for the original 'Namespace' concept.
 * It's designed to handle both synchronous scope definition and asynchronous resource loading.
 * @class ScopeRegistry
 */
class ScopeRegistry {
    // Private static property to hold all registered scopes.
    static #registeredScopes = {};
    // Private static property for event handlers.
    static #eventHandlers = {};

    /**
     * Establishes a new application scope or retrieves an existing one based on a dotted path.
     * If the scope doesn't exist, it will be created. Properties can be immediately added.
     * @param {string} scopeIdentifier - The unique, dot-separated path for the scope (e.g., 'org.app.components').
     * @param {object} [scopeProperties={}] - An object containing properties to assign to the new or existing scope.
     * @returns {object} The scope object, ensuring it's always returned.
     */
    static defineScope(scopeIdentifier, scopeProperties = {}) {
        let currentScopeSegment = ScopeRegistry.#registeredScopes;
        const pathSegments = scopeIdentifier.split('.');

        // Traverse or create the scope path.
        for (const segment of pathSegments) {
            if (typeof currentScopeSegment[segment] === 'undefined' || currentScopeSegment[segment] === null) {
                currentScopeSegment[segment] = {}; // Initialize as an empty object if not present.
            } else if (typeof currentScopeSegment[segment] !== 'object' || Array.isArray(currentScopeSegment[segment])) {
                // Handle cases where a segment might have been overwritten by a non-object.
                console.warn(`Scope segment '${segment}' at path '${scopeIdentifier}' was not an object. Overwriting.`);
                currentScopeSegment[segment] = {};
            }
            currentScopeSegment = currentScopeSegment[segment];
        }

        // Merge provided properties into the established scope.
        Object.assign(currentScopeSegment, scopeProperties);
        return currentScopeSegment;
    }

    /**
     * Resolves a scope identifier to its corresponding object within the registry.
     * @param {string} scopeIdentifier - The dot-separated path of the scope to resolve.
     * @returns {object|undefined} The resolved scope object, or undefined if not found.
     */
    static retrieveScope(scopeIdentifier) {
        let currentScopeSegment = ScopeRegistry.#registeredScopes;
        const pathSegments = scopeIdentifier.split('.');
        for (const segment of pathSegments) {
            if (currentScopeSegment && typeof currentScopeSegment === 'object' && Object.prototype.hasOwnProperty.call(currentScopeSegment, segment)) {
                currentScopeSegment = currentScopeSegment[segment];
            } else {
                return undefined; // Path segment not found.
            }
        }
        return currentScopeSegment;
    }

    /**
     * Asynchronously loads a JavaScript resource and then processes its content.
     * This method acts as a unified entry point for both 'include' and 'use' functionalities
     * when they involve loading external files.
     * @param {string} resourceKey - The identifier for the resource (e.g., 'org.app.components.GreetingService').
     * @param {Function} [onResourceReady] - Callback to execute once the resource is loaded and processed.
     */
    static acquireResource(resourceKey, onResourceReady) {
        // Log the start of resource acquisition if verbose logging is enabled.
        if (ApplicationSettings.enableVerboseDebugLogging) {
            ScopeRegistry.defineScope('org.app.components').DisplayOutput.outputLog(`Initiating asynchronous acquisition for: ${resourceKey}`);
        }

        // Simulate network latency and file loading.
        setTimeout(() => {
            const isResourceFound = (resourceKey !== 'org.app.components.missingAsset');
            if (isResourceFound) {
                // Simulate defining the resource content into the scope.
                const simulatedModuleContent = ScopeRegistry.simulateModuleDefinition(resourceKey);
                ScopeRegistry.defineScope(resourceKey, simulatedModuleContent);

                if (ApplicationSettings.enableVerboseDebugLogging) {
                    ScopeRegistry.defineScope('org.app.components').DisplayOutput.outputLog(`Resource '${resourceKey}' successfully acquired.`);
                }
                if (onResourceReady) onResourceReady(); // Execute the completion callback.
            } else {
                // Trigger an error event if the resource is not found.
                const failureDetails = {
                    resourcePath: resourceKey,
                    incidentTime: new Date().toISOString(),
                    reasonCode: 'RESOURCE_NOT_FOUND',
                    message: `Failed to load resource '${resourceKey}'. It might be missing or inaccessible.`
                };
                ScopeRegistry.dispatchGlobalEvent(ApplicationSettings.moduleLoadingFailureEvent, failureDetails);
                if (onResourceReady) onResourceReady(); // Call even on failure, if the callback needs to know.
            }
        }, 100 + Math.random() * 200); // Variable delay for simulation.
    }

    /**
     * Imports properties from a specified scope path into the global context (window object).
     * This method also handles asynchronous loading if the scope is not immediately available.
     * @param {string} importTarget - The path to import (e.g., 'org.app.components.DisplayOutput.*' or 'org.app.components.ProfileManager').
     * @param {Function} [onImportComplete] - Callback executed after import, particularly for async loads.
     */
    static integrateIntoGlobal(importTarget, onImportComplete) {
        const pathParts = importTarget.split('.');
        const lastPart = pathParts[pathParts.length - 1];
        const isWildcardImport = (lastPart === '*');
        const effectiveScopePath = isWildcardImport ? pathParts.slice(0, -1).join('.') : importTarget;

        const processIntegration = (scopeToIntegrate) => {
            if (typeof window === 'undefined') {
                console.warn('Cannot integrate into global scope outside of a browser environment.');
                return;
            }
            if (isWildcardImport) {
                // Copy all enumerable properties from the source scope to the global object.
                for (const propName in scopeToIntegrate) {
                    if (Object.prototype.hasOwnProperty.call(scopeToIntegrate, propName)) {
                        window[propName] = scopeToIntegrate[propName];
                        if (ApplicationSettings.enableVerboseDebugLogging) {
                           ScopeRegistry.defineScope('org.app.components').DisplayOutput.outputLog(`Globally exposed: ${propName} from ${effectiveScopePath}`);
                        }
                    }
                }
            } else {
                // For non-wildcard, assume the last part is the specific item to import.
                const itemToImport = scopeToIntegrate; // If it's a class, it's the class itself.
                const globalName = lastPart;
                if (itemToImport) {
                    window[globalName] = itemToImport;
                    if (ApplicationSettings.enableVerboseDebugLogging) {
                       ScopeRegistry.defineScope('org.app.components').DisplayOutput.outputLog(`Globally exposed: ${globalName} from ${importTarget}`);
                    }
                } else {
                    ScopeRegistry.defineScope('org.app.components').DisplayOutput.outputLog(`Warning: No specific item '${globalName}' found for direct global import from '${effectiveScopePath}'.`, 'warn');
                }
            }
        };

        let targetScope = ScopeRegistry.retrieveScope(effectiveScopePath);

        if (!targetScope) {
            // If the scope isn't present, attempt to acquire it asynchronously.
            ScopeRegistry.acquireResource(effectiveScopePath, () => {
                targetScope = ScopeRegistry.retrieveScope(effectiveScopePath);
                if (targetScope) {
                    processIntegration(targetScope);
                } else {
                    ScopeRegistry.defineScope('org.app.components').DisplayOutput.outputLog(`Error: Scope '${effectiveScopePath}' not found even after asynchronous acquisition.`, 'error');
                }
                if (onImportComplete) onImportComplete();
            });
        } else {
            // If the scope is already available, process the integration immediately.
            processIntegration(targetScope);
            if (onImportComplete) onImportComplete();
        }
    }

    /**
     * Initiates a chained import sequence, allowing for relative imports from a base scope.
     * @param {string} baseScopePath - The base scope identifier (e.g., 'org.app.components.utilities').
     * @returns {object} An object with a 'thenIntegrate' method to continue the chain.
     */
    static fromBaseScope(baseScopePath) {
        return {
            thenIntegrate: function(relativeImportPath, completionHandler) {
                // Construct the full import path from the base and relative path.
                const fullImportPath = baseScopePath + (relativeImportPath.startsWith('.') ? relativeImportPath : '.' + relativeImportPath);
                ScopeRegistry.integrateIntoGlobal(fullImportPath, completionHandler);
            }
        };
    }

    /**
     * Registers an event handler for a specific event type.
     * @param {string} eventType - The name of the event to listen for.
     * @param {Function} handlerFunction - The callback function to execute when the event is dispatched.
     */
    static addEventHandler(eventType, handlerFunction) {
        if (!ScopeRegistry.#eventHandlers[eventType]) {
            ScopeRegistry.#eventHandlers[eventType] = [];
        }
        ScopeRegistry.#eventHandlers[eventType].push(handlerFunction);
        if (ApplicationSettings.enableVerboseDebugLogging) {
            ScopeRegistry.defineScope('org.app.components').DisplayOutput.outputLog(`Event handler registered for: ${eventType}`);
        }
    }

    /**
     * Dispatches a custom event to all registered handlers for that event type.
     * @param {string} eventType - The type of event to dispatch.
     * @param {object} eventPayload - Data to pass to the event handlers.
     */
    static dispatchGlobalEvent(eventType, eventPayload) {
        if (ScopeRegistry.#eventHandlers[eventType]) {
            if (ApplicationSettings.enableVerboseDebugLogging) {
                ScopeRegistry.defineScope('org.app.components').DisplayOutput.outputLog(`Dispatching event: ${eventType} with payload: ${JSON.stringify(eventPayload)}`);
            }
            ScopeRegistry.#eventHandlers[eventType].forEach(handler => {
                try {
                    handler(eventPayload);
                } catch (e) {
                    console.error(`Error executing handler for event '${eventType}':`, e, 'Payload:', eventPayload);
                    ScopeRegistry.defineScope('org.app.components').DisplayOutput.outputLog(`Internal error in event handler for '${eventType}': ${e.message}`, 'error');
                }
            });
        } else {
             if (ApplicationSettings.enableVerboseDebugLogging) {
                ScopeRegistry.defineScope('org.app.components').DisplayOutput.outputLog(`No handlers registered for event: ${eventType}`, 'warn');
            }
        }
    }

    /**
     * Simulates the content of an external JavaScript module based on its identifier.
     * In a production environment, this would be replaced by actual module loading and parsing.
     * @param {string} moduleKey - The identifier of the module to simulate.
     * @returns {object|Function} The mocked module content (e.g., a class constructor or an object).
     */
    static simulateModuleDefinition(moduleKey) {
        if (moduleKey.includes('GreetingService')) {
            return class GreetingService {
                constructor(targetName = 'World') {
                    ScopeRegistry.defineScope('org.app.components').DisplayOutput.outputLog(`GreetingService initialized for target: ${targetName}`);
                    this.recipient = targetName;
                }
                deliverGreeting() {
                    ScopeRegistry.defineScope('org.app.components').DisplayOutput.outputLog(`Formal greeting delivered to ${this.recipient}.`);
                }
            };
        }
        if (moduleKey.includes('ProfileManager')) {
            return class ProfileManager {
                constructor(personName) {
                    const actualName = personName || ApplicationSettings.defaultProfileName;
                    ScopeRegistry.defineScope('org.app.components').DisplayOutput.outputLog(`ProfileManager created for: ${actualName}`);
                    this.userName = actualName;
                }
                showProfileDetails() {
                    ScopeRegistry.defineScope('org.app.components').DisplayOutput.outputLog(`Current User: ${this.userName}`);
                }
            };
        }
        if (moduleKey.includes('ComponentA')) {
            return class UtilityComponentA {
                constructor() {
                    ScopeRegistry.defineScope('org.app.components').DisplayOutput.outputLog('UtilityComponentA instance successfully constructed.');
                }
            };
        }
        if (moduleKey.includes('ComponentB')) {
            return class UtilityComponentB {
                constructor() {
                    ScopeRegistry.defineScope('org.app.components').DisplayOutput.outputLog('UtilityComponentB instance successfully constructed.');
                }
            };
        }
        // Special handling for the 'utilities' scope which might contain multiple components.
        if (moduleKey === 'org.app.components.utilities') {
            return {
                UtilityComponentA: ScopeRegistry.simulateModuleDefinition('org.app.components.UtilityComponentA'),
                UtilityComponentB: ScopeRegistry.simulateModuleDefinition('org.app.components.UtilityComponentB')
            };
        }
        return {}; // Default for unhandled module keys.
    }
}

/**
 * Helper function to safely retrieve or create a DOM element for output.
 * Ensures the output area exists before attempting to write to it.
 * @param {string} elementId - The ID of the target DOM element.
 * @returns {HTMLElement|null} The DOM element or null if `document` is unavailable.
 */
function getOrCreateOutputElement(elementId) {
    if (typeof document === 'undefined') {
        console.warn('Document object is not available. Output will be console-only.');
        return null;
    }
    let targetNode = document.getElementById(elementId);
    if (!targetNode) {
        // If the element doesn't exist, create it and append to the body.
        console.info(`Output element with ID '${elementId}' not found. Creating a new DIV element.`);
        targetNode = document.createElement('div');
        targetNode.id = elementId;
        Object.assign(targetNode.style, {
            border: '1px solid #ccc',
            padding: '10px',
            margin: '10px',
            height: '200px',
            overflowY: 'auto',
            backgroundColor: '#f9f9f9',
            fontFamily: 'monospace',
            fontSize: '12px'
        });
        document.body.appendChild(targetNode);
    }
    return targetNode;
}

/**
 * Service class for handling all application output and logging.
 * This replaces the simple 'Console' object with a more robust logging system.
 * @class DisplayOutputService
 */
class DisplayOutputService {
    constructor(configuration) {
        this.config = configuration;
        this.outputTargetNode = getOrCreateOutputElement(this.config.outputElementId);
        if (ApplicationSettings.enableVerboseDebugLogging) {
            console.log(`[${new Date().toLocaleTimeString()}] DisplayOutputService initialized for ID: ${this.config.outputElementId}`);
        }
    }

    /**
     * Writes a message to the designated output element and/or browser console.
     * @param {string} messageContent - The text content of the message.
     * @param {string} [logLevel='info'] - The severity level of the log ('info', 'warn', 'error').
     */
    outputLog(messageContent, logLevel = 'info') {
        const currentTime = new Date().toLocaleTimeString();
        const formattedEntry = `[${currentTime}] [${logLevel.toUpperCase()}] ${messageContent}`;

        if (this.outputTargetNode) {
            // Append message to the DOM element.
            this.outputTargetNode.innerHTML += `<div>${formattedEntry}</div>`;
            this.outputTargetNode.scrollTop = this.outputTargetNode.scrollHeight; // Auto-scroll to bottom.
        } else {
            // Fallback to console if no DOM target is available.
            switch (logLevel) {
                case 'warn': console.warn(formattedEntry); break;
                case 'error': console.error(formattedEntry); break;
                default: console.log(formattedEntry); break;
            }
        }
    }
}

// ------------------------------------------------------------------------------------------------
// APPLICATION INITIALIZATION AND USAGE EXAMPLES
// ------------------------------------------------------------------------------------------------

// 1. Establish the root application scope and define the primary output service.
// This combines the initial scope creation with the definition of the Console/Logger.
ScopeRegistry.defineScope('org.app.components', {
    DisplayOutput: new DisplayOutputService(ApplicationSettings)
});

// Retrieve a reference to the main logger for immediate use.
const mainApplicationLogger = ScopeRegistry.retrieveScope('org.app.components').DisplayOutput;
mainApplicationLogger.outputLog('Application core initialized. Logging service is operational.');

// 2. Perform a global import of all core components.
// This is equivalent to Namespace.use('com.sandbox.*');
mainApplicationLogger.outputLog('Attempting to integrate all core components into the global scope...');
ScopeRegistry.integrateIntoGlobal('org.app.components.*', () => {
    // Validate that DisplayOutput is now globally accessible.
    if (typeof DisplayOutput !== 'undefined' && DisplayOutput instanceof DisplayOutputService) {
        DisplayOutput.outputLog('Core components successfully integrated globally. This message is from the global DisplayOutput.');
    } else {
        mainApplicationLogger.outputLog('Warning: Global integration of core components might have failed or DisplayOutput is not globally accessible.', 'warn');
    }
});

// 3. Asynchronously load and instantiate a 'GreetingService' class.
// This is equivalent to Namespace.include('com.sandbox.SayHiClass', function() { new com.sandbox.SayHiClass(); });
const createAndUseGreetingService = () => {
    try {
        const GreetingServiceClass = ScopeRegistry.retrieveScope('org.app.components.GreetingService');
        if (GreetingServiceClass && typeof GreetingServiceClass === 'function') {
            const greetingInstance = new GreetingServiceClass('Valued Customer'); // Custom target
            greetingInstance.deliverGreeting();
        } else {
            mainApplicationLogger.outputLog('Error: GreetingService class not found in scope after loading.', 'error');
        }
    } catch (ex) {
        mainApplicationLogger.outputLog(`Runtime error during GreetingService instantiation: ${ex.message}`, 'error');
    }
};
mainApplicationLogger.outputLog('Requesting asynchronous load of GreetingService module...');
ScopeRegistry.acquireResource('org.app.components.GreetingService', createAndUseGreetingService);

// 4. Load a 'ProfileManager' class and make it globally available, then instantiate it.
// This is equivalent to Namespace.use('com.sandbox.MyNameIsClass', function() { new MyNameIsClass('peter'); });
const initializeUserProfileManager = () => {
    try {
        // Due to `integrateIntoGlobal` for a non-wildcard class, `ProfileManager` should be on `window`.
        if (typeof ProfileManager !== 'undefined' && typeof ProfileManager === 'function') {
            const userProfile = new ProfileManager('Bob Smith'); // Changed name and instance variable.
            userProfile.showProfileDetails();
        } else {
            mainApplicationLogger.outputLog('Error: ProfileManager class not globally available after integration.', 'error');
        }
    } catch (ex) {
        mainApplicationLogger.outputLog(`Critical error instantiating ProfileManager: ${ex.message}`, 'error');
    }
};
mainApplicationLogger.outputLog('Preparing to load and globally integrate ProfileManager...');
ScopeRegistry.integrateIntoGlobal('org.app.components.ProfileManager', initializeUserProfileManager);


// 5. Chained import: Load a 'utilities' module and then integrate its contents.
// This is equivalent to Namespace.from('com.sandbox.classes').use('com.sandbox.classes.*', function() { new MyClass1(); new MyClass2(); });
mainApplicationLogger.outputLog('Initiating chained import for a suite of utility components...');
const handleUtilityComponentsReady = () => {
    const utilitiesScope = ScopeRegistry.retrieveScope('org.app.components.utilities');
    if (utilitiesScope) {
        mainApplicationLogger.outputLog('Utility module loaded successfully. Instantiating nested components...');
        try {
            // Validate and instantiate UtilityComponentA
            if (utilitiesScope.UtilityComponentA && typeof utilitiesScope.UtilityComponentA === 'function') {
                new utilitiesScope.UtilityComponentA();
            } else {
                mainApplicationLogger.outputLog('Warning: UtilityComponentA not found in the utilities scope.', 'warn');
            }
            // Validate and instantiate UtilityComponentB
            if (utilitiesScope.UtilityComponentB && typeof utilitiesScope.UtilityComponentB === 'function') {
                new utilitiesScope.UtilityComponentB();
            } else {
                mainApplicationLogger.outputLog('Warning: UtilityComponentB not found in the utilities scope.', 'warn');
            }
        } catch (ex) {
            mainApplicationLogger.outputLog(`An error occurred while instantiating utility components: ${ex.message}`, 'error');
        }
    } else {
        mainApplicationLogger.outputLog('Error: Utility components scope could not be resolved after chained import.', 'error');
    }
};
ScopeRegistry.fromBaseScope('org.app.components.utilities').thenIntegrate('.*', handleUtilityComponentsReady);


// 6. Register a listener for module loading failures and trigger a test error.
// This is equivalent to Namespace.addEventListener('includeError', function(event) { ... });
ScopeRegistry.addEventHandler(ApplicationSettings.moduleLoadingFailureEvent, (errorData) => {
    // Use the main logger to report the error.
    mainApplicationLogger.outputLog(
        `A critical asset loading issue was detected for '${errorData.resourcePath}'. ` +
        `Reason: ${errorData.message} (Code: ${errorData.reasonCode}, Time: ${errorData.incidentTime})`,
        'error' // Explicitly set log level to error.
    );
    // For deeper debugging, also log to the browser console.
    if (ApplicationSettings.enableVerboseDebugLogging) {
        console.error('Full asset load problem event details:', errorData);
    }
});

// Attempt to load a non-existent resource to trigger the error handler.
// This is equivalent to Namespace.include('com.sandbox.toto');
mainApplicationLogger.outputLog('Attempting to load a non-existent module to test error handling mechanism...');
ScopeRegistry.acquireResource('org.app.components.missingAsset');