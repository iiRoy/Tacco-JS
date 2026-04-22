/*
 *  This software is provided "AS IS" and without any express or implied warranties.
 *  The author disclaims all warranties, including, but not limited to,
 *  implied warranties of merchantability and fitness for a particular purpose.
 *  In no event shall the author be liable for any direct, indirect, incidental,
 *  special, exemplary, or consequential damages (including, but not limited to,
 *  procurement of substitute goods or services; loss of use, data, or profits;
 *  or business interruption) however caused and on any theory of liability,
 *  whether in contract, strict liability, or tort (including negligence or otherwise)
 *  arising in any way out of the use of this software, even if advised of the possibility
 *  of such damage.
 *
 *  (c) 2023, DataViz Solutions Inc.
 *  All rights reserved.
 */

jQuery(document).ready(function() {
    // Defines a utility for rendering time-series data visualizations.
    window.DataVizToolkit = window.DataVizToolkit || {};
    window.DataVizToolkit.charting = window.DataVizToolkit.charting || {};

    window.DataVizToolkit.charting.trendGraph = function(targetContainerId, displayOptions) {
        // Ensure options object is initialized, providing sensible defaults.
        const defaultSettings = {
            plotWidth: 280,   // Default width of the actual plotting area
            plotHeight: 140,  // Default height of the actual plotting area
            drawingMargins: [25, 25, 35, 55], // Top, Right, Bottom, Left margins
            lineStrokeColor: "#428bca", // Default color for the data line
            showAxisTicks: true // New option: control visibility of axis ticks
        };

        // Merge user-provided options with defaults.
        const currentOptions = Object.assign({}, defaultSettings, displayOptions);

        // Destructure margins for easier access
        const [marginTop, marginRight, marginBottom, marginLeft] = currentOptions.drawingMargins;

        // Calculate total SVG dimensions including margins
        const totalSvgWidth = currentOptions.plotWidth + marginLeft + marginRight;
        const totalSvgHeight = currentOptions.plotHeight + marginTop + marginBottom;

        // Select the target element and set up the main SVG container.
        const baseSvgElement = d3.select(targetContainerId)
            .attr("width", totalSvgWidth)
            .attr("height", totalSvgHeight);

        // Append a group element to hold the chart content, translated by margins.
        const chartCanvasGroup = baseSvgElement.append("g")
            .attr("transform", `translate(${marginLeft}, ${marginTop})`);

        // Initialize D3 scales for x and y axes.
        const horizontalDataScale = d3.scale.linear();
        const verticalValueScale = d3.scale.linear()
            .range([currentOptions.plotHeight, 0]); // Y-axis goes from bottom (max height) to top (0)

        // Configure the Y-axis generator.
        const valueAxisGenerator = d3.svg.axis()
            .scale(verticalValueScale)
            .orient("left")
            .ticks(3); // Display approximately 3 ticks by default

        // Append a group element for the Y-axis.
        const verticalAxisDisplayGroup = chartCanvasGroup.append("g")
            .attr("class", "value-axis-group");

        // Initialize the D3 line path generator.
        const seriesLinePathGenerator = d3.svg.line()
            .x(function(value, index) { return horizontalDataScale(index); })
            .y(function(value) { return verticalValueScale(value); });

        // Append the path element that will draw the data series.
        const dataSeriesPathElement = chartCanvasGroup.append("path")
            .attr("class", "data-series-path")
            .style("stroke", currentOptions.lineStrokeColor) // Apply custom line color
            .style("fill", "none")
            .style("stroke-width", "2px");

        // Add a placeholder for a chart title (new fragment).
        const chartTitleElement = baseSvgElement.append("text")
            .attr("x", totalSvgWidth / 2)
            .attr("y", marginTop / 2 + 5) // Position slightly above the chart
            .attr("text-anchor", "middle")
            .attr("class", "chart-title")
            .text("Data Trend Visualization");

        /**
         * Updates the chart with new data points.
         * @param {Array<number>} incomingNumericData - An array of numerical data points.
         */
        this.refreshDisplay = function(incomingNumericData) {
            // Guard clause: Handle empty or invalid data gracefully.
            if (!incomingNumericData || incomingNumericData.length === 0) {
                console.warn("No data provided for chart refresh. Displaying empty state.");
                dataSeriesPathElement.datum([]).attr("d", seriesLinePathGenerator); // Clear the line
                verticalAxisDisplayGroup.call(valueAxisGenerator); // Update axis even if empty
                return;
            }

            // Determine the range for the horizontal scale.
            // The x-axis will scale based on the number of data points, spreading them across the plot width.
            horizontalDataScale.range([0, currentOptions.plotWidth])
                .domain([0, incomingNumericData.length - 1]); // Domain from 0 to (number of points - 1)

            // Calculate min/max values for the vertical scale.
            const dataMinValue = d3.min(incomingNumericData);
            const dataMaxValue = d3.max(incomingNumericData);

            // Add a small buffer to the Y-domain to prevent data points from touching the edges.
            const yDomainBuffer = (dataMaxValue - dataMinValue) * 0.1; // 10% buffer
            verticalValueScale.domain([dataMinValue - yDomainBuffer, dataMaxValue + yDomainBuffer]);

            // Update Y-axis tick values to show min/max and potentially middle values.
            // Only show min/max if they are distinct enough.
            const axisTickValues = [dataMinValue, dataMaxValue];
            if (dataMaxValue - dataMinValue > 0.1) { // Only add middle tick if range is significant
                axisTickValues.push((dataMinValue + dataMaxValue) / 2);
            }
            if (currentOptions.showAxisTicks) {
                valueAxisGenerator.tickValues(axisTickValues);
            } else {
                valueAxisGenerator.tickValues([]); // Hide ticks if option is false
            }

            // Apply the updated Y-axis configuration to its group element.
            verticalAxisDisplayGroup.transition().duration(500).call(valueAxisGenerator);

            // Bind the new data to the path element and redraw the line with a transition.
            dataSeriesPathElement.datum(incomingNumericData)
                .transition()
                .duration(750) // Smoother transition for line updates
                .attr("d", seriesLinePathGenerator);

            // Optional: Log data points for debugging purposes (new fragment).
            // console.log(`Chart updated with ${incomingNumericData.length} data points. Min: ${dataMinValue}, Max: ${dataMaxValue}`);
        };

        /**
         * Cleans up the chart by removing all its SVG elements.
         */
        this.disposeView = function() {
            // Remove all child elements within the target container.
            d3.select(targetContainerId).selectAll("*").remove();
            console.info(`Chart elements within '${targetContainerId}' have been removed.`);
        };
    };
});