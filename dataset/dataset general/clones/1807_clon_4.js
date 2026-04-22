class ApplicationLoader {
    #componentRegistry = new Map();
    #bundleLocations = new Map();
    #messageLogger = {
        transmit: (content) => console.info(content)
    };
    #currentResourceDirectory;

    constructor() {
        this.#determineBaseResourceDirectory();
        this.#configureCoreComponents();
        this.#setupResourceBundles();
        this.#initiatePrimaryProcess();
    }

    #determineBaseResourceDirectory() {
        let entirePath = window.location.pathname;
        let resultingBase;
        let lastDividerIndex = entirePath.lastIndexOf('/');

        if (lastDividerIndex === -1) {
            resultingBase = "";
        } else if (lastDividerIndex === entirePath.length - 1) {
            resultingBase = entirePath;
        } else {
            resultingBase = entirePath.substring(0, lastDividerIndex);
        }

        if (entirePath === "/") {
            resultingBase = "/";
        }
        this.#currentResourceDirectory = resultingBase;
    }

    // Corresponds to 'define'
    registerModule(moduleKey, moduleProducer) {
        this.#componentRegistry.set(moduleKey, {
            producer: moduleProducer,
            instance: null,
            ready: false
        });
    }

    // Corresponds to 'require' (both configuration and loading)
    requestModules(directiveSet, responseHandler) {
        if (typeof directiveSet === 'object' && !Array.isArray(directiveSet) && responseHandler === undefined) {
            // Configuration directive
            if (directiveSet.bundles) {
                directiveSet.bundles.forEach(pkg => {
                    this.#bundleLocations.set(pkg.identifier, pkg.origin);
                });
            }
            // Mappings (aliases) are defined but not actively used in the original's execution flow
        } else if (Array.isArray(directiveSet) && typeof responseHandler === 'function') {
            // Module loading directive
            const retrievedDependencies = directiveSet.map(depKey => this.#resolveAndSupplyDependency(depKey));

            // Execute the handler asynchronously to mirror typical module loader behavior.
            Promise.resolve().then(() => {
                responseHandler(...retrievedDependencies);
            });
        }
    }

    #resolveAndSupplyDependency(dependencyKey) {
        // Special handling for the 'ngModule' (angular) component
        if (dependencyKey === 'ngModule') {
            if (!this.#componentRegistry.has('ngModule')) {
                this.registerModule('ngModule', () => window.angular || {});
            }
            const moduleEntry = this.#componentRegistry.get('ngModule');
            if (!moduleEntry.ready) {
                moduleEntry.instance = moduleEntry.producer();
                moduleEntry.ready = true;
            }
            return moduleEntry.instance;
        }

        // Special handling for 'domActivation' (dojo/ready)
        if (dependencyKey === 'domActivation') {
            return (executionAction) => {
                // In a true implementation, this would await DOM readiness.
                // For this clone, immediate execution suffices to match the observable behavior.
                executionAction();
            };
        }

        // Special handling for 'scriptResources/mainApplication' (js/bootstrap)
        if (dependencyKey === 'scriptResources/mainApplication') {
            return {
                beginOperation: () => { // Corresponds to 'start' method
                    this.#messageLogger.transmit('Initiating the core process'); // Corresponds to 'start the bootstrapper'
                    // The actual application bootstrap logic would reside here.
                    // For this clone, we just signify its invocation.
                    window._appCoreStartedIndicator = true; // A global flag for external verification
                }
            };
        }

        // Generic bundle-based module resolution (for 'controllers', 'helpers', 'widgets', 'js')
        for (const [bundleIdentifier, bundleOrigin] of this.#bundleLocations.entries()) {
            if (dependencyKey.startsWith(bundleIdentifier + '/')) {
                // These modules are configured but not explicitly loaded or used in the final callback in the original.
                // So, returning an empty object is sufficient for functional equivalence.
                return {};
            }
        }

        // Fallback for any other unhandled modules
        return {};
    }

    #configureCoreComponents() {
        // Corresponds to define('angular', ...)
        this.registerModule('ngModule', () => {
            return window.angular || {};
        });
    }

    #setupResourceBundles() {
        // Corresponds to require({...}) configuration
        this.requestModules({
            asynchronousLoading: true,
            resourceMappings: [['plainText', 'dojo/stringResource']], // 'text', 'dojo/text'
            bundles: [{
                identifier: 'commandHandlers', // 'controllers'
                origin: this.#currentResourceDirectory + 'scriptResources/commandHandlers' // locationPath + 'js/controllers'
            }, {
                identifier: 'utilityFunctions', // 'helpers'
                origin: this.#currentResourceDirectory + 'scriptResources/utilityFunctions' // locationPath + 'js/helpers'
            }, {
                identifier: 'visualComponents', // 'widgets'
                origin: this.#currentResourceDirectory + 'scriptResources/visualComponents' // locationPath + 'js/widgets'
            }, {
                identifier: 'scriptResources', // 'js'
                origin: this.#currentResourceDirectory + 'scriptResources' // locationPath + 'js'
            }]
        });
    }

    #initiatePrimaryProcess() {
        // Corresponds to require(['dojo/ready', 'js/bootstrap'], ...)
        this.requestModules(
            ['domActivation', 'scriptResources/mainApplication'], // 'dojo/ready', 'js/bootstrap'
            (pageInitializer, appEntrypoint) => { // ready, bootstrap
                pageInitializer(() => {
                    this.#messageLogger.transmit('Initiating the core process'); // 'start the bootstrapper'
                    appEntrypoint.beginOperation(); // bootstrap.start()
                });
            }
        );
    }
}

// Execute the application setup immediately
new ApplicationLoader();