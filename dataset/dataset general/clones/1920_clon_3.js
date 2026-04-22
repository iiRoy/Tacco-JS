function createRadialDataPlotter() {
    // Core settings for the radial data visualization component.
    let plotPadding = { padTop: 20, padRight: 20, padBottom: 20, padLeft: 20 }; // Spacing around the chart area.
    let coreRadius = 50; // The radius of the innermost empty circle.
    let sectorCount = 24; // Number of angular divisions (e.g., segments for hours).
    let sectorDepth = 20; // The height or thickness of each concentric data band.
    let valueRange = null; // The numerical domain (min/max) for color mapping data values. Null means auto-detect.
    let colorSpectrum = ["#FFFFFF", "#FF0000"]; // The color range for the heat scale, from low to high.
    let dataExtractor = function(entry) { return entry; }; // Function to retrieve the value from a data point.
    let spokeLabels = []; // An array of labels to be displayed radially along the chart's spokes.
    let arcLabels = []; // An array of labels to be displayed along the outer circumference of the chart.

    /**
     * Main rendering function for the radial data plotter.
     * This function is intended to be called on a D3 selection.
     * @param {d3.Selection} targetElement - The D3 selection to which the chart will be appended.
     */
    function plotGenerator(targetElement) {
        targetElement.each(function(inputValues) {
            // Validate input data: must be an array and not empty.
            if (!Array.isArray(inputValues) || inputValues.length === 0) {
                console.warn("Radial plotter received no valid data or an empty array. Skipping render.");
                return;
            }

            const canvasElement = d3.select(this); // The SVG container for drawing.

            // Calculate the total number of concentric rings required based on data and segment count.
            const ringCount = Math.ceil(inputValues.length / sectorCount);
            // Determine the maximum radius needed for all data rings.
            const totalPlotRadius = coreRadius + ringCount * sectorDepth;
            // Calculate the overall translation required to center the chart given padding and radius.
            const translationAmount = totalPlotRadius;

            // Append the primary group element that will contain all chart components.
            const mainDrawingGroup = canvasElement.append("g")
                .attr("class", "radial-data-display-container") // Assign a specific class for styling.
                .attr("transform", `translate(${plotPadding.padLeft + translationAmount},${plotPadding.padTop + translationAmount})`);

            // --- Determine the data value domain for color scaling ---
            let dynamicRangeCalc = false; // Flag to check if domain was auto-calculated.
            let currentDataDomain = valueRange; // Start with the configured domain.

            if (currentDataDomain === null) {
                // If no domain is explicitly set, calculate it from the input data.
                currentDataDomain = d3.extent(inputValues, dataExtractor);
                dynamicRangeCalc = true;
            }

            // Create a linear color scale using D3's scaling capabilities.
            const colorScaler = d3.scale.linear().domain(currentDataDomain).range(colorSpectrum);

            // If the domain was dynamically calculated, revert it to null for subsequent chart invocations.
            if (dynamicRangeCalc) {
                valueRange = null;
            }

            // --- Define arc generator functions for the individual data segments ---
            const getInnerRingRad = (datum, idx) => coreRadius + Math.floor(idx / sectorCount) * sectorDepth;
            const getOuterRingRad = (datum, idx) => coreRadius + sectorDepth + Math.floor(idx / sectorCount) * sectorDepth;
            const angularStepSize = (2 * Math.PI) / sectorCount; // Angle per sector.
            const getStartAngle = (datum, idx) => (idx % sectorCount) * angularStepSize;
            const getEndAngle = (datum, idx) => ((idx % sectorCount) + 1) * angularStepSize;

            const radialArcDrawer = d3.svg.arc()
                .innerRadius(getInnerRingRad)
                .outerRadius(getOuterRingRad)
                .startAngle(getStartAngle)
                .endAngle(getEndAngle);

            // Bind data to path elements and draw the heat segments.
            mainDrawingGroup.selectAll(".data-segment-path")
                .data(inputValues)
                .enter().append("path")
                .attr("class", "data-segment-path") // Class for individual data path elements.
                .attr("d", radialArcDrawer) // Use the defined arc generator.
                .attr("fill", function(datum) {
                    // Fill color based on the data value, using the color scale.
                    return colorScaler(dataExtractor(datum));
                });

            // --- Generate a unique ID for text paths to avoid conflicts ---
            // A random string provides a good balance of uniqueness and simplicity.
            const uniquePlotIdentifier = Math.random().toString(36).substring(2, 9);

            // --- Draw Radial (Spoke) Labels ---
            const minLabelAngleOffset = 0.01; // Small angle to ensure text path rendering.
            const spokeLabelContainer = canvasElement.append("g")
                .attr("class", "label-group spoke-labels") // Group for radial labels.
                .attr("transform", `translate(${plotPadding.padLeft + translationAmount},${plotPadding.padTop + translationAmount})`);

            spokeLabelContainer.selectAll("defs.radial-text-path-def")
                .data(spokeLabels).enter()
                .append("defs")
                .attr("class", "radial-text-path-def")
                .append("path")
                .attr("id", (datum, idx) => `spoke-label-path-${uniquePlotIdentifier}-${idx}`)
                .attr("d", (datum, idx) => {
                    const currentLabelRadius = coreRadius + ((idx + 0.2) * sectorDepth);
                    // Path definition for radial labels: starts near top, arcs counter-clockwise.
                    return `m${currentLabelRadius * Math.sin(minLabelAngleOffset)} -${currentLabelRadius * Math.cos(minLabelAngleOffset)} ` +
                           `a${currentLabelRadius} ${currentLabelRadius} 0 1 1 -1 0`;
                });

            spokeLabelContainer.selectAll("text.spoke-label-content")
                .data(spokeLabels).enter()
                .append("text")
                .attr("class", "spoke-label-content")
                .style("font-size", `${0.6 * sectorDepth}px`) // Font size scales with sector depth.
                .append("textPath")
                .attr("xlink:href", (datum, idx) => `#spoke-label-path-${uniquePlotIdentifier}-${idx}`)
                .text(datum => datum);

            // --- Draw Arc (Segment) Labels ---
            const arcLabelSpacing = 2; // Extra space between data rings and arc labels.
            const arcLabelCircleRadius = totalPlotRadius + arcLabelSpacing; // Radius for the arc labels.

            const arcLabelContainer = canvasElement.append("g")
                .attr("class", "label-group arc-labels") // Group for arc labels.
                .attr("transform", `translate(${plotPadding.padLeft + translationAmount},${plotPadding.padTop + translationAmount})`);

            // Define a single circular path for all arc labels to follow.
            arcLabelContainer.append("defs")
                .append("path")
                .attr("id", `arc-label-path-${uniquePlotIdentifier}`)
                .attr("d", `m0 -${arcLabelCircleRadius} a${arcLabelCircleRadius} ${arcLabelCircleRadius} 0 1 1 -1 0`); // Full circle path.

            arcLabelContainer.selectAll("text.arc-label-content")
                .data(arcLabels).enter()
                .append("text")
                .attr("class", "arc-label-content")
                .append("textPath")
                .attr("xlink:href", `#arc-label-path-${uniquePlotIdentifier}`)
                .attr("startOffset", (datum, idx) => `${idx * 100 / sectorCount + (50 / sectorCount)}%`) // Position labels evenly within their sectors.
                .text(datum => datum);
        });
    }

    // --- Configuration Getters and Setters ---
    // These methods allow external users to customize the chart's appearance and behavior.

    plotGenerator.padding = function(newValue) {
        if (!arguments.length) return plotPadding;
        if (typeof newValue === 'object' && newValue !== null &&
            ['padTop', 'padRight', 'padBottom', 'padLeft'].every(prop => typeof newValue[prop] === 'number')) {
            plotPadding = newValue;
        } else {
            console.warn("Invalid padding object provided. Expected an object with padTop, padRight, padBottom, padLeft properties (numbers).");
        }
        return plotGenerator;
    };

    plotGenerator.coreRadius = function(newValue) {
        if (!arguments.length) return coreRadius;
        if (typeof newValue === 'number' && newValue >= 0) coreRadius = newValue;
        return plotGenerator;
    };

    plotGenerator.sectorCount = function(newValue) {
        if (!arguments.length) return sectorCount;
        if (typeof newValue === 'number' && newValue > 0) sectorCount = Math.floor(newValue); // Ensure integer.
        return plotGenerator;
    };

    plotGenerator.sectorDepth = function(newValue) {
        if (!arguments.length) return sectorDepth;
        if (typeof newValue === 'number' && newValue >= 0) sectorDepth = newValue;
        return plotGenerator;
    };

    plotGenerator.valueRange = function(newValue) {
        if (!arguments.length) return valueRange;
        // Accept null (for auto-calc) or an array of two numbers [min, max].
        if (newValue === null || (Array.isArray(newValue) && newValue.length === 2 && newValue.every(n => typeof n === 'number'))) {
            valueRange = newValue;
        }
        return plotGenerator;
    };

    plotGenerator.colorSpectrum = function(newValue) {
        if (!arguments.length) return colorSpectrum;
        if (Array.isArray(newValue) && newValue.length >= 2) colorSpectrum = newValue;
        return plotGenerator;
    };

    plotGenerator.spokeLabels = function(newValue) {
        if (!arguments.length) return spokeLabels;
        spokeLabels = Array.isArray(newValue) ? newValue : []; // Ensure it's an array.
        return plotGenerator;
    };

    plotGenerator.arcLabels = function(newValue) {
        if (!arguments.length) return arcLabels;
        arcLabels = Array.isArray(newValue) ? newValue : []; // Ensure it's an array.
        return plotGenerator;
    };

    plotGenerator.dataExtractor = function(newValue) {
        if (!arguments.length) return dataExtractor;
        if (typeof newValue === 'function') dataExtractor = newValue;
        return plotGenerator;
    };

    return plotGenerator; // Return the main chart function.
}