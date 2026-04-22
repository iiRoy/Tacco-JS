/*!
 * Visualizer.js
 * http://visualizer.org/
 * Version: {{ version }}
 *
 * Copyright 2015 Nikolas Dowell
 * Distributed under the MIT license
 * https://github.com/nnnick/Visualizer.js/blob/master/LICENSE.md
 */


(function() {

    "use strict";

    // Set up global context variable - 'window' for browsers, 'global' for Node.js
    var globalScope = this,
        priorContext = globalScope.Plotter;

    // Occupy the global 'Plotter' variable and establish a fundamental base class
    var Plotter = function(renderingContext) {
        var plotInstance = this;
        this.drawingSurface = renderingContext.canvas;

        this.renderEngine = renderingContext;

        // Variables applicable across the entire visualization
        var visualWidth = this.visualWidth = renderingContext.canvas.width;
        var visualHeight = this.visualHeight = renderingContext.canvas.height;
        this.proportion = this.visualWidth / this.visualHeight;
        // For high-resolution displays - multiply canvas dimensions by device pixel ratio, then scale.
        utilities.highResAdjust(this);

        return this;
    };
    // Make configuration settings globally accessible for user modification
    Plotter.config = {
        universal: {
            // Boolean - Should the visualizer animate its rendering
            morphing: true,

            // Numeric - Count of animation stages
            morphingStages: 60,

            // String - The easing function for animation
            morphingCurve: "easeOutQuart",

            // Boolean - Should the axis be displayed at all
            displayAxis: true,

            // Boolean - If a custom axis configuration should override defaults
            axisCustom: false,

            // ** Mandatory if axisCustom is true **
            // Numeric - The number of divisions in a custom axis
            axisDivisions: null,
            // Numeric - The value increment for custom axis divisions
            axisDivisionSize: null,
            // Numeric - The starting value for the custom axis
            axisInitialValue: null,

            // String - Tint of the axis lines
            axisLineTint: "rgba(0,0,0,.1)",

            // Numeric - Pixel thickness of the axis lines
            axisLineWidth: 1,

            // Boolean - Should labels be shown on the axis
            axisShowMarks: true,

            // Interpolated JS string - can use 'value'
            axisMarkText: "<%=value%>",

            // Boolean - Should the axis stick to whole numbers, even if space allows for floats
            axisWholeNumbersOnly: true,

            // Boolean - Should the axis always start at zero, or relative to the lowest value
            axisStartAtZero: false,

            // String - Font declaration for axis labels
            axisFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

            // Numeric - Font size in pixels for axis labels
            axisFontSize: 12,

            // String - Font weight style for axis labels
            axisFontStyle: "normal",

            // String - Font tint for axis labels
            axisFontColor: "#666",

            // Boolean - Should the visualizer adapt and resize with the browser window.
            adaptive: false,

            // Boolean - Should the initial aspect ratio be preserved when adaptive, false means it fills the container
            preserveProportion: true,

            // Boolean - Determines if hints (tooltips) are drawn on the canvas - attaches to touchmove & mousemove
            displayHints: true,

            // Boolean - Determines if built-in hint drawing is used or a user-defined function
            userDefinedHints: false,

            // Array - List of string events to trigger hints
            hintTriggers: ["mousemove", "touchstart", "touchmove", "mouseout"],

            // String - Background tint for hints
            hintFillTint: "rgba(0,0,0,0.8)",

            // String - Font declaration for hint labels
            hintFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

            // Numeric - Font size in pixels for hint labels
            hintFontSize: 14,

            // String - Font weight style for hints
            hintFontStyle: "normal",

            // String - Font tint for hint labels
            hintFontColor: "#fff",

            // String - Font declaration for hint title
            hintTitleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

            // Numeric - Font size in pixels for hint title
            hintTitleFontSize: 14,

            // String - Font weight style for hint title
            hintTitleFontStyle: "bold",

            // String - Font tint for hint title
            hintTitleFontColor: "#fff",

            // Numeric - Pixel padding around hint text on the Y axis
            hintYPad: 6,

            // Numeric - Pixel padding around hint text on the X axis
            hintXPad: 6,

            // Numeric - Size of the pointer on the hint
            hintPointerSize: 8,

            // Numeric - Pixel radius for hint border curvature
            hintCornerCurve: 6,

            // Numeric - Pixel offset from data point X to hint edge
            hintXOffset: 10,

            // String - Template string for single data point hints
            hintSingleFormat: "<%if (label){%><%=label%>: <%}%><%= value %>",

            // String - Template string for multiple data point hints
            hintMultiFormat: "<%= value %>",

            // String - Tint behind the legend color block in multi-hints
            hintKeyBackground: '#fff',

            // Function - Executed when animation progresses.
            onMorphProgress: function() {},

            // Function - Executed when animation completes.
            onMorphComplete: function() {}

        }
    };

    // Create a registry of visualizer types, allowing for extension of existing categories
    Plotter.kindRegistry = {};

    // Global 'utilities' object for helper methods and classes within Plotter
    var utilities = Plotter.utilities = {};

    // -- Fundamental JavaScript utility methods
    var iterateOver = utilities.iterateOver = function(collection, processFunc, contextObject) {
            var extraArguments = Array.prototype.slice.call(arguments, 3);
            // Check for null or undefined collections first.
            if (collection) {
                if (collection.length === +collection.length) {
                    var k;
                    for (k = 0; k < collection.length; k++) {
                        processFunc.apply(contextObject, [collection[k], k].concat(extraArguments));
                    }
                } else {
                    for (var element in collection) {
                        processFunc.apply(contextObject, [collection[element], element].concat(extraArguments));
                    }
                }
            }
        },
        duplicate = utilities.duplicate = function(sourceObject) {
            var copiedObject = {};
            iterateOver(sourceObject, function(itemValue, itemKey) {
                if (sourceObject.hasOwnProperty(itemKey)) copiedObject[itemKey] = itemValue;
            });
            return copiedObject;
        },
        amalgamate = utilities.amalgamate = function(targetObject) {
            iterateOver(Array.prototype.slice.call(arguments, 1), function(sourceExtension) {
                iterateOver(sourceExtension, function(itemValue, itemKey) {
                    if (sourceExtension.hasOwnProperty(itemKey)) targetObject[itemKey] = itemValue;
                });
            });
            return targetObject;
        },
        combine = utilities.combine = function(firstObject, secondObject) {
            // Merge properties from the right object into a shallow clone of the left object.
            var argumentList = Array.prototype.slice.call(arguments, 0);
            argumentList.unshift({});
            return amalgamate.apply(null, argumentList);
        },
        findPosition = utilities.findPosition = function(targetArray, searchItem) {
            if (Array.prototype.indexOf) {
                return targetArray.indexOf(searchItem);
            } else {
                for (var k = 0; k < targetArray.length; k++) {
                    if (targetArray[k] === searchItem) return k;
                }
                return -1;
            }
        },
        filterCollection = utilities.filterCollection = function(sourceCollection, criteriaFunc) {
            var matchingElements = [];

            utilities.iterateOver(sourceCollection, function(element) {
                if (criteriaFunc(element)) {
                    matchingElements.push(element);
                }
            });

            return matchingElements;
        },
        locateNextMatch = utilities.locateNextMatch = function(dataArray, matchCondition, startingIndex) {
            // Default to the beginning of the array
            if (!startingIndex) {
                startingIndex = -1;
            }
            for (var k = startingIndex + 1; k < dataArray.length; k++) {
                var currentElement = dataArray[k];
                if (matchCondition(currentElement)) {
                    return currentElement;
                }
            }
        },
        locatePrevMatch = utilities.locatePrevMatch = function(dataArray, matchCondition, startingIndex) {
            // Default to the end of the array
            if (!startingIndex) {
                startingIndex = dataArray.length;
            }
            for (var k = startingIndex - 1; k >= 0; k--) {
                var currentElement = dataArray[k];
                if (matchCondition(currentElement)) {
                    return currentElement;
                }
            }
        },
        derive = utilities.derive = function(mixin) {
            // Basic JavaScript inheritance based on the pattern from Backbone.js
            var baseClass = this;
            var VisualElement = (mixin && mixin.hasOwnProperty("constructor")) ? mixin.constructor : function() {
                return baseClass.apply(this, arguments);
            };

            var ProxyProto = function() {
                this.constructor = VisualElement;
            };
            ProxyProto.prototype = baseClass.prototype;
            VisualElement.prototype = new ProxyProto();

            VisualElement.extend = derive;

            if (mixin) amalgamate(VisualElement.prototype, mixin);

            VisualElement.__super__ = baseClass.prototype;

            return VisualElement;
        },
        doNothing = utilities.doNothing = function() {},
        uniqueIdGen = utilities.uniqueIdGen = (function() {
            var counter = 0;
            return function() {
                return "plot-" + counter++;
            };
        })(),
        notifyProblem = utilities.notifyProblem = function(messageText) {
            // Method for informing about errors
            if (window.console && typeof window.console.warn == "function") console.warn(messageText);
        },
        isAmdModule = utilities.isAmdModule = (typeof define == 'function' && define.amd),
        // -- Mathematical methods
        checkNumeric = utilities.checkNumeric = function(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        },
        getMaximum = utilities.getMaximum = function(dataArray) {
            return Math.max.apply(Math, dataArray);
        },
        getMinimum = utilities.getMinimum = function(dataArray) {
            return Math.min.apply(Math, dataArray);
        },
        constrainValue = utilities.constrainValue = function(inputVal, upperLimit, lowerLimit) {
            if (checkNumeric(upperLimit)) {
                if (inputVal > upperLimit) {
                    return upperLimit;
                }
            } else if (checkNumeric(lowerLimit)) {
                if (inputVal < lowerLimit) {
                    return lowerLimit;
                }
            }
            return inputVal;
        },
        countDecimals = utilities.countDecimals = function(inputNumber) {
            if (inputNumber % 1 !== 0 && checkNumeric(inputNumber)) {
                return inputNumber.toString().split(".")[1].length;
            } else {
                return 0;
            }
        },
        degreesToRadians = utilities.degreesToRadians = function(angleInDegrees) {
            return angleInDegrees * (Math.PI / 180);
        },
        // Retrieves the angle from the vertical upright to a point relative to a center.
        calculateAngleAndDistance = utilities.calculateAngleAndDistance = function(originPoint, targetPoint) {
            var deltaX = targetPoint.x - originPoint.x,
                deltaY = targetPoint.y - originPoint.y,
                radialDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);


            var angle = Math.PI * 2 + Math.atan2(deltaY, deltaX);

            // If the segment is in the top-left quadrant, an additional rotation is needed
            if (deltaX < 0 && deltaY < 0) {
                angle += Math.PI * 2;
            }

            return {
                angle: angle,
                distance: radialDistance
            };
        },
        adjustPixelOffset = utilities.adjustPixelOffset = function(inputPixelWidth) {
            return (inputPixelWidth % 2 === 0) ? 0 : 0.5;
        },
        bezierControlPoints = utilities.bezierControlPoints = function(startNode, midNode, endNode, tensionFactor) {
            // Thanks to Rob Spencer at scaled innovation for his post on splining between points
            // http://scaledinnovation.com/analytics/splines/aboutSplines.html
            var dist01 = Math.sqrt(Math.pow(midNode.x - startNode.x, 2) + Math.pow(midNode.y - startNode.y, 2)),
                dist12 = Math.sqrt(Math.pow(endNode.x - midNode.x, 2) + Math.pow(endNode.y - midNode.y, 2)),
                factorA = tensionFactor * dist01 / (dist01 + dist12), // scaling factor for triangle Ta
                factorB = tensionFactor * dist12 / (dist01 + dist12);
            return {
                inner: {
                    x: midNode.x - factorA * (endNode.x - startNode.x),
                    y: midNode.y - factorA * (endNode.y - startNode.y)
                },
                outer: {
                    x: midNode.x + factorB * (endNode.x - startNode.x),
                    y: midNode.y + factorB * (endNode.y - startNode.y)
                }
            };
        },
        determineMagnitudeOrder = utilities.determineMagnitudeOrder = function(inputValue) {
            return Math.floor(Math.log(inputValue) / Math.LN10);
        },
        computeAxisRange = utilities.computeAxisRange = function(dataValues, renderSpace, labelHeight, beginAtZero, onlyWholeNumbers) {

            // Establish a minimum of two divisions - one at the top, one at the bottom
            var minimumDivisions = 2,
                maximumDivisions = Math.floor(renderSpace / (labelHeight * 1.5)),
                bypassFitting = (minimumDivisions >= maximumDivisions);

            var peakValue = getMaximum(dataValues),
                baseValue = getMinimum(dataValues);

            // We need some separation here to calculate the axis if all values are identical
            // Adding/subtracting 0.5 will yield a range of 1.
            if (peakValue === baseValue) {
                peakValue += 0.5;
                // To avoid a negative starting value if 'beginAtZero' is false and baseValue is already >= 0.5
                if (baseValue >= 0.5 && !beginAtZero) {
                    baseValue -= 0.5;
                } else {
                    // Otherwise, ensure a whole number above the values
                    peakValue += 0.5;
                }
            }

            var totalRange = Math.abs(peakValue - baseValue),
                rangeMagnitude = determineMagnitudeOrder(totalRange),
                plotUpper = Math.ceil(peakValue / (1 * Math.pow(10, rangeMagnitude))) * Math.pow(10, rangeMagnitude),
                plotLower = (beginAtZero) ? 0 : Math.floor(baseValue / (1 * Math.pow(10, rangeMagnitude))) * Math.pow(10, rangeMagnitude),
                plotExtent = plotUpper - plotLower,
                incrementSize = Math.pow(10, rangeMagnitude),
                divisionCount = Math.round(plotExtent / incrementSize);

            // If there's more space on the visualizer, utilize it for more data definition
            while ((divisionCount > maximumDivisions || (divisionCount * 2) < maximumDivisions) && !bypassFitting) {
                if (divisionCount > maximumDivisions) {
                    incrementSize *= 2;
                    divisionCount = Math.round(plotExtent / incrementSize);
                    // Avoid decimal division counts - stop fitting and use minimum divisions.
                    if (divisionCount % 1 !== 0) {
                        bypassFitting = true;
                    }
                }
                // We can accommodate double the axis points
                else {
                    // If user specified whole numbers only, and the increment is not a decimal
                    if (onlyWholeNumbers && rangeMagnitude >= 0) {
                        // Check if making the axis more granular would result in floats
                        if (incrementSize / 2 % 1 === 0) {
                            incrementSize /= 2;
                            divisionCount = Math.round(plotExtent / incrementSize);
                        }
                        // If it would become a float, exit the loop
                        else {
                            break;
                        }
                    }
                    // If the axis doesn't have to be integers, make it more granular anyway.
                    else {
                        incrementSize /= 2;
                        divisionCount = Math.round(plotExtent / incrementSize);
                    }

                }
            }

            if (bypassFitting) {
                divisionCount = minimumDivisions;
                incrementSize = plotExtent / divisionCount;
            }

            return {
                steps: divisionCount,
                stepValue: incrementSize,
                min: plotLower,
                max: plotLower + (divisionCount * incrementSize)
            };

        },
        /* jshint ignore:start */
        // Ignores JSHint errors due to the new Function constructor
        // Templating methods
        // JavaScript micro-templating by John Resig - source at http://ejohn.org/blog/javascript-micro-templating/
        renderTemplate = utilities.renderTemplate = function(formatString, dataObject) {

            // If formatString is a function instead of a string-template - invoke the function with dataObject

            if (formatString instanceof Function) {
                return formatString(dataObject);
            }

            var templateCache = {};

            function processTemplate(templateSource, templateData) {
                // Determine if we're getting a template, or if we need to
                // load it - and ensure the result is cached.
                var fn = !/\W/.test(templateSource) ?
                    templateCache[templateSource] = templateCache[templateSource] :

                    // Create a reusable function that will act as a template
                    // generator (and will be cached).
                    new Function("obj",
                        "var p=[],print=function(){p.push.apply(p,arguments);};" +

                        // Introduce the data as local variables using with(){}
                        "with(obj){p.push('" +

                        // Convert the template into pure JavaScript
                        templateSource
                        .replace(/[\r\t\n]/g, " ")
                        .split("<%").join("\t")
                        .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                        .replace(/\t=(.*?)%>/g, "',$1,'")
                        .split("\t").join("');")
                        .split("%>").join("p.push('")
                        .split("\r").join("\\'") +
                        "');}return p.join('');"
                    );

                // Offer basic currying to the user
                return templateData ? fn(templateData) : fn;
            }
            return processTemplate(formatString, dataObject);
        },
        /* jshint ignore:end */
        createAxisLabels = utilities.createAxisLabels = function(markTemplateString, divisionCount, plotLower, incrementSize) {
            var labelsArray = new Array(divisionCount);
            if (markTemplateString) {
                iterateOver(labelsArray, function(val, index) {
                    labelsArray[index] = renderTemplate(markTemplateString, {
                        value: (plotLower + (incrementSize * (index + 1)))
                    });
                });
            }
            return labelsArray;
        },
        // -- Animation methods
        // Easing functions adapted from Robert Penner's easing equations
        // http://www.robertpenner.com/easing/
        motionCurves = utilities.motionCurves = {
            linear: function(t) {