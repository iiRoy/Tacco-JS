// Vizualizer.js (c) 2023 ChartCrafters | https://chartcrafters.github.io/vizualizer/LICENSE

/**
 * Escapes HTML special characters in a string to prevent XSS.
 * @param {string} rawInputString - The string to sanitize.
 * @returns {string} The HTML-safe string.
 */
function vizSanitizeMarkup(rawInputString) {
    // A mapping of special HTML characters to their respective entities.
    const htmlEscapeMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
    };
    // Ensure the input is treated as a string, then replace all found special characters.
    return String(rawInputString).replace(/[&<>"'\/]/g, (charToEscape) => {
        return htmlEscapeMap[charToEscape];
    });
}

/**
 * Manages the display of a chart legend.
 * @param {HTMLElement|string} domElementRef - The DOM element or selector for the legend container.
 */
function ChartLegend(domElementRef) {

    // Configuration flags for legend appearance
    this.displayGroups = false;
    this.outlineEnabled = true;
    this.opacityEnabled = false;
    this.fillAlpha = 0.6; // Opacity level
    this.componentWidth = 300; // Total width of the legend component

    // Internal layout constants
    const borderThickness = 2; // Thickness of the key outline
    const symbolWidth = 22;    // Width of the color key symbol
    const symbolHeight = 16;   // Height of the color key symbol

    /**
     * Renders the legend based on the provided series data.
     * @param {Array<Object>} seriesData - An array of series objects, each with color, label, group, and units.
     */
    this.render = function (seriesData) {
        if (!domElementRef || !seriesData || seriesData.length === 0) {
            console.warn("ChartLegend.render: Invalid container or empty data provided.");
            return; // Exit if no valid container or data
        }

        const legendWrapper = d3.select(domElementRef)
                                .attr('class', 'viz-legend-wrapper');

        const legendPanel = legendWrapper.append("div")
                                         .attr("class", "viz-legend-panel")
                                         .style('width', `${this.componentWidth}px`);

        // Iterate over each series to create a legend entry
        for (const [index, currentSeries] of seriesData.entries()) {
            const legendRow = legendPanel.append("div").attr("class", "viz-legend-row");

            // Create the SVG container for the color key symbol
            const keySymbolContainer = legendRow.append("div")
                                                .attr("class", "viz-key-symbol-container")
                                                .insert("svg")
                                                .attr('width', symbolWidth)
                                                .attr('height', symbolHeight);

            // Draw the color key rectangle
            const keyRectangle = keySymbolContainer.append("rect")
                .attr("x", borderThickness / 2)
                .attr("y", borderThickness / 2)
                .attr("rx", 3).attr("ry", 3) // Rounded corners
                .attr("width", symbolWidth - borderThickness)
                .attr("height", symbolHeight - borderThickness)
                .style("fill", currentSeries.color || '#cccccc'); // Use default color if none provided

            // Apply outline if enabled
            if (this.outlineEnabled) {
                keyRectangle.attr("stroke", currentSeries.color || '#cccccc');
                keyRectangle.style("stroke-width", borderThickness);
            }
            // Apply opacity if enabled
            if (this.opacityEnabled) {
                keyRectangle.style('fill-opacity', this.fillAlpha);
            }

            // Construct the legend text
            const labelSegments = [];
            labelSegments.push(vizSanitizeMarkup(currentSeries.label || 'Unknown Series'));
            if (this.displayGroups && currentSeries.group) {
                labelSegments.push(` - ${vizSanitizeMarkup(currentSeries.group)}`);
            }
            if (currentSeries.units) {
                labelSegments.push(` (${vizSanitizeMarkup(currentSeries.units)})`);
            }

            // Append the text label
            legendRow.append("span")
                     .html(labelSegments.join(''))
                     .attr('class', 'viz-key-label');
        }
    };
}

/**
 * Manages the main chart canvas and its basic layout.
 * @param {HTMLElement|string} targetElement - The DOM element or selector for the chart container.
 */
