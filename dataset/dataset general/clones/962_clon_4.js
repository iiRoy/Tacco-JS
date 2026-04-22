(function(displayPort, domRef, noValue) {

    // Utility function to merge configuration objects with precedence:
    // mainConfigObject > supplementaryConfigurations[0] > supplementaryConfigurations[1] > ...
    // A property from a supplementary configuration is only assigned if it's currently `noValue` (undefined)
    // in the preceding configuration.
    const combineConfigurations = (mainConfigObject, ...supplementaryConfigurations) => {
        // Create a shallow copy of the primary configuration to avoid direct mutation
        const resultantConfig = { ...mainConfigObject }; 
        for (const supplement of supplementaryConfigurations) {
            if (supplement) { // Ensure the supplementary configuration is not null/undefined
                for (const propertyKey in supplement) {
                    // Only assign if the property is not yet defined in the resultantConfig
                    if (Object.prototype.hasOwnProperty.call(supplement, propertyKey) && resultantConfig[propertyKey] === noValue) {
                        resultantConfig[propertyKey] = supplement[propertyKey];
                    }
                }
            }
        }
        return resultantConfig;
    };

    // Core configuration values for the grid (equivalent to original 'defaults' object)
    const primaryGridPreferences = {
        spacing: 50,
        strokeWidth: 1,
        lineColor: "#000000",
        labelDisplay: true,
        labelTypography: "10px Verdana"
    };

    /**
     * @class CanvasGridDrawer
     * A class designed to render a grid pattern onto a 2D canvas context.
     * Employs a functional style for coordinate generation and line plotting.
     */
    class CanvasGridDrawer {
        // Static property to hold global override settings (equivalent to original 'Grid.defaults')
        static globalSettingsOverrides = {};

        #activeSettings; // Private instance field to store the merged rendering settings

        constructor(initialSettings = {}) {
            // Merge user-provided settings with global overrides, then with primary preferences.
            // Precedence: initialSettings > globalSettingsOverrides > primaryGridPreferences.
            this.#activeSettings = combineConfigurations(
                initialSettings,
                CanvasGridDrawer.globalSettingsOverrides,
                primaryGridPreferences
            );
        }

        /**
         * Renders the grid onto the specified 2D canvas rendering context.
         * @param {CanvasRenderingContext2D} graphicContext - The 2D rendering context of the target canvas.
         */
        renderDisplay(graphicContext) {
            if (!graphicContext) return;

            graphicContext.save(); // Preserve the current state of the canvas context

            const currentRenderPrefs = this.#activeSettings;

            graphicContext.lineWidth = currentRenderPrefs.strokeWidth;
            graphicContext.strokeStyle = currentRenderPrefs.lineColor;
            graphicContext.font = currentRenderPrefs.labelTypography;

            // Determine the larger of the canvas dimensions to ensure full grid coverage
            const maxExtent = Math.max(graphicContext.canvas.width, graphicContext.canvas.height);
            // Calculate pixel adjustment for crisp 1-pixel lines
            const pixelAdjustment = currentRenderPrefs.strokeWidth === 1 ? 0.5 : 0;

            // Helper function to draw a series of parallel lines (either horizontal or vertical)
            const plotLineSeries = (orientation) => {
                const isHorizontal = orientation === 'horizontal';
                // Determine the length of the line based on canvas dimensions
                const lineLength = isHorizontal ? graphicContext.canvas.width : graphicContext.canvas.height;

                // Generate a sequence of coordinates using a functional array creation method
                Array.from(
                    { length: Math.floor(maxExtent / currentRenderPrefs.spacing) + 1 },
                    (_, index) => index * currentRenderPrefs.spacing
                )
                .forEach(coordinateValue => {
                    const adjustedCoordinate = coordinateValue + pixelAdjustment;
                    graphicContext.beginPath();
                    if (isHorizontal) {
                        graphicContext.moveTo(0, adjustedCoordinate);
                        graphicContext.lineTo(lineLength, adjustedCoordinate);
                    } else { // Vertical lines
                        graphicContext.moveTo(adjustedCoordinate, 0);
                        graphicContext.lineTo(adjustedCoordinate, lineLength);
                    }
                    graphicContext.closePath();
                    graphicContext.stroke();

                    if (currentRenderPrefs.labelDisplay) {
                        // Replicating the original code's specific caption placement logic
                        if (isHorizontal) {
                            graphicContext.fillText(coordinateValue, coordinateValue, 10);
                        } else {
                            graphicContext.fillText(coordinateValue, 0, coordinateValue);
                        }
                    }
                });
            };

            // Draw horizontal and then vertical grid lines
            plotLineSeries('horizontal');
            plotLineSeries('vertical');

            graphicContext.restore(); // Restore the canvas context to its previous state
        }
    }

    // Expose the CanvasGridDrawer class to the global window object
    displayPort.CanvasGridDrawer = CanvasGridDrawer;

})(window, document, undefined);