angular.module('progressVisualizerApp', [])
    .directive('dynamicGauge', [function () {

        /**
         * Utility function to retrieve an attribute value from a DOM element,
         * falling back to a specified default if the attribute is not present.
         * @param {HTMLElement} targetElement - The DOM element to query.
         * @param {string} attributeKey - The name of the attribute to look for.
         * @param {string} fallbackValue - The value to return if the attribute is missing.
         * @returns {string} The attribute's value or the provided fallback.
         */
        const retrieveAttributeOrDefault = (targetElement, attributeKey, fallbackValue) => {
            const retrievedValue = targetElement.getAttribute(attributeKey);
            return retrievedValue !== null ? retrievedValue : String(fallbackValue);
        };

        /**
         * The core compilation logic for the `dynamicGauge` directive.
         * It transforms the initial directive host element into a canvas element,
         * extracts all configuration attributes, and sets up the linking functions.
         * @param {angular.JQLite} initialHostElement - The jQLite wrapped element where the directive is declared.
         * @param {angular.IAttributes} hostAttrs - The attributes available on the host element.
         * @returns {object} An object containing the pre-link function.
         */
        const compilerFunction = function (initialHostElement, hostAttrs) {
            // Ensure we are working with a single DOM element.
            if (initialHostElement.length !== 1) {
                console.error("dynamicGauge directive requires exactly one host element to operate.");
                return {}; // Return empty link functions to prevent further errors.
            }

            const originalNode = initialHostElement[0];

            // Extract canvas dimensions and the AngularJS model binding path.
            const canvasWidthString = retrieveAttributeOrDefault(originalNode, 'data-gauge-width', '400');
            const canvasHeightString = retrieveAttributeOrDefault(originalNode, 'data-gauge-height', '400');
            const dataBindingExpression = retrieveAttributeOrDefault(originalNode, 'data-gauge-model', '');

            // Dynamically create the canvas element that will be used for rendering.
            const renderSurface = document.createElement('canvas');
            renderSurface.setAttribute('width', canvasWidthString);
            renderSurface.setAttribute('height', canvasHeightString);
            // Store the model binding expression on the canvas for later retrieval in the link phase.
            renderSurface.setAttribute('data-gauge-data-source', dataBindingExpression);

            // Replace the original directive host element with our newly created canvas.
            originalNode.parentNode.replaceChild(renderSurface, originalNode);

            // Consolidate all display-related configurations into a single object.
            const gaugeSettings = {
                outerRingThickness: Number(retrieveAttributeOrDefault(originalNode, 'data-gauge-outer-ring-thickness', '20')),
                innerRingThickness: Number(retrieveAttributeOrDefault(originalNode, 'data-gauge-inner-ring-thickness', '5')),

                outerRingBgColor: retrieveAttributeOrDefault(originalNode, 'data-gauge-outer-ring-background-color', '#505769'),
                outerRingFgColor: retrieveAttributeOrDefault(originalNode, 'data-gauge-outer-ring-foreground-color', '#12eeb9'),
                innerRingColor: retrieveAttributeOrDefault(originalNode, 'data-gauge-inner-ring-color', '#505769'),
                centerLabelColor: retrieveAttributeOrDefault(originalNode, 'data-gauge-label-color', '#12eeb9'),

                outerRingRadius: Number(retrieveAttributeOrDefault(originalNode, 'data-gauge-outer-ring-radius', '100')),
                innerRingRadius: Number(retrieveAttributeOrDefault(originalNode, 'data-gauge-inner-ring-radius', '70')),

                labelStyle: retrieveAttributeOrDefault(originalNode, 'data-gauge-label-font', '50pt Calibri'),

                canvasDisplayWidth: Number(canvasWidthString),
                canvasDisplayHeight: Number(canvasHeightString)
            };

            // Return an object containing the linking functions.
            return {
                /**
                 * The pre-link function responsible for setting up the data watch and rendering logic.
                 * @param {angular.IScope} directiveScope - The scope associated with this directive instance.
                 */
                pre: function setupGaugeDisplay(directiveScope) {
                    const modelBindingPath = renderSurface.getAttribute('data-gauge-data-source');
                    const renderingContext = renderSurface.getContext('2d');

                    if (!renderingContext) {
                        console.error("Could not obtain 2D rendering context for the canvas element.");
                        return;
                    }

                    /**
                     * Draws or updates the circular progress gauge based on the provided data.
                     * @param {object} currentGaugeData - The data object containing 'label' and 'percentage'.
                     */
                    const updateGaugeVisuals = (currentGaugeData) => {
                        // Basic validation for the data structure.
                        if (!currentGaugeData || typeof currentGaugeData.percentage === 'undefined' || typeof currentGaugeData.label === 'undefined') {
                            console.warn("Gauge data is invalid or incomplete. Skipping render.", currentGaugeData);
                            return;
                        }

                        // Clear the previous content of the canvas.
                        renderingContext.clearRect(0, 0, gaugeSettings.canvasDisplayWidth, gaugeSettings.canvasDisplayHeight);

                        // Determine the center point of the canvas.
                        const primaryCenterX = gaugeSettings.canvasDisplayWidth / 2;
                        const primaryCenterY = gaugeSettings.canvasDisplayHeight / 2;

                        // --- Render the background portion of the outer ring ---
                        renderingContext.beginPath();
                        renderingContext.arc(primaryCenterX, primaryCenterY, gaugeSettings.outerRingRadius, 0, Math.PI * 2, false);
                        renderingContext.lineWidth = gaugeSettings.outerRingThickness;
                        renderingContext.strokeStyle = gaugeSettings.outerRingBgColor;
                        renderingContext.stroke();

                        // --- Render the inner circle (minor ring) ---
                        renderingContext.beginPath();
                        renderingContext.arc(primaryCenterX, primaryCenterY, gaugeSettings.innerRingRadius, 0, Math.PI * 2, false);
                        renderingContext.lineWidth = gaugeSettings.innerRingThickness;
                        renderingContext.strokeStyle = gaugeSettings.innerRingColor;
                        renderingContext.stroke();

                        // --- Render the central text label ---
                        renderingContext.font = gaugeSettings.labelStyle;
                        renderingContext.textAlign = 'center';
                        renderingContext.textBaseline = 'middle';
                        renderingContext.fillStyle = gaugeSettings.centerLabelColor;
                        renderingContext.fillText(currentGaugeData.label, primaryCenterX, primaryCenterY);

                        // --- Render the foreground (progress) portion of the outer ring ---
                        // Angles are in radians. Start at the top (12 o'clock).
                        const startArcAngle = -Math.PI / 2; // -90 degrees
                        // Calculate the end angle based on the percentage progress.
                        const endArcAngle = (Math.PI * 2 * currentGaugeData.percentage) + startArcAngle;
                        const drawCounterClockwise = false; // Draw clockwise

                        renderingContext.beginPath();
                        renderingContext.arc(primaryCenterX, primaryCenterY, gaugeSettings.outerRingRadius, startArcAngle, endArcAngle, drawCounterClockwise);
                        renderingContext.lineWidth = gaugeSettings.outerRingThickness;
                        renderingContext.strokeStyle = gaugeSettings.outerRingFgColor;
                        renderingContext.stroke();
                    };

                    // Set up an AngularJS watch on the model binding path.
                    // The 'true' argument enables deep watching for object properties.
                    directiveScope.$watch(modelBindingPath, (latestModelValue) => {
                        updateGaugeVisuals(latestModelValue);
                    }, true);

                    // Perform an initial render immediately to display the gauge with its starting data.
                    const initialModelData = directiveScope.$eval(modelBindingPath);
                    if (initialModelData) {
                        updateGaugeVisuals(initialModelData);
                    }
                }
                // The post-link function is omitted as it contains no logic, mirroring the original's empty state.
            };
        };

        // Define the directive's configuration object.
        const gaugeDirectiveConfig = {
            compile: compilerFunction, // Use our custom compilation function.
            replace: true // Instruct AngularJS to replace the original element with the compiled output.
        };

        return gaugeDirectiveConfig;
    }]);