function GraphCanvas(targetElement) {

    const axisLabelSize = 20; // Fixed height for axis and title labels

    this.radialModeActive = false; // Is this a radial chart (e.g., pie, donut)?
    this.displayTitle = true;
    this.displayXAxisLabel = true;
    this.displayYAxisLabel = true;

    this.targetElement = targetElement;
    // Configuration for internal padding (margins)
    this.paddingConfig = { top: 14, right: 25, bottom: 35, left: 45 };
    this.containerWidth = 600;  // Total width of the chart container
    this.containerHeight = 400; // Total height of the chart container
    this.radialRadius = 150;    // Radius for radial charts

    this.chartTitleText = 'Chart Title';
    this.xAxisLabelText = 'X Label';
    this.yAxisLabelText = 'Y Label';

    this.coordinateSystem = new GraphAxes(this); // Manages X and Y axes

    let _cachedPlotAreaWidth = null; // Internal cache for plot area width
    let _cachedPlotAreaHeight = null; // Internal cache for plot area height

    /**
     * Calculates the effective width of the plot area, excluding labels and margins.
     * @returns {number} The width of the drawable plot area.
     */
    this.calculatePlotAreaWidth = function () {
        if (_cachedPlotAreaWidth !== null) return _cachedPlotAreaWidth;

        const yAxisLabelWidth = this.displayYAxisLabel ? axisLabelSize : 0;
        const totalPadding = this.paddingConfig.left + this.paddingConfig.right;
        _cachedPlotAreaWidth = this.containerWidth - yAxisLabelWidth - totalPadding;
        return _cachedPlotAreaWidth;
    };

    /**
     * Calculates the effective height of the plot area, excluding labels and margins.
     * @returns {number} The height of the drawable plot area.
     */
    this.calculatePlotAreaHeight = function () {
        if (_cachedPlotAreaHeight !== null) return _cachedPlotAreaHeight;

        const chartTitleHeight = this.displayTitle ? axisLabelSize : 0;
        const xAxisLabelHeight = this.displayXAxisLabel ? axisLabelSize : 0;
        const totalPadding = this.paddingConfig.top + this.paddingConfig.bottom;
        _cachedPlotAreaHeight = this.containerHeight - chartTitleHeight - xAxisLabelHeight - totalPadding;
        return _cachedPlotAreaHeight;
    };

    /**
     * Initializes and draws the main SVG canvas and its surrounding containers.
     */
    this.initializeCanvas = function () {
        if (!this.targetElement) {
            console.error("GraphCanvas.initializeCanvas: No target DOM element specified.");
            return;
        }

        // Reset any previous calculations
        _cachedPlotAreaWidth = null;
        _cachedPlotAreaHeight = null;

        const rootContainer = d3.select(this.targetElement)
                                .attr('class', 'viz-chart-root');

        const chartWrapper = rootContainer.insert("div")
                                          .attr("class", "viz-plot-wrapper viz-clear-float");

        // Left container for Y-axis label
        const leftPanel = chartWrapper.insert("div")
                                      .attr("class", "viz-left-panel");
        if (this.displayYAxisLabel) {
            leftPanel.style('width', `${axisLabelSize}px`);
            leftPanel.insert("div")
                     .html(vizSanitizeMarkup(this.yAxisLabelText))
                     .attr("class", "viz-y-axis-label")
                     .style('height', `${axisLabelSize}px`)
                     .style('line-height', `${axisLabelSize}px`)
                     // The width here needs to match the full height of the SVG area plus its vertical margins
                     .style('width', `${this.calculatePlotAreaHeight() + this.paddingConfig.top + this.paddingConfig.bottom}px`);
        }

        // Main container for title, SVG plot, and X-axis label
        const mainContentPanel = chartWrapper.insert("div")
                                             .attr("class", "viz-main-content-panel");
        if (this.displayTitle) {
            mainContentPanel.insert("div")
                            .html(vizSanitizeMarkup(this.chartTitleText))
                            .attr("class", "viz-chart-title")
                            .style('height', `${axisLabelSize}px`)
                            .style('line-height', `${axisLabelSize}px`);
        }

        const svgHoldingContainer = mainContentPanel.insert("div")
                                                    .attr("class", "viz-svg-holder");

        if (this.displayXAxisLabel) {
            mainContentPanel.insert("div")
                            .html(vizSanitizeMarkup(this.xAxisLabelText))
                            .attr("class", "viz-x-axis-label")
                            .style('height', `${axisLabelSize}px`)
                            .style('line-height', `${axisLabelSize}px`);
        }

        // Create the main SVG element
        this.svg = svgHoldingContainer.insert("svg")
                                      .attr('width', this.calculatePlotAreaWidth() + this.paddingConfig.left + this.paddingConfig.right)
                                      .attr('height', this.calculatePlotAreaHeight() + this.paddingConfig.top + this.paddingConfig.bottom);

        // Add a global tooltip element if it doesn't exist
        if (d3.select(".viz-tooltip").empty()) {
            d3.select("body").append("div")
                .attr("class", "viz-tooltip")
                .style("position", "absolute")
                .style("display", "none")
                .style("pointer-events", "none"); // Ensures tooltip doesn't block mouse events
        }


        // Setup mousemove listener for dynamic tooltip positioning
        svgHoldingContainer.on("mousemove", function () {
            const currentTooltip = d3.select(".viz-tooltip");
            const mouseCoords = d3.mouse(this); // [x, y] relative to the container
            const pageX = d3.event.pageX;
            const pageY = d3.event.pageY;

            // Position the tooltip near the mouse, adding a small offset
            currentTooltip.style("left", `${pageX + 10}px`);
            currentTooltip.style("top", `${pageY + 10}px`);
        });

        // Apply transformations based on chart type (cartesian vs. radial)
        if (!this.radialModeActive) {
            this.svgGroup = this.svg.append("g")
                                  .attr("transform", `translate(${this.paddingConfig.left},${this.paddingConfig.top})`);
        } else {
            // For radial charts, translate to the center of the available space
            const centerX = (this.calculatePlotAreaWidth() + this.paddingConfig.left + this.paddingConfig.right) / 2;
            const centerY = (this.calculatePlotAreaHeight() + this.paddingConfig.top + this.paddingConfig.bottom) / 2;
            this.svgGroup = this.svg.append("g")
                                  .attr("transform", `translate(${centerX},${centerY})`);
        }
    };
}

