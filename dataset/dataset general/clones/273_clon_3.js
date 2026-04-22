"use strict";

/**
 * Constructs a layout structure with computed inner dimensions and center coordinates.
 * All spatial parameters should be non-negative and logically consistent.
 * @param {number} outerWidth The total horizontal span of the region.
 * @param {number} outerHeight The total vertical span of the region.
 * @param {number} topMargin Space from the upper boundary.
 * @param {number} rightMargin Space from the right boundary.
 * @param {number} bottomMargin Space from the lower boundary.
 * @param {number} leftMargin Space from the left boundary.
 * @returns {object} An object containing all calculated layout properties.
 */
const constructLayout = (outerWidth, outerHeight, topMargin, rightMargin, bottomMargin, leftMargin) => {
    // Input validation: ensure all dimensions are non-negative.
    if ([outerWidth, outerHeight, topMargin, rightMargin, bottomMargin, leftMargin].some(val => val < 0)) {
        console.warn("Layout parameters must be non-negative. Adjusting to zero if negative.");
        outerWidth = Math.max(0, outerWidth);
        outerHeight = Math.max(0, outerHeight);
        topMargin = Math.max(0, topMargin);
        rightMargin = Math.max(0, rightMargin);
        bottomMargin = Math.max(0, bottomMargin);
        leftMargin = Math.max(0, leftMargin);
    }

    const horizontalPadding = leftMargin + rightMargin;
    const verticalPadding = topMargin + bottomMargin;

    const effectiveWidth = outerWidth - horizontalPadding;
    const effectiveHeight = outerHeight - verticalPadding;

    const centerX = effectiveWidth / 2 + leftMargin;
    const centerY = effectiveHeight / 2 + topMargin;

    return {
        totalWidth: outerWidth,
        totalHeight: outerHeight,
        effectiveWidth: effectiveWidth,
        effectiveHeight: effectiveHeight,
        paddingTop: topMargin,
        paddingRight: rightMargin,
        paddingBottom: bottomMargin,
        paddingLeft: leftMargin,
        centralX: centerX,
        centralY: centerY
    };
};

// --- Global Configuration and Constants ---
const LIVE_ELEMENT_RETENTION_TIME_MS = 1000;
const MAX_RESPONSE_TIME_MS = 2000;
const PLOT_UPDATE_INTERVAL_MS = MAX_RESPONSE_TIME_MS;
const MAX_VELOCITY_UNIT = 6; // pixels per millisecond

// Utility to clamp a value within a min/max range
const restrictValue = (min, max, value) => Math.min(Math.max(value, min), max);

// Utility to calculate Euclidean distance between two points
const getEuclideanDistance = (pA, pB) => Math.sqrt(Math.pow(pB.x - pA.x, 2) + Math.pow(pB.y - pA.y, 2));

// Utility to calculate Fitts' Index of Difficulty (Shannon formulation)
const calculateFittsID = (amplitude, targetWidth) => Math.log2(amplitude / targetWidth + 1);

// Utility to project a point P onto the line segment AB
const projectPointOnLine = (lineStart, lineEnd, pointToProject) => {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) { // A and B are the same point
        return { x: lineStart.x, y: lineStart.y, parameter: 0 };
    }

    const t = ((pointToProject.x - lineStart.x) * dx + (pointToProject.y - lineStart.y) * dy) / lengthSquared;
    return {
        x: lineStart.x + t * dx,
        y: lineStart.y + t * dy,
        parameter: t // Parameter along the line (0 at A, 1 at B)
    };
};

// Utility to get the sign of a number
const getNumericSign = (val) => Math.sign(val);

// Utility to determine if a point is to the left/right/on a line segment AB
const isPointLeftOfLine = (lineStart, lineEnd, point) => {
    // Cross product (B.x - A.x) * (P.y - A.y) - (B.y - A.y) * (P.x - A.x)
    return getNumericSign((lineEnd.x - lineStart.x) * (point.y - lineStart.y) - (lineEnd.y - lineStart.y) * (point.x - lineStart.x));
};

// Utility to get a random number within a range
const getRandomNumberBetween = (min, max) => Math.random() * (max - min) + min;

