class InputHandler {
    constructor(inputLines) {
        this.cache = inputLines;
        this.indexPointer = 0;
    }

    extractNumericSequence() {
        if (this.indexPointer >= this.cache.length) {
            throw new Error("Input Exhausted");
        }
        const currentLine = this.cache[this.indexPointer++];
        return currentLine.split(' ').map(val => parseInt(val, 10));
    }
}

let inputCollector = [];
let inputProcessor;

require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
}).on('line', (dataLine) => {
    inputCollector.push(dataLine);
}).on('close', () => {
    inputProcessor = new InputHandler(inputCollector);
    console.error('\n↑Input ↓Output');
    calculatePeakConcurrency();
});

function presentResult(outcome) {
    console.log(outcome);
}

function calculatePeakConcurrency() {
    const configData = inputProcessor.extractNumericSequence();
    const numIntervals = configData[0];

    const eventPoints = [];

    for (let intervalIdx = 0; intervalIdx < numIntervals; intervalIdx++) {
        const rangeBoundaries = inputProcessor.extractNumericSequence();
        const startPoint = rangeBoundaries[0];
        const endPoint = rangeBoundaries[1];

        eventPoints.push([startPoint, 1]);
        eventPoints.push([endPoint + 1, -1]);
    }

    eventPoints.sort((eventA, eventB) => {
        if (eventA[0] !== eventB[0]) {
            return eventA[0] - eventB[0];
        }
        return eventA[1] - eventB[1];
    });

    let currentOverlapCount = 0;
    let maxOverlapAchieved = 1;

    for (const point of eventPoints) {
        currentOverlapCount += point[1];
        maxOverlapAchieved = Math.max(maxOverlapAchieved, currentOverlapCount);
    }

    presentResult(maxOverlapAchieved);
}