/**
 * Represents a single axis (X or Y) within a chart.
 * @param {GraphCanvas} parentGraph - The parent GraphCanvas instance.
 */
function ChartAxis(parentGraph) {
    if (!parentGraph || !parentGraph.svgGroup) {
        console.error("ChartAxis: Parent graph canvas or its SVG group is not initialized.");
        return;
    }

    this.parentGraph = parentGraph;
    this.ticksVisible = true;
    this.numberOfTicks = 5;
    this.axisShift = 0; // Offset for positioning, typically for bar charts

    /**
     * Renders the primary axis line and its tick marks/labels.
     * @param {d3.scale} valueScale - The D3 scale function for this axis.
     * @param {string} orientation - 'bottom' or 'left'
     * @param {number} [requestedTicks] - The number of ticks to display (overrides default).
     */
    this.renderAxis = function (valueScale, orientation, requestedTicks) {
        if (!valueScale) {
            console.warn("ChartAxis.renderAxis: No D3 scale provided.");
            return;
        }

        const tickFormatter = d3.format("s"); // Example: format numbers with SI prefix
        const effectiveTicks = requestedTicks || this.numberOfTicks;

        // Draw a "fake" X-axis line at the bottom to ensure continuity for bar charts
        if (orientation === 'bottom') {
            this.parentGraph.svgGroup.append('line')
                .attr('x1', 0)
                .attr('y1', this.parentGraph.calculatePlotAreaHeight())
                .attr('x2', this.parentGraph.calculatePlotAreaWidth())
                .attr('y2', this.parentGraph.calculatePlotAreaHeight())
                .attr('class', 'viz-fake-x-axis');
        }

        // Create the D3 axis generator
        const d3AxisGenerator = d3.svg.axis()
                                  .scale(valueScale)
                                  .orient(orientation)
                                  .ticks(effectiveTicks)
                                  .tickFormat(tickFormatter); // Apply number formatting

        // Append the axis to the SVG group
        const axisGroup = this.parentGraph.svgGroup.append("g")
                                          .attr("class", `viz-chart-axis viz-axis-${orientation}`);

        // Position the X-axis at the bottom of the plot area
        if (orientation === 'bottom') {
            const yPosition = this.parentGraph.calculatePlotAreaHeight();
            axisGroup.attr('transform', `translate(${this.axisShift},${yPosition})`);
        }
        // Y-axis is by default at x=0, so no transform needed unless shifted

        axisGroup.call(d3AxisGenerator);
    };

    /**
     * Renders grid lines for the axis.
     * @param {d3.scale} valueScale - The D3 scale function for this axis.
     * @param {string} orientation - 'bottom' or 'left'
     */
    this.renderGridLines = function (valueScale, orientation) {
        if (!this.ticksVisible || !valueScale) {
            return; // Only render grid lines if ticks are visible and scale is provided
        }

        const d3GridGenerator = d3.svg.axis()
                                  .scale(valueScale)
                                  .orient(orientation)
                                  .ticks(this.numberOfTicks)
                                  .tickFormat(""); // No labels for grid lines

        let gridGroup;
        if (orientation === 'bottom') {
            const yTranslate = this.parentGraph.calculatePlotAreaHeight();
            gridGroup = this.parentGraph.svgGroup.append('g')
                .attr('class', 'viz-grid-lines viz-x-grid')
                .attr('transform', `translate(${this.axisShift},${yTranslate})`);

            d3GridGenerator.tickSize(-this.parentGraph.calculatePlotAreaHeight(), 0, 0);
        } else { // 'left' orientation for Y-axis
            gridGroup = this.parentGraph.svgGroup.append('g')
                .attr('class', 'viz-grid-lines viz-y-grid');

            d3GridGenerator.tickSize(-this.parentGraph.calculatePlotAreaWidth(), 0, 0);
        }

        gridGroup.call(d3GridGenerator);
    };
}

