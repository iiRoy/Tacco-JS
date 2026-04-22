function createTimeSeriesVisualization(inputObservations, visualConfig) {
    // --- Initial Setup and Validation ---

    // Ensure the D3 charting library is available.
    if (typeof d3 === 'undefined') {
        console.error("Critical error: D3.js library not found. Please ensure it's loaded before creating the visualization.");
        return;
    }

    // Establish default configuration settings and merge with user-provided options.
    const defaultSettings = {
        targetContainer: 'body', // CSS selector for the SVG parent element
        dateNavigatorSelector: null, // CSS selector for the date selection widget
        selectionCallback: () => {}, // Function to call when a data point is selected
        dateRangeFilter: {
            startDate: null,
            endDate: null
        }
    };
    const activeConfig = { ...defaultSettings, ...visualConfig };

    // Validate the target container for the SVG.
    const primarySvgHost = d3.select(activeConfig.targetContainer);
    if (primarySvgHost.empty()) {
        console.error(`Visualization target container "${activeConfig.targetContainer}" not found. Chart cannot be rendered.`);
        return;
    }

    // Validate input data.
    if (!Array.isArray(inputObservations) || inputObservations.length === 0) {
        console.warn("No data records provided for the time series visualization. Chart will be empty.");
        // We can still render an empty chart, but provide a warning.
    }

    // --- Core Dimensions and Layout ---

    // Define the fixed canvas dimensions for the SVG.
    const CHART_CANVAS_WIDTH = 500;
    const CHART_CANVAS_HEIGHT = 70;

    // Define internal margins that separate the plot area from the SVG edges.
    const chartLayoutMargins = {
        top: 16,
        bottom: 15,
        left: 15,
        right: 15
    };

    // Calculate the effective width and height available for the data plot.
    const actualPlotWidth = CHART_CANVAS_WIDTH - (chartLayoutMargins.left + chartLayoutMargins.right);
    const actualPlotHeight = CHART_CANVAS_HEIGHT - (chartLayoutMargins.top + chartLayoutMargins.bottom);

    // --- Data Preparation ---

    // Create a mutable copy of the input observations for filtering.
    let currentObservations = [...inputObservations];

    // Apply date filtering if specified in the configuration.
    const { startDate, endDate } = activeConfig.dateRangeFilter;
    if (startDate instanceof Date && endDate instanceof Date) {
        currentObservations = currentObservations.filter(observation => {
            // Ensure the observation's date is a Date object for reliable comparison.
            const observationDate = (observation.date instanceof Date) ? observation.date : new Date(observation.date);
            return observationDate >= startDate && observationDate <= endDate;
        });
        if (currentObservations.length === 0) {
            console.warn("Date range filter resulted in no data points. Chart will display no data.");
        }
    }

    // --- SVG Canvas Construction ---

    // Append the main SVG element to the designated host container.
    const mainChartSvg = primarySvgHost
        .append("svg")
        .attr("width", CHART_CANVAS_WIDTH)
        .attr("height", CHART_CANVAS_HEIGHT)
        .attr("role", "graphics-document") // ARIA role for a graphic.
        .attr("aria-label", "Interactive Time Series Chart"); // Descriptive label.

    // Define reusable graphical elements (like patterns).
    const svgGraphicalDefinitions = mainChartSvg.append("defs");

    // Construct a diagonal stripe pattern for the area fill.
    const diagonalStripePattern = svgGraphicalDefinitions.append("pattern")
        .attr("id", "stripedPatternFill") // Unique ID for the pattern.
        .attr("width", 3)
        .attr("height", 3)
        .attr("patternTransform", "rotate(-45 0 0)") // Rotate the pattern.
        .attr("patternUnits", "userSpaceOnUse"); // Units relative to the object.

    // Add a background rectangle to the pattern, creating the white gaps.
    diagonalStripePattern.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 4)
        .attr("height", 4)
        .style("stroke", "none")
        .style("fill", "#fff"); // White fill for the background.

    // Add the diagonal line element to the pattern.
    diagonalStripePattern.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", 4)
        .style("stroke", "#A06535") // Distinct stroke color.
        .style("stroke-width", 1);

    // Create a group for the chart's axes, positioned at the bottom-left.
    const chartAxesGroup = mainChartSvg.append("g")
        .attr("class", "chart-axis-container")
        .attr("transform", `translate(${chartLayoutMargins.left}, ${CHART_CANVAS_HEIGHT - chartLayoutMargins.bottom})`);

    // Create a group for the main data plot elements (lines, areas, points), positioned at the top-left.
    const dataPlottingArea = mainChartSvg.append("g")
        .attr("class", "data-visualization-layer")
        .attr("transform", `translate(${chartLayoutMargins.left}, ${chartLayoutMargins.top})`);

    // --- Data Extents and Scaling Functions ---

    // Determine the minimum and maximum values for dates and y-axis data.
    const dataValueExtents = {
        time: d3.extent(currentObservations, record => record.date),
        quantity: d3.extent(currentObservations, record => record.value)
    };

    // Construct the time scale for the horizontal axis.
    const horizontalTimeScale = d3.time.scale()
        .domain(dataValueExtents.time)
        .range([0, actualPlotWidth]); // Map dates to the plot's pixel width.

    // Construct the linear scale for the vertical axis.
    const verticalValueScale = d3.scale.linear()
        .domain([0, dataValueExtents.quantity[1]]) // Start y-axis from zero up to max value.
        .range([actualPlotHeight, 0]) // Map values to plot's pixel height (inverted for SVG).
        .nice(); // Adjust domain to "nice" round numbers.

    // --- Path Generators for Visual Elements ---

    // D3 line generator to draw the primary data line.
    const seriesLineGenerator = d3.svg.line()
        .x(record => horizontalTimeScale(record.date))
        .y(record => verticalValueScale(record.value));

    // D3 area generator to draw the shaded region below the line.
    const filledAreaGenerator = d3.svg.area()
        .x(record => horizontalTimeScale(record.date))
        .y0(actualPlotHeight) // Base of the area at the bottom of the plot.
        .y1(record => verticalValueScale(record.value));

    // --- Render Data Paths ---

    // Append the filled area path to the plotting area.
    dataPlottingArea.append("path")
        .attr("class", "chart-area-fill")
        .attr("d", filledAreaGenerator(currentObservations))
        .style("fill", "url(#stripedPatternFill)"); // Apply the custom pattern fill.

    // Append the data series line path.
    dataPlottingArea.append("path")
        .attr("class", "chart-data-line")
        .attr("d", seriesLineGenerator(currentObservations));

    // --- Render Data Point Markers and Interactions ---

    // Bind data to a group element for each observation.
    const dataPointMarkers = dataPlottingArea.selectAll("g.data-point-marker")
        .data(currentObservations)
        .enter()
        .append("g")
        .attr("class", "data-point-marker")
        .classed("is-active-selection", (record, index) => {
            // Initially mark the last data point as selected.
            return record.date.getTime() === dataValueExtents.time[1].getTime();
        })
        .attr("transform", record => {
            const xPosition = horizontalTimeScale(record.date);
            const yPosition = verticalValueScale(record.value);
            return `translate(${xPosition}, ${yPosition})`;
        });

    // Add an invisible, wider rectangle for easier interaction (hover/click).
    const interactionZoneWidth = actualPlotWidth / (dataPointMarkers.data().length - 1 || 1); // Avoid division by zero.
    dataPointMarkers.append("rect")
        .attr("class", "interaction-hitbox")
        .attr("x", -interactionZoneWidth / 2) // Center the hitbox on the data point.
        .attr("y", 0) // Start from the data point's vertical position.
        .attr("width", interactionZoneWidth)
        .attr("height", record => actualPlotHeight - verticalValueScale(record.value)) // Extend down to the x-axis.
        .on("mouseover", function(record) {
            d3.select(this.parentNode).classed("is-hovered", true);
            // Highlight the corresponding x-axis tick on hover.
            chartAxesGroup.select(".x-axis-elements")
                .selectAll(".tick")
                .classed("is-highlighted", tickDate => record.date.getTime() === tickDate.getTime());
        })
        .on("mouseout", function() {
            d3.select(this.parentNode).classed("is-hovered", false);
            chartAxesGroup.select(".x-axis-elements")
                .selectAll(".tick")
                .classed("is-highlighted", false);
        });

    // Add the visible circle marker for each data point.
    dataPointMarkers.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 4); // Radius of the circle.

    // Add text labels associated with each data point.
    const dataPointLabels = dataPointMarkers.append("text")
        .attr("class", "point-annotation-label")
        .attr("x", 5) // Offset from the center of the point.
        .attr("y", 14)
        .style("text-anchor", (record, index) => {
            // Dynamically adjust text anchor to prevent labels from going off-screen.
            if (index === 0) return "start";
            if (index === currentObservations.length - 1) return "end";
            return "middle";
        });

    // Add a sub-label for a "click to select" hint.
    dataPointLabels.append("tspan")
        .attr("class", "selection-prompt")
        .style("text-anchor", (record, index) => {
            // Keep consistent anchor for the prompt.
            return index === currentObservations.length - 1 ? "end" : "start";
        })
        .text("click to select");

    // Add a sub-label for the formatted value of the data point.
    dataPointLabels.append("tspan")
        .attr("x", 5) // Position relative to the parent text element.
        .attr("y", -8) // Vertical offset for the value.
        .text(record => d3.format(",.2s")(record.value)); // Format value (e.g., 1.2M, 50k).

    // Add vertical guide lines extending from data points to the x-axis.
    dataPointMarkers.append("line")
        .attr("class", "point-vertical-guideline")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", 0)
        .attr("y2", record => actualPlotHeight - verticalValueScale(record.value));

    // --- Axis Generation and Formatting ---

    // Create the X-axis generator (horizontal, time-based).
    const xAxisGenerator = d3.svg.axis()
        .scale(horizontalTimeScale)
        .tickSize(3); // Length of the tick marks.

    // Create the Y-axis generator (vertical, linear value).
    const yAxisGenerator = d3.svg.axis()
        .scale(verticalValueScale)
        .orient("left")
        // Filter ticks to exclude 0 if it's at the very bottom and not desired.
        .tickValues(verticalValueScale.ticks(3).filter(tickVal => tickVal > 0));

    // Custom formatter for X-axis ticks (Quarter/Year).
    const formatQuarterAndYear = (dateObject) => {
        const quarterNumber = Math.ceil((dateObject.getMonth() + 1) / 3);
        return `Q${quarterNumber}/${d3.time.format("%y")(dateObject)}`;
    };

    // Custom formatter for Y-axis ticks (Value with optional label).
    const formatValueAndLabel = (value, index) => {
        let descriptor = "";
        // Add a descriptive label only to the highest tick for clarity.
        if (index === yAxisGenerator.tickValues().length - 1) {
            descriptor = " ACTIVE REPOSITORIES";
        }
        return d3.format("s")(value) + descriptor; // Format as short SI-prefix string.
    };

    xAxisGenerator.tickFormat(formatQuarterAndYear);
    yAxisGenerator.tickFormat(formatValueAndLabel);

    // Render the X-axis.
    chartAxesGroup.append("g")
        .attr("class", "x-axis-elements")
        .attr("transform", "translate(0,0)") // Positioned within the axes group.
        .call(xAxisGenerator);

    // Render the Y-axis.
    chartAxesGroup.append("g")
        .attr("class", "y-axis-elements")
        // Translate upwards to align with the plot's top edge.
        .attr("transform", `translate(0, ${-(actualPlotHeight)})`)
        .call(yAxisGenerator)
        .selectAll("text") // Adjust text position for better readability.
        .attr("dx", chartLayoutMargins.left - 22)
        .attr("dy", -3);

    // Render horizontal grid lines for the Y-axis.
    chartAxesGroup.selectAll("line.y-gridline-element")
        .data(yAxisGenerator.tickValues())
        .enter()
        .append("line")
        .attr("class", "y-gridline-element")
        .attr("x1", 0)
        .attr("x2", actualPlotWidth)
        .attr("y1", value => -(actualPlotHeight - verticalValueScale(value))) // Calculate position relative to axis group.
        .attr("y2", value => -(actualPlotHeight - verticalValueScale(value)));

    // --- Date Navigation Widget (Optional) ---
    let dateNavigationWidget; // Reference to the navigation component instance.

    if (activeConfig.dateNavigatorSelector) {
        // Factory function for creating an interactive date navigation component.
        const createDateSelectionNavigator = (hostSelector, timeScale, records, onSelectionChange) => {
            const navHostElement = d3.select(hostSelector);
            if (navHostElement.empty()) {
                console.warn(`Date navigation host "${hostSelector}" not found. Navigation will not be rendered.`);
                return null;
            }

            let currentActiveIndex = records.length - 1; // Default to the last available date.
            const allAvailableDates = timeScale.ticks(); // Dates derived from the chart's x-axis.
            let debounceTimer = null; // Used to prevent rapid updates.

            // Add 'Previous' navigation button.
            navHostElement.append("a")
                .attr("class", "nav-arrow-control previous")
                .attr("title", "Navigate to Previous Quarter")
                .attr("href", "#")
                .html("&lt;")
                .on("click", function(event) {
                    if (event && event.preventDefault) event.preventDefault(); // Prevent default link action.
                    if (currentActiveIndex > 0) {
                        currentActiveIndex--;
                        updateDateDisplay(allAvailableDates[currentActiveIndex]);
                    }
                });

            // Add a list of selectable date options.
            navHostElement.append("ul")
                .attr("class", "date-option-list")
                .selectAll("li")
                .data(allAvailableDates)
                .enter()
                .append("li")
                .classed("is-selected", (d, i) => d.getTime() === allAvailableDates[currentActiveIndex].getTime())
                .text(d => formatQuarterAndYear(d))
                .on("click", (d) => updateDateDisplay(d)); // Trigger update on click.

            // Add 'Next' navigation button.
            navHostElement.append("a")
                .attr("class", "nav-arrow-control next")
                .attr("title", "Navigate to Next Quarter")
                .attr("href", "#")
                .html("&gt;")
                .on("click", function(event) {
                    if (event && event.preventDefault) event.preventDefault();
                    if (currentActiveIndex < allAvailableDates.length - 1) {
                        currentActiveIndex++;
                        updateDateDisplay(allAvailableDates[currentActiveIndex]);
                    }
                });

            // Internal function to manage the date display and selection logic.
            function updateDateDisplay(selectedDateItem, skipExternalCallback = false) {
                // Implement debouncing to smooth out rapid interactions.
                if (debounceTimer) {
                    clearTimeout(debounceTimer);
                }
                debounceTimer = setTimeout(() => {
                    currentActiveIndex = allAvailableDates.map(d => d.getTime()).indexOf(selectedDateItem.getTime());

                    // Update the visual state of the navigation list.
                    navHostElement.selectAll("li")
                        .classed("is-selected", d => d.getTime() === selectedDateItem.getTime());

                    // Trigger chart update and the external callback if not suppressed.
                    if (!skipExternalCallback) {
                        applyChartHighlight(selectedDateItem);
                        // Find the complete data record for the selected date.
                        const associatedDataItem = records.find(item => item.date.getTime() === selectedDateItem.getTime());
                        onSelectionChange(associatedDataItem || { date: selectedDateItem }); // Pass relevant data.
                    }
                }, 200); // 200ms delay for debouncing.
            }

            // Provide a public method for programmatic selection.
            return {
                setSelection: (dateToActivate) => updateDateDisplay(dateToActivate, true)
            };
        };

        // Initialize the date navigation widget.
        dateNavigationWidget = createDateSelectionNavigator(
            activeConfig.dateNavigatorSelector,
            horizontalTimeScale,
            currentObservations,
            activeConfig.selectionCallback
        );
    }

    // --- Centralized Chart Interaction Handler ---

    // Function to apply visual highlight/selection state across chart elements.
    function applyChartHighlight(focusTime) {
        dataPlottingArea.selectAll("g.data-point-marker")
            .classed("is-active-selection", record => focusTime.getTime() === record.date.getTime());

        chartAxesGroup.select(".x-axis-elements")
            .selectAll(".tick")
            .classed("is-active-selection", tickDate => focusTime.getTime() === tickDate.getTime());

        // Inform the date navigation widget about the change, if it exists.
        if (dateNavigationWidget) {
            dateNavigationWidget.setSelection(focusTime);
        }
    }

    // Attach click event listeners to data point markers for selection.
    dataPointMarkers.on("click", function(clickedRecord) {
        applyChartHighlight(clickedRecord.date);
        activeConfig.selectionCallback(clickedRecord); // Trigger external callback.
    });

    // --- Initial Chart State ---

    // On load, ensure the chart reflects the last data point as selected.
    if (currentObservations.length > 0) {
        const lastTickDate = horizontalTimeScale.ticks()[horizontalTimeScale.ticks().length - 1];
        applyChartHighlight(lastTickDate);
    }

    // --- Public API for External Control ---
    return {
        // Allows external components to programmatically select a date.
        selectDataPointByDate: (dateObject) => {
            if (dateObject instanceof Date) {
                applyChartHighlight(dateObject);
            } else {
                console.warn("Invalid date object provided for selection. Must be a Date instance.");
            }
        },
        // Placeholder for future data update functionality.
        refreshWithNewData: (newRecords) => {
            console.log("Data refresh functionality is not yet implemented.");
            // Would involve re-binding data, updating scales, redrawing paths, etc.
        }
    };
}