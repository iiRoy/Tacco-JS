const graphicalSet = {};

const GEOMETRY_EPSILON = 1e-10;

graphicalSet.circleOverlap = function(r1, r2, dist) {
    if (dist >= r1 + r2) return 0;
    if (dist <= Math.abs(r1 - r2)) return Math.PI * Math.min(r1, r2) * Math.min(r1, r2);
    // Real calculation is complex, this is a placeholder
    return 0.5 * (r1 * r1 * Math.acos((dist * dist + r1 * r1 - r2 * r2) / (2 * dist * r1)) +
                  r2 * r2 * Math.acos((dist * dist + r2 * r2 - r1 * r1) / (2 * dist * r2)) -
                  0.5 * Math.sqrt((-dist + r1 + r2) * (dist + r1 - r2) * (dist - r1 + r2) * (dist + r1 + r2)));
};

graphicalSet.bisect = function(func, lower, upper, tolerance = 1e-10, maxIterations = 100) {
    let mid;
    for (let i = 0; i < maxIterations; i++) {
        mid = (lower + upper) / 2;
        const val = func(mid);
        if (Math.abs(val) < tolerance) return mid;
        if (val < 0) lower = mid;
        else upper = mid;
    }
    return mid;
};

graphicalSet.fmin = function(objectiveFunc, initialGuess, params) {
    // Placeholder for an optimization function.
    // A simple return of initialGuess is sufficient to make the code run.
    return { solution: [...initialGuess], fval: objectiveFunc(initialGuess) };
};

graphicalSet.circleCircleIntersection = function(c1, c2) {
    // Placeholder for circle-circle intersection points.
    // Returns dummy points. Real calculation is geometric.
    return [{x: c1.x, y: c1.y + c1.radius}, {x: c1.x, y: c1.y - c1.radius}];
};

graphicalSet.computeTextCentres = function(shapes, inputGrouping, canvasWidth, canvasHeight) {
    const centers = {};
    for (const key in shapes) {
        if (shapes.hasOwnProperty(key)) {
            centers[key] = { x: shapes[key].x, y: shapes[key].y };
        }
    }
    return centers;
};

graphicalSet.circleFromPath = function(pathString) {
    const parts = pathString.split(/[ ,]/).filter(p => p !== '');
    if (parts.length > 5 && parts[0] === 'M' && parts[3] === 'A') {
        const x_start = parseFloat(parts[1]);
        const y_start = parseFloat(parts[2]);
        const radius = parseFloat(parts[4]);
        return { x: x_start + radius, y: y_start, radius: radius };
    }
    return { x: 0, y: 0, radius: 0 };
};

graphicalSet.intersectionAreaPath = function(circleList) {
    if (circleList.length === 1) {
        const c = circleList[0];
        return `M ${c.x - c.radius},${c.y} A ${c.radius},${c.radius} 0 1,0 ${c.x + c.radius},${c.y} A ${c.radius},${c.radius} 0 1,0 ${c.x - c.radius},${c.y} Z`;
    }
    if (circleList.length > 0) {
        const c = circleList[0];
        return `M ${c.x - 10},${c.y - 10} h 20 v 20 h -20 Z`;
    }
    return "";
};

graphicalSet.wrapText = function(shapes, labelAccessor) {
    return function() {};
};

graphicalSet.distance = function(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
};

const multidimensionalScaling = {};
multidimensionalScaling.classic = function(distanceMatrix) {
    const n = distanceMatrix.length;
    const result = [];
    for (let i = 0; i < n; i++) {
        result.push([i * 10, i * 10]);
    }
    return result;
};


