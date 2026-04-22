/**
 * @file ColorVerificationService.js
 * @description Core service for robust pixel color validation across various configurations.
 * This utility facilitates checking pixel properties against predefined tolerance ranges.
 */

/**
 * @class ColorVerifier
 * @description Constructor for the ColorVerifier service.
 * Initializes the verification system with a set of configurations and a pixel data provider.
 * @param {Array<Object>} verificationSettings - An array of objects, each defining a pixel location and its validation rules.
 * @param {Object} pixelDataProvider - An object that can supply pixel data, typically with a `fetchPixel(x, y)` method.
 */
function ColorVerifier(verificationSettings, pixelDataProvider) {
    // Deep clone the incoming settings to prevent external modifications affecting internal state.
    // Using JSON serialization for basic types; for complex objects, a more sophisticated cloning
    // mechanism (e.g., structuredClone or a custom recursive function) might be preferred.
    this.validationConfigs = JSON.parse(JSON.stringify(verificationSettings));
    this.pixelSource = pixelDataProvider; // The external source for pixel data (e.g., a canvas context wrapper).

    // Array to store the actual pixel data retrieved from `pixelSource` during a verification cycle.
    this.acquiredPixelData = [];

    // Array to store the detailed results of each validation check, indexed by configuration.
    this.detailedResults = [];

    // Begin the initial setup phase, preparing all configurations for verification.
    this.setupVerification();
}