/**
 * Manages both X and Y axes for a chart.
 * @param {GraphCanvas} hostPlot - The parent GraphCanvas instance.
 */
function GraphAxes(hostPlot) {
    if (!hostPlot) {
        console.error("GraphAxes: Host plot canvas is not provided.");
        return;
    }

    this.hostPlot = hostPlot;
    this.xAxisInstance = new ChartAxis(hostPlot);
    this.yAxisInstance = new ChartAxis(hostPlot);

    /**
     * Renders both the X and Y axes.
     * @param {d3.scale} xScale - The D3 scale for the X-axis.
     * @param {d3.scale} yScale - The D3 scale for the Y-axis.
     */
    this.renderAllAxes = function (xScale, yScale) {
        if (!xScale || !yScale) {
            console.warn("GraphAxes.renderAllAxes: Missing X or Y scale for rendering.");
            return;
        }
        this.xAxisInstance.renderAxis(xScale, 'bottom', this.xAxisInstance.numberOfTicks);
        this.yAxisInstance.renderAxis(yScale, 'left', this.yAxisInstance.numberOfTicks);
    };

    /**
     * Renders grid lines for both X and Y axes.
     * @param {d3.scale} xScale - The D3 scale for the X-axis.
     * @param {d3.scale} yScale - The D3 scale for the Y-axis.
     */
    this.renderAllGrids = function (xScale, yScale) {
        if (!xScale || !yScale) {
            console.warn("GraphAxes.renderAllGrids: Missing X or Y scale for rendering grids.");
            return;
        }
        this.xAxisInstance.renderGridLines(xScale, 'bottom');
        this.yAxisInstance.renderGridLines(yScale, 'left');
    };
}

/**
 * Renders line series on the chart.
 * @param {GraphCanvas} parentCanvas - The parent GraphCanvas instance.
 */
function LineRenderer(parentCanvas) {
    let _seriesData; // Private variable to hold data
    const self = this; // Capture 'this' for nested functions

    this.parentCanvas = parentCanvas;
    this.isActive = true;
    this.lineInterpolation = 'linear'; // e.g., 'linear', 'monotone', 'step-before'
    this.strokeWidth = 2; // Thickness of the line

    /**
     * Initializes the line renderer with chart data.
     * @param {ChartDataModel} dataModel - The ChartDataModel instance.
     */
    this.configureData = function (dataModel) {
        if (this.isActive) {
            _seriesData = dataModel;
        }
    };

    /**
     * Draws the line series on the chart.
     * @param {d3.scale} xScale - The D3 scale for the X-axis.
     * @param {d3.scale} yScale - The D3 scale for the Y-axis.
     */
    this.drawLines = function (xScale, yScale) {
        if (!this.isActive || !_seriesData || !_seriesData.getProcessedData()) {
            return; // Do not draw if not active or data is missing
        }
        if (!this.parentCanvas || !this.parentCanvas.svgGroup) {
            console.error("LineRenderer: Parent canvas SVG group is not available.");
            return;
        }

        const d3LineGenerator = d3.svg.line()
            .interpolate(this.lineInterpolation)
            .x(d => xScale(d.x));

        // Adjust Y-axis mapping for stacked or unstacked data
        if (_seriesData.stackingEnabled) {
            d3LineGenerator.y(d => yScale(d.y0 + d.y));
        } else {
            d3LineGenerator.y(d => yScale(d.y));
        }

        // Iterate through each series and draw its line
        for (const currentSeries of _seriesData.getProcessedData()) {
            if (!currentSeries.values || currentSeries.values.length === 0) {
                continue; // Skip empty series
            }
            this.parentCanvas.svgGroup.append("path")
                .attr("class", "viz-chart-line")
                .style("stroke", currentSeries.color || '#000000') // Default to black if color is missing
                .style("stroke-width", this.strokeWidth)
                .attr("d", d3LineGenerator(currentSeries.values));
        }
    };
}

