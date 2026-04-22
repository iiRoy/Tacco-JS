const acquireSource = () => {
    return require("fs").readFileSync("/dev/stdin", "utf8").split('\n');
};

let dataSegments = [];
let segmentCursor = 0;

const initializeInputSystem = () => {
    dataSegments = acquireSource();
    segmentCursor = 0;
};

const retrieveSegment = (quantity) => {
    if (quantity) {
        const retrieved = dataSegments.slice(segmentCursor, segmentCursor + quantity);
        segmentCursor += quantity;
        return retrieved;
    }
    return dataSegments[segmentCursor++];
};

const retrieveInteger = () => parseInt(retrieveSegment());
const retrieveStringSeries = () => retrieveSegment().split(' ');
const retrieveIntegerSeries = () => retrieveStringSeries().map(e => parseInt(e));
const retrieveStringGrid = (quantity) => retrieveSegment(quantity).map(line => line.split(' '));

class CalculationEngine {
    computeResult() {
        initializeInputSystem();

        const parameters = retrieveIntegerSeries();
        const pointCount = parameters[0]; // n
        const blockDimension = parameters[1]; // k
        const totalDimension = 2 * blockDimension; // 2k

        const incomingPoints = retrieveStringGrid(pointCount);

        const pointOccurrence = Array(totalDimension).fill(0).map(() => Array(totalDimension).fill(0));

        incomingPoints.forEach(pointInfo => {
            const initialX = parseInt(pointInfo[0]);
            const initialY = parseInt(pointInfo[1]);
            const typeIndicator = pointInfo[2];

            const effectiveX = (initialX + (typeIndicator === 'B' ? blockDimension : 0)) % totalDimension;
            const effectiveY = initialY % totalDimension;

            pointOccurrence[effectiveX][effectiveY]++;
        });

        const expandedDimension = 2 * totalDimension; // 4k
        const expandedOccurrence = Array(expandedDimension).fill(0).map(() => Array(expandedDimension).fill(0));

        for (let i = 0; i < expandedDimension; ++i) {
            for (let j = 0; j < expandedDimension; ++j) {
                expandedOccurrence[i][j] = pointOccurrence[i % totalDimension][j % totalDimension];
            }
        }

        const cumulativeSumGrid = Array(expandedDimension + 1).fill(0).map(() => Array(expandedDimension + 1).fill(0));

        for (let i = 1; i <= expandedDimension; ++i) {
            for (let j = 1; j <= expandedDimension; ++j) {
                cumulativeSumGrid[i][j] = expandedOccurrence[i - 1][j - 1]
                                          + cumulativeSumGrid[i - 1][j]
                                          + cumulativeSumGrid[i][j - 1]
                                          - cumulativeSumGrid[i - 1][j - 1];
            }
        }

        const getRectangleSum = (xStart, yStart, xEnd, yEnd) => {
            return cumulativeSumGrid[xEnd][yEnd]
                 - cumulativeSumGrid[xStart][yEnd]
                 - cumulativeSumGrid[xEnd][yStart]
                 + cumulativeSumGrid[xStart][yStart];
        };

        let highestScore = 0;

        for (let yShift = 0; yShift < blockDimension; ++yShift) {
            for (let xShift = 0; xShift < blockDimension; ++xShift) {
                const currentScore = getRectangleSum(xShift, yShift, xShift + blockDimension, yShift + blockDimension)
                                   + getRectangleSum(xShift + blockDimension, yShift + blockDimension, xShift + 2 * blockDimension, yShift + 2 * blockDimension);
                
                highestScore = Math.max(highestScore, currentScore);
            }
        }

        return highestScore;
    }
}

console.log(new CalculationEngine().computeResult());