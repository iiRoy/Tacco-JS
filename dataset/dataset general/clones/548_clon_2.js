(function(diagramTool) {
    diagramTool.OverlapChart = function() {
        var canvasWidth = 600, // Default rendering area width
            canvasHeight = 350, // Default rendering area height
            marginSpace = 15, // Padding around the chart content
            animDuration = 1000, // Duration for animated transitions in milliseconds
            txtSize = null, // Explicit font size, if overridden
            colorPalette = d3.scaleOrdinal(d3.schemeCategory10), // Categorical color scheme
            positioningAlgo = diagramTool.calculateLayout; // Core algorithm for set placement

        function drawingMachine(containerElement) {
            containerElement.each(function(inputData) {
                // Compute initial shape coordinates and scale them to fit the display dimensions
                var shapeCoords = diagramTool.adjustAndCenter(positioningAlgo(inputData), canvasWidth, canvasHeight, marginSpace);
                var labelLocations = computeTextCentres(shapeCoords, inputData, canvasWidth, canvasHeight);

                // Select or append the primary SVG element for visualization
                var graphicContainer = d3.select(this).selectAll("svg").data([shapeCoords]);
                graphicContainer.enter().append("svg");

                graphicContainer.attr("width", canvasWidth)
                                .attr("height", canvasHeight);

                // To enable smooth transitions for intersection areas, we need to
                // retrieve the previous positions of the circles from existing SVG elements.
                var priorShapes = {}, hasPriorState = false;
                graphicContainer.selectAll("g").each(function (item) {
                    var shapePath = d3.select(this).select("path").attr("d");
                    if ((item.sets.length == 1) && shapePath) {
                        hasPriorState = true;
                        priorShapes[item.sets[0]] = diagramTool.extractCircleFromPath(shapePath);
                    }
                });

                // Define a path interpolator function for animated transitions
                var pathInterpolator = function(item) {
                    return function(interpolationFactor) {
                        var interpolatedCoords = item.sets.map(function (setId) {
                            var initialPos = priorShapes[setId], finalPos = shapeCoords[setId];
                            if (!initialPos) {
                                initialPos = {x : canvasWidth/2, y : canvasHeight/2, radius : 1};
                            }
                            if (!finalPos) {
                                finalPos = {x : canvasWidth/2, y : canvasHeight/2, radius : 1};
                            }
                            return {'x' : initialPos.x * (1 - interpolationFactor) + finalPos.x * interpolationFactor,
                                    'y' : initialPos.y * (1 - interpolationFactor) + finalPos.y * interpolationFactor,
                                    'radius' : initialPos.radius * (1 - interpolationFactor) + finalPos.radius * interpolationFactor};

                        });
                        return diagramTool.generateIntersectionPath(interpolatedCoords);
                    };
                };

                // Bind data to graphic nodes, using set identifiers for keying
                var graphicNodes = graphicContainer.selectAll("g")
                    .data(inputData, function(item) { return item.sets; });

                // Create new group elements for data entering the visualization
                var newElements = graphicNodes.enter()
                    .append('g')
                    .attr("class", function(item) {
                        return "overlap-area overlap-" +
                            (item.sets.length == 1 ? "single" : "multi") +
                            (" overlap-ids-" + item.sets.join("_"));
                    });

                newElements.append("path")
                    .style("fill-opacity", "0")
                    .filter(function (item) { return item.sets.length == 1; } )
                    .style("fill", function(item) { return colorPalette(getDisplayLabel(item)); })
                    .style("fill-opacity", ".25");

                var newLabels = newElements.append("text")
                    .style("fill", function(item) { return item.sets.length == 1 ? colorPalette(getDisplayLabel(item)) : "#444"; })
                    .text(function (item) { return getDisplayLabel(item); } )
                    .attr("text-anchor", "middle")
                    .attr("dy", ".35em")
                    .attr("x", canvasWidth/2)
                    .attr("y", canvasHeight/2);

                // Animate existing nodes to their updated states
                var updatedNodes = graphicNodes.transition("overlap").duration(hasPriorState ? animDuration : 0);
                updatedNodes.select("path")
                    .attrTween("d", pathInterpolator);

                var updatedLabels = updatedNodes.select("text")
                    .text(function (item) { return getDisplayLabel(item); } )
                    .each("end", diagramTool.adjustTextWrap(shapeCoords, getDisplayLabel))
                    .attr("x", function(item) {
                        return Math.floor(labelLocations[item.sets].x);
                    })
                    .attr("y", function(item) {
                        return Math.floor(labelLocations[item.sets].y);
                    });

                // Apply a specific font size if it has been explicitly set
                if (txtSize !== null) {
                    newLabels.style("font-size", "0px");
                    updatedLabels.style("font-size", txtSize);
                }

                // Animate and remove exiting nodes
                var removedNodes = graphicNodes.exit().transition('overlap').duration(animDuration).remove();
                removedNodes.select("path")
                    .attrTween("d", pathInterpolator);

                removedNodes.select("text")
                    .text(function (item) { return getDisplayLabel(item); } )
                    .attr("x", canvasWidth/2)
                    .attr("y", canvasHeight/2)
                    .style("font-size", "0px");
            });
        }

        function getDisplayLabel(itemData) {
            if (itemData.label) {
                return itemData.label;
            }
            if (itemData.sets.length == 1) {
                return '' + itemData.sets[0];
            }
        }

        drawingMachine.canvasWidth = function(newValue) {
            if (!arguments.length) return canvasWidth;
            canvasWidth = newValue;
            return drawingMachine;
        };

        drawingMachine.canvasHeight = function(newValue) {
            if (!arguments.length) return canvasHeight;
            canvasHeight = newValue;
            return drawingMachine;
        };

        drawingMachine.marginSpace = function(newValue) {
            if (!arguments.length) return marginSpace;
            marginSpace = newValue;
            return drawingMachine;
        };

        drawingMachine.colorPalette = function(newValue) {
            if (!arguments.length) return colorPalette;
            colorPalette = newValue;
            return drawingMachine;
        };

        drawingMachine.txtSize = function(newValue) {
            if (!arguments.length) return txtSize;
            txtSize = newValue;
            return drawingMachine;
        };

        drawingMachine.animDuration = function(newValue) {
            if (!arguments.length) return animDuration;
            animDuration = newValue;
            return drawingMachine;
        };

        drawingMachine.positioningAlgo = function(newValue) {
            if (!arguments.length) return positioningAlgo;
            positioningAlgo = newValue;
            return drawingMachine;
        };

        return drawingMachine;
    };

    /**
     * Given a collection of set objects and their corresponding desired overlaps,
     * this function adjusts the (x, y, radius) attributes of each set
     * to approximate these specified overlap regions.
     */
    diagramTool.calculateLayout = function(overlapRegions, configParams) {
        configParams = configParams || {};
        configParams.maxAttempts = configParams.maxAttempts || 500;
        var errorFunction = configParams.errorFunction || diagramTool.costMetric;
        var startingArrangement = configParams.startingArrangement || diagramTool.heuristicLayout;
        var minFinder = configParams.minFinder || diagramTool.minimizeFunction;

        // The initial layout is determined using a heuristic greedy method
        var geoShapes = startingArrangement(overlapRegions);

        // Transform x/y coordinates into a single vector for optimization purposes
        var initialVector = [], setIdentifiers = [], singleSetId;
        for (singleSetId in geoShapes) {
            if (geoShapes.hasOwnProperty(singleSetId)) {
                initialVector.push(geoShapes[singleSetId].x);
                initialVector.push(geoShapes[singleSetId].y);
                setIdentifiers.push(singleSetId);
            }
        }

        // Optimize the initial arrangement using a custom error function
        var funcCallCount = 0;
        var optimalSolution = minFinder(
            function(vectorValues) {
                funcCallCount += 1;
                var tempShapes = {};
                for (var idxA = 0; idxA < setIdentifiers.length; ++idxA) {
                    var currentId = setIdentifiers[idxA];
                    tempShapes[currentId] = {x: vectorValues[2 * idxA],
                                      y: vectorValues[2 * idxA + 1],
                                      radius : geoShapes[currentId].radius,
                                     // size : geoShapes[currentId].size
                                     };
                }
                return errorFunction(tempShapes, overlapRegions);
            },
            initialVector,
            configParams);

        // Convert the optimized solution vector back to x/y coordinates
        var resultPositions = optimalSolution.solution;
        for (var idxA = 0; idxA < setIdentifiers.length; ++idxA) {
            singleSetId = setIdentifiers[idxA];
            geoShapes[singleSetId].x = resultPositions[2 * idxA];
            geoShapes[singleSetId].y = resultPositions[2 * idxA + 1];
        }

        return geoShapes;
    };

    /**
     * Calculates the necessary distance between two circles with radii `radiusA` and `radiusB`
     * to achieve a specific overlap area `desiredOverlap`.
     */
    diagramTool.calcOverlapDistance = function(radiusA, radiusB, desiredOverlap) {
        // Manage cases where one circle completely contains the other
        if (Math.min(radiusA, radiusB) * Math.min(radiusA,radiusB) * Math.PI <= desiredOverlap + TINY_DELTA) {
            return Math.abs(radiusA - radiusB);
        }

        return diagramTool.binarySearch(function(separationDistance) {
            return diagramTool.measureCircleOverlap(radiusA, radiusB, separationDistance) - desiredOverlap;
        }, 0, radiusA + radiusB);
    };

    /// Generates a matrix of Euclidean distances between all sets in the diagram
    diagramTool.retrieveDistanceGrid = function(overlapRegions, setCollection, setIdentifierMap) {
        // Initialize an empty distance matrix
        var distanceMatrix = [];
        for (var idxA = 0; idxA < setCollection.length; ++idxA) {
            distanceMatrix.push([]);
            for (var idxB = 0; idxB < setCollection.length; ++idxB) {
                distanceMatrix[idxA].push(0);
            }
        }

        // Compute distances for all relevant pairs of sets
        for (idxA = 0; idxA < overlapRegions.length; ++idxA) {
            var currentRegion = overlapRegions[idxA];
            if (currentRegion.sets.length !== 2) {
                continue;
            }

            var firstSetIdx = setIdentifierMap[currentRegion.sets[0]],
                secondSetIdx = setIdentifierMap[currentRegion.sets[1]],
                radOne = Math.sqrt(setCollection[firstSetIdx].size / Math.PI),
                radTwo = Math.sqrt(setCollection[secondSetIdx].size / Math.PI),
                calculatedDistance = diagramTool.calcOverlapDistance(radOne, radTwo, currentRegion.size);

            distanceMatrix[firstSetIdx][secondSetIdx] = distanceMatrix[secondSetIdx][firstSetIdx] = calculatedDistance;
        }
        return distanceMatrix;
    };

    /**
     * Positions sets in a Venn diagram using a greedy approach, starting with the
     * most overlapped sets. Each new set is added such that its overlaps with
     * previously placed sets are accurately represented.
     */
    diagramTool.heuristicLayout = function(overlapRegions) {
        // Create a circular representation for each individual set
        var geoShapes = {}, setIntersections = {}, currentSet;
        for (var idxA = 0; idxA < overlapRegions.length; ++idxA) {
            var region = overlapRegions[idxA];
            if (region.sets.length == 1) {
                currentSet = region.sets[0];
                geoShapes[currentSet] = {x: 1e10, y: 1e10,
                                rowid: geoShapes.length,
                                size: region.size,
                                radius: Math.sqrt(region.size / Math.PI)};
                setIntersections[currentSet] = [];
            }
        }
        overlapRegions = overlapRegions.filter(function(r) { return r.sets.length == 2; });

        // Build a mapping of each set to a list of other sets it shares an overlap with
        for (idxA = 0; idxA < overlapRegions.length; ++idxA) {
            var currentOverlap = overlapRegions[idxA];
            var overlapWeight = currentOverlap.hasOwnProperty('weight') ? currentOverlap.weight : 1.0;
            var firstId = currentOverlap.sets[0], secondId = currentOverlap.sets[1];

            // Ignore completely contained circles for early positioning calculations
            if (currentOverlap.size + TINY_DELTA >= Math.min(geoShapes[firstId].size,
                                                 geoShapes[secondId].size)) {
                overlapWeight = 0;
            }

            setIntersections[firstId].push ({set:secondId, size:currentOverlap.size, weight:overlapWeight});
            setIntersections[secondId].push({set:firstId,  size:currentOverlap.size, weight:overlapWeight});
        }

        // Aggregate and sort sets by their total overlap magnitude
        var sortedOverlaps = [];
        for (currentSet in setIntersections) {
            if (setIntersections.hasOwnProperty(currentSet)) {
                var totalSize = 0;
                for (idxA = 0; idxA < setIntersections[currentSet].length; ++idxA) {
                    totalSize += setIntersections[currentSet][idxA].size * setIntersections[currentSet][idxA].weight;
                }

                sortedOverlaps.push({set: currentSet, size:totalSize});
            }
        }

        // Sort the overlaps in descending order of size
        function descendingSizeSort(itemA,itemB) {
            return itemB.size - itemA.size;
        }
        sortedOverlaps.sort(descendingSizeSort);

        // Keep track of sets that have already been assigned positions
        var placedElements = {};
        function isPlaced(itemToCheck) {
            return itemToCheck.set in placedElements;
        }

        // Assigns coordinates to a given set
        function assignSetPosition(coordPoint, elementIndex) {
            geoShapes[elementIndex].x = coordPoint.x;
            geoShapes[elementIndex].y = coordPoint.y;
            placedElements[elementIndex] = true;
        }

        // Place the set with the largest overlap at the origin (0,0)
        assignSetPosition({x: 0, y: 0}, sortedOverlaps[0].set);

        // Iterate through the remaining sets to determine their positions
        for (idxA = 1; idxA < sortedOverlaps.length; ++idxA) {
            var targetSetIndex = sortedOverlaps[idxA].set,
                overlappingPlaced = setIntersections[targetSetIndex].filter(isPlaced);
            currentSet = geoShapes[targetSetIndex];
            overlappingPlaced.sort(descendingSizeSort);

            if (overlappingPlaced.length === 0) {
                throw "Error: No overlap information available for set " + JSON.stringify( currentSet );
            }

            var candidatePoints = [];
            for (var idxB = 0; idxB < overlappingPlaced.length; ++idxB) {
                // Calculate the required distance from an already placed, most overlapping set
                var pointOne = geoShapes[overlappingPlaced[idxB].set],
                    distOne = diagramTool.calcOverlapDistance(currentSet.radius, pointOne.radius,
                                                        overlappingPlaced[idxB].size);

                // Add candidate positions at 90-degree angles around the reference point
                candidatePoints.push({x : pointOne.x + distOne, y : pointOne.y});
                candidatePoints.push({x : pointOne.x - distOne, y : pointOne.y});
                candidatePoints.push({y : pointOne.y + distOne, x : pointOne.x});
                candidatePoints.push({y : pointOne.y - distOne, x : pointOne.x});

                // If at least two overlaps exist, compute analytical intersection points
                // and include them as additional candidates
                for (var idxC = idxB + 1; idxC < overlappingPlaced.length; ++idxC) {
                    var pointTwo = geoShapes[overlappingPlaced[idxC].set],
                        distTwo = diagramTool.calcOverlapDistance(currentSet.radius, pointTwo.radius,
                                                            overlappingPlaced[idxC].size);

                    var additionalPoints = diagramTool.findCircleIntersections(
                        { x: pointOne.x, y: pointOne.y, radius: distOne},
                        { x: pointTwo.x, y: pointTwo.y, radius: distTwo});

                    for (var idxD = 0; idxD < additionalPoints.length; ++idxD) {
                        candidatePoints.push(additionalPoints[idxD]);
                    }
                }
            }

            // Evaluate the cost function for each candidate point to find the optimal position
            var minError = 1e50, optimalPoint = candidatePoints[0];
            for (idxB = 0; idxB < candidatePoints.length; ++idxB) {
                geoShapes[targetSetIndex].x = candidatePoints[idxB].x;
                geoShapes[targetSetIndex].y = candidatePoints[idxB].y;
                var currentError = diagramTool.costMetric(geoShapes, overlapRegions);
                if (currentError < minError) {
                    minError = currentError;
                    optimalPoint = candidatePoints[idxB];
                }
            }

            assignSetPosition(optimalPoint, targetSetIndex);
        }

        return geoShapes;
    };

    /// Utilizes multidimensional scaling to provide an initial layout approximation
    diagramTool.mdsPositioning = function(overlapRegions) {
        // Create a bidirectional mapping between sets and unique row IDs for matrix operations
        var setCollection = [], setIdentifierMap = {};
        for (var idxA = 0; idxA < overlapRegions.length; ++idxA ) {
            var region = overlapRegions[idxA];
            if (region.sets.length == 1) {
                setIdentifierMap[region.sets[0]] = setCollection.length;
                setCollection.push(region);
            }
        }

        // Obtain the distance matrix and use MDS to determine set positions
        var distanceMatrix = diagramTool.retrieveDistanceGrid(overlapRegions, setCollection, setIdentifierMap);
        var resultPositions = mds.classic(distanceMatrix);

        // Translate the matrix rows back into (x, y, radius) coordinates
        var geoShapes = {};
        for (idxA = 0; idxA < setCollection.length; ++idxA) {
            var currentSet = setCollection[idxA];
            geoShapes[currentSet.sets[0]] = {
                x: resultPositions[idxA][0],
                y: resultPositions[idxA][1],
                radius:  Math.sqrt(currentSet.size / Math.PI)
            };
        }
        return geoShapes;
    };

    /**
     * Given a collection of sets and their desired overlaps, this function computes
     * the squared difference between the actual and target overlap areas.
     * Overlaps involving more than two circles are not factored into this calculation.
     */
    diagramTool.costMetric = function(geoShapes, overlapRegions) {
        var totalError = 0;

        function retrieveShapes(shapeIndices) {
            return shapeIndices.map(function(idx) { return geoShapes[idx]; });
        }

        for (var idxA = 0; idxA < overlapRegions.length; ++idxA) {
            var region = overlapRegions[idxA], actualOverlap;
            if (region.sets.length == 1) {
                continue;
            } else if (region.sets.length == 2) {
                var leftShape = geoShapes[region.sets[0]],
                    rightShape = geoShapes[region.sets[1]];
                actualOverlap = diagramTool.measureCircleOverlap(leftShape.radius, rightShape.radius,
                                             diagramTool.euclideanDistance(leftShape, rightShape));
            } else {
                actualOverlap = diagramTool.computeIntersectionArea(retrieveShapes(region.sets));
            }

            var overlapWeight = region.hasOwnProperty('weight') ? region.weight : 1.0;
            totalError += overlapWeight * (actualOverlap - region.size) * (actualOverlap - region.size);
        }

        return totalError;
    };

    /**
     * Scales and centers a layout solution (from calculateLayout or heuristicLayout)
     * to fit within a specified targetWidth/targetHeight rectangle,
     * including a defined outerMargin.
     */
    diagramTool.adjustAndCenter = function(layoutResult, targetWidth, targetHeight, outerMargin) {
        var shapesToScale = [], setIdentifiers = [];
        for (var singleSetId in layoutResult) {
            if (layoutResult.hasOwnProperty(singleSetId)) {
                setIdentifiers.push(singleSetId);
                shapesToScale.push(layoutResult[singleSetId]);
            }
        }

        var rangeCalculator = function(dimension) {
            var maxValue = Math.max.apply(null, shapesToScale.map(
                                    function(s) { return s[dimension] + s.radius; } )),
                minValue = Math.min.apply(null, shapesToScale.map(
                                    function(s) { return s[dimension] - s.radius;} ));
            return {max:maxValue, min:minValue};
        };

        targetWidth -= 2*outerMargin;
        targetHeight -= 2*outerMargin;

        var xBoundary = rangeCalculator('x'),
            yBoundary = rangeCalculator('y'),
            xFactor = targetWidth  / (xBoundary.max - xBoundary.min),
            yFactor = targetHeight / (yBoundary.max - yBoundary.min),
            overallFactor = Math.min(yFactor, xFactor),

            // Also center the diagram within the available space
            offsetX = (targetWidth -  (xBoundary.max - xBoundary.min) * overallFactor) / 2,
            offsetY = (targetHeight - (yBoundary.max - yBoundary.min) * overallFactor) / 2;

        var transformedShapes = {};
        for (var idxA = 0; idxA < shapesToScale.length; ++idxA) {
            var currentShape = shapesToScale[idxA];
            transformedShapes[setIdentifiers[idxA]] = {
                radius: overallFactor * currentShape.radius,
                x: outerMargin + offsetX + (currentShape.x - xBoundary.min) * overallFactor,
                y: outerMargin + offsetY + (currentShape.y - yBoundary.min) * overallFactor,
            };
        }
        return transformedShapes;
    };
})(window.diagramTool = window.diagramTool || {});