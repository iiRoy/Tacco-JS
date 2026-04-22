/**
 * This file provides utility functions for drawing on a canvas
 * and generating various bezier curves and arcs.
 */

/**
 * Initializes and appends a new canvas element to the document body.
 * @param {object} settings - Configuration for the canvas.
 * @returns {HTMLCanvasElement} The newly created canvas element.
 */
function createDrawingSurface( settings ) {
    let drawingElement = document.createElement("canvas"); // Create a new canvas element
    drawingElement.width = settings.widthValue;
    drawingElement.height = settings.heightValue;
    drawingElement.style.backgroundColor = settings.bgColorValue; // Set background color
    document.body.appendChild(drawingElement);
    return drawingElement;
}


/**
 * Renders a small square dot on the canvas.
 * @param {CanvasRenderingContext2D} graphicContext - The 2D rendering context.
 * @param {number} coordX - X-coordinate of the dot's center.
 * @param {number} coordY - Y-coordinate of the dot's center.
 * @param {string} [dotColor] - Optional color for the dot.
 */
function renderDot( graphicContext, coordX, coordY, dotColor ) {
    graphicContext.beginPath(); // Start a new path for the dot
    if (dotColor) {
        graphicContext.fillStyle = dotColor;
    }
    graphicContext.fillRect(coordX - 2, coordY - 2, 4, 4); // Draw a 4x4 square centered at (coordX, coordY)
}

/**
 * Draws a straight line segment on the canvas.
 * @param {CanvasRenderingContext2D} graphicContext - The 2D rendering context.
 * @param {number} startX - X-coordinate of the starting point.
 * @param {number} startY - Y-coordinate of the starting point.
 * @param {number} endX - X-coordinate of the ending point.
 * @param {number} endY - Y-coordinate of the ending point.
 */
function renderLineSegment( graphicContext, startX, startY, endX, endY ) {
    graphicContext.beginPath(); // Begin a new path
    graphicContext.moveTo(startX, startY);
    graphicContext.lineTo(endX, endY);
    graphicContext.stroke(); // Render the line outline
}

/**
 * Marks the starting point of a path with a red dot and 'S' label.
 * @param {CanvasRenderingContext2D} renderContext - The 2D rendering context.
 * @param {number} posH - Horizontal position.
 * @param {number} posV - Vertical position.
 */
function markOriginPoint( renderContext, posH, posV ) {
    renderContext.fillStyle = "#FF0000"; // Red color for start
    renderDot(renderContext, posH, posV); // Draw the point

    renderContext.font = "16px Arial"; // Different font style and size
    renderContext.fillStyle = "#000000"; // Black text
    renderContext.fillText("S", posH + 5, posV); // Label the point
}

/**
 * Marks an intermediate control point with a blue dot and a number label.
 * @param {CanvasRenderingContext2D} renderContext - The 2D rendering context.
 * @param {number} posH - Horizontal position.
 * @param {number} posV - Vertical position.
 * @param {number} indexVal - Numerical label for the control point.
 */
function markIntermediatePoint( renderContext, posH, posV, indexVal ) {
    renderContext.fillStyle = "#0000FF"; // Blue color for control points
    renderDot(renderContext, posH, posV);

    renderContext.font = "16px Arial";
    renderContext.fillStyle = "#000000";
    renderContext.fillText(indexVal, posH + 5, posV);
}

/**
 * Marks a center point with a blue dot and 'C' label.
 * @param {CanvasRenderingContext2D} renderContext - The 2D rendering context.
 * @param {number} posH - Horizontal position.
 * @param {number} posV - Vertical position.
 */
function markMidPoint( renderContext, posH, posV ) {
    renderContext.fillStyle = "blue"; // Using named color for variation
    renderDot(renderContext, posH, posV);

    renderContext.font = "16px Arial";
    renderContext.fillStyle = "black";
    renderContext.fillText("C", posH + 5, posV);
}