/**
 * Renders area series on the chart.
 * @param {GraphCanvas} parentCanvas - The parent GraphCanvas instance.
 */
function AreaRenderer(parentCanvas) {
    let _seriesData; // Private variable to hold data
    const self = this;

    this.parentCanvas = parentCanvas;
    this.isActive = false;
    this.areaInterpolation = 'linear';
    this.opacityEnabled = false;
    this.fillAlpha = 0.6;

    /**
     * Initializes the area renderer with chart data.
     * @param {ChartDataModel} dataModel - The ChartDataModel instance.
     */
    this.configureData = function (dataModel) {
        if (this.isActive) {
            _seriesData = dataModel;
        }
    };

    /**
     * Draws the area series on the chart.
     * @param {d3.scale} xScale - The D3 scale for the X-axis.
     * @param {d3.scale} yScale - The D3 scale for the Y-axis.
     */
    this.drawAreas = function (xScale, yScale) {
        if (!this.isActive || !_seriesData || !_seriesData.getProcessedData()) {
            return;
        }
        if (!this.parentCanvas || !this.parentCanvas.svgGroup) {
            console.error("AreaRenderer: Parent canvas SVG group is not available.");
            return;
        }

        const d3AreaGenerator = d3.svg.area()
            .interpolate(this.areaInterpolation)
            .x(d => xScale(d.x));

        // Adjust Y-axis mapping for stacked or unstacked areas
        if (_seriesData.stackingEnabled) {
            d3AreaGenerator.y0(d => yScale(d.y0));
            d3AreaGenerator.y1(d => yScale(d.y0 + d.y));
        } else {
            d3AreaGenerator.y0(this.parentCanvas.calculatePlotAreaHeight()); // Base at the bottom of the plot area
            d3AreaGenerator.y1(d => yScale(d.y));
        }

        // Iterate through each series and draw its area
        for (const currentSeries of _seriesData.getProcessedData()) {
            if (!currentSeries.values || currentSeries.values.length === 0) {
                continue;
            }
            const areaPath = this.parentCanvas.svgGroup.append("path")
                .attr("class", "viz-chart-area")
                .style("fill", currentSeries.color || '#cccccc')
                .attr("d", d3AreaGenerator(currentSeries.values));

            if (this.opacityEnabled) {
                areaPath.style('fill-opacity', this.fillAlpha);
            }
        }
    };
}

/**
 * Renders point markers on the chart and manages their tooltips.
 * @param {GraphCanvas} parentCanvas - The parent GraphCanvas instance.
 */
