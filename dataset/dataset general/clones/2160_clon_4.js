var GlobalNexus = (function() {
    var _vault = {}; // Internal storage for all structured components
    var _eventObservers = new Map(); // Stores event handlers for custom events

    // Helper function to navigate or create nested objects within the vault
    function accessComponentPath(pathSegments, createIfAbsent = true) {
        let currentLevel = _vault;
        for (let i = 0; i < pathSegments.length; i++) {
            const segment = pathSegments[i];
            if (!currentLevel[segment]) {
                if (createIfAbsent) {
                    currentLevel[segment] = {};
                } else {
                    return undefined; // Path segment not found and not creating
                }
            }
            currentLevel = currentLevel[segment];
        }
        return currentLevel;
    }

    // Dispatches custom events to registered observers
    function signalOccurrence(eventName, payload) {
        if (_eventObservers.has(eventName)) {
            _eventObservers.get(eventName).forEach(handler => handler(payload));
        }
    }

    // Handles dynamic script loading
    function acquireScript(componentIdentifier, finalizerCallback) {
        const scriptSourceElement = document.createElement('script');
        // Transforms 'enterprise.utility.MyClass' to 'enterprise/utility/MyClass.js'
        const scriptFileLocation = componentIdentifier.replace(/\./g, '/') + '.js';
        scriptSourceElement.src = scriptFileLocation;

        scriptSourceElement.onload = function() {
            signalOccurrence('scriptLoaded', { identifier: componentIdentifier, location: scriptFileLocation });
            if (finalizerCallback) {
                finalizerCallback();
            }
        };
        scriptSourceElement.onerror = function() {
            signalOccurrence('scriptLoadError', { identifier: componentIdentifier, location: scriptFileLocation });
        };

        document.head.appendChild(scriptSourceElement);
    }

    var publicInterface = {
        // Establishes a hierarchical component structure or merges definitions
        // Equivalent to Namespace() and Namespace(..., { ... })
        establish: function(pathString, definitionBundle = {}) {
            const pathSegments = pathString.split('.');
            const targetContainer = accessComponentPath(pathSegments);
            // Deep merge definitionBundle into targetContainer
            for (const key in definitionBundle) {
                if (Object.prototype.hasOwnProperty.call(definitionBundle, key)) {
                    if (typeof definitionBundle[key] === 'object' && definitionBundle[key] !== null && !Array.isArray(definitionBundle[key]) && typeof targetContainer[key] === 'object' && targetContainer[key] !== null && !Array.isArray(targetContainer[key])) {
                        Object.assign(targetContainer[key], definitionBundle[key]); // Simple merge for nested objects
                    } else {
                        targetContainer[key] = definitionBundle[key];
                    }
                }
            }
            return targetContainer; // Return the created/updated container
        },

        // Makes components available in the global scope, optionally loading a script first
        // Equivalent to Namespace.use()
        integrate: function(pathString, finalizerCallback) {
            let actualPath = pathString;
            let importEverything = false;

            if (pathString.endsWith('.*')) {
                actualPath = pathString.slice(0, -2);
                importEverything = true;
            }

            const processIntegration = () => {
                const pathSegments = actualPath.split('.');
                const sourceComponent = accessComponentPath(pathSegments, false);

                if (!sourceComponent) {
                    // Using console.error for internal logic errors before DisplayLogger is guaranteed
                    console.error('GlobalNexus: Component path not found for integration:', pathString);
                    if (finalizerCallback) finalizerCallback();
                    return;
                }

                if (importEverything) {
                    for (const key in sourceComponent) {
                        if (Object.prototype.hasOwnProperty.call(sourceComponent, key)) {
                            window[key] = sourceComponent[key];
                        }
                    }
                } else {
                    // For single component integration (e.g., 'enterprise.utility.IdentityPresenter')
                    // It means the last part of the path (e.g., 'IdentityPresenter') should be global.
                    window[pathSegments[pathSegments.length - 1]] = sourceComponent;
                }
                if (finalizerCallback) finalizerCallback();
            };

            if (importEverything) {
                // If importing everything, assume scripts are already loaded or don't need loading by 'integrate'
                processIntegration();
            } else {
                // If integrating a single item, first load its script
                acquireScript(actualPath, processIntegration);
            }
        },

        // Loads an external JavaScript file without necessarily integrating its contents globally
        // Equivalent to Namespace.include()
        loadResource: acquireScript,

        // Provides a chainable method to load a base script then integrate its contents
        // Equivalent to Namespace.from().use()
        sourceOrigin: function(baseIdentifier) {
            return {
                integrate: function(integrationIdentifier, finalizerCallback) {
                    // First load the baseIdentifier script
                    acquireScript(baseIdentifier, function() {
                        let actualPath = integrationIdentifier;
                        let importEverything = false;

                        if (integrationIdentifier.endsWith('.*')) {
                            actualPath = integrationIdentifier.slice(0, -2);
                            importEverything = true;
                        }

                        const pathSegments = actualPath.split('.');
                        const sourceComponent = accessComponentPath(pathSegments, false);

                        if (!sourceComponent) {
                            console.error('GlobalNexus: Component path not found after loading base script:', integrationIdentifier);
                            if (finalizerCallback) finalizerCallback();
                            return;
                        }

                        if (importEverything) {
                            for (const key in sourceComponent) {
                                if (Object.prototype.hasOwnProperty.call(sourceComponent, key)) {
                                    window[key] = sourceComponent[key];
                                }
                            }
                        } else {
                            // Integrate a specific named component
                            window[pathSegments[pathSegments.length - 1]] = sourceComponent;
                        }
                        if (finalizerCallback) finalizerCallback();
                    });
                }
            };
        },

        // Registers a handler for a custom event
        // Equivalent to Namespace.addEventListener()
        registerObserver: function(eventName, handler) {
            if (!_eventObservers.has(eventName)) {
                _eventObservers.set(eventName, []);
            }
            _eventObservers.get(eventName).push(handler);
        },

        // Exposes the internal vault for direct FQN access (e.g., for initial logging or non-integrated components)
        _getComponentVault: function() { return _vault; }
    };

    return publicInterface;
})();