// Utility to check if an object has a specific key
const doesObjectContainKey = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

// Utility to get the number of properties in an object
const getObjectPropertyCount = (obj) => Object.keys(obj).length;

// Utility to get the first key of an object
const retrieveFirstObjectKey = (obj) => Object.keys(obj)[0];


/**
 * Calculates the radius for plotting a hit point relative to a target zone.
 * @param {number} currentRadius The input radius value.
 * @param {number} targetZoneRadius The radius of the target zone.
 * @returns {number} Scaled radius for plotting.
 */
const mapHitRadius = (currentRadius, targetZoneRadius) => {
    const scaleFactor = (mainPlottingAreaLayout.effectiveWidth / 2) / targetZoneRadius;
    return scaleFactor * currentRadius;
};

/**
 * Generates an RGB color string based on a normalized velocity value.
 * @param {number} currentVelocity The velocity value.
 * @returns {string} RGB color string.
 */
const generateVelocityColor = (currentVelocity) => {
    const redComponent = restrictValue(0, 255, Math.floor((currentVelocity / MAX_VELOCITY_UNIT) * 255));
    return `rgb(${redComponent}, 0, 0)`;
};

// --- Layout Definitions for various plotting areas ---
const mainCanvasLayout = constructLayout(620, 400, 30, 30, 30, 30);
const chartPanelLayout = constructLayout(220, 200, 30, 30, 30, 30);
const velocityChartLayout = chartPanelLayout; // Same dimensions as chartPanelLayout
const hitChartLayout = chartPanelLayout;      // Same dimensions as chartPanelLayout
const scatterChartLayout = constructLayout(220, 200, 30, 30, 30, 50);
const effectiveScatterLayout = constructLayout(540, 300, 30, 30, 30, 50);
const effectivePositionLayout = constructLayout(540, 200, 30, 30, 30, 40);
const effectiveSpeedLayout = effectivePositionLayout; // Same dimensions as effectivePositionLayout
const histogramLayout = constructLayout(540, 300, 30, 30, 30, 50);


// --- D3 Scale Definitions ---
const scatterXScale = d3.scale.linear()
    .domain([0.5, 5.5])
    .range([0, scatterChartLayout.effectiveWidth]);

const scatterYScale = d3.scale.linear()
    .domain([MAX_RESPONSE_TIME_MS, 0])
    .range([0, scatterChartLayout.effectiveHeight]);

const timeScaleForVelocity = d3.scale.linear()
    .domain([0, 1000])
    .range([0, velocityChartLayout.effectiveWidth]);

const velocityScale = d3.scale.linear()
    .domain([0, MAX_VELOCITY_UNIT])
    .range([velocityChartLayout.effectiveHeight, 0]);

const positionXScale = d3.scale.linear()
    .domain([-20, 300])
    .range([0, chartPanelLayout.effectiveWidth]);

const positionYScale = d3.scale.linear()
    .domain([-50, 50])
    .range([chartPanelLayout.effectiveHeight, 0]);

const effectiveScatterXScale = d3.scale.linear()
    .domain([0.5, 6.5])
    .range([0, effectiveScatterLayout.effectiveWidth]);

const effectiveScatterYScale = d3.scale.linear()
    .domain([MAX_RESPONSE_TIME_MS, 0])
    .range([0, effectiveScatterLayout.effectiveHeight]);

const effectivePositionXScale = d3.scale.linear()
    .domain([-60, 400])
    .range([0, effectivePositionLayout.effectiveWidth]);

const effectivePositionYScale = d3.scale.linear()
    .domain([-50, 50])
    .range([effectivePositionLayout.effectiveHeight, 0]);

const effectiveSpeedXScale = d3.scale.linear()
    .domain([0, MAX_RESPONSE_TIME_MS])
    .range([0, effectiveSpeedLayout.effectiveWidth]);

const effectiveSpeedYScale = d3.scale.linear()
    .domain([0, MAX_VELOCITY_UNIT])
    .range([effectiveSpeedLayout.effectiveHeight, 0]);


