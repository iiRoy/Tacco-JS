class DisplaySurfaceFactory {
    static buildSurface(surfaceConfig) {
        const visualElement = document.createElement("canvas");
        visualElement.width = surfaceConfig.surfaceWidth;
        visualElement.height = surfaceConfig.surfaceHeight;
        Object.assign(visualElement.style, {
            backgroundColor: surfaceConfig.backgroundColorValue,
            display: 'block',
            margin: '0 auto'
        });
        document.body.insertBefore(visualElement, document.body.firstChild);
        return visualElement;
    }
}

function getBoundedInteger(lowerBound, upperBoundExclusive) {
    return Math.floor(Math.random() * (upperBoundExclusive - lowerBound)) + lowerBound;
}

function createVector(minX, maxX, minY, maxY) {
    return [
        getBoundedInteger(minX, maxX),
        getBoundedInteger(minY, maxY)
    ];
}

function renderSpot(renderContext, horizontalPos, verticalPos, tint) {
    renderContext.beginPath();
    if (tint) {
        renderContext.fillStyle = tint;
    }
    renderContext.arc(horizontalPos, verticalPos, 2, 0, Math.PI * 2);
    renderContext.fill();
}

function traceSegment(renderContext, startX, startY, endX, endY) {
    const segmentPath = new Path2D();
    segmentPath.moveTo(startX, startY);
    segmentPath.lineTo(endX, endY);
    renderContext.stroke(segmentPath);
}

const PointAnnotationType = {
    START_POINT: 'start_point',
    CONTROL_POINT: 'control_point',
    CENTER_POINT: 'center_point',
    END_POINT: 'end_point'
};

const annotationDetails = new Map([
    [PointAnnotationType.START_POINT, { color: "rgb(255,0,0)", labelFactory: () => "S" }],
    [PointAnnotationType.CONTROL_POINT, { color: "rgb(0,0,255)", labelFactory: (idx) => String(idx) }],
    [PointAnnotationType.CENTER_POINT, { color: "rgb(0,0,255)", labelFactory: () => "C" }],
    [PointAnnotationType.END_POINT, { color: "rgb(0,255,0)", labelFactory: () => "E" }]
]);

function annotatePoint(renderContext, horizontalPos, verticalPos, annotationType, identifier = '') {
    const details = annotationDetails.get(annotationType);
    if (!details) return;

    renderContext.fillStyle = details.color;
    renderSpot(renderContext, horizontalPos, verticalPos, renderContext.fillStyle);

    renderContext.font = "14px 'Segoe UI'";
    renderContext.fillStyle = "#000000";
    const actualLabel = details.labelFactory(identifier);
    renderContext.fillText(actualLabel, horizontalPos + 5, verticalPos);
}

const connectionColors = new Map([
    [1, "rgba(255,0,0,0.4)"],
    [2, "rgba(0,0,255,0.4)"],
    [3, "rgba(0,255,0,0.4)"]
]);

function illustrateConnection(renderContext, startX, startY, endX, endY, connectionIndex) {
    const connectionTint = connectionColors.get(connectionIndex);

    renderContext.lineWidth = 1;
    if (connectionTint) {
        renderContext.strokeStyle = connectionTint;
    }
    traceSegment(renderContext, startX, startY, endX, endY);
}

function visualizeEnclosure(renderContext, boundsProvider, parameters) {
    const boundary = boundsProvider.computeRegion(parameters);
    renderContext.lineWidth = 1;
    renderContext.strokeStyle = "rgb(255,0,0)";

    const rectPath = new Path2D();
    rectPath.rect(boundary.xCoord, boundary.yCoord, boundary.spanWidth, boundary.spanHeight);
    renderContext.stroke(rectPath);
}

