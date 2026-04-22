window.ChartKit = window.ChartKit || Object.create(null);

ChartKit.resolveMetricId = function (metricKey) {
    // Defines human-readable names for various performance metrics.
    const metricLabels = {
        pmu: "Peak Memory Usage",
        mu: "Memory Usage",
        cpu: "Processor Time",
        wt: "Elapsed Time",
        epmu: "Exclusive Peak Memory Usage",
        emu: "Exclusive Memory Usage",
        ecpu: "Exclusive Processor Time",
        ewt: "Exclusive Elapsed Time"
    };

    // Check if the provided key exists in our predefined labels.
    if (!Object.prototype.hasOwnProperty.call(metricLabels, metricKey)) {
        return "Unidentified Metric";
    }

    return metricLabels[metricKey];
};

/**
 * Provides a cyclical color palette for chart elements.
 */
ChartKit.colorSchemeProvider = function () {
    // A collection of distinct hexadecimal color values.
    const hexColorArray = [
        '#d46245', // Warm Red
        '#59bdd2', // Cool Blue
        '#637964', // Forest Green
        '#ffe85e', // Bright Yellow
        '#b63c71', // Deep Magenta
        '#e9814f', // Burnt Orange
        '#e3b7b3', // Pastel Pink
        '#8A2BE2'  // Blue Violet (new color added)
    ];
    // Returns a D3 ordinal scale configured with the defined color range.
    return d3.scale.ordinal().range(hexColorArray);
};

/**
 * Formats a Date object into a standard SQL-like datetime string pattern.
 * The format is 'YYYY-MM-DD HH:MM:SS'.
 */
ChartKit.sqlDateTimeFormatter = (function() {
    // Internal D3 time format function with a specific pattern.
    const internalFormatter = d3.time.format('%Y-%m-%d %H:%M:%S');
    return function(dateObject) {
        // Basic validation: ensure input is a Date object.
        if (!(dateObject instanceof Date)) {
            console.warn("Input for sqlDateTimeFormatter is not a Date object.", dateObject);
            return null;
        }
        return internalFormatter(dateObject);
    };
})();

/**
 * Stores the currently active dynamic date/time formatting string,
 * which adapts based on the granularity of data displayed.
 */
ChartKit.currentDynamicDateFormat = '%Y-%m-%d';

/**
 * Formats a given numerical value by adding thousand separators and
 * ensuring a specified number of decimal places.
 *
 * @param {number|string} value The number (or string convertible to number) to format.
 * @param {number} [precision=2] The desired number of digits after the decimal point.
 * @returns {string} The formatted number as a string.
 */
ChartKit.numericFormatter = function (value, precision) {
    // Ensure precision is a non-negative integer, default to 2.
    let displayPrecision = Math.max(0, parseInt(precision, 10) || 2);

    // Guard clause for invalid number inputs.
    const parsedValue = Number(value);
    if (isNaN(parsedValue)) {
        return "N/A";
    }

    const thousandSeparatorChar = ',';
    const decimalPointChar = '.';

    // Get the fixed-point string representation.
    let formattedString = parsedValue.toFixed(displayPrecision);

    // Early exit if the number is small and doesn't need thousand separation.
    if (Math.abs(parsedValue) < 1000 && formattedString.indexOf(thousandSeparatorChar) === -1) {
        return formattedString;
    }

    // Split into integer and fractional parts.
    const stringParts = formattedString.split(decimalPointChar);
    let integerSegment = stringParts[0];

    // Regex for inserting thousand separators.
    integerSegment = integerSegment.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparatorChar);

    stringParts[0] = integerSegment;
    return stringParts.join(decimalPointChar);
};


