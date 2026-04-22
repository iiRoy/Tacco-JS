/*
 * Module: DataVisualization
 * Description: Manages interactive chart elements and statistical displays.
 * Author: CodeGen
 * Date: 2023-10-27
 */

"use strict"; /* Enforce strict JavaScript parsing and error handling rules */

(function (displayUtility) {

    // Function to handle the mouse cursor entering an arc segment in the visualization.
    displayUtility.handleMouseEnterArc = function (inputDataEntry) {
        displayUtility.layers.statsDisplay.bringToFront(); // Ensures the statistics layer is on top.
        if (!inputDataEntry._graphicElement) {
            return;
        }

        inputDataEntry._graphicElement.selectAll("path.segment")
            .style({
                "fill-opacity": 0.59, // Sets fill transparency for segments.
                "stroke-width": 1.0,  // Defines the stroke thickness.
                "stroke": function () { return convertToRgba("#000000", 1.0); } // Applies a solid black stroke color.
            });

        const currentElementRef = inputDataEntry._graphicElement.node(); // Retrieves the underlying DOM node.
        if (currentElementRef.deletionBar) { // Checks for the existence of a deletion bar.
            currentElementRef.deletionBar
                .transition() // Initiates a transition for smooth animation.
                .attr("d", currentElementRef.deletionPathGenerator.startAngle(Math.PI / 2.0 + minorAngleOffset) // Sets start angle for deletion arc.
                    .endAngle(Math.PI / 2.0 * 3.0 - minorAngleOffset)()); // Sets end angle for deletion arc.
        }

        if (currentElementRef.additionBar) { // Checks for the existence of an addition bar.
            currentElementRef.additionBar
                .transition() // Initiates a transition.
                .attr("d", currentElementRef.additionPathGenerator.startAngle(-Math.PI / 2.0 + minorAngleOffset) // Sets start angle for addition arc.
                    .endAngle(Math.PI / 2.0 - minorAngleOffset)()); // Sets end angle for addition arc.
        }

        inputDataEntry._graphicElement.selectAll("text.removed, text.added")
            .style("visibility", "visible"); // Makes the text labels visible for this element.

        infoPopup.selectAll("*").remove(); // Clears all existing content from the info popup.

        infoPopup.append("div").attr("class", "data-row") // Appends a new div with a specific class.
            .append("blockquote") // Adds a blockquote element.
            .text(inputDataEntry.message.split("\n")[0]); // Displays the first line of the message in the blockquote.

        infoPopup.append("div").attr("class", "data-row user-details expanded").call(function (containerDiv) {
            containerDiv = containerDiv.append("div").attr("class", "statistics-info"); // Creates an inner div for statistics.

            containerDiv.node().appendChild(inputDataEntry.author.avatar); // Inserts the author's avatar image.
            containerDiv.append("ul").call(function (unorderedList) {
                // Displays author's name or login if available.
                (inputDataEntry.author.name || inputDataEntry.author.login) && unorderedList.append("li").call(function (listItem) {
                    listItem.append("h1")
                        .text((inputDataEntry.author.name || inputDataEntry.author.login)); // Heading for author name.
                    listItem.append("hr"); // A horizontal rule for separation.
                });
                unorderedList.append("li").call(function (listItem) {
                    listItem.append("span")
                        .attr("class", "small-icon icon-clock"); // Icon for time.
                    listItem.append("strong")
                        .text(dateTimeFormatter(inputDataEntry.date)); // Formatted date and time.
                });
                unorderedList.append("li").call(function (listItem) {
                    listItem.text("checksum: "); // Label for SHA.
                    listItem.append("strong")
                        .text(inputDataEntry.sha.substr(0, 10)); // Displays a truncated SHA hash.
                });
                unorderedList.append("li").append("hr"); // Another horizontal rule.
                if (inputDataEntry.files.length) { // Only proceed if there are files.
                    unorderedList.append("li")
                        .call(function (listItem) {
                            let propertyKey, // Loop variable for object keys.
                                statusCounts = inputDataEntry.files.reduce(function (accumulator, currentFile) {
                                    for (propertyKey in FILE_STATUS_TYPES) { // Iterates through defined file status types.
                                        if (FILE_STATUS_TYPES.hasOwnProperty(propertyKey) // Ensures property is not from prototype chain.
                                            && currentFile.status === FILE_STATUS_TYPES[propertyKey]) {
                                            accumulator[propertyKey] = (accumulator[propertyKey] || 0); // Initializes or increments count.
                                            accumulator[propertyKey]++;
                                            break; // Breaks after finding a match.
                                        }
                                    }
                                    return accumulator; // Returns the updated accumulator.
                                }, {}); // Initial empty object for counts.
                            listItem = listItem.append("ul")
                                .attr("class", "config-items"); // Nested list for configuration items.
                            listItem = listItem.append("li").attr("class", "detail-field"); // A list item acting as a field.
                            listItem.append("h1")
                                .text("Modified files:"); // Header for modified files section.
                            for (propertyKey in statusCounts) {
                                if (statusCounts.hasOwnProperty(propertyKey)) { // Ensures direct property.
                                    listItem.append("ul")
                                        .attr("class", "item-group") // Grouping for related items.
                                        .append("li")
                                        .attr("class", "detail-field")
                                        .append("span")
                                        .text(propertyKey + ": ") // Displays the status type.
                                        .append("strong")
                                        .text(statusCounts[propertyKey]); // Displays the count for that status.
                                }
                            }
                        });
                }
                unorderedList.append("li")
                    .call(function (listItem) {
                        listItem = listItem.append("ul")
                            .attr("class", "config-items");
                        listItem = listItem.append("li").attr("class", "detail-field");
                        listItem.append("h1")
                            .text("Changed lines total:"); // Header for changed lines section.
                        const lineStats = { totalChanges: "", additionsCount: " + ", deletionsCount: " - " }; // Labels for line statistics.
                        for (let propertyKey in lineStats) {
                            if (lineStats.hasOwnProperty(propertyKey)) {
                                if (inputDataEntry.stats.hasOwnProperty(propertyKey)) { // Checks if the statistic exists.
                                    listItem.append("ul")
                                        .attr("class", "item-group")
                                        .append("li")
                                        .attr("class", "detail-field")
                                        .append("span")
                                        .text(propertyKey + ": ")
                                        .append("strong")
                                        .style("color", dataVizLib.rgb(colorPalette[propertyKey]).darker(0.19)) // Styles text color.
                                        .text(lineStats[propertyKey] + valueFormatter(inputDataEntry.stats[propertyKey])); // Displays formatted value.
                                }
                            }
                        }
                    });

            });
        });

        infoPopup.show(); // Activates and displays the info popup.
    };

    // Function handling the mouse cursor leaving an arc segment.
    displayUtility.handleMouseLeaveArc = function (inputDataEntry) {
        if (!inputDataEntry._graphicElement) {
            return;
        }

        inputDataEntry._graphicElement.selectAll("path.segment")
            .style({
                "fill-opacity": 0.29, // Resets fill transparency to a lower value.
                "stroke": null // Removes the stroke from segments.
            });

        const currentElementRef = inputDataEntry._graphicElement.node(); // Retrieves the DOM node.
        if (!currentElementRef) {
            return;
        }

        if (currentElementRef.deletionBar) {
            currentElementRef.deletionBar
                .transition()
                .duration(749) // Sets transition duration.
                .ease("bounce") // Applies a bounce easing function.
                .attr("d", currentElementRef.deletionPathGenerator.startAngle(Math.PI - minorAngleOffset) // Resets deletion arc start angle.
                    .endAngle(Math.PI + minorAngleOffset)()); // Resets deletion arc end angle.
        }

        if (currentElementRef.additionBar) {
            currentElementRef.additionBar
                .transition()
                .duration(749) // Sets transition duration.
                .ease("bounce") // Applies a bounce easing function.
                .attr("d", currentElementRef.additionPathGenerator.startAngle(-minorAngleOffset) // Resets addition arc start angle.
                    .endAngle(minorAngleOffset)()); // Resets addition arc end angle.
        }

        inputDataEntry._graphicElement.selectAll("text.removed")
            .style("visibility", inputDataEntry.stats && inputDataEntry.stats.delTextVis ? inputDataEntry.stats.delTextVis : "hidden"); // Sets visibility for removed text.

        inputDataEntry._graphicElement.selectAll("text.added")
            .style("visibility", inputDataEntry.stats && inputDataEntry.stats.addTextVis ? inputDataEntry.stats.addTextVis : "hidden"); // Sets visibility for added text.

        infoPopup.hide(); // Conceals the information popup.
    };

    // Function for handling mouse movement over an arc segment.
    displayUtility.handleMouseMoveArc = function (inputDataEntry) {
        displayUtility.trackTooltipPosition(inputDataEntry); // Calls a utility to update tooltip position.
    };

    // Clears all visual elements from the statistics display layer.
    displayUtility.resetStatisticsDisplay = function () {
        if (displayUtility.layers && displayUtility.layers.statsDisplay) {
            displayUtility.layers.statsDisplay.selectAll("*").remove(); // Removes all child elements.
            if (displayUtility.layers.statsDisplay.container) {
                displayUtility.layers.statsDisplay.container = null; // Dereferences the container.
            }
        }
    };

    // Redraws or updates the statistics chart based on new data.
    displayUtility.updateStatisticsChart = function (statisticInfo, renderGroup) {

        renderGroup = renderGroup || displayUtility.layers.statsDisplay; // Assigns default render group if not provided.

        const commitEntries = statisticInfo && statisticInfo.commits ? statisticInfo.commits.values() : null; // Extracts commit data.

        if (!commitEntries || !commitEntries.length) {
            displayUtility.resetStatisticsDisplay(); // Clears display if no commit data.
            return;
        }

        let dateRangeBounds = dataVizLib.extent(statisticInfo.dates); // Determines the min and max dates.
        let timeSpanDelta = (dateRangeBounds[1] - dateRangeBounds[0]) * 0.11; // Calculates a time span delta.

        timeSpanDelta = timeSpanDelta || ONE_DAY_MILLIS; // Ensures delta is at least one day.

        dateRangeBounds = [dateRangeBounds[0] - timeSpanDelta, dateRangeBounds[1] + timeSpanDelta]; // Expands the date range.

        const xAxisScale = dataVizLib.time.scale()
            .domain(dataVizLib.extent(dateRangeBounds)) // Sets the domain for the X-axis.
            .range([0, chartWidth - chartMargins.left - chartMargins.right]); // Sets the range for the X-axis.
        // .nice(dataVizLib.time.year); // Optional: makes the domain "nice" for years.

        const sixthHeight = chartHeight / 6.0; // Pre-calculates one-sixth of the chart height.

        const yAxisScale = dataVizLib.scale.linear()
            .range([2.0, sixthHeight * 2.0]) // Sets the output range for the Y-axis.
            .domain([0, statisticInfo.stats.totalChanges || 1]); // Sets the input domain for the Y-axis.

        const sortedCommits = commitEntries.slice(0).concat([
            { date: dateRangeBounds[0] + timeSpanDelta / 2.0, f: { d: 0, a: 0, m: 0 } }, // Dummy data point for start.
            { date: dateRangeBounds[1] - timeSpanDelta / 2.0, f: { d: 0, a: 0, m: 0 } } // Dummy data point for end.
        ]).sort(displayUtility.sortCommitsByDate); // Sorts commit entries by date.

        const areaLayers =
            [
                {
                    color: colorPalette.deletedFile,
                    values: sortedCommits.map(function (entry) {
                        return { type: 1, xCoord: entry.date, y0Coord: 0, yCoord: (entry.stats ? -entry.stats.f.d : 0) }; // Data for deleted files.
                    })
                },
                {
                    color: colorPalette.modifiedFile,
                    values: sortedCommits.map(function (entry) {
                        return { xCoord: entry.date, y0Coord: 0, yCoord: (entry.stats ? entry.stats.f.m : 0) }; // Data for modified files.
                    })
                },
                {
                    color: colorPalette.addedFile,
                    values: sortedCommits.map(function (entry) {
                        return { xCoord: entry.date, y0Coord: (entry.stats ? entry.stats.f.m : 0), yCoord: (entry.stats ? entry.stats.f.a : 0) }; // Data for added files.
                    })
                }
            ];

        // Custom interpolation function to draw smooth paths for area charts.
        function customPathInterpolator(pointCoordinates) {
            let startCoordX = pointCoordinates[0][0], startCoordY = pointCoordinates[0][1], endCoordX, endCoordY, midCoordX,
                svgPathSegments = [startCoordX, ",", startCoordY], // Initializes path with first point.
                loopIndex = 0,
                totalPoints = pointCoordinates.length;
            while (++loopIndex < totalPoints) {
                endCoordX = pointCoordinates[loopIndex][0];
                endCoordY = pointCoordinates[loopIndex][1];
                midCoordX = (startCoordX + endCoordX) / 2.0; // Midpoint for Bezier curve.
                svgPathSegments.push("C", midCoordX, ",", startCoordY, " ", midCoordX, ",", endCoordY, " ", endCoordX, ",", endCoordY); // Adds Bezier curve segment.
                startCoordX = endCoordX;
                startCoordY = endCoordY;
            }
            return svgPathSegments.join(""); // Returns the complete SVG path string.
        }

        const yFileCountScale = dataVizLib.scale.linear()
            .range([sixthHeight * 4.5, sixthHeight * 3.0, sixthHeight * 1.5]) // Range for file count Y-axis.
            .domain([-statisticInfo.stats.files, 0, statisticInfo.stats.files]); // Domain for file count Y-axis.
        const areaGenerator = dataVizLib.svg.area()
            .interpolate(customPathInterpolator /*true ? "straight" : "smooth"*/) // Uses custom interpolator for area.
            .x(function (entry) { return xAxisScale(entry.xCoord); }) // X-coordinate mapping.
            .y0(function (entry) { return yFileCountScale(entry.y0Coord); }) // Y0-coordinate mapping (base of area).
            .y1(function (entry) { return yFileCountScale(entry.y0Coord + entry.yCoord); }); // Y1-coordinate mapping (top of area).

        const xAxisGenerator = dataVizLib.svg.axis()
            .scale(xAxisScale); // Creates an X-axis generator.

        renderGroup.container = renderGroup.container || renderGroup
            .append("g") // Appends a new group element if container doesn't exist.
            .attr("transform", "translate(" + chartMargins.left + "," + chartMargins.top + ")"); // Positions the container.

        renderGroup.container.selectAll("path.file-area").remove(); // Removes any previously rendered file area paths.

        renderGroup.container.selectAll("path.file-area")
            .data(areaLayers) // Binds data to area layers.
            .enter()
            .insert("path", ":first-child") // Inserts new paths as first children.
            .attr("class", "file-area") // Assigns CSS class.
            .style("stroke", function (layerData) { return layerData.color; }) // Sets stroke color.
            .style("stroke-opacity", 0.49) // Sets stroke transparency.
            .style("fill-opacity", 0.09) // Sets fill transparency.
            .style("fill", function (layerData) { return layerData.color; }) // Sets fill color.
            .transition() // Starts transition.
            .duration(749) // Transition duration.
            .attr("d", function (layerData) { return areaGenerator(layerData.values); }); // Animates path 'd' attribute.

        renderGroup.container.axisElement = renderGroup.container.axisElement || renderGroup.container.append("g")
            .attr("class", "x-axis-line") // Assigns CSS class for X-axis.
            .attr("transform", "translate(0," + chartHeight / 2.0 + ")"); // Positions the X-axis.

        renderGroup.container.axisElement
            .selectAll("*").remove(); // Clears previous X-axis elements.

        renderGroup.container.axisElement
            .call(xAxisGenerator) // Renders the X-axis.
            .selectAll("text") // Selects all text labels on the axis.
            .attr("y", 0.0)
            .attr("x", 9.0)
            .attr("dy", ".34em") // Adjusts vertical position of text.
            .attr("transform", "rotate(90)") // Rotates text labels.
            .style("text-anchor", "start") // Sets text alignment.
            .style("fill", function (labelData) {
                return parseInt(this.textContent) ? "#ffffff" : null; // Fills numeric labels with white.
            })
            .style("font-size", function (labelData) {
                return parseInt(this.textContent) ? "12.0px" : null; // Sets font size for numeric labels.
            })
            .style("font-weight", function (labelData) {
                return parseInt(this.textContent) ? "bold" : null; // Makes numeric labels bold.
            });

        renderGroup.container.dataPoints = renderGroup.container.dataPoints || renderGroup.container.append("g")
            .attr("transform", "translate(0," + chartHeight / 2.0 + ")"); // Creates a group for data points.

        const commitRenderData = renderGroup.container.dataPoints.selectAll("g.commit-point")
            .data(commitEntries, function (entry) { return entry.sha; }); // Binds commit data to group elements.
        commitRenderData.enter()
            .append("g") // Appends new group elements for new data.
            .attr("class", "commit-point") // Assigns CSS class.
            .on("mouseover", displayUtility.handleMouseEnterArc) // Attaches mouseover event handler.
            .on("mouseout", displayUtility.handleMouseLeaveArc) // Attaches mouseout event handler.
            .on("mousemove", displayUtility.handleMouseMoveArc); // Attaches mousemove event handler.

        commitRenderData.each(function (entry, index) {
            let groupElement = entry._graphicElement = dataVizLib.select(this); // Selects the current group element.
            groupElement.transition()
                .duration(1499) // Sets transition duration.
                .ease("bounce") // Applies bounce easing.
                .attr("transform", "translate(" + [xAxisScale(entry.date), 0] + ")"); // Animates position.

            this.centralPoint = this.centralPoint || groupElement.append("circle") // Appends a central circle if not exists.
                .attr("r", 2.0) // Sets circle radius.
                .style("fill", colorPalette.centerColor); // Sets circle fill color.

            if (!entry.stats) { // Skips if no statistics data.
                return;
            }

            const additionArcGen = dataVizLib.svg.arc() // Generator for addition arc path.
                .innerRadius(1.0)
                .outerRadius(1.0)
                .startAngle(-minorAngleOffset)
                .endAngle(minorAngleOffset);
            const deletionArcGen = dataVizLib.svg.arc() // Generator for deletion arc path.
                .innerRadius(1.0)
                .outerRadius(1.0)
                .startAngle(Math.PI - minorAngleOffset)
                .endAngle(Math.PI + minorAngleOffset);

            (this.additionBar || ( // Creates addition bar if it doesn't exist.
                this.additionBar = groupElement.append("path")
                    .attr("class", "segment")
                    .style({
                        "fill": colorPalette.additionsColor,
                        "fill-opacity": 0.29
                    })
                    .attr("d", additionArcGen())
            ))
                .transition()
                .duration(749)
                .ease("bounce")
                .attr("d", additionArcGen.outerRadius(yAxisScale(entry.stats.additions))()); // Animates outer radius based on additions.

            (this.deletionBar || ( // Creates deletion bar if it doesn't exist.
                this.deletionBar = groupElement.append("path")
                    .attr("class", "segment")
                    .style({
                        "fill": colorPalette.deletionsColor,
                        "fill-opacity": 0.29
                    })
                    .attr("d", deletionArcGen())
            ))
                .transition()
                .duration(749)
                .ease("bounce")
                .attr("d", deletionArcGen.outerRadius(yAxisScale(entry.stats.deletions))()); // Animates outer radius based on deletions.

            function scaleRadius(size, factor) {
                return size * (1.0 + factor); // Helper function to scale a radius.
            }

            const additionArcTopGen = dataVizLib.svg.arc() // Generator for top addition arc.
                .innerRadius(scaleRadius(yAxisScale(entry.stats.additions), 0.014))
                .outerRadius(scaleRadius(yAxisScale(entry.stats.additions), 0.024))
                .startAngle(-minorAngleOffset)
                .endAngle(minorAngleOffset);
            const deletionArcTopGen = dataVizLib.svg.arc() // Generator for top deletion arc.
                .innerRadius(scaleRadius(yAxisScale(entry.stats.deletions), 0.014))
                .outerRadius(scaleRadius(yAxisScale(entry.stats.deletions), 0.024))
                .startAngle(Math.PI - minorAngleOffset)
                .endAngle(Math.PI + minorAngleOffset);

            (this.additionBarTop || ( // Creates top addition bar if not exists.
                this.additionBarTop = groupElement.append("path")
                    .style("fill", convertToRgba(colorPalette.additionsColor))
            ))
                .attr("d", additionArcTopGen()); // Sets path for top addition bar.

            (this.deletionBarTop || ( // Creates top deletion bar if not exists.
                this.deletionBarTop = groupElement.append("path")
                    .style("fill", convertToRgba(colorPalette.deletionsColor))
            ))
                .attr("d", deletionArcTopGen()); // Sets path for top deletion bar.

            if (entry.stats.additions) {
                entry.stats.addTextVis = scaleRadius(yAxisScale(entry.stats.additions), 0.028) > sixthHeight / 2.0 ? "visible" : "hidden"; // Determines text visibility.
                (this.additionLabel || ( // Creates addition label if not exists.
                    this.additionLabel = groupElement.append("text")
                        .attr("class", "added")
                        .attr("dy", "-.30em")
                        .attr("text-anchor", "middle")
                        .style("fill", colorPalette.additionsColor)
                        .text(" plus-sign " + valueFormatter(entry.stats.additions))
                ))
                    .attr("transform", "translate(" + [0, -scaleRadius(yAxisScale(entry.stats.additions), 0.026)] + ")") // Positions addition label.
                    .attr("visibility", entry.stats.addTextVis);
            }

            if (entry.stats.deletions) {
                entry.stats.delTextVis = scaleRadius(yAxisScale(entry.stats.deletions), 0.028) > sixthHeight / 2.0 ? "visible" : "hidden"; // Determines text visibility.
                (this.deletionLabel || ( // Creates deletion label if not exists.
                    this.deletionLabel = groupElement.append("text")
                        .attr("class", "removed")
                        .attr("dy", ".92em")
                        .attr("text-anchor", "middle")
                        .style("fill", colorPalette.deletionsColor)
                        .text(" minus-sign " + valueFormatter(entry.stats.deletions))
                ))
                    .attr("transform", "translate(" + [0, scaleRadius(yAxisScale(entry.stats.deletions), 0.026)] + ")") // Positions deletion label.
                    // .rotate(180) // Original comment was here
                    .attr("visibility", entry.stats.delTextVis);
            }
        });

        commitRenderData.sort(function (itemA, itemB) {
            return itemA.stats && itemB.stats ? dataVizLib.ascending(itemB.stats.totalChanges, itemA.stats.totalChanges) : 0; // Sorts data by total changes.
        });

        commitRenderData.exit().remove(); // Removes elements that no longer have corresponding data.
    };
})(displayUtility || (displayUtility = {})); // Executes the module, attaching it to 'displayUtility' or creating a new global 'displayUtility' object if it doesn't exist.