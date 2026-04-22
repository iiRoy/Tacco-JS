(function(diagramModule) {
    /**
     * A utility constant for handling floating point comparisons,
     * ensuring small differences are treated as equality.
     */
    const EPSILON_VAL = 1e-10;

    /**
     * Factory function for creating a new Venn diagram chart component.
     * This component can be configured with various properties and
     * then rendered onto a D3 selection.
     * @returns {Function} The configurable chart function.
     */
    diagramModule.VennLayoutGenerator = function() {
        let drawingWidth = 600;
        let drawingHeight = 350;
        let boundaryPadding = 15;
        let animationDurationMs = 1000;
        let textDisplaySize = null; // null means auto-size
        let colorPalette = d3.scale.category10();
        let layoutAlgorithm = diagramModule.vennSetLayout; // Default layout method

        /**
         * The main rendering function that D3 will call on a selection.
         * @param {d3.Selection} containerSelection The D3 selection to render into.
         */
        function renderChart(containerSelection) {
            containerSelection.each(function(inputData) {
                if (!inputData || inputData.length === 0) {
                    console.warn("No data provided for Venn diagram rendering.");
                    return;
                }

                // Calculate circle positions and scale them to fit the drawing area
                const computedCircles = diagramModule.normalizeLayout(
                    layoutAlgorithm(inputData),
                    drawingWidth,
                    drawingHeight,
                    boundaryPadding
                );

                // Determine optimal text placement coordinates
                const labelCoordinates = diagramModule.calculateLabelPositions(
                    computedCircles,
                    inputData,
                    drawingWidth,
                    drawingHeight
                );

                // Select or create the main SVG element for the diagram
                const svgContainer = d3.select(this).selectAll("svg").data([computedCircles]);
                svgContainer.enter().append("svg");

                svgContainer
                    .attr("width", drawingWidth)
                    .attr("height", drawingHeight);

                // To enable smooth transitions for area paths, we need to capture
                // the state of previous circle locations from the SVG elements.
                const priorState = {};
                let hasPastState = false;

                svgContainer.selectAll("g.venn-area-group").each(function (elementDatum) {
                    const pathElement = d3.select(this).select("path").attr("d");
                    if ((elementDatum.sets.length === 1) && pathElement) {
                        hasPastState = true;
                        priorState[elementDatum.sets[0]] = diagramModule.extractCircleFromPath(pathElement);
                    }
                });

                /**
                 * Generates an interpolation function for area paths, allowing smooth transitions.
                 * @param {Object} currentDatum The data for the current path.
                 * @returns {Function} A function that takes a transition progress `t` and returns an SVG path string.
                 */
                const pathInterpolator = (currentDatum) => {
                    return (transitionProgress) => {
                        const interpolatedCircles = currentDatum.sets.map((setId) => {
                            let startCircle = priorState[setId];
                            let endCircle = computedCircles[setId];

                            // If a circle was not present before, initialize it at the center
                            if (!startCircle) {
                                startCircle = { x: drawingWidth / 2, y: drawingHeight / 2, radius: 1 };
                            }
                            // If a circle is no longer present, transition it to the center
                            if (!endCircle) {
                                endCircle = { x: drawingWidth / 2, y: drawingHeight / 2, radius: 1 };
                            }

                            return {
                                'x': startCircle.x * (1 - transitionProgress) + endCircle.x * transitionProgress,
                                'y': startCircle.y * (1 - transitionProgress) + endCircle.y * transitionProgress,
                                'radius': startCircle.radius * (1 - transitionProgress) + endCircle.radius * transitionProgress
                            };
                        });
                        return diagramModule.generateIntersectionPath(interpolatedCircles);
                    };
                };

                // Bind new data, using set identifiers for object constancy
                const dataNodes = svgContainer.selectAll("g.venn-area-group")
                    .data(inputData, (d) => d.sets.join('_')); // Use joined set names as key

                // Handle new data entries (entering nodes)
                const newNodes = dataNodes.enter()
                    .append('g')
                    .attr("class", (d) => {
                        const areaType = (d.sets.length === 1) ? "single-circle" : "multi-intersection";
                        const setClass = "venn-sets-" + d.sets.join("_");
                        return `venn-area-group ${areaType} ${setClass}`;
                    });

                newNodes.append("path")
                    .style("fill-opacity", 0)
                    .filter((d) => d.sets.length === 1) // Only apply fill to single circles initially
                    .style("fill", (d) => colorPalette(getAreaLabel(d)))
                    .style("fill-opacity", 0.25);

                const newTextElements = newNodes.append("text")
                    .attr("class", "venn-label-text")
                    .style("fill", (d) => (d.sets.length === 1) ? colorPalette(getAreaLabel(d)) : "#444")
                    .text((d) => getAreaLabel(d))
                    .attr("text-anchor", "middle")
                    .attr("dy", ".35em") // Vertical alignment
                    .attr("x", drawingWidth / 2)
                    .attr("y", drawingHeight / 2);

                // Update existing nodes
                const updatedNodes = dataNodes.transition("venn-update").duration(hasPastState ? animationDurationMs : 0);
                updatedNodes.select("path")
                    .attrTween("d", pathInterpolator);

                const updatedTextElements = updatedNodes.select("text.venn-label-text")
                    .text((d) => getAreaLabel(d))
                    .each("end", function(d) {
                        // Custom text wrapping logic, if available
                        if (diagramModule.wrapLabelText) {
                            diagramModule.wrapLabelText(d3.select(this), computedCircles, getAreaLabel);
                        }
                    })
                    .attr("x", (d) => Math.floor(labelCoordinates[d.sets].x))
                    .attr("y", (d) => Math.floor(labelCoordinates[d.sets].y));

                // Apply explicit font size if configured
                if (textDisplaySize !== null) {
                    newTextElements.style("font-size", "0px"); // New text starts small
                    updatedTextElements.style("font-size", textDisplaySize);
                }

                // Handle nodes that are no longer in the data (exiting nodes)
                const exitingNodes = dataNodes.exit().transition('venn-exit').duration(animationDurationMs).remove();
                exitingNodes.select("path")
                    .attrTween("d", pathInterpolator); // Transition path to center

                exitingNodes.select("text.venn-label-text")
                    .text((d) => getAreaLabel(d))
                    .attr("x", drawingWidth / 2)
                    .attr("y", drawingHeight / 2)
                    .style("font-size", "0px"); // Text shrinks to nothing
            });
        }

        /**
         * Helper function to extract a meaningful label for a data object.
         * @param {Object} datum The data object.
         * @returns {string} The label string.
         */
        function getAreaLabel(datum) {
            if (datum.label) {
                return datum.label;
            }
            if (datum.sets.length === 1) {
                return String(datum.sets[0]);
            }
            return ''; // Default for intersections if no explicit label
        }

        // --- Chart Configuration Accessors ---
        renderChart.width = function(newWidthVal) {
            if (!arguments.length) return drawingWidth;
            drawingWidth = newWidthVal;
            return renderChart;
        };

        renderChart.height = function(newHeightVal) {
            if (!arguments.length) return drawingHeight;
            drawingHeight = newHeightVal;
            return renderChart;
        };

        renderChart.padding = function(newPaddingVal) {
            if (!arguments.length) return boundaryPadding;
            boundaryPadding = newPaddingVal;
            return renderChart;
        };

        renderChart.colors = function(newColorScale) {
            if (!arguments.length) return colorPalette;
            colorPalette = newColorScale;
            return renderChart;
        };

        renderChart.fontSize = function(newFontSizeVal) {
            if (!arguments.length) return textDisplaySize;
            textDisplaySize = newFontSizeVal;
            return renderChart;
        };

        renderChart.duration = function(newDurationMs) {
            if (!arguments.length) return animationDurationMs;
            animationDurationMs = newDurationMs;
            return renderChart;
        };

        renderChart.layoutFunction = function(newLayoutFunc) {
            if (!arguments.length) return layoutAlgorithm;
            layoutAlgorithm = newLayoutFunc;
            return renderChart;
        };

        return renderChart;
    };

    /**
     * Calculates optimal (x,y) positions for text labels within each circle/intersection.
     * This is an internal helper for the main chart rendering.
     * @param {Object} circleGeometry A map of set IDs to {x, y, radius} for each circle.
     * @param {Array<Object>} inputData The raw data describing sets and intersections.
     * @param {number} chartWidth The total width of the chart.
     * @param {number} chartHeight The total height of the chart.
     * @returns {Object} A map from set IDs (joined string) to {x, y} coordinates for text.
     */
    diagramModule.calculateLabelPositions = function(circleGeometry, inputData, chartWidth, chartHeight) {
        const textPositions = {};

        // For single circles, the label is usually at the circle's center
        inputData.filter(d => d.sets.length === 1).forEach(d => {
            const circle = circleGeometry[d.sets[0]];
            if (circle) {
                textPositions[d.sets] = { x: circle.x, y: circle.y };
            }
        });

        // For intersections, we need to find the geometric center of the intersection area
        inputData.filter(d => d.sets.length > 1).forEach(d => {
            const intersectingCircles = d.sets.map(setId => circleGeometry[setId]).filter(Boolean);
            if (intersectingCircles.length > 0) {
                const intersectionCenter = diagramModule.getGeometricCenter(intersectingCircles);
                textPositions[d.sets] = intersectionCenter;
            } else {
                // Fallback to chart center if intersection circles are missing
                textPositions[d.sets] = { x: chartWidth / 2, y: chartHeight / 2 };
            }
        });
        return textPositions;
    };

    /**
     * Calculates the geometric center of a set of circles.
     * This is a simplified approach for label placement, not for precise area calculation.
     * @param {Array<Object>} circles An array of circle objects {x, y, radius}.
     * @returns {{x: number, y: number}} The approximate center point.
     */
    diagramModule.getGeometricCenter = function(circles) {
        let sumX = 0, sumY = 0, count = 0;
        circles.forEach(c => {
            sumX += c.x;
            sumY += c.y;
            count++;
        });
        return { x: sumX / count, y: sumY / count };
    };

    /**
     * Given a list of set objects and their overlaps, this function updates
     * the (x, y, radius) attributes on each set to optimize their positions
     * to match the desired overlap areas.
     * @param {Array<Object>} areas Data describing individual sets and their overlaps.
     * @param {Object} [layoutOptions] Configuration options for the layout algorithm.
     * @returns {Object} A map of set IDs to their optimized circle geometry ({x, y, radius}).
     */
    diagramModule.vennSetLayout = function(areas, layoutOptions = {}) {
        const options = {
            maxIterations: layoutOptions.maxIterations || 500,
            errorFunction: layoutOptions.errorFunction || diagramModule.calculateLayoutError,
            initialPositioning: layoutOptions.initialPositioning || diagramModule.greedyInitialLayout,
            optimizer: layoutOptions.optimizer || diagramModule.gradientDescentOptimizer
        };

        // Perform an initial greedy placement of circles
        const circleDefinitions = options.initialPositioning(areas);

        // Prepare the initial layout for optimization: extract x/y coordinates into a flat array
        const optimizationVector = [];
        const setIdentifierMap = []; // Maps vector index back to set ID

        for (const setId in circleDefinitions) {
            if (Object.prototype.hasOwnProperty.call(circleDefinitions, setId)) {
                optimizationVector.push(circleDefinitions[setId].x);
                optimizationVector.push(circleDefinitions[setId].y);
                setIdentifierMap.push(setId);
            }
        }

        let optimizationCalls = 0;
        const optimizationResult = options.optimizer(
            (coordValues) => {
                optimizationCalls += 1;
                const currentLayout = {};
                for (let i = 0; i < setIdentifierMap.length; ++i) {
                    const setId = setIdentifierMap[i];
                    currentLayout[setId] = {
                        x: coordValues[2 * i],
                        y: coordValues[2 * i + 1],
                        radius: circleDefinitions[setId].radius,
                        // size: circleDefinitions[setId].size // Retain original size if needed
                    };
                }
                return options.errorFunction(currentLayout, areas);
            },
            optimizationVector,
            options // Pass options to the optimizer if it needs them
        );

        // Transform the optimized vector back into circle geometry
        const finalPositions = optimizationResult.solution;
        for (let i = 0; i < setIdentifierMap.length; ++i) {
            const setId = setIdentifierMap[i];
            circleDefinitions[setId].x = finalPositions[2 * i];
            circleDefinitions[setId].y = finalPositions[2 * i + 1];
        }

        return circleDefinitions;
    };

    /**
     * Calculates the required distance between two circle centers for a given overlap area.
     * @param {number} rA Radius of the first circle.
     * @param {number} rB Radius of the second circle.
     * @param {number} desiredOverlap The target overlap area.
     * @returns {number} The distance between centers.
     */
    diagramModule.distanceFromIntersectArea = function(rA, rB, desiredOverlap) {
        if (desiredOverlap < 0) return rA + rB; // No overlap, max distance
        if (desiredOverlap === 0) return rA + rB;

        // Handle cases where one circle completely contains the other or they are identical
        const minRadiusSquared = Math.pow(Math.min(rA, rB), 2);
        if (minRadiusSquared * Math.PI <= desiredOverlap + EPSILON_VAL) {
            return Math.abs(rA - rB); // Distance for containment
        }

        // Use bisection method to find the distance
        return diagramModule.findRootByBisection(
            (centerDistance) => diagramModule.calculateCircleOverlapArea(rA, rB, centerDistance) - desiredOverlap,
            0, // Minimum possible distance (circles concentric)
            rA + rB // Maximum possible distance (circles touching)
        );
    };

    /**
     * Computes a matrix of Euclidean distances between all single sets.
     * This is typically used as input for Multidimensional Scaling (MDS).
     * @param {Array<Object>} allAreas All set and intersection data.
     * @param {Array<Object>} singleSets An array of single set objects (with size).
     * @param {Object} setIdToIndexMap A mapping from set ID to its index in `singleSets`.
     * @returns {Array<Array<number>>} A symmetric distance matrix.
     */
    diagramModule.getDistanceMatrix = function(allAreas, singleSets, setIdToIndexMap) {
        const numSets = singleSets.length;
        // Initialize an empty distance matrix
        const distMatrix = Array.from({ length: numSets }, () => Array(numSets).fill(0));

        // Populate distances based on pairwise overlaps
        for (const area of allAreas) {
            if (area.sets.length !== 2) {
                continue; // Only interested in pairwise overlaps for initial distance
            }

            const [set1Id, set2Id] = area.sets;
            const idx1 = setIdToIndexMap[set1Id];
            const idx2 = setIdToIndexMap[set2Id];

            if (idx1 === undefined || idx2 === undefined) {
                console.warn(`Missing set ID in map: ${set1Id} or ${set2Id}`);
                continue;
            }

            const radius1 = Math.sqrt(singleSets[idx1].size / Math.PI);
            const radius2 = Math.sqrt(singleSets[idx2].size / Math.PI);
            const requiredDistance = diagramModule.distanceFromIntersectArea(radius1, radius2, area.size);

            distMatrix[idx1][idx2] = distMatrix[idx2][idx1] = requiredDistance;
        }
        return distMatrix;
    };

    /**
     * Implements a greedy algorithm for initial Venn diagram layout.
     * It positions sets one by one, starting with the most overlapped.
     * @param {Array<Object>} allAreas Data describing individual sets and their overlaps.
     * @returns {Object} A map of set IDs to their initial circle geometry ({x, y, radius}).
     */
    diagramModule.greedyInitialLayout = function(allAreas) {
        const circleObjects = {};
        const setOverlapInfo = {}; // Stores overlaps for each single set

        // Initialize circles for single sets and their overlap tracking
        allAreas.forEach((area) => {
            if (area.sets.length === 1) {
                const setId = area.sets[0];
                circleObjects[setId] = {
                    x: 0, y: 0, // Placeholder, will be updated
                    size: area.size,
                    radius: Math.sqrt(area.size / Math.PI)
                };
                setOverlapInfo[setId] = [];
            }
        });

        // Filter for pairwise overlaps and populate setOverlapInfo
        const pairwiseAreas = allAreas.filter((a) => a.sets.length === 2);
        pairwiseAreas.forEach((currentOverlap) => {
            const overlapWeight = currentOverlap.hasOwnProperty('weight') ? currentOverlap.weight : 1.0;
            const [leftSetId, rightSetId] = currentOverlap.sets;

            // Skip if either set is not defined (e.g., malformed data)
            if (!circleObjects[leftSetId] || !circleObjects[rightSetId]) {
                console.warn(`Skipping overlap for undefined sets: ${leftSetId}, ${rightSetId}`);
                return;
            }

            // If circles are completely overlapped, reduce their positioning influence
            if (currentOverlap.size + EPSILON_VAL >= Math.min(circleObjects[leftSetId].size, circleObjects[rightSetId].size)) {
                // This indicates one circle might fully contain another.
                // We could set weight to 0 to ignore for greedy placement, or adjust distance.
                // For now, let's keep the weight but acknowledge the special case.
            }

            setOverlapInfo[leftSetId].push({ targetSet: rightSetId, overlapSize: currentOverlap.size, influence: overlapWeight });
            setOverlapInfo[rightSetId].push({ targetSet: leftSetId, overlapSize: currentOverlap.size, influence: overlapWeight });
        });

        // Determine the order of positioning: most overlapped sets first
        const sortedSetsForPlacement = Object.keys(setOverlapInfo)
            .map((setId) => {
                const totalInfluence = setOverlapInfo[setId].reduce((sum, ov) => sum + ov.overlapSize * ov.influence, 0);
                return { setId, totalInfluence };
            })
            .sort((a, b) => b.totalInfluence - a.totalInfluence); // Descending order of influence

        const positionedSets = new Set();

        /**
         * Places a set at a given coordinate and marks it as positioned.
         * @param {{x: number, y: number}} coords The coordinates to place the set.
         * @param {string} setId The ID of the set to position.
         */
        const placeSet = (coords, setId) => {
            circleObjects[setId].x = coords.x;
            circleObjects[setId].y = coords.y;
            positionedSets.add(setId);
        };

        // Place the first (most influential) set at the origin (0,0)
        if (sortedSetsForPlacement.length > 0) {
            placeSet({ x: 0, y: 0 }, sortedSetsForPlacement[0].setId);
        } else {
            // Handle case with no single sets or overlaps
            return {};
        }

        // Iterate through remaining sets and position them relative to already placed sets
        for (let i = 1; i < sortedSetsForPlacement.length; ++i) {
            const currentSetId = sortedSetsForPlacement[i].setId;
            const currentSet = circleObjects[currentSetId];
            const overlapsWithPlaced = setOverlapInfo[currentSetId]
                .filter((ov) => positionedSets.has(ov.targetSet))
                .sort((a, b) => b.overlapSize - a.overlapSize); // Prioritize larger overlaps

            if (overlapsWithPlaced.length === 0) {
                // If a set has no overlaps with already placed sets, place it at (0,0) or a default offset
                console.warn(`Set "${currentSetId}" has no overlaps with already placed sets. Placing at origin.`);
                placeSet({ x: 0, y: 0 }, currentSetId);
                continue;
            }

            const candidatePoints = [];

            // Generate candidate points based on overlaps with already placed sets
            for (let j = 0; j < overlapsWithPlaced.length; ++j) {
                const overlapDef1 = overlapsWithPlaced[j];
                const placedCircle1 = circleObjects[overlapDef1.targetSet];
                const requiredDist1 = diagramModule.distanceFromIntersectArea(
                    currentSet.radius,
                    placedCircle1.radius,
                    overlapDef1.overlapSize
                );

                // Add points directly along axes from the first placed circle
                candidatePoints.push({ x: placedCircle1.x + requiredDist1, y: placedCircle1.y });
                candidatePoints.push({ x: placedCircle1.x - requiredDist1, y: placedCircle1.y });
                candidatePoints.push({ x: placedCircle1.x, y: placedCircle1.y + requiredDist1 });
                candidatePoints.push({ x: placedCircle1.x, y: placedCircle1.y - requiredDist1 });

                // If there's a second placed circle, calculate intersection points
                for (let k = j + 1; k < overlapsWithPlaced.length; ++k) {
                    const overlapDef2 = overlapsWithPlaced[k];
                    const placedCircle2 = circleObjects[overlapDef2.targetSet];
                    const requiredDist2 = diagramModule.distanceFromIntersectArea(
                        currentSet.radius,
                        placedCircle2.radius,
                        overlapDef2.overlapSize
                    );

                    const intersectionPoints = diagramModule.getCircleIntersectionPoints(
                        { x: placedCircle1.x, y: placedCircle1.y, radius: requiredDist1 },
                        { x: placedCircle2.x, y: placedCircle2.y, radius: requiredDist2 }
                    );
                    candidatePoints.push(...intersectionPoints);
                }
            }

            // Evaluate candidate points using the loss function to find the best fit
            let bestError = Infinity;
            let bestCandidateLocation = candidatePoints[0] || { x: 0, y: 0 }; // Fallback

            for (const candidate of candidatePoints) {
                // Temporarily place the current set at the candidate location
                currentSet.x = candidate.x;
                currentSet.y = candidate.y;
                const currentError = diagramModule.calculateLayoutError(circleObjects, allAreas);
                if (currentError < bestError) {
                    bestError = currentError;
                    bestCandidateLocation = candidate;
                }
            }
            placeSet(bestCandidateLocation, currentSetId);
        }

        return circleObjects;
    };

    /**
     * Utilizes Multidimensional Scaling (MDS) to generate an initial layout.
     * This method is generally more robust but potentially slower for many sets.
     * @param {Array<Object>} areas Data describing individual sets and their overlaps.
     * @returns {Object} A map of set IDs to their initial circle geometry ({x, y, radius}).
     */
    diagramModule.classicMDSLayout = function(areas) {
        // Create a bidirectional map for set IDs and their matrix indices
        const singleSetData = [];
        const setIdToMatrixIndex = {};

        areas.forEach((area) => {
            if (area.sets.length === 1) {
                const setId = area.sets[0];
                setIdToMatrixIndex[setId] = singleSetData.length;
                singleSetData.push(area); // Store the full area object for radius calc
            }
        });

        // Ensure there are sets to layout
        if (singleSetData.length === 0) {
            return {};
        }

        // Get the distance matrix based on pairwise overlaps
        const distanceMatrix = diagramModule.getDistanceMatrix(areas, singleSetData, setIdToMatrixIndex);

        // Perform MDS if a `mds` library is available (e.g., from d3-mds)
        if (typeof mds === 'object' && typeof mds.classic === 'function') {
            const mdsPositions = mds.classic(distanceMatrix);

            // Translate MDS results back to circle coordinates
            const layoutCircles = {};
            singleSetData.forEach((setArea, i) => {
                const setId = setArea.sets[0];
                layoutCircles[setId] = {
                    x: mdsPositions[i][0],
                    y: mdsPositions[i][1],
                    radius: Math.sqrt(setArea.size / Math.PI)
                };
            });
            return layoutCircles;
        } else {
            console.error("MDS library not found. Please ensure 'mds' is available (e.g., d3-mds). Falling back to greedy layout.");
            return diagramModule.greedyInitialLayout(areas);
        }
    };

    /**
     * Calculates the "loss" or error of a given Venn diagram layout.
     * This function quantifies how far the actual overlaps deviate from the desired overlaps.
     * @param {Object} currentSetLayout A map of set IDs to their {x, y, radius} circles.
     * @param {Array<Object>} desiredOverlaps Data describing all desired overlaps.
     * @returns {number} The total squared error.
     */
    diagramModule.calculateLayoutError = function(currentSetLayout, desiredOverlaps) {
        let totalError = 0;

        for (const areaDefinition of desiredOverlaps) {
            const setIds = areaDefinition.sets;
            if (setIds.length === 1) {
                continue; // Single sets don't contribute to overlap error directly
            }

            let actualOverlapArea;
            if (setIds.length === 2) {
                const [id1, id2] = setIds;
                const circle1 = currentSetLayout[id1];
                const circle2 = currentSetLayout[id2];

                if (!circle1 || !circle2) {
                    // If a circle is missing from layout, assume no overlap or very high error
                    actualOverlapArea = 0;
                    totalError += areaDefinition.size * areaDefinition.size * 100; // Penalize heavily
                    continue;
                }
                actualOverlapArea = diagramModule.calculateCircleOverlapArea(
                    circle1.radius,
                    circle2.radius,
                    diagramModule.getEuclideanDistance(circle1, circle2)
                );
            } else {
                // For multi-set intersections (3+), calculate their area
                const intersectingCircles = setIds.map(id => currentSetLayout[id]).filter(Boolean);
                if (intersectingCircles.length !== setIds.length) {
                    actualOverlapArea = 0; // Some circles missing
                    totalError += areaDefinition.size * areaDefinition.size * 100; // Penalize heavily
                    continue;
                }
                actualOverlapArea = diagramModule.calculateMultiIntersectionArea(intersectingCircles);
            }

            const errorDifference = actualOverlapArea - areaDefinition.size;
            const influenceFactor = areaDefinition.hasOwnProperty('weight') ? areaDefinition.weight : 1.0;
            totalError += influenceFactor * errorDifference * errorDifference; // Squared error
        }

        return totalError;
    };

    /**
     * Scales and translates a Venn diagram layout to fit within a specified
     * width and height, applying padding and centering the diagram.
     * @param {Object} rawSolution A map of set IDs to raw {x, y, radius} circle data.
     * @param {number} targetWidth The desired width of the final drawing area.
     * @param {number} targetHeight The desired height of the final drawing area.
     * @param {number} borderPadding The padding to apply around the diagram.
     * @returns {Object} A map of set IDs to scaled {x, y, radius} circle data.
     */
    diagramModule.normalizeLayout = function(rawSolution, targetWidth, targetHeight, borderPadding) {
        const solutionCircles = Object.values(rawSolution);
        const solutionSetIds = Object.keys(rawSolution);

        if (solutionCircles.length === 0) {
            return {};
        }

        // Helper to find min/max extent for a given dimension (x or y)
        const getExtent = (dimension) => {
            let minVal = Infinity;
            let maxVal = -Infinity;
            for (const c of solutionCircles) {
                minVal = Math.min(minVal, c[dimension] - c.radius);
                maxVal = Math.max(maxVal, c[dimension] + c.radius);
            }
            return { min: minVal, max: maxVal };
        };

        const availableWidth = targetWidth - (2 * borderPadding);
        const availableHeight = targetHeight - (2 * borderPadding);

        const xExtents = getExtent('x');
        const yExtents = getExtent('y');

        const layoutWidth = xExtents.max - xExtents.min;
        const layoutHeight = yExtents.max - yExtents.min;

        // Calculate scaling factor, maintaining aspect ratio
        const scaleX = layoutWidth > 0 ? availableWidth / layoutWidth : 1;
        const scaleY = layoutHeight > 0 ? availableHeight / layoutHeight : 1;
        const finalScale = Math.min(scaleX, scaleY);

        // Calculate offsets to center the scaled diagram
        const scaledLayoutWidth = layoutWidth * finalScale;
        const scaledLayoutHeight = layoutHeight * finalScale;

        const offsetX = (availableWidth - scaledLayoutWidth) / 2;
        const offsetY = (availableHeight - scaledLayoutHeight) / 2;

        const normalizedCircles = {};
        for (let i = 0; i < solutionCircles.length; ++i) {
            const originalCircle = solutionCircles[i];
            const setId = solutionSetIds[i];

            normalizedCircles[setId] = {
                radius: finalScale * originalCircle.radius,
                x: borderPadding + offsetX + (originalCircle.x - xExtents.min) * finalScale,
                y: borderPadding + offsetY + (originalCircle.y - yExtents.min) * finalScale,
            };
        }
        return normalizedCircles;
    };

    // --- Core Geometry and Math Helpers (moved from venn.js or defined here) ---

    /**
     * Calculates the Euclidean distance between two points (or objects with x, y properties).
     * @param {{x: number, y: number}} p1 First point.
     * @param {{x: number, y: number}} p2 Second point.
     * @returns {number} The distance.
     */
    diagramModule.getEuclideanDistance = function(p1, p2) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        return Math.sqrt(dx * dx + dy * dy);
    };

    /**
     * Calculates the area of intersection between two circles.
     * @param {number} r1 Radius of the first circle.
     * @param {number} r2 Radius of the second circle.
     * @param {number} d Distance between their centers.
     * @returns {number} The overlap area.
     */
    diagramModule.calculateCircleOverlapArea = function(r1, r2, d) {
        if (d >= r1 + r2) return 0; // Circles too far apart
        if (d <= Math.abs(r1 - r2)) return Math.PI * Math.min(r1, r2) * Math.min(r1, r2); // One circle inside another

        const d_sq = d * d;
        const r1_sq = r1 * r1;
        const r2_sq = r2 * r2;

        const angle1 = Math.acos((d_sq + r1_sq - r2_sq) / (2 * d * r1));
        const angle2 = Math.acos((d_sq + r2_sq - r1_sq) / (2 * d * r2));

        return r1_sq * angle1 + r2_sq * angle2 - 0.5 * (r1_sq * Math.sin(2 * angle1) + r2_sq * Math.sin(2 * angle2));
    };

    /**
     * Finds the roots of a function using the bisection method.
     * @param {Function} func The function for which to find the root.
     * @param {number} lowerBound The lower bound of the search interval.
     * @param {number} upperBound The upper bound of the search interval.
     * @param {number} [tolerance=EPSILON_VAL] The desired accuracy.
     * @param {number} [maxIterations=100] Maximum number of iterations.
     * @returns {number} An approximation of the root.
     */
    diagramModule.findRootByBisection = function(func, lowerBound, upperBound, tolerance = EPSILON_VAL, maxIterations = 100) {
        let iterations = 0;
        let midPoint;

        let f_lower = func(lowerBound);
        let f_upper = func(upperBound);

        // Check for edge cases where bounds are already roots or no root in interval
        if (Math.abs(f_lower) < tolerance) return lowerBound;
        if (Math.abs(f_upper) < tolerance) return upperBound;
        if (f_lower * f_upper > 0) {
            // No root (or multiple even roots) in interval. Return a reasonable default.
            // For Venn, this might mean circles are concentric or too far apart.
            // console.warn("Bisection: No root found in interval or multiple even roots. Returning midpoint.");
            return (lowerBound + upperBound) / 2;
        }

        while ((upperBound - lowerBound) / 2 > tolerance && iterations < maxIterations) {
            midPoint = (lowerBound + upperBound) / 2;
            const f_mid = func(midPoint);

            if (Math.abs(f_mid) < tolerance) {
                return midPoint;
            }

            if (f_mid * f_lower < 0) {
                upperBound = midPoint;
            } else {
                lowerBound = midPoint;
                f_lower = f_mid; // Update f_lower to reflect new lower bound
            }
            iterations++;
        }
        return (lowerBound + upperBound) / 2;
    };

    /**
     * Calculates the intersection points of two circles.
     * @param {{x: number, y: number, radius: number}} c1 First circle.
     * @param {{x: number, y: number, radius: number}} c2 Second circle.
     * @returns {Array<{x: number, y: number}>} An array of intersection points (0, 1, or 2 points).
     */
    diagramModule.getCircleIntersectionPoints = function(c1, c2) {
        const d = diagramModule.getEuclideanDistance(c1, c2);

        // Check for no intersection or one circle contained within another
        if (d > c1.radius + c2.radius || d < Math.abs(c1.radius - c2.radius)) {
            return [];
        }

        const a = (c1.radius * c1.radius - c2.radius * c2.radius + d * d) / (2 * d);
        const h = Math.sqrt(c1.radius * c1.radius - a * a);

        const x2 = c1.x + a * (c2.x - c1.x) / d;
        const y2 = c1.y + a * (c2.y - c1.y) / d;

        const intersectionPoints = [];
        if (!isNaN(h) && h > EPSILON_VAL) { // Two distinct intersection points
            intersectionPoints.push({
                x: x2 + h * (c2.y - c1.y) / d,
                y: y2 - h * (c2.x - c1.x) / d
            });
            intersectionPoints.push({
                x: x2 - h * (c2.y - c1.y) / d,
                y: y2 + h * (c2.x - c1.x) / d
            });
        } else if (Math.abs(h) < EPSILON_VAL) { // One intersection point (tangent)
            intersectionPoints.push({ x: x2, y: y2 });
        }
        return intersectionPoints;
    };


    /**
     * Placeholder for multi-intersection area calculation.
     * This is typically a more complex geometric problem or approximated.
     * For this clone, it's a simplified version.
     * @param {Array<Object>} circles An array of circle objects {x, y, radius}.
     * @returns {number} The approximated intersection area.
     */
    diagramModule.calculateMultiIntersectionArea = function(circles) {
        if (circles.length < 2) return 0;
        if (circles.length === 2) {
            return diagramModule.calculateCircleOverlapArea(circles[0].radius, circles[1].radius, diagramModule.getEuclideanDistance(circles[0], circles[1]));
        }
        // For 3+ circles, this is a complex problem. A simple approximation for loss function
        // could be to take the smallest pairwise overlap, or average.
        // A more robust solution would involve polygon clipping or numerical integration.
        // For this Type III clone, we'll provide a simplified approximation.
        let minOverlap = Infinity;
        for (let i = 0; i < circles.length; i++) {
            for (let j = i + 1; j < circles.length; j++) {
                minOverlap = Math.min(minOverlap, diagramModule.calculateCircleOverlapArea(
                    circles[i].radius, circles[j].radius, diagramModule.getEuclideanDistance(circles[i], circles[j])
                ));
            }
        }
        // This is a very rough approximation, not geometrically accurate for >2 circles.
        // It's meant to provide a value for the loss function.
        return minOverlap;
    };

    /**
     * Generates an SVG path string for a given set of intersecting circles.
     * This is primarily for visual representation.
     * @param {Array<Object>} circles An array of circle objects {x, y, radius}.
     * @returns {string} The SVG path data string.
     */
    diagramModule.generateIntersectionPath = function(circles) {
        if (circles.length === 1) {
            const c = circles[0];
            return `M ${c.x} ${c.y} m -${c.radius}, 0 a ${c.radius},${c.radius} 0 1,0 ${c.radius * 2},0 a ${c.radius},${c.radius} 0 1,0 -${c.radius * 2},0`;
        }
        // This function would typically be more complex, involving d3.geom.polygon or similar.
        // For a Type III clone, we can simplify or refer to the original implementation's complexity.
        // The original `venn.intersectionAreaPath` uses a more sophisticated approach not easily replicated here.
        // Let's provide a basic approximation for common cases or a simplified path.
        // For single circles, it's a proper circle path. For intersections, it's often a union of paths.
        // The original library would use its own `intersectionAreaPath` which is not provided in the snippet.
        // A simple polygon approximation or a path that roughly outlines the intersection can be used.
        // For simplicity, let's just return a placeholder or a path for the smallest circle in the intersection.
        // In a real scenario, this would likely be an external dependency or a complex geometric algorithm.
        let pathData = '';
        if (circles.length > 0) {
            // For multiple circles, we can't draw a perfect intersection path easily without more geometry.
            // Let's just draw the path for the first circle as a fallback.
            // The `pathTween` in the main chart logic needs to produce a valid path.
            // If the original `venn.intersectionAreaPath` is not provided, this is a reasonable simplification
            // for the clone, indicating where a complex geometry function would be.
            const c = circles[0];
            pathData = `M ${c.x} ${c.y} m -${c.radius}, 0 a ${c.radius},${c.radius} 0 1,0 ${c.radius * 2},0 a ${c.radius},${c.radius} 0 1,0 -${c.radius * 2},0`;
        }
        return pathData;
    };

    /**
     * Extracts circle properties (x, y, radius) from an SVG path string for a circle.
     * This is a simplified parser for paths generated by `generateIntersectionPath` for single circles.
     * @param {string} pathString The 'd' attribute of an SVG path.
     * @returns {Object|null} An object {x, y, radius} or null if parsing fails.
     */
    diagramModule.extractCircleFromPath = function(pathString) {
        // Expected format for a circle: M cx cy m -r, 0 a r,r 0 1,0 2r,0 a r,r 0 1,0 -2r,0
        const parts = pathString.match(/M\s*(-?\d+(\.\d+)?)\s*(-?\d+(\.\d+)?)\s*m\s*(-?\d+(\.\d+)?),\s*0\s*a\s*(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)/);
        if (parts && parts.length >= 10) {
            const cx = parseFloat(parts[1]);
            const cy = parseFloat(parts[3]);
            const radius = Math.abs(parseFloat(parts[5])); // Radius is usually positive, but from -r,0 it could be negative
            return { x: cx, y: cy, radius: radius };
        }
        return null; // Could not parse
    };

    /**
     * Basic gradient descent optimizer for minimizing a function.
     * This is a simplified version of `venn.fmin` from the original,
     * which might have used a more sophisticated optimization library.
     * @param {Function} costFunction The function to minimize.
     * @param {Array<number>} initialGuess An array of initial parameter values.
     * @param {Object} options Configuration for the optimizer (e.g., maxIterations, learningRate).
     * @returns {{solution: Array<number>, cost: number}} The optimized parameters and final cost.
     */
    diagramModule.gradientDescentOptimizer = function(costFunction, initialGuess, options) {
        const maxIter = options.maxIterations || 500;
        const learningRate = options.learningRate || 0.1; // A simple fixed learning rate
        const stepSize = options.stepSize || 1e-4; // For numerical gradient calculation
        const tolerance = options.tolerance || 1e-6;

        let currentParams = [...initialGuess];
        let currentCost = costFunction(currentParams);

        for (let iter = 0; iter < maxIter; iter++) {
            const gradient = Array(currentParams.length).fill(0);

            // Calculate numerical gradient
            for (let i = 0; i < currentParams.length; i++) {
                const tempParams = [...currentParams];
                tempParams[i] += stepSize;
                const costPlusStep = costFunction(tempParams);
                gradient[i] = (costPlusStep - currentCost) / stepSize;
            }

            // Update parameters
            const nextParams = currentParams.map((p, i) => p - learningRate * gradient[i]);
            const nextCost = costFunction(nextParams);

            if (Math.abs(currentCost - nextCost) < tolerance) {
                // Convergence detected
                break;
            }

            currentParams = nextParams;
            currentCost = nextCost;
        }

        return { solution: currentParams, cost: currentCost };
    };

    /**
     * A simple text wrapping function for D3 labels.
     * This is a common utility for D3 charts.
     * @param {d3.Selection} textElement The D3 selection of the text element.
     * @param {Object} circleGeometry A map of set IDs to {x, y, radius} for circles.
     * @param {Function} getLabel A function to get the label for a datum.
     */
    diagramModule.wrapLabelText = function(textElement, circleGeometry, getLabel) {
        const textDatum = textElement.datum();
        const label = getLabel(textDatum);
        const words = label.split(/\s+/).reverse();
        let word;
        let line = [];
        let lineNumber = 0;
        const lineHeight = 1.1; // ems
        const x = textElement.attr("x");
        const y = textElement.attr("y");
        const dy = parseFloat(textElement.attr("dy"));
        let tspan = textElement.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

        // Determine effective width for wrapping. For single circles, it's the diameter.
        // For intersections, it's more complex, but we can use a heuristic.
        let wrapWidth = Infinity;
        if (textDatum.sets.length === 1) {
            const circle = circleGeometry[textDatum.sets[0]];
            if (circle) {
                wrapWidth = circle.radius * 2 * 0.8; // 80% of diameter
            }
        } else if (textDatum.sets.length > 1) {
            // For intersections, a very rough estimate: take the average of involved circles' diameters, or a fixed val.
            const involvedCircles = textDatum.sets.map(setId => circleGeometry[setId]).filter(Boolean);
            if (involvedCircles.length > 0) {
                const avgRadius = involvedCircles.reduce((sum, c) => sum + c.radius, 0) / involvedCircles.length;
                wrapWidth = avgRadius * 2 * 0.6; // Smaller percentage for intersections
            }
        }

        while ((word = words.pop())) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > wrapWidth && line.length > 1) {
                line.pop(); // Remove the word that exceeded the width
                tspan.text(line.join(" "));
                line = [word]; // Start a new line with the current word
                tspan = textElement.append("tspan")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("dy", (++lineNumber * lineHeight) + dy + "em")
                    .text(word);
            }
        }
        // Adjust vertical position of multiple lines to center them
        if (lineNumber > 0) {
            textElement.attr("y", parseFloat(y) - (lineNumber * lineHeight / 2) + "em");
        }
    };


})(this.venn = this.venn || {});