ChartKit.addLegendEntry = function (chartSvgContainer, legendText, chartHeight, chartMargins, itemColor) {
    // Abort if no descriptive text is provided for the legend item.
    if (legendText === null || typeof legendText === 'undefined' || legendText.trim() === '') {
        return;
    }

    // Determine the vertical placement for the legend item.
    // An adjustment of -4 is made to align text baselines.
    const verticalPosition = chartHeight + chartMargins.bottom - 4;

    // Query for all previously rendered legend groups to calculate horizontal offset.
    const existingLegendNodes = chartSvgContainer.selectAll('.legend-group-item');
    let horizontalPosition = 0;
    const LEGEND_SPACING = 25; // New constant for spacing between legend items

    // Calculate the horizontal offset based on the position of the last legend item.
    // This ensures new items are appended sequentially.
    if (!existingLegendNodes.empty()) {
        const lastNode = existingLegendNodes.nodes().pop();
        if (lastNode) {
            const lastNodeBoundingBox = lastNode.getBBox();
            horizontalPosition = lastNodeBoundingBox.x + lastNodeBoundingBox.width + LEGEND_SPACING;
        }
    }

    // Create a new SVG group element for the current legend item.
    const legendGroupElement = chartSvgContainer.append('g')
        .attr('class', 'legend-group-item');

    // Append a small colored circle (symbol) to represent the data series.
    legendGroupElement.append('circle')
        .attr('fill', itemColor)
        .attr('r', 3.5)
        .attr('cx', 0)
        .attr('cy', -6);

    // Append the descriptive text for the legend item.
    legendGroupElement.append('text')
        .attr('x', 6)
        .attr('y', 0)
        .text(legendText);

    // Position the entire legend group using a transform attribute.
    legendGroupElement.attr('transform', `translate(${horizontalPosition}, ${verticalPosition})`);
};

/**
 * Attaches a dynamic, interactive tooltip to specified D3 selections.
 * The tooltip appears on mouseenter and disappears on mouseleave.
 *
 * @param {d3.selection} chartWrapperElement The D3 selection of the chart's main container.
 * @param {object} tooltipConfig Configuration object for the tooltip.
 * @param {Function} tooltipConfig.formatter Function to generate tooltip HTML content.
 * @param {Function} tooltipConfig.positioner Function to calculate tooltip screen coordinates.
 * @param {d3.selection} tooltipConfig.bindTo D3 selection of elements to which the tooltip will be bound.
 */
ChartKit.attachInteractiveTooltip = function (chartWrapperElement, tooltipConfig) {
    // Validate essential configuration parameters for the tooltip.
    if (
        !tooltipConfig ||
        typeof tooltipConfig.formatter !== 'function' ||
        typeof tooltipConfig.positioner !== 'function' ||
        !tooltipConfig.bindTo ||
        tooltipConfig.bindTo.empty()
    ) {
        // Throw a standard Error object for invalid configuration.
        throw new Error('Tooltip configuration requires formatter, positioner, and bindTo options to be functions/selections.');
    }

    // Helper function to prevent event propagation, useful for stopping tooltip flickering.
    function preventEventPropagation() {
        if (d3.event) {
            d3.event.stopPropagation();
        }
    }

    /**
     * Initializes or retrieves the global tooltip DOM structure.
     * It ensures there's only one tooltip element in the document body.
     * @param {d3.selection} targetBodySelection D3 selection of the document body.
     * @returns {{frame: d3.selection, content: d3.selection}} Object containing the tooltip's frame and content elements.
     */
    function initiateTooltipStructure(targetBodySelection) {
        let existingPopoverElement = targetBodySelection.select('#chart-utility-popover');
        let tooltipFrameElement, tooltipContentArea;

        if (existingPopoverElement.empty()) {
            tooltipFrameElement = targetBodySelection.append('div');

            tooltipFrameElement.attr('class', 'chart-popover-panel top')
                .attr('id', 'chart-utility-popover')
                .append('div').attr('class', 'popover-arrow-indicator');

            tooltipContentArea = tooltipFrameElement.append('div')
                .attr('class', 'popover-body-content');

            // Attach event listeners to prevent the tooltip from disappearing prematurely.
            tooltipFrameElement.on('mouseleave', preventEventPropagation);
        } else {
            tooltipFrameElement = existingPopoverElement;
            tooltipContentArea = existingPopoverElement.select('.popover-body-content');
        }
        return { frame: tooltipFrameElement, content: tooltipContentArea };
    }

    // Create or retrieve the global tooltip instance, always attached to the document body.
    const activeTooltipInstance = initiateTooltipStructure(d3.select(document.body));

    /**
     * Hides the tooltip and deregisters the global mouseleave listener.
     */
    function concealTooltip() {
        activeTooltipInstance.frame.transition().duration(200).style('opacity', 0).style('display', 'none');
        d3.select(document).on('mouseleave', null);
    }

    // Bind the tooltip behavior to the specified elements.
    tooltipConfig.bindTo.on('mouseenter', function (dataItem, index) {
        let currentTop, currentLeft;
        let popoverHeight, popoverWidth;
        let generatedContent, calculatedPosition;

        // Generate and update the tooltip's HTML content.
        generatedContent = tooltipConfig.formatter.call(this, dataItem, index);
        activeTooltipInstance.content.html(generatedContent);

        // Make the tooltip visible initially to calculate its dimensions.
        activeTooltipInstance.frame.style({
            display: 'block',
            opacity: 1
        });

        // Calculate the desired screen position for the tooltip.
        calculatedPosition = tooltipConfig.positioner.call(this, dataItem, index, activeTooltipInstance);

        // Retrieve the actual rendered dimensions of the tooltip.
        popoverWidth = parseInt(activeTooltipInstance.frame.style('width'), 10);
        popoverHeight = parseInt(activeTooltipInstance.frame.style('height'), 10);

        // Get the bounding box of the chart's parent container for offset calculations.
        const parentContainerNode = chartWrapperElement.node();
        const arrowHeight = 10;
        const arrowOffsetFactor = 5;

        // Recalculate final tooltip position based on its actual dimensions.
        currentTop = parentContainerNode.offsetTop + calculatedPosition.y - (popoverHeight / 2) - (arrowHeight - 3);
        currentLeft = parentContainerNode.offsetLeft + calculatedPosition.x - (popoverWidth / 2) + arrowOffsetFactor;

        // Apply the final positioning styles.
        activeTooltipInstance.frame.style({
            top: `${currentTop}px`,
            left: `${currentLeft}px`
        });

        // Register a global mouseleave listener to hide the tooltip when moving off the document.
        d3.select(document).on('mouseleave', concealTooltip);
    });

    // Add a 'mouseleave' event listener to the bound elements to hide the tooltip.
    tooltipConfig.bindTo.on('mouseleave', concealTooltip);
};