/**
 * Marks the ending point of a path with a green dot and 'E' label.
 * @param {CanvasRenderingContext2D} renderContext - The 2D rendering context.
 * @param {number} posH - Horizontal position.
 * @param {number} posV - Vertical position.
 */
function markDestinationPoint( renderContext, posH, posV ) {
    renderContext.fillStyle = "green"; // Using named color for variation
    renderDot(renderContext, posH, posV);

    renderContext.font = "16px Arial";
    renderContext.fillStyle = "black";
    renderContext.fillText("E", posH + 5, posV);
}

/**
 * Draws an auxiliary guide line between two points with a specific color.
 * @param {CanvasRenderingContext2D} renderContext - The 2D rendering context.
 * @param {number} startX - X-coordinate of the first point.
 * @param {number} startY - Y-coordinate of the first point.
 * @param {number} endX - X-coordinate of the second point.
 * @param {number} endY - Y-coordinate of the second point.
 * @param {number} indexVal - Index to determine the line color.
 */
function renderAuxiliaryLine( renderContext, startX, startY, endX, endY, indexVal ) {
    const lineColors = [
        "hsla(0, 100%, 50%, 0.4)",   // Red with alpha
        "hsla(240, 100%, 50%, 0.4)", // Blue with alpha
        "hsla(120, 100%, 50%, 0.4)"  // Green with alpha
    ];
    let lineColor = lineColors[indexVal - 1]; // Select color based on index

    renderContext.lineWidth = 1;
    if (lineColor) {
        renderContext.strokeStyle = lineColor;
    }
    renderLineSegment(renderContext, startX, startY, endX, endY); // Use the generic line drawing function
}

/**
 * Draws a bounding box around a given path.
 * Assumes 'ctx' is available in the global scope or passed implicitly.
 * @param {object} shapePath - The path object with a CalculateBounds method.
 * @param {object} parameters - Parameters for bounding box calculation.
 */
function visualizeBoundaryBox( shapePath, parameters ) {
    let boundaryRect = shapePath.CalculateBounds(parameters); // Calculate the path's rectangular bounds
    ctx.lineWidth = 1;
    ctx.strokeStyle = "red"; // Bounding box color
    ctx.strokeRect(boundaryRect.X, boundaryRect.Y, boundaryRect.Width, boundaryRect.Height); // Draw the rectangle
}

/**
 * Generates a random integer within a specified range (inclusive of low, exclusive of high).
 * @param {number} lowerBound - The minimum possible integer.
 * @param {number} upperBound - The maximum possible integer (exclusive).
 * @returns {number} A random integer.
 */
function getRandomInteger( lowerBound, upperBound ) {
    return Math.floor(Math.random() * (upperBound - lowerBound) + lowerBound);
}

/**
 * Creates a random 2D coordinate point within given X and Y ranges.
 * @param {number} minX - Minimum X-coordinate.
 * @param {number} maxX - Maximum X-coordinate (exclusive).
 * @param {number} minY - Minimum Y-coordinate.
 * @param {number} maxY - Maximum Y-coordinate (exclusive).
 * @returns {object} An object with 'x' and 'y' properties.
 */
function createRandomCoordinate( minX, maxX, minY, maxY ) {
    return {
        coordX: getRandomInteger(minX, maxX), // Random X value
        coordY: getRandomInteger(minY, maxY)  // Random Y value
    };
}