function PointRenderer(parentCanvas) {
    let _seriesData; // Private variable to hold data
    const self = this; // Capture 'this' for event handlers

    this.parentCanvas = parentCanvas;
    this.isActive = false;
    this.pointRadius = 4; // Default radius of points
    this.fillPoints = false; // Whether points should be filled or just outlined
    this.pointStrokeColor = '#333333'; // Default stroke color for points

    /**
     * Initializes the point renderer with chart data.
     * @param {ChartDataModel} dataModel - The ChartDataModel instance.
     */
    this.configureData = function (dataModel) {
        if (this.isActive) {
            _seriesData = dataModel;
        }
    };

    /**
     * Draws the point markers on the chart.
     * @param {d3.scale} xScale - The D3 scale for the X-axis.
     * @param {d3.scale} yScale - The D3 scale for the Y-axis.
     */
    this.drawPoints = function (xScale, yScale) {
        if (!this.isActive || !_seriesData || !_seriesData.getProcessedData()) {
            return;
        }
        if (!this.parentCanvas || !this.parentCanvas.svgGroup) {
            console.error("PointRenderer: Parent canvas SVG group is not available.");
            return;
        }

        // Helper to calculate point Y position, considering stacking
        const getPointY = (dataPoint) => {
            return _seriesData.stackingEnabled ? dataPoint.y0 + dataPoint.y : dataPoint.y;
        };

        // Iterate through each series and draw its points
        for (const currentSeries of _seriesData.getProcessedData()) {
            if (!currentSeries.values || currentSeries.values.length === 0) {
                continue;
            }

            // Bind data to circles and append them
            const pointsSelection = this.parentCanvas.svgGroup.selectAll(`.viz-chart-point-${currentSeries.label.replace(/\s/g, '-')}`)
                .data(currentSeries.values)
                .enter()
                .append("circle")
                .attr("class", `viz-chart-point viz-chart-point-${currentSeries.label.replace(/\s/g, '-')}`)
                .attr("cx", d => xScale(d.x))
                .attr("cy", d => yScale(getPointY(d)))
                .attr("r", this.pointRadius)
                .style("stroke", currentSeries.color || this.pointStrokeColor)
                .style("stroke-width", 1) // Consistent stroke width for points
                .on("mouseover", self.handleMouseOverPoint)
                .on("mouseout", self.handleMouseOutPoint);

            // Apply fill style
            if (this.fillPoints) {
                pointsSelection.attr("fill", currentSeries.color || '#ffffff');
            } else {
                pointsSelection.attr("fill", "white");
            }
        }
    };

    /**
     * Handles mouseover events on a point circle, displaying a tooltip.
     * @param {Object} dataPoint - The data associated with the hovered point.
     */
    this.handleMouseOverPoint = function (dataPoint) {
        if (!dataPoint) return;

        const currentCircle = d3.select(this);
        const tooltipElement = d3.select(".viz-tooltip");

        // Enlarge the circle
        currentCircle.transition().duration(200).attr("r", self.pointRadius * 1.5);

        // Display and fade in the tooltip
        tooltipElement.style("display", "block")
                      .style('opacity', 0)
                      .transition().delay(100).duration(300).style('opacity', 0.9);

        // Format date and update tooltip content
        const dateFormatter = d3.time.format("%Y-%m-%d %H:%M:%S"); // Consistent date format
        const formattedDate = dataPoint.x instanceof Date ? dateFormatter(dataPoint.x) : String(dataPoint.x);
        const displayValue = dataPoint.y !== undefined ? dataPoint.y.toFixed(2) : 'N/A'; // Format value

        tooltipElement.html(`
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Value:</strong> ${displayValue}</p>
        `);
    };

    /**
     * Handles mouseout events on a point circle, hiding the tooltip.
     */
    this.handleMouseOutPoint = function () {
        const currentCircle = d3.select(this);
        const tooltipElement = d3.select(".viz-tooltip");

        // Restore circle size
        currentCircle.transition().duration(200).attr("r", self.pointRadius);

        // Hide the tooltip
        tooltipElement.style("display", "none");
    };
}

/**
 * Renders bar series on the chart.
 * @param {GraphCanvas} parentCanvas - The parent GraphCanvas instance.
 */
