'use strict'

class Coordinate {
    constructor(valX, valY) {
        this.xVal = valX;
        this.yVal = valY;
    }

    #getAbsolute(val) {
        return val < 0 ? -val : val;
    }

    measureSeparation(otherCoord) {
        return this.#getAbsolute(this.xVal - otherCoord.xVal) + this.#getAbsolute(this.yVal - otherCoord.yVal);
    }
}

const processInput = (entireInput) => {
    const lines = entireInput.trim().split('\n');

    const firstLineValues = lines[0].split(' ').map(Number);
    const sourceCount = firstLineValues[0];

    const { sources, destinations } = lines.slice(1).reduce((accumulator, line, idx) => {
        const coordinatePair = line.split(' ').map(Number);
        const newCoord = new Coordinate(coordinatePair[0], coordinatePair[1]);

        if (idx < sourceCount) {
            accumulator.sources.push(newCoord);
        } else {
            accumulator.destinations.push(newCoord);
        }
        return accumulator;
    }, { sources: [], destinations: [] });

    return { sources, destinations };
};


const executeTask = (rawInputData) => {
    const { sources: originPoints, destinations: destinationCoordinates } = processInput(rawInputData);

    const resultIndices = originPoints.map((currentOrigin) => {
        const { minIdx: targetIndex } = destinationCoordinates.reduce((accumulator, currentDestination, destIdx) => {
            const currentSeparation = currentOrigin.measureSeparation(currentDestination);

            if (currentSeparation < accumulator.minVal) {
                return { minVal: currentSeparation, minIdx: destIdx };
            }
            return accumulator;
        }, { minVal: Infinity, minIdx: -1 });

        return targetIndex + 1;
    });

    console.log(resultIndices.join('\n'));
};

executeTask(require('fs').readFileSync('/dev/stdin', 'utf-8'));