(function() {
    // --- Core Utility Functions ---

    /**
     * @function isWithinRange
     * @description Determines if a numerical value is inclusively bounded by a minimum and maximum.
     * @param {number} inputVal - The value to be checked.
     * @param {number} lowerLimit - The smallest acceptable value.
     * @param {number} upperLimit - The largest acceptable value.
     * @returns {boolean} `true` if `inputVal` is between `lowerLimit` and `upperLimit` (inclusive), otherwise `false`.
     */
    function isWithinRange(inputVal, lowerLimit, upperLimit) {
        // A value is considered in range if it is not less than the lower limit AND not greater than the upper limit.
        return !(inputVal < lowerLimit || inputVal > upperLimit);
    }

    // Export this utility for potential external use or testing purposes.
    ColorVerifier.isWithinRange = isWithinRange;

    // --- Internal Functional Modules ---
    // This object encapsulates various operational methods, allowing for a structured
    // and potentially extensible design before merging into the prototype.
    const operationalModules = {
        coreFunctions: {
            /**
             * @method setupVerification
             * @description Performs initial setup for all validation configurations.
             * This includes calculating absolute tolerance bounds and caching reference pixel data.
             * This method is invoked once when a `ColorVerifier` instance is created.
             * @returns {ColorVerifier} Returns the instance for method chaining.
             */
            setupVerification: function initializeConfigurations() {
                // Validate that `validationConfigs` is indeed an array.
                if (!Array.isArray(this.validationConfigs)) {
                    console.error("ColorVerifier: The initial validation configurations must be an array.");
                    this.validationConfigs = []; // Reset to empty to prevent further errors.
                    return this;
                }

                // Iterate through each configuration object provided.
                for (let configIdx = 0; configIdx < this.validationConfigs.length; configIdx++) {
                    const currentConfig = this.validationConfigs[configIdx];

                    // Basic validation for each individual configuration entry.
                    if (!currentConfig || typeof currentConfig !== 'object') {
                        console.warn(`ColorVerifier: Configuration at index ${configIdx} is invalid or malformed. Skipping.`);
                        this.detailedResults[configIdx] = { status: "error", message: "Invalid configuration object" };
                        continue;
                    }

                    // Ensure `pixelCoords` are defined; default to [0,0] if missing or malformed.
                    currentConfig.pixelCoords = currentConfig.pixelCoords || [0, 0];
                    if (!Array.isArray(currentConfig.pixelCoords) || currentConfig.pixelCoords.length !== 2) {
                        console.warn(`ColorVerifier: 'pixelCoords' for config at index ${configIdx} is invalid. Defaulting to [0,0].`);
                        currentConfig.pixelCoords = [0, 0];
                    }

                    // Fetch the reference pixel if not explicitly provided in the configuration.
                    // This pixel serves as the baseline for calculating absolute tolerance ranges.
                    if (!currentConfig.referenceData) {
                        currentConfig.referenceData = this.pixelSource.px(
                            currentConfig.pixelCoords[0],
                            currentConfig.pixelCoords[1]
                        );
                    }

                    // Process tolerance definitions if they exist for this configuration.
                    if (currentConfig.colorTolerances) {
                        // Initialize a placeholder for results specific to this configuration.
                        this.detailedResults[configIdx] = {};

                        // Iterate over each color component (e.g., 'red', 'green', 'blue', 'alpha', 'hue').
                        for (const componentKey in currentConfig.colorTolerances) {
                            // Ensure we're only processing direct properties, not inherited ones.
                            if (!Object.prototype.hasOwnProperty.call(currentConfig.colorTolerances, componentKey)) {
                                continue;
                            }

                            let componentToleranceValue = currentConfig.colorTolerances[componentKey];

                            // If tolerance is a single number, interpret it as a symmetric range (e.g., `[-val, +val]`).
                            if (typeof componentToleranceValue === "number") {
                                componentToleranceValue = [-componentToleranceValue, componentToleranceValue];
                                // Update the config to store the expanded array format for consistency.
                                currentConfig.colorTolerances[componentKey] = componentToleranceValue;
                            } else if (!Array.isArray(componentToleranceValue) || componentToleranceValue.length !== 2) {
                                console.warn(`ColorVerifier: Invalid tolerance range format for component '${componentKey}' at config index ${configIdx}. Skipping this component.`);
                                continue;
                            }

                            // Retrieve the corresponding value from the reference pixel data.
                            // Some pixel properties might be direct values, others might be getter functions (e.g., HSL components).
                            const referenceComponentVal = typeof currentConfig.referenceData[componentKey] === "function"
                                ? currentConfig.referenceData[componentKey]()
                                : currentConfig.referenceData[componentKey];

                            // Calculate the absolute lower and upper bounds by adding the reference value to the relative tolerances.
                            componentToleranceValue[0] += referenceComponentVal;
                            componentToleranceValue[1] += referenceComponentVal;
                        }
                    }
                }
                return this; // Allow for method chaining.
            },

            /**
             * @method fetchCurrentPixels
             * @description Retrieves the latest pixel data for all configured locations from the `pixelSource`.
             * The fetched data is stored in `this.acquiredPixelData` for subsequent verification.
             */
            fetchCurrentPixels: function acquirePixelData() {
                // Re-initialize the array to ensure fresh data for each verification run.
                this.acquiredPixelData = new Array(this.validationConfigs.length);

                // Loop through each configuration to obtain its current pixel data.
                for (let idx = 0; idx < this.validationConfigs.length; idx++) {
                    const validationEntry = this.validationConfigs[idx];

                    // If a configuration was marked as erroneous during setup, skip fetching its pixel.
                    if (!validationEntry || (this.detailedResults[idx] && this.detailedResults[idx].status === "error")) {
                        this.acquiredPixelData[idx] = null; // Indicate no data was acquired for this entry.
                        continue;
                    }

                    // Use the `pixelSource` to get the pixel at the specified coordinates.
                    this.acquiredPixelData[idx] = this.pixelSource.px(
                        validationEntry.pixelCoords[0],
                        validationEntry.pixelCoords[1]
                    );
                }
            },

            /**
             * @method performValidation
             * @description Executes all defined pixel color validation checks.
             * It first acquires current pixel data and then compares it against the configured tolerances.
             * Detailed outcomes are stored in `this.detailedResults`.
             * @returns {boolean} `true` if all configured checks pass, `false` if any single check fails.
             */
            performValidation: function executeAllChecks() {
                // Step 1: Obtain the most current pixel data for all points of interest.
                this.fetchCurrentPixels();

                let overallVerificationSuccess = true; // Flag to track the aggregated success status.

                // Define a set of color component keys that are typically accessed as functions (e.g., HSL components).
                // This makes the property access logic more explicit and robust than relying on string length.
                const getterMethodComponents = new Set(['hue', 'saturation', 'lightness', 'luminance', 'alpha']);

                // Iterate through configurations in reverse order. This is a stylistic choice and
                // does not significantly impact performance for typical array sizes in modern JS engines.
                for (let currentConfigIndex = this.validationConfigs.length - 1; currentConfigIndex >= 0; currentConfigIndex--) {
                    const currentValidationConfig = this.validationConfigs[currentConfigIndex];
                    const livePixelData = this.acquiredPixelData[currentConfigIndex];
                    let configSpecificResults = this.detailedResults[currentConfigIndex];

                    // If configuration or pixel data is invalid/missing, mark this specific check as a failure.
                    if (!currentValidationConfig || !livePixelData || (configSpecificResults && configSpecificResults.status === "error")) {
                        if (configSpecificResults) {
                            configSpecificResults.overallPassed = false; // Explicitly mark as failed.
                        } else {
                            // If results object wasn't even initialized, create a basic failure record.
                            this.detailedResults[currentConfigIndex] = { overallPassed: false, message: "Configuration or pixel data invalid/missing." };
                        }
                        overallVerificationSuccess = false; // The entire verification process has failed.
                        continue; // Move to the next configuration.
                    }

                    const componentTolerances = currentValidationConfig.colorTolerances;
                    // If no tolerances are defined for this config, it implicitly passes its component checks.
                    if (!componentTolerances) {
                        if (configSpecificResults) {
                            configSpecificResults.overallPassed = true;
                        } else {
                            this.detailedResults[currentConfigIndex] = { overallPassed: true, message: "No tolerances defined, implicitly passed." };
                        }
                        continue;
                    }

                    // Initialize or reset the results for this particular configuration.
                    if (!configSpecificResults) {
                        configSpecificResults = {};
                        this.detailedResults[currentConfigIndex] = configSpecificResults;
                    }
                    configSpecificResults.overallPassed = true; // Assume pass until a component fails.

                    // Evaluate each color component against its specified tolerance range.
                    for (const colorPropertyKey in componentTolerances) {
                        if (!Object.prototype.hasOwnProperty.call(componentTolerances, colorPropertyKey)) {
                            continue; // Skip inherited properties.
                        }
                        const toleranceRange = componentTolerances[colorPropertyKey];

                        // Retrieve the component value from the live pixel data.
                        // Handle cases where component is a direct property vs. a getter function.
                        const actualComponentValue = getterMethodComponents.has(colorPropertyKey)
                            ? (typeof livePixelData[colorPropertyKey] === 'function' ? livePixelData[colorPropertyKey]() : undefined)
                            : livePixelData[colorPropertyKey];

                        // Validate that we actually got a value for the component.
                        if (actualComponentValue === undefined || actualComponentValue === null) {
                            configSpecificResults[colorPropertyKey] = {
                                passed: false,
                                reason: "Component value could not be retrieved or is invalid."
                            };
                            configSpecificResults.overallPassed = false;
                            overallVerificationSuccess = false;
                            continue;
                        }

                        // Perform the actual bounds check using the utility function.
                        const componentCheckPassed = isWithinRange(
                            actualComponentValue,
                            toleranceRange[0],
                            toleranceRange[1]
                        );

                        // Record the detailed outcome for this component.
                        configSpecificResults[colorPropertyKey] = {
                            passed: componentCheckPassed,
                            value: actualComponentValue,
                            expectedRange: toleranceRange
                        };

                        if (!componentCheckPassed) {
                            configSpecificResults.overallPassed = false; // Mark this config as failed.
                            overallVerificationSuccess = false; // Mark the overall verification as failed.
                        }
                    }
                }

                return overallVerificationSuccess; // Return the final aggregate status.
            },
        }
    };

    // --- Prototype Extension Logic ---
    // This section merges the methods defined within `operationalModules` directly onto the
    // `ColorVerifier` prototype. This makes them publicly accessible as instance methods.
    for (const moduleCategory in operationalModules) {
        // Ensure we're only iterating over direct properties of `operationalModules`.
        if (!Object.prototype.hasOwnProperty.call(operationalModules, moduleCategory)) {
            continue;
        }
        const currentCategoryMethods = operationalModules[moduleCategory];
        for (const methodId in currentCategoryMethods) {
            // Ensure we're only iterating over direct properties of the method group.
            if (Object.prototype.hasOwnProperty.call(currentCategoryMethods, methodId)) {
                ColorVerifier.prototype[methodId] = currentCategoryMethods[methodId];
            }
        }
    }
})();