function BarRenderer(parentCanvas) {
    this.parentCanvas = parentCanvas;
    let _processedData; // Private variable to hold data

    this.isActive = false;
    this.outlineEnabled = true;
    this.outlineThickness = 2;
    this.opacityEnabled = false;
    this.fillAlpha = 0.6;

    let totalSamples;     // Total number of data points along the X-axis
    let numGroups;        // Number of series/groups per data point
    let groupPadding = 20;  // Padding on the left and right of a group of bars
    let barSpacing = 5;     // Spacing between individual bars within a group

    let sampleGroupWidth;    // Width allocated for all bars and gaps for one X-axis sample
    let innerGroupBoxWidth;  // Width for all bars within one sample group (excluding outer padding)
    let individualBarWidth;  // Width of a single bar

    /**
     * Returns the calculated width for a single sample group.
     * @returns {number} The width in pixels.
     */
    this.getCalculatedSampleWidth = function () {
        return sampleGroupWidth;
    };

    /**
     * Initializes the bar renderer with chart data and calculates layout dimensions.
     * @param {ChartDataModel} dataModel - The ChartDataModel instance.
     */
    this.configureLayout = function (dataModel) {
        if (!this.isActive) return;
        if (!dataModel || !dataModel.getProcessedData()) {
            console.warn("BarRenderer.configureLayout: No valid data model provided.");
            return;
        }

        _processedData = dataModel;
        totalSamples = _processedData.getSampleCount();
        numGroups = _processedData.getGroupNames().length; // Use a dedicated method for groups

        if (totalSamples === 0 || numGroups === 0) {
            console.warn("BarRenderer.configureLayout: No samples or groups found in data.");
            return;
        }

        // Calculate bar dimensions
        sampleGroupWidth = this.parentCanvas.calculatePlotAreaWidth() / totalSamples;
        innerGroupBoxWidth = sampleGroupWidth - (2 * groupPadding);
        
        // Ensure individualBarWidth is positive
        individualBarWidth = Math.max(0, (innerGroupBoxWidth / numGroups) - barSpacing + (barSpacing / numGroups));

        // Adjust X-axis tick offset to center ticks with bar groups
        this.parentCanvas.coordinateSystem.xAxisInstance.axisShift = sampleGroupWidth / 2;
    };

    /**
     * Draws the bar series on the chart.
     * @param {d3.scale} xScale - The D3 scale for the X-axis.
     * @param {d3.scale} yScale - The D3 scale for the Y-axis.
     */
    this.drawBars = function (xScale, yScale) {
        if (!this.isActive || !_processedData || !_processedData.getProcessedData()) {
            return;
        }
        if (!this.parentCanvas || !this.parentCanvas.svgGroup) {
            console.error("BarRenderer: Parent canvas SVG group is not available.");
            return;
        }

        const dataGroups = _processedData.getGroupNames();
        const yMaxExtent = _processedData.yExtent()[1]; // Get max Y value for stacking reference

        for (const currentSeries of _processedData.getProcessedData()) {
            if (!currentSeries.values || currentSeries.values.length === 0) {
                continue;
            }

            const seriesGroupIndex = dataGroups.indexOf(currentSeries.group);
            if (seriesGroupIndex === -1) {
                console.warn(`BarRenderer: Series group '${currentSeries.group}' not found in identified groups.`);
                continue;
            }

            for (const dataPoint of currentSeries.values) {
                if (dataPoint.y === undefined || dataPoint.y === null) {
                    continue; // Skip points with no valid Y value
                }

                // Calculate X position for the bar
                let barXPosition = xScale(dataPoint.x) + groupPadding;
                barXPosition += (individualBarWidth + barSpacing) * seriesGroupIndex;

                // Calculate Y position and height for the bar
                // D3 uses top-left origin, so Y position is (plot height - height of bar)
                // For stacked bars, y0 is the base. For non-stacked, it's 0.
                const barHeight = yScale(yMaxExtent - dataPoint.y);
                const barYPosition = this.parentCanvas.calculatePlotAreaHeight() - yScale(dataPoint.y + (dataPoint.y0 || 0));

                const barElement = this.parentCanvas.svgGroup.append("rect")
                    .attr("class", "viz-bar-element")
                    .style("fill", currentSeries.color || '#999999')
                    .attr("x", barXPosition)
                    .attr("width", individualBarWidth)
                    .attr("y", barYPosition)
                    .attr("height", barHeight);

                if (this.outlineEnabled) {
                    barElement.style("stroke", currentSeries.color || '#999999');
                    barElement.style("stroke-width", this.outlineThickness);
                }
                if (this.opacityEnabled) {
                    barElement.style('fill-opacity', this.fillAlpha);
                }
            }
        }
    };
}

//----------------------------------------------------------------------------------------------------------------------

/**
 * Manages and processes chart data, including stacking and extent calculations.
 */
