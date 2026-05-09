const AssetLogger = {
    output: (message, ...args) => {
        if (typeof console !== 'undefined' && console.info) {
            console.info(`[DynamicAssetModule] ${message}`, ...args);
        }
    },
    warn: (message, ...args) => {
        if (typeof console !== 'undefined' && console.warn) {
            console.warn(`[DynamicAssetModule] WARN: ${message}`, ...args);
        }
    },
    error: (message, ...args) => {
        if (typeof console !== 'undefined' && console.error) {
            console.error(`[DynamicAssetModule] ERROR: ${message}`, ...args);
        }
    }
};

const CoreAssetManager = {
    _registeredModules: {},
    _managedComponents: {},

    log: AssetLogger.output,

    fetchDataAttribute: (htmlElement, attributeKey) => {
        // Prioritize data-attributes for configuration
        if (htmlElement && htmlElement.dataset && htmlElement.dataset[attributeKey]) {
            return htmlElement.dataset[attributeKey];
        }
        // Fallback to regular attributes if data-attribute is not found
        return htmlElement.getAttribute(attributeKey);
    },

    registerSystemModule: (moduleIdentifier, initializationRoutine) => {
        if (typeof initializationRoutine === 'function') {
            CoreAssetManager._registeredModules[moduleIdentifier] = initializationRoutine;
            CoreAssetManager.log(`Module '${moduleIdentifier}' registered.`);
        } else {
            AssetLogger.error(`Failed to register module '${moduleIdentifier}': Initialization routine is not a function.`);
        }
    },

    activateSystemModules: (moduleIdentifier, forceReinitialization = false) => {
        const routine = CoreAssetManager._registeredModules[moduleIdentifier];
        if (routine) {
            CoreAssetManager.log(`Activating module: ${moduleIdentifier} (Force Reinit: ${forceReinitialization})`);
            routine(forceReinitialization);
        } else {
            CoreAssetManager.warn(`Module '${moduleIdentifier}' not found for activation.`);
        }
    },

    incorporateComponent: (componentConfiguration) => {
        if (!componentConfiguration || !componentConfiguration.name) {
            AssetLogger.error('Invalid component configuration provided.');
            return;
        }
        CoreAssetManager._managedComponents[componentConfiguration.name] = componentConfiguration;
        if (componentConfiguration.onInit) {
            CoreAssetManager.log(`Initializing component: ${componentConfiguration.name}`);
            componentConfiguration.onInit();
        }
    }
};

// Mock FeatureDetector, analogous to Modernizr.
// In a production setup, this would be a real library or polyfill.
const FeatureDetector = typeof Modernizr !== 'undefined' ? Modernizr : {
    _capabilities: {
        webp: true,
        cssgradients: false,
        flexbox: true
    },
    test: function(featureName) {
        return this._capabilities[featureName] === true;
    },
    addCapability: function(name, value) {
        this._capabilities[name] = value;
    }
};