const compositePathModule = (function () {
    /**
     * Appends a random segment (Quadratic Bezier, Cubic Bezier, or Line) to the path.
     * @param {object} currentPath - The path object to modify.
     * @param {object} appSettings - Configuration settings for point generation.
     */
    function generatePathSegment( currentPath, appSettings ) {
        const segmentType = getRandomInteger(0, 3); // Randomly choose segment type (0, 1, or 2)
        switch (segmentType) {
            case 0: {
                // Add a quadratic bezier curve
                let quadraticBezierSegment = quadraticCurveTool.generate(appSettings);
                currentPath.QuadraticBezier(
                    quadraticBezierSegment.controlX,
                    quadraticBezierSegment.controlY,
                    quadraticBezierSegment.endPointX,
                    quadraticBezierSegment.endPointY
                );
                break;
            }
            case 1: {
                // Add a cubic bezier curve
                let cubicBezierSegment = cubicCurveUtility.generate(appSettings);
                currentPath.CubicBezier(
                    cubicBezierSegment.control1X,
                    cubicBezierSegment.control1Y,
                    cubicBezierSegment.control2X,
                    cubicBezierSegment.control2Y,
                    cubicBezierSegment.endX,
                    cubicBezierSegment.endY
                );
                break;
            }
            case 2: {
                // Add a straight line segment
                let lineSegment = createRandomCoordinate(0, appSettings.widthValue, 0, appSettings.heightValue);
                currentPath.Line(lineSegment.coordX, lineSegment.coordY);
                break;
            }
        }
    }

    return {
        /**
         * Generates a random multi-segment path.
         * @param {object} appSettings - Configuration settings for path generation.
         * @returns {object} A new Fayde.Path.RawPath object.
         */
        generate: function ( appSettings ) {
            // Assuming Fayde.Path.RawPath is available globally
            let resultPath = new Fayde.Path.RawPath();
            let startPoint = createRandomCoordinate(0, appSettings.widthValue, 0, appSettings.heightValue);
            resultPath.Move(startPoint.coordX, startPoint.coordY); // Move to the initial point

            let segmentCount = getRandomInteger(3, 7); // Number of segments for the path
            for (let iterator = 0; iterator < segmentCount; iterator++) {
                generatePathSegment(resultPath, appSettings);
            }

            return resultPath;
        }
    };
})();

const quadraticCurveTool = (function () {
    /**
     * Calculates the extrema (points where dx/dt or dy/dt is zero) for a quadratic bezier curve.
     * @param {number} p1x - X-coordinate of the start point.
     * @param {number} p2x - X-coordinate of the control point.
     * @param {number} p3x - X-coordinate of the end point.
     * @param {number} p1y - Y-coordinate of the start point.
     * @param {number} p2y - Y-coordinate of the control point.
     * @param {number} p3y - Y-coordinate of the end point.
     * @returns {Array<object>} An array containing two potential extrema points.
     */
    function findCurveExtrema( p1x, p2x, p3x, p1y, p2y, p3y ) {
        // Calculate extrema for x-direction
        const extremePoint1 = {
            parametricT: (p1x - p2x) / (p1x - 2 * p2x + p3x),
            coordX: 0,
            coordY: 0
        };
        extremePoint1.coordX = computeCoordinateAtT(p1x, p2x, p3x, extremePoint1.parametricT);
        extremePoint1.coordY = computeCoordinateAtT(p1y, p2y, p3y, extremePoint1.parametricT);

        // Calculate extrema for y-direction
        const extremePoint2 = {
            parametricT: (p1y - p2y) / (p1y - 2 * p2y + p3y),
            coordX: 0,
            coordY: 0
        };
        extremePoint2.coordY = computeCoordinateAtT(p1y, p2y, p3y, extremePoint2.parametricT);
        extremePoint2.coordX = computeCoordinateAtT(p1x, p2x, p3x, extremePoint2.parametricT);

        return [extremePoint1, extremePoint2];
    }

    /**
     * Computes the coordinate value (x or y) at a given parametric 't' for a quadratic bezier.
     * x(t) = a(1-t)^2 + 2*b(1-t)t + c*t^2
     * @param {number} a - Start coordinate.
     * @param {number} b - Control coordinate.
     * @param {number} c - End coordinate.
     * @param {number} parametricT - The parametric value (0 to 1).
     * @returns {number} The coordinate value at 't'.
     */
    function computeCoordinateAtT( a, b, c, parametricT ) {
        // This function calculates the coordinate at a specific 't' value for a quadratic bezier.
        return (a * Math.pow(1 - parametricT, 2)) + (2 * b * (1 - parametricT) * parametricT) + (c * Math.pow(parametricT, 2));
    }

    return {
        /**
         * Generates random control and end points for a quadratic bezier curve.
         * @param {object} appSettings - Configuration containing canvas dimensions.
         * @returns {object} An object with control and end point coordinates.
         */
        generate: function ( appSettings ) {
            let controlX = getRandomInteger(0, appSettings.widthValue);
            let controlY = getRandomInteger(0, appSettings.heightValue);
            let finalX = getRandomInteger(0, appSettings.widthValue);
            let finalY = getRandomInteger(0, appSettings.heightValue);

            return {
                controlX: controlX,
                controlY: controlY,
                endPointX: finalX,
                endPointY: finalY
            };
        },
        extrema: findCurveExtrema // Expose the extrema calculation function
    };
})();

