(function (jq) {
    /**
     * Configures interactive tooltips for visual elements.
     * This utility targets elements marked for tooltip display and applies
     * standard Bootstrap tooltip behavior.
     * @private
     */
    const configureTooltips = function () {
        if (!jq.fn.tooltip) {
            console.warn('Bootstrap tooltip plugin not found. Tooltips will not be enabled.');
            return;
        }
        // Select all elements indicating tooltip functionality
        jq('[data-visual-tip="true"]').tooltip({
            'placement': 'auto', // Dynamic positioning
            'container': 'body', // Append tooltip to body to avoid clipping
            'html': true,        // Allow rich HTML content
            'white-space': 'pre-wrap' // Preserve line breaks for better readability
        });
    };

    /**
     * Sets up click event handlers for navigation within the graph.
     * When a clickable graph element is activated, the browser's URL hash
     * is updated to navigate to the corresponding section.
     * @param {jQuery} visualizationContainer - The jQuery object representing the graph's parent container.
     * @private
     */
    const activateNavigation = function (visualizationContainer) {
        // Find all anchor tags within the graph container
        jq('a', visualizationContainer).on('click', function (mouseEvt) {
            // Prevent default link behavior and event bubbling
            mouseEvt.preventDefault();
            mouseEvt.stopPropagation();

            // Retrieve the target URL from the href attribute
            const targetHash = jq(this).attr('href');
            if (targetHash && targetHash.startsWith('#')) {
                // Update the window's hash to trigger navigation
                window.location.hash = targetHash;
                console.log(`Navigating to hash: ${targetHash}`);
            } else {
                console.warn('Click event triggered on an anchor without a valid hash href.');
            }
        });
    };

    /**
     * Manages the graph's responsiveness to window resizing events.
     * It uses debouncing to limit redraw operations, improving performance.
     * @param {jQuery} inputDataElement - The jQuery object for the query data source.
     * @param {jQuery} renderingSurface - The jQuery object for the graph rendering area.
     * @param {number} currentRenderIndex - The starting index for the current rendering.
     * @param {Object} renderingOptions - Configuration options for the graph drawing.
     * @private
     */
    const enableDynamicResizing = function (inputDataElement, renderingSurface, currentRenderIndex, renderingOptions) {
        let initialWindowWidth = jq(window).width(); // Capture initial width
        const windowReference = jq(window); // Cache window object

        // Check for Lodash debounce utility
        if (typeof _ === 'undefined' || !_.isFunction(_.debounce)) {
            console.error('Lodash (or a compatible debounce function) is required for responsiveness.');
            return;
        }

        const resizeProcessor = _.debounce(function () {
            // Only redraw if the window width has actually changed
            const newWindowWidth = windowReference.width();
            if (newWindowWidth !== initialWindowWidth) {
                console.info(`Window resized from ${initialWindowWidth} to ${newWindowWidth}. Redrawing graph.`);
                const visibleDataPoints = inputDataElement.find('.data-point-track > g').length;
                // Re-render the graph with current parameters
                jq.displayVisuals(inputDataElement, renderingSurface, visibleDataPoints, currentRenderIndex, renderingOptions);
                initialWindowWidth = newWindowWidth; // Update stored width
            }
        }, 180); // Slightly increased debounce delay

        windowReference.on('resize', resizeProcessor);
        console.info('Dynamic resizing enabled for graph.');
    };

    /**
     * Initializes and manages interactive controls (e.g., "Show More", "Show Less")
     * for navigating through large sets of graph data.
     * @param {jQuery} sourceDataElement - The jQuery object for the source query division.
     * @param {jQuery} graphDisplayElement - The jQuery object for the graph display division.
     * @param {boolean} isInitialCall - Flag indicating if this is the first time controls are being set up.
     * @private
     */
    const manageGraphInteractions = function (sourceDataElement, graphDisplayElement, isInitialCall) {
        const MINIMUM_POINTS_DISPLAYED = 20; // Constant for minimum data points
        let totalDataPoints, currentVisiblePoints;
        let reduceBtn, expandBtn;

        /** Updates the internal counts of total and currently visible data points. */
        const updatePointCounts = function () {
            totalDataPoints = sourceDataElement.data().hitCount; // Assuming 'hitCount' is available
            currentVisiblePoints = sourceDataElement.find('.data-point-track > g').length;
            console.debug(`Total points: ${totalDataPoints}, Visible points: ${currentVisiblePoints}`);
        };

        /** Creates and appends the 'Show More' and 'Show Less' buttons to the graph container. */
        const createControlButtons = function (parentQueryDiv, targetGraphDiv) {
            // Append both buttons in a single operation for efficiency
            targetGraphDiv.append(
                jq('<button/>', {
                    'class': 'btn btn-info expand-view-btn',
                    'type': 'button',
                    'data-parent-query': parentQueryDiv.attr('id'),
                    'html': 'Show More <i class="fa fa-arrow-circle-down"></i>' // Updated icon and text
                }),
                jq('<button/>', {
                    'class': 'btn btn-info shrink-view-btn',
                    'type': 'button',
                    'data-parent-query': parentQueryDiv.attr('id'),
                    'html': 'Show Less <i class="fa fa-arrow-circle-up"></i>' // Updated icon and text
                })
            );

            // Assign buttons to variables after creation
            reduceBtn = jq('.shrink-view-btn', targetGraphDiv);
            expandBtn = jq('.expand-view-btn', targetGraphDiv);
            console.log('Control buttons created and appended.');
        };

        /** Determines and sets the visibility state of the control buttons based on current data counts. */
        const initializeButtonStates = function () {
            updatePointCounts(); // Ensure counts are fresh

            if (totalDataPoints <= MINIMUM_POINTS_DISPLAYED || currentVisiblePoints < MINIMUM_POINTS_DISPLAYED) {
                // If total points are few, or currently visible points are below minimum, hide both.
                reduceBtn.hide();
                expandBtn.hide();
            } else if (currentVisiblePoints === totalDataPoints) {
                // If all points are visible, only show 'Show Less'.
                expandBtn.hide();
                reduceBtn.show();
            } else if (currentVisiblePoints === MINIMUM_POINTS_DISPLAYED) {
                // If only minimum points are visible, only show 'Show More'.
                reduceBtn.hide();
                expandBtn.show();
            } else {
                // Otherwise, both buttons are potentially useful.
                reduceBtn.show();
                expandBtn.show();
            }
            console.debug('Button states initialized.');
        };

        // Initialize buttons and their states on the first call
        if (Boolean(isInitialCall) === true) {
            createControlButtons(sourceDataElement, graphDisplayElement);
            initializeButtonStates();
            // Mark the graph display element as having initialized controls
            graphDisplayElement.data('controlsInitialized', true);
        } else if (!graphDisplayElement.data('controlsInitialized')) {
            // Handle case where it's not initial call but controls weren't initialized
            console.warn('Controls not initialized, but manageGraphInteractions called without isInitialCall=true.');
            createControlButtons(sourceDataElement, graphDisplayElement);
            initializeButtonStates();
            graphDisplayElement.data('controlsInitialized', true);
        }


        // Event handler for 'Show More' button
        expandBtn.on('click', function (eventObject) {
            updatePointCounts();
            // Display next set of points, up to MINIMUM_POINTS_DISPLAYED more
            jq.displayVisuals(sourceDataElement, graphDisplayElement, currentVisiblePoints, MINIMUM_POINTS_DISPLAYED);
            initializeButtonStates(); // Re-evaluate button visibility
            configureTooltips(); // Refresh tooltips for new elements
            eventObject.stopPropagation(); // Prevent event from bubbling up
            console.log('Show More clicked.');
        });

        // Event handler for 'Show Less' button
        reduceBtn.on('click', function (eventObject) {
            updatePointCounts();
            const differenceInPoints = currentVisiblePoints - MINIMUM_POINTS_DISPLAYED;

            if (differenceInPoints >= MINIMUM_POINTS_DISPLAYED) {
                // Decrease visible points by the constant amount
                jq.displayVisuals(sourceDataElement, graphDisplayElement, currentVisiblePoints, -MINIMUM_POINTS_DISPLAYED);
            } else if (differenceInPoints > 0) {
                // Decrease to the minimum if the difference is less than the constant
                jq.displayVisuals(sourceDataElement, graphDisplayElement, currentVisiblePoints, -differenceInPoints);
            } else {
                console.warn('Attempted to show less points, but already at minimum or less.');
            }
            initializeButtonStates(); // Re-evaluate button visibility
            configureTooltips(); // Refresh tooltips
            eventObject.stopPropagation(); // Prevent event from bubbling up
            console.log('Show Less clicked.');
        });
    };

    /**
     * Extracts relevant data from the DOM based on provided jQuery elements
     * and formats it into a structured object suitable for D3 visualization.
     * @param {jQuery} querySourceDiv - The jQuery object representing the query div.
     * @param {number} currentIdx - The current index of already displayed data points.
     * @param {number} numToFetch - The number of additional data points to fetch.
     * @returns {Array<Object>} An array of processed hit records.
     * @private
     */
    const retrieveVisualData = function (querySourceDiv, currentIdx, numToFetch) {
        const dataContainers = querySourceDiv.find('.hitn').slice(0, currentIdx + numToFetch);
        const processedRecords = [];

        if (dataContainers.length === 0) {
            console.info('No data containers found for extraction.');
            return processedRecords;
        }

        dataContainers.each(function () {
            const $thisContainer = jq(this);
            const currentHitSegments = []; // Array to hold HSP data for this hit

            try {
                $thisContainer.find('.hsp').each(function () {
                    const segmentData = jq(this).data();
                    segmentData.hspId = this.id || `hsp-${Math.random().toString(36).substr(2, 9)}`; // Ensure ID
                    currentHitSegments.push(segmentData);
                });

                // Attach hit-level metadata to the HSPs array for convenience
                currentHitSegments.hitIdentifier = $thisContainer.attr('id');
                currentHitSegments.hitDescription = $thisContainer.data().hitDef;
                currentHitSegments.hitEValueMetric = $thisContainer.data().hitEvalue;

                processedRecords.push(currentHitSegments);
            } catch (error) {
                console.error('Error processing data container:', $thisContainer.attr('id'), error);
            }
        });
        console.debug(`Extracted ${processedRecords.length} visual data records.`);
        return processedRecords;
    };

    /**
     * Renders a custom legend within the SVG visualization.
     * This legend visually represents the strength of hits using a color gradient.
     * @param {d3.Selection} svgCanvas - The main D3 SVG selection.
     * @param {Object} displayConfig - Configuration options for the graph.
     * @param {number} canvasWidth - The total width of the SVG canvas.
     * @param {number} canvasHeight - The total height of the SVG canvas.
     * @private
     */
    const renderVisualLegend = function (svgCanvas, displayConfig, canvasWidth, canvasHeight) {
        // Calculate legend group position
        const legendGroup = svgCanvas.append('g')
            .attr('transform', `translate(0, ${canvasHeight - displayConfig.margin - (displayConfig.legendHeight * 1.5)})`);

        // Draw the gradient rectangle
        legendGroup.append('rect')
            .attr('x', (canvasWidth - (2 * displayConfig.margin)) * 0.7) // Position towards the right
            .attr('width', (canvasWidth - (4 * displayConfig.margin)) * 0.25) // Width of the gradient bar
            .attr('height', displayConfig.legendHeight)
            .attr('fill', 'url(#evalue-gradient)'); // Reference to the gradient definition

        // Add text label for "Weaker hits"
        legendGroup.append('text')
            .attr('transform', `translate(0, ${displayConfig.legendHeight})`)
            .attr('x', (canvasWidth - (2 * displayConfig.margin)) * 0.6 - displayConfig.margin / 2)
            .attr('text-anchor', 'end') // Align text to the end
            .text("Weaker Matches");

        // Add text label for "Stronger hits"
        legendGroup.append('text')
            .attr('transform', `translate(0, ${displayConfig.legendHeight})`)
            .attr('x', (canvasWidth - (2 * displayConfig.margin)) * 0.95 + displayConfig.margin / 2)
            .attr('text-anchor', 'start') // Align text to the start
            .text("Stronger Matches");

        // Define the linear gradient for hit strength
        svgCanvas.append('linearGradient')
            .attr('id', 'evalue-gradient')
            .attr('x1', '0%').attr('y1', '0%')
            .attr('x2', '100%').attr('y2', '0%') // Gradient from left to right
            .selectAll('stop')
            .data([
                { offset: "0%", color: "#ccc" }, // Light gray for weaker
                { offset: '50%', color: '#777' }, // Medium gray
                { offset: "100%", color: "#000" }  // Black for stronger
            ])
            .enter()
            .append('stop')
            .attr('offset', d => d.offset)
            .attr('stop-color', d => d.color);

        console.debug('Visual legend rendered.');
    };

    /**
     * Main method responsible for drawing the graphical overview of data points.
     * It orchestrates data extraction, D3 scale and axis setup, and rendering of
     * individual data tracks and their segments.
     * @param {jQuery} sourceElement - The jQuery object representing the query data source.
     * @param {jQuery} targetContainer - The jQuery object for the graph rendering area.
     * @param {number} startIndex - The starting index for data fetching (usually 0 for initial load).
     * @param {number} fetchCount - The number of data points to fetch and display.
     * @param {Object} displayOptions - Configuration options for graph rendering.
     */
    jq.extend({
        displayVisuals: function (sourceElement, targetContainer, startIndex, fetchCount, displayOptions) {
            // Check for D3 library
            if (typeof d3 === 'undefined') {
                console.error('D3.js library is required for graph visualization.');
                return false;
            }

            // Define base settings for the visualization
            const baseSettings = {
                trackHeight: 4,      // Height of each data track bar
                trackPadding: 5,     // Vertical padding between tracks
                legendHeight: 10,    // Height reserved for the legend bar
                margin: 20           // General margin around the SVG
            };

            // Merge default settings with provided options
            const currentSettings = Object.assign({}, baseSettings, displayOptions);
            const dataPoints = retrieveVisualData(sourceElement, startIndex, fetchCount);

            // Guard clause: Do not attempt to draw if no data is available
            if (!dataPoints || dataPoints.length === 0) {
                console.info('No data points to visualize. Rendering skipped.');
                return false;
            }

            // If this is not the initial render, clear previous SVG to redraw
            if (startIndex > 0) {
                // More robust way to remove all children SVG elements
                targetContainer.children('svg').remove();
                console.log('Previous SVG removed for redrawing.');
            }

            const sourceDataLength = sourceElement.data().queryLen; // Length of the query sequence
            const sourceElementId = sourceElement.attr('id');         // ID of the source query element

            const canvasWidth = targetContainer.width(); // Dynamic width of the rendering area
            // Calculate total canvas height based on data points and settings
            const canvasHeight = dataPoints.length * (currentSettings.trackHeight + currentSettings.trackPadding) +
                (currentSettings.margin * 5) + (currentSettings.legendHeight * 3);

            // Select or create the main SVG element using D3
            const mainSvgCanvas = d3.select(targetContainer[0])
                .selectAll('svg')
                .data([dataPoints]) // Bind data to SVG
                .enter()
                .insert('svg', ':first-child') // Insert new SVG before other elements
                .attr('width', canvasWidth)
                .attr('height', canvasHeight)
                .append('g') // Append a group for margins
                .attr('transform', `translate(${currentSettings.margin / 4}, ${currentSettings.margin / 4})`);

            // X-axis scale (linear scale for query length)
            const xScale = d3.scale
                .linear()
                .range([0, canvasWidth - currentSettings.margin]);
            xScale.domain([1, sourceDataLength]); // Domain from 1 to query length

            // Generate tick values for the X-axis
            const primaryTicks = xScale.ticks(10); // Generate ~10 ticks
            const xAxisGenerator = d3.svg
                .axis()
                .scale(xScale)
                .orient('top')
                .tickValues([1, sourceDataLength].concat(primaryTicks)); // Include start and end values

            // Attach the X-axis to the SVG
            mainSvgCanvas.append('g')
                .attr('transform', `translate(0, ${currentSettings.margin})`)
                .append('g')
                .attr('class', 'x-axis-labels') // Custom class for styling
                .call(xAxisGenerator);

            // Y-axis scale (ordinal scale for hit IDs)
            const yScale = d3.scale
                .ordinal()
                .rangeBands([0, canvasHeight - (currentSettings.margin * 3) - (currentSettings.legendHeight * 2)], 0.3);
            yScale.domain(dataPoints.map(d => d.hitIdentifier));

            // Color scale for E-value (logarithmic scale for hit strength)
            const eValueColorScale = d3.scale
                .log()
                .domain(d3.extent(dataPoints, d => {
                    const val = parseFloat(d.hitEValueMetric);
                    return val > 0 ? val : 1e-10; // Handle zero E-values for log scale
                }))
                .range([40, 150]); // Range for grayscale values

            // Group for all hit tracks
            mainSvgCanvas.append('g')
                .attr('class', 'data-point-track')
                .attr('transform', `translate(0, ${currentSettings.margin * 2 - currentSettings.legendHeight})`)
                .selectAll('.data-tracks')
                .data(dataPoints)
                .enter()
                .append('g')
                .attr('data-visual-tip', 'true') // Mark for tooltip configuration
                .attr('title', function (d) {
                    // Custom tooltip content with pretty-printed E-value
                    const evalue = parseFloat(d.hitEValueMetric);
                    const exponentMatch = evalue.toExponential().match(/e([+-]\d+)/);
                    let prettyEvalue = evalue.toFixed(3);
                    if (exponentMatch) {
                        prettyEvalue = `${parseFloat(evalue.toPrecision(3))} &times; 10<sup>${exponentMatch[1]}</sup>`;
                    } else if (evalue < 0.001 && evalue > 0) {
                        prettyEvalue = evalue.toExponential(2); // Use scientific for very small numbers
                    }

                    return `<strong>${d.hitDescription}</strong><br><em>E-value:</em> ${prettyEvalue}`;
                })
                .each(function (hitRecord, recordIndex) {
                    const currentHitId = hitRecord.hitIdentifier;
                    const segmentsInHit = hitRecord.length;
                    const trackYPosition = yScale(currentHitId);
                    const trackColorValue = eValueColorScale(hitRecord.hitEValueMetric);
                    // Generate a grayscale color based on E-value
                    const segmentFillColor = d3.rgb(trackColorValue, trackColorValue, trackColorValue).toString();

                    d3.select(this)
                        .selectAll('.hsp-segment')
                        .data(hitRecord)
                        .enter()
                        .append('a') // Wrap rects in anchor tags for navigation
                        .each(function (segmentData, segmentIndex) {
                            // Draw connector lines between adjacent HSPs if they are close
                            if (segmentIndex + 1 < segmentsInHit) {
                                const nextSegment = hitRecord[segmentIndex + 1];
                                const currentEnd = segmentData.hspEnd;
                                const nextStart = nextSegment.hspStart;

                                // Determine if a connector line is needed and its direction
                                if (currentEnd <= nextStart) { // Forward overlap or gap
                                    d3.select(this.parentNode)
                                        .append('line')
                                        .attr('x1', xScale(currentEnd))
                                        .attr('y1', trackYPosition + currentSettings.trackHeight / 2)
                                        .attr('x2', xScale(nextStart))
                                        .attr('y2', trackYPosition + currentSettings.trackHeight / 2)
                                        .attr('stroke', segmentFillColor)
                                        .attr('stroke-width', 1);
                                } else if (segmentData.hspStart > nextSegment.hspEnd) { // Reverse overlap
                                    d3.select(this.parentNode)
                                        .append('line')
                                        .attr('x1', xScale(nextSegment.hspEnd))
                                        .attr('y1', trackYPosition + currentSettings.trackHeight / 2)
                                        .attr('x2', xScale(segmentData.hspStart))
                                        .attr('y2', trackYPosition + currentSettings.trackHeight / 2)
                                        .attr('stroke', segmentFillColor)
                                        .attr('stroke-width', 1);
                                }
                            }

                            // Draw the rectangular hit track segment itself
                            d3.select(this)
                                .attr('xlink:href', `#${sourceElementId}_hit_${recordIndex + 1}`) // Link to corresponding hit
                                .append('rect')
                                .attr('x', d => xScale(d.hspStart))
                                .attr('y', trackYPosition)
                                .attr('width', d => Math.max(1, xScale(d.hspEnd) - xScale(d.hspStart) + xScale(1))) // Ensure min width of 1
                                .attr('height', currentSettings.trackHeight)
                                .attr('fill', segmentFillColor);
                        });
                });

            // Render the legend if there are multiple data points to show strength variations
            if (dataPoints.length >= 2) {
                renderVisualLegend(mainSvgCanvas, currentSettings, canvasWidth, canvasHeight);
            }

            // Perform initial setup for controls and responsiveness only once
            if (startIndex === 0 && !targetContainer.data('controlsInitialized')) {
                manageGraphInteractions(sourceElement, targetContainer, true);
                enableDynamicResizing(sourceElement, targetContainer, startIndex, displayOptions);
                console.info('Initial graph controls and responsiveness configured.');
            } else if (targetContainer.data('controlsInitialized')) {
                 // If controls are already initialized, just update their state
                 manageGraphInteractions(sourceElement, targetContainer, false);
            }

            // Refresh tooltips and click handlers for newly drawn elements
            configureTooltips();
            activateNavigation(targetContainer);
            console.info('Graph visualization complete.');
        }
    });
}(jQuery));