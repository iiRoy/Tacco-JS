(function (globalScope) {
    "use strict"; // Enforce stricter parsing and error handling for modern JS

    // Define core visualization library dependencies.
    // Ensure d3 and crossfilter are available in the global scope.
    if (typeof d3 === 'undefined' || typeof crossfilter === 'undefined') {
        console.error("Critical dependency error: D3.js and Crossfilter.js libraries are mandatory. Please verify their inclusion.");
        return; // Halt execution if essential dependencies are missing
    }

    // Module version identifier.
    const VIZ_MODULE_VERSION = "1.0.0-alpha"; // Updated semantic versioning

    // A registry to keep track of multiple visualization instances on the page.
    // This allows global functions to target specific visualizations by their container ID.
    const activeVizInstances = {};

    /**
     * Initializes and renders an interactive categorical data correlation visualization.
     * This core function processes raw survey data, constructs interactive bar charts
     * using D3 and Crossfilter, and displays response distributions with filtering capabilities.
     *
     * @param {string} parentElementIdentifier - The DOM ID of the container element where all charts will be embedded.
     * @param {object} sourceDataBundle - An object encapsulating the survey questions and participant responses.
     * @param {Array<object>} sourceDataBundle.queryDefinitions - Array of question objects, each detailing 'number', 'text', 'choices', 'type'.
     * @param {Array<object>} sourceDataBundle.participantResponses - Array of participant response objects, where each object contains answers for various questions.
     */
    function createCategoricalCorrelationViz(parentElementIdentifier, sourceDataBundle) {
        // --- Input Validation and Initial Setup ---
        if (!parentElementIdentifier || typeof parentElementIdentifier !== 'string') {
            console.error("Initialization error: An invalid or missing parent element ID was provided. A non-empty string is required.");
            return;
        }
        const targetDomElement = d3.select(`#${parentElementIdentifier}`);
        if (targetDomElement.empty()) {
            console.error(`Initialization error: The specified container element with ID '${parentElementIdentifier}' could not be found in the DOM.`);
            return;
        }

        if (!sourceDataBundle || !Array.isArray(sourceDataBundle.queryDefinitions) || !Array.isArray(sourceDataBundle.participantResponses)) {
            console.error("Initialization error: The provided data bundle is malformed. Expected 'queryDefinitions' and 'participantResponses' as arrays.");
            return;
        }

        const surveyItemSpecs = sourceDataBundle.queryDefinitions;
        let participantAnswerRecords = sourceDataBundle.participantResponses; // 'let' because records will be modified

        // Construct a mapping from categorical string labels to numerical indices.
        // This conversion is vital for Crossfilter's efficient numerical operations.
        const labelToNumericIndexEncoder = new Map();
        surveyItemSpecs.forEach(item => {
            const itemKey = item.number;
            const choiceMapping = new Map();
            item.choices.forEach((optionText, optionIndex) => {
                choiceMapping.set(optionText, optionIndex);
            });
            labelToNumericIndexEncoder.set(itemKey, choiceMapping);
        });

        // Transform participant answers from string labels to numerical indices in-place.
        // This ensures compatibility with Crossfilter's filtering mechanisms.
        participantAnswerRecords.forEach(record => {
            surveyItemSpecs.forEach(item => {
                const itemKey = item.number;
                const rawAnswer = record[itemKey];
                const itemChoiceMap = labelToNumericIndexEncoder.get(itemKey);

                if (itemChoiceMap && itemChoiceMap.has(rawAnswer)) {
                    record[itemKey] = itemChoiceMap.get(rawAnswer);
                } else {
                    // Assign null for answers not found in the defined choices, indicating missing or invalid data.
                    record[itemKey] = null;
                }
            });
        });

        // --- DOM Generation for Question Titles ---
        surveyItemSpecs.forEach(item => {
            targetDomElement.append("div")
                .attr("id", `survey-plot-${item.number}-container`)
                .attr("class", "correlation-viz-chart survey-item-plot")
                .append("div")
                .attr("class", "plot-header-title")
                .text(`${item.number}. ${item.text}`);
        });

        // --- Data Formatting and Crossfilter Core Initialization ---
        const numericalValueFormatter = d3.format(",d"); // Standard number formatting with commas.

        // Initialize the Crossfilter instance with the pre-processed data.
        const cfDataEngine = crossfilter(participantAnswerRecords);
        const overallFilteredCountGroup = cfDataEngine.groupAll(); // Represents the total count of currently filtered records.

        const cfDataDimensions = []; // Array to store Crossfilter dimensions for each survey item.
        const cfDataGroups = []; // Array to store Crossfilter groups (histograms) for each dimension.

        surveyItemSpecs.forEach((item, index) => {
            cfDataDimensions.push(cfDataEngine.dimension(d => d[item.number]));
            cfDataGroups.push(cfDataDimensions[index].group());
        });

        // Cache the total values for each group's bins (before any filtering).
        // This "all values" cache is critical for calculating proportions and confidence intervals correctly.
        cfDataGroups.forEach(group => {
            group.__initialBinValues__ = group.all().map(bin => bin.value);
        });

        // --- Chart Component Configuration and Scale Definitions ---
        const horizontalCategoryScales = []; // Stores D3 x-scales for each individual chart.
        const verticalFrequencyScale = d3.scale.linear().range([100, 0]); // Global y-scale for frequency/count.
        const d3InteractiveTips = []; // Stores D3-tip instances for interactive tooltips.
        const chartPlotInstances = []; // Stores instances of the reusable bar chart function.

        const CATEGORY_BAR_DISPLAY_WIDTH = 80; // Fixed width for each category bar in charts.
        const BAR_INTERNAL_SPACING = 3; // Horizontal spacing/padding within a bar.

        surveyItemSpecs.forEach((item, index) => {
            // Create a lookup for axis labels (numerical index to descriptive text).
            const categoryAxisLabels = new Map();
            item.choices.forEach((optionText, optionIndex) => {
                categoryAxisLabels.set(optionIndex, optionText);
            });

            // Initialize D3-tip for tooltips if the library is available.
            let currentChartTooltip = null;
            if (typeof d3.tip === 'function') {
                currentChartTooltip = d3.tip()
                    .attr('class', 'd3-tip correlation-chart-tooltip')
                    .direction('s') // Tooltip appears below the hovered element.
                    .html(d => `<span>Selection:</span> <span style="font-weight:bold">${categoryAxisLabels.get(d)}</span>`);
                d3InteractiveTips.push(currentChartTooltip);
            } else {
                d3InteractiveTips.push(null); // Maintain array length, but no tooltip functionality.
                console.warn("D3-tip library not detected. Interactive tooltips will not be rendered.");
            }

            // Configure the horizontal scale for this specific chart.
            const minChoiceIdx = 0;
            const maxChoiceIdx = item.choices.length - 1;
            const hScaleForChart = d3.scale.linear()
                .domain([-0.5, maxChoiceIdx + 0.5]) // Extend domain slightly for visual bar alignment.
                .rangeRound([0, CATEGORY_BAR_DISPLAY_WIDTH * (maxChoiceIdx - minChoiceIdx + 1)]); // Range adjusted by bar width.
            hScaleForChart.axisLabelsMap = categoryAxisLabels; // Attach labels map for easy access within the chart.
            horizontalCategoryScales.push(hScaleForChart);

            // Dynamically adjust the global vertical frequency scale's domain.
            // This ensures all charts share a consistent y-axis scale for accurate comparisons.
            verticalFrequencyScale.domain([0, Math.max(verticalFrequencyScale.domain()[1], cfDataGroups[index].top(1)[0].value)]);

            // Instantiate a bar chart generator for the current survey item.
            const chartGenerator = buildHistogramPlotComponent(item, parentElementIdentifier)
                .bindDimension(cfDataDimensions[index])
                .bindGroup(cfDataGroups[index])
                .bindXScale(hScaleForChart);
            chartPlotInstances.push(chartGenerator);
        });

        // --- Render Charts and Establish Interactive Event Listeners ---
        // Select all chart container elements and bind their respective chart generators.
        const chartDomContainers = d3.selectAll(".correlation-viz-chart.survey-item-plot")
            .data(chartPlotInstances);

        // Attach brush event listeners to each chart's generator.
        // These events trigger a global re-rendering of all visualizations.
        chartDomContainers.each(function (chartGen) {
            chartGen.onBrushEvent("brush", refreshAllVisualizations)
                .onBrushEvent("brushend", refreshAllVisualizations);
        });

        // --- Summary Information Panel (Legend) ---
        const summaryInfoPanel = targetDomElement.append("aside")
            .attr("id", "viz-summary-panel")
            .attr("class", "correlation-viz-summary-display")
            .html("<div style='clear:both;margin-top:20px'></div>" +
                "<span id='active-record-count'>-</span> " +
                "<span>/</span> <span id='total-record-count'>-</span> <br/> currently selected participants");

        const SUMMARY_PANEL_DIM_WIDTH = 300;
        const SUMMARY_PANEL_DIM_HEIGHT = 120;

        const summarySvgDrawingArea = summaryInfoPanel.insert("svg", "div")
            .attr("width", SUMMARY_PANEL_DIM_WIDTH)
            .attr("height", SUMMARY_PANEL_DIM_HEIGHT)
            .append("g")
            .attr("transform", "translate(0,0)");

        // Add a clearing div to manage float layouts.
        targetDomElement.append("div").style("clear", "both");

        // Draw symbolic bars for the legend key.
        summarySvgDrawingArea.selectAll(".legend-bar-symbol")
            .data(["overall_background", "current_foreground", "expected_proportion", "overall_proportion_line"])
            .enter().append("path")
            .attr("class", (dataId, index) => {
                let baseCssClass = "correlation-viz-legend-symbol outcome ";
                if (index === 0 || index === 2) { // 'overall_background' and 'expected_proportion'
                    baseCssClass += "full_range_element ";
                }
                return baseCssClass + dataId;
            })
            .style("fill", d => d.includes("background") ? "#ddd" : d.includes("foreground") ? "#666" : "none"); // Basic visual distinction

        const legendBarEffectiveWidth = CATEGORY_BAR_DISPLAY_WIDTH - 2 * BAR_INTERNAL_SPACING;
        const legendBarCenterX = (SUMMARY_PANEL_DIM_WIDTH - legendBarEffectiveWidth) / 2;

        summarySvgDrawingArea.select(".overall_background.full_range_element")
            .attr("d", `M${legendBarCenterX},10v100h${legendBarEffectiveWidth}v-100Z`); // Z closes the path
        summarySvgDrawingArea.select(".current_foreground.outcome")
            .attr("d", `M${legendBarCenterX},80v30h${legendBarEffectiveWidth}v-30Z`);
        summarySvgDrawingArea.select(".expected_proportion.full_range_element")
            .attr("d", `M${legendBarCenterX},40h${legendBarEffectiveWidth} M${SUMMARY_PANEL_DIM_WIDTH / 2},15v44`);

        // Helper function to append text labels to the legend.
        function addLegendTextElement(xCoord, yCoord, elemWidth, contentHtml, extraCssClass = "", alignment = "left") {
            summarySvgDrawingArea.append("foreignObject")
                .attr("class", `correlation-viz-legend-label ${extraCssClass}`)
                .attr("width", elemWidth)
                .attr("height", "3em")
                .attr("x", xCoord)
                .attr("y", yCoord)
                .style("text-align", alignment)
                .html(contentHtml);
        }

        addLegendTextElement(SUMMARY_PANEL_DIM_WIDTH / 2 + CATEGORY_BAR_DISPLAY_WIDTH / 2 + BAR_INTERNAL_SPACING, 0,
            (SUMMARY_PANEL_DIM_WIDTH - CATEGORY_BAR_DISPLAY_WIDTH) / 2, "All participants in dataset");
        summarySvgDrawingArea.append("path")
            .attr("class", "correlation-viz-legend-arrow")
            .attr("d", `M${SUMMARY_PANEL_DIM_WIDTH / 2 + CATEGORY_BAR_DISPLAY_WIDTH / 2},7 h-15l-7,7`);

        addLegendTextElement(SUMMARY_PANEL_DIM_WIDTH / 2 + CATEGORY_BAR_DISPLAY_WIDTH / 2 + BAR_INTERNAL_SPACING, 106,
            (SUMMARY_PANEL_DIM_WIDTH - CATEGORY_BAR_DISPLAY_WIDTH) / 2, "Participants currently selected");
        summarySvgDrawingArea.append("path")
            .attr("class", "correlation-viz-legend-arrow")
            .attr("d", `M${SUMMARY_PANEL_DIM_WIDTH / 2 + CATEGORY_BAR_DISPLAY_WIDTH / 2},113 h-15l-7,-7`);

        addLegendTextElement(SUMMARY_PANEL_DIM_WIDTH / 2 + CATEGORY_BAR_DISPLAY_WIDTH / 2 + BAR_INTERNAL_SPACING, 35,
            (SUMMARY_PANEL_DIM_WIDTH - CATEGORY_BAR_DISPLAY_WIDTH) / 2, "Expected count of selected participants");
        summarySvgDrawingArea.append("path")
            .attr("class", "correlation-viz-legend-arrow")
            .attr("d", `M${SUMMARY_PANEL_DIM_WIDTH / 2 + CATEGORY_BAR_DISPLAY_WIDTH / 2},47 h-15l-7,-7`);

        addLegendTextElement(0, 12, (SUMMARY_PANEL_DIM_WIDTH - CATEGORY_BAR_DISPLAY_WIDTH) / 2 - 20,
            "Statistical variation in expected selected counts", "right-aligned-text", "right");
        summarySvgDrawingArea.append("path")
            .attr("class", "correlation-viz-legend-arrow")
            .attr("d", `M${SUMMARY_PANEL_DIM_WIDTH / 2 - CATEGORY_BAR_DISPLAY_WIDTH / 2 - 18},36 h15v22h42 M${SUMMARY_PANEL_DIM_WIDTH / 2 - CATEGORY_BAR_DISPLAY_WIDTH / 2 - 3},36 v-22h42`);

        // --- Dynamic Color Legend for Question Types ---
        const distinctItemTypes = new Set();
        surveyItemSpecs.forEach(item => distinctItemTypes.add(item.type));
        const uniqueItemTypeValues = Array.from(distinctItemTypes.values());

        if (uniqueItemTypeValues.length > 1) {
            const COLOR_SWATCH_DIM = 20;
            const COLOR_SWATCH_GAP = 5;

            summaryInfoPanel.insert("div", "svg").style("clear", "both"); // Ensure clear layout
            const colorLegendSvgArea = summaryInfoPanel.insert("svg", "div")
                .attr("width", SUMMARY_PANEL_DIM_WIDTH)
                .attr("height", uniqueItemTypeValues.length * (COLOR_SWATCH_DIM + COLOR_SWATCH_GAP) + COLOR_SWATCH_GAP)
                .style("margin-bottom", "20px")
                .append("g")
                .attr("transform", "translate(0,0)");

            colorLegendSvgArea.selectAll(".color-legend-swatch")
                .data(uniqueItemTypeValues).enter()
                .append("path")
                .attr("class", d => `correlation-viz-foreground-bar ${d}`) // Apply type class for specific styling
                .attr("d", (d, i) => {
                    const xPosition = SUMMARY_PANEL_DIM_WIDTH / 2 - COLOR_SWATCH_DIM / 2;
                    const yPosition = COLOR_SWATCH_GAP + i * (COLOR_SWATCH_DIM + COLOR_SWATCH_GAP);
                    return `M${xPosition},${yPosition}h${COLOR_SWATCH_DIM}v${COLOR_SWATCH_DIM}h${-COLOR_SWATCH_DIM}Z`;
                });

            colorLegendSvgArea.selectAll(".color-legend-label")
                .data(uniqueItemTypeValues).enter()
                .append("text")
                .attr("class", "correlation-viz-legend-label")
                .attr("x", SUMMARY_PANEL_DIM_WIDTH / 2 + COLOR_SWATCH_DIM / 2 + BAR_INTERNAL_SPACING)
                .attr("y", (d, i) => COLOR_SWATCH_GAP + i * (COLOR_SWATCH_DIM + COLOR_SWATCH_GAP) + COLOR_SWATCH_DIM / 2)
                .attr("dy", "0.35em") // Vertical alignment
                .text(d => d);
        }

        // --- Final Initialization and First Render ---
        d3.select(`#${parentElementIdentifier} aside.correlation-viz-summary-display #total-record-count`)
            .text(numericalValueFormatter(cfDataEngine.size()));

        refreshAllVisualizations(); // Perform the initial render of all charts.

        // Store this visualization instance for global access via its container ID.
        activeVizInstances[parentElementIdentifier] = {
            chartPlotInstances: chartPlotInstances,
            refreshFunction: refreshAllVisualizations
        };

        // --- Helper Functions for Rendering and Interaction ---

        /** Renders a single chart component by calling its D3-style rendering method. */
        function renderIndividualChart(plotDrawingFunction) {
            d3.select(this).call(plotDrawingFunction);
        }

        /** Updates all charts and the summary panel to reflect current filter states. */
        function refreshAllVisualizations() {
            chartDomContainers.each(renderIndividualChart); // Re-render all chart components.
            d3.select(`#${parentElementIdentifier} aside.correlation-viz-summary-display #active-record-count`)
                .text(numericalValueFormatter(overallFilteredCountGroup.value()));
        }

        // --- Reusable Bar Chart Component Factory ---
        /**
         * Factory function that generates a reusable D3 bar chart component.
         * Each instance is configured for a specific survey question.
         * @param {object} surveyItemDefinition - The definition object for the question this chart represents.
         * @param {string} vizContainerId - The ID of the main visualization container (for reset links).
         * @returns {function} A D3-style reusable chart function.
         */
        function buildHistogramPlotComponent(surveyItemDefinition, vizContainerId) {
            // Static counter to ensure unique IDs for each chart instance.
            if (!buildHistogramPlotComponent.instanceCount) buildHistogramPlotComponent.instanceCount = 0;

            const CHART_PLOT_MARGINS = { top: 10, right: 10, bottom: 20, left: 10 };
            let currentXScale, currentYScale = verticalFrequencyScale; // Uses the globally defined y-scale.
            let chartSpecificTooltip = d3InteractiveTips[buildHistogramPlotComponent.instanceCount]; // Retrieve pre-initialized tooltip.
            const chartComponentUniqueId = buildHistogramPlotComponent.instanceCount++;

            // D3 components managed by this chart instance.
            const xAxisDrawer = d3.svg.axis().orient("bottom").tickSize(6, 0, 0);
            const rangeSelectionBrush = d3.svg.brush();
            let crossfilterDimension, crossfilterGroup;

            // The main reusable chart function.
            function chart(domContainerElement) {
                const effectivePlotWidth = d3.max(currentXScale.range());
                const effectivePlotHeight = d3.max(currentYScale.range());

                // Set x-axis tick values based on the numerical indices of categories.
                xAxisDrawer.tickValues(Array.from(currentXScale.axisLabelsMap.keys()));

                domContainerElement.each(function () {
                    const currentChartDiv = d3.select(this);
                    let svgMainGroup = currentChartDiv.select("g.chart-drawing-area");

                    // Construct the fundamental SVG structure if it doesn't already exist.
                    if (svgMainGroup.empty()) {
                        // Add a 'Reset Filter' link to the chart's title.
                        currentChartDiv.select(".plot-header-title").append("a")
                            .attr("href", `javascript:globalScope.resetVizChart('${vizContainerId}', ${chartComponentUniqueId})`)
                            .attr("class", "correlation-viz-reset-action")
                            .text("Reset Filter")
                            .style("display", "none"); // Initially hidden until a filter is applied.

                        svgMainGroup = currentChartDiv.append("svg")
                            .attr("width", effectivePlotWidth + CHART_PLOT_MARGINS.left + CHART_PLOT_MARGINS.right)
                            .attr("height", effectivePlotHeight + CHART_PLOT_MARGINS.top + CHART_PLOT_MARGINS.bottom)
                            .append("g")
                            .attr("class", "chart-drawing-area") // Class for easier selection.
                            .attr("transform", `translate(${CHART_PLOT_MARGINS.left},${CHART_PLOT_MARGINS.top})`);

                        // Define a diagonal hatching pattern for the brush overlay.
                        const hatchPatternId = `diagonal-hatch-pattern-${chartComponentUniqueId}`;
                        const patternDef = currentChartDiv.select("svg")
                            .insert("pattern", "g")
                            .attr("id", hatchPatternId)
                            .attr("patternUnits", "userSpaceOnUse")
                            .attr("width", 10)
                            .attr("height", 10);
                        patternDef.append("path")
                            .attr("class", "correlation-viz-hatching-stroke")
                            .attr("d", "M-1,1l2,-2M0,10l10,-10M9,11l2,-2");

                        // Attach the D3-tip tooltip functionality to the SVG group.
                        if (chartSpecificTooltip) {
                            svgMainGroup.call(chartSpecificTooltip);
                        }

                        // Create a clip path to ensure drawing stays within the plot boundaries.
                        svgMainGroup.append("clipPath")
                            .attr("id", `clip-path-${chartComponentUniqueId}`)
                            .append("rect")
                            .attr("width", effectivePlotWidth)
                            .attr("height", effectivePlotHeight);

                        // Initialize all bar path elements (background, foreground, proportion lines).
                        svgMainGroup.selectAll(".bar-visual-element")
                            .data(["full_extent_background", "current_selection_foreground", "expected_proportion_line", "overall_proportion_line"])
                            .enter().append("path")
                            .attr("class", d => {
                                let baseClass = `correlation-viz-bar-visual ${d} `;
                                if (d === "full_extent_background") {
                                    baseClass += `base_layer ${surveyItemDefinition.type}`;
                                } else if (d === "expected_proportion_line") {
                                    baseClass += `base_layer ${surveyItemDefinition.type}`;
                                } else {
                                    baseClass += `active_layer ${surveyItemDefinition.type}`;
                                }
                                return baseClass;
                            })
                            .attr("clip-path", d => d === "current_selection_foreground" ? `url(#clip-path-${chartComponentUniqueId})` : null)
                            .datum(crossfilterGroup.all()); // Bind initial full data.

                        // Append the x-axis to the SVG group.
                        svgMainGroup.append("g")
                            .attr("class", "correlation-viz-axis x-axis-bottom")
                            .attr("transform", `translate(0,${effectivePlotHeight})`)
                            .call(xAxisDrawer);

                        // Customize x-axis labels: truncate long text and add tooltips.
                        const xAxisLabels = svgMainGroup.selectAll("g.x-axis-bottom text")
                            .text(d => {
                                const maxLabelCharLength = 20;
                                const originalLabel = currentXScale.axisLabelsMap.get(d);
                                if (originalLabel === undefined) return ''; // Handle undefined labels.
                                if (originalLabel.length > maxLabelCharLength) {
                                    return originalLabel.substring(0, maxLabelCharLength - 3) + "...";
                                }
                                return originalLabel;
                            });

                        if (chartSpecificTooltip) {
                            chartSpecificTooltip.html(d => currentXScale.axisLabelsMap.get(d)); // Tooltip content for full label.
                            xAxisLabels.on("mouseover", chartSpecificTooltip.show).on("mouseout", chartSpecificTooltip.hide);
                        }

                        // Initialize the D3 brush component for range selection.
                        const brushHandleGroup = svgMainGroup.append("g")
                            .attr("class", "correlation-viz-brush-area")
                            .call(rangeSelectionBrush.x(currentXScale)); // Bind brush to this chart's x-scale.

                        brushHandleGroup.selectAll("rect")
                            .attr("fill", `url(#${hatchPatternId})`) // Apply hatching pattern to brush rectangle.
                            .attr("height", effectivePlotHeight);
                        brushHandleGroup.selectAll(".resize")
                            .append("path")
                            .attr("d", generateBrushResizeHandlePath); // Custom path for resize handles.
                    }

                    // --- Update existing chart elements based on current filter state ---
                    svgMainGroup.selectAll(".bar-visual-element").attr("d", generateBarPathSegments);

                    // The full background bars (representing total counts) are mostly static.
                    svgMainGroup.select(".full_extent_background.base_layer")
                        .attr("d", function (currentBinData, idx) {
                            // Only set 'd' attribute if it's not already defined, preventing unnecessary redraws.
                            const existingPath = d3.select(this).attr("d");
                            return existingPath === null ? generateBarPathSegments(currentBinData, idx) : existingPath;
                        });

                    // Render the expected proportion line only when no brush is active (no filter applied).
                    if (rangeSelectionBrush.empty()) {
                        svgMainGroup.selectAll(".expected_proportion_line.base_layer")
                            .attr("d", generateProportionLinePath);
                        // Remove any previously displayed significance markers.
                        svgMainGroup.selectAll(".significance-marker").remove();
                    } else {
                        // If a brush is active, hide the proportion line and any significance markers.
                        svgMainGroup.selectAll(".expected_proportion_line.base_layer").attr("d", null);
                        svgMainGroup.selectAll(".significance-marker").remove();
                    }

                    // Toggle visibility of the 'Reset Filter' link.
                    currentChartDiv.select(".correlation-viz-reset-action")
                        .style("display", rangeSelectionBrush.empty() ? "none" : null);
                });

                /**
                 * Generates the SVG path string for the histogram bars (both background and foreground).
                 * @param {Array<object>} binData - Array of objects, each with {key, value} for a bin.
                 * @returns {string} Concatenated SVG path data for all bars.
                 */
                function generateBarPathSegments(binData) {
                    const pathStrings = [];
                    for (let i = 0; i < binData.length; i++) {
                        const currentBin = binData[i];
                        if (currentBin.value === 0) continue; // Optimize: skip drawing zero-height bars.

                        const xStartCoord = currentXScale(currentBin.key - 0.5) + BAR_INTERNAL_SPACING;
                        const barRenderHeight = effectivePlotHeight - currentYScale(currentBin.value);
                        pathStrings.push(`M${xStartCoord},${effectivePlotHeight}V${effectivePlotHeight - barRenderHeight}h${CATEGORY_BAR_DISPLAY_WIDTH - 2 * BAR_INTERNAL_SPACING}V${effectivePlotHeight}`);
                    }
                    return pathStrings.join("");
                }

                /**
                 * Calculates approximate 95% confidence intervals for category proportions.
                 * This uses a normal approximation to the binomial distribution, with a Dirichlet prior.
                 * @returns {Array<Array<number>>} An array where each inner array is [lowerBound, upperBound] count.
                 */
                function calculateProportionConfidenceIntervals() {
                    const totalInitialPopulation = d3.sum(crossfilterGroup.__initialBinValues__); // N (total count in this dimension, unfiltered)
                    const currentFilteredCount = overallFilteredCountGroup.value(); // n (total count of selected records)

                    if (currentFilteredCount === 0 || totalInitialPopulation === 0) {
                        // If no records are filtered or no data exists, all intervals are zero.
                        return crossfilterGroup.__initialBinValues__.map(() => [0, 0]);
                    }

                    const DIRICHLET_ALPHA_PRIOR = 1; // Alpha parameter for Dirichlet prior (uniform prior).
                    const estimatedProportions = crossfilterGroup.__initialBinValues__.map(initialBinVal =>
                        (initialBinVal + DIRICHLET_ALPHA_PRIOR) / (totalInitialPopulation + DIRICHLET_ALPHA_PRIOR * crossfilterGroup.__initialBinValues__.length)
                    );

                    const Z_SCORE_FOR_95_CI = 1.96; // Critical value for a 95% confidence level.
                    const confidenceBounds = estimatedProportions.map(currentProp => {
                        const standardError = Math.sqrt((currentProp * (1 - currentProp)) / currentFilteredCount);
                        const marginOfError = Z_SCORE_FOR_95_CI * standardError;

                        // Calculate lower and upper bounds, clamping them within [0, 1].
                        const lowerProp = Math.max(currentProp - marginOfError, 0);
                        const upperProp = Math.min(currentProp + marginOfError, 1);

                        // Convert proportion bounds back to absolute counts for visualization.
                        return [currentFilteredCount * lowerProp, currentFilteredCount * upperProp];
                    });
                    return confidenceBounds;
                }

                /**
                 * Generates the SVG path for the expected proportion line and adds significance markers.
                 * This line represents the expected distribution of the currently selected participants
                 * if they were a random sample from the total population.
                 * @param {Array<object>} binData - Array of objects with {key, value} from the full group.
                 * @returns {string} Concatenated SVG path data for the proportion line and intervals.
                 */
                function generateProportionLinePath(binData) {
                    const pathParts = [];
                    const currentFilteredRecordCount = overallFilteredCountGroup.value();
                    const proportionCIs = calculateProportionConfidenceIntervals();

                    // Remove any previous significance markers before re-evaluating.
                    d3.select(this.parentNode).selectAll(".significance-marker").remove();

                    for (let i = 0; i < binData.length; i++) {
                        const currentBin = binData[i];
                        const lowerCI_count = proportionCIs[i][0];
                        const upperCI_count = proportionCIs[i][1];

                        // Calculate the expected count for this bin based on its overall proportion.
                        const initialTotalForDimension = d3.sum(crossfilterGroup.__initialBinValues__);
                        const binOverallProportion = initialTotalForDimension > 0 ? (currentBin.value / initialTotalForDimension) : 0;
                        const expectedBinCount = currentFilteredRecordCount * binOverallProportion;

                        const xCenterPosition = currentXScale(currentBin.key);

                        // Draw the horizontal line segment for the expected count.
                        const expectedLineY = currentYScale(expectedBinCount);
                        pathParts.push(`M${xCenterPosition - (CATEGORY_BAR_DISPLAY_WIDTH / 2 - BAR_INTERNAL_SPACING)},${expectedLineY}h${CATEGORY_BAR_DISPLAY_WIDTH - 2 * BAR_INTERNAL_SPACING}`);

                        // Draw the vertical line for the confidence interval.
                        const ciY_upper = currentYScale(upperCI_count);
                        const ciY_lower = currentYScale(lowerCI_count);
                        pathParts.push(`M${xCenterPosition},${ciY_upper}V${ciY_lower}`);

                        // Check for statistical significance: is the observed filtered count outside the CI?
                        // We need the *actual* filtered count for the current bin key.
                        const actualFilteredBinData = crossfilterGroup.all().find(d => d.key === currentBin.key);
                        const observedFilteredBinCount = actualFilteredBinData ? actualFilteredBinData.value : 0;

                        const isStatisticallySignificant = observedFilteredBinCount < lowerCI_count || observedFilteredBinCount > upperCI_count;

                        if (isStatisticallySignificant && observedFilteredBinCount > 0) {
                            // Add an asterisk marker to indicate significance.
                            d3.select(this.parentNode).append("text")
                                .attr("class", "significance-marker")
                                .attr("x", xCenterPosition)
                                .attr("y", currentYScale(observedFilteredBinCount) - 5) // Position above the bar.
                                .attr("text-anchor", "middle")
                                .text("*");
                        }
                    }
                    return pathParts.join("");
                }

                /** Generates the SVG path string for the D3 brush resize handles. */
                function generateBrushResizeHandlePath(handleData) {
                    const isEastHandle = +(handleData === "e"); // 1 if "e", 0 if "w"
                    const xDirection = isEastHandle ? 1 : -1;
                    const thirdHeight = effectivePlotHeight / 3;
                    return `M${(.5 * xDirection)},${thirdHeight}A6,6 0 0 ${isEastHandle} ${6 * xDirection},${(thirdHeight + 6)}V${(2 * thirdHeight - 6)}A6,6 0 0 ${isEastHandle} ${(.5 * xDirection)},${(2 * thirdHeight)}Z`;
                }
            }

            // --- Bar Chart Component Public API ---
            chart.bindDimension = function (dimensionRef) {
                if (!arguments.length) return crossfilterDimension;
                crossfilterDimension = dimensionRef;
                rangeSelectionBrush.dimension(crossfilterDimension); // Link the brush to its dimension.
                return chart;
            };

            chart.bindGroup = function (groupRef) {
                if (!arguments.length) return crossfilterGroup;
                crossfilterGroup = groupRef;
                return chart;
            };

            chart.bindXScale = function (xScaleRef) {
                if (!arguments.length) return currentXScale;
                currentXScale = xScaleRef;
                return chart;
            };

            chart.onBrushEvent = function (eventType, listenerCallback) {
                rangeSelectionBrush.on(eventType, listenerCallback);
                return chart;
            };

            chart.filterDimension = function (filterValue) {
                if (!arguments.length) return rangeSelectionBrush.filter();
                crossfilterDimension.filter(filterValue);
                return chart;
            };

            return chart;
        }
    }

    // Expose the main visualization factory function to the global scope.
    // This allows users to create new instances of the visualization.
    globalScope.createCategoricalCorrelationViz = createCategoricalCorrelationViz;
    globalScope.createCategoricalCorrelationViz.version = VIZ_MODULE_VERSION;

    /**
     * Global function to apply a set of filters to a specific visualization instance.
     * This function is designed to be called externally, e.g., from UI controls.
     * @param {string} vizInstanceId - The DOM ID of the container element for the target visualization.
     * @param {Array<any>} filterValues - An array of filter values, where each element corresponds to a chart's filter.
     */
    globalScope.applyVizFilters = function (vizInstanceId, filterValues) {
        const instance = activeVizInstances[vizInstanceId];
        if (!instance) {
            console.error(`Filter application failed: Visualization instance with ID '${vizInstanceId}' not found.`);
            return;
        }
        if (!Array.isArray(filterValues) || filterValues.length !== instance.chartPlotInstances.length) {
            console.warn("Filter application warning: Provided filters array does not match the number of charts in the instance.");
            return;
        }
        filterValues.forEach((fVal, idx) => {
            if (instance.chartPlotInstances[idx]) {
                instance.chartPlotInstances[idx].filterDimension(fVal);
            }
        });
        instance.refreshFunction(); // Trigger a global refresh after applying filters.
    };

    /**
     * Global function to reset the filter of a specific chart within a visualization instance.
     * This is typically invoked by a 'reset' button on an individual chart.
     * @param {string} vizInstanceId - The DOM ID of the container element for the target visualization.
     * @param {number} chartIndex - The zero-based index of the chart to be reset.
     */
    globalScope.resetVizChart = function (vizInstanceId, chartIndex) {
        const instance = activeVizInstances[vizInstanceId];
        if (!instance) {
            console.error(`Chart reset failed: Visualization instance with ID '${vizInstanceId}' not found.`);
            return;
        }
        if (chartIndex >= 0 && chartIndex < instance.chartPlotInstances.length) {
            instance.chartPlotInstances[chartIndex].filterDimension(null); // Reset filter to null.
            instance.refreshFunction(); // Trigger a global refresh.
        } else {
            console.warn(`Chart reset warning: Invalid chart index '${chartIndex}' for visualization instance '${vizInstanceId}'.`);
        }
    };

})(typeof window !== 'undefined' ? window : this);