const cubicCurveUtility = (function () {
    /**
     * Determines the extrema (points of horizontal/vertical tangency) for a cubic bezier curve.
     * @param {number} pointAx - X-coordinate of the first point.
     * @param {number} pointBx - X-coordinate of the first control point.
     * @param {number} pointCx - X-coordinate of the second control point.
     * @param {number} pointDx - X-coordinate of the fourth point.
     * @param {number} pointAy - Y-coordinate of the first point.
     * @param {number} pointBy - Y-coordinate of the first control point.
     * @param {number} pointCy - Y-coordinate of the second control point.
     * @param {number} pointDy - Y-coordinate of the fourth point.
     * @returns {Array<object>} An array of up to 4 potential extrema points.
     */
    function determineCurveExtrema( pointAx, pointBx, pointCx, pointDx, pointAy, pointBy, pointCy, pointDy ) {
        /**
         * Calculates the X-coordinate at a given parametric 't' for a cubic bezier.
         * @param {number} t - Parametric value (0 to 1).
         * @returns {number} The X-coordinate.
         */
        function xAtParamT( t ) {
            const oneMinusT = 1 - t;
            return (pointAx * oneMinusT * oneMinusT * oneMinusT) +
                   (3 * pointBx * t * oneMinusT * oneMinusT) +
                   (3 * pointCx * oneMinusT * t * t) +
                   (pointDx * t * t * t);
        }

        /**
         * Calculates the Y-coordinate at a given parametric 't' for a cubic bezier.
         * @param {number} t - Parametric value (0 to 1).
         * @returns {number} The Y-coordinate.
         */
        function yAtParamT( t ) {
            const oneMinusT = 1 - t;
            return (pointAy * oneMinusT * oneMinusT * oneMinusT) +
                   (3 * pointBy * t * oneMinusT * oneMinusT) +
                   (3 * pointCy * oneMinusT * t * t) +
                   (pointDy * t * t * t);
        }

        /**
         * Creates an extrema point object from a parametric 't' value.
         * @param {number} tValue - The parametric 't' value.
         * @returns {object} An object containing t, x, and y coordinates.
         */
        function makeExtremePoint( tValue ) {
            return {
                parametricT: tValue,
                coordX: xAtParamT(tValue),
                coordY: yAtParamT(tValue)
            };
        }

        const extremaArray = [{}, {}, {}, {}]; // Array to hold up to 4 extrema

        // Find t-values where dx/dt = 0
        const tValuesForX = derivativeZeroPoints(pointAx, pointBx, pointCx, pointDx);
        if (tValuesForX[0] >= 0 && tValuesForX[0] <= 1) {
            extremaArray[0] = makeExtremePoint(tValuesForX[0]);
        }
        if (tValuesForX[1] >= 0 && tValuesForX[1] <= 1) {
            extremaArray[1] = makeExtremePoint(tValuesForX[1]);
        }

        // Find t-values where dy/dt = 0
        const tValuesForY = derivativeZeroPoints(pointAy, pointBy, pointCy, pointDy);
        if (tValuesForY[0] >= 0 && tValuesForY[0] <= 1) {
            extremaArray[2] = makeExtremePoint(tValuesForY[0]);
        }
        if (tValuesForY[1] >= 0 && tValuesForY[1] <= 1) {
            extremaArray[3] = makeExtremePoint(tValuesForY[1]);
        }

        return extremaArray;
    }

    /**
     * Solves for 't' values where the first derivative of a cubic bezier component is zero.
     * This corresponds to finding the roots of a quadratic equation.
     * @param {number} p1 - First coordinate.
     * @param {number} p2 - Second coordinate.
     * @param {number} p3 - Third coordinate.
     * @param {number} p4 - Fourth coordinate.
     * @returns {Array<number>} An array of two 't' values.
     */
    function derivativeZeroPoints( p1, p2, p3, p4 ) {
        const coefA = 2 * p1 - 4 * p2 + 2 * p3;
        const coefB = p2 - p1;
        const coefC = -p1 + 3 * p2 + p4 - 3 * p3;

        const discriminant = coefA * coefA - 4 * coefB * coefC;
        if (isNaN(discriminant) || discriminant < 0) { // Check for NaN and negative discriminant
            return [NaN, NaN];
        }
        const sqrtDiscriminant = Math.sqrt(discriminant);
        const solutions = [
            (-coefA + sqrtDiscriminant) / (2 * coefC),
            (-coefA - sqrtDiscriminant) / (2 * coefC)
        ];
        return solutions;
    }

    return {
        /**
         * Generates random control points and an end point for a cubic bezier curve.
         * @param {object} appSettings - Configuration containing canvas dimensions.
         * @returns {object} An object with control and end point coordinates.
         */
        generate: function ( appSettings ) {
            let control1X = getRandomInteger(0, appSettings.widthValue);
            let control1Y = getRandomInteger(0, appSettings.heightValue);
            let control2X = getRandomInteger(0, appSettings.widthValue);
            let control2Y = getRandomInteger(0, appSettings.heightValue);
            let endX = getRandomInteger(0, appSettings.widthValue);
            let endY = getRandomInteger(0, appSettings.heightValue);

            return {
                control1X: control1X,
                control1Y: control1Y,
                control2X: control2X,
                control2Y: control2Y,
                endX: endX,
                endY: endY
            };
        },
        extrema: determineCurveExtrema // Expose the extrema calculation function
    };
})();

