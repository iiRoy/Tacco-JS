const PRECISION_ERROR_THRESHOLD = 1e-10;

class CartesianPoint {
    constructor(coordX, coordY) {
        this.xVal = coordX;
        this.yVal = coordY;
    }

    isCoincident(otherPoint) {
        const deltaX = this.xVal - otherPoint.xVal;
        const deltaY = this.yVal - otherPoint.yVal;
        return (deltaX * deltaX + deltaY * deltaY) < PRECISION_ERROR_THRESHOLD * PRECISION_ERROR_THRESHOLD;
    }
}

class LinearPath {
    constructor(startCoord, endCoord) {
        this.initial = startCoord;
        this.final = endCoord;
    }
}

const GeoAlgorithms = {
    determineCrossing(pathA, pathB) {
        const firstStart = pathA.initial;
        const firstEnd = pathA.final;
        const secondStart = pathB.initial;
        const secondEnd = pathB.final;

        const dx1 = firstEnd.xVal - firstStart.xVal;
        const dy1 = firstEnd.yVal - firstStart.yVal;
        const dx2 = secondEnd.xVal - secondStart.xVal;
        const dy2 = secondEnd.yVal - secondStart.yVal;

        const commonDenominator = dx1 * dy2 - dy1 * dx2;

        if (Math.abs(commonDenominator) < PRECISION_ERROR_THRESHOLD) {
            // Paths are parallel or collinear
            return null;
        }

        // Calculate parameter for the first path (s_param)
        // s_param = ((secondEnd.yVal - secondStart.yVal) * (secondStart.xVal - firstStart.xVal) - (secondEnd.xVal - secondStart.xVal) * (secondStart.yVal - firstStart.yVal)) / commonDenominator;
        // This is equivalent to original code's `r`
        const s_param = (
            (secondEnd.yVal - secondStart.yVal) * (secondStart.xVal - firstStart.xVal) -
            (secondEnd.xVal - secondStart.xVal) * (secondStart.yVal - firstStart.yVal)
        ) / commonDenominator;


        // Check if the crossing point lies on the first path
        if (s_param < PRECISION_ERROR_THRESHOLD || (1 - s_param) < PRECISION_ERROR_THRESHOLD) {
            return null;
        }

        const crossingX = firstStart.xVal * (1 - s_param) + firstEnd.xVal * s_param;
        const crossingY = firstStart.yVal * (1 - s_param) + firstEnd.yVal * s_param;

        return new CartesianPoint(crossingX, crossingY);
    }
};

const PlanarDivisionCalculator = {
    calculateDivisions(pathSegments) {
        let divisionCount = 1;
        
        pathSegments.forEach((currentPath, currentPathIndex) => {
            divisionCount++; 
            const currentPathUniqueCrossings = [];

            for (let previousPathIndex = 0; previousPathIndex < currentPathIndex; previousPathIndex++) {
                const priorPath = pathSegments[previousPathIndex];
                const intersectionResult = GeoAlgorithms.determineCrossing(currentPath, priorPath);

                if (intersectionResult !== null) {
                    const isAlreadyRecorded = currentPathUniqueCrossings.some(existingPoint =>
                        intersectionResult.isCoincident(existingPoint)
                    );
                    if (!isAlreadyRecorded) {
                        currentPathUniqueCrossings.push(intersectionResult);
                    }
                }
            }
            divisionCount += currentPathUniqueCrossings.length;
        });
        return divisionCount;
    }
};

async function processStandardInput() {
    let fullInputBuffer = '';
    process.stdin.on('data', (dataChunk) => {
        fullInputBuffer += dataChunk.toString();
    });

    await new Promise(resolveInput => process.stdin.on('end', resolveInput));

    const inputLinesArray = fullInputBuffer.trim().split('\n');
    let inputLinePointer = 0;
    const computedOutcomes = [];

    while (true) {
        const numSegmentsInBlock = parseInt(inputLinesArray[inputLinePointer++], 10);
        if (numSegmentsInBlock === 0) {
            break;
        }

        const currentBlockPathList = [];
        for (let k = 0; k < numSegmentsInBlock; k++) {
            const coordinateStrings = inputLinesArray[inputLinePointer++].split(' ');
            const numericCoords = coordinateStrings.map(Number);
            const p1 = new CartesianPoint(numericCoords[0], numericCoords[1]);
            const p2 = new CartesianPoint(numericCoords[2], numericCoords[3]);
            currentBlockPathList.push(new LinearPath(p1, p2));
        }
        computedOutcomes.push(PlanarDivisionCalculator.calculateDivisions(currentBlockPathList));
    }

    computedOutcomes.forEach(result => console.log(result));
}

processStandardInput();