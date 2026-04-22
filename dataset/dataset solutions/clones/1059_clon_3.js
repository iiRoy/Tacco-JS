const applicationSettings = {
    inputSource: '/dev/stdin',
    lineSeparator: '\n',
    defaultEncoding: 'utf-8',
    outputPrecision: 8
};

const makeCoordinatePair = (horizontalComponent, verticalComponent) => {
    return {
        x_coord: horizontalComponent,
        y_coord: verticalComponent
    };
};

const acquireInputData = (settings) => {
    try {
        const fileSystem = require('fs');
        const rawContent = fileSystem.readFileSync(settings.inputSource, settings.defaultEncoding);
        const processedLines = rawContent.split(settings.lineSeparator);
        
        if (!processedLines || processedLines.length === 0) {
            console.error("Input processing warning: No data lines were successfully read.");
            return []; 
        }
        return processedLines;
    } catch (error) {
        console.error(`Input acquisition error from ${settings.inputSource}:`, error.message);
        return [];
    }
};

const ANGLE_RADIANS_60 = Math.PI / 3.0;
const COS_60 = Math.cos(ANGLE_RADIANS_60);
const SIN_60 = Math.sin(ANGLE_RADIANS_60);

const generateFractalSegments = (startCoord, endCoord, currentDepth) => {
    if (currentDepth <= 0) {
        return [];
    }

    if (!startCoord || !endCoord || typeof startCoord.x_coord === 'undefined' || typeof endCoord.x_coord === 'undefined') {
        console.warn("Invalid coordinate objects provided to fractal segment generator.");
        return [];
    }

    const deltaX = endCoord.x_coord - startCoord.x_coord;
    const deltaY = endCoord.y_coord - startCoord.y_coord;

    const firstThirdPoint = makeCoordinatePair(
        startCoord.x_coord + deltaX / 3.0,
        startCoord.y_coord + deltaY / 3.0
    );

    const secondThirdPoint = makeCoordinatePair(
        startCoord.x_coord + 2.0 * deltaX / 3.0,
        startCoord.y_coord + 2.0 * deltaY / 3.0
    );

    const segmentVecX = secondThirdPoint.x_coord - firstThirdPoint.x_coord;
    const segmentVecY = secondThirdPoint.y_coord - firstThirdPoint.y_coord;

    const rotatedX = segmentVecX * COS_60 - segmentVecY * SIN_60;
    const rotatedY = segmentVecX * SIN_60 + segmentVecY * COS_60;

    const peakPoint = makeCoordinatePair(
        firstThirdPoint.x_coord + rotatedX,
        firstThirdPoint.y_coord + rotatedY
    );
    
    const resultingPoints = [];

    resultingPoints.push(...generateFractalSegments(startCoord, firstThirdPoint, currentDepth - 1));
    resultingPoints.push(firstThirdPoint);

    resultingPoints.push(...generateFractalSegments(firstThirdPoint, peakPoint, currentDepth - 1));
    resultingPoints.push(peakPoint);

    resultingPoints.push(...generateFractalSegments(peakPoint, secondThirdPoint, currentDepth - 1));
    resultingPoints.push(secondThirdPoint);

    resultingPoints.push(...generateFractalSegments(secondThirdPoint, endCoord, currentDepth - 1));

    return resultingPoints;
};

const constructKochFractal = (iterations) => {
    if (iterations < 0) {
        console.warn("Negative iteration count encountered. Using zero iterations instead.");
        iterations = 0;
    }

    const baseStart = makeCoordinatePair(0.0, 0.0);
    const baseEnd = makeCoordinatePair(100.0, 0.0);

    if (iterations === 0) {
        return [baseStart, baseEnd];
    }

    const intermediateCoords = generateFractalSegments(baseStart, baseEnd, iterations);

    return [
        baseStart,
        ...intermediateCoords,
        baseEnd
    ];
};

(() => {
    const allInputLines = acquireInputData(applicationSettings);
    
    if (allInputLines.length === 0) {
        return;
    }

    const rawIterationCountString = allInputLines[0];
    let effectiveIterationCount = 0;

    try {
        const parsedNumericValue = parseInt(rawIterationCountString, 10);
        if (isNaN(parsedNumericValue)) {
            throw new Error("Input string cannot be converted to a number.");
        }
        effectiveIterationCount = parsedNumericValue;
    } catch (parseError) {
        console.error(`Data parsing failed for iteration count: ${parseError.message}. Defaulting to 0.`);
        effectiveIterationCount = 0;
    }

    const finalKochPoints = constructKochFractal(effectiveIterationCount);

    for (const currentPoint of finalKochPoints) {
        const xFormatted = currentPoint.x_coord.toFixed(applicationSettings.outputPrecision);
        const yFormatted = currentPoint.y_coord.toFixed(applicationSettings.outputPrecision);
        console.log(xFormatted, yFormatted);
    }
})();