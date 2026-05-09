!function() {

    // A utility function for deep merging objects, replacing jQuery.extend(true, ...)
    // This is a Type III addition to ensure functionality without external libraries.
    const deepMerge = (target, source) => {
        const output = { ...target }; // Start with a shallow copy of target

        if (target && typeof target === 'object' && source && typeof source === 'object') {
            for (const key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                        // If both are objects, deep merge
                        output[key] = deepMerge(target[key] || {}, source[key]);
                    } else {
                        // Otherwise, overwrite or add
                        output[key] = source[key];
                    }
                }
            }
        }
        return output;
    };

    /**
     * Manages a dynamic user interface panel for configuring various rendering parameters.
     * This class handles UI element creation, state management, and dispatches updates
     * to registered callback functions.
     *
     * @param {HTMLElement} containerElement - The DOM element where the control panel will be rendered.
     * @param {object} initialConfigurationData - An object providing initial settings for the controls.
     * @param {Array<Function>} renderUpdateCallbacks - A list of functions to call when settings change.
     */
    const ControlPanelManager = function(containerElement, initialConfigurationData, renderUpdateCallbacks) {
        // Store references to dynamically created UI elements for easier access and event binding.
        const uiElements = {};

        /**
         * Helper to retrieve the current value or checked state of a UI element.
         * @param {string} elementId - The ID of the element to query.
         * @returns {string|boolean|null} The element's value, checked state, or null if not found.
         */
        const getInputValue = (elementId) => {
            const el = uiElements[elementId];
            if (!el) {
                console.warn(`ControlPanelManager: Element with ID '${elementId}' not found in uiElements map.`);
                return null;
            }
            return el.type === 'checkbox' ? el.checked : el.value;
        };

        /**
         * Helper to set the value or checked state of a UI element.
         * @param {string} elementId - The ID of the element to update.
         * @param {*} val - The value to set.
         */
        const setInputValue = (elementId, val) => {
            const el = uiElements[elementId];
            if (!el) {
                console.warn(`ControlPanelManager: Cannot set value for '${elementId}', element not found.`);
                return;
            }
            if (el.type === 'checkbox') {
                el.checked = !!val; // Ensure it's a boolean
            } else {
                el.value = (val !== undefined && val !== null) ? val : ''; // Set to empty string if undefined/null
            }
        };

        // --- Core functionality: Dispatching current settings ---

        /**
         * Gathers all current settings from the UI and dispatches them to registered callbacks.
         * This function is invoked whenever a control's value changes.
         */
        const dispatchCurrentSettings = () => {
            const settingsSnapshot = {};

            // Gather standard parameters, parsing numerical values explicitly (Type III change)
            settingsSnapshot.activateFeature = getInputValue('activateFeature_ctrl');
            settingsSnapshot.smoothMonotonic = getInputValue('smoothMonotonic_ctrl');
            settingsSnapshot.curveTension = parseFloat(getInputValue('curveTensionSlider_ctrl') || '0.0'); // Default to 0.0 if empty
            settingsSnapshot.numSplinePoints = parseInt(getInputValue('numSplinePtsInput_ctrl') || '20', 10); // Default to 20 if empty

            // Check for and gather advanced/legacy options
            const legacyEnabled = getInputValue('enableLegacyMode_ctrl');
            if (legacyEnabled) {
                let legacyFitDistValue = getInputValue('legacyFitDistance_ctrl');
                // Type III change: explicit handling of empty string for legacyFitDistValue
                if (legacyFitDistValue === '') {
                    legacyFitDistValue = undefined; // Retain original behavior of undefined
                } else {
                    legacyFitDistValue = parseFloat(legacyFitDistValue); // Ensure it's a number
                }

                settingsSnapshot.legacyOptions = {
                    fitAlgorithm: getInputValue('legacyCurveFit_ctrl'),
                    pointDensityFactor: parseInt(getInputValue('legacyPointMultiplier_ctrl') || '20', 10),
                    fitPointProximity: legacyFitDistValue,
                };
            } else {
                // Type III change: explicitly set to null if not enabled, rather than undefined
                settingsSnapshot.legacyOptions = null;
            }

            // Debugging output for current settings (Type III addition)
            console.debug('ControlPanelManager: Dispatching updated settings:', settingsSnapshot);

            // Notify all registered update callbacks
            if (Array.isArray(renderUpdateCallbacks) && renderUpdateCallbacks.length > 0) {
                renderUpdateCallbacks.forEach(callback => {
                    // Type III change: Add a try-catch block for robustness in callbacks
                    try {
                        callback(settingsSnapshot);
                    } catch (error) {
                        console.error('ControlPanelManager: Error in renderUpdateCallback:', error, 'for settings:', settingsSnapshot);
                    }
                });
            } else {
                console.warn('ControlPanelManager: No render update callbacks registered. Settings not applied externally.');
            }
        };

        // --- UI Initialization and Element Creation ---

        /**
         * Creates and appends a single input element with its label to a parent div.
         * This helper function reduces repetition in HTML generation (Type III addition).
         * @param {HTMLElement} parentDiv - The div to append the input to.
         * @param {string} type - Input type (e.g., 'checkbox', 'text', 'range').
         * @param {string} id - Unique ID for the input element.
         * @param {string} labelText - Text for the associated label.
         * @param {object} [attrs={}] - Additional attributes for the input (min, max, step, etc.).
         * @returns {HTMLElement} The created input element.
         */
        const createAndAppendInput = (parentDiv, type, id, labelText, attrs = {}) => {
            const inputWrapper = document.createElement('div');
            inputWrapper.className = 'param-field-wrapper'; // New class for styling (Type III change)
            
            const inputElement = document.createElement('input');
            inputElement.className = 'panel-input-control'; // Renamed class (Type II change)
            inputElement.id = id;
            inputElement.type = type;

            for (const key in attrs) {
                if (Object.prototype.hasOwnProperty.call(attrs, key)) {
                    inputElement.setAttribute(key, attrs[key]);
                }
            }

            const labelElement = document.createElement('label');
            labelElement.setAttribute('for', id);
            labelElement.textContent = labelText;

            // Type III change: Order of label and input depends on type for accessibility/UX
            if (type === 'checkbox') {
                inputWrapper.appendChild(inputElement);
                inputWrapper.appendChild(labelElement);
            } else {
                inputWrapper.appendChild(labelElement);
                inputWrapper.appendChild(inputElement);
            }
            
            parentDiv.appendChild(inputWrapper);
            uiElements[id] = inputElement; // Store reference to the input element
            return inputElement;
        };

        // Create main sections for the control panel (Type III: using direct DOM manipulation)
        const primarySettingsDiv = document.createElement('div');
        primarySettingsDiv.id = 'primarySettingsWrapper'; // Renamed ID (Type II)
        primarySettingsDiv.className = 'control-group-box'; // New class for styling (Type III)
        containerElement.appendChild(primarySettingsDiv);

        const advancedOptionsDiv = document.createElement('div');
        advancedOptionsDiv.id = 'advancedOptionsContainer'; // Renamed ID (Type II)
        advancedOptionsDiv.className = 'control-group-box'; // New class for styling (Type III)
        containerElement.appendChild(advancedOptionsDiv);

        // --- Primary Settings Controls ---
        const activateFeatureCheckbox = createAndAppendInput(primarySettingsDiv, 'checkbox', 'activateFeature_ctrl', 'Activate Plotting');
        const smoothMonotonicCheckbox = createAndAppendInput(primarySettingsDiv, 'checkbox', 'smoothMonotonic_ctrl', 'Enable Monotonic Smoothing');
        const curveTensionSlider = createAndAppendInput(primarySettingsDiv, 'range', 'curveTensionSlider_ctrl', 'Curve Tension (0.0 - 1.0)', { min: '0', max: '1', step: '0.1' });
        const numSplinePtsInput = createAndAppendInput(primarySettingsDiv, 'text', 'numSplinePtsInput_ctrl', 'Number of Spline Points');

        // --- Advanced/Legacy Options Controls ---
        const enableLegacyModeCheckbox = createAndAppendInput(advancedOptionsDiv, 'checkbox', 'enableLegacyMode_ctrl', 'Use Legacy Interpolation Options');
        const legacyCurveFitCheckbox = createAndAppendInput(advancedOptionsDiv, 'checkbox', 'legacyCurveFit_ctrl', 'Legacy Fit Algorithm');
        const legacyPointMultiplierInput = createAndAppendInput(advancedOptionsDiv, 'text', 'legacyPointMultiplier_ctrl', 'Legacy Point Multiplier');
        const legacyFitDistanceInput = createAndAppendInput(advancedOptionsDiv, 'text', 'legacyFitDistance_ctrl', 'Legacy Fit Point Distance');

        // --- Event Handlers (Bound to 'this' scope via closures) ---
        // Type III change: Attaching event listeners directly instead of inline 'onchange' attributes.
        // This improves separation of concerns and makes the code more maintainable.

        /**
         * Helper to programmatically disable the legacy mode checkbox.
         * Used by handlers for standard settings that are exclusive with legacy options.
         */
        const _disableLegacyMode = () => {
            setInputValue('enableLegacyMode_ctrl', false);
        };

        activateFeatureCheckbox.addEventListener('change', dispatchCurrentSettings);
        smoothMonotonicCheckbox.addEventListener('change', () => {
            _disableLegacyMode(); // Monotonic smoothing is exclusive with legacy options
            dispatchCurrentSettings();
        });
        curveTensionSlider.addEventListener('change', () => {
            _disableLegacyMode(); // Tension setting is exclusive with legacy options
            dispatchCurrentSettings();
        });
        numSplinePtsInput.addEventListener('change', () => {
            _disableLegacyMode(); // Spline points setting is exclusive with legacy options
            dispatchCurrentSettings();
        });

        enableLegacyModeCheckbox.addEventListener('change', dispatchCurrentSettings);
        legacyCurveFitCheckbox.addEventListener('change', () => {
            if (getInputValue('enableLegacyMode_ctrl')) { // Only dispatch if legacy mode is active
                dispatchCurrentSettings();
            } else {
                // Type III change: If legacy mode is suddenly disabled, reset this specific control
                setInputValue('legacyCurveFit_ctrl', false);
            }
        });
        legacyPointMultiplierInput.addEventListener('change', () => {
            if (getInputValue('enableLegacyMode_ctrl')) {
                dispatchCurrentSettings();
            } else {
                setInputValue('legacyPointMultiplier_ctrl', ''); // Clear if legacy mode is inactive
            }
        });
        legacyFitDistanceInput.addEventListener('change', () => {
            if (getInputValue('enableLegacyMode_ctrl')) {
                dispatchCurrentSettings();
            } else {
                setInputValue('legacyFitDistance_ctrl', ''); // Clear if legacy mode is inactive
            }
        });


        // --- Initial Configuration Application ---

        /**
         * Applies the initial configuration data to the UI elements.
         * This function ensures the UI reflects the starting state.
         * @param {object} incomingConfig - The configuration object to apply.
         */
        const applyInitialConfiguration = (incomingConfig) => {
            // Baseline default parameters for the panel
            const baselineConfig = {
                activateFeature: false,
                smoothMonotonic: false,
                curveTension: 0.0,
                numSplinePoints: 20,
                legacyOptions: null // Explicitly null for no legacy options (Type III change)
            };

            // Default settings specifically for legacy options
            const defaultLegacyOptions = {
                fitAlgorithm: false,
                pointDensityFactor: 20,
                fitPointProximity: undefined // Use undefined for no default value (Type III change)
            };

            // Type III change: More robust handling of incomingConfig.legacyOptions
            let processedIncomingConfig = { ...incomingConfig }; // Shallow copy to avoid modifying original
            if (Object.prototype.hasOwnProperty.call(processedIncomingConfig, 'legacyOptions')) {
                // If legacyOptions is explicitly true or an empty object, use defaultLegacyOptions
                if (processedIncomingConfig.legacyOptions === true || (typeof processedIncomingConfig.legacyOptions === 'object' && processedIncomingConfig.legacyOptions !== null && Object.keys(processedIncomingConfig.legacyOptions).length === 0)) {
                    processedIncomingConfig.legacyOptions = defaultLegacyOptions;
                } else if (typeof processedIncomingConfig.legacyOptions !== 'object' || processedIncomingConfig.legacyOptions === null) {
                    // If it's not an object or null (but was present), ensure it's null for merging
                    processedIncomingConfig.legacyOptions = null;
                }
            }


            // Deep merge the incoming configuration with the baseline defaults
            const combinedConfiguration = deepMerge(baselineConfig, processedIncomingConfig);

            // Extract values for easier assignment
            const isActivated = combinedConfiguration.activateFeature;
            const useMonotonic = combinedConfiguration.smoothMonotonic;
            const currentTension = combinedConfiguration.curveTension;
            const currentSplinePoints = combinedConfiguration.numSplinePoints;

            const hasLegacyOverride = combinedConfiguration.legacyOptions !== null;
            const legacyFitActive = hasLegacyOverride ? combinedConfiguration.legacyOptions.fitAlgorithm : false;
            const legacyFactor = hasLegacyOverride ? combinedConfiguration.legacyOptions.pointDensityFactor : 20; // Default if not overridden
            const legacyDist = hasLegacyOverride ? combinedConfiguration.legacyOptions.fitPointProximity : undefined;


            // Apply values to UI elements
            setInputValue('activateFeature_ctrl', isActivated);
            setInputValue('enableLegacyMode_ctrl', hasLegacyOverride);
            setInputValue('legacyCurveFit_ctrl', legacyFitActive);
            setInputValue('legacyPointMultiplier_ctrl', legacyFactor);
            setInputValue('legacyFitDistance_ctrl', legacyDist); // Will set empty string if undefined/null
            setInputValue('smoothMonotonic_ctrl', useMonotonic);
            setInputValue('curveTensionSlider_ctrl', currentTension);
            setInputValue('numSplinePtsInput_ctrl', currentSplinePoints);

            // After setting all initial values, dispatch them to ensure initial rendering
            dispatchCurrentSettings();
        };

        // Perform the initial setup when the manager is instantiated
        applyInitialConfiguration(initialConfigurationData);
    };

    // Expose the ControlPanelManager constructor globally (or within the IIFE's 'this' context)
    // Renamed from TestSetup to ControlPanelManager (Type II change)
    this.ControlPanelManager = ControlPanelManager;

}(); // End of IIFE