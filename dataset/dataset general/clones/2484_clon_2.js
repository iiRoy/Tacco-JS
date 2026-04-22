(function (jQry) {
    // This function configures the display parameters for all tooltips across the interface.
    var prepareTipDisplay = function () {
        jQry('[data-show-tip="true"]').tooltip({
            'placement': 'top', // Position the tooltip at the top of the element.
            'container': 'body', // Append the tooltip element to the document body.
            'html': 'true', // Allow HTML content within the tooltip.
            'white-space': 'nowrap' // Prevent text wrapping in the tooltip.
        });
    };

    // This function sets up click event handlers for anchor tags within a specified chart container.
    var configureLinkAction = function (chartContainerEl) {
        jQry('a', chartContainerEl).click(function (eventObj) {
            eventObj.preventDefault(); // Stop default browser action for the click.
            eventObj.stopPropagation(); // Halt event propagation up the DOM tree.
            window.location.hash = jQry(this).attr('href'); // Update URL hash based on link's href.
        });
    };

    // This method handles adjustments to the visual presentation based on window resizing events.
    var adaptToScreenChanges = function (sourceDataEl, chartContainerEl, startOffset, visualOptions) {
        var currentViewportWidth = jQry(window).width(); // Store the initial width of the viewport.
        var delayedRedraw = _.debounce(function () { // Create a debounced function to limit redraw frequency.
            if (currentViewportWidth !== jQry(window).width()) { // Check if the viewport width has actually changed.
                var displayedMatches = sourceDataEl.find('.graphic-match-item > group').length; // Count currently visible graphic elements.
                jQry.displayVisualContent(sourceDataEl, chartContainerEl, displayedMatches, startOffset, visualOptions); // Redraw the chart with updated parameters.
                currentViewportWidth = jQry(window).width(); // Update the stored width.
            }
        }, 125); // Execute the redraw logic at most once every 125 milliseconds.
        jQry(window).resize(delayedRedraw); // Attach the debounced function to the window's resize event.
    };

    // This module manages the interactive controls for the graphical representation.
    var visualChartManager = function (sourceDataEl, chartContainerEl, isFirstLoad) {
        var MIN_VISIBLE_ITEMS = 20; // Define the minimum number of graphic items to display.

        var totalMatches, displayedMatches, shrinkBtn, expandBtn; // Declare variables for item counts and control buttons.

        // Counts the total and currently displayed graphic matches.
        var tallyElements = function () {
            totalMatches = sourceDataEl.data().totalItemCount; // Retrieve total count from data attributes.
            displayedMatches = sourceDataEl.find('.graphic-match-item > group').length; // Count items currently rendered in the chart.
        };

        // Dynamically creates and appends 'Show More' and 'Show Less' buttons to the chart area.
        var createControlWidgets = function(sourceDataEl, chartContainerEl) {
            chartContainerEl
            .append(
                jQry('<button/>')
                .addClass('action-btn link-button expand-widget') // Apply styling classes for expand button.
                .attr('type', 'button') // Set button type.
                .attr('data-associated-source', sourceDataEl.attr('uniqueId')) // Link button to its parent query.
                .html('Show More&nbsp;') // Button text.
                .append(
                    jQry('<i/>')
                    .addClass('icon icon-arrow-down-double') // Add an icon for visual cue.
                ),
                jQry('<button/>')
                .addClass('action-btn link-button shrink-widget') // Apply styling classes for shrink button.
                .attr('type', 'button') // Set button type.
                .attr('data-associated-source', sourceDataEl.attr('uniqueId')) // Link button to its parent query.
                .html('Show Less&nbsp;') // Button text.
                .append(
                    jQry('<i/>')
                    .addClass('icon icon-arrow-up-double') // Add an icon for visual cue.
                )
            );

            shrinkBtn = jQry('.shrink-widget', chartContainerEl); // Get reference to the 'Show Less' button.
            expandBtn = jQry('.expand-widget', chartContainerEl); // Get reference to the 'Show More' button.
        };

        // Sets the initial visibility state of the 'Show More/Less' buttons based on current item counts.
        var initializeWidgetStates = function () {
            tallyElements(); // Update counts before determining button states.
            if (totalMatches === MIN_VISIBLE_ITEMS ||
                displayedMatches < MIN_VISIBLE_ITEMS) {
                shrinkBtn.hide(); // Hide 'Show Less' if total matches are at minimum or fewer than minimum.
                expandBtn.hide(); // Hide 'Show More' as well in this scenario.
            }
            else if (displayedMatches === totalMatches) {
                expandBtn.hide(); // Hide 'Show More' if all available matches are already displayed.
                shrinkBtn.show(); // Show 'Show Less' to allow reducing the view.
            }
            else if (displayedMatches === MIN_VISIBLE_ITEMS) {
                shrinkBtn.hide(); // Hide 'Show Less' if only the minimum number of items are shown.
                expandBtn.show(); // Show 'Show More' to allow expanding the view.
            }
            else {
                shrinkBtn.show(); // In other cases, both buttons might be relevant.
                expandBtn.show(); // Show both 'Show More' and 'Show Less'.
            }
        };

        // Create buttons and set their initial states only during the first initialization.
        if (isFirstLoad === true) {
            createControlWidgets(sourceDataEl, chartContainerEl);
            initializeWidgetStates();
        }

        // Attach click handler to the 'Show More' button.
        expandBtn.on('click', function (eventObj) {
            tallyElements(); // Recalculate current item counts.
            jQry.displayVisualContent(sourceDataEl, chartContainerEl, displayedMatches, MIN_VISIBLE_ITEMS); // Render more items.
            initializeWidgetStates(); // Update button visibility.
            prepareTipDisplay(); // Re-initialize tooltips for new elements.
            eventObj.stopPropagation(); // Prevent event bubbling.
        });

        // Attach click handler to the 'Show Less' button.
        shrinkBtn.on('click', function (eventObj) {
            tallyElements(); // Recalculate current item counts.
            var differenceAmount = displayedMatches - MIN_VISIBLE_ITEMS; // Calculate how many items are above the minimum.

            // Decrease the number of visible items by a predefined constant.
            if (differenceAmount >= MIN_VISIBLE_ITEMS) {
                jQry.displayVisualContent(sourceDataEl, chartContainerEl, displayedMatches, -MIN_VISIBLE_ITEMS); // Remove a block of items.
                initializeWidgetStates(); // Adjust button visibility.
            }
            else if (differenceAmount !== 0) {
                // Ensure a base number of items always remains in the visualization.
                jQry.displayVisualContent(sourceDataEl, chartContainerEl, displayedMatches, MIN_VISIBLE_ITEMS - displayedMatches); // Adjust to show exactly the minimum.
                initializeWidgetStates(); // Adjust button visibility.
            }
            prepareTipDisplay(); // Re-initialize tooltips for potentially new or changed elements.
            eventObj.stopPropagation(); // Prevent event bubbling.
        });
    };

    /* This routine retrieves relevant data from the document's data attributes
     * and organizes it into a suitable object structure for visualization.
     */
    var retrieveVisualInfo = function (sourceDataEl, startOffset, itemCount) {
        var matchPanels, matchData = []; // Declare variables for selected panels and aggregated match data.
        matchPanels = sourceDataEl.find('.match-entry').slice(0, startOffset + itemCount); // Select relevant match entries based on offset and count.
        matchPanels.map(function () {
            var currentElement = jQry(this); // Reference to the current DOM element in the map loop.
            var hspDataCollection = []; // Array to store High-scoring Segment Pair (HSP) data.
            currentElement.find('.hsp-segment').each(function () {
                var singleHspData = []; // Temporary variable for individual HSP data.
                singleHspData = jQry(this).data(); // Extract data attributes from the HSP segment.
                singleHspData.segmentId = this.uniqueId; // Assign the unique ID of the HSP element.
                hspDataCollection.push(singleHspData); // Add individual HSP data to the collection.
            });
            hspDataCollection.matchId = currentElement.attr('uniqueId'); // Assign the match's unique ID.
            hspDataCollection.matchDefinition = currentElement.data().matchDefinition; // Assign the match's definition.
            hspDataCollection.matchEvalue = currentElement.data().matchEvalue; // Assign the match's E-value.
            matchData.push(hspDataCollection); // Add the complete match data to the main array.
        });
        return matchData; // Return the structured data.
    };

    // Renders the color intensity key for the visualization within the SVG canvas.
    var renderKeyExplanation = function (canvasElement, displaySettings, canvasWidth, canvasHeight) {
        var legendGroup = canvasElement.append('g') // Create a new SVG group for the legend.
            .attr('transform',
                'translate(0,' + (canvasHeight - displaySettings.margin - displaySettings.legend * 1.25) + ')'); // Position the legend group.

        legendGroup.append('rect') // Add a rectangle for the gradient fill.
            .attr('x', 7 * (canvasWidth - 2 * displaySettings.margin) / 10) // X position.
            .attr('width', 2 * (canvasWidth - 4 * displaySettings.margin) / 10) // Width of the gradient bar.
            .attr('height', displaySettings.legend) // Height of the gradient bar.
            .attr('fill', 'url(#gradient-key-fill)'); // Apply a CSS gradient ID.

        legendGroup.append('text') // Add text label for 'Less Significant Matches'.
            .attr('transform', 'translate(0, ' + displaySettings.legend + ')') // Position the text relative to the legend group.
            .attr('x', 6 * (canvasWidth - 2 * displaySettings.margin) / 10 - displaySettings.margin / 2) // X position.
            .text("Less Significant Matches"); // Text content.

        legendGroup.append('text') // Add text label for 'More Significant Matches'.
            .attr('transform', 'translate(0, ' + displaySettings.legend + ')') // Position the text relative to the legend group.
            .attr('x', 9 * (canvasWidth - 2 * displaySettings.margin) / 10 + displaySettings.margin / 2) // X position.
            .text("More Significant Matches"); // Text content.

        canvasElement.append('linearGradient') // Define a linear gradient within the SVG.
            .attr('id', 'gradient-key-fill') // Assign an ID to the gradient.
        .selectAll('stop') // Select all stop elements (none exist yet).
        .data([ // Bind data for gradient stops.
            {offset: "0%", color: "#ccc"}, // Light gray for weaker.
            {offset: '50%', color: '#888'}, // Medium gray.
            {offset: "100%", color: "#000"} // Black for stronger.
        ])
        .enter()
        .append('stop') // Create stop elements based on data.
            .attr('offset', function (datumItem) {
                return datumItem.offset; // Set offset from data.
            })
            .attr('stop-color', function (datumItem) {
                return datumItem.color; // Set color from data.
            });
    };

    /* This is the primary function responsible for rendering the graphical overview.
     * It takes the source data container, the target chart container, and configuration
     * options to draw the visualization.
     */
    jQry.extend({
        displayVisualContent: function (sourceDataEl, chartContainerEl, startOffset, itemCount, visualOptions) {
            /* barHeight: The vertical dimension for each individual match track.
             * barPadding: The spacing between adjacent match tracks.
             * legend: The vertical space allocated for the explanatory key.
             * margin: The general spacing around the entire SVG visualization.
             */
            var defaultDisplayConfig = {
                barHeight: 4, // Default height for a single bar.
                barPadding: 5, // Default padding between bars.
                legend: 10, // Default height for the legend area.
                margin: 20 // Default margin around the SVG.
            },
                displaySettings = jQry.extend(defaultDisplayConfig, visualOptions), // Merge defaults with provided options.
                matchData = retrieveVisualInfo(sourceDataEl, startOffset, itemCount); // Obtain processed data for drawing.

            // If no match data is retrieved, there's nothing to draw.
            if (matchData.length < 1) return false;

            // If this is not the initial draw, clear existing SVG to redraw.
            if (startOffset !== 0) {
                // Currently, a complete redraw is performed to extend the graph.
                // Future improvement: implement incremental updates.
                chartContainerEl.find('svg').remove();
            }

            var querySequenceLength = sourceDataEl.data().sequenceLength; // Get the total length of the query sequence.
            var queryIdentifier = sourceDataEl.attr('uniqueId'); // Get the unique ID of the query.

            var canvasWidth = chartContainerEl.width(); // Determine the available width for the SVG.
            var canvasHeight = matchData.length * (displaySettings.barHeight + displaySettings.barPadding) +
                5 * displaySettings.margin + displaySettings.legend * 3; // Calculate total height for the SVG.

            var canvasElement = d3.select(chartContainerEl[0]) // Select the chart container using D3.
                .selectAll('svg') // Select existing SVGs (or none).
                .data([matchData]) // Bind the match data to the SVG.
                .enter()
                .insert('svg', ':first-child') // Insert a new SVG as the first child if none exist.
                    .attr('width', canvasWidth) // Set the width of the SVG.
                    .attr('height', canvasHeight) // Set the height of the SVG.
                .append('g') // Append a main group element for transformations.
                    .attr('transform', 'translate(' + displaySettings.margin / 4 + ', ' + displaySettings.margin / 4 + ')'); // Apply an initial translation.

            var xScale = d3.scale // Create a linear scale for the x-axis.
                .linear()
                .range([0, canvasWidth - displaySettings.margin]); // Map data to the width of the chart area.

            xScale.domain([1, querySequenceLength]); // Set the domain of the x-scale from 1 to query length.

            var tickValuesArray = xScale.ticks(11); // Generate approximately 11 tick values.
            tickValuesArray.pop(); // Remove the last tick value to avoid overlap.

            var xAxisGenerator = d3.svg // Create an x-axis generator.
                .axis()
                .scale(xScale) // Associate with the x-scale.
                .orient('top') // Position the axis labels above the axis line.
                .tickValues(tickValuesArray.concat([1, querySequenceLength])); // Define specific tick values.

            // Add the x-axis to the SVG canvas.
            canvasElement.append('g')
                .attr('transform', 'translate(0, ' + displaySettings.margin + ')') // Position the axis group.
                .append('g')
                    .attr('class', 'x-coordinate-axis') // Assign a class for styling.
                    .call(xAxisGenerator); // Render the axis.

            var yScale = d3.scale // Create an ordinal scale for the y-axis.
                .ordinal()
                .rangeBands([0, canvasHeight - 3 * displaySettings.margin - 2 * displaySettings.legend], 0.3); // Map data to vertical bands with padding.

            yScale.domain(matchData.map(function (datumItem) {
                return datumItem.matchId; // Use match IDs as the domain for the y-scale.
            }));

            var gradientColorScale = d3.scale // Create a logarithmic scale for color intensity based on E-value.
                .log()
                .domain([
                    d3.min([1e-5, d3.min(matchData.map(function (datumItem) {
                        if (parseFloat(datumItem.matchEvalue) === 0.0) return undefined; // Handle zero E-values.
                        return datumItem.matchEvalue; // Get E-value for min calculation.
                        }))
                    ]),
                    d3.max(matchData.map(function (datumItem) {
                        return datumItem.matchEvalue; // Get E-value for max calculation.
                    }))
                ])
                .range([40,150]); // Map E-values to a range of color component values.

            canvasElement.append('g')
                .attr('class', 'graphic-match-item') // Group for all match items.
                .attr('transform', 'translate(0, ' + (2 * displaySettings.margin - displaySettings.legend) + ')') // Position the group.
                .selectAll('.match-tracks') // Select all match tracks (none yet).
                .data(matchData) // Bind match data.
                .enter()
                .append('g') // Create a group for each match.
                    .attr('data-show-tip', 'true') // Enable tooltip for this group.
                    .attr('description', function(datumItem) {
                        // Format the E-value for display in the tooltip.
                        var eValueRegex = /(\d*\.\d*)e?([+-]\d*)?/; // Regex to parse scientific notation.
                        var parsedEValue = eValueRegex.exec(datumItem.matchEvalue); // Execute regex.
                        var formattedEValue = parseFloat(parsedEValue[1]).toFixed(3); // Format the mantissa.
                        var tooltipContent = datumItem.matchDefinition + '<br><strong>E-Value:</strong> ' + formattedEValue; // Initial tooltip string.
                        if (parsedEValue[2] !== undefined) {
                            tooltipContent +=  ' &times; 10<sup>' + parsedEValue[2] + '</sup>'; // Add exponent if present.
                        }
                        return tooltipContent; // Return the full tooltip content.
                    })
                    .each(function (datumItem, idx) {
                        // TODO: Refactor variable names for better clarity if needed.
                        var hitIndexNumbered = idx + 1; // 1-based index for current hit.
                        var parentHspGroup = datumItem; // Reference to the current match's HSP data.
                        var parentHspId = datumItem.matchId; // ID of the current match.
                        var parentHspCount = datumItem.length; // Number of HSPs in this match.

                        d3.select(this)
                        .selectAll('.hsp-elements') // Select HSP elements (none yet).
                        .data(datumItem).enter() // Bind individual HSP data.
                        .append('a') // Append an anchor tag for each HSP.
                        .each(function (_unused, innerIdx) {
                            // Draw the connector line between adjacent HSPs with a color based on E-value.
                            var hspLineYCoord = yScale(parentHspId) + displaySettings.barHeight / 2; // Y coordinate for the connector line.
                            var hspLineColorValue = d3.rgb(gradientColorScale(parentHspGroup.matchEvalue),
                                                      gradientColorScale(parentHspGroup.matchEvalue),
                                                      gradientColorScale(parentHspGroup.matchEvalue)); // Calculate RGB color.

                            if (innerIdx + 1 < parentHspCount) { // Check if there's a next HSP to connect to.
                                if (parentHspGroup[innerIdx].segmentEnd <= parentHspGroup[innerIdx+1].segmentBegin) {
                                    d3.select(this.parentNode)
                                    .append('line') // Draw a line.
                                        .attr('x1', xScale(parentHspGroup[innerIdx].segmentEnd)) // Start X of line.
                                        .attr('y1', hspLineYCoord) // Start Y of line.
                                        .attr('x2', xScale(parentHspGroup[innerIdx+1].segmentBegin)) // End X of line.
                                        .attr('y2', hspLineYCoord) // End Y of line.
                                        .attr('stroke', hspLineColorValue); // Set line color.
                                }
                                else if (parentHspGroup[innerIdx].segmentBegin > parentHspGroup[innerIdx+1].segmentEnd) {
                                    d3.select(this.parentNode)
                                    .append('line') // Draw a line.
                                        .attr('x1', xScale(parentHspGroup[innerIdx+1].segmentEnd)) // Start X of line.
                                        .attr('y1', hspLineYCoord) // Start Y of line.
                                        .attr('x2', xScale(parentHspGroup[innerIdx].segmentBegin)) // End X of line.
                                        .attr('y2', hspLineYCoord) // End Y of line.
                                        .attr('stroke', hspLineColorValue); // Set line color.
                                }
                            }

                            // Render the rectangular segments representing the HSPs themselves.
                            d3.select(this)
                                .attr('hyperlink:target', '#' + queryIdentifier + '_hit_' + hitIndexNumbered) // Set hyperlink target.
                                .append('rect') // Append a rectangle.
                                    .attr('x', function (dataPoint) {
                                        return xScale(dataPoint.segmentBegin); // X position based on segment start.
                                    })
                                    .attr('y', yScale(parentHspId)) // Y position based on parent match ID.
                                    .attr('width', function (dataPoint) {
                                        return xScale(dataPoint.segmentEnd - dataPoint.segmentBegin + 1); // Width based on segment length.
                                    })
                                    .attr('height', displaySettings.barHeight) // Height of the rectangle.
                                    .attr('fill', d3.rgb(hspLineColorValue)); // Fill color based on E-value.
                        });
                    });

            // Only draw the legend if there's more than one match to visualize.
            if (matchData.length > 1) {
                renderKeyExplanation(canvasElement, displaySettings, canvasWidth, canvasHeight);
            }
            // Bind event listeners for controls and responsiveness only on the initial render.
            if (startOffset === 0) {
                visualChartManager(sourceDataEl, chartContainerEl, true); // Initialize chart controls.
                // Re-draw the SVG visualization whenever the browser window is resized.
                adaptToScreenChanges(sourceDataEl, chartContainerEl, startOffset, visualOptions);
            }
            // Refresh all tooltips after the visualization has been updated or drawn.
            prepareTipDisplay();
            // Ensure that clicking on a graphic segment navigates correctly across browsers.
            configureLinkAction(chartContainerEl);
        }
    });
}(jQuery));