// --- Main Interaction Tracking Module ---
const userPerformanceTracker = {
    // Current target and interaction state
    activeTarget: { x: 0, y: 0, radius: 10 },
    interactionStart: { x: 0, y: 0, timestamp: 0 },
    lastInteractionPoint: {}, // Stores the last known mouse position and time

    // Parameters for target generation (ISO circles)
    targetZones: [],
    currentZoneIndex: 0,
    completedTrialsCount: 0,
    errorCount: 0,
    zoneConstraints: { minAmplitude: 120, maxAmplitude: 300, minWidth: 10, maxWidth: 100 },
    zoneSettings: { count: 9, amplitude: 200, width: 50, randomize: true },

    // Data collection for the current trial
    currentMovementTrace: [],
    isTrackingActive: false,

    // Overall data management
    trialObservations: {}, // Stores all data sets by ID
    activeTrialSetID: 0,
    trialSetCounter: 0,

    // Visualisation utilities
    resultColorGenerator: d3.scale.category10(),
    plotRefreshTimerHandle: undefined, // Timeout for plot updates


    /**
     * Generates and displays the next target for interaction.
     */
    displayNextTarget: function() {
        if (!this.targetZones.length) {
            console.error("No target zones defined. Cannot display target.");
            return;
        }

        this.activeTarget = this.targetZones[this.currentZoneIndex];
        this.activeTarget.amplitude = this.zoneSettings.amplitude; // Add amplitude for data recording

        // Advance to the next target in the sequence, wrapping around
        this.currentZoneIndex = (this.currentZoneIndex + Math.ceil(this.targetZones.length / 2)) % this.targetZones.length;

        const targetData = [this.activeTarget];
        const targetElement = d3.select('#mainInteractionArea').selectAll('.active-target').data(targetData);

        const updateTargetVisuals = (selection) => {
            selection
                .attr('cx', d => d.x)
                .attr('cy', d => d.y)
                .attr('r', d => d.width / 2); // Renamed 'w' to 'width'
        };

        targetElement.enter()
            .append('circle')
            .attr('id', 'primaryTarget') // Changed ID
            .attr('class', 'active-target') // Added class
            .style('fill', 'darkred') // Changed color
            .call(updateTargetVisuals);

        targetElement.transition()
            .duration(200) // Added transition for target movement
            .call(updateTargetVisuals);

        this.isTrackingActive = true; // Task becomes active when target is visible
    },

    /**
     * Updates the circular target zones displayed on the canvas.
     */
    refreshTargetZoneVisuals: function() {
        this.completedTrialsCount = 0; // Reset trial count for new zone setup

        this.createCircularTargetZones(
            this.zoneSettings.count,
            this.zoneSettings.amplitude,
            this.zoneSettings.width
        );

        const allCircles = d3.select('#mainInteractionArea').selectAll('.iso-zone').data(this.targetZones);

        const applyCircleAttributes = (selection) => {
            selection
                .attr('cx', d => d.x)
                .attr('cy', d => d.y)
                .attr('r', d => d.width / 2); // Renamed 'w' to 'width'
        };

        allCircles.enter()
            .append('circle')
            .attr('class', 'iso-zone')
            .style('fill', 'lightgray') // Changed fill
            .style('stroke', 'gray') // Added stroke
            .style('stroke-width', 1)
            .call(applyCircleAttributes);

        allCircles.transition()
            .duration(300) // Added transition
            .call(applyCircleAttributes);

        allCircles.exit()
            .transition()
            .duration(200)
            .attr('r', 0)
            .remove();

        this.currentZoneIndex = 0;
        this.displayNextTarget();
        this.isTrackingActive = false; // Task is not active until first click
    },

    /**
     * Generates positions for targets arranged in a circle.
     * Also clears live plotting elements.
     * @param {number} numTargets The number of targets to generate.
     * @param {number} amplitude The distance from the center to target centers.
     * @param {number} targetWidth The width/diameter of each target.
     */
    createCircularTargetZones: function(numTargets, amplitude, targetWidth) {
        // Cleanup existing live elements before generating new zones
        d3.select('#hitPlottingArea').selectAll('.recorded-hit')
            .transition().duration(LIVE_ELEMENT_RETENTION_TIME_MS).ease('linear')
            .attr('r', 1).style('opacity', 0).remove();

        d3.select('#positionPathPlot').selectAll('.live-path-segment')
            .transition().duration(LIVE_ELEMENT_RETENTION_TIME_MS)
            .style('stroke-opacity', 0).remove();

        d3.select('#velocityGraphPlot').selectAll('.live-velocity-segment')
            .transition().duration(LIVE_ELEMENT_RETENTION_TIME_MS)
            .style('stroke-opacity', 0).remove();

        this.targetZones = Array.from({ length: numTargets }).map((_, i) => {
            const angle = (2 * Math.PI * i) / numTargets;
            return {
                x: mainCanvasLayout.centralX + (amplitude / 2) * Math.cos(angle),
                y: mainCanvasLayout.centralY + (amplitude / 2) * Math.sin(angle),
                width: targetWidth // Renamed 'w' to 'width'
            };
        });
    },

    /**
     * Hides the current target from view.
     */
    clearActiveTarget: function() {
        d3.select('#mainInteractionArea').selectAll('.active-target').data([])
            .exit().remove();

        this.isTrackingActive = false;
        this.currentMovementTrace = []; // Clear path for next trial
    },

    /**
     * Handles a mouse click event within the interaction area.
     * @param {number} clickX The X coordinate of the click.
     * @param {number} clickY The Y coordinate of the click.
     */
    handleMouseClick: function(clickX, clickY) {
        const clickPoint = { x: clickX, y: clickY };
        const targetCenter = this.activeTarget;
        const targetRadius = this.activeTarget.width / 2; // Renamed 'w' to 'width'

        if (getEuclideanDistance(clickPoint, targetCenter) < targetRadius) {
            // Successful hit
            this.recordTrialData({
                trialStart: this.interactionStart,
                targetInfo: this.activeTarget,
                movementTrace: this.currentMovementTrace,
                hitDetails: { x: clickX, y: clickY, timestamp: performance.now() }
            });
            this.clearActiveTarget();

            if (this.zoneSettings.randomize && this.completedTrialsCount >= this.targetZones.length) {
                this.randomizeTargetParameters();
                this.completedTrialsCount = 0;
                this.currentZoneIndex = 0;
                this.errorCount = 0;
                this.refreshTargetZoneVisuals(); // Refreshes and displays new target
                this.isTrackingActive = false;
            } else {
                this.completedTrialsCount++;
                this.displayNextTarget();
            }

            // Prepare for the next trial
            this.lastInteractionPoint = { x: clickX, y: clickY, timestamp: performance.now() };
            this.interactionStart = this.lastInteractionPoint;
            this.currentMovementTrace = [this.lastInteractionPoint];
        } else {
            this.errorCount++; // Increment miss count
            // Optionally, provide visual feedback for a miss
        }
    },

    /**
     * Handles mouse movement events within the interaction area.
     * @param {number} moveX The X coordinate of the mouse.
     * @param {number} moveY The Y coordinate of the mouse.
     */
    handleMouseMove: function(moveX, moveY) {
        if (!this.isTrackingActive) return; // Only track movement when a task is active

        // Skip if the mouse hasn't actually moved to avoid redundant data points
        if (this.lastInteractionPoint.x === moveX && this.lastInteractionPoint.y === moveY) {
            return;
        }

        // Reset and set timeout for updating plots to prevent excessive redraws
        clearTimeout(this.plotRefreshTimerHandle);
        this.plotRefreshTimerHandle = setTimeout(() => this.updateAllPlots(this), PLOT_UPDATE_INTERVAL_MS);

        const newMousePoint = { x: moveX, y: moveY, timestamp: performance.now() };
        this.currentMovementTrace.push(newMousePoint);

        const timeDelta = newMousePoint.timestamp - this.lastInteractionPoint.timestamp;
        const distanceDelta = getEuclideanDistance(this.lastInteractionPoint, newMousePoint);
        const currentSpeed = (timeDelta > 0) ? (distanceDelta / timeDelta) : 0;

        // Visualise live mouse path
        d3.select('#mainInteractionArea').append('line')
            .attr('class', 'live-mouse-path')
            .attr('x1', this.lastInteractionPoint.x)
            .attr('y1', this.lastInteractionPoint.y)
            .attr('x2', newMousePoint.x)
            .attr('y2', newMousePoint.y)
            .style('stroke', generateVelocityColor(currentSpeed))
            .style('stroke-width', 2)
            .transition()
            .duration(5000) // Fade out duration
            .style('stroke-opacity', 0)
            .remove();

        this.lastInteractionPoint = newMousePoint;
    },

    /**
     * Adds a completed trial's data to the current dataset and updates plots.
     * @param {object} trialObservation Contains details about the completed trial.
     */
    recordTrialData: function(trialObservation) {
        if (!this.isTrackingActive) return; // Only record if task was active

        const { trialStart, targetInfo, movementTrace, hitDetails } = trialObservation;
        const responseTime = hitDetails.timestamp - trialStart.timestamp;

        // Skip if response time is an obvious outlier (too long)
        if (responseTime >= MAX_RESPONSE_TIME_MS) {
            console.warn("Trial response time exceeded MAX_RESPONSE_TIME_MS, skipping data point.");
            return;
        }

        const initialDistance = getEuclideanDistance(targetInfo, trialStart);
        const calculatedID = calculateFittsID(initialDistance, targetInfo.width); // Renamed 'w' to 'width'

        // Store the detailed trial data
        const currentDataSet = this.trialObservations[this.activeTrialSetID];
        if (!currentDataSet) {
            console.error("Active data set not found. Cannot record trial data.");
            return;
        }

        currentDataSet.data.push({
            responseTime: responseTime,
            amplitude: targetInfo.amplitude,
            targetWidth: targetInfo.width,
            hitCoordinates: hitDetails,
            startCoordinates: trialStart,
            targetCoordinates: targetInfo,
            fullMovementPath: movementTrace
        });

        // Update ID/Time scatter plot
        d3.select('#fittsScatterPlot').append('circle')
            .attr('class', `result-category-${this.activeTrialSetID}`)
            .style('fill', currentDataSet.colorCode)
            .attr('cx', scatterXScale(calculatedID))
            .attr('cy', scatterYScale(responseTime))
            .attr('r', 0)
            .transition()
            .duration(200)
            .ease('bounce')
            .attr('r', 3);

        // Update hit distribution plot (relative to target center)
        const targetA = trialStart;
        const targetB = targetInfo;

        const projectedHit = projectPointOnLine(targetA, targetB, hitDetails);
        const hitOffsetAlongAxis = getEuclideanDistance(projectedHit, targetB) * getNumericSign(projectedHit.parameter - 1);
        const hitOffsetPerpendicular = getEuclideanDistance(projectedHit, hitDetails) * isPointLeftOfLine(targetA, targetB, hitDetails);

        d3.select('#hitPlottingArea').append('circle')
            .attr('class', 'recorded-hit')
            .attr('cx', mapHitRadius(hitOffsetAlongAxis, targetInfo.width / 2))
            .attr('cy', mapHitRadius(hitOffsetPerpendicular, targetInfo.width / 2))
            .attr('r', 6)
            .style('fill', 'red')
            .style('opacity', 1)
            .transition()
            .duration(PLOT_TRANSITION_DUR)
            .ease('linear')
            .attr('r', 3);

        // Update position and velocity plots for the path
        let lastPathPointTransformed = { x: 0, y: 0, time: trialStart.timestamp, velocity: 0 };

        movementTrace.forEach(pathSegment => {
            const projectedSegment = projectPointOnLine(targetA, targetB, pathSegment);
            const transformedX = getEuclideanDistance(projectedSegment, targetA) * getNumericSign(projectedSegment.parameter);
            const transformedY = getEuclideanDistance(projectedSegment, pathSegment) * isPointLeftOfLine(targetA, targetB, pathSegment);

            const segmentTimeDelta = pathSegment.timestamp - lastPathPointTransformed.time;
            const segmentDistance = getEuclideanDistance(lastPathPointTransformed, { x: transformedX, y: transformedY });
            const segmentSpeed = (segmentTimeDelta > 0) ? (segmentDistance / segmentTimeDelta) : 0;

            d3.select('#positionPathPlot').append('line')
                .attr('class', 'live-path-segment')
                .attr('x1', positionXScale(lastPathPointTransformed.x))
                .attr('x2', positionXScale(transformedX))
                .attr('y1', positionYScale(lastPathPointTransformed.y))
                .attr('y2', positionYScale(transformedY))
                .style('stroke', generateVelocityColor(segmentSpeed))
                .style('stroke-width', 1.5)
                .transition()
                .duration(LIVE_ELEMENT_RETENTION_TIME_MS)
                .style('stroke-opacity', 0.5);

            d3.select('#velocityGraphPlot').append('line')
                .attr('class', 'live-velocity-segment')
                .attr('x1', timeScaleForVelocity(lastPathPointTransformed.time - trialStart.timestamp))
                .attr('x2', timeScaleForVelocity(pathSegment.timestamp - trialStart.timestamp))
                .attr('y1', velocityScale(lastPathPointTransformed.velocity))
                .attr('y2', velocityScale(segmentSpeed))
                .style('stroke', generateVelocityColor(segmentSpeed))
                .style('stroke-width', 1.5)
                .transition()
                .duration(LIVE_ELEMENT_RETENTION_TIME_MS)
                .style('stroke-opacity', 0.5);

            lastPathPointTransformed = {
                x: transformedX,
                y: transformedY,
                time: pathSegment.timestamp,
                velocity: segmentSpeed
            };
        });
    },

    /**
     * Randomizes the amplitude and width parameters for target generation.
     */
    randomizeTargetParameters: function() {
        this.zoneSettings.amplitude = Math.floor(getRandomNumberBetween(this.zoneConstraints.minAmplitude, this.zoneConstraints.maxAmplitude));
        this.zoneSettings.width = Math.floor(getRandomNumberBetween(this.zoneConstraints.minWidth, this.zoneConstraints.maxWidth));

        // Update UI sliders (assuming jQuery UI sliders)
        $('#amplitudeSlider').slider('value', this.zoneSettings.amplitude);
        $('#widthSlider').slider('value', this.zoneSettings.width);

        this.refreshTargetZoneVisuals(); // Re-generates and displays targets with new parameters

        // Update UI text displays
        d3.select('#amplitudeValueDisplay').text(this.zoneSettings.amplitude);
        d3.select('#widthValueDisplay').text(this.zoneSettings.width);
    },

    /**
     * Adds a new dataset for collecting trial observations.
     */
    addNewDataSet: function() {
        // First, ensure all current plots are updated with existing data
        this.updateAllPlots(this);

        this.trialSetCounter++;
        const newSetID = this.trialSetCounter;
        const assignedColor = this.resultColorGenerator(getRandomNumberBetween(0, 10)); // Use D3's categorical color scale

        this.trialObservations[newSetID] = { data: [], colorCode: assignedColor };
        this.activeTrialSetID = newSetID;

        const dataSetContainer = d3.select('#dataSetManagementArea');
        const newDataSetDiv = dataSetContainer.append('div')
            .attr('id', `dataSetEntry${newSetID}`)
            .classed('data-set-entry', true) // Add a class for styling
            .text(`Data Set ${newSetID} `)
            .style('background-color', assignedColor);

        const deleteButtonID = `deleteDataSetBtn${newSetID}`;
        newDataSetDiv.append('button')
            .attr('id', deleteButtonID)
            .attr('type', 'button')
            .text('Remove'); // Changed button text

        // Use a self-invoking function or bind 'this' for event handlers
        $(`#${deleteButtonID}`).click(() => {
            this.deleteDataSet(newSetID);
            this.isTrackingActive = false; // Deactivating task on data set deletion
        });

        $(`#dataSetEntry${newSetID}`).click(() => {
            if (doesObjectContainKey(this.trialObservations, newSetID)) {
                this.activeTrialSetID = newSetID;
                this.highlightActiveDataSet(newSetID);
            }
            this.isTrackingActive = false; // Deactivating task on data set selection change
        });

        this.highlightActiveDataSet(newSetID);
    },

    /**
     * Highlights the currently active dataset in the UI.
     * @param {number} id The ID of the dataset to highlight.
     */
    highlightActiveDataSet: function(id) {
        d3.selectAll('.data-set-entry')
            .classed('active-data-set', false); // Remove highlight from all
        d3.select(`#dataSetEntry${id}`)
            .classed('active-data-set', true); // Add highlight to the active one
    },

    /**
     * Deletes a specific dataset and removes its associated plot elements.
     * @param {number} idToDelete The ID of the dataset to remove.
     */
    deleteDataSet: function(idToDelete) {
        if (getObjectPropertyCount(this.trialObservations) <= 1) {
            alert('Cannot delete the last remaining data set! Please create another dataset first.');
            return;
        }

        d3.select(`#dataSetEntry${idToDelete}`).remove();
        delete this.trialObservations[idToDelete];

        // Remove associated plot elements
        d3.select('#fittsScatterPlot').selectAll(`.result-category-${idToDelete}`)
            .transition().duration(500).attr('r', 0).remove();

        d3.select('#effectiveFittsScatterPlot').selectAll(`.result-category-${idToDelete}`)
            .transition().duration(500).style('opacity', 0).remove();

        d3.select('#throughputBarChart').selectAll(`rect.category-${idToDelete}`)
            .transition().duration(500).attr('width', 0).remove();

        d3.select('#effectivePositionGraphPlot').selectAll(`line.category-${idToDelete}`)
            .transition().duration(500).style('opacity', 0).remove();

        d3.select('#effectiveSpeedGraphPlot').selectAll(`line.category-${idToDelete}`)
            .transition().duration(500).style('opacity', 0).remove();

        // If the deleted dataset was the active one, switch to the first available dataset
        if (idToDelete === this.activeTrialSetID) {
            const firstAvailableKey = parseInt(retrieveFirstObjectKey(this.trialObservations));
            this.activeTrialSetID = firstAvailableKey;
            this.highlightActiveDataSet(firstAvailableKey);
        }

        this.updateAllPlots(this); // Refresh all plots with remaining data
    },

    /**
     * Placeholder for a comprehensive plot update function.
     * In a full application, this would re-render all static plots
     * based on the current `trialObservations` data.
     * @param {object} context The `this` context for proper scope.
     */
    updateAllPlots: function(context) {
        // This function would typically re-draw all static plots
        // (scatter, effective scatter, throughput, etc.)
        // based on the aggregated data in context.trialObservations.
        // For Type III, we acknowledge its presence and potential complexity.
        // For instance, it might iterate through `context.trialObservations`
        // and update D3 elements for each dataset.
        console.log("Updating all static plots with current trial data.");
        // Example: Re-draw effective scatter plot
        // d3.select('#effectiveFittsScatterPlot').selectAll('*').remove();
        // for (const setId in context.trialObservations) {
        //     context.trialObservations[setId].data.forEach(d => {
        //         // Re-plot effective ID vs time
        //     });
        // }
    }
};

// --- D3 Selections (assuming these are defined elsewhere in the HTML/JS setup) ---
// For a complete runnable example, these would be initialized like:
// const mainInteractionArea = d3.select('#main-interaction-svg');
// const hitPlottingArea = d3.select('#hit-chart-svg');
// etc.
// For this clone, we keep the names consistent with the original's implicit D3 usage.
const mainInteractionArea = d3.select('#testAreaSVG');
const hitPlottingArea = d3.select('#plotHitsGroup');
const positionPathPlot = d3.select('#plotPositionGroup');
const velocityGraphPlot = d3.select('#plotVelocitiesGroup');
const fittsScatterPlot = d3.select('#scatterGroup');
const effectiveFittsScatterPlot = d3.select('#scatterEffectiveGroup');
const throughputBarChart = d3.select('#throughputGroup');
const effectivePositionGraphPlot = d3.select('#positionEffectiveGroup');
const effectiveSpeedGraphPlot = d3.select('#speedEffectiveGroup');