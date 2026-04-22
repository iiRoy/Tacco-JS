const makeInputReader = (rawText) => {
    let internalLines = rawText.trim().split("\n");
    let internalLinePointer = 0;

    const retrieveAtom = (asRaw = false) => {
        let lineContents = internalLines[internalLinePointer];
        if (typeof lineContents === "string") {
            internalLines[internalLinePointer] = lineContents.split(" ").reverse();
        }
        let tokensOnLine = internalLines[internalLinePointer];
        let value = tokensOnLine.pop();
        if (tokensOnLine.length === 0) {
            internalLinePointer++;
        }
        return asRaw ? value : Number(value);
    };

    const retrieveRow = (asRaw = false) => {
        let lineContents = internalLines[internalLinePointer].split(" ");
        internalLinePointer++;
        return asRaw ? lineContents : lineContents.map(Number);
    };

    const retrieveBlock = (itemCount, asRaw = false) => {
        const block = internalLines.slice(internalLinePointer, internalLinePointer + itemCount);
        internalLinePointer += itemCount;
        if (asRaw) {
            return block.map(line => line.split(" "));
        }
        return block.map(line => line.split(" ").map(Number));
    };

    const retrieveSegment = (itemCount, asRaw = false) => {
        const segment = internalLines.slice(internalLinePointer, internalLinePointer + itemCount);
        internalLinePointer += itemCount;
        return asRaw ? segment : segment.map(Number);
    };

    return {
        fetchScalar: retrieveAtom,
        fetchRow: retrieveRow,
        fetchBlock: retrieveBlock,
        fetchSegment: retrieveSegment,
    };
};

const createMultiDimensionalArray = (valueProducer, ...dimensions) => {
    const recursiveBuilder = (dims) => {
        if (dims.length === 0) {
            return typeof valueProducer === 'function' ? valueProducer() : valueProducer;
        }
        const currentDimensionSize = dims[0];
        const remainingDimensions = dims.slice(1);
        return Array.from({ length: currentDimensionSize }, () => recursiveBuilder(remainingDimensions));
    };
    return recursiveBuilder(dimensions);
};

const computeBearing = (horizontalComponent, verticalComponent) => {
    if (horizontalComponent === 0 && verticalComponent === 0) {
        return 0;
    }
    const angleRadians = Math.atan2(verticalComponent, horizontalComponent);
    let angleDegrees = angleRadians * 180 / Math.PI;
    return (angleDegrees + 360) % 360;
};

const inputReader = makeInputReader(require("fs").readFileSync("/dev/stdin", "utf8"));
const rotationalDivisions = 360000;

const processSensorData = () => {
    const initialPointCount = inputReader.fetchScalar();
    const sensorObservations = [];

    for (let pointCounter = 0; pointCounter < initialPointCount; pointCounter++) {
        const horizontalCoord = inputReader.fetchScalar();
        const verticalCoord = inputReader.fetchScalar();
        if (horizontalCoord === 0 && verticalCoord === 0) continue;
        sensorObservations.push({
            h: horizontalCoord,
            v: verticalCoord,
            bearing: computeBearing(horizontalCoord, verticalCoord)
        });
    }

    const maximumSquaredVectorLength = Array.from({ length: rotationalDivisions }, (_, scanIteration) => {
        const currentScanAngle = (scanIteration / rotationalDivisions) * 360;

        const resultantVector = sensorObservations.reduce((accumulator, observation) => {
            const angleDifferenceRad = (observation.bearing - currentScanAngle) * Math.PI / 180;
            if (Math.cos(angleDifferenceRad) > 0) {
                accumulator.sumH += observation.h;
                accumulator.sumV += observation.v;
            }
            return accumulator;
        }, { sumH: 0, sumV: 0 });

        return resultantVector.sumH * resultantVector.sumH + resultantVector.sumV * resultantVector.sumV;
    }).reduce((currentMax, value) => Math.max(currentMax, value), 0);

    return Math.sqrt(maximumSquaredVectorLength);
};

console.log(processSensorData());