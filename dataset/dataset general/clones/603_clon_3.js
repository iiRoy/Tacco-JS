// A custom charting module, derived from a RaphaelJS charting library.
// This module provides advanced line plot visualization capabilities.
//
// Copyright (c) 2023 ChartGenius Inc. (http://chartgenius.dev)
// Licensed under the Apache License 2.0 (http://www.apache.org/licenses/LICENSE-2.0)

Raphael.fn.viz.flowPlot = function (initialX, initialY, plotWidth, plotHeight, xDataArrays, yDataArrays, configOptions) {

    // Helper utility to downsample a data series if it exceeds a target dimension.
    // This reduces the number of points to prevent over-rendering on smaller canvases.
    const downsampleSeries = (sourceValues, targetDimension) => {
        const sourceLength = sourceValues.length;
        // Early exit for trivial cases or invalid inputs
        if (!Array.isArray(sourceValues) || sourceLength === 0 || targetDimension <= 0) {
            return [];
        }
        if (sourceLength <= targetDimension) {
            return [...sourceValues]; // Return a shallow copy if no downsampling is needed
        }

        const reductionRatio = sourceLength / targetDimension;
        let runningIndex = 0;
        let currentInterval = reductionRatio;
        let partialSum = 0;
        const downsampledResult = [];

        for (let i = 0; i < sourceLength; i++) {
            currentInterval -= 1;
            if (currentInterval < 0) {
                partialSum += sourceValues[i] * (1 + currentInterval);
                downsampledResult.push(partialSum / reductionRatio);
                partialSum = sourceValues[i] * -currentInterval;
                currentInterval += reductionRatio;
            } else {
                partialSum += sourceValues[i];
            }
        }
        // Ensure result array has at most targetDimension elements
        while (downsampledResult.length > targetDimension) {
            downsampledResult.pop();
        }
        return downsampledResult;
    };

    // Initialize configuration options, providing defaults if none are supplied.
    configOptions = configOptions || {};

    // Input validation and normalization for data series.
    // Ensure all data series are nested arrays, even if a single series is passed.
    if (!Array.isArray(xDataArrays) || xDataArrays.length === 0) {
        throw new Error("X-axis data arrays must be provided.");
    }
    if (!Array.isArray(yDataArrays) || yDataArrays.length === 0) {
        throw new Error("Y-axis data arrays must be provided.");
    }

    if (!Array.isArray(xDataArrays[0])) {
        xDataArrays = [xDataArrays];
    }
    if (!Array.isArray(yDataArrays[0])) {
        yDataArrays = [yDataArrays];
    }

    // Flatten all x and y values to determine global min/max for scaling.
    const combinedXValues = [].concat(...xDataArrays);
    const combinedYValues = [].concat(...yDataArrays);

    // Determine the extent of the X-axis and Y-axis using a snapping utility.
    // This helps in generating aesthetically pleasing axis labels.
    const xAxisRange = this.utility.alignRange(Math.min(...combinedXValues), Math.max(...combinedXValues), xDataArrays[0].length - 1);
    const minXValue = xAxisRange.from;
    const maxXValue = xAxisRange.to;

    const plotMargin = configOptions.margin || 10; // Use 'margin' instead of 'gutter'
    const effectivePlotWidth = plotWidth - plotMargin * 2;
    const xScaleFactor = effectivePlotWidth / (maxXValue - minXValue);

    const yAxisRange = this.utility.alignRange(Math.min(...combinedYValues), Math.max(...combinedYValues), yDataArrays[0].length - 1);
    const minYValue = yAxisRange.from;
    const maxYValue = yAxisRange.to;

    const effectivePlotHeight = plotHeight - plotMargin * 2;
    const yScaleFactor = effectivePlotHeight / (maxYValue - minYValue);

    // Determine the maximum length of any data series to guide array pre-allocation.
    let maxSeriesLength = 0;
    for (let seriesIdx = 0, numSeries = yDataArrays.length; seriesIdx < numSeries; seriesIdx++) {
        if (yDataArrays[seriesIdx]) { // Guard against empty or undefined series
            maxSeriesLength = Math.max(maxSeriesLength, yDataArrays[seriesIdx].length);
        }
    }

    // Configuration for visual elements.
    const pointMarker = configOptions.marker || ""; // Renamed 'symbol' to 'marker'
    const plotColors = configOptions.seriesColors || Raphael.fn.viz.palette; // Renamed 'colors' to 'seriesColors', 'g.colors' to 'viz.palette'
    const chartInstance = this; // Capture 'this' for internal functions

    // Initialize Raphael sets for various chart components.
    const plotElements = this.set(); // Main container for all chart elements
    const fillAreas = this.set(); // For shaded regions below lines
    const coordinateAxes = this.set(); // For axis lines and labels
    const dataLines = this.set(); // For the actual data lines
    const dataPoints = this.set(); // For markers at data points
    let interactionColumns = null; // For column-based hover/click interactions
    let interactionMarkers = null; // For point-based hover/click interactions

    // Pre-process data series: downsample if too dense and prepare shade paths.
    for (let seriesIndex = 0, numSeries = yDataArrays.length; seriesIndex < numSeries; seriesIndex++) {
        if (configOptions.drawShade) { // Renamed 'shade' to 'drawShade'
            fillAreas.push(this.path().attr({
                stroke: "none",
                fill: plotColors[seriesIndex % plotColors.length], // Cycle colors
                opacity: configOptions.noStroke ? 1 : 0.35 // Slightly increased opacity
            }));
        }

        // Downsample Y-data if it exceeds the effective plot width to prevent rendering too many points.
        if (yDataArrays[seriesIndex].length > effectivePlotWidth) {
            yDataArrays[seriesIndex] = downsampleSeries(yDataArrays[seriesIndex], effectivePlotWidth);
            maxSeriesLength = effectivePlotWidth; // Update max series length after downsampling
        }
        // Downsample X-data correspondingly if it exists and is too dense.
        if (xDataArrays[seriesIndex] && xDataArrays[seriesIndex].length > effectivePlotWidth) {
            xDataArrays[seriesIndex] = downsampleSeries(xDataArrays[seriesIndex], effectivePlotWidth);
        }
    }

    // Render coordinate axes if specified in options.
    if (configOptions.displayAxes) { // Renamed 'axis' to 'displayAxes'
        const axisConfigParts = (configOptions.displayAxes + "").split(/[\s,]+/); // Improved regex for splitting
        const axisXStep = configOptions.xAxisStep || Math.floor(effectivePlotWidth / 25); // Increased density
        const axisYStep = configOptions.yAxisStep || Math.floor(effectivePlotHeight / 25); // Increased density

        // Top X-axis
        if (parseInt(axisConfigParts[0], 10)) {
            coordinateAxes.push(this.utility.drawAxis(initialX + plotMargin, initialY + plotMargin, effectivePlotWidth, minXValue, maxXValue, axisXStep, 2)); // Using this.utility.drawAxis
        }
        // Right Y-axis
        if (parseInt(axisConfigParts[1], 10)) {
            coordinateAxes.push(this.utility.drawAxis(initialX + plotWidth - plotMargin, initialY + plotHeight - plotMargin, effectivePlotHeight, minYValue, maxYValue, axisYStep, 3));
        }
        // Bottom X-axis
        if (parseInt(axisConfigParts[2], 10)) {
            coordinateAxes.push(this.utility.drawAxis(initialX + plotMargin, initialY + plotHeight - plotMargin, effectivePlotWidth, minXValue, maxXValue, axisXStep, 0));
        }
        // Left Y-axis
        if (parseInt(axisConfigParts[3], 10)) {
            coordinateAxes.push(this.utility.drawAxis(initialX + plotMargin, initialY + plotHeight - plotMargin, effectivePlotHeight, minYValue, maxYValue, axisYStep, 1));
        }
    }

    // Render data lines and point markers for each series.
    for (let seriesIndex = 0, numSeries = yDataArrays.length; seriesIndex < numSeries; seriesIndex++) {
        let currentLineElement;
        const currentSeriesColor = plotColors[seriesIndex % plotColors.length];

        if (!configOptions.noStroke) { // Renamed 'nostroke' to 'noStroke'
            currentLineElement = this.path().attr({
                stroke: currentSeriesColor,
                "stroke-width": configOptions.lineWidth || 2, // Renamed 'width' to 'lineWidth'
                "stroke-linejoin": "round",
                "stroke-linecap": "round",
                "stroke-dasharray": configOptions.lineDash || "", // Renamed 'dash' to 'lineDash'
                "stroke-opacity": configOptions.lineOpacity || 1 // Added line opacity option
            });
            dataLines.push(currentLineElement);
        }

        const seriesMarkersCollection = this.set();
        const currentSeriesPathSegments = [];
        const activeXData = xDataArrays[seriesIndex] || xDataArrays[0]; // Fallback to first X-series

        // Loop through each data point in the current series.
        for (let pointIndex = 0, numPoints = yDataArrays[seriesIndex].length; pointIndex < numPoints; pointIndex++) {
            // Calculate screen coordinates for the current data point.
            const plotCoordX = initialX + plotMargin + (activeXData[pointIndex] - minXValue) * xScaleFactor;
            const plotCoordY = initialY + plotHeight - plotMargin - (yDataArrays[seriesIndex][pointIndex] - minYValue) * yScaleFactor;

            // Determine the marker type for the current point.
            const markerShape = Array.isArray(pointMarker) ? pointMarker[seriesIndex] : pointMarker;
            const actualMarkerType = Array.isArray(markerShape) ? markerShape[pointIndex] : markerShape;

            // Render the marker if specified.
            if (actualMarkerType) {
                const markerSize = (configOptions.lineWidth || 2) * 3;
                seriesMarkersCollection.push(this.utility.renderMarker[this.paper.getMarkerType(actualMarkerType)](plotCoordX, plotCoordY, markerSize).attr({
                    fill: currentSeriesColor,
                    stroke: "none"
                }));
            }

            // Append path segments. 'M' for the first point, 'L' for subsequent points.
            currentSeriesPathSegments.push(pointIndex === 0 ? "M" : "L", plotCoordX, plotCoordY);
        }
        dataPoints.push(seriesMarkersCollection);

        // Update shade path if enabled.
        if (configOptions.drawShade) {
            const firstXCoord = initialX + plotMargin + (activeXData[0] - minXValue) * xScaleFactor;
            const lastXCoord = initialX + plotMargin + (activeXData[yDataArrays[seriesIndex].length - 1] - minXValue) * xScaleFactor;

            // Close the shade path to form a polygon.
            fillAreas[seriesIndex].attr({
                path: [...currentSeriesPathSegments,
                    "L", lastXCoord, initialY + plotHeight - plotMargin,
                    "L", firstXCoord, initialY + plotHeight - plotMargin,
                    "Z"
                ].join(",")
            });
        }

        // Update line path if not in 'noStroke' mode.
        if (!configOptions.noStroke) {
            currentLineElement.attr({
                path: currentSeriesPathSegments.join(",")
            });
        }
    }

    // --- Interaction Layer Functions ---

    // Generates invisible rectangular areas for column-based interactions (e.g., hover over a time slice).
    const generateInteractionColumns = (callbackFunction) => {
        // Aggregate all unique X values across all series.
        const allUniqueXValues = [...new Set([].concat(...xDataArrays))].sort((a, b) => a - b);

        const xScreenPositions = allUniqueXValues.map(val => initialX + plotMargin + (val - minXValue) * xScaleFactor);

        const currentColumnSet = callbackFunction ? {} : chartInstance.set(); // Use an empty object if callback, else a Raphael set

        for (let i = 0; i < allUniqueXValues.length; i++) {
            const currentXScreenPos = xScreenPositions[i];
            const prevXScreenPos = xScreenPositions[i - 1] || initialX; // Fallback for the first column
            const nextXScreenPos = xScreenPositions[i + 1] || initialX + plotWidth; // Fallback for the last column

            // Calculate column center and width
            const columnCenter = currentXScreenPos;
            const leftEdge = (prevXScreenPos + currentXScreenPos) / 2;
            const rightEdge = (currentXScreenPos + nextXScreenPos) / 2;
            const columnWidth = Math.max(1, rightEdge - leftEdge); // Ensure minimum width of 1

            let columnHitArea;
            if (callbackFunction) {
                columnHitArea = {}; // If callback, just create a plain object
            } else {
                columnHitArea = chartInstance.rect(leftEdge, initialY, columnWidth, plotHeight).attr({
                    stroke: "none",
                    fill: "#000",
                    opacity: 0
                });
                currentColumnSet.push(columnHitArea);
            }

            // Attach relevant data to the column hit area.
            columnHitArea.dataValues = [];
            columnHitArea.associatedMarkers = chartInstance.set(); // A set to hold markers for this column
            columnHitArea.yCoordinates = [];
            columnHitArea.xPosition = currentXScreenPos;
            columnHitArea.axisValue = allUniqueXValues[i];

            // Populate data values and associated markers for this column.
            for (let seriesIdx = 0, numSeries = yDataArrays.length; seriesIdx < numSeries; seriesIdx++) {
                const currentSeriesXData = xDataArrays[seriesIdx] || xDataArrays[0];
                for (let pointIdx = 0, numPoints = currentSeriesXData.length; pointIdx < numPoints; pointIdx++) {
                    if (currentSeriesXData[pointIdx] === allUniqueXValues[i]) {
                        columnHitArea.dataValues.push(yDataArrays[seriesIdx][pointIdx]);
                        columnHitArea.yCoordinates.push(initialY + plotHeight - plotMargin - (yDataArrays[seriesIdx][pointIdx] - minYValue) * yScaleFactor);
                        if (dataPoints[seriesIdx] && dataPoints[seriesIdx][pointIdx]) {
                            columnHitArea.associatedMarkers.push(dataPoints[seriesIdx][pointIdx]);
                        }
                    }
                }
            }
            callbackFunction && callbackFunction.call(columnHitArea);
        }
        !callbackFunction && (interactionColumns = currentColumnSet);
    };

    // Generates invisible circular areas for individual data point interactions.
    const generateInteractionMarkers = (callbackFunction) => {
        const currentMarkerSet = callbackFunction ? {} : chartInstance.set();

        for (let seriesIdx = 0, numSeries = yDataArrays.length; seriesIdx < numSeries; seriesIdx++) {
            const activeXData = xDataArrays[seriesIdx] || xDataArrays[0]; // Fallback to first X-series
            for (let pointIdx = 0, numPoints = yDataArrays[seriesIdx].length; pointIdx < numPoints; pointIdx++) {
                const plotCoordX = initialX + plotMargin + (activeXData[pointIdx] - minXValue) * xScaleFactor;
                const plotCoordY = initialY + plotHeight - plotMargin - (yDataArrays[seriesIdx][pointIdx] - minYValue) * yScaleFactor;

                // Determine effective radius for the interaction circle.
                // It's half the distance to the previous point, or a default if it's the first point.
                const prevXCoord = initialX + plotMargin + ((pointIdx > 0 ? activeXData[pointIdx - 1] : activeXData[0]) - minXValue) * xScaleFactor;
                const interactionRadius = Math.abs(plotCoordX - prevXCoord) / 2 || (configOptions.lineWidth || 2) * 2; // Min radius for single points

                let markerHitArea;
                if (callbackFunction) {
                    markerHitArea = {};
                } else {
                    markerHitArea = chartInstance.circle(plotCoordX, plotCoordY, interactionRadius).attr({
                        stroke: "none",
                        fill: "#000",
                        opacity: 0
                    });
                    currentMarkerSet.push(markerHitArea);
                }

                // Attach relevant data to the marker hit area.
                markerHitArea.xPosition = plotCoordX;
                markerHitArea.yPosition = plotCoordY;
                markerHitArea.dataValue = yDataArrays[seriesIdx][pointIdx];
                markerHitArea.lineElement = dataLines[seriesIdx];
                markerHitArea.fillArea = fillAreas[seriesIdx];
                markerHitArea.markerElement = dataPoints[seriesIdx] && dataPoints[seriesIdx][pointIdx];
                markerHitArea.allMarkersInSeries = dataPoints[seriesIdx];
                markerHitArea.axisValue = activeXData[pointIdx];

                callbackFunction && callbackFunction.call(markerHitArea);
            }
        }
        !callbackFunction && (interactionMarkers = currentMarkerSet);
    };

    // Add all graphical elements to the main plotElements set.
    plotElements.push(dataLines, fillAreas, dataPoints, coordinateAxes);

    // Expose chart components and interaction methods.
    plotElements.dataLines = dataLines;
    plotElements.fillAreas = fillAreas;
    plotElements.dataPoints = dataPoints;
    plotElements.coordinateAxes = coordinateAxes;

    // Method to attach hover handlers to column interaction areas.
    plotElements.onColumnHover = function (hoverInCallback, hoverOutCallback) {
        if (!interactionColumns) {
            generateInteractionColumns();
        }
        interactionColumns.mouseover(hoverInCallback).mouseout(hoverOutCallback);
        return this;
    };

    // Method to attach click handlers to column interaction areas.
    plotElements.onColumnClick = function (clickCallback) {
        if (!interactionColumns) {
            generateInteractionColumns();
        }
        interactionColumns.click(clickCallback);
        return this;
    };

    // Method to set href attributes for columns based on axis values or index.
    plotElements.setColumnHrefs = function (hrefMapOrArray) {
        if (!interactionColumns) {
            generateInteractionColumns();
        }

        if (typeof hrefMapOrArray === "object" && !Array.isArray(hrefMapOrArray)) {
            // If an object (map) is provided, match by axis value.
            for (const col of interactionColumns) {
                if (col.axisValue in hrefMapOrArray) {
                    col.attr("href", hrefMapOrArray[col.axisValue]);
                }
            }
        } else if (Array.isArray(hrefMapOrArray)) {
            // If an array is provided, match by index.
            for (let i = 0; i < hrefMapOrArray.length; i++) {
                if (interactionColumns[i]) {
                    interactionColumns[i].attr("href", hrefMapOrArray[i]);
                }
            }
        }
        return this;
    };

    // Method to attach hover handlers to individual data point interaction areas.
    plotElements.onPointHover = function (hoverInCallback, hoverOutCallback) {
        if (!interactionMarkers) {
            generateInteractionMarkers();
        }
        interactionMarkers.mouseover(hoverInCallback).mouseout(hoverOutCallback);
        return this;
    };

    // Method to attach click handlers to individual data point interaction areas.
    plotElements.onPointClick = function (clickCallback) {
        if (!interactionMarkers) {
            generateInteractionMarkers();
        }
        interactionMarkers.click(clickCallback);
        return this;
    };

    // Method to iterate over each individual data point and execute a callback.
    plotElements.forEachPoint = function (callbackFunction) {
        generateInteractionMarkers(callbackFunction);
        return this;
    };

    // Method to iterate over each column interaction area and execute a callback.
    plotElements.forEachColumn = function (callbackFunction) {
        generateInteractionColumns(callbackFunction);
        return this;
    };

    return plotElements;
};