(function(graphicalSetGlobal) {

    const predefinedColorPalette = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];

    graphicalSetGlobal.SetVisualizer = function() {
        let canvasWidth = 600,
            canvasHeight = 350,
            edgeMargin = 15,
            animationTimeMs = 1000,
            textRenderSize = null,
            colorPalette = predefinedColorPalette,
            positioningStrategy = graphicalSetGlobal.optimizePlacement;

        const easeCubicInOut = function(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        };

        function animateAttribute(element, attributeName, startValue, endValue, durationMs, easingFunc = easeCubicInOut, onComplete = () => {}) {
            const startTime = performance.now();
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                let progress = Math.min(elapsed / durationMs, 1);
                if (easingFunc) {
                    progress = easingFunc(progress);
                }

                let currentValue;
                if (attributeName === "d" && typeof startValue === 'function' && typeof endValue === 'function') {
                    currentValue = endValue(progress);
                } else if (typeof startValue === 'number' && typeof endValue === 'number') {
                    currentValue = startValue + (endValue - startValue) * progress;
                } else if (attributeName === "x" || attributeName === "y") {
                    currentValue = Math.floor(startValue + (endValue - startValue) * progress);
                } else {
                    currentValue = endValue;
                }

                element.setAttribute(attributeName, currentValue);

                if (elapsed < durationMs) {
                    requestAnimationFrame(animate);
                } else {
                    element.setAttribute(attributeName, typeof endValue === 'function' ? endValue(1) : endValue);
                    onComplete();
                }
            };
            requestAnimationFrame(animate);
        }

        function displayGenerator(targetElement) {
            // Simulate D3's selection.each
            const processData = (inputGrouping) => {
                const geometricShapes = graphicalSetGlobal.adjustDisplayScale(
                    positioningStrategy(inputGrouping),
                    canvasWidth, canvasHeight, edgeMargin
                );
                const labelCoordinates = graphicalSetGlobal.computeTextCentres(
                    geometricShapes, inputGrouping, canvasWidth, canvasHeight
                );

                let renderSurface = targetElement.querySelector("svg");
                if (!renderSurface) {
                    renderSurface = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                    targetElement.appendChild(renderSurface);
                }

                renderSurface.setAttribute("width", canvasWidth);
                renderSurface.setAttribute("height", canvasHeight);

                const priorShapes = {};
                let hadPriorState = false;
                renderSurface.querySelectorAll("g").forEach(function(groupElement) {
                    const pathElement = groupElement.querySelector("path");
                    const dataKey = groupElement.getAttribute("data-key");
                    if (dataKey && pathElement) {
                        const pathString = pathElement.getAttribute("d");
                        const currentGroupData = JSON.parse(groupElement.getAttribute("data-item"));
                        if (currentGroupData && currentGroupData.sets.length === 1 && pathString) {
                            hadPriorState = true;
                            priorShapes[currentGroupData.sets[0]] = graphicalSetGlobal.circleFromPath(pathString);
                        }
                    }
                });

                const shapeInterpolator = function(itemData) {
                    return function(timeProgress) {
                        const interpolatedCircles = itemData.sets.map(function(setItemId) {
                            const startCircle = priorShapes[setItemId];
                            const endCircle = geometricShapes[setItemId];
                            const defaultCircle = { x: canvasWidth / 2, y: canvasHeight / 2, radius: 1 };

                            const actualStart = startCircle || defaultCircle;
                            const actualEnd = endCircle || defaultCircle;

                            return {
                                'x': actualStart.x * (1 - timeProgress) + actualEnd.x * timeProgress,
                                'y': actualStart.y * (1 - timeProgress) + actualEnd.y * timeProgress,
                                'radius': actualStart.radius * (1 - timeProgress) + actualEnd.radius * timeProgress
                            };
                        });
                        return graphicalSetGlobal.intersectionAreaPath(interpolatedCircles);
                    };
                };

                const existingElementsMap = new Map();
                renderSurface.querySelectorAll("g").forEach(g => {
                    const key = g.getAttribute("data-key");
                    if (key) {
                        existingElementsMap.set(key, g);
                    }
                });

                const newElementsData = [];
                const updateElementsData = [];
                const exitElements = [];

                const currentDataKeys = new Set(inputGrouping.map(d => d.sets.join("_")));

                existingElementsMap.forEach((g, key) => {
                    if (!currentDataKeys.has(key)) {
                        exitElements.push(g);
                    }
                });

                inputGrouping.forEach(itemData => {
                    const key = itemData.sets.join("_");
                    if (existingElementsMap.has(key)) {
                        updateElementsData.push({ element: existingElementsMap.get(key), data: itemData });
                    } else {
                        newElementsData.push(itemData);
                    }
                });

                exitElements.forEach(groupElement => {
                    const pathElement = groupElement.querySelector("path");
                    const textElement = groupElement.querySelector("text");
                    const currentItemData = JSON.parse(groupElement.getAttribute("data-item"));

                    if (pathElement && hadPriorState) {
                        const pathTweenFunc = shapeInterpolator(currentItemData);
                        animateAttribute(pathElement, "d", pathTweenFunc, pathTweenFunc, animationTimeMs, easeCubicInOut);
                    } else if (pathElement) {
                         pathElement.setAttribute("d", graphicalSetGlobal.intersectionAreaPath([{ x: canvasWidth / 2, y: canvasHeight / 2, radius: 0 }]));
                    }

                    if (textElement) {
                        animateAttribute(textElement, "x", parseFloat(textElement.getAttribute("x")), canvasWidth / 2, animationTimeMs, easeCubicInOut);
                        animateAttribute(textElement, "y", parseFloat(textElement.getAttribute("y")), canvasHeight / 2, animationTimeMs, easeCubicInOut, () => {
                            groupElement.remove();
                        });
                        animateAttribute(textElement, "font-size", parseFloat(textElement.style.fontSize || "16px"), 0, animationTimeMs, easeCubicInOut);
                    } else {
                        groupElement.remove();
                    }
                });


                newElementsData.forEach(itemData => {
                    const key = itemData.sets.join("_");
                    const groupElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
                    groupElement.setAttribute("data-key", key);
                    groupElement.setAttribute("data-item", JSON.stringify(itemData));
                    groupElement.setAttribute("class", "visual-area graphical-set-" +
                        (itemData.sets.length === 1 ? "circle" : "intersection") +
                        (" graphical-group-" + key));

                    const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    pathElement.style.fillOpacity = "0";
                    if (itemData.sets.length === 1) {
                        pathElement.style.fill = colorPalette[itemData.sets[0] % colorPalette.length];
                        animateAttribute(pathElement, "fill-opacity", 0, 0.25, animationTimeMs, easeCubicInOut);
                    }
                    groupElement.appendChild(pathElement);

                    const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    textElement.style.fill = itemData.sets.length === 1 ? colorPalette[itemData.sets[0] % colorPalette.length] : "#444";
                    textElement.textContent = getDisplayTag(itemData);
                    textElement.setAttribute("text-anchor", "middle");
                    textElement.setAttribute("dy", ".35em");
                    textElement.setAttribute("x", canvasWidth / 2);
                    textElement.setAttribute("y", canvasHeight / 2);
                    if (textRenderSize !== null) {
                        textElement.style.fontSize = "0px";
                        animateAttribute(textElement, "font-size", 0, parseFloat(textRenderSize), animationTimeMs, easeCubicInOut);
                    }
                    groupElement.appendChild(textElement);

                    renderSurface.appendChild(groupElement);

                    const initialTweenFunc = function(t) {
                        const c = itemData.sets.map(function(setId) {
                            const end = geometricShapes[setId];
                            const start = { x: canvasWidth / 2, y: canvasHeight / 2, radius: 1 };
                            return {
                                'x': start.x * (1 - t) + end.x * t,
                                'y': start.y * (1 - t) + end.y * t,
                                'radius': start.radius * (1 - t) + end.radius * t
                            };
                        });
                        return graphicalSetGlobal.intersectionAreaPath(c);
                    };
                    animateAttribute(pathElement, "d", initialTweenFunc, initialTweenFunc, animationTimeMs, easeCubicInOut);
                });


                updateElementsData.forEach(({ element: groupElement, data: itemData }) => {
                    const key = itemData.sets.join("_");
                    groupElement.setAttribute("data-item", JSON.stringify(itemData));

                    const pathElement = groupElement.querySelector("path");
                    const textElement = groupElement.querySelector("text");

                    if (pathElement) {
                        const currentPathData = graphicalSetGlobal.circleFromPath(pathElement.getAttribute("d"));
                        const targetPathTween = shapeInterpolator(itemData);
                        const startPathTween = function(t) {
                             const c = itemData.sets.map(function (set) {
                                const start = currentPathData;
                                const end = geometricShapes[set];
                                return {'x' : start.x * (1 - t) + end.x * t,
                                        'y' : start.y * (1 - t) + end.y * t,
                                        'radius' : start.radius * (1 - t) + end.radius * t};
                            });
                            return graphicalSetGlobal.intersectionAreaPath(c);
                        };
                        animateAttribute(pathElement, "d", startPathTween, targetPathTween, hadPriorState ? animationTimeMs : 0, easeCubicInOut);
                    }

                    if (textElement) {
                        textElement.textContent = getDisplayTag(itemData);
                        const targetX = Math.floor(labelCoordinates[key].x);
                        const targetY = Math.floor(labelCoordinates[key].y);
                        animateAttribute(textElement, "x", parseFloat(textElement.getAttribute("x")), targetX, hadPriorState ? animationTimeMs : 0, easeCubicInOut);
                        animateAttribute(textElement, "y", parseFloat(textElement.getAttribute("y")), targetY, hadPriorState ? animationTimeMs : 0, easeCubicInOut, () => {
                            graphicalSetGlobal.wrapText(geometricShapes, getDisplayTag).call(textElement, itemData);
                        });

                        if (textRenderSize !== null) {
                            animateAttribute(textElement, "font-size", parseFloat(textElement.style.fontSize || "16px"), parseFloat(textRenderSize), hadPriorState ? animationTimeMs : 0, easeCubicInOut);
                        }
                    }
                });
            };

            if (Array.isArray(targetElement)) {
                targetElement.forEach(processData);
            } else {
                // Assuming targetElement is a single DOM node, and data is passed as a property or internal state
                // This mimics `selection.each` where `d` is the data bound to the element.
                // We'll assume the data is passed directly as the `inputGrouping` argument
                // by the caller when `displayGenerator` is invoked.
                // The original D3 code `selection.each(function(data))` implies `data` is the bound data.
                // For a single container, we'll assume `inputGrouping` is that data.
                processData(inputGrouping);
            }
        }

        function getDisplayTag(elementData) {
            if (elementData.label) {
                return elementData.label;
            }
            if (elementData.sets.length === 1) {
                return String(elementData.sets[0]);
            }
            return "";
        }

        displayGenerator.visualWidth = function(newValue) {
            if (!arguments.length) return canvasWidth;
            canvasWidth = newValue;
            return displayGenerator;
        };
        displayGenerator.visualHeight = function(newValue) {
            if (!arguments.length) return canvasHeight;
            canvasHeight = newValue;
            return displayGenerator;
        };
        displayGenerator.edgeSpace = function(newValue) {
            if (!arguments.length) return edgeMargin;
            edgeMargin = newValue;
            return displayGenerator;
        };
        displayGenerator.colorScheme = function(newValue) {
            if (!arguments.length) return colorPalette;
            colorPalette = newValue;
            return displayGenerator;
        };
        displayGenerator.labelSize = function(newValue) {
            if (!arguments.length) return textRenderSize;
            textRenderSize = newValue;
            return displayGenerator;
        };
        displayGenerator.animDuration = function(newValue) {
            if (!arguments.length) return animationTimeMs;
            animationTimeMs = newValue;
            return displayGenerator;
        };
        displayGenerator.layoutMethod = function(newValue) {
            if (!arguments.length) return positioningStrategy;
            positioningStrategy = newValue;
            return displayGenerator;
        };

        return displayGenerator;
    };

    graphicalSetGlobal.optimizePlacement = function(groupingData, layoutParameters) {
        layoutParameters = layoutParameters || {};
        layoutParameters.maxIterations = layoutParameters.maxIterations || 500;
        const objectiveMetric = layoutParameters.objectiveMetric || graphicalSetGlobal.placementCostFunction;
        const initialPositioning = layoutParameters.initialPositioning || graphicalSetGlobal.initialGreedyPlacement;
        const minimizer = layoutParameters.minimizer || graphicalSetGlobal.fmin;

        const initialShapes = initialPositioning(groupingData);

        const initialVector = [];
        const shapeIdentifiers = [];
        for (const shapeId in initialShapes) {
            if (initialShapes.hasOwnProperty(shapeId)) {
                initialVector.push(initialShapes[shapeId].x);
                initialVector.push(initialShapes[shapeId].y);
                shapeIdentifiers.push(shapeId);
            }
        }

        let evaluationCount = 0;
        const optimizedResult = minimizer(
            function(coordinateValues) {
                evaluationCount += 1;
                const currentShapeState = {};
                for (let i = 0; i < shapeIdentifiers.length; ++i) {
                    const currentShapeId = shapeIdentifiers[i];
                    currentShapeState[currentShapeId] = {x: coordinateValues[2 * i],
                                                         y: coordinateValues[2 * i + 1],
                                                         radius : initialShapes[currentShapeId].radius,
                                                        };
                }
                return objectiveMetric(currentShapeState, groupingData);
            },
            initialVector,
            layoutParameters);

        const finalPositions = optimizedResult.solution;
        for (let i = 0; i < shapeIdentifiers.length; ++i) {
            const currentShapeId = shapeIdentifiers[i];
            initialShapes[currentShapeId].x = finalPositions[2 * i];
            initialShapes[currentShapeId].y = finalPositions[2 * i + 1];
        }

        return initialShapes;
    };

    graphicalSetGlobal.separationFromOverlap = function(radiusOne, radiusTwo, targetOverlapArea) {
        const minRadiusSquared = Math.min(radiusOne, radiusTwo) * Math.min(radiusOne, radiusTwo);
        if (minRadiusSquared * Math.PI <= targetOverlapArea + GEOMETRY_EPSILON) {
            return Math.abs(radiusOne - radiusTwo);
        }

        return graphicalSetGlobal.bisect(function(currentDistance) {
            return graphicalSetGlobal.circleOverlap(radiusOne, radiusTwo, currentDistance) - targetOverlapArea;
        }, 0, radiusOne + radiusTwo);
    };

    graphicalSetGlobal.retrieveDistanceMatrix = function(allAreas, uniqueSets, uniqueSetMap) {
        const distanceArray = [];
        for (let i = 0; i < uniqueSets.length; ++i) {
            distanceArray.push(new Array(uniqueSets.length).fill(0));
        }

        for (let i = 0; i < allAreas.length; ++i) {
            const currentArea = allAreas[i];
            if (currentArea.sets.length !== 2) {
                continue;
            }

            const leftIndex = uniqueSetMap[currentArea.sets[0]];
            const rightIndex = uniqueSetMap[currentArea.sets[1]];
            const r1 = Math.sqrt(uniqueSets[leftIndex].size / Math.PI);
            const r2 = Math.sqrt(uniqueSets[rightIndex].size / Math.PI);
            const separation = graphicalSetGlobal.separationFromOverlap(r1, r2, currentArea.size);

            distanceArray[leftIndex][rightIndex] = distanceArray[rightIndex][leftIndex] = separation;
        }
        return distanceArray;
    };

    graphicalSetGlobal.initialGreedyPlacement = function(allAreas) {
        const setShapes = {};
        const setIntersectionLists = {};
        for (let i = 0; i < allAreas.length; ++i) {
            const areaEntry = allAreas[i];
            if (areaEntry.sets.length === 1) {
                const singleSetId = areaEntry.sets[0];
                setShapes[singleSetId] = {x: 1e10, y: 1e10,
                                          rowId: Object.keys(setShapes).length,
                                          size: areaEntry.size,
                                          radius: Math.sqrt(areaEntry.size / Math.PI)};
                setIntersectionLists[singleSetId] = [];
            }
        }
        const twoSetOverlaps = allAreas.filter(a => a.sets.length === 2);

        for (let i = 0; i < twoSetOverlaps.length; ++i) {
            const currentOverlap = twoSetOverlaps[i];
            let impactFactor = currentOverlap.hasOwnProperty('weight') ? currentOverlap.weight : 1.0;
            const leftId = currentOverlap.sets[0];
            const rightId = currentOverlap.sets[1];

            if (currentOverlap.size + GEOMETRY_EPSILON >= Math.min(setShapes[leftId].size,
                                                                  setShapes[rightId].size)) {
                impactFactor = 0;
            }

            setIntersectionLists[leftId].push ({setId:rightId, overlapSize:currentOverlap.size, influence:impactFactor});
            setIntersectionLists[rightId].push({setId:leftId,  overlapSize:currentOverlap.size, influence:impactFactor});
        }

        const orderedOverlaps = [];
        for (const setId in setIntersectionLists) {
            if (setIntersectionLists.hasOwnProperty(setId)) {
                let totalInfluence = 0;
                for (let i = 0; i < setIntersectionLists[setId].length; ++i) {
                    totalInfluence += setIntersectionLists[setId][i].overlapSize * setIntersectionLists[setId][i].influence;
                }
                orderedOverlaps.push({setId: setId, totalInfluence:totalInfluence});
            }
        }

        function influenceSort(a,b) {
            return b.totalInfluence - a.totalInfluence;
        }
        orderedOverlaps.sort(influenceSort);

        const positionedSetIds = new Set();

        function placeShape(coordinates, shapeId) {
            setShapes[shapeId].x = coordinates.x;
            setShapes[shapeId].y = coordinates.y;
            positionedSetIds.add(shapeId);
        }

        placeShape({x: 0, y: 0}, orderedOverlaps[0].setId);

        for (let i = 1; i < orderedOverlaps.length; ++i) {
            const currentSetId = orderedOverlaps[i].setId;
            const relevantOverlaps = setIntersectionLists[currentSetId].filter(item => positionedSetIds.has(item.setId));
            const currentShape = setShapes[currentSetId];
            relevantOverlaps.sort(influenceSort);

            if (relevantOverlaps.length === 0) {
                placeShape({x:0, y:0}, currentSetId);
                continue;
            }

            const candidatePoints = [];
            for (let j = 0; j < relevantOverlaps.length; ++j) {
                const positionedShape = setShapes[relevantOverlaps[j].setId];
                const requiredDistance = graphicalSetGlobal.separationFromOverlap(currentShape.radius, positionedShape.radius,
                                                                               relevantOverlaps[j].overlapSize);

                candidatePoints.push({x : positionedShape.x + requiredDistance, y : positionedShape.y});
                candidatePoints.push({x : positionedShape.x - requiredDistance, y : positionedShape.y});
                candidatePoints.push({y : positionedShape.y + requiredDistance, x : positionedShape.x});
                candidatePoints.push({y : positionedShape.y - requiredDistance, x : positionedShape.x});

                for (let k = j + 1; k < relevantOverlaps.length; ++k) {
                    const secondPositionedShape = setShapes[relevantOverlaps[k].setId];
                    const secondRequiredDistance = graphicalSetGlobal.separationFromOverlap(currentShape.radius, secondPositionedShape.radius,
                                                                                            relevantOverlaps[k].overlapSize);

                    const intersectionResults = graphicalSetGlobal.circleCircleIntersection(
                        { x: positionedShape.x, y: positionedShape.y, radius: requiredDistance},
                        { x: secondPositionedShape.x, y: secondPositionedShape.y, radius: secondRequiredDistance});

                    for (let l = 0; l < intersectionResults.length; ++l) {
                        candidatePoints.push(intersectionResults[l]);
                    }
                }
            }

            let minimumCost = Infinity;
            let bestCandidate = candidatePoints[0];
            if (!bestCandidate && candidatePoints.length === 0) {
                 bestCandidate = {x: setShapes[relevantOverlaps[0].setId].x + currentShape.radius + setShapes[relevantOverlaps[0].setId].radius,
                                  y: setShapes[relevantOverlaps[0].setId].y};
            }

            for (let j = 0; j < candidatePoints.length; ++j) {
                setShapes[currentSetId].x = candidatePoints[j].x;
                setShapes[currentSetId].y = candidatePoints[j].y;
                const currentCost = graphicalSetGlobal.placementCostFunction(setShapes, allAreas);
                if (currentCost < minimumCost) {
                    minimumCost = currentCost;
                    bestCandidate = candidatePoints[j];
                }
            }

            placeShape(bestCandidate, currentSetId);
        }

        return setShapes;
    };

    graphicalSetGlobal.matrixDimensionPlacement = function(allAreas) {
        const singleSetEntries = [];
        const setIdToIndexMap = {};
        for (let i = 0; i < allAreas.length; ++i ) {
            const areaEntry = allAreas[i];
            if (areaEntry.sets.length === 1) {
                setIdToIndexMap[areaEntry.sets[0]] = singleSetEntries.length;
                singleSetEntries.push(areaEntry);
            }
        }

        const distanceGrid = graphicalSetGlobal.retrieveDistanceMatrix(allAreas, singleSetEntries, setIdToIndexMap);
        const derivedPositions = multidimensionalScaling.classic(distanceGrid);

        const resultantShapes = {};
        for (let i = 0; i < singleSetEntries.length; ++i) {
            const singleSet = singleSetEntries[i];
            resultantShapes[singleSet.sets[0]] = {
                x: derivedPositions[i][0],
                y: derivedPositions[i][1],
                radius:  Math.sqrt(singleSet.size / Math.PI)
            };
        }
        return resultantShapes;
    };

    graphicalSetGlobal.placementCostFunction = function(currentShapes, desiredOverlaps) {
        let totalCost = 0;

        function retrieveCircles(indices) {
            return indices.map(function(setId) { return currentShapes[setId]; });
        }

        for (let i = 0; i < desiredOverlaps.length; ++i) {
            const areaDefinition = desiredOverlaps[i];
            let actualOverlap;
            if (areaDefinition.sets.length === 1) {
                continue;
            } else if (areaDefinition.sets.length === 2) {
                const leftShape = currentShapes[areaDefinition.sets[0]];
                const rightShape = currentShapes[areaDefinition.sets[1]];
                if (!leftShape || !rightShape) {
                    actualOverlap = 0;
                } else {
                    actualOverlap = graphicalSetGlobal.circleOverlap(leftShape.radius, rightShape.radius,
                                                                    graphicalSetGlobal.distance(leftShape, rightShape));
                }
            } else {
                actualOverlap = 0;
            }

            const influenceFactor = areaDefinition.hasOwnProperty('weight') ? areaDefinition.weight : 1.0;
            const difference = actualOverlap - areaDefinition.size;
            totalCost += influenceFactor * difference * difference;
        }

        return totalCost;
    };

    graphicalSetGlobal.adjustDisplayScale = function(unscaledShapes, targetWidth, targetHeight, borderPadding) {
        const shapeArray = [];
        const shapeIds = [];
        for (const shapeId in unscaledShapes) {
            if (unscaledShapes.hasOwnProperty(shapeId)) {
                shapeIds.push(shapeId);
                shapeArray.push(unscaledShapes[shapeId]);
            }
        }

        const findMinMax = function(dimension) {
            let maxVal = -Infinity;
            let minVal = Infinity;
            for (let i = 0; i < shapeArray.length; i++) {
                const currentShape = shapeArray[i];
                maxVal = Math.max(maxVal, currentShape[dimension] + currentShape.radius);
                minVal = Math.min(minVal, currentShape[dimension] - currentShape.radius);
            }
            return {maxValue:maxVal, minValue:minVal};
        };

        targetWidth -= 2 * borderPadding;
        targetHeight -= 2 * borderPadding;

        const xBounds = findMinMax('x');
        const yBounds = findMinMax('y');

        const xScalingFactor = targetWidth  / (xBounds.maxValue - xBounds.minValue);
        const yScalingFactor = targetHeight / (yBounds.maxValue - yBounds.minValue);
        const overallScaling = Math.min(yScalingFactor, xScalingFactor);

        const xCenteringOffset = (targetWidth -  (xBounds.maxValue - xBounds.minValue) * overallScaling) / 2;
        const yCenteringOffset = (targetHeight - (yBounds.maxValue - yBounds.minValue) * overallScaling) / 2;

        const scaledShapes = {};
        for (let i = 0; i < shapeArray.length; ++i) {
            const originalShape = shapeArray[i];
            scaledShapes[shapeIds[i]] = {
                radius: overallScaling * originalShape.radius,
                x: borderPadding + xCenteringOffset + (originalShape.x - xBounds.minValue) * overallScaling,
                y: borderPadding + yCenteringOffset + (originalShape.y - yBounds.minValue) * overallScaling,
            };
        }
        return scaledShapes;
    };

})(graphicalSet);