class PathCollector {
    constructor() {
        this.recordedCommands = [];
    }
    initiate(xVal, yVal) { this.recordedCommands.push({ type: 'move_to', x: xVal, y: yVal }); }
    drawSegment(xVal, yVal) { this.recordedCommands.push({ type: 'line_to', x: xVal, y: yVal }); }
    drawQuadratic(cpX, cpY, xVal, yVal) { this.recordedCommands.push({ type: 'quadratic_bezier', controlX: cpX, controlY: cpY, endX: xVal, endY: yVal }); }
    drawCubic(cp1X, cp1Y, cp2X, cp2Y, xVal, yVal) { this.recordedCommands.push({ type: 'cubic_bezier', control1X: cp1X, control1Y: cp1Y, control2X: cp2X, control2Y: cp2Y, endX: xVal, endY: yVal }); }
    
    computeRegion(params) {
        // This is a mock implementation for the Type IV clone.
        // In a real scenario, this would calculate the actual bounding box
        // based on the recordedCommands.
        return { xCoord: 0, yCoord: 0, spanWidth: 100, spanHeight: 100 };
    }
}

class QuadraticBezierGenerator {
    static #evaluateCoordinateAtTime(coordA, coordB, coordC, timeParam) {
        const oneMinusT = 1 - timeParam;
        return (coordA * Math.pow(oneMinusT, 2)) + (2 * coordB * oneMinusT * timeParam) + (coordC * Math.pow(timeParam, 2));
    }

    static calculateExtrema(p1x, p2x, p3x, p1y, p2y, p3y) {
        const extremaX_t = (p1x - p2x) / (p1x - 2 * p2x + p3x);
        const extremaX = {
            time: extremaX_t,
            coordX: QuadraticBezierGenerator.#evaluateCoordinateAtTime(p1x, p2x, p3x, extremaX_t),
            coordY: QuadraticBezierGenerator.#evaluateCoordinateAtTime(p1y, p2y, p3y, extremaX_t)
        };

        const extremaY_t = (p1y - p2y) / (p1y - 2 * p2y + p3y);
        const extremaY = {
            time: extremaY_t,
            coordY: QuadraticBezierGenerator.#evaluateCoordinateAtTime(p1y, p2y, p3y, extremaY_t),
            coordX: QuadraticBezierGenerator.#evaluateCoordinateAtTime(p1x, p2x, p3x, extremaY_t)
        };

        return [extremaX, extremaY];
    }

    static generateParameters(layoutConfiguration) {
        const controlX_val = getBoundedInteger(0, layoutConfiguration.surfaceWidth);
        const controlY_val = getBoundedInteger(0, layoutConfiguration.surfaceHeight);
        const endX_val = getBoundedInteger(0, layoutConfiguration.surfaceWidth);
        const endY_val = getBoundedInteger(0, layoutConfiguration.surfaceHeight);

        return {
            controlX: controlX_val,
            controlY: controlY_val,
            endX: endX_val,
            endY: endY_val
        };
    }
}