const arcToModule = (function () {
    return {
        /**
         * Generates random parameters for an arcTo segment.
         * @param {object} appSettings - Configuration containing canvas dimensions.
         * @returns {object} An object with control, end points, and radius.
         */
        generate: function ( appSettings ) {
            let controlX = getRandomInteger(0, appSettings.widthValue);
            let controlY = getRandomInteger(0, appSettings.heightValue);
            let endX = getRandomInteger(0, appSettings.widthValue);
            let endY = getRandomInteger(0, appSettings.heightValue);

            let arcRadius = Math.max(10, getRandomInteger(0, 50)); // Ensure minimum radius

            return {
                controlX: controlX,
                controlY: controlY,
                endX: endX,
                endY: endY,
                arcRadius: arcRadius
            };
        }
    };
})();

const circularArcGenerator = (function () {
    return {
        /**
         * Generates random parameters for a circular arc.
         * @param {object} appSettings - Configuration containing canvas dimensions.
         * @returns {object} An object with center, radius, start/end angles, and direction.
         */
        generate: function ( appSettings ) {
            let centerX = getRandomInteger(0, appSettings.widthValue);
            let centerY = getRandomInteger(0, appSettings.heightValue);

            // Calculate remaining space to ensure arc stays within bounds
            let remainingSpace = Math.min(
                Math.min(centerX, Math.max(0, appSettings.widthValue - centerX)),
                Math.min(centerY, Math.max(0, appSettings.heightValue - centerY))
            );
            let arcRadius = Math.max(10, getRandomInteger(0, remainingSpace)); // Ensure minimum radius

            const fullCircleRadians = Math.PI * 2; // Full circle in radians
            let startRad = getRandomInteger(0, fullCircleRadians);
            let endRad = getRandomInteger(0, fullCircleRadians);
            let antiClockwise = getRandomInteger(0, 2) === 0; // Random boolean for direction

            return {
                centerX: centerX,
                centerY: centerY,
                arcRadius: arcRadius,
                startAngleAlias: startRad,
                endAngleAlias: endRad,
                antiClockwiseAlias: antiClockwise
            };
        }
    };
})();

