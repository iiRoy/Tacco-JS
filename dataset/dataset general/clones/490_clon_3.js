// A sophisticated D3-based module for visualizing commit timeline statistics.
// This module provides interactive capabilities for individual commit details
// and a comprehensive rendering pipeline for the entire commit history graph.

"use strict";

(function (chartUtilities, moduleDependencies) {
    // --- Internal Configuration Constants and Shared Helpers ---
    const ANGLE_PI_HALF = Math.PI / 2; // Original: PIdiv2
    const MINIMAL_ARC_OFFSET = Math.PI / 180 * 0.75; // Original: smallRad, slightly altered value
    const ONE_FULL_DAY_MS = 24 * 60 * 60 * 1000; // Original: ONE_DAY

    // Extracting external dependencies for clarity and isolation.
    const containerWidth = moduleDependencies.viewWidth || 1000; // Original: w
    const containerHeight = moduleDependencies.viewHeight || 550; // Original: h
    const chartBoundaryMargins = moduleDependencies.chartPadding || { top: 25, right: 25, bottom: 35, left: 55 }; // Original: margin
    const detailInformationPanel = moduleDependencies.infoTooltipElement; // Original: toolTip
    const dateTimeFormatter = moduleDependencies.dateFormatFunction; // Original: timeFormat
    const numberValueFormatter = moduleDependencies.textFormatFunction; // Original: textFormat
    const visualColorPalette = moduleDependencies.colorSchema; // Original: colors
    const fileActionTypeMap = moduleDependencies.fileStatusEnum; // Original: TYPE_STATUS_FILE
    const convertHexAlpha = moduleDependencies.hexToRgbaConverter; // Original: toRgba
    const d3Library = moduleDependencies.d3Api; // Original: d3

    /**
     * Safely retrieves a property from an object, providing a default if not found.
     * @param {object} sourceObj - The object to query.
     * @param {string} propertyName - The name of the property to retrieve.
     * @param {*} fallbackValue - The value to return if the property is undefined or null.
     * @returns {*} The property value or the fallback value.
     */
    const getPropertyOrDefault = (sourceObj, propertyName, fallbackValue) =>
        (sourceObj && sourceObj[propertyName] !== undefined) ? sourceObj[propertyName] : fallbackValue;

    /**
     * Handles the 'mouse over' interaction for a commit data point.
     * This function activates visual feedback and displays detailed commit information.
     * @param {object} commitRecord - The data object representing the specific commit.
     */
    chartUtilities.activateCommitHighlight = function (commitRecord) {
        // Ensure the visual layer for statistics is brought to the foreground.
        getPropertyOrDefault(chartUtilities, 'visualizationLayers.statisticsDisplay', { bringToFront: () => {} }).bringToFront();

        // Perform essential validation checks.
        if (!commitRecord || !commitRecord._graphicGroup) {
            console.warn("Invalid commit record or missing graphic group for highlight activation.");
            return;
        }

        // Apply highlighting styles to the commit's arc segments.
        commitRecord._graphicGroup.selectAll("path.commit-segment")
            .style("fill-opacity", 0.7) // Slightly increased opacity
            .style("stroke-width", "1.2px") // Slightly thicker stroke
            .style("stroke", () => convertHexAlpha("#111111", 0.9)); // Darker, almost opaque stroke

        const domNodeReference = commitRecord._graphicGroup.node();
        if (!domNodeReference) return; // Exit if DOM node is somehow missing

        // Animate the 'removed lines' arc to an expanded state.
        if (domNodeReference.removedLinesArcPath) {
            domNodeReference.removedLinesArcPath
                .transition()
                .duration(120) // Custom transition duration
                .attr("d", domNodeReference.removedArcGen
                    .startAngle(ANGLE_PI_HALF + MINIMAL_ARC_OFFSET)
                    .endAngle(ANGLE_PI_HALF * 3 - MINIMAL_ARC_OFFSET)()
                );
        }

        // Animate the 'added lines' arc to an expanded state.
        if (domNodeReference.addedLinesArcPath) {
            domNodeReference.addedLinesArcPath
                .transition()
                .duration(120)
                .attr("d", domNodeReference.addedArcGen
                    .startAngle(-ANGLE_PI_HALF + MINIMAL_ARC_OFFSET)
                    .endAngle(ANGLE_PI_HALF - MINIMAL_ARC_OFFSET)()
                );
        }

        // Reveal the text labels associated with additions and deletions.
        commitRecord._graphicGroup.selectAll("text.removed-label, text.added-label")
            .style("visibility", "visible");

        // Clear any existing content from the info panel.
        detailInformationPanel.emptyContent(); // Original: toolTip.selectAll("*").remove();

        // Append the primary commit message to the info panel.
        const firstLineMessage = getPropertyOrDefault(commitRecord, 'commitInfo.commitMessage', "No message available.").split("\n")[0];
        detailInformationPanel.appendDiv().attr("class", "message-row")
            .appendParagraph().text(firstLineMessage); // Changed from blockquote to p

        // Construct and append the detailed user and commit metadata section.
        const metaInfoSection = detailInformationPanel.appendDiv().attr("class", "meta-row user-details expanded");
        metaInfoSection.call(function (sectionDiv) {
            const innerDetailBlock = sectionDiv.appendDiv().attr("class", "commit-metadata");

            // Embed author avatar if present.
            const authorAvatar = getPropertyOrDefault(commitRecord, 'commitInfo.author.avatarNode', null);
            if (authorAvatar) {
                innerDetailBlock.node().appendChild(authorAvatar);
            }

            const detailsList = innerDetailBlock.appendUnorderedList();

            // Display author's name or login ID.
            const authorDisplayName = getPropertyOrDefault(commitRecord, 'commitInfo.author.displayName', null) || getPropertyOrDefault(commitRecord, 'commitInfo.author.loginId', null);
            if (authorDisplayName) {
                detailsList.appendListItem().call(function (listItem) {
                    listItem.appendHeading4().text(authorDisplayName); // Changed from h1 to h4
                    listItem.appendHorizontalRule().attr("class", "section-divider");
                });
            }

            // Display commit timestamp.
            detailsList.appendListItem().call(function (listItem) {
                listItem.appendSpan().attr("class", "icon-small icon-clock-time"); // Changed class name
                listItem.appendStrong().text(dateTimeFormatter(commitRecord.commitInfo.timestamp));
            });

            // Display truncated commit SHA.
            detailsList.appendListItem().call(function (listItem) {
                listItem.text("SHA: ");
                listItem.appendStrong().text(commitRecord.commitInfo.commitHash.substring(0, 10)); // Using substring
            });
            detailsList.appendListItem().appendHorizontalRule().attr("class", "section-divider");

            // Summarize changed files by status (added, modified, deleted).
            const fileChangeRecords = getPropertyOrDefault(commitRecord, 'commitInfo.fileList', []);
            if (fileChangeRecords.length > 0) {
                detailsList.appendListItem().call(function (listItem) {
                    const categorizedFileCounts = fileChangeRecords.reduce((accumulator, fileEntry) => {
                        for (const statusKey in fileActionTypeMap) {
                            if (Object.prototype.hasOwnProperty.call(fileActionTypeMap, statusKey) && fileEntry.statusType === fileActionTypeMap[statusKey]) {
                                accumulator[statusKey] = (accumulator[statusKey] || 0) + 1;
                                break;
                            }
                        }
                        return accumulator;
                    }, {});

                    const fileSummaryList = listItem.appendUnorderedList().attr("class", "summary-list");
                    const fileSummaryHeader = fileSummaryList.appendListItem().attr("class", "summary-item-header");
                    fileSummaryHeader.appendHeading4().text("Files Changed:"); // Changed from h1

                    for (const typeKey in categorizedFileCounts) {
                        if (Object.prototype.hasOwnProperty.call(categorizedFileCounts, typeKey)) {
                            fileSummaryHeader.appendUnorderedList().attr("class", "sub-summary-group")
                                .appendListItem().attr("class", "sub-summary-item")
                                .appendSpan().text(`${typeKey}: `)
                                .appendStrong().text(categorizedFileCounts[typeKey]);
                        }
                    }
                });
            }

            // Summarize changed lines (additions, deletions, total).
            detailsList.appendListItem().call(function (listItem) {
                const lineSummaryList = listItem.appendUnorderedList().attr("class", "summary-list");
                const lineSummaryHeader = lineSummaryList.appendListItem().attr("class", "summary-item-header");
                lineSummaryHeader.appendHeading4().text("Lines Impacted:"); // Changed from h1

                const lineStatLabels = { totalChanges: "Total: ", linesAdded: " + ", linesRemoved: " - " }; // Rewritten keys for clarity
                const commitLineMetrics = getPropertyOrDefault(commitRecord, 'commitInfo.lineMetrics', {});

                for (const metricKey in lineStatLabels) {
                    if (Object.prototype.hasOwnProperty.call(lineStatLabels, metricKey) && getPropertyOrDefault(commitLineMetrics, metricKey, null) !== null) {
                        lineSummaryHeader.appendUnorderedList().attr("class", "sub-summary-group")
                            .appendListItem().attr("class", "sub-summary-item")
                            .appendSpan().text(`${lineStatLabels[metricKey]}`)
                            .appendStrong()
                            .style("color", d3Library.rgb(getPropertyOrDefault(visualColorPalette, metricKey, '#CCCCCC')).darker(0.3)) // Darker shade
                            .text(numberValueFormatter(commitLineMetrics[metricKey]));
                    }
                }
            });
        });

        detailInformationPanel.showTooltip(); // Original: toolTip.show();
    };

    /**
     * Handles the 'mouse leave' interaction for a commit data point.
     * This function reverts visual feedback and hides the detailed commit information.
     * @param {object} commitDataPoint - The data object for the commit.
     */
    chartUtilities.deactivateCommitHighlight = function (commitDataPoint) {
        if (!commitDataPoint || !commitDataPoint._graphicGroup) {
            console.warn("Invalid commit data point or missing graphic group for highlight deactivation.");
            return;
        }

        // Reset arc segment styling to default.
        commitDataPoint._graphicGroup.selectAll("path.commit-segment")
            .style("fill-opacity", 0.3)
            .style("stroke", null); // Remove explicit border

        const elementNode = commitDataPoint._graphicGroup.node();
        if (!elementNode) return;

        // Animate 'removed lines' arc back to its compact default state.
        if (elementNode.removedLinesArcPath) {
            elementNode.removedLinesArcPath
                .transition()
                .duration(700) // Adjusted duration
                .ease(d3Library.ease("bounce")) // Different easing function
                .attr("d", elementNode.removedArcGen
                    .startAngle(Math.PI - MINIMAL_ARC_OFFSET)
                    .endAngle(Math.PI + MINIMAL_ARC_OFFSET)()
                );
        }

        // Animate 'added lines' arc back to its compact default state.
        if (elementNode.addedLinesArcPath) {
            elementNode.addedLinesArcPath
                .transition()
                .duration(700)
                .ease(d3Library.ease("bounce"))
                .attr("d", elementNode.addedArcGen
                    .startAngle(-MINIMAL_ARC_OFFSET)
                    .endAngle(MINIMAL_ARC_OFFSET)()
                );
        }

        // Conditionally hide the deletion label based on its stored visibility state.
        const currentDelLabelVisibility = getPropertyOrDefault(commitDataPoint, 'commitInfo.lineMetrics.deletionLabelDisplay', "hidden");
        commitDataPoint._graphicGroup.selectAll("text.removed-label")
            .style("visibility", currentDelLabelVisibility);

        // Conditionally hide the addition label based on its stored visibility state.
        const currentAddLabelVisibility = getPropertyOrDefault(commitDataPoint, 'commitInfo.lineMetrics.additionLabelDisplay', "hidden");
        commitDataPoint._graphicGroup.selectAll("text.added-label")
            .style("visibility", currentAddLabelVisibility);

        detailInformationPanel.hideTooltip(); // Original: toolTip.hide();
    };

    /**
     * Handles the 'mouse move' event for a commit data point.
     * Primarily used to update the position of the detailed commit info panel dynamically.
     * @param {object} commitContext - The data object for the commit.
     */
    chartUtilities.updateDetailPanelPosition = function (commitContext) {
        // Delegate to a specific utility function for tooltip positioning.
        chartUtilities.repositionTooltip(commitContext); // Original: vis.mtt(d);
    };

    /**
     * Resets and clears the entire statistics visualization layer.
     */
    chartUtilities.clearStatisticsLayer = function () {
        const statsVisualLayer = getPropertyOrDefault(chartUtilities, 'visualizationLayers.statisticsDisplay', null);
        if (statsVisualLayer) {
            statsVisualLayer.selectAll("g, path, text, circle").remove(); // More specific removal than "*"
            if (statsVisualLayer.mainContentGroup) { // Original: vis.layers.stat.cont
                statsVisualLayer.mainContentGroup = null;
                console.info("Statistics layer's main content group has been nullified.");
            }
        } else {
            console.info("No statistics visualization layer found to clear.");
        }
    };

    /**
     * Renders or updates the commit timeline visualization.
     * This is the main function for drawing the commit activity graph.
     * @param {object} timelineDataset - The dataset containing commit information and date ranges.
     * @param {d3.selection} [targetVisualizationLayer] - The D3 selection representing the SVG group to draw on.
     */
    chartUtilities.renderCommitTimeline = function (timelineDataset, targetVisualizationLayer) {
        // Determine the target drawing layer; use provided or default to internal.
        const currentDrawingLayer = targetVisualizationLayer || getPropertyOrDefault(chartUtilities, 'visualizationLayers.statisticsDisplay', null);

        // Comprehensive validation of input data and layer presence.
        if (!timelineDataset || !getPropertyOrDefault(timelineDataset, 'commitRecords.data', []).length || !getPropertyOrDefault(timelineDataset, 'timelineDates', []).length || !currentDrawingLayer) {
            console.warn("Insufficient data or no valid drawing layer provided for timeline rendering. Clearing view.");
            chartUtilities.clearStatisticsLayer();
            return;
        }

        const commitDataEntries = timelineDataset.commitRecords.data; // Original: data.commits.values()

        const dataDateRange = d3Library.extent(timelineDataset.timelineDates); // Original: d3.extent(data.dates)
        let temporalBuffer = (dataDateRange[1] - dataDateRange[0]) * 0.1;

        // Ensure a reasonable minimum time buffer, e.g., one day.
        temporalBuffer = temporalBuffer || ONE_FULL_DAY_MS; // Original: ONE_DAY

        const extendedDateRange = [dataDateRange[0] - temporalBuffer, dataDateRange[1] + temporalBuffer];

        const timeAxisScale = d3Library.time.scale() // Original: d3.time.scale
            .domain(d3Library.extent(extendedDateRange))
            .range([0, containerWidth - chartBoundaryMargins.left - chartBoundaryMargins.right]);

        const segmentVerticalHeight = containerHeight / 6; // Original: h/6

        const commitValueSizeScale = d3Library.scale.linear() // Original: d3.scale.linear
            .range([3, segmentVerticalHeight * 2.5]) // Slightly altered range
            .domain([0, getPropertyOrDefault(timelineDataset, 'overallMetrics.totalLineChanges', 1)]); // Original: data.stats.changes

        // Prepare data points for the area chart, including synthetic boundary points for smooth rendering.
        const sortedTimelinePlotPoints = commitDataEntries.slice(0).concat([
            { commitInfo: { timestamp: extendedDateRange[0] + temporalBuffer / 2, fileMetrics: { deleted: 0, added: 0, modified: 0 } } },
            { commitInfo: { timestamp: extendedDateRange[1] - temporalBuffer / 2, fileMetrics: { deleted: 0, added: 0, modified: 0 } } }
        ]).sort(chartUtilities.sortTimelineCommits); // Original: vis.sC

        const commitAreaChartLayers = [
            {
                layerColor: visualColorPalette.deletedFile,
                dataPoints: sortedTimelinePlotPoints.map(item => ({
                    typeIdentifier: 1, // Original: t:1
                    xValue: item.commitInfo.timestamp,
                    yBaseValue: 0,
                    yHeight: -(getPropertyOrDefault(item, 'commitInfo.fileMetrics.deleted', 0))
                }))
            },
            {
                layerColor: visualColorPalette.modifiedFile,
                dataPoints: sortedTimelinePlotPoints.map(item => ({
                    xValue: item.commitInfo.timestamp,
                    yBaseValue: 0,
                    yHeight: getPropertyOrDefault(item, 'commitInfo.fileMetrics.modified', 0)
                }))
            },
            {
                layerColor: visualColorPalette.addedFile,
                dataPoints: sortedTimelinePlotPoints.map(item => ({
                    xValue: item.commitInfo.timestamp,
                    yBaseValue: getPropertyOrDefault(item, 'commitInfo.fileMetrics.modified', 0),
                    yHeight: getPropertyOrDefault(item, 'commitInfo.fileMetrics.added', 0)
                }))
            }
        ];

        // Custom path interpolation function (rewritten from original interpolateSankey).
        function bezierPathSmoother(pointCoordinates) {
            if (!pointCoordinates || pointCoordinates.length < 2) return "";
            let currentX = pointCoordinates[0][0], currentY = pointCoordinates[0][1];
            const pathSegments = [`M${currentX},${currentY}`]; // Start point definition

            for (let idx = 1; idx < pointCoordinates.length; idx++) {
                const nextX = pointCoordinates[idx][0];
                const nextY = pointCoordinates[idx][1];
                const midPointX = (currentX + nextX) / 2;
                // Construct a cubic Bezier curve segment for smooth transition.
                pathSegments.push(`C${midPointX},${currentY} ${midPointX},${nextY} ${nextX},${nextY}`);
                currentX = nextX;
                currentY = nextY;
            }
            return pathSegments.join("");
        }

        const fileCountVerticalRangeScale = d3Library.scale.linear() // Original: y1
            .range([segmentVerticalHeight * 4.7, segmentVerticalHeight * 3.2, segmentVerticalHeight * 1.7]) // Adjusted range
            .domain([-getPropertyOrDefault(timelineDataset, 'overallMetrics.totalFilesChanged', 0), 0, getPropertyOrDefault(timelineDataset, 'overallMetrics.totalFilesChanged', 0)]);

        const fileAreaDrawingGenerator = d3Library.svg.area() // Original: area
            .interpolate(bezierPathSmoother) // Using the rewritten custom interpolator
            .x(d => timeAxisScale(d.xValue))
            .y0(d => fileCountVerticalRangeScale(d.yBaseValue))
            .y1(d => fileCountVerticalRangeScale(d.yBaseValue + d.yHeight));

        const timeAxisRenderer = d3Library.svg.axis() // Original: xAxis
            .scale(timeAxisScale);

        // Initialize or retrieve the main SVG group for all chart elements.
        if (!currentDrawingLayer.mainContentGroup) {
            currentDrawingLayer.mainContentGroup = currentDrawingLayer
                .append("g")
                .attr("transform", `translate(${chartBoundaryMargins.left},${chartBoundaryMargins.top})`);
        }

        // Remove any pre-existing area paths to ensure a clean redraw.
        currentDrawingLayer.mainContentGroup.selectAll("path.timeline-area-segment").remove();

        // Append and animate the new area paths representing file changes.
        currentDrawingLayer.mainContentGroup.selectAll("path.timeline-area-segment")
            .data(commitAreaChartLayers)
            .enter()
            .insert("path", ":first-child") // Ensure area paths are drawn underneath other elements
            .attr("class", "timeline-area-segment")
            .style("stroke", d => d.layerColor)
            .style("stroke-opacity", 0.6) // Slightly higher stroke opacity
            .style("fill-opacity", 0.15) // Slightly higher fill opacity
            .style("fill", d => d.layerColor)
            .transition()
            .duration(850) // Custom transition duration
            .attr("d", d => fileAreaDrawingGenerator(d.dataPoints));

        // Initialize or retrieve the X-axis SVG group.
        if (!currentDrawingLayer.mainContentGroup.xAxisContainer) {
            currentDrawingLayer.mainContentGroup.xAxisContainer = currentDrawingLayer.mainContentGroup.append("g")
                .attr("class", "timeline-x-axis primary-axis") // Changed class names
                .attr("transform", `translate(0,${containerHeight / 2})`);
        }

        // Clear and redraw the X-axis, applying custom text styling.
        currentDrawingLayer.mainContentGroup.xAxisContainer.selectAll("*").remove();
        currentDrawingLayer.mainContentGroup.xAxisContainer
            .call(timeAxisRenderer)
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 10) // Adjusted X position
            .attr("dy", ".3em") // Adjusted DY position
            .attr("transform", "rotate(85)") // Slightly different rotation
            .style("text-anchor", "start")
            .style("fill", function () {
                // Apply specific styling for year labels (if text content is an integer).
                return parseInt(this.textContent) ? "#DDDDDD" : null; // Light gray for years, default otherwise
            })
            .style("font-size", function () {
                return parseInt(this.textContent) ? "10.5px" : null; // Slightly smaller font size
            })
            .style("font-weight", function () {
                return parseInt(this.textContent) ? "bold" : null;
            });

        // Initialize or retrieve the SVG group that will hold individual commit points.
        if (!currentDrawingLayer.mainContentGroup.commitMarkersGroup) {
            currentDrawingLayer.mainContentGroup.commitMarkersGroup = currentDrawingLayer.mainContentGroup.append("g")
                .attr("transform", `translate(0,${containerHeight / 2})`);
        }

        // Bind commit data to 'commit-marker' groups, using commit hash as key.
        const commitMarkerElements = currentDrawingLayer.mainContentGroup.commitMarkersGroup.selectAll("g.commit-marker") // Changed class name
            .data(commitDataEntries, d => d.commitInfo.commitHash); // Original: d.sha

        // Enter selection: For new commit data points, append new SVG groups.
        const newCommitMarkers = commitMarkerElements.enter()
            .append("g")
            .attr("class", "commit-marker")
            .on("mouseover", chartUtilities.activateCommitHighlight)
            .on("mouseout", chartUtilities.deactivateCommitHighlight)
            .on("mousemove", chartUtilities.updateDetailPanelPosition);

        // Update selection: Process all (existing and new) commit data points.
        commitMarkerElements.each(function (dataItem, index) {
            const currentItemGraphicGroup = d3Library.select(this);
            dataItem._graphicGroup = currentItemGraphicGroup; // Store D3 selection directly on data object

            // Smoothly transition the commit marker to its correct position on the timeline.
            currentItemGraphicGroup.transition()
                .duration(1500) // Custom transition duration
                .ease(d3Library.ease("elastic-out")) // Different easing function
                .attr("transform", `translate(${timeAxisScale(dataItem.commitInfo.timestamp)}, 0)`);

            // Add a central circular marker if it doesn't already exist.
            if (!this.centerPointCircle) { // Renamed from this.center
                this.centerPointCircle = currentItemGraphicGroup.append("circle")
                    .attr("r", 2.8) // Slightly larger radius
                    .style("fill", visualColorPalette.centralDotColor); // Renamed color key
            }

            // If no line change metrics, skip arc and label generation.
            if (!dataItem.commitInfo.lineMetrics) {
                return;
            }

            // Arc generator for added lines.
            const addedLinesArcGenerator = d3Library.svg.arc()
                .innerRadius(1)
                .outerRadius(1)
                .startAngle(-MINIMAL_ARC_OFFSET)
                .endAngle(MINIMAL_ARC_OFFSET);

            // Arc generator for removed lines.
            const removedLinesArcGenerator = d3Library.svg.arc()
                .innerRadius(1)
                .outerRadius(1)
                .startAngle(Math.PI - MINIMAL_ARC_OFFSET)
                .endAngle(Math.PI + MINIMAL_ARC_OFFSET);

            /**
             * Calculates a scaled radius based on a base value and a factor.
             * @param {number} baseVal - The base value (e.g., from a scale).
             * @param {number} scaleFactor - The scaling factor.
             * @returns {number} The calculated scaled radius.
             */
            const deriveScaledRadius = (baseVal, scaleFactor) => baseVal * (1 + scaleFactor); // Rewritten from 'sized'

            // Handle the path for added lines.
            if (!this.addedLinesArcPath) { // Renamed from this.barAdd
                this.addedLinesArcPath = currentItemGraphicGroup.append("path")
                    .attr("class", "commit-segment added-lines-bar") // Changed class name
                    .style("fill", visualColorPalette.linesAddedColor) // Renamed color key
                    .style("fill-opacity", 0.35) // Slightly increased opacity
                    .attr("d", addedLinesArcGenerator());
            }
            this.addedLinesArcPath.transition()
                .duration(750)
                .ease(d3Library.ease("quad")) // Different ease
                .attr("d", addedLinesArcGenerator.outerRadius(commitValueSizeScale(dataItem.commitInfo.lineMetrics.linesAdded))());

            // Handle the path for removed lines.
            if (!this.removedLinesArcPath) { // Renamed from this.barDel
                this.removedLinesArcPath = currentItemGraphicGroup.append("path")
                    .attr("class", "commit-segment removed-lines-bar") // Changed class name
                    .style("fill", visualColorPalette.linesRemovedColor) // Renamed color key
                    .style("fill-opacity", 0.35)
                    .attr("d", removedLinesArcGenerator());
            }
            this.removedLinesArcPath.transition()
                .duration(750)
                .ease(d3Library.ease("quad"))
                .attr("d", removedLinesArcGenerator.outerRadius(commitValueSizeScale(dataItem.commitInfo.lineMetrics.linesRemoved))());

            // Arc generators for the 'top caps' of the bars.
            const addedCapArcGenerator = d3Library.svg.arc()
                .innerRadius(deriveScaledRadius(commitValueSizeScale(dataItem.commitInfo.lineMetrics.linesAdded), 0.018)) // Adjusted factor
                .outerRadius(deriveScaledRadius(commitValueSizeScale(dataItem.commitInfo.lineMetrics.linesAdded), 0.028)) // Adjusted factor
                .startAngle(-MINIMAL_ARC_OFFSET)
                .endAngle(MINIMAL_ARC_OFFSET);

            const removedCapArcGenerator = d3Library.svg.arc()
                .innerRadius(deriveScaledRadius(commitValueSizeScale(dataItem.commitInfo.lineMetrics.linesRemoved), 0.018))
                .outerRadius(deriveScaledRadius(commitValueSizeScale(dataItem.commitInfo.lineMetrics.linesRemoved), 0.028))
                .startAngle(Math.PI - MINIMAL_ARC_OFFSET)
                .endAngle(Math.PI + MINIMAL_ARC_OFFSET);

            if (!this.addedLinesCapPath) { // Renamed from this.barAddTop
                this.addedLinesCapPath = currentItemGraphicGroup.append("path")
                    .style("fill", convertHexAlpha(visualColorPalette.linesAddedColor, 1)); // Ensure full opacity
            }
            this.addedLinesCapPath.attr("d", addedCapArcGenerator());

            if (!this.removedLinesCapPath) { // Renamed from this.barDelTop
                this.removedLinesCapPath = currentItemGraphicGroup.append("path")
                    .style("fill", convertHexAlpha(visualColorPalette.linesRemovedColor, 1));
            }
            this.removedLinesCapPath.attr("d", removedCapArcGenerator());

            // Handle text label for added lines.
            if (dataItem.commitInfo.lineMetrics.linesAdded > 0) {
                const addLabelOffsetRadius = deriveScaledRadius(commitValueSizeScale(dataItem.commitInfo.lineMetrics.linesAdded), 0.032); // Adjusted factor
                dataItem.commitInfo.lineMetrics.additionLabelDisplay = addLabelOffsetRadius > segmentVerticalHeight / 2 ? "visible" : "hidden";
                if (!this.addedLinesLabelText) { // Renamed from this.labelAdd
                    this.addedLinesLabelText = currentItemGraphicGroup.append("text")
                        .attr("class", "added-label")
                        .attr("dy", "-.3em") // Adjusted dy
                        .attr("text-anchor", "middle")
                        .style("fill", visualColorPalette.linesAddedColor);
                }
                this.addedLinesLabelText
                    .text(`+ ${numberValueFormatter(dataItem.commitInfo.lineMetrics.linesAdded)}`)
                    .attr("transform", `translate(0, ${-addLabelOffsetRadius})`)
                    .attr("visibility", dataItem.commitInfo.lineMetrics.additionLabelDisplay);
            } else if (this.addedLinesLabelText) { // Hide label if no additions
                this.addedLinesLabelText.attr("visibility", "hidden");
            }

            // Handle text label for removed lines.
            if (dataItem.commitInfo.lineMetrics.linesRemoved > 0) {
                const delLabelOffsetRadius = deriveScaledRadius(commitValueSizeScale(dataItem.commitInfo.lineMetrics.linesRemoved), 0.032);
                dataItem.commitInfo.lineMetrics.deletionLabelDisplay = delLabelOffsetRadius > segmentVerticalHeight / 2 ? "visible" : "hidden";
                if (!this.removedLinesLabelText) { // Renamed from this.labelDel
                    this.removedLinesLabelText = currentItemGraphicGroup.append("text")
                        .attr("class", "removed-label")
                        .attr("dy", ".9em") // Adjusted dy
                        .attr("text-anchor", "middle")
                        .style("fill", visualColorPalette.linesRemovedColor);
                }
                this.removedLinesLabelText
                    .text(`- ${numberValueFormatter(dataItem.commitInfo.lineMetrics.linesRemoved)}`)
                    .attr("transform", `translate(0, ${delLabelOffsetRadius})`)
                    .attr("visibility", dataItem.commitInfo.lineMetrics.deletionLabelDisplay);
            } else if (this.removedLinesLabelText) { // Hide label if no deletions
                this.removedLinesLabelText.attr("visibility", "hidden");
            }
        });

        // Sort commit markers by the total number of changes in descending order.
        commitMarkerElements.sort((commitA, commitB) => {
            const changesA = getPropertyOrDefault(commitA, 'commitInfo.lineMetrics.totalChanges', 0);
            const changesB = getPropertyOrDefault(commitB, 'commitInfo.lineMetrics.totalChanges', 0);
            return d3Library.descending(changesA, changesB); // Using d3.descending for clarity
        });

        // Exit selection: Remove commit markers that are no longer present in the dataset.
        commitMarkerElements.exit().remove();
    };

    // --- Auxiliary Modules and Global Dependency Initialization ---

    /**
     * Creates a custom tooltip object with D3-like chaining methods.
     * This replaces direct global 'toolTip' variable handling.
     * @param {string} selector - CSS selector for the tooltip DOM element.
     * @returns {object} A custom tooltip interface.
     */
    function initializeCustomTooltip(selector) {
        const tooltipWrapper = d3Library.select(selector);
        if (tooltipWrapper.empty()) {
            console.error(`Custom tooltip element not found with selector: ${selector}. Creating a fallback.`);
            // Fallback: append a div to body if not found
            return initializeCustomTooltip(d3Library.select("body").append("div").attr("id", selector.substring(1) || "fallback-tooltip").style("position", "absolute").style("pointer-events", "none").style("visibility", "hidden"));
        }
        return {
            domElement: tooltipWrapper,
            emptyContent: function (htmlString = "") {
                this.domElement.html(htmlString);
                return this;
            },
            appendDiv: function () { return this.domElement.append("div"); },
            appendParagraph: function () { return this.domElement.append("p"); },
            appendUnorderedList: function () { return this.domElement.append("ul"); },
            appendListItem: function () { return this.domElement.append("li"); },
            appendHeading4: function () { return this.domElement.append("h4"); },
            appendHorizontalRule: function () { return this.domElement.append("hr"); },
            appendSpan: function () { return this.domElement.append("span"); },
            appendStrong: function () { return this.domElement.append("strong"); },
            attr: function (name, value) {
                this.domElement.attr(name, value);
                return this;
            },
            text: function (value) {
                this.domElement.text(value);
                return this;
            },
            style: function (name, value) {
                this.domElement.style(name, value);
                return this;
            },
            showTooltip: function () { this.domElement.style("visibility", "visible"); return this; },
            hideTooltip: function () { this.domElement.style("visibility", "hidden"); return this; },
            node: function () { return this.domElement.node(); }
        };
    }

    // Default or mock implementations for external dependencies if they are not provided.
    // This makes the module more resilient to missing global variables.
    if (!moduleDependencies.d3Api) {
        console.error("D3 library (d3Api) is a required dependency for chartUtilities!");
        // Provide a minimal mock D3 object to prevent immediate errors, but functionality will be broken.
        moduleDependencies.d3Api = {
            extent: () => [0, 0], time: { scale: () => ({ domain: () => ({ range: () => ({}) }) }) },
            scale: { linear: () => ({ range: () => ({ domain: () => ({}) }) }) },
            svg: { arc: () => ({ innerRadius: () => ({ outerRadius: () => ({ startAngle: () => ({ endAngle: () => ({}) }) }) }), }), area: () => ({ interpolate: () => ({ x: () => ({ y0: () => ({ y1: () => ({}) }) }) }), }), axis: () => ({ scale: () => {} }) },
            select: () => ({ selectAll: () => ({ remove: () => {}, data: () => ({ enter: () => ({ append: () => ({ on: () => ({}) }), insert: () => ({ style: () => ({ transition: () => ({ attr: () => {} }) }) }) }), each: () => {}, sort: () => {}, exit: () => ({ remove: () => {} }) }), html: () => {}, append: () => ({ attr: () => ({ call: () => ({ append: () => ({ text: () => {} }), node: () => ({ appendChild: () => {} }), style: () => {} }), append: () => ({ text: () => {} }), text: () => {} }), style: () => {} }), node: () => {} }),
            rgb: (c) => ({ darker: () => c }), ease: () => {}, ascending: (a, b) => b - a, descending: (a, b) => b - a, event: { pageX: 0, pageY: 0 }
        };
    }
    // Initialize the tooltip using the helper function.
    moduleDependencies.infoTooltipElement = moduleDependencies.infoTooltipElement || initializeCustomTooltip("#commit-detail-panel");

    if (!moduleDependencies.hexToRgbaConverter) {
        moduleDependencies.hexToRgbaConverter = (hexColor, alphaVal) => {
            const r = parseInt(hexColor.slice(1, 3), 16);
            const g = parseInt(hexColor.slice(3, 5), 16);
            const b = parseInt(hexColor.slice(5, 7), 16);
            return `rgba(${r},${g},${b},${alphaVal})`;
        };
    }
    // Provide default formatting functions if not supplied.
    moduleDependencies.dateFormatFunction = moduleDependencies.dateFormatFunction || ((dateObj) => new Date(dateObj).toLocaleString());
    moduleDependencies.textFormatFunction = moduleDependencies.textFormatFunction || ((num) => num.toLocaleString());
    // Provide a default color scheme.
    moduleDependencies.colorSchema = moduleDependencies.colorSchema || {
        deletedFile: '#FF4500', modifiedFile: '#FFD700', addedFile: '#32CD32',
        linesAddedColor: '#00FA9A', linesRemovedColor: '#FF6347', centralDotColor: '#F0F8FF',
        totalChanges: '#A9A9A9', linesAdded: '#3CB371', linesRemoved: '#DC143C'
    };
    // Provide a default file status enum.
    moduleDependencies.fileStatusEnum = moduleDependencies.fileStatusEnum || {
        added: 'added', modified: 'modified', deleted: 'deleted', renamed: 'renamed' // Added 'renamed' for completeness
    };

    // --- Helper functions that were originally part of `vis` ---

    /**
     * Placeholder for updating the detailed info panel's position on mouse move.
     * @param {object} dataPoint - The data object for the commit.
     */
    chartUtilities.repositionTooltip = function (dataPoint) {
        // Implement logic to position detailInformationPanel based on current mouse coordinates.
        // Assuming d3Library.event is available for mouse position.
        const currentMouseX = d3Library.event.pageX + 15; // Offset by 15px
        const currentMouseY = d3Library.event.pageY + 15;
        detailInformationPanel.domElement.style("left", `${currentMouseX}px`).style("top", `${currentMouseY}px`);
    };

    /**
     * Placeholder for a commit sorting function, typically by date.
     * @param {object} commitA - First commit object.
     * @param {object} commitB - Second commit object.
     * @returns {number} Comparison result for sorting.
     */
    chartUtilities.sortTimelineCommits = function (commitA, commitB) {
        return d3Library.ascending(commitA.commitInfo.timestamp, commitB.commitInfo.timestamp);
    };

    // Initialize the main visualization layers object.
    chartUtilities.visualizationLayers = {
        // Attempt to use an existing statistics layer, or create a new one as a D3 selection.
        statisticsDisplay: moduleDependencies.existingStatsLayer || d3Library.select("body").append("svg").attr("id", "timeline-svg-container").append("g").attr("class", "statistics-layer"),
    };
    // Ensure the statistics layer has a 'bringToFront' method, even if it's a simple append.
    if (chartUtilities.visualizationLayers.statisticsDisplay && !chartUtilities.visualizationLayers.statisticsDisplay.bringToFront) {
        chartUtilities.visualizationLayers.statisticsDisplay.bringToFront = function () {
            if (this.node() && this.node().parentNode) {
                this.node().parentNode.appendChild(this.node());
            }
        };
    }

})(window.chartUtilities = window.chartUtilities || {}, {
    d3Api: window.d3,
    viewWidth: window.w,
    viewHeight: window.h,
    chartPadding: window.margin,
    infoTooltipElement: window.toolTip, // Assuming window.toolTip is an existing D3 selection or custom object
    dateFormatFunction: window.timeFormat,
    textFormatFunction: window.textFormat,
    colorSchema: window.colors,
    fileStatusEnum: window.TYPE_STATUS_FILE,
    hexToRgbaConverter: window.toRgba,
    // Pass the existing 'vis.layers.stat' if available, otherwise it will be created.
    existingStatsLayer: window.vis && window.vis.layers ? window.vis.layers.stat : null
});