class CubicBezierGenerator {
    static #calculateCoordinateAtTime(p0, p1, p2, p3, timeVal) {
        const oneMinusTime = 1 - timeVal;
        return (p0 * oneMinusTime * oneMinusTime * oneMinusTime) +
               (3 * p1 * timeVal * oneMinusTime * oneMinusTime) +
               (3 * p2 * oneMinusTime * timeVal * timeVal) +
               (p3 * timeVal * timeVal * timeVal);
    }

    static #solveQuadraticForDerivativeZero(valA, valB, valC, valD) {
        const coeffU = 2 * valA - 4 * valB + 2 * valC;
        const coeffV = valB - valA;
        const coeffW = -valA + 3 * valB + valD - 3 * valC;

        const discriminant = coeffU * coeffU - 4 * coeffV * coeffW;
        if (isNaN(discriminant) || discriminant < 0) {
            return [NaN, NaN];
        }
        const sqrtDiscriminant = Math.sqrt(discriminant);
        
        if (coeffW === 0) {
            if (coeffU === 0) return [NaN, NaN];
            return [-coeffV / coeffU, NaN];
        }

        return [
            (-coeffU + sqrtDiscriminant) / (2 * coeffW),
            (-coeffU - sqrtDiscriminant) / (2 * coeffW)
        ];
    }

    static findExtrema(p1x, p2x, p3x, p4x, p1y, p2y, p3y, p4y) {
        const extremaPoints = [];

        const createExtremumPoint = (timeValue) => ({
            time: timeValue,
            x_coordinate: CubicBezierGenerator.#calculateCoordinateAtTime(p1x, p2x, p3x, p4x, timeValue),
            y_coordinate: CubicBezierGenerator.#calculateCoordinateAtTime(p1y, p2y, p3y, p4y, timeValue)
        });

        const timeValuesX = CubicBezierGenerator.#solveQuadraticForDerivativeZero(p1x, p2x, p3x, p4x);
        for (const t of timeValuesX) {
            if (!isNaN(t) && t >= 0 && t <= 1) {
                extremaPoints.push(createExtremumPoint(t));
            }
        }

        const timeValuesY = CubicBezierGenerator.#solveQuadraticForDerivativeZero(p1y, p2y, p3y, p4y);
        for (const t of timeValuesY) {
            if (!isNaN(t) && t >= 0 && t <= 1) {
                extremaPoints.push(createExtremumPoint(t));
            }
        }

        return extremaPoints;
    }

    static generateParameters(layoutConfiguration) {
        const control1X_val = getBoundedInteger(0, layoutConfiguration.surfaceWidth);
        const control1Y_val = getBoundedInteger(0, layoutConfiguration.surfaceHeight);
        const control2X_val = getBoundedInteger(0, layoutConfiguration.surfaceWidth);
        const control2Y_val = getBoundedInteger(0, layoutConfiguration.surfaceHeight);
        const endX_val = getBoundedInteger(0, layoutConfiguration.surfaceWidth);
        const endY_val = getBoundedInteger(0, layoutConfiguration.surfaceHeight);

        return {
            control1X: control1X_val,
            control1Y: control1Y_val,
            control2X: control2X_val,
            control2Y: control2Y_val,
            endX: endX_val,
            endY: endY_val
        };
    }
}

class ArcTangentGenerator {
    static produceRandomParameters(layoutConfiguration) {
        const controlX_val = getBoundedInteger(0, layoutConfiguration.surfaceWidth);
        const controlY_val = getBoundedInteger(0, layoutConfiguration.surfaceHeight);
        const endpointX_val = getBoundedInteger(0, layoutConfiguration.surfaceWidth);
        const endpointY_val = getBoundedInteger(0, layoutConfiguration.surfaceHeight);

        const radiusValue = Math.max(10, getBoundedInteger(0, 51));

        return {
            controlPointX: controlX_val,
            controlPointY: controlY_val,
            endPointX: endpointX_val,
            endPointY: endpointY_val,
            radius: radiusValue
        };
    }
}

class CircularArcGenerator {
    static createRandomArcData(layoutConfiguration) {
        const centerX_val = getBoundedInteger(0, layoutConfiguration.surfaceWidth);
        const centerY_val = getBoundedInteger(0, layoutConfiguration.surfaceHeight);

        const remainingSpace = Math.min(
            Math.min(centerX_val, Math.max(0, layoutConfiguration.surfaceWidth - centerX_val)),
            Math.min(centerY_val, Math.max(0, layoutConfiguration.surfaceHeight - centerY_val))
        );
        const arcRadius = Math.max(10, getBoundedInteger(0, remainingSpace + 1));

        const fullCircleFloat = Math.PI * 2;
        const startAngleRadians = getBoundedInteger(0, Math.ceil(fullCircleFloat));
        const endAngleRadians = getBoundedInteger(0, Math.ceil(fullCircleFloat));
        const counterClockwiseDirection = getBoundedInteger(0, 2) === 0;

        return {
            centerX: centerX_val,
            centerY: centerY_val,
            arcRadius: arcRadius,
            startAngle: startAngleRadians,
            endAngle: endAngleRadians,
            isCounterClockwise: counterClockwiseDirection
        };
    }
}

