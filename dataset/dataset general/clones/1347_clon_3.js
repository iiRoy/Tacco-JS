((dependentLibrary) => { // Changed to arrow function IIFE, new parameter name

    // Guard clause: Ensure the dependency is available and has the 'fn' property (for plugins)
    if (!dependentLibrary || typeof dependentLibrary.fn === 'undefined') {
        // console.error("Required DOM manipulation library (e.g., jQuery, Zepto) not found. Duration Picker plugin cannot initialize.");
        return; // Terminate execution if dependency is missing
    }

    // --- Plugin Constants and Configuration ---
    const PLUGIN_IDENTIFIER_NAME = 'durationPicker'; // New plugin name
    const INSTANCE_STORAGE_KEY = 'durationPickerInstance'; // Key for storing instance data
    const DATA_API_SELECTOR = `[data-${PLUGIN_IDENTIFIER_NAME}-widget]`; // Selector for auto-initialization
    const PLUGIN_VERSION = '1.1.0-alpha'; // Added version information

    // Default settings for the DurationController instances
    const DEFAULT_CONTROLLER_SETTINGS = {
        // Example placeholders; original had no explicit defaults
        defaultStartTime: '09:00',
        defaultEndTime: '17:00',
        enableValidation: true,
        // ... more potential settings
    };

    // --- Core Component Logic (Equivalent to 'Datepair' constructor) ---
    // Renamed from Datepair to DurationController, using ES6 class syntax
    class DurationController {
        constructor(domElement, initialOptions) {
            this.boundElement = dependentLibrary(domElement); // Store the element reference
            // Deep merge default settings with provided options
            this.currentSettings = dependentLibrary.extend(true, {}, DEFAULT_CONTROLLER_SETTINGS, initialOptions);
            this.isComponentActive = false; // Internal state flag
            this.uniqueId = `dp-${Math.random().toString(36).substr(2, 9)}`; // Generate a unique ID

            // Perform initial setup
            this.initiateComponent();
        }

        // Renamed from implicit _initializeComponent to explicit initiateComponent
        initiateComponent() {
            // console.debug(`[${this.uniqueId}] Initializing DurationController for:`, this.boundElement[0], this.currentSettings);
            this.boundElement.addClass('dp-active-widget').attr('data-dp-id', this.uniqueId);
            this.isComponentActive = true;
            // Add more complex setup logic here if needed (e.g., binding events, creating internal elements)
        }

        // Example method that can be called via string argument from the plugin facade
        getCurrentState() {
            // console.debug(`[${this.uniqueId}] Retrieving current state.`);
            return {
                isActive: this.isComponentActive,
                element: this.boundElement[0],
                settings: dependentLibrary.extend({}, this.currentSettings) // Return a copy of settings
            };
        }

        // Example method for updating settings on an existing instance
        updateSettings(newSettings) {
            // console.debug(`[${this.uniqueId}] Updating settings with:`, newSettings);
            dependentLibrary.extend(true, this.currentSettings, newSettings);
            // Re-apply settings or re-render based on changes if necessary
            return this.currentSettings;
        }

        // Example method to simulate destruction/cleanup of the component
        deactivate() {
            // console.debug(`[${this.uniqueId}] Deactivating component.`);
            this.boundElement.removeClass('dp-active-widget').removeAttr('data-dp-id');
            this.boundElement.removeData(INSTANCE_STORAGE_KEY); // Clean up associated instance data
            this.isComponentActive = false;
            // Unbind events, remove child elements, and perform other cleanup tasks
        }
    }

    // --- Plugin Definition (Equivalent to `$.fn.datepair`) ---
    // Renamed from $.fn.datepair to dependentLibrary.fn.durationPicker
    dependentLibrary.fn[PLUGIN_IDENTIFIER_NAME] = function (configurationPayload) {
        let operationalResult = null; // Renamed from 'out' to 'operationalResult'
        const contextualCollection = this; // Store 'this' for consistent reference and return for chaining

        // Iterate over each selected DOM element in the jQuery/Zepto collection
        contextualCollection.each(function () {
            const currentHostElement = dependentLibrary(this); // Renamed from $this
            let componentInstance = currentHostElement.data(INSTANCE_STORAGE_KEY); // Renamed from data, key changed

            // Determine effective configuration for initialization or update
            const effectiveConfiguration = (typeof configurationPayload === 'object' && configurationPayload !== null)
                                           ? dependentLibrary.extend(true, {}, configurationPayload) // Deep copy input config
                                           : {}; // Fallback for non-object config

            // Check if a component instance already exists for this element
            if (componentInstance === undefined || componentInstance === null) {
                // If no instance, create a new one
                componentInstance = new DurationController(this, effectiveConfiguration);
                currentHostElement.data(INSTANCE_STORAGE_KEY, componentInstance); // Store the new instance on the element
                // console.info(`DurationPicker: New instance created for element:`, this);
            } else {
                // If an instance exists, and configurationPayload is an object, update its settings
                if (typeof configurationPayload === 'object' && configurationPayload !== null) {
                    componentInstance.updateSettings(effectiveConfiguration);
                    // console.info(`DurationPicker: Existing instance updated for element:`, this);
                }
            }

            // Handle method calls if configurationPayload is a string
            if (typeof configurationPayload === 'string') {
                const requestedMethodName = configurationPayload;
                // Guard: Check if the method exists and is a function on the component instance
                if (typeof componentInstance[requestedMethodName] === 'function') {
                    // Call the method, explicitly setting 'this' context to the component instance
                    operationalResult = componentInstance[requestedMethodName].call(componentInstance);
                } else {
                    // console.warn(`DurationPicker: Attempted to call unknown method "${requestedMethodName}" on instance for:`, this);
                }
            }
        });

        // Return the result of a method call (if any) or the original jQuery/Zepto object for chaining
        // Changed `out || this` to a more explicit check and return
        return (operationalResult !== null && operationalResult !== undefined) ? operationalResult : contextualCollection;
    };

    // --- Auto-Initialization via Data API (Equivalent to `Data API` block) ---
    // This block executes automatically when the DOM is ready to find and initialize widgets
    dependentLibrary(document).ready(() => { // Using jQuery's ready function for robustness
        // console.info(`DurationPicker: Scanning for auto-initialization elements (${DATA_API_SELECTOR})...`);
        dependentLibrary(DATA_API_SELECTOR).each(function () {
            const targetElement = dependentLibrary(this); // Renamed from $this

            // Guard: Prevent re-initialization if an instance already exists for this element
            if (!targetElement.data(INSTANCE_STORAGE_KEY)) {
                try {
                    const initialAttributes = targetElement.data(); // Get all data attributes for initial config
                    // Initialize the plugin on the element using its data attributes as options
                    targetElement[PLUGIN_IDENTIFIER_NAME](initialAttributes);
                    // console.debug(`DurationPicker: Successfully auto-initialized for:`, this);
                } catch (error) {
                    // console.error(`DurationPicker: Error during auto-initialization for element:`, this, error);
                }
            } else {
                // console.debug(`DurationPicker: Element already initialized, skipping auto-init for:`, this);
            }
        });
        // console.info(`DurationPicker: Auto-initialization scan complete. Plugin version: ${PLUGIN_VERSION}`);
    });

})(window.jQuery || window.Zepto || {}); // Prefer jQuery, then Zepto, fallback to empty object if neither exists to prevent errors