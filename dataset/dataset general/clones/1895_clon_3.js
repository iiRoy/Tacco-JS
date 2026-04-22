/*
 * Data Visualizer Core Library
 * http://graphvisuals.org/
 * Build Version: {{ core_version }}
 *
 * Copyright 2023 Visuals Inc.
 * Licensed under the Apache 2.0 license
 * https://www.apache.org/licenses/LICENSE-2.0
 */


(function() {

    "use strict";

    // Establish the global context for the library, whether in a browser or Node.js environment.
    var globalScope = this;
    // Store any previously defined global object named 'VisualizerCore' to restore later if needed.
    var priorVisualizer = globalScope.VisualizerCore;

    // Define the main constructor for our data visualization engine.
    // This function initializes a new visualization instance linked to a drawing surface.
    var VisualizerCore = function(renderingContext) {
        // Ensure 'this' refers to the new instance, even if called without 'new'.
        if (!(this instanceof VisualizerCore)) {
            return new VisualizerCore(renderingContext);
        }

        var instanceRef = this; // Self-reference for internal use.
        // Assign the canvas element from the provided 2D rendering context.
        this.drawingSurface = renderingContext.canvas;
        // Keep a reference to the 2D rendering context itself for drawing operations.
        this.renderHandle = renderingContext;

        // Extract and store the dimensions of the drawing surface.
        var surfaceWidth = this.surfaceWidth = renderingContext.canvas.width;
        var surfaceHeight = this.surfaceHeight = renderingContext.canvas.height;
        // Calculate and store the aspect ratio of the drawing surface.
        this.dimensionRatio = this.surfaceWidth / this.surfaceHeight;

        // Apply high-DPI scaling if the device supports it, enhancing visual clarity.
        // This helper adjusts the canvas dimensions and applies a scaling transform to the context.
        utilityToolkit.scaleForHighDPI(this);

        // Return the initialized instance.
        return instanceRef;
    };

    // Expose default configuration settings globally, allowing users to customize behavior.
    VisualizerCore.configPresets = {
        commonSettings: {
            // Enable or disable visual transitions for chart updates.
            enableTransitions: true,

            // Number of animation frames for a complete transition cycle.
            transitionStepsCount: 75, // Slightly changed from 60

            // Easing function to control the pace of transitions.
            transitionEasingEffect: "easeOutCubic", // Changed easing function

            // Should the primary axis scale be displayed?
            displayAxisScale: true,

            // Force a specific scale range, overriding auto-calculation.
            overrideAxisScale: false,

            // ** Required if overrideAxisScale is true **
            // How many divisions should the custom scale have?
            customScaleDivisions: null,
            // The value increment between each division in a custom scale.
            customScaleStepValue: null,
            // The initial value for the custom scale.
            customScaleStartPoint: null,

            // Color of the axis lines.
            axisLineColor: "rgba(0,0,0,0.15)", // Slightly changed alpha

            // Thickness of the axis lines in pixels.
            axisLineWidth: 1,

            // Show textual labels alongside the scale divisions.
            showAxisLabels: true,

            // Template string for rendering axis labels. Accesses 'value'.
            axisLabelFormat: "<%= (value * 1).toLocaleString() %>", // Added toLocaleString

            // Restrict scale labels to whole numbers only.
            restrictToIntegers: true,

            // Force the scale to always begin at zero.
            forceStartAtZero: false,

            // Font family for axis labels.
            axisLabelFontFamily: "'Roboto', 'Arial', sans-serif", // Changed font

            // Font size for axis labels in pixels.
            axisLabelFontSize: 13, // Slightly changed size

            // Font weight style for axis labels.
            axisLabelFontStyle: "normal",

            // Font color for axis labels.
            axisLabelFontColor: "#555", // Slightly changed color

            // Enable responsive resizing of the chart with its container.
            responsiveLayout: true, // Changed from 'responsive'

            // Maintain the original aspect ratio when responsive, or fill container.
            preserveAspectRatio: true,

            // Enable interactive tooltips on hover/touch.
            enableTooltips: true,

            // Use a custom tooltip rendering function instead of the built-in one.
            useCustomTooltips: false,

            // DOM events that trigger tooltip display.
            tooltipActivationEvents: ["mousemove", "touchstart", "touchmove", "pointerout"], // Added pointerout

            // Background color for tooltips.
            tooltipBackgroundColor: "rgba(30,30,30,0.85)", // Slightly changed color

            // Font family for tooltip labels.
            tooltipLabelFontFamily: "'Roboto', 'Arial', sans-serif",

            // Font size for tooltip labels.
            tooltipLabelFontSize: 14,

            // Font weight for tooltip labels.
            tooltipLabelFontStyle: "normal",

            // Font color for tooltip labels.
            tooltipLabelFontColor: "#eee", // Slightly changed color

            // Font family for tooltip titles.
            tooltipTitleFontFamily: "'Roboto', 'Arial', sans-serif",

            // Font size for tooltip titles.
            tooltipTitleFontSize: 14,

            // Font weight for tooltip titles.
            tooltipTitleFontStyle: "bold",

            // Font color for tooltip titles.
            tooltipTitleFontColor: "#eee",

            // Vertical padding around tooltip text.
            tooltipPaddingY: 8, // Slightly changed padding

            // Horizontal padding around tooltip text.
            tooltipPaddingX: 8, // Slightly changed padding

            // Size of the tooltip caret (pointer).
            tooltipPointerSize: 9, // Slightly changed size

            // Border radius for tooltip corners.
            tooltipBorderRadius: 7, // Slightly changed radius

            // Horizontal offset from the data point to the tooltip edge.
            tooltipOffsetX: 12, // Slightly changed offset

            // Template string for displaying a single tooltip item.
            singleTooltipPattern: "<%if (dataLabel){%><%=dataLabel%>: <%}%><%= dataValue %>", // Renamed label/value

            // Template string for displaying multiple tooltip items.
            multiTooltipPattern: "<%= dataValue %>",

            // Background color for the legend color block within multi-tooltips.
            multiTooltipKeyBackground: '#ccc', // Changed color

            // Callback function fired on each animation frame.
            onTransitionStep: function() {},

            // Callback function fired when an animation completes.
            onTransitionComplete: function() {},

            // Debug mode flag (new addition)
            debugMode: false
        }
    };

    // A registry for different visualization types (e.g., bar, line, pie).
    VisualizerCore.kindRegistry = {};

    // Global utility functions and classes accessible throughout the library.
    var utilityToolkit = VisualizerCore.utilityToolkit = {};

    // -- Core JavaScript Utility Methods --

    // Iterates over an array or object, applying a callback function to each element.
    var traverseCollection = utilityToolkit.traverseCollection = function(collection, operationCallback, scopeContext) {
            // Early exit if the collection is null or undefined.
            if (!collection) {
                return;
            }

            var extraParams = Array.prototype.slice.call(arguments, 3);
            if (Array.isArray(collection) || (typeof collection.length === 'number' && collection.length === +collection.length)) {
                // Handle array-like objects.
                for (var idx = 0; idx < collection.length; idx++) {
                    operationCallback.apply(scopeContext, [collection[idx], idx].concat(extraParams));
                }
            } else {
                // Handle plain objects.
                for (var prop in collection) {
                    if (Object.prototype.hasOwnProperty.call(collection, prop)) {
                        operationCallback.apply(scopeContext, [collection[prop], prop].concat(extraParams));
                    }
                }
            }
        },

        // Creates a shallow copy of an object.
        createShallowCopy = utilityToolkit.createShallowCopy = function(originalObj) {
            var copiedObject = {};
            traverseCollection(originalObj, function(val, key) {
                if (Object.prototype.hasOwnProperty.call(originalObj, key)) {
                    copiedObject[key] = val;
                }
            });
            return copiedObject;
        },

        // Merges properties from one or more source objects into a base object.
        // Later source objects' properties overwrite earlier ones.
        mixinProperties = utilityToolkit.mixinProperties = function(targetBase) {
            var sourceObjects = Array.prototype.slice.call(arguments, 1);
            traverseCollection(sourceObjects, function(sourceObj) {
                traverseCollection(sourceObj, function(val, key) {
                    if (Object.prototype.hasOwnProperty.call(sourceObj, key)) {
                        targetBase[key] = val;
                    }
                });
            });
            return targetBase;
        },

        // Creates a new object by merging properties from multiple objects.
        // The first argument is the base, subsequent arguments are merged into a new object.
        combineObjects = utilityToolkit.combineObjects = function() {
            var inputArguments = Array.prototype.slice.call(arguments, 0);
            inputArguments.unshift({}); // Prepend an empty object as the merge target.
            return mixinProperties.apply(null, inputArguments);
        },

        // Finds the index of a specific element within an array.
        findItemIndex = utilityToolkit.findItemIndex = function(targetArray, searchElement) {
            if (Array.prototype.indexOf) {
                return targetArray.indexOf(searchElement);
            } else {
                // Fallback for older browsers.
                for (var i = 0; i < targetArray.length; i++) {
                    if (targetArray[i] === searchElement) return i;
                }
                return -1;
            }
        },

        // Returns a new array containing only elements that satisfy a provided test function.
        filterCollection = utilityToolkit.filterCollection = function(dataCollection, predicateFunc) {
            var matchingElements = [];
            traverseCollection(dataCollection, function(item) {
                if (predicateFunc(item)) {
                    matchingElements.push(item);
                }
            });
            return matchingElements;
        },

        // Finds the next element in an array that satisfies a condition, starting from a given index.
        locateNextMatch = utilityToolkit.locateNextMatch = function(dataArray, conditionFunc, startPoint) {
            if (!dataArray || dataArray.length === 0) return undefined; // Handle empty array
            var actualStart = (startPoint === undefined || startPoint === null) ? -1 : startPoint;
            for (var k = actualStart + 1; k < dataArray.length; k++) {
                var currentElement = dataArray[k];
                if (conditionFunc(currentElement)) {
                    return currentElement;
                }
            }
            return undefined; // Return undefined if no match found
        },

        // Finds the previous element in an array that satisfies a condition, starting from a given index.
        locatePreviousMatch = utilityToolkit.locatePreviousMatch = function(dataArray, conditionFunc, startPoint) {
            if (!dataArray || dataArray.length === 0) return undefined; // Handle empty array
            var actualStart = (startPoint === undefined || startPoint === null) ? dataArray.length : startPoint;
            for (var j = actualStart - 1; j >= 0; j--) {
                var currentElement = dataArray[j];
                if (conditionFunc(currentElement)) {
                    return currentElement;
                }
            }
            return undefined; // Return undefined if no match found
        },

        // Implements a basic inheritance pattern similar to Backbone.js.
        establishInheritance = utilityToolkit.establishInheritance = function(childProperties) {
            var baseClass = this;
            // Define the constructor for the derived class.
            var DerivedElement = (childProperties && childProperties.hasOwnProperty("constructor")) ? childProperties.constructor : function() {
                return baseClass.apply(this, arguments);
            };

            // Set up the prototype chain without calling the parent constructor.
            var PrototypeProxy = function() {};
            PrototypeProxy.prototype = baseClass.prototype;
            DerivedElement.prototype = new PrototypeProxy();
            DerivedElement.prototype.constructor = DerivedElement; // Correct the constructor reference.

            // Add an 'extend' method to the derived class for further inheritance.
            DerivedElement.extend = establishInheritance;

            // Mix in any additional properties provided for the derived class.
            if (childProperties) mixinProperties(DerivedElement.prototype, childProperties);

            // Store a reference to the parent's prototype.
            DerivedElement.__super__ = baseClass.prototype;

            return DerivedElement;
        },

        // A no-operation function, useful as a placeholder callback.
        doNothing = utilityToolkit.doNothing = function() {},

        // Generates a unique identifier string.
        generateUniqueId = utilityToolkit.generateUniqueId = (function() {
            var counter = 0; // Internal counter for IDs.
            return function() {
                return "viz-id-" + (counter++);
            };
        })(),

        // Logs a warning message to the console if available.
        logWarning = utilityToolkit.logWarning = function(messageText) {
            if (window.console && typeof window.console.warn === "function") {
                console.warn(messageText);
            }
        },

        // Checks if the environment supports Asynchronous Module Definition (AMD).
        isAmdEnvironment = utilityToolkit.isAmdEnvironment = (typeof define === 'function' && define.amd),

        // Scales the canvas for high-DPI displays.
        scaleForHighDPI = utilityToolkit.scaleForHighDPI = function(visualizerInstance) {
            if (!visualizerInstance || !visualizerInstance.drawingSurface || !visualizerInstance.renderHandle) {
                logWarning("Cannot scale for high DPI: invalid visualizer instance or context.");
                return;
            }

            var canvas = visualizerInstance.drawingSurface;
            var ctx = visualizerInstance.renderHandle;

            var devicePixelRatio = window.devicePixelRatio || 1;
            var backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
                ctx.mozBackingStorePixelRatio ||
                ctx.msBackingStorePixelRatio ||
                ctx.oBackingStorePixelRatio ||
                ctx.backingStorePixelRatio || 1;

            var ratio = devicePixelRatio / backingStoreRatio;

            if (devicePixelRatio !== backingStoreRatio && ratio > 1) {
                var oldWidth = visualizerInstance.surfaceWidth;
                var oldHeight = visualizerInstance.surfaceHeight;

                canvas.width = oldWidth * ratio;
                canvas.height = oldHeight * ratio;

                canvas.style.width = oldWidth + 'px';
                canvas.style.height = oldHeight + 'px';

                ctx.scale(ratio, ratio);
                visualizerInstance.currentPixelScaling = ratio; // Store the applied scale factor.
            } else {
                visualizerInstance.currentPixelScaling = 1; // No scaling applied.
            }
        },

        // -- Mathematical Utility Methods --

        // Checks if a given value is a valid finite number.
        isValidNumber = utilityToolkit.isValidNumber = function(valueToCheck) {
            return !isNaN(parseFloat(valueToCheck)) && isFinite(valueToCheck);
        },

        // Returns the maximum value from an array of numbers.
        getMaximumValue = utilityToolkit.getMaximumValue = function(numericArray) {
            if (!Array.isArray(numericArray) || numericArray.length === 0) {
                return undefined; // Or throw an error, depending on desired behavior.
            }
            return Math.max.apply(Math, numericArray);
        },

        // Returns the minimum value from an array of numbers.
        getMinimumValue = utilityToolkit.getMinimumValue = function(numericArray) {
            if (!Array.isArray(numericArray) || numericArray.length === 0) {
                return undefined;
            }
            return Math.min.apply(Math, numericArray);
        },

        // Constrains a value within a specified minimum and maximum range.
        constrainValue = utilityToolkit.constrainValue = function(inputValue, upperBound, lowerBound) {
            var constrained = inputValue;
            if (isValidNumber(upperBound) && constrained > upperBound) {
                constrained = upperBound;
            }
            if (isValidNumber(lowerBound) && constrained < lowerBound) {
                constrained = lowerBound;
            }
            return constrained;
        },

        // Counts the number of decimal places in a floating-point number.
        countDecimalDigits = utilityToolkit.countDecimalDigits = function(inputNum) {
            if (inputNum % 1 !== 0 && isValidNumber(inputNum)) {
                var stringRep = inputNum.toString();
                var decimalPart = stringRep.split(".")[1];
                return decimalPart ? decimalPart.length : 0;
            }
            return 0;
        },

        // Converts an angle from degrees to radians.
        convertDegreesToRadians = utilityToolkit.convertDegreesToRadians = function(angleInDegrees) {
            return angleInDegrees * (Math.PI / 180);
        },

        // Calculates the angle and distance of a target point relative to an origin point.
        calculateAngleAndDistance = utilityToolkit.calculateAngleAndDistance = function(originPoint, targetPoint) {
            var deltaX = targetPoint.x - originPoint.x;
            var deltaY = targetPoint.y - originPoint.y;
            var radialDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            var fullCircle = Math.PI * 2;
            var calculatedAngle = fullCircle + Math.atan2(deltaY, deltaX);

            // Adjust angle to be positive and within [0, 2*PI] if needed (atan2 returns -PI to PI).
            if (calculatedAngle >= fullCircle) {
                calculatedAngle -= fullCircle;
            }

            return {
                angle: calculatedAngle,
                distance: radialDistance
            };
        },

        // Adjusts pixel values for crisp rendering on canvas, especially for lines.
        adjustPixelOffset = utilityToolkit.adjustPixelOffset = function(lineWidth) {
            return (lineWidth % 2 === 0) ? 0 : 0.5;
        },

        // Computes control points for a Catmull-Rom spline segment.
        computeSplineControlPoints = utilityToolkit.computeSplineControlPoints = function(pointP0, pointP1, pointP2, tensionFactor) {
            // Based on Rob Spencer's work on splines: http://scaledinnovation.com/analytics/splines/aboutSplines.html
            var distP0P1 = Math.sqrt(Math.pow(pointP1.x - pointP0.x, 2) + Math.pow(pointP1.y - pointP0.y, 2));
            var distP1P2 = Math.sqrt(Math.pow(pointP2.x - pointP1.x, 2) + Math.pow(pointP2.y - pointP1.y, 2));

            var factorA = tensionFactor * distP0P1 / (distP0P1 + distP1P2); // Scaling for triangle P0P1P2
            var factorB = tensionFactor * distP1P2 / (distP0P1 + distP1P2); // Scaling for triangle P0P1P2

            return {
                controlIn: { // Control point for the segment ending at P1
                    x: pointP1.x - factorA * (pointP2.x - pointP0.x),
                    y: pointP1.y - factorA * (pointP2.y - pointP0.y)
                },
                controlOut: { // Control point for the segment starting at P1
                    x: pointP1.x + factorB * (pointP2.x - pointP0.x),
                    y: pointP1.y + factorB * (pointP2.y - pointP0.y)
                }
            };
        },

        // Determines the base-10 order of magnitude for a given number.
        determineMagnitudeOrder = utilityToolkit.determineMagnitudeOrder = function(numericValue) {
            if (numericValue === 0) return 0; // Special case for zero.
            return Math.floor(Math.log(Math.abs(numericValue)) / Math.LN10);
        },

        // Calculates optimal scale parameters (steps, step value, min, max) for a set of data points.
        deriveScaleParameters = utilityToolkit.deriveScaleParameters = function(dataPoints, availableSpace, labelFontSize, forceStartAtZero, restrictToIntegers) {
            if (!Array.isArray(dataPoints) || dataPoints.length === 0) {
                logWarning("Cannot derive scale parameters for empty data points array.");
                // Return a default or empty scale to prevent errors.
                return {
                    steps: 1,
                    stepValue: 1,
                    min: 0,
                    max: 1
                };
            }

            var minimumSteps = 2; // At least a start and end point.
            var maximumSteps = Math.floor(availableSpace / (labelFontSize * 1.75)); // Allow more room for labels.
            var skipAdjustment = (minimumSteps >= maximumSteps); // Flag to bypass fitting if space is too constrained.

            var dataMaxValue = getMaximumValue(dataPoints);
            var dataMinValue = getMinimumValue(dataPoints);

            // If all data points are identical, create a small range to avoid division by zero.
            if (dataMaxValue === dataMinValue) {
                dataMaxValue += 0.5;
                if (dataMinValue >= 0.5 && !forceStartAtZero) {
                    dataMinValue -= 0.5;
                } else {
                    dataMinValue = Math.max(0, dataMinValue - 0.5); // Ensure it doesn't go negative if starting at 0.
                }
            }

            var valueSpan = Math.abs(dataMaxValue - dataMinValue);
            var spanMagnitude = determineMagnitudeOrder(valueSpan);
            var magnitudePower = Math.pow(10, spanMagnitude);

            // Calculate initial graph max and min, rounding to the nearest magnitude.
            var graphUpperLimit = Math.ceil(dataMaxValue / magnitudePower) * magnitudePower;
            var graphLowerLimit = (forceStartAtZero) ? 0 : Math.floor(dataMinValue / magnitudePower) * magnitudePower;

            // Ensure graphLowerLimit is not greater than graphUpperLimit, especially if dataMinValue is negative and forceStartAtZero is false
            if (graphLowerLimit > graphUpperLimit) {
                graphLowerLimit = graphUpperLimit - magnitudePower; // Adjust to ensure a range
                if (forceStartAtZero && graphLowerLimit < 0) graphLowerLimit = 0;
            }


            var effectiveGraphRange = graphUpperLimit - graphLowerLimit;
            var incrementValue = magnitudePower; // Initial step value.
            var totalSteps = Math.round(effectiveGraphRange / incrementValue);

            // Adjust step value and number of steps to fit within UI constraints.
            while ((totalSteps > maximumSteps || (totalSteps * 2) < maximumSteps) && !skipAdjustment) {
                if (totalSteps > maximumSteps) {
                    incrementValue *= 2; // Increase step size.
                    totalSteps = Math.round(effectiveGraphRange / incrementValue);
                    if (totalSteps % 1 !== 0) { // If it results in non-integer steps, stop trying to fit.
                        skipAdjustment = true;
                    }
                } else {
                    // Try to make the scale more granular.
                    if (restrictToIntegers && spanMagnitude >= 0) {
                        // If only integers are allowed, ensure the new step value is also an integer.
                        if (incrementValue / 2 % 1 === 0) {
                            incrementValue /= 2;
                            totalSteps = Math.round(effectiveGraphRange / incrementValue);
                        } else {
                            break; // Cannot make more granular with integer constraint.
                        }
                    } else {
                        // No integer constraint, can always make more granular.
                        incrementValue /= 2;
                        totalSteps = Math.round(effectiveGraphRange / incrementValue);
                    }
                }
            }

            // If fitting was skipped or failed, use minimum steps.
            if (skipAdjustment) {
                totalSteps = minimumSteps;
                incrementValue = effectiveGraphRange / totalSteps;
            }

            // Final check to ensure min/max are covered.
            if (graphUpperLimit < dataMaxValue) {
                graphUpperLimit = graphLowerLimit + (totalSteps * incrementValue);
            }
            if (graphLowerLimit > dataMinValue && !forceStartAtZero) {
                 graphLowerLimit = graphUpperLimit - (totalSteps * incrementValue);
            }
            if (forceStartAtZero && graphLowerLimit !== 0) {
                graphLowerLimit = 0;
                totalSteps = Math.ceil(graphUpperLimit / incrementValue); // Recalculate steps from 0
                graphUpperLimit = totalSteps * incrementValue; // Adjust upper limit to match new steps
            }


            return {
                steps: totalSteps,
                stepValue: incrementValue,
                min: graphLowerLimit,
                max: graphUpperLimit
            };

        },
        /* jshint ignore:start */
        // Ignored by JSHint due to the use of 'new Function' for templating.
        // Templating utility based on John Resig's micro-templating.
        renderTemplateString = utilityToolkit.renderTemplateString = function(templateSource, dataContext) {
            // If the template source is a function, execute it with the data context.
            if (typeof templateSource === 'function') {
                return templateSource(dataContext);
            }

            var templateCache = {}; // Cache compiled templates.
            var templateFunctionGenerator = function(rawTemplate, contextData) {
                // Check if the template is already cached by its string.
                var compiledFunc = !/\W/.test(rawTemplate) ?
                    templateCache[rawTemplate] = templateCache[rawTemplate] :

                    // Compile the template string into a reusable function.
                    new Function("obj",
                        "var outputArray=[], pushOutput=function(){outputArray.push.apply(outputArray,arguments);};" +

                        // Introduce the data context as local variables using with(){}.
                        "with(obj){pushOutput('" +

                        // Convert template syntax into JavaScript logic.
                        rawTemplate
                        .replace(/[\r\t\n]/g, " ") // Remove newlines and tabs.
                        .split("<%").join("\t") // Replace opening tags with tabs.
                        .replace(/((^|%>)[^\t]*)'/g, "$1\r") // Escape single quotes in literal strings.
                        .replace(/\t=(.*?)%>/g, "',$1,'") // Handle output expressions <%= %>.
                        .split("\t").join("');") // Close previous string, open JS block.
                        .split("%>").join("pushOutput('") // Close JS block, open new string.
                        .split("\r").join("\\'") + // Restore escaped single quotes.
                        "');}return outputArray.join('');"
                    );

                // If data is provided, execute the compiled function immediately.
                return contextData ? compiledFunc(contextData) : compiledFunc;
            };
            return templateFunctionGenerator(templateSource, dataContext);
        },
        /* jshint ignore:end */
        // Generates an array of formatted labels for a scale.
        produceScaleLabels = utilityToolkit.produceScaleLabels = function(labelPattern, totalSteps, scaleMinimum, stepIncrement) {
            var generatedLabels = new Array(totalSteps);
            if (labelPattern) {
                traverseCollection(generatedLabels, function(value, index) {
                    var currentStepValue = scaleMinimum + (stepIncrement * (index + 1));
                    generatedLabels[index] = renderTemplateString(labelPattern, {
                        value: currentStepValue
                    });
                });
            }
            return generatedLabels;
        },

        // -- Animation Easing Functions --
        // Easing functions adapted from Robert Penner's equations.
        animationEasings = utilityToolkit.animationEasings = {
            smoothLinear: function(progress) { // Renamed from 'linear'
                return progress;
            },
            easeOutCubic: function(progress) { // Added a new easing function
                var p = progress - 1;
                return p * p * p + 1;
            },
            easeInQuad: function(progress) {
                return progress * progress;
            }
        };

    // Expose the main VisualizerCore constructor to the global scope.
    globalScope.VisualizerCore = VisualizerCore;

    // Define the module for AMD loaders if available.
    if (isAmdEnvironment) {
        define(function() {
            return VisualizerCore;
        });
    }

    // Add a noConflict method to avoid global variable collisions.
    VisualizerCore.noConflict = function() {
        globalScope.VisualizerCore = priorVisualizer;
        return VisualizerCore;
    };

}).call(this); // Execute the IIFE with 'this' referring to the global object.