/*
 * This section defines an interface for line stroke parameters,
 * which is useful for type-checking in TypeScript environments.
 * For JavaScript, it serves as documentation only.
 */
// export interface ILineStrokeParameters {
//     weight: number;
//     jointStyle: Shapes.PenLineJoin;
//     startCapStyle: Shapes.PenLineCap;
//     endCapStyle: Shapes.PenLineCap;
//     miterLimitValue: number;
// }


/**
 * Creates a set of random stroke parameters.
 * @returns {object} An object containing various stroke attributes.
 */
function createRandomLineAttributes() {
    return {
        lineWeight: getRandomInteger(1, 35), // Random thickness
        lineJoinStyle: getRandomInteger(0, 3), // Random join type
        startCapStyle: getRandomInteger(0, 3), // Random start cap
        endCapStyle: getRandomInteger(0, 3), // Random end cap
        miterLimitValue: 10 // Fixed miter limit
    };
}

let outlinePathWithStyle;
let formatLineParameters;
(function () {
    // Defines possible cap styles for line endings
    const capStyles = [
        "butt",    // Flat cap
        "square",  // Square cap
        "round",   // Rounded cap
        "butt"     // Triangle cap (conceptually, often rendered as butt or square)
    ];
    // Defines possible join styles for line segments
    const jointTypes = [
        "miter",
        "bevel",
        "round"
    ];

    /**
     * Applies a stroke to the current path in the drawing context using specified parameters.
     * @param {CanvasRenderingContext2D} drawingContext - The 2D rendering context.
     * @param {string} strokeColorValue - The color to use for the stroke.
     * @param {object} styleParams - An object containing line style parameters.
     */
    outlinePathWithStyle = function ( drawingContext, strokeColorValue, styleParams ) {
        if (!strokeColorValue || !styleParams) return; // Exit if parameters are missing
        drawingContext.lineWidth = styleParams.lineWeight;
        // Use startCap if present, otherwise endCap, else default to first cap style
        drawingContext.lineCap = capStyles[styleParams.startCapStyle || styleParams.endCapStyle || 0] || capStyles[0];
        // Use join style if present, else default to first join type
        drawingContext.lineJoin = jointTypes[styleParams.lineJoinStyle || 0] || jointTypes[0];
        drawingContext.miterLimit = styleParams.miterLimitValue;
        drawingContext.strokeStyle = strokeColorValue;
        drawingContext.stroke(); // Draw the stroke
    };

    /**
     * Converts stroke parameters into a human-readable string format.
     * @param {object} styleParams - An object containing line style parameters.
     * @returns {string} A semicolon-separated string of parameter key-value pairs.
     */
    formatLineParameters = function ( styleParams ) {
        if (!styleParams) return "lineWeight: 0"; // Default string if no parameters
        const lineThicknessValue = styleParams.lineWeight;
        const startCapAlias = capStyles[styleParams.startCapStyle || 0] || capStyles[0];
        const endCapAlias = capStyles[styleParams.endCapStyle || 0] || capStyles[0];
        const joinAlias = jointTypes[styleParams.lineJoinStyle || 0] || jointTypes[0];
        const limitAlias = styleParams.miterLimitValue;
        return [
            ["lineWeight", lineThicknessValue],
            ["startCap", startCapAlias],
            ["endCap", endCapAlias],
            ["joinStyle", joinAlias]
        ].map(function (keyValuePair) { return keyValuePair.join(": "); }).join("; "); // Format and join
    };
})();