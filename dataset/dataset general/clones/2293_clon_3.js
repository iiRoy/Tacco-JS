(function(jQ) {
    /*
     * This immediate function invocation serves as a protective scope,
     * ensuring that the jQuery library's reference, aliased as 'jQ',
     * is used consistently and does not conflict with other libraries
     * that might also utilize the '$' symbol in the global scope.
     */

    // Execute the enclosed logic only after the entire Document Object Model (DOM)
    // has been fully constructed and is ready for manipulation. This prevents
    // attempting to interact with elements that have not yet been rendered.
    jQ(function() {

        // --- Pre-execution Environment Checks ---

        // A foundational check to ensure that the jQuery library is not only present
        // but also fully initialized and its core functionalities (like '.fn') are accessible.
        // Without jQuery, the subsequent operations would fail.
        if (!jQ || typeof jQ.fn === 'undefined' || typeof jQ.fn.configureProportionalSegments === 'undefined' || typeof jQ.fn.distributeSegmentsEvenly === 'undefined') {
            console.error("System Initialization Failure: Required jQuery library or its custom grid plugins ('configureProportionalSegments', 'distributeSegmentsEvenly') are not detected or fully loaded. Aborting layout operations.");
            return; // Terminate execution gracefully if critical components are missing.
        }

        // --- Configuration of Target Elements and Layout Parameters ---

        /*
         * Symbolic constants are employed here to represent the CSS selectors
         * for various grid row elements. This approach enhances code clarity,
         * simplifies future modifications, and reduces the risk of typographical errors.
         */
        const layoutTargetAlpha = '.grid-structure#display-module-a .row-segment';
        const layoutTargetBeta = '.grid-structure#display-module-b .row-segment';
        const layoutTargetGamma = '.grid-structure#display-module-c .row-segment';
        const layoutTargetDelta = '.grid-structure#display-module-d .row-segment';

        /*
         * Defined arrays represent the proportional widths for grid segments
         * that require an asymmetric distribution. These values sum to 12,
         * adhering to a common 12-column grid system design principle.
         */
        const asymmetricProportionsPrimary = [3, 9]; // A typical 1/4 and 3/4 division.
        const asymmetricProportionsComplex = [3, 4, 5]; // A more nuanced three-part division.

        /**
         * A generalized utility function designed to abstract and apply various grid layout configurations.
         * It incorporates robustness checks for element existence and parameter validity.
         * @param {string} selectorString - The CSS selector used to identify target grid row elements.
         * @param {string} layoutMethodKey - A string indicating the desired layout method ("asymmetric" or "uniform").
         * @param {Array<number>} [layoutParams = []] - An optional array of numbers specifying segment widths for asymmetric layouts.
         */
        function applyDynamicGridLayout(selectorString, layoutMethodKey, layoutParams = []) {
            const selectedElements = jQ(selectorString);

            // Pre-check: Verify that the specified selector actually matches one or more elements in the DOM.
            if (selectedElements.length === 0) {
                console.warn(`Grid Layout Warning: No elements were found matching the selector "${selectorString}". Skipping layout application for this target.`);
                return; // Exit if no elements are found to prevent errors on empty jQuery objects.
            }

            console.log(`Initiating ${layoutMethodKey} layout for ${selectedElements.length} element(s) matching "${selectorString}"...`);

            // Conditional execution based on the specified layout method.
            if (layoutMethodKey === "asymmetric") {
                const totalProportionSum = layoutParams.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

                // Validation for asymmetric layouts: Ensure the sum of proportions equals the grid's total columns (12).
                if (totalProportionSum !== 12) {
                    console.error(`Grid Layout Error: Invalid proportion sum for asymmetric layout on "${selectorString}". Expected 12, but received ${totalProportionSum} from [${layoutParams.join(', ')}]. Layout not applied.`);
                    return;
                }
                selectedElements.configureProportionalSegments(...layoutParams);
            } else if (layoutMethodKey === "uniform") {
                selectedElements.distributeSegmentsEvenly();
            } else {
                console.error(`Grid Layout Error: Unrecognized layout method key "${layoutMethodKey}" provided for selector "${selectorString}".`);
                return;
            }
            console.info(`Grid Layout Success: Successfully applied ${layoutMethodKey} layout to elements matching "${selectorString}".`);
        }

        // --- Sequential Application of Grid Layouts ---

        // 1. Configure a row to have two columns with explicitly defined, unequal widths (e.g., a sidebar and main content area).
        applyDynamicGridLayout(layoutTargetAlpha, "asymmetric", asymmetricProportionsPrimary);

        // 2. Distribute columns within a second row uniformly, ensuring each segment occupies an identical portion of the available space.
        applyDynamicGridLayout(layoutTargetBeta, "uniform");

        // 3. Similarly, apply uniform spacing to columns in a third distinct row, demonstrating consistent behavior across different components.
        applyDynamicGridLayout(layoutTargetGamma, "uniform");

        // 4. Implement a more intricate, multi-segment asymmetric layout for a fourth row, showcasing flexible column arrangements.
        applyDynamicGridLayout(layoutTargetDelta, "asymmetric", asymmetricProportionsComplex);

        console.log("All specified grid layout operations have concluded.");

    }); // End of the jQuery DOM ready block.

}(window.jQuery)); // The global jQuery object is passed as an argument, aliased as 'jQ' within this closure.