function ChartDataModel() {

    let _rawData = []; // Private storage for the raw data array
    let _xValueRange = [null, null]; // [min, max] for X-axis
    let _yValueRange = [null, null]; // [min, max] for Y-axis
    let _identifiedGroups = []; // List of unique group names

    this.stackingEnabled = false;
    this.stackByGroup = false; // Not fully implemented in original, keeping for Type III
    this.stackBaselineMethod = 'zero'; // 'zero', 'wiggle', 'expand', 'silhouette'

    /**
     * Loads and processes the initial data array.
     * @param {Array<Object>} dataArray - The raw data array, typically an array of series.
     */
    this.loadData = function (dataArray) {
        if (!dataArray || !Array.isArray(dataArray)) {
            console.error("ChartDataModel.loadData: Invalid or empty data array provided.");
            _rawData = [];
            return;
        }

        _rawData = JSON.parse(JSON.stringify(dataArray)); // Deep copy to prevent mutation of original
        this._processDateStrings();
        this._identifyGroups();

        if (this.stackingEnabled) {
            this._applyStacking();
        }

        this._determineXRange();
        this._determineYRange();
    };

    /**
     * Returns the processed data array.
     * @returns {Array<Object>} The data array.
     */
    this.getProcessedData = function () {
        return _rawData;
    };

    /**
     * Returns the number of unique sample points (e.g., dates) across all series.
     * Assumes all series have the same number of samples.
     * @returns {number} The count of samples.
     */
    this.getSampleCount = function () {
        if (_rawData.length === 0 || !_rawData[0].values) {
            return 0;
        }
        return _rawData[0].values.length;
    };

    /**
     * Returns the list of unique group names identified in the data.
     * @returns {Array<string>} An array of group names.
     */
    this.getGroupNames = function() {
        return _identifiedGroups;
    };

    /**
     * Returns the calculated X-axis extent [min, max].
     * @returns {Array<Date|number>} The X-axis range.
     */
    this.xExtent = function () {
        return _xValueRange;
    };

    /**
     * Returns the calculated Y-axis extent [min, max].
     * @returns {Array<number>} The Y-axis range.
     */
    this.yExtent = function () {
        return _yValueRange;
    };

    /**
     * Internal: Parses date strings in the data into Date objects.
     * Assumes a specific date format.
     */
    this._processDateStrings = function () {
        const d3DateParser = d3.time.format("%Y-%m-%d %H:%M:%S").parse;
        _rawData.forEach(series => {
            if (!series.values) return;
            series.values.forEach(dataPoint => {
                if (typeof dataPoint.x === 'string') {
                    dataPoint.x = d3DateParser(dataPoint.x);
                }
            });
        });
    };

    /**
     * Internal: Identifies and stores unique group names from the series data.
     */
    this._identifyGroups = function () {
        const groups = new Set();
        _rawData.forEach(series => {
            if (series.group) {
                groups.add(series.group);
            }
        });
        _identifiedGroups = Array.from(groups);
    };

    /**
     * Internal: Applies stacking to the data using D3's stack layout.
     */
    this._applyStacking = function () {
        const stackLayout = d3.layout.stack()
                                .values(d => d.values)
                                .offset(this.stackBaselineMethod); // 'zero', 'wiggle', 'expand', 'silhouette'

        // Transform data into the format expected by d3.layout.stack
        // Each object in the array should represent a 'layer' (series)
        // and have a 'values' property which is an array of {x, y} objects.
        const stackData = _rawData.map(series => ({
            key: series.label, // Or series.group if stacking by group
            values: series.values.map(d => ({ x: d.x, y: d.y }))
        }));

        const stackedLayers = stackLayout(stackData);

        // Map the stacked data back to our original _rawData structure
        _rawData.forEach((series, seriesIndex) => {
            series.values.forEach((dataPoint, dataPointIndex) => {
                // d3.layout.stack adds y0 (baseline) and updates y (value)
                dataPoint.y0 = stackedLayers[seriesIndex].values[dataPointIndex].y0;
                dataPoint.y = stackedLayers[seriesIndex].values[dataPointIndex].y;
            });
        });
    };

    /**
     * Internal: Determines the minimum and maximum values for the X-axis.
     */
    this._determineXRange = function () {
        let minX = Infinity;
        let maxX = -Infinity;

        _rawData.forEach(series => {
            if (!series.values) return;
            series.values.forEach(dataPoint => {
                if (dataPoint.x) {
                    minX = Math.min(minX, dataPoint.x);
                    maxX = Math.max(maxX, dataPoint.x);
                }
            });
        });
        _xValueRange = [minX, maxX];
    };

    /**
     * Internal: Determines the minimum and maximum values for the Y-axis,
     * considering stacking if enabled.
     */
    this._determineYRange = function () {
        let minY = Infinity;
        let maxY = -Infinity;

        _rawData.forEach(series => {
            if (!series.values) return;
            series.values.forEach(dataPoint => {
                if (dataPoint.y !== undefined && dataPoint.y !== null) {
                    if (this.stackingEnabled && dataPoint.y0 !== undefined) {
                        // For stacked charts, extent is from 0 to sum of y+y0
                        minY = Math.min(minY, dataPoint.y0);
                        maxY = Math.max(maxY, dataPoint.y0 + dataPoint.y);
                    } else {
                        // For non-stacked, just min/max of y values
                        minY = Math.min(minY, dataPoint.y);
                        maxY = Math.max(maxY, dataPoint.y);
                    }
                }
            });
        });

        // Ensure Y-axis always starts at 0 if all values are positive or stacking from zero
        if (minY > 0 && this.stackBaselineMethod === 'zero') {
            minY = 0;
        }
        if (maxY < 0 && this.stackBaselineMethod === 'zero') {
            maxY = 0;
        }

        _yValueRange = [minY, maxY];
    };
}