/**
 * Renders a D3-based donut chart within a specified container.
 *
 * @param {string} targetElementSelector CSS selector for the HTML element where the chart will be placed.
 * @param {Array<Object>} chartData An array of objects, each containing 'name' and 'value' keys.
 * @param {Object} [chartSettings={}] Optional configuration for the chart.
 * @param {number} [chartSettings.height=450] Desired height of the chart in pixels.
 * @param {number} [chartSettings.width=450] Desired width of the chart in pixels.
 * @param {string} [chartSettings.valuePostfix=''] String to append to formatted values in the tooltip.
 */
ChartKit.createDonutChart = function (targetElementSelector, chartData, chartSettings) {
    const activeChartSettings = chartSettings || {};
    const chartHeightPx = activeChartSettings.height || 450;
    const chartWidthPx = activeChartSettings.width || 450;
    const outerChartRadius = Math.min(chartWidthPx, chartHeightPx) / 2;
    const innerChartRadius = outerChartRadius * 0.4; // Added inner radius for donut chart effect

    // Guard clause for empty or invalid data
    if (!chartData || chartData.length === 0 || !Array.isArray(chartData)) {
        console.warn("No valid data provided for donut chart. Rendering aborted.");
        d3.select(targetElementSelector).html("<p>No data available to display.</p>");
        return;
    }

    // D3 arc path generator for the donut segments.
    const arcGenerator = d3.svg.arc()
        .outerRadius(outerChartRadius - 12)
        .innerRadius(innerChartRadius);

    // D3 pie layout generator, sorting is disabled as data is assumed pre-sorted or order agnostic.
    const pieLayoutGenerator = d3.layout.pie()
        .sort(null)
        .value(function (d) {
            return d.value;
        });

    // Obtain the color scale provider from ChartKit.
    const dataColorScale = ChartKit.colorSchemeProvider();

    // Select the target container and append the main SVG element.
    const containerSelection = d3.select(targetElementSelector);

    const mainSvgElement = containerSelection.append('svg')
        .attr('width', chartWidthPx)
        .attr('height', chartHeightPx)
        .append('g')
        .attr('transform', `translate(${chartWidthPx / 2}, ${chartHeightPx / 2})`);

    // Bind data to create the individual arc groups.
    const arcGroupSelection = mainSvgElement.selectAll('.donut-slice')
        .data(pieLayoutGenerator(chartData))
        .enter().append('g')
        .attr('class', 'donut-slice');

    // Append path elements for each donut slice.
    arcGroupSelection.append('path')
        .attr('d', arcGenerator)
        .style('fill', function (d) {
            // Assign color based on the name of the data item for consistency.
            return dataColorScale(d.data.name);
        })
        .style('stroke', '#fff')
        .style('stroke-width', '1px');

    // Attach the interactive tooltip functionality.
    ChartKit.attachInteractiveTooltip(containerSelection, {
        bindTo: arcGroupSelection,
        positioner: function (dataPoint, dataIndex) {
            const centroidPosition = arcGenerator.centroid(dataPoint, dataIndex);

            // Recalculate position relative to the chart's overall container.
            const sliceXCoord = centroidPosition[0] + (chartWidthPx / 2);
            const sliceYCoord = centroidPosition[1] + (chartHeightPx / 2);
            return { x: sliceXCoord, y: sliceYCoord };
        },
        formatter: function (dataPoint, dataIndex) {
            // Format tooltip label with metric name, value, and optional postfix.
            const formattedValue = ChartKit.numericFormatter(dataPoint.data.value, 0);
            return `<strong>${dataPoint.data.name}</strong><br />${formattedValue} ${activeChartSettings.valuePostfix || ''}`;
        }
    });
};