// creates an empty component structure
GlobalNexus.establish('enterprise.utility');

// creates or extends a component structure and fills it with specific properties
GlobalNexus.establish('enterprise.utility', {
    DisplayLogger: {
        emitOutput: function(content) {
            var outputElement = document.getElementById('console');
            if (outputElement) {
                outputElement.innerHTML += content + '<br />';
            }
        }
    }
});

// calls DisplayLogger using the fully qualified name (fqn)
GlobalNexus._getComponentVault().enterprise.utility.DisplayLogger.emitOutput('initial message');

// integrates all properties from enterprise.utility into the global space
GlobalNexus.integrate('enterprise.utility.*');
DisplayLogger.emitOutput('aliased message');

// loads enterprise/utility/GreetingAgent.js asynchronously
GlobalNexus.loadResource('enterprise.utility.GreetingAgent', function() {
    // Access GreetingAgent via its FQN from the vault, as it's not integrated globally by loadResource
    const pathSegments = 'enterprise.utility.GreetingAgent'.split('.');
    let currentComponent = GlobalNexus._getComponentVault();
    for (const segment of pathSegments) {
        currentComponent = currentComponent[segment];
    }
    new currentComponent();
});

// automatically loads enterprise/utility/IdentityPresenter.js and integrates IdentityPresenter into the global space
GlobalNexus.integrate('enterprise.utility.IdentityPresenter', function() {
    new IdentityPresenter('charlie');
});

// integrates all properties from enterprise.utility.modules after loading enterprise/utility/modules.js
GlobalNexus.sourceOrigin('enterprise.utility.modules').integrate('enterprise.utility.modules.*', function() {
    new ModuleOne();
    new ModuleTwo();
});

// registers an observer for the scriptLoadError event
GlobalNexus.registerObserver('scriptLoadError', function(occurrence) {
    // Access DisplayLogger via its FQN for consistency, or if it might not be globally integrated yet
    GlobalNexus._getComponentVault().enterprise.utility.DisplayLogger.emitOutput('Failed to load resource: ' + occurrence.identifier);
});

// attempts to load a non-existent file
GlobalNexus.loadResource('enterprise.utility.missingFile');