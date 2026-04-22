(function(globalScope){
    "use strict";

    // Retrieve the core visualization engine and its utility toolbox from the global context.
    const VisualizerEngine = globalScope.Chart;
    const commonUtils = VisualizerEngine.helpers;

    /**
     * @constant {object} initialColumnChartOptions - Default configuration parameters for the column chart component.
     */
    const initialColumnChartOptions = {
        // Boolean: Determines if the primary Y-axis should always originate from zero.
        axisStartFromZero : true,

        // Boolean: Controls the visibility of grid lines drawn across the chart's plotting area.
        showGridLines : true,

        // String: Specifies the color for all grid lines, using RGBA format.
        gridLineColor : "rgba(0,0,0,0.06)", // Slightly adjusted transparency

        // Number: Defines the pixel thickness of the grid lines.
        gridLineWidthPx : 1.5, // Changed to a floating-point value

        // Boolean: Governs whether horizontal grid lines (excluding the X-axis) are rendered.
        displayHorizontalGridLines: true,

        // Boolean: Governs whether vertical grid lines (excluding the Y-axis) are rendered.
        displayVerticalGridLines: true,

        // Boolean: Indicates if each individual column element should be rendered with an outline stroke.
        elementOutlineVisible : true,

        // Number: Sets the pixel width of the outline stroke for column elements.
        elementOutlineThickness : 2,

        // Number: Defines the spacing in pixels between distinct groups of columns (categories) along the X-axis.
        categoryGroupSpacing : 6, // Modified value for visual distinction

        // Number: Defines the spacing in pixels between individual column elements belonging to different data series within the same category.
        subGroupSpacing : 1,

        // String: An HTML template used for generating the chart's legend.
        legendMarkupTemplate : "<ul class=\"<%=componentName.toLowerCase()%>-legend-items\"><% for (let i=0; i < dataCollections.length; i++){%><li><span style=\"background-color:<%=dataCollections[i].fillColor%>\"></span><%if(dataCollections[i].label){%><%=dataCollections[i].label%><%}%></li><%}%></ul>"
    };


    VisualizerEngine.Type.extend({
        componentName: "ColumnChart",
        defaultConfiguration : initialColumnChartOptions,

        /**
         * Initializes the column chart component, processing input data and setting up its structure.
         * @param {object} inputChartData - The comprehensive data object provided to the chart.
         */
        initComponent: function(inputChartData){
            // Guard clause: Validate the incoming data structure to prevent errors.
            if (!inputChartData || !inputChartData.datasets || !Array.isArray(inputChartData.datasets)) {
                console.warn("ColumnChart initialization: Invalid or missing data collections. Chart may not render correctly.");
                this.dataSeries = []; // Initialize an empty array to avoid further errors.
                return; // Terminate initialization early.
            }

            // Create a local reference to the component's options for easier access and clarity.
            const componentOptions = this.options;

            // Define a specialized Axis Component tailored for column charts.
            this.AxisComponent = VisualizerEngine.Scale.extend({
                // Grid lines for column charts are often shifted to align with category centers.
                shiftGridLines : true,

                /**
                 * Computes the precise X-coordinate for the center of a specific column element.
                 * @param {number} seriesCount - The total number of data series displayed.
                 * @param {number} seriesIdx - The zero-based index of the current data series.
                 * @param {number} itemIdx - The zero-based index of the column element within its series.
                 * @returns {number} The calculated X-coordinate for the column's center.
                 */
                determineBarPositionX : function(seriesCount, seriesIdx, itemIdx){
                    const baseSegmentWidth = this.computeBaseSegmentWidth();
                    const segmentStartCoord = this.calculateX(itemIdx) - (baseSegmentWidth / 2);
                    const itemWidth = this.computeItemWidth(seriesCount);

                    // Calculate the offset for this specific series within its category.
                    const seriesOffset = (itemWidth * seriesIdx) + (seriesIdx * componentOptions.subGroupSpacing);
                    return segmentStartCoord + seriesOffset + (itemWidth / 2);
                },

                /**
                 * Determines the total available width for all column elements within a single category.
                 * @returns {number} The calculated base width.
                 */
                computeBaseSegmentWidth : function(){
                    // The width is derived from the spacing between X-axis labels, adjusted by category spacing.
                    const rawSegmentWidth = this.calculateX(1) - this.calculateX(0);
                    const adjustedSegmentWidth = rawSegmentWidth - (componentOptions.categoryGroupSpacing * 2);
                    return adjustedSegmentWidth;
                },

                /**
                 * Calculates the individual width of a single column element.
                 * @param {number} seriesCount - The total number of data series.
                 * @returns {number} The computed width of one column.
                 */
                computeItemWidth : function(seriesCount){
                    let effectiveWidth = this.computeBaseSegmentWidth();
                    // Subtract spacing only if there's more than one series.
                    if (seriesCount > 1) {
                         effectiveWidth -= ((seriesCount - 1) * componentOptions.subGroupSpacing);
                    }
                    return (effectiveWidth / seriesCount);
                }
            });

            this.dataSeries = []; // Initialize an array to store processed data collections for rendering.

            // Set up event listeners for tooltip interactions if enabled in the chart's options.
            if (componentOptions.displayTooltips){
                commonUtils.attachEventHandlers(this, componentOptions.tooltipEvents, (interactionEvent) => {
                    // Identify elements under the mouse, or clear active elements on mouseout.
                    const activeElementsAtEvent = (interactionEvent.type !== 'mouseout') ? this.findElementsAtEventLocation(interactionEvent) : [];

                    // Reset the visual state of all previously highlighted elements.
                    this.iterateThroughElements((element) => {
                        element.resetProperties(['fillColor', 'strokeColor']);
                    });

                    // Apply highlight styles to the currently active elements.
                    commonUtils.forEachItem(activeElementsAtEvent, (activeElement) => {
                        activeElement.fillColor = activeElement.hoverFillColor;
                        activeElement.strokeColor = activeElement.hoverOutlineColor;
                    });
                    this.displayTooltip(activeElementsAtEvent);
                });
            }

            // Define the prototype for individual column elements, extending a basic rectangle shape.
            this.ColumnElement = VisualizerEngine.Rectangle.extend({
                outlineWidth : componentOptions.elementOutlineThickness,
                outlineVisible : componentOptions.elementOutlineVisible,
                drawingContext : this.chart.ctx,

                /**
                 * Determines if the column element holds a valid, drawable numeric value.
                 * @returns {boolean} True if the dataValue is a finite number, false otherwise.
                 */
                hasValidValue: function() {
                    return typeof this.dataValue === 'number' && isFinite(this.dataValue);
                }
            });

            // Iterate through each dataset from the input and transform it into internal data series.
            commonUtils.forEachItem(inputChartData.datasets, (dataCollection, collectionIdx) => {
                const collectionEntry = {
                    label : dataCollection.label || `Series ${collectionIdx + 1}`, // Assign a default label if none provided.
                    fillColor : dataCollection.fillColor,
                    strokeColor : dataCollection.strokeColor,
                    elements : [] // This array will hold the ColumnElement instances.
                };

                this.dataSeries.push(collectionEntry);

                // For each data point in the current collection, create and configure a ColumnElement.
                commonUtils.forEachItem(dataCollection.data, (dataPointValue, itemIndex) => {
                    collectionEntry.elements.push(new this.ColumnElement({
                        dataValue : dataPointValue,
                        itemLabel : inputChartData.labels[itemIndex],
                        collectionLabel: dataCollection.label,
                        outlineColor : dataCollection.strokeColor,
                        fillColor : dataCollection.fillColor,
                        hoverFillColor : dataCollection.highlightFill || dataCollection.fillColor,
                        hoverOutlineColor : dataCollection.highlightStroke || dataCollection.strokeColor
                    }));
                }, this); // Maintain the correct 'this' context for the callback.
            }, this);

            // Set up the chart's primary axis using the provided category labels.
            this.constructAxis(inputChartData.labels);

            // Establish the common base Y-coordinate for all column elements.
            this.ColumnElement.prototype.baseValueLocation = this.axis.finalPoint;

            // Calculate and set initial positions and dimensions for all column elements.
            const totalSeries = this.dataSeries.length;
            this.iterateThroughElements((element, itemIdx, collectionIdx) => {
                commonUtils.assignProperties(element, {
                    elementWidth : this.axis.computeItemWidth(totalSeries),
                    coordX: this.axis.determineBarPositionX(totalSeries, collectionIdx, itemIdx),
                    coordY: this.axis.finalPoint // Initial Y-position at the baseline.
                });
                element.storeState(); // Save the initial state for animation transitions.
            }, this);

            // Perform the initial rendering of the chart.
            this.drawComponent();
        },

        /**
         * Refreshes the chart's display, typically invoked after data modifications or configuration changes.
         */
        refreshComponent : function(){
            this.axis.recalculate(); // Update the axis scale based on current data and dimensions.

            // Reset any active (highlighted) elements to their default visual state.
            commonUtils.forEachItem(this.activeElements || [], (activeItem) => { // Defensive check for activeElements existence.
                activeItem.resetProperties(['fillColor', 'strokeColor']);
            });

            // Save the current state of all column elements before potential updates.
            this.iterateThroughElements((element) => {
                element.storeState();
            });
            this.drawComponent(); // Re-render the entire chart.
        },

        /**
         * Provides a standardized way to iterate over all column elements across all data series.
         * @param {function(object, number, number)} processElement - A callback function to be executed for each element.
         *   It receives (element, elementIndex, seriesIndex) as arguments.
         */
        iterateThroughElements : function(processElement){
            commonUtils.forEachItem(this.dataSeries, (collection, collectionIdx) => {
                commonUtils.forEachItem(collection.elements, processElement, this, collectionIdx);
            }, this);
        },

        /**
         * Locates and returns a list of column elements that intersect with a given event's coordinates.
         * @param {object} eventObject - The DOM event object (e.g., mouse event).
         * @returns {Array<object>} An array containing all column elements found at the event location.
         */
        findElementsAtEventLocation : function(eventObject){
            const foundElementsList = [];
            const relativeMousePos = commonUtils.getRelativePosition(eventObject);

            let elementIdxInCurrentCollection; // Declare outside for scope.

            // Inner helper to add elements to the list, maintaining context.
            const collectionProcessor = function(collection){
                // Ensure the element at the identified index exists before pushing.
                if (collection.elements[elementIdxInCurrentCollection]) {
                    foundElementsList.push(collection.elements[elementIdxInCurrentCollection]);
                }
            };

            // Loop through data series and their elements to check for coordinate intersection.
            let collectionIdx = 0;
            while (collectionIdx < this.dataSeries.length) {
                elementIdxInCurrentCollection = 0; // Reset for each new collection.
                const currentCollection = this.dataSeries[collectionIdx];

                while (elementIdxInCurrentCollection < currentCollection.elements.length) {
                    const currentElement = currentCollection.elements[elementIdxInCurrentCollection];

                    // Check if the current element's bounding box contains the mouse coordinates.
                    if (currentElement.isWithinBounds(relativeMousePos.x, relativeMousePos.y)){
                        // If a match is found, gather all corresponding elements across all series for this category index.
                        commonUtils.forEachItem(this.dataSeries, collectionProcessor);
                        return foundElementsList; // Return the list immediately upon finding the first match.
                    }
                    elementIdxInCurrentCollection++;
                }
                collectionIdx++;
            }

            return foundElementsList; // Return an empty array if no elements were found.
        },

        /**
         * Configures and builds the chart's primary axis (scale) based on data and options.
         * @param {Array<string>} categoryLabels - An array of labels for the X-axis categories.
         */
        constructAxis : function(categoryLabels){
            const componentInstance = this; // Capture 'this' for use in nested functions.

            // Helper function to extract all numeric data values for axis range calculation.
            const getAllDataValues = function(){
                const allValues = [];
                componentInstance.iterateThroughElements((element) => {
                    if (element.hasValidValue()) { // Only include valid numbers for scale determination.
                        allValues.push(element.dataValue);
                    }
                });
                return allValues;
            };

            // Assemble the configuration object for the axis component.
            const axisSetup = {
                labelFormatString : this.options.scaleLabel,
                chartHeight : this.chart.height,
                chartWidth : this.chart.width,
                drawContext : this.chart.ctx,
                labelColor : this.options.scaleFontColor,
                labelSize : this.options.scaleFontSize,
                labelStyle : this.options.scaleFontStyle,
                labelFamily : this.options.scaleFontFamily,
                categoryCount : categoryLabels.length,
                startFromZero : this.options.axisStartFromZero, // Use renamed option.
                onlyIntegers : this.options.scaleIntegersOnly,
                /**
                 * Calculates the appropriate Y-axis range based on the chart's data.
                 * @param {number} currentDrawingHeight - The available vertical space for the chart.
                 */
                computeYRange: function(currentDrawingHeight){
                    const recalculatedRanges = commonUtils.determineAxisRange(
                        getAllDataValues(),
                        currentDrawingHeight,
                        this.labelSize,
                        this.startFromZero,
                        this.onlyIntegers
                    );
                    commonUtils.assignProperties(this, recalculatedRanges);
                },
                categoryLabels : categoryLabels,
                fontSpec : commonUtils.generateFontSpec(this.options.scaleFontSize, this.options.scaleFontStyle, this.options.scaleFontFamily),
                axisLineWidth : this.options.scaleLineWidth,
                axisLineColor : this.options.scaleLineColor,
                renderHorizontalGrid : this.options.displayHorizontalGridLines, // Use renamed option.
                renderVerticalGrid : this.options.displayVerticalGridLines,     // Use renamed option.
                // Conditionally set grid line thickness based on visibility option.
                gridLineThickness : this.options.showGridLines ? this.options.gridLineWidthPx : 0,
                // Conditionally set grid line color to transparent if grid lines are not shown.
                gridLineColor : this.options.showGridLines ? this.options.gridLineColor : "transparent",
                chartPadding : (this.options.showScale) ? 0 : (this.options.elementOutlineVisible ? this.options.elementOutlineThickness : 0),
                showAxisLabels : this.options.scaleShowLabels,
                displayAxis : this.options.showScale
            };

            // If an override for axis settings is specified, apply custom range parameters.
            if (this.options.scaleOverride){
                commonUtils.assignProperties(axisSetup, {
                    computeYRange: commonUtils.emptyFunction, // Disable automatic Y-range calculation.
                    numSteps: this.options.scaleSteps,
                    stepIncrement: this.options.scaleStepWidth,
                    minimumValue: this.options.scaleStartValue,
                    maximumValue: this.options.scaleStartValue + (this.options.scaleSteps * this.options.scaleStepWidth)
                });
            }

            // Instantiate the axis component using the prepared configuration.
            this.axis = new this.AxisComponent(axisSetup);
        },

        /**
         * Appends new data points for a new category to the chart, triggering a refresh.
         * @param {Array<number>} dataValues - An array of numeric values, one for each data series.
         * @param {string} newLabel - The label for the newly added category.
         */
        appendDataPoints : function(dataValues, newLabel){
            // Validate input: ensure dataValues is an array and matches the number of existing data series.
            if (!Array.isArray(dataValues) || dataValues.length !== this.dataSeries.length) {
                console.warn("AppendDataPoints: Data values array is invalid or its length does not match the number of existing data series.");
                return; // Prevent execution with malformed data.
            }

            const totalSeriesCount = this.dataSeries.length;
            const nextItemIndex = this.axis.categoryCount; // The index for the new category.

            // For each data series, add a new column element corresponding to the new data point.
            commonUtils.forEachItem(dataValues, (val, collectionIdx) => {
                const currentCollection = this.dataSeries[collectionIdx];
                currentCollection.elements.push(new this.ColumnElement({
                    dataValue : val,
                    itemLabel : newLabel,
                    // Initial position for smooth animation into view.
                    coordX: this.axis.determineBarPositionX(totalSeriesCount, collectionIdx, nextItemIndex),
                    coordY: this.axis.finalPoint,
                    elementWidth : this.axis.computeItemWidth(totalSeriesCount),
                    baseValueLocation : this.axis.finalPoint,
                    outlineColor : currentCollection.strokeColor,
                    fillColor : currentCollection.fillColor
                }));
            }, this);

            this.axis.addCategoryLabel(newLabel); // Add the new label to the X-axis.
            this.refreshComponent(); // Update the chart to display the newly added data.
        },

        /**
         * Removes the oldest data category (the first one) from the chart.
         */
        pruneDataPoints : function(){
            this.axis.deleteLastCategoryLabel(); // Remove the last (oldest) category label from the axis.

            // For each data series, remove its first (oldest) column element.
            commonUtils.forEachItem(this.dataSeries, (collection) => {
                collection.elements.shift(); // Remove the element from the beginning of the array.
            }, this);
            this.refreshComponent(); // Update the chart's display to reflect the removal.
        },

        /**
         * Recalculates chart layout and dimensions, typically invoked when the chart's container resizes.
         */
        resizeAndReflow : function(){
            // Update the prototype properties of ColumnElement to reflect potential new scale dimensions.
            commonUtils.assignProperties(this.ColumnElement.prototype, {
                coordY: this.axis.finalPoint,
                baseValueLocation : this.axis.finalPoint
            });

            // Pass the updated chart dimensions to the axis component for its own recalculation.
            const updatedAxisDimensions = commonUtils.assignProperties({}, {
                chartHeight : this.chart.height,
                chartWidth : this.chart.width
            });
            this.axis.recalculate(updatedAxisDimensions);
        },

        /**
         * Renders all chart elements onto the canvas.
         * @param {number} animationProgress - A decimal value (0.0 to 1.0) indicating the current stage of animation.
         */
        renderChart : function(animationProgress){
            const currentProgress = animationProgress || 1; // Default to a complete render if no animation progress is specified.
            this.clearCanvas(); // Clear the entire drawing surface before beginning a new draw cycle.

            const renderingContext = this.chart.ctx; // Obtain the 2D drawing context for the canvas.

            this.axis.render(currentProgress); // Draw the axis, labels, and grid lines.

            // Iterate through each data series and its associated column elements to draw them.
            const totalSeriesNum = this.dataSeries.length;
            commonUtils.forEachItem(this.dataSeries, (collection, collectionIdx) => {
                commonUtils.forEachItem(collection.elements, (element, itemIdx) => {
                    if (element.hasValidValue()){
                        element.baseValueLocation = this.axis.finalPoint; // Ensure the base of the column is correctly positioned.
                        // Animate the element's properties and then draw it.
                        element.animateAndDraw({
                            coordX : this.axis.determineBarPositionX(totalSeriesNum, collectionIdx, itemIdx),
                            coordY : this.axis.getCoordY(element.dataValue),
                            elementWidth : this.axis.computeItemWidth(totalSeriesNum)
                        }, currentProgress).draw();
                    }
                }, this);
            }, this);
        }
    });

})(this);