/**
 * Renders a D3-based column (bar) chart within a designated HTML element.
 *
 * @param {string} targetDomElement CSS selector for the chart's parent container.
 * @param {Array<Object>} graphData An array of objects, each typically having 'name' and 'value' properties.
 * @param {Object} [graphConfig={}] Optional settings for chart customization.
 * @param {number} [graphConfig.height=420] Height of the plotting area in pixels.
 * @param {number} [graphConfig.width=420] Width of the plotting area in pixels.
 * @param {string} [graphConfig.valuePostfix=''] Suffix to append to values in tooltips.
 */
ChartKit.generateBarGraph = function (targetDomElement, graphData, graphConfig) {
    const activeGraphConfig = graphConfig || {};
    const graphMargins = { top: 25, right: 25, bottom: 35, left: 55 };
    const drawAreaHeight = activeGraphConfig.height || 420;
    const drawAreaWidth = activeGraphConfig.width || 420;

    // Guard clause for invalid input data.
    if (!graphData || graphData.length === 0 || !Array.isArray(graphData)) {
        console.warn("Input data for bar graph is empty or invalid. Chart not rendered.");
        d3.select(targetDomElement).html("<p>No data to visualize in bar chart.</p>");
        return;
    }

    // Define the Y-axis scale (linear for value).
    const yScaleLinear = d3.scale.linear()
        .range([drawAreaHeight, 0]);

    // Define the X-axis scale (ordinal for categories).
    const xScaleOrdinal = d3.scale.ordinal()
        .rangeRoundBands([0, drawAreaWidth], 0.15);

    // Configure the Y-axis renderer.
    const verticalAxisRenderer = d3.svg.axis()
        .scale(yScaleLinear)
        .tickFormat(d3.format('.2s'))
        .tickSize(7, 7, 0)
        .orient("left");

    // Configure the X-axis renderer.
    const horizontalAxisRenderer = d3.svg.axis()
        .scale(xScaleOrdinal)
        .tickSize(7, 7, 0)
        .orient("bottom");

    // Select the target container and append the SVG element.
    const containerSelection = d3.select(targetDomElement);

    const chartRootSvg = containerSelection.append("svg")
        .attr("width", drawAreaWidth + graphMargins.left + graphMargins.right)
        .attr("height", drawAreaHeight + graphMargins.top + graphMargins.bottom)
        .append("g")
        .attr("transform", `translate(${graphMargins.left}, ${graphMargins.top})`);

    // Set the domains for the scales based on the data.
    xScaleOrdinal.domain(graphData.map(function (d) { return d.name; }));
    yScaleLinear.domain([0, d3.max(graphData, function (d) { return d.value; }) * 1.05]); // Added 5% buffer to max for y-axis

    // Append the X-axis to the SVG.
    chartRootSvg.append("g")
        .attr("class", "chart-axis horizontal-axis")
        .attr("transform", `translate(0, ${drawAreaHeight})`)
        .call(horizontalAxisRenderer);

    // Append the Y-axis to the SVG.
    chartRootSvg.append("g")
        .attr("class", "chart-axis vertical-axis")
        .call(verticalAxisRenderer);

    // Create and position the bar elements.
    chartRootSvg.selectAll('.data-bar-item')
        .data(graphData)
        .enter().append("rect")
        .attr("class", "data-bar-item")
        .attr("x", function (d) { return xScaleOrdinal(d.name); })
        .attr("width", xScaleOrdinal.rangeBand())
        .attr("y", function (d) { return yScaleLinear(d.value); })
        .attr("height", function (d) { return drawAreaHeight - yScaleLinear(d.value); })
        .style('fill', '#4682b4'); // Added a default fill color for bars

    // Attach the interactive tooltip to the bars.
    ChartKit.attachInteractiveTooltip(containerSelection, {
        bindTo: chartRootSvg.selectAll('.data-bar-item'),
        positioner: function (dataItem, dataIndex) {
            const barBoundingBox = this.getBBox();
            // Calculate tooltip x, y based on bar's center-top.
            const tooltipX = barBoundingBox.x + (barBoundingBox.width / 2);
            const tooltipY = barBoundingBox.y;
            return { x: tooltipX, y: tooltipY };
        },
        formatter: function (dataItem, dataIndex) {
            // Format tooltip content.
            const formattedNumericValue = ChartKit.numericFormatter(dataItem.value, 0);
            return `<strong>${dataItem.name}</strong><br />${formattedNumericValue} ${activeGraphConfig.valuePostfix || ''}`;
        }
    });
};