class ComplexPathGenerator {
    static produceRandomPath(layoutConfiguration) {
        const pathDataCollector = new PathCollector();
        const startVector = createVector(0, layoutConfiguration.surfaceWidth, 0, layoutConfiguration.surfaceHeight);
        pathDataCollector.initiate(startVector[0], startVector[1]);

        const segmentCount = getBoundedInteger(3, 8);
        
        const segmentFactories = new Map([
            [0, (collector, config) => {
                const quadParams = QuadraticBezierGenerator.generateParameters(config);
                collector.drawQuadratic(quadParams.controlX, quadParams.controlY, quadParams.endX, quadParams.endY);
            }],
            [1, (collector, config) => {
                const cubicParams = CubicBezierGenerator.generateParameters(config);
                collector.drawCubic(cubicParams.control1X, cubicParams.control1Y, cubicParams.control2X, cubicParams.control2Y, cubicParams.endX, cubicParams.endY);
            }],
            [2, (collector, config) => {
                const lineEnd = createVector(0, config.surfaceWidth, 0, config.surfaceHeight);
                collector.drawSegment(lineEnd[0], lineEnd[1]);
            }]
        ]);

        for (let i = 0; i < segmentCount; i++) {
            const choice = getBoundedInteger(0, 3);
            const factory = segmentFactories.get(choice);
            if (factory) {
                factory(pathDataCollector, layoutConfiguration);
            }
        }
        return pathDataCollector;
    }
}

class LineStyleFactory {
    static createRandomLineAttributes() {
        return {
            thicknessValue: getBoundedInteger(1, 36),
            joinStyle: getBoundedInteger(0, 3),
            startCapStyle: getBoundedInteger(0, 3),
            endCapStyle: getBoundedInteger(0, 3),
            limitMiter: 10
        };
    }
}

class DrawingStyleApplier {
    static #capStyles = new Map([
        [0, "butt"],
        [1, "square"],
        [2, "round"],
        [3, "butt"]
    ]);
    static #joinStyles = new Map([
        [0, "miter"],
        [1, "bevel"],
        [2, "round"]
    ]);

    static applyPathStyling(renderContext, strokeColor, styleAttributes) {
        if (!strokeColor || !styleAttributes) return;
        renderContext.lineWidth = styleAttributes.thicknessValue;
        renderContext.lineCap = DrawingStyleApplier.#capStyles.get(styleAttributes.startCapStyle) || DrawingStyleApplier.#capStyles.get(0);
        renderContext.lineJoin = DrawingStyleApplier.#joinStyles.get(styleAttributes.joinStyle) || DrawingStyleApplier.#joinStyles.get(0);
        renderContext.miterLimit = styleAttributes.limitMiter;
        renderContext.strokeStyle = strokeColor;
        renderContext.stroke();
    }

    static formatStyleAttributes(styleAttributes) {
        if (!styleAttributes) return "line_thickness: 0";
        const thickness = styleAttributes.thicknessValue;
        const startCap = DrawingStyleApplier.#capStyles.get(styleAttributes.startCapStyle) || DrawingStyleApplier.#capStyles.get(0);
        const endCap = DrawingStyleApplier.#capStyles.get(styleAttributes.endCapStyle) || DrawingStyleApplier.#capStyles.get(0);
        const join = DrawingStyleApplier.#joinStyles.get(styleAttributes.joinStyle) || DrawingStyleApplier.#joinStyles.get(0);
        const limit = styleAttributes.limitMiter;

        return `line_thickness: ${thickness}; begin_cap: ${startCap}; end_cap: ${endCap}; line_join: ${join}; miter_limit: ${limit}`;
    }
}