// Main module logic encapsulated
(() => {
    'use strict';

    // Renamed from 'Images'
    class AdaptiveContentLoader {
        // Constructor, renamed from 'Images($el)'
        constructor(targetDOMElement) {
            CoreAssetManager.log('Constructing Adaptive Content Loader for:', targetDOMElement);

            // Input validation: Ensure a valid jQuery element is provided
            if (!targetDOMElement || !(targetDOMElement instanceof $ || targetDOMElement.jquery)) {
                AssetLogger.error("AdaptiveContentLoader: Invalid targetDOMElement provided. Aborting.");
                return;
            }

            this.targetElement = targetDOMElement; // Renamed from this.$el
            this.displayMethod = ''; // 'image-tag' or 'background-style'
            this.capabilityChecks = null; // Renamed from 'supports'
            this.responsiveQueries = null; // Renamed from 'media'
            this.fallbackAssetURL = ''; // Renamed from 'def'
            this.currentActiveSource = ''; // Renamed from 'current'
            this.validationFunctions = {}; // Renamed from 'checks'

            // Set up the loader based on element attributes
            this.initializeLoaderSettings(); // Renamed from this.setup()

            let resizeDebounceTimer;
            const handleResizing = () => {
                clearTimeout(resizeDebounceTimer);
                resizeDebounceTimer = setTimeout(() => this.evaluateAndRender(), 180); // Debounce resize events
            };

            const triggerEvents = ['load', 'coreAssetManager.refresh'];
            if (this.responsiveQueries) { // Only bind resize if media queries are configured
                triggerEvents.push('resize');
            }

            // Using modern event binding with arrow functions to preserve 'this' context
            window.$ && window.$(window).on(triggerEvents.join(' '), (evt) => {
                if (evt.type === 'resize') {
                    handleResizing();
                } else {
                    this.evaluateAndRender();
                }
            });

            this.targetElement.on('coreAssetManager.reconfigure', () => { // Renamed from 'gumby.initialize'
                CoreAssetManager.log('Reconfiguring Adaptive Content Loader for:', this.targetElement);
                this.initializeLoaderSettings();
                this.evaluateAndRender();
            });

            // Execute initial evaluation immediately
            this.evaluateAndRender();
        }

        // Renamed from Images.prototype.setup
        initializeLoaderSettings() {
            this.displayMethod = this.targetElement.is('img') ? 'image-tag' : 'background-style';

            // Retrieve configuration from data attributes
            this.capabilityChecks = CoreAssetManager.fetchDataAttribute(this.targetElement[0], 'capabilities') || false;
            this.responsiveQueries = CoreAssetManager.fetchDataAttribute(this.targetElement[0], 'queries') || false;
            this.fallbackAssetURL = CoreAssetManager.fetchDataAttribute(this.targetElement[0], 'defaultSrc') || false;

            // Parse attribute strings into structured objects
            if (this.capabilityChecks) {
                this.capabilityChecks = this.parseAssetDefinitionString(this.capabilityChecks);
            }
            if (this.responsiveQueries) {
                this.responsiveQueries = this.parseAssetDefinitionString(this.responsiveQueries);
            }

            // Define the validation functions directly within the class instance
            this.validationFunctions = {
                'capability': (testKey) => {
                    if (typeof FeatureDetector === 'object' && typeof FeatureDetector.test === 'function') {
                        return FeatureDetector.test(testKey);
                    }
                    AssetLogger.warn(`FeatureDetector is unavailable or malformed. Cannot check capability '${testKey}'.`);
                    return false;
                },
                'query': (queryValue) => {
                    // Check for window.matchMedia API availability
                    if (window.matchMedia) {
                        return window.matchMedia(queryValue).matches;
                    }
                    AssetLogger.warn("window.matchMedia is not supported by this browser. Responsive queries will not function.");
                    return false;
                }
            };
        }

        // Renamed from Images.prototype.fire
        evaluateAndRender() {
            let potentialAssetSource = null;

            // Priority 1: Check for feature capabilities
            if (this.capabilityChecks) {
                potentialAssetSource = this.processConditionalDefinitions('capability', this.capabilityChecks);
            }

            // Priority 2: Evaluate responsive media queries
            // Only if no asset was selected by capabilities
            if (!potentialAssetSource && this.responsiveQueries) {
                potentialAssetSource = this.processConditionalDefinitions('query', this.responsiveQueries);
            }

            // Priority 3: Fallback to default asset if no other match
            if (!potentialAssetSource && this.fallbackAssetURL) {
                potentialAssetSource = this.fallbackAssetURL;
            }

            // If no asset was identified, log and exit
            if (!potentialAssetSource) {
                CoreAssetManager.log('No eligible asset source found for element:', this.targetElement);
                return false;
            }

            // Update the element only if the source has genuinely changed
            if (this.currentActiveSource !== potentialAssetSource) {
                this.currentActiveSource = potentialAssetSource;
                this.applyAssetToDOMElement(this.displayMethod, potentialAssetSource);
            } else {
                CoreAssetManager.log('Current asset source is identical. Skipping update for:', this.targetElement);
            }
            return true; // Indicates an attempt to load was made
        }

        // Renamed from Images.prototype.handleTests
        processConditionalDefinitions(definitionType, definitionsArray) {
            let matchedSource = null;

            // Using for...of for cleaner iteration and direct break
            for (const definition of definitionsArray) {
                // Validate definition structure
                if (!definition || typeof definition.condition === 'undefined' || typeof definition.source === 'undefined') {
                    AssetLogger.warn("Skipping malformed asset definition entry:", definition);
                    continue;
                }

                if (this.performValidationCheck(definitionType, definition.condition)) {
                    matchedSource = definition.source;
                    break; // Found the highest priority match, stop searching
                }
            }
            return matchedSource;
        }

        // Renamed from Images.prototype.check
        performValidationCheck(checkCategory, valueToValidate) {
            // Ensure the validation function exists before calling it
            if (typeof this.validationFunctions[checkCategory] === 'function') {
                return this.validationFunctions[checkCategory](valueToValidate);
            }
            AssetLogger.error(`No validation function defined for category '${checkCategory}'.`);
            return false;
        }

        // Renamed from Images.prototype.insertImage
        applyAssetToDOMElement(method, assetUri) {
            // Guard clause: Ensure assetUri is not empty
            if (!assetUri) {
                AssetLogger.warn("Cannot apply asset to element: Provided URI is empty.");
                return;
            }

            // Create a temporary Image object for preloading
            const temporaryImagePreloader = window.$ && window.$('<img>');
            if (!temporaryImagePreloader || temporaryImagePreloader.length === 0) {
                AssetLogger.error("Failed to create temporary image preloader. Applying asset directly.");
                // Fallback: Apply directly without preloading
                if (method === 'image-tag') {
                    this.targetElement.attr('src', assetUri);
                } else {
                    this.targetElement.css('background-image', `url('${assetUri}')`);
                }
                this.targetElement.trigger('coreAssetManager.sourceApplied', [assetUri]);
                return;
            }

            temporaryImagePreloader.on('load', () => {
                if (method === 'image-tag') {
                    this.targetElement.attr('src', assetUri);
                } else {
                    this.targetElement.css('background-image', `url('${assetUri}')`);
                }

                // Trigger a custom event once the asset is loaded and applied
                CoreAssetManager.log('Asset successfully applied and event triggered:', assetUri, this.targetElement);
                this.targetElement.trigger('coreAssetManager.sourceApplied', [assetUri]); // Renamed from 'gumby.onChange'
            }).on('error', () => { // Robust error handling for asset loading
                AssetLogger.error(`Failed to load asset from URI: '${assetUri}' for element:`, this.targetElement);
                // Optionally, apply a placeholder image or remove the attribute here
            }).attr('src', assetUri); // Initiate image loading
        }

        // Renamed from Images.prototype.parseAttr
        parseAssetDefinitionString(rawDefinitionString) {
            const parsedDefinitions = [];
            const definitionParts = rawDefinitionString.split(',');

            if (!definitionParts || definitionParts.length === 0) { // Input validation
                AssetLogger.warn("Empty or invalid raw definition string provided for parsing.");
                return parsedDefinitions;
            }

            for (const part of definitionParts) {
                const subParts = part.split('|');
                if (subParts.length !== 2) {
                    AssetLogger.warn(`Skipping malformed definition part: '${part}'. Expected 'condition|source'.`);
                    continue;
                }

                const conditionValue = this.standardizeMediaQuery(subParts[0].trim());
                const assetSource = subParts[1].trim();

                // Object containing the condition to test and the asset URL
                parsedDefinitions.push({
                    condition: conditionValue,
                    source: assetSource
                });
            }
            return parsedDefinitions;
        }

        // Renamed from Images.prototype.shorthand
        standardizeMediaQuery(inputString) {
            let processedString = inputString.trim();

            // Replace shorthand operators for min/max width
            if (processedString.includes('>') || processedString.includes('<')) {
                processedString = processedString
                                    .replace(/>\s*/g, 'min-width: ')
                                    .replace(/<\s*/g, 'max-width: ');
            }

            // Check if it's a media query (contains width/height/orientation) and not already wrapped
            const isMediaExpression = processedString.includes('width') || processedString.includes('height') || processedString.includes('orientation');
            const isParenthesized = processedString.startsWith('(') && processedString.endsWith(')');

            if (isMediaExpression && !isParenthesized) {
                processedString = `(${processedString})`;
            }

            return processedString;
        }

        // Added a cleanup method for proper resource management
        destroy() {
            // Remove all associated event listeners to prevent memory leaks
            window.$ && window.$(window).off('load coreAssetManager.refresh resize', this.evaluateAndRender);
            this.targetElement.off('coreAssetManager.reconfigure');
            CoreAssetManager.log('AdaptiveContentLoader instance destroyed for element:', this.targetElement);
            // Nullify references to aid garbage collection
            this.targetElement = null;
        }
    }

    // Renamed from Gumby.addInitalisation('images', ...)
    CoreAssetManager.registerSystemModule('adaptive-assets', (shouldReinitializeAll) => {
        // Select elements based on the new data attributes
        const relevantElements = window.$ && window.$('[data-capabilities],[data-queries],[data-default-src]');

        if (!relevantElements || relevantElements.length === 0) {
            CoreAssetManager.log("No elements found requiring adaptive asset management.");
            return;
        }

        relevantElements.each(function() {
            const currentElement = window.$(this);
            const isAlreadyManaged = currentElement.data('isAdaptiveAssetManaged'); // New data key for state

            if (isAlreadyManaged && shouldReinitializeAll) {
                currentElement.trigger('coreAssetManager.reconfigure');
            } else if (!isAlreadyManaged) {
                // Mark element as managed and instantiate the loader
                currentElement.data('isAdaptiveAssetManaged', true);
                new AdaptiveContentLoader(currentElement);
            }
            // If already managed and not forced to reinitialize, do nothing.
        });
    });

    // Renamed from Gumby.UIModule({...})
    CoreAssetManager.incorporateComponent({
        name: 'adaptive-content-component',
        exposedEvents: ['sourceApplied', 'refresh', 'reconfigure'], // Renamed events
        onInit: () => {
            // Trigger the initial setup for all adaptive asset modules
            CoreAssetManager.activateSystemModules('adaptive-assets');
        },
        // Added a shutdown hook for potential global cleanup
        onShutdown: () => {
            CoreAssetManager.log('Adaptive content component is shutting down. Performing cleanup...');
            // In a more complex scenario, this would iterate through all AdaptiveContentLoader instances
            // and call their .destroy() method.
        }
    });

})();