/**
 * Generates a D3-powered single or multi-series line chart with interactive tooltips.
 *
 * @param {string} chartParentSelector CSS selector for the HTML container element.
 * @param {Array<Object>} seriesData An array of data objects. Each object must contain
 *                                    the x-axis key and all series keys specified in `chartConfiguration.series`.
 * @param {Object} chartConfiguration Configuration object for the chart.
 * @param {string} chartConfiguration.xAxis The data key to be used for the x-axis (time-based).
 * @param {string|Array<string>} chartConfiguration.series One or more data keys representing the y-axis series.
 * @param {string} [chartConfiguration.title] Optional title for the chart.
 * @param {Array<string>} [chartConfiguration.legendLabels] Labels for each series in the legend.
 * @param {string} [chartConfiguration.valuePostfix=''] Suffix for values displayed in tooltips.
 * @param {number} [chartConfiguration.height] Explicit height for the chart drawing area.
 * @param {number} [chartConfiguration.width] Explicit width for the chart drawing area.
 */
ChartKit.renderLineChart = function (chartParentSelector, seriesData, chartConfiguration) {
    const activeChartConfig = chartConfiguration || {};
    if (!activeChartConfig.xAxis || !activeChartConfig.series) {
        throw new Error('Line chart configuration requires both `xAxis` and `series` keys.');
    }

    const chartContainerSelection = d3.select(chartParentSelector);

    // Define layout padding for the chart.
    const layoutPadding = { top: 35, right: 25, bottom: 45, left: 60 };
    const defaultHeight = 450;
    const defaultWidth = 800;

    const plottingHeight = activeChartConfig.height || (parseInt(chartContainerSelection.style('height'), 10) || defaultHeight) - layoutPadding.top - layoutPadding.bottom;
    const plottingWidth = activeChartConfig.width || (parseInt(chartContainerSelection.style('width'), 10) || defaultWidth) - layoutPadding.left - layoutPadding.right;

    // Ensure series is an array.
    if (!Array.isArray(activeChartConfig.series)) {
        activeChartConfig.series = [activeChartConfig.series];
    }

    // Guard clause for empty data.
    if (!seriesData || seriesData.length === 0 || !Array.isArray(seriesData)) {
        console.warn("No data provided for line chart. Rendering aborted.");
        chartContainerSelection.html("<p>No data available to display in line chart.</p>");
        return;
    }

    // Pre-process data: convert X-axis values to Date objects.
    const processedSeriesData = seriesData.map(function (dataPoint) {
        // If the x-axis value is already a Date object, return as is.
        if (dataPoint[activeChartConfig.xAxis] instanceof Date) {
            return dataPoint;
        }

        const xValueString = String(dataPoint[activeChartConfig.xAxis]);
        let dateToParse;
        let timeComponentExists = xValueString.includes(":");

        if (timeComponentExists) {
            // Attempt to parse with full date-time format.
            const dateTimeParser = d3.time.format('%Y-%m-%d %H:%M:%S');
            dateToParse = dateTimeParser.parse(xValueString);
            ChartKit.currentDynamicDateFormat = '%H:%M:%S';
        } else {
            // Attempt to parse with date-only format.
            const dateOnlyParser = d3.time.format('%Y-%m-%d');
            dateToParse = dateOnlyParser.parse(xValueString);
            ChartKit.currentDynamicDateFormat = '%Y-%m-%d';
        }

        // Fallback or error handling for parsing failure.
        if (!dateToParse) {
            console.error("Failed to parse date for line chart:", xValueString);
            dataPoint[activeChartConfig.xAxis] = new Date(0);
        } else {
            dataPoint[activeChartConfig.xAxis] = dateToParse;
        }
        return dataPoint;
    });

    // Determine the extent (min and max) of the x-axis (time) domain.
    const domainExtentX = d3.extent(processedSeriesData, function (d) {
        return d[activeChartConfig.xAxis];
    });

    // Define the X-axis scale (time scale for date objects).
    const xScaleTime = d3.time.scale()
        .range([0, plottingWidth])
        .domain(domainExtentX);

    // Calculate maximum values across all series to set the Y-axis domain.
    const allSeriesMaxValues = [];
    activeChartConfig.series.forEach(function (seriesKey) {
        const seriesMax = d3.max(processedSeriesData, function (d) {
            return d[seriesKey];
        });
        allSeriesMaxValues.push(seriesMax || 0);
    });
    const valueDomainY = [0, d3.max(allSeriesMaxValues) * 1.1]; // Added 10% buffer

    // Define the Y-axis scale (linear for values).
    const yScaleLinear = d3.scale.linear()
        .range([plottingHeight, 0])
        .domain(valueDomainY);

    // Configure the date formatter for the X-axis ticks.
    const axisDateDisplayFormatter = d3.time.format(ChartKit.currentDynamicDateFormat);

    // Configure the horizontal (X) axis renderer.
    const horizontalTimeAxis = d3.svg.axis()
        .scale(xScaleTime)
        .tickFormat(function (dateValue) {
            return axisDateDisplayFormatter(dateValue);
        })
        .tickSize(10, 7, 0)
        .orient('bottom');

    // Adjust the number of X-axis ticks to fit labels without overlap.
    const minTickLabelWidth = 80;
    horizontalTimeAxis.ticks(Math.max(2, Math.floor(plottingWidth / minTickLabelWidth)));

    // Configure the vertical (Y) axis renderer.
    let verticalValueAxis = d3.svg.axis()
        .scale(yScaleLinear)
        .tickFormat(d3.format('.2s'))
        .tickSize(7, 7, 0)
        .orient("left");

    // Dynamically adjust Y-axis tick count if space is limited.
    const minTickHeight = 20;
    if (plottingHeight / minTickHeight < 10) {
        verticalValueAxis = verticalValueAxis.ticks(Math.floor(plottingHeight / minTickHeight));
    }

    // Append the main SVG element to the container.
    const mainPlotAreaSvg = chartContainerSelection.append("svg")
        .attr("width", plottingWidth + layoutPadding.left + layoutPadding.right)
        .attr("height", plottingHeight + layoutPadding.top + layoutPadding.bottom)
        .append("g")
        .attr("transform", `translate(${layoutPadding.left}, ${layoutPadding.top})`);

    // Add X-axis to the plot area.
    mainPlotAreaSvg.append("g")
        .attr("class", "chart-axis time-axis")
        .attr("transform", `translate(0, ${plottingHeight})`)
        .call(horizontalTimeAxis);

    // Add Y-axis to the plot area.
    mainPlotAreaSvg.append("g")
        .attr("class", "chart-axis value-axis")
        .call(verticalValueAxis);

    // Add optional chart title.
    if (activeChartConfig.title) {
        mainPlotAreaSvg.append('text')
            .attr('y', 15)
            .attr('x', plottingWidth / 2)
            .attr('class', 'chart-title')
            .style('text-anchor', 'middle')
            .text(activeChartConfig.title)
            .attr('transform', `translate(0, ${layoutPadding.top * -1})`);
    }

    // Add grid lines for better readability.
    mainPlotAreaSvg.append("g")
        .attr("class", "grid-lines x-grid")
        .attr("transform", `translate(0, ${plottingHeight})`)
        .call(horizontalTimeAxis.tickSize(-plottingHeight, 0, 0).tickFormat(""));

    mainPlotAreaSvg.append("g")
        .attr("class", "grid-lines y-grid")
        .call(verticalValueAxis.tickSize(-plottingWidth, 0, 0).tickFormat(""));


    const lineColorPalette = ChartKit.colorSchemeProvider();

    /**
     * Helper function to draw a single line series on the chart.
     * @param {number} seriesIndex Index of the current series.
     * @param {string} seriesKey The data key for this series.
     */
    function plotSingleLineSeries(seriesIndex, seriesKey) {
        const linePathGenerator = d3.svg.line()
            .x(function (d) { return xScaleTime(d[activeChartConfig.xAxis]); })
            .y(function (d) { return yScaleLinear(d[seriesKey]); })
            .interpolate("cardinal");

        mainPlotAreaSvg.append("path")
            .datum(processedSeriesData)
            .attr("class", `chart-line series-${seriesIndex}`)
            .style('stroke', lineColorPalette(seriesIndex))
            .style('stroke-width', '2px')
            .style('fill', 'none')
            .attr("d", linePathGenerator);
    }

    /**
     * Helper function to render individual data points as circles.
     * @param {number} seriesIndex Index of the current series.
     * @param {string} seriesKey The data key for this series.
     */
    function renderDataPoints(seriesIndex, seriesKey) {
        const pointGroup = mainPlotAreaSvg.append('g')
            .attr('class', `data-points series-points-${seriesIndex}`);

        const dataCircles = pointGroup.selectAll('circle')
            .data(processedSeriesData)
            .enter().append('circle')
            .attr('class', 'data-point-circle')
            .attr('cx', function (d) { return xScaleTime(d[activeChartConfig.xAxis]); })
            .attr('cy', function (d) { return yScaleLinear(d[seriesKey]); })
            .attr('r', 4)
            .style('fill', lineColorPalette(seriesIndex))
            .style('stroke', '#fff')
            .style('stroke-width', '1.5px');

        // Attach tooltip to each data point.
        ChartKit.attachInteractiveTooltip(chartContainerSelection, {
            bindTo: dataCircles,
            positioner: function (d, i) {
                const circleBoundingBox = this.getBBox();
                return {
                    x: circleBoundingBox.x + circleBoundingBox.width / 2,
                    y: circleBoundingBox.y + circleBoundingBox.height / 2
                };
            },
            formatter: function (d, i) {
                const formattedValue = ChartKit.numericFormatter(d[seriesKey], 2);
                const formattedDate = axisDateDisplayFormatter(d[activeChartConfig.xAxis]);
                return `<strong>${activeChartConfig.legendLabels ? activeChartConfig.legendLabels[seriesIndex] : seriesKey}</strong><br/>` +
                       `Date: ${formattedDate}<br/>` +
                       `Value: ${formattedValue} ${activeChartConfig.valuePostfix || ''}`;
            }
        });
    }

    // Iterate through each series to draw lines, points, and legends.
    activeChartConfig.series.forEach(function (seriesKey, index) {
        plotSingleLineSeries(index, seriesKey);
        renderDataPoints(index, seriesKey);

        // Add legend entry if labels are provided.
        if (activeChartConfig.legendLabels && activeChartConfig.legendLabels[index]) {
            ChartKit.addLegendEntry(
                mainPlotAreaSvg,
                activeChartConfig.legendLabels[index],
                plottingHeight,
                layoutPadding,
                lineColorPalette(index)
            );
        }
    });
};