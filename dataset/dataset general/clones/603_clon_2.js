// This module provides a line chart drawing utility for the Paper graphics library.
// It is part of the visualization toolkit, building upon the core Paper drawing capabilities.
//
// (C) 2009 Developer Name (http://example.com)
// Licensed under the permissive MIT license (http://www.opensource.org/licenses/mit-license.php).
Paper.prototype.graphics.plotLineGraph = function (initialX, initialY, chartWidth, chartHeight, xDataArrays, yDataArrays, graphOptions) {

    /**
     * Reduces the number of data points in a series to fit a target dimension.
     * This is a simple averaging downsampling algorithm.
     * @param {Array<number>} inputSeries - The original array of numerical values.
     * @param {number} targetDimension - The desired number of points after downsampling.
     * @returns {Array<number>} A new array with fewer data points.
     */
    function downsampleData(inputSeries, targetDimension) {
        let samplingRatio = inputSeries.length / targetDimension;
        let currentIdx = 0;
        let remainingFactor = samplingRatio;
        let accumulator = 0;
        let resultArray = [];

        // Traverse the input series to aggregate values
        while (currentIdx < inputSeries.length) {
            remainingFactor--;
            if (remainingFactor < 0) {
                // Current point contributes partially to the previous bucket
                accumulator += inputSeries[currentIdx] * (1 + remainingFactor);
                resultArray.push(accumulator / samplingRatio);
                // Remaining part of the current point starts a new bucket
                accumulator = inputSeries[currentIdx++] * -remainingFactor;
                remainingFactor += samplingRatio;
            } else {
                // Current point fully contributes to the current bucket
                accumulator += inputSeries[currentIdx++];
            }
        }
        return resultArray;
    }

    graphOptions = graphOptions || {}; // Ensure options object exists

    // Normalize input data: if not an array of arrays, wrap it.
    if (!this.drawingCanvas.checkType(xDataArrays[0], "array")) {
        xDataArrays = [xDataArrays];
    }
    if (!this.drawingCanvas.checkType(yDataArrays[0], "array")) {
        yDataArrays = [yDataArrays];
    }

    // Combine all X and Y values from all series to determine overall data range.
    let combinedXValues = Array.prototype.concat.apply([], xDataArrays);
    let combinedYValues = Array.prototype.concat.apply([], yDataArrays);

    // Calculate X-axis data range and scaling factor.
    let xRangeInfo = this.graphics.determineExtremes(
        Math.min.apply(Math, combinedXValues),
        Math.max.apply(Math, combinedXValues),
        xDataArrays[0].length - 1
    );
    let minXValue = xRangeInfo.from;
    let maxXValue = xRangeInfo.to;
    let padding = graphOptions.outerPadding || 10;
    let xScaleFactor = (chartWidth - padding * 2) / (maxXValue - minXValue);

    // Calculate Y-axis data range and scaling factor.
    let yRangeInfo = this.graphics.determineExtremes(
        Math.min.apply(Math, combinedYValues),
        Math.max.apply(Math, combinedYValues),
        yDataArrays[0].length - 1
    );
    let minYValue = yRangeInfo.from;
    let maxYValue = yRangeInfo.to;
    let yScaleFactor = (chartHeight - padding * 2) / (maxYValue - minYValue);

    // Determine maximum length among all series for initial sizing.
    let maxSeriesLength = 0;
    for (let idx1 = 0, limit1 = yDataArrays.length; idx1 < limit1; idx1++) {
        if (yDataArrays[idx1].length > maxSeriesLength) {
             maxSeriesLength = yDataArrays[idx1].length;
        }
    }

    let dataPointSymbol = graphOptions.pointShape || "";
    let seriesColors = graphOptions.dataColors || Paper.prototype.graphics.defaultColors;
    let currentPaper = this; // Reference to the Paper instance for drawing operations.

    let interactionColumns = null; // Placeholder for interactive column elements.
    let interactionPoints = null;  // Placeholder for interactive data point elements.
    let chartGroup = this.createSet(); // Main group for all chart elements.
    let currentPathSegments = [];      // Array to build SVG path strings.

    // Pre-processing for shades and data downsampling.
    let shadeElements = this.createSet();
    for (let idx1 = 0, limit1 = yDataArrays.length; idx1 < limit1; idx1++) {
        if (graphOptions.showShade) {
            // Create a shade path for each series, initially empty.
            shadeElements.add(this.createPath().attribute({
                stroke: "none",
                fill: seriesColors[idx1],
                opacity: graphOptions.noStroke ? 1 : .3
            }));
        }
        // Downsample Y-axis data if too many points for the chart width.
        if (yDataArrays[idx1].length > chartWidth - 2 * padding) {
            yDataArrays[idx1] = downsampleData(yDataArrays[idx1], chartWidth - 2 * padding);
            maxSeriesLength = chartWidth - 2 * padding; // Update max length if downsampled.
        }
        // Downsample X-axis data if present and too many points.
        if (xDataArrays[idx1] && xDataArrays[idx1].length > chartWidth - 2 * padding) {
            xDataArrays[idx1] = downsampleData(xDataArrays[idx1], chartWidth - 2 * padding);
        }
    }

    // Draw axes if specified in options.
    let axisElements = this.createSet();
    if (graphOptions.drawAxes) {
        let axisDirections = (graphOptions.drawAxes + "").split(/[,\s]+/);
        // Top X-axis
        if (+axisDirections[0]) axisElements.add(this.graphics.drawAxis(
            initialX + padding,
            initialY + padding,
            chartWidth - 2 * padding,
            minXValue,
            maxXValue,
            graphOptions.xStep || Math.floor((chartWidth - 2 * padding) / 20),
            2 // Axis type: top
        ));
        // Right Y-axis
        if (+axisDirections[1]) axisElements.add(this.graphics.drawAxis(
            initialX + chartWidth - padding,
            initialY + chartHeight - padding,
            chartHeight - 2 * padding,
            minYValue,
            maxYValue,
            graphOptions.yStep || Math.floor((chartHeight - 2 * padding) / 20),
            3 // Axis type: right
        ));
        // Bottom X-axis
        if (+axisDirections[2]) axisElements.add(this.graphics.drawAxis(
            initialX + padding,
            initialY + chartHeight - padding,
            chartWidth - 2 * padding,
            minXValue,
            maxXValue,
            graphOptions.xStep || Math.floor((chartWidth - 2 * padding) / 20),
            0 // Axis type: bottom
        ));
        // Left Y-axis
        if (+axisDirections[3]) axisElements.add(this.graphics.drawAxis(
            initialX + padding,
            initialY + chartHeight - padding,
            chartHeight - 2 * padding,
            minYValue,
            maxYValue,
            graphOptions.yStep || Math.floor((chartHeight - 2 * padding) / 20),
            1 // Axis type: left
        ));
    }

    // Prepare containers for line paths and data point symbols.
    let lineElements = this.createSet();
    let symbolElements = this.createSet();
    let currentLineSegment;

    // Iterate through each data series to draw lines and symbols.
    for (let idx1 = 0, limit1 = yDataArrays.length; idx1 < limit1; idx1++) {
        if (!graphOptions.noStroke) {
            // Create a path element for the current line series.
            lineElements.add(currentLineSegment = this.createPath().attribute({
                stroke: seriesColors[idx1],
                "stroke-width": graphOptions.lineWidth || 2,
                "stroke-linejoin": "round",
                "stroke-linecap": "round",
                "stroke-dasharray": graphOptions.lineDash || ""
            }));
        }

        // Determine symbol for the current series, can be an array per point.
        let seriesSymbol = this.drawingCanvas.checkType(dataPointSymbol, "array") ? dataPointSymbol[idx1] : dataPointSymbol;
        let seriesSymbolSet = this.createSet();
        currentPathSegments = []; // Reset path segments for the current line.

        // Iterate through data points in the current series.
        for (let idx2 = 0, limit2 = yDataArrays[idx1].length; idx2 < limit2; idx2++) {
            // Calculate scaled X and Y coordinates for the current data point.
            let pointCoordX = initialX + padding + ((xDataArrays[idx1] || xDataArrays[0])[idx2] - minXValue) * xScaleFactor;
            let pointCoordY = initialY + chartHeight - padding - (yDataArrays[idx1][idx2] - minYValue) * yScaleFactor;

            // Draw a symbol if specified for the current point.
            let pointSpecificSymbol = this.drawingCanvas.checkType(seriesSymbol, "array") ? seriesSymbol[idx2] : seriesSymbol;
            if (pointSpecificSymbol) {
                seriesSymbolSet.add(this.graphics[Paper.prototype.graphics.visualMarkers[pointSpecificSymbol]](
                    pointCoordX,
                    pointCoordY,
                    (graphOptions.lineWidth || 2) * 3
                ).attribute({fill: seriesColors[idx1], stroke: "none"}));
            }
            // Add path segment commands.
            currentPathSegments = currentPathSegments.concat([idx2 ? "L" : "M", pointCoordX, pointCoordY]);
        }
        symbolElements.add(seriesSymbolSet); // Add all symbols for this series to the overall symbol set.

        // If shading is enabled, complete the shade path.
        if (graphOptions.showShade) {
            // Close the path to form a shaded area.
            shadeElements[idx1].attribute({
                path: currentPathSegments.concat([
                    "L", pointCoordX, initialY + chartHeight - padding,
                    "L", initialX + padding + ((xDataArrays[idx1] || xDataArrays[0])[0] - minXValue) * xScaleFactor, initialY + chartHeight - padding,
                    "z"
                ]).join(",")
            });
        }
        // If stroke is not disabled, set the line path.
        if (!graphOptions.noStroke) {
            currentLineSegment.attribute({path: currentPathSegments.join(",")});
        }
    }

    /**
     * Creates invisible rectangular columns for interaction, typically used for tooltips or clicks.
     * Each column corresponds to a unique X-axis value.
     * @param {Function} [processCallback] - An optional function to call for each created column,
     *                                       with the column object as 'this'.
     */
    function generateInteractiveColumns(processCallback) {
        // Collect all unique X-values from all series.
        let uniqueXCoordinates = [];
        for (let idx1 = 0, limit1 = xDataArrays.length; idx1 < limit1; idx1++) {
            uniqueXCoordinates = uniqueXCoordinates.concat(xDataArrays[idx1]);
        }
        uniqueXCoordinates.sort((a, b) => a - b); // Sort numerically.

        // Remove duplicate X-values and store their scaled screen positions.
        let sortedUniqueXCoordinates = [];
        let scaledXCoordinates = [];
        for (let idx1 = 0, limit1 = uniqueXCoordinates.length; idx1 < limit1; idx1++) {
            if (uniqueXCoordinates[idx1] !== uniqueXCoordinates[idx1 - 1]) {
                sortedUniqueXCoordinates.push(uniqueXCoordinates[idx1]);
                scaledXCoordinates.push(initialX + padding + (uniqueXCoordinates[idx1] - minXValue) * xScaleFactor);
            }
        }
        uniqueXCoordinates = sortedUniqueXCoordinates; // Update to unique sorted values.
        let columnCount = uniqueXCoordinates.length;

        let columnElements = processCallback || currentPaper.createSet(); // Use provided set or create new.
        for (let idx1 = 0; idx1 < columnCount; idx1++) {
            // Calculate column position and width.
            let columnStartX = scaledXCoordinates[idx1] - (scaledXCoordinates[idx1] - (scaledXCoordinates[idx1 - 1] || initialX)) / 2;
            let columnWidth = ((scaledXCoordinates[idx1 + 1] || initialX + chartWidth) - scaledXCoordinates[idx1]) / 2 + (scaledXCoordinates[idx1] - (scaledXCoordinates[idx1 - 1] || initialX)) / 2;
            let currentColumn;

            if (processCallback) {
                currentColumn = {}; // If callback, just create a data object.
            } else {
                // Create an invisible rectangle for interaction.
                currentColumn = currentPaper.createRectangle(
                    columnStartX - 1,
                    initialY,
                    Math.max(columnWidth + 1, 1),
                    chartHeight
                ).attribute({stroke: "none", fill: "#000", opacity: 0});
                columnElements.add(currentColumn);
            }

            // Store data associated with this column.
            currentColumn.values = [];      // Y-values for all series at this X.
            currentColumn.symbols = currentPaper.createSet(); // Symbols at this X.
            currentColumn.yPositions = [];  // Scaled Y-positions at this X.
            currentColumn.xPosition = scaledXCoordinates[idx1]; // Scaled X-position.
            currentColumn.axisValue = uniqueXCoordinates[idx1]; // Original X-axis value.

            for (let idx2 = 0, limit2 = yDataArrays.length; idx2 < limit2; idx2++) {
                let xSeriesForLookup = xDataArrays[idx2] || xDataArrays[0];
                for (let idx3 = 0, limit3 = xSeriesForLookup.length; idx3 < limit3; idx3++) {
                    if (xSeriesForLookup[idx3] === uniqueXCoordinates[idx1]) {
                        currentColumn.values.push(yDataArrays[idx2][idx3]);
                        currentColumn.yPositions.push(initialY + chartHeight - padding - (yDataArrays[idx2][idx3] - minYValue) * yScaleFactor);
                        currentColumn.symbols.add(chartGroup.symbolElements[idx2][idx3]);
                    }
                }
            }
            // Execute the callback if provided.
            if (processCallback) {
                processCallback.call(currentColumn);
            }
        }
        // Store the generated columns if no callback was used for direct creation.
        if (!processCallback) {
            interactionColumns = columnElements;
        }
    }

    /**
     * Creates invisible circular elements for interaction around each data point.
     * @param {Function} [processCallback] - An optional function to call for each created point,
     *                                       with the point object as 'this'.
     */
    function generateInteractivePoints(processCallback) {
        let pointElements = processCallback || currentPaper.createSet();
        let currentPoint;

        for (let idx1 = 0, limit1 = yDataArrays.length; idx1 < limit1; idx1++) {
            for (let idx2 = 0, limit2 = yDataArrays[idx1].length; idx2 < limit2; idx2++) {
                // Calculate position and a radius based on distance to neighbor.
                let pointXPosition = initialX + padding + ((xDataArrays[idx1] || xDataArrays[0])[idx2] - minXValue) * xScaleFactor;
                let adjacentXPosition = initialX + padding + ((xDataArrays[idx1] || xDataArrays[0])[idx2 ? idx2 - 1 : 1] - minXValue) * xScaleFactor;
                let pointYPosition = initialY + chartHeight - padding - (yDataArrays[idx1][idx2] - minYValue) * yScaleFactor;

                if (processCallback) {
                    currentPoint = {}; // If callback, just create a data object.
                } else {
                    // Create an invisible circle for interaction.
                    currentPoint = currentPaper.createCircle(
                        pointXPosition,
                        pointYPosition,
                        Math.abs(adjacentXPosition - pointXPosition) / 2
                    ).attribute({stroke: "none", fill: "#000", opacity: 0});
                    pointElements.add(currentPoint);
                }

                // Store data associated with this point.
                currentPoint.x = pointXPosition;
                currentPoint.y = pointYPosition;
                currentPoint.dataValue = yDataArrays[idx1][idx2];
                currentPoint.associatedLine = chartGroup.lineElements[idx1];
                currentPoint.associatedShade = chartGroup.shadeElements[idx1];
                currentPoint.pointSymbol = chartGroup.symbolElements[idx1][idx2];
                currentPoint.allSeriesSymbols = chartGroup.symbolElements[idx1]; // All symbols for this series.
                currentPoint.axisValue = (xDataArrays[idx1] || xDataArrays[0])[idx2];

                // Execute the callback if provided.
                if (processCallback) {
                    processCallback.call(currentPoint);
                }
            }
        }
        // Store the generated points if no callback was used for direct creation.
        if (!processCallback) {
            interactionPoints = pointElements;
        }
    }

    // Add all graphical components to the main chart group.
    chartGroup.add(lineElements, shadeElements, symbolElements, axisElements, interactionColumns, interactionPoints);

    // Expose components for external access.
    chartGroup.lineElements = lineElements;
    chartGroup.shadeElements = shadeElements;
    chartGroup.symbolElements = symbolElements;
    chartGroup.axisElements = axisElements;

    // Methods for interacting with columns.
    chartGroup.onColumnHover = function (enterHandler, exitHandler) {
        if (!interactionColumns) generateInteractiveColumns(); // Lazy creation.
        interactionColumns.onMouseOver(enterHandler).onMouseOut(exitHandler);
        return this;
    };
    chartGroup.onColumnClick = function (clickHandler) {
        if (!interactionColumns) generateInteractiveColumns(); // Lazy creation.
        interactionColumns.onClick(clickHandler);
        return this;
    };
    chartGroup.setColumnLinks = function (linkTargets) {
        // Handle various input formats for link targets.
        let actualLinkTargets = currentPaper.drawingCanvas.checkType(arguments[0], "array") ? arguments[0] : arguments;
        if ((arguments.length === 1) && (typeof linkTargets === "object")) {
            // If a single object is passed, map axis values to URLs.
            if (!interactionColumns) generateInteractiveColumns();
            for (let axisKey in linkTargets) {
                for (let idx1 = 0, limit1 = interactionColumns.length; idx1 < limit1; idx1++) {
                    if (interactionColumns[idx1].axisValue == axisKey) {
                        interactionColumns[idx1].attribute("href", linkTargets[axisKey]);
                    }
                }
            }
        }
        if (!interactionColumns) generateInteractiveColumns(); // Ensure columns exist before setting hrefs.
        for (let idx1 = 0, limit1 = actualLinkTargets.length; idx1 < limit1; idx1++) {
            if (interactionColumns[idx1]) {
                interactionColumns[idx1].attribute("href", actualLinkTargets[idx1]);
            }
        }
        return this;
    };

    // Methods for interacting with individual data points.
    chartGroup.onPointHover = function (enterHandler, exitHandler) {
        if (!interactionPoints) generateInteractivePoints(); // Lazy creation.
        interactionPoints.onMouseOver(enterHandler).onMouseOut(exitHandler);
        return this;
    };
    chartGroup.onPointClick = function (clickHandler) {
        if (!interactionPoints) generateInteractivePoints(); // Lazy creation.
        interactionPoints.onClick(clickHandler);
        return this;
    };
    chartGroup.iteratePoints = function (iteratorFunction) {
        generateInteractivePoints(iteratorFunction); // Creates points and applies callback.
        return this;
    };
    chartGroup.iterateColumns = function (iteratorFunction) {
        generateInteractiveColumns(iteratorFunction); // Creates columns and applies callback.
        return this;
    };

    return chartGroup; // Return the complete chart group.
};