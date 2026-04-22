(function bundleExecutor(moduleDefinitions, moduleCache, entryPoints) {
    function resolveAndExecute(moduleIdentifier, skipExternal) {
        if (!moduleCache[moduleIdentifier]) {
            if (!moduleDefinitions[moduleIdentifier]) {
                var externalRequire = typeof require == "function" && require;
                if (!skipExternal && externalRequire)
                    return externalRequire(moduleIdentifier, true);
                if (internalRequire)
                    return internalRequire(moduleIdentifier, true);
                throw new Error("Could not locate module '" + moduleIdentifier + "'");
            }
            var moduleObject = moduleCache[moduleIdentifier] = {
                exports: {}
            };
            moduleDefinitions[moduleIdentifier][0].call(moduleObject.exports, function(dependencyName) {
                var cachedDep = moduleDefinitions[moduleIdentifier][1][dependencyName];
                return resolveAndExecute(cachedDep ? cachedDep : dependencyName);
            }, moduleObject, moduleObject.exports, bundleExecutor, moduleDefinitions, moduleCache, entryPoints);
        }
        return moduleCache[moduleIdentifier].exports;
    }
    var internalRequire = typeof require == "function" && require;
    for (var i = 0; i < entryPoints.length; i++) resolveAndExecute(entryPoints[i]);
    return resolveAndExecute;
})({
    1: [function(localRequire, localModule, localExports) {
        'use strict';
        var jq, DataUI, DisplayEngine, SimulatedUniverse, configParams, lodash;

        localRequire('./utility_functions');

        jq = localRequire('jquery');
        lodash = localRequire('underscore');
        DisplayEngine = localRequire('./visualization/screen_display');
        DataUI = localRequire('dat-gui');
        SimulatedUniverse = localRequire('./model/simulation_universe');
        configParams = localRequire('./system_settings');

        jq(function() {
            var drawingSurface, uiPanel, displayPanel, universePanel;
            drawingSurface = jq('<canvas />', {
                id: 'main_canvas'
            });
            jq(document.body).append(drawingSurface);
            window.simulationState = new SimulatedUniverse();
            simulationState.retrieveState();
            if (simulationState.junctions.length === 0) {
                simulationState.createLayout();
                simulationState.vehicleCount = 100;
            }
            window.displayInstance = new DisplayEngine(simulationState);
            displayInstance.beginSimulation();
            uiPanel = new DataUI.GUI();
            universePanel = uiPanel.addFolder('simulation');
            universePanel.open();
            universePanel.add(simulationState, 'storeState');
            universePanel.add(simulationState, 'retrieveState');
            universePanel.add(simulationState, 'resetState');
            universePanel.add(simulationState, 'createLayout');
            displayPanel = uiPanel.addFolder('rendering');
            displayPanel.open();
            displayPanel.add(displayInstance, 'isOperating').listen();
            displayPanel.add(displayInstance, 'isDebugMode').listen();
            displayPanel.add(displayInstance.viewZoomer, 'zoomLevel', 0.1, 2).listen();
            displayPanel.add(displayInstance, 'speedMultiplier', 0.1, 10).listen();
            universePanel.add(simulationState, 'vehicleCount').min(0).max(200).step(1).listen();
            universePanel.add(simulationState, 'currentVelocity').step(0.00001).listen();
            return uiPanel.add(configParams, 'signalCycleDuration', 0, 50, 0.01).listen();
        });

    }, {
        "./utility_functions": 6,
        "./model/simulation_universe": 15,
        "./system_settings": 16,
        "./visualization/screen_display": 24,
        "dat-gui": 27,
        "jquery": 31,
        "underscore": 32
    }],
    2: [function(localRequire, localModule, localExports) {
        'use strict';
        var BezierPath, LineSection;

        localRequire('../utility_functions');

        LineSection = localRequire('./path_segment');

        BezierPath = (function() {
            function BezierPath(startPoint, endPoint, controlOne, controlTwo) {
                this.startPoint = startPoint;
                this.endPoint = endPoint;
                this.controlOne = controlOne;
                this.controlTwo = controlTwo;
                this.segStartEnd = new LineSection(this.startPoint, this.endPoint);
                this.segStartControl1 = new LineSection(this.startPoint, this.controlOne);
                this.segControl1Control2 = new LineSection(this.controlOne, this.controlTwo);
                this.segControl2End = new LineSection(this.controlTwo, this.endPoint);
                this._cachedPathLength = null;
            }

            BezierPath.defineAccessor('pathLength', {
                get: function() {
                    var idx, currentPoint, numSegments, prevPoint, loopVar;
                    if (this._cachedPathLength == null) {
                        numSegments = 10;
                        prevPoint = null;
                        this._cachedPathLength = 0;
                        for (idx = loopVar = 0; 0 <= numSegments ? loopVar <= numSegments : loopVar >= numSegments; idx = 0 <= numSegments ? ++loopVar : --loopVar) {
                            currentPoint = this.evaluatePoint(idx / numSegments);
                            if (prevPoint) {
                                this._cachedPathLength += currentPoint.difference(prevPoint).magnitude;
                            }
                            prevPoint = currentPoint;
                        }
                    }
                    return this._cachedPathLength;
                }
            });

            BezierPath.prototype.evaluatePoint = function(tVal) {
                var interm0, interm1, interm2, final0, final1;
                interm0 = this.segStartControl1.evaluatePoint(tVal);
                interm1 = this.segControl1Control2.evaluatePoint(tVal);
                interm2 = this.segControl2End.evaluatePoint(tVal);
                final0 = (new LineSection(interm0, interm1)).evaluatePoint(tVal);
                final1 = (new LineSection(interm1, interm2)).evaluatePoint(tVal);
                return (new LineSection(final0, final1)).evaluatePoint(tVal);
            };

            BezierPath.prototype.evaluateTangent = function(tVal) {
                var interm0, interm1, interm2, final0, final1;
                interm0 = this.segStartControl1.evaluatePoint(tVal);
                interm1 = this.segControl1Control2.evaluatePoint(tVal);
                interm2 = this.segControl2End.evaluatePoint(tVal);
                final0 = (new LineSection(interm0, interm1)).evaluatePoint(tVal);
                final1 = (new LineSection(interm1, interm2)).evaluatePoint(tVal);
                return (new LineSection(final0, final1)).orientation;
            };

            return BezierPath;

        })();

        localModule.exports = BezierPath;

    }, {
        "../utility_functions": 6,
        "./path_segment": 5
    }],
    3: [function(localRequire, localModule, localExports) {
        'use strict';
        var Vector2D, arcTan2, squareRoot;

        squareRoot = Math.sqrt, arcTan2 = Math.atan2;

        localRequire('../utility_functions');

        Vector2D = (function() {
            function Vector2D(coordX, coordY) {
                this.coordX = coordX != null ? coordX : 0;
                this.coordY = coordY != null ? coordY : 0;
            }

            Vector2D.defineAccessor('magnitude', {
                get: function() {
                    return squareRoot(this.coordX * this.coordX + this.coordY * this.coordY);
                }
            });

            Vector2D.defineAccessor('orientation', {
                get: function() {
                    return arcTan2(this.coordY, this.coordX);
                }
            });

            Vector2D.defineAccessor('unitVector', {
                get: function() {
                    return new Vector2D(this.coordX / this.magnitude, this.coordY / this.magnitude);
                }
            });

            Vector2D.prototype.combine = function(otherVector) {
                return new Vector2D(this.coordX + otherVector.coordX, this.coordY + otherVector.coordY);
            };

            Vector2D.prototype.difference = function(otherVector) {
                return new Vector2D(this.coordX - otherVector.coordX, this.coordY - otherVector.coordY);
            };

            Vector2D.prototype.scale = function(scalarValue) {
                return new Vector2D(this.coordX * scalarValue, this.coordY * scalarValue);
            };

            Vector2D.prototype.distribute = function(scalarValue) {
                return new Vector2D(this.coordX / scalarValue, this.coordY / scalarValue);
            };

            return Vector2D;

        })();

        localModule.exports = Vector2D;

    }, {
        "../utility_functions": 6
    }],
    4: [function(localRequire, localModule, localExports) {
        'use strict';
        var Vector2D, BoundingBox, LineSection, absoluteValue, lodash;

        absoluteValue = Math.abs;

        localRequire('../utility_functions');

        lodash = localRequire('underscore');
        Vector2D = localRequire('./vector_2d');
        LineSection = localRequire('./path_segment');

        BoundingBox = (function() {
            function BoundingBox(posX, posY, boxWidth, boxHeight) {
                this.posX = posX;
                this.posY = posY;
                this._boxWidth = boxWidth != null ? boxWidth : 0;
                this._boxHeight = boxHeight != null ? boxHeight : 0;
            }

            BoundingBox.copy = function(sourceBox) {
                return new BoundingBox(sourceBox.posX, sourceBox.posY, sourceBox._boxWidth, sourceBox._boxHeight);
            };

            BoundingBox.prototype.serializeBox = function() {
                return lodash.extend({}, this);
            };

            BoundingBox.prototype.calculateArea = function() {
                return this.getWidthDimension() * this.getHeightDimension();
            };

            BoundingBox.prototype.getLeftEdge = function(leftVal) {
                if (leftVal != null) {
                    this.posX = leftVal;
                }
                return this.posX;
            };

            BoundingBox.prototype.getRightEdge = function(rightVal) {
                if (rightVal != null) {
                    this.posX = rightVal - this.getWidthDimension();
                }
                return this.posX + this.getWidthDimension();
            };

            BoundingBox.prototype.getWidthDimension = function(widthVal) {
                if (widthVal != null) {
                    this._boxWidth = widthVal;
                }
                return this._boxWidth;
            };

            BoundingBox.prototype.getTopEdge = function(topVal) {
                if (topVal != null) {
                    this.posY = topVal;
                }
                return this.posY;
            };

            BoundingBox.prototype.getBottomEdge = function(bottomVal) {
                if (bottomVal != null) {
                    this.posY = bottomVal - this.getHeightDimension();
                }
                return this.posY + this.getHeightDimension();
            };

            BoundingBox.prototype.getHeightDimension = function(heightVal) {
                if (heightVal != null) {
                    this._boxHeight = heightVal;
                }
                return this._boxHeight;
            };

            BoundingBox.prototype.getCentralPoint = function(centerCoord) {
                if (centerCoord != null) {
                    this.posX = centerCoord.coordX - this.getWidthDimension() / 2;
                    this.posY = centerCoord.coordY - this.getHeightDimension() / 2;
                }
                return new Vector2D(this.posX + this.getWidthDimension() / 2, this.posY + this.getHeightDimension() / 2);
            };

            BoundingBox.prototype.containsPoint = function(testPoint) {
                var xTest, yTest;
                return (this.getLeftEdge() <= (xTest = testPoint.coordX) && xTest <= this.getRightEdge()) && (this.getTopEdge() <= (yTest = testPoint.coordY) && yTest <= this.getBottomEdge());
            };

            BoundingBox.prototype.containsRect = function(otherBox) {
                return this.getLeftEdge() <= otherBox.getLeftEdge() && otherBox.getRightEdge() <= this.getRightEdge() && this.getTopEdge() <= otherBox.getTopEdge() && otherBox.getBottomEdge() <= this.getBottomEdge();
            };

            BoundingBox.prototype.retrieveCorners = function() {
                return [new Vector2D(this.getLeftEdge(), this.getTopEdge()), new Vector2D(this.getRightEdge(), this.getTopEdge()), new Vector2D(this.getRightEdge(), this.getBottomEdge()), new Vector2D(this.getLeftEdge(), this.getBottomEdge())];
            };

            BoundingBox.prototype.getBoundaryLine = function(sideIndex) {
                var cornerPoints;
                cornerPoints = this.retrieveCorners();
                return new LineSection(cornerPoints[sideIndex], cornerPoints[(sideIndex + 1) % 4]);
            };

            BoundingBox.prototype.determineQuadrantId = function(testPoint) {
                var centerOffset;
                centerOffset = testPoint.difference(this.getCentralPoint());
                if (centerOffset.coordY <= 0 && absoluteValue(centerOffset.coordX) <= absoluteValue(centerOffset.coordY)) {
                    return 0;
                }
                if (centerOffset.coordX >= 0 && absoluteValue(centerOffset.coordX) >= absoluteValue(centerOffset.coordY)) {
                    return 1;
                }
                if (centerOffset.coordY >= 0 && absoluteValue(centerOffset.coordX) <= absoluteValue(centerOffset.coordY)) {
                    return 2;
                }
                if (centerOffset.coordX <= 0 && absoluteValue(centerOffset.coordX) >= absoluteValue(centerOffset.coordY)) {
                    return 3;
                }
                throw Error('quadrant calculation error');
            };

            BoundingBox.prototype.getQuadrantLine = function(testPoint) {
                return this.getBoundaryLine(this.determineQuadrantId(testPoint));
            };

            return BoundingBox;

        })();

        localModule.exports = BoundingBox;

    }, {
        "../utility_functions": 6,
        "./vector_2d": 3,
        "./path_segment": 5,
        "underscore": 32
    }],
    5: [function(localRequire, localModule, localExports) {
        'use strict';
        var LineSection;

        localRequire('../utility_functions');

        LineSection = (function() {
            function LineSection(startVector, endVector) {
                this.startVector = startVector;
                this.endVector = endVector;
            }

            LineSection.defineAccessor('displacementVector', {
                get: function() {
                    return this.endVector.difference(this.startVector);
                }
            });

            LineSection.defineAccessor('magnitude', {
                get: function() {
                    return this.displacementVector.magnitude;
                }
            });

            LineSection.defineAccessor('orientation', {
                get: function() {
                    return this.displacementVector.orientation;
                }
            });

            LineSection.defineAccessor('midpoint', {
                get: function() {
                    return this.evaluatePoint(0.5);
                }
            });

            LineSection.prototype.divideIntoSections = function(numDivisions, reverseOrder) {
                var sectionIdx, divisionOrder, loopCounter1, loopCounter2, loopCounter3, orderLength, rangeStart, rangeEnd, resultArray1, resultArray2, finalResultArray;
                divisionOrder = reverseOrder ? (function() {
                    resultArray1 = [];
                    for (var loopCounter1 = rangeStart = numDivisions - 1; rangeStart <= 0 ? loopCounter1 <= 0 : loopCounter1 >= 0; rangeStart <= 0 ? loopCounter1++ : loopCounter1--) {
                        resultArray1.push(loopCounter1);
                    }
                    return resultArray1;
                }).apply(this) : (function() {
                    resultArray2 = [];
                    for (var loopCounter2 = 0, rangeEnd = numDivisions - 1; 0 <= rangeEnd ? loopCounter2 <= rangeEnd : loopCounter2 >= rangeEnd; 0 <= rangeEnd ? loopCounter2++ : loopCounter2--) {
                        resultArray2.push(loopCounter2);
                    }
                    return resultArray2;
                }).apply(this);

                finalResultArray = [];
                for (loopCounter3 = 0, orderLength = divisionOrder.length; loopCounter3 < orderLength; loopCounter3++) {
                    sectionIdx = divisionOrder[loopCounter3];
                    finalResultArray.push(this.createSubSection(sectionIdx / numDivisions, (sectionIdx + 1) / numDivisions));
                }
                return finalResultArray;
            };

            LineSection.prototype.evaluatePoint = function(interpolationFactor) {
                return this.startVector.combine(this.displacementVector.scale(interpolationFactor));
            };

            LineSection.prototype.createSubSection = function(startFactor, endFactor) {
                var subSectionEnd, segmentOffset, subSectionStart;
                segmentOffset = this.displacementVector;
                subSectionStart = this.startVector.combine(segmentOffset.scale(startFactor));
                subSectionEnd = this.startVector.combine(segmentOffset.scale(endFactor));
                return new LineSection(subSectionStart, subSectionEnd);
            };

            return LineSection;

        })();

        localModule.exports = LineSection;

    }, {
        "../utility_functions": 6
    }],
    6: [function(localRequire, localModule, localExports) {
        'use strict';
        localModule.exports = {};

        Function.prototype.defineAccessor = function(propertyName, descriptorObject) {
            return Object.defineProperty(this.prototype, propertyName, descriptorObject);
        };

    }, {}],
    7: [function(localRequire, localModule, localExports) {
        'use strict';
        var Vehicle, PathFollower, maximumVal, minimumVal, randomValue, squareRoot, lodash;

        maximumVal = Math.max, minimumVal = Math.min, randomValue = Math.random, squareRoot = Math.sqrt;

        localRequire('../utility_functions');

        lodash = localRequire('underscore');
        PathFollower = localRequire('./vehicle_path');

        Vehicle = (function() {
            function Vehicle(initialLane, initialPosition) {
                this.vehicleId = lodash.uniqueId('veh');
                this.paintHue = (300 + 240 * randomValue() | 0) % 360;
                this._currentSpeed = 0;
                this.bodyWidth = 1.7;
                this.bodyLength = 3 + 2 * randomValue();
                this.maxVelocity = 30;
                this.minGapDistance = 2;
                this.safetyTimeGap = 1.5;
                this.maxAccelRate = 1;
                this.maxDecelRate = 3;
                this.vehiclePath = new PathFollower(this, initialLane, initialPosition);
                this.isActive = true;
                this.desiredLane = null;
            }

            Vehicle.defineAccessor('currentCoordinates', {
                get: function() {
                    return this.vehiclePath.currentCoordinates;
                }
            });

            Vehicle.defineAccessor('currentVelocity', {
                get: function() {
                    return this._currentSpeed;
                },
                set: function(newSpeed) {
                    if (newSpeed < 0) {
                        newSpeed = 0;
                    }
                    if (newSpeed > this.maxVelocity) {
                        newSpeed = this.maxVelocity;
                    }
                    return this._currentSpeed = newSpeed;
                }
            });

            Vehicle.defineAccessor('headingAngle', {
                get: function() {
                    return this.vehiclePath.headingAngle;
                }
            });

            Vehicle.prototype.deallocate = function() {
                return this.vehiclePath.deallocate();
            };

            Vehicle.prototype.calculateAcceleration = function() {
                var accelConst, decelConst, brakingGap, trafficDensityFactor, accelerationFactor, relativeSpeedDiff, staticGap, frontVehicleDistance, freeFlowFactor, junctionProximityFactor, frontCarInfo, desiredGap, safeJunctionApproach, dynamicGap, otherVehicleRef;
                frontCarInfo = this.vehiclePath.nextVehicleInfo;
                frontVehicleDistance = maximumVal(frontCarInfo.gapDistance, 0);
                accelConst = this.maxAccelRate;
                decelConst = this.maxDecelRate;
                relativeSpeedDiff = (this.currentVelocity - ((otherVehicleRef = frontCarInfo.vehicle) != null ? otherVehicleRef.currentVelocity : void 0)) || 0;
                freeFlowFactor = Math.pow(this.currentVelocity / this.maxVelocity, 4);
                staticGap = this.minGapDistance;
                dynamicGap = this.currentVelocity * this.safetyTimeGap;
                brakingGap = this.currentVelocity * relativeSpeedDiff / (2 * squareRoot(accelConst * decelConst));
                desiredGap = staticGap + dynamicGap + brakingGap;
                trafficDensityFactor = Math.pow(desiredGap / frontVehicleDistance, 2);
                safeJunctionApproach = 1 + dynamicGap + Math.pow(this.currentVelocity, 2) / (2 * decelConst);
                junctionProximityFactor = Math.pow(safeJunctionApproach / this.vehiclePath.distanceToJunctionLine, 2);
                accelerationFactor = 1 - freeFlowFactor - trafficDensityFactor - junctionProximityFactor;
                return this.maxAccelRate * accelerationFactor;
            };

            Vehicle.prototype.advanceVehicle = function(timeStep) {
                var computedAcceleration, presentLane, chosenLane, movementDistance, turnDirectionCode;
                computedAcceleration = this.calculateAcceleration();
                this.currentVelocity += computedAcceleration * timeStep;
                if (!this.vehiclePath.isLaneSwitching && this.destinationLane) {
                    presentLane = this.vehiclePath.currentSegment.roadLane;
                    turnDirectionCode = presentLane.determineTurnDirection(this.destinationLane);
                    chosenLane = (function() {
                        switch (turnDirectionCode) {
                            case 0:
                                return presentLane.adjacentLeftLane;
                            case 2:
                                return presentLane.adjacentRightLane;
                            default:
                                return presentLane;
                        }
                    })();
                    if (chosenLane !== presentLane) {
                        this.vehiclePath.initiateLaneChange(chosenLane);
                    }
                }
                movementDistance = this.currentVelocity * timeStep + 0.5 * computedAcceleration * Math.pow(timeStep, 2);
                if (this.vehiclePath.nextVehicleInfo.gapDistance < movementDistance) {
                    console.log('inaccurate vehicle dynamics model');
                }
                if (this.vehiclePath.canExecuteTurn(movementDistance)) {
                    if (this.destinationLane == null) {
                        return this.isActive = false;
                    }
                }
                return this.vehiclePath.propelForward(movementDistance);
            };
    }]
});