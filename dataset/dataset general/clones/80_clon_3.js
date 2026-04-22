(function (jq) {
    "use strict";

    // Global configuration object for the byte unit plugin.
    // Currently holds default settings, but can be expanded for future features.
    const pluginConfig = {
        defaultDecimalPlaces: 2, // Default number of decimal places for formatted byte values.
        // Add more plugin-wide settings here if needed.
    };

    // Constants for byte conversion and unit suffixes.
    const KIBI_FACTOR = 1024; // Kilobyte equivalent (base 2)
    const UNIT_LABELS = [" B", " KiB", " MiB", " GiB", " TiB", " PiB", " EiB", " ZiB", " YiB"];
    const DEFAULT_FORMAT_PRECISION = 2; // Fallback decimal precision.

    /**
     * Aligns a numeric value downwards to the nearest multiple of a specified base.
     * Useful for ensuring tick marks start at "round" values.
     * @param {number} rawValue - The input number to align.
     * @param {number} alignmentBase - The base multiple to align to.
     * @returns {number} The aligned value. Returns 0 or NaN for invalid inputs.
     */
    function adjustToLowerMultiple(rawValue, alignmentBase) {
        // Basic input validation to prevent errors.
        if (typeof rawValue !== 'number' || typeof alignmentBase !== 'number' || alignmentBase === 0) {
            console.warn("Invalid input to adjustToLowerMultiple: rawValue=", rawValue, "alignmentBase=", alignmentBase);
            return 0; // Or throw an error, depending on desired robustness.
        }
        return alignmentBase * Math.floor(rawValue / alignmentBase);
    }

    /**
     * The main setup function for the Flot byte unit plugin.
     * This function is registered with Flot and called upon plugin initialization.
     * @param {object} chartInstance - The Flot plot object.
     */
    function initializeByteUnitPlugin(chartInstance) {
        // Register a hook to process data points, allowing modification of axis behavior.
        // This hook runs after data processing but before rendering.
        chartInstance.hooks.processDatapoints.push(function (currentChartRef) {
            // Iterate through all axes present in the current plot.
            jq.each(currentChartRef.getAxes(), function (axisIdentifier, activeAxis) {
                const axisOptions = activeAxis.options;

                // Check if the axis is configured for byte or byteRate display.
                // Guard clause to exit early if not applicable.
                if (!axisOptions || (axisOptions.unitDisplayMode !== "byte" && axisOptions.unitDisplayMode !== "byteRate")) {
                    return; // Skip this axis if it's not a byte-related mode.
                }

                // Assign a custom tick generator function for byte-based axes.
                activeAxis.byteTickGenerator = function (axisContext) {
                    let generatedTickValues = []; // Array to hold the computed tick positions.
                    let candidateInterval = 2;    // Starting candidate for tick interval (powers of 2).
                    let currentDataSpan = axisContext.delta; // The total range of values on the axis.
                    let kibiPowerLevel = 0;       // Tracks the power of KIBI_FACTOR (1024^n).

                    // Set a flag on the axis context if rate display is required (e.g., "/s").
                    axisContext.showRateSuffix = (axisOptions.unitDisplayMode === "byteRate");

                    // Determine the number of decimal places for formatting.
                    // Prioritize user-defined value, otherwise use the plugin default.
                    activeAxis.formatDecimalPrecision = typeof axisOptions.decimalDigits === "number"
                                                     ? axisOptions.decimalDigits
                                                     : DEFAULT_FORMAT_PRECISION;

                    // Scale down the data span by KIBI_FACTOR until it's below one KIBI_FACTOR unit.
                    // This determines the appropriate unit level (KiB, MiB, etc.).
                    while (Math.abs(currentDataSpan) >= KIBI_FACTOR && kibiPowerLevel < UNIT_LABELS.length - 1) {
                        kibiPowerLevel++;
                        currentDataSpan /= KIBI_FACTOR;
                    }

                    // Find a suitable tick interval (e.g., 2, 4, 8, ..., 1024)
                    // based on the scaled data span.
                    while (candidateInterval <= KIBI_FACTOR) {
                        if (currentDataSpan <= candidateInterval) {
                            break; // Found an optimal interval.
                        }
                        candidateInterval *= 2; // Double the interval candidate.
                    }

                    // Calculate the final tick size, incorporating the Kibi-power level.
                    let effectiveTickInterval = candidateInterval * Math.pow(KIBI_FACTOR, kibiPowerLevel);

                    // Apply any minimum tick size constraint specified in options.
                    if (typeof axisOptions.minimumTickInterval !== "undefined" && effectiveTickInterval < axisOptions.minimumTickInterval) {
                        activeAxis.tickSize = axisOptions.minimumTickInterval;
                    } else {
                        activeAxis.tickSize = effectiveTickInterval;
                    }

                    // Generate the actual tick values.
                    // Start from a value aligned to the lower multiple of the calculated tick size.
                    let firstTickCandidate = adjustToLowerMultiple(axisContext.min, activeAxis.tickSize);
                    let currentTickValue;
                    let tickGenerationCounter = 0; // Counter for generated ticks.

                    // Loop to generate ticks until the axis maximum is reached or exceeded.
                    // Includes a safety break to prevent infinite loops.
                    const MAX_TICK_GENERATIONS = 2000; // Arbitrary safety limit.
                    while (true) {
                        currentTickValue = firstTickCandidate + (tickGenerationCounter++) * activeAxis.tickSize;
                        generatedTickValues.push(currentTickValue);

                        // Break condition: if current tick exceeds axis max or safety limit reached.
                        if (currentTickValue >= axisContext.max || tickGenerationCounter > MAX_TICK_GENERATIONS) {
                            break;
                        }
                    }

                    return generatedTickValues;
                };

                // Assign a custom tick formatter function for byte-based axes.
                activeAxis.byteUnitFormatter = function (numericValue, axisConfigRef) {
                    let unitPostfix = "";
                    let currentKibiPower = 0; // Tracks the unit level (B, KiB, MiB, etc.).

                    // Scale down the numeric value to the appropriate Kibi-unit.
                    // Prevent exceeding the available unit labels.
                    while (Math.abs(numericValue) >= KIBI_FACTOR && currentKibiPower < UNIT_LABELS.length - 1) {
                        currentKibiPower++;
                        numericValue /= KIBI_FACTOR;
                    }

                    // Retrieve the corresponding unit suffix from the predefined array.
                    unitPostfix = UNIT_LABELS[currentKibiPower];

                    // Append "/s" if the axis is configured to show a rate.
                    if (axisConfigRef.showRateSuffix) {
                        unitPostfix += "/s";
                    }

                    // Format the number to the specified decimal precision and append the unit string.
                    return numericValue.toFixed(axisConfigRef.formatDecimalPrecision) + unitPostfix;
                };
            });
        });
    }

    // Register the plugin with Flot's plugin system.
    // This makes the plugin available to be used in plots.
    jq.plot.plugins.push({
        pluginInitializer: initializeByteUnitPlugin, // The function Flot calls to set up the plugin.
        pluginConfiguration: pluginConfig,         // Reference to the plugin's global configuration.
        moduleIdentifier: "byteUnitFlot",          // A unique string identifier for this plugin.
        releaseVersion: "1.0.1"                    // Version of this plugin.
    });

})(window.jQuery); // Pass the global jQuery object into the anonymous function.