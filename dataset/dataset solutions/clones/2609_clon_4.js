const inputProcessor = (function() {
    let linesData = [];
    let currentLineIndex = 0;

    function initialize(rawInput) {
        const rawLines = rawInput.trim().split('\n');
        linesData = rawLines.map(line => line.split(' ').reverse());
        currentLineIndex = 0;
    }

    function retrieveNext(asString = false) {
        while (currentLineIndex < linesData.length && linesData[currentLineIndex].length === 0) {
            currentLineIndex++;
        }

        if (currentLineIndex >= linesData.length) {
            return undefined;
        }

        const val = linesData[currentLineIndex].pop();
        return asString ? val : +val;
    }

    return {
        init: initialize,
        getValue: retrieveNext
    };
})();

inputProcessor.init(require("fs").readFileSync("/dev/stdin","utf8"));

const createMultiDimArray = (initialValue, ...dimensions) => {
    const build = (dims, currentDimIndex) => {
        if (currentDimIndex === dims.length - 1) {
            return Array.from({ length: dims[currentDimIndex] }, () => initialValue);
        } else {
            return Array.from({ length: dims[currentDimIndex] }, () =>
                build(dims, currentDimIndex + 1)
            );
        }
    };
    return build(dimensions, 0);
};

console.log(processVectors());

function processVectors() {
    let vectorCount = inputProcessor.getValue();
    let rawVectors = [];

    for (let idx = 0; idx < vectorCount; idx++) {
        let componentA = inputProcessor.getValue();
        let componentB = inputProcessor.getValue();
        if (componentA === 0 && componentB === 0) continue;
        rawVectors.push(new Vector(componentA, componentB, calculateVectorAngle(componentA, componentB)));
    }

    vectorCount = rawVectors.length;
    rawVectors.sort((v1, v2) => v1.angle - v2.angle);

    let extendedVectors = rawVectors.concat(rawVectors);

    let maxMagnitudeSq = 0;
    let currentSumVector = new Vector(0, 0, null);
    let rightPointer = 0;

    for (let leftPointer = 0; leftPointer < vectorCount; leftPointer++) {
        while (rightPointer < leftPointer + vectorCount) {
            let nextVectorToAdd = extendedVectors[rightPointer];
            let potentialNewSum = currentSumVector.add(nextVectorToAdd);

            if (currentSumVector.magnitudeSquared() >= potentialNewSum.magnitudeSquared()) {
                break;
            }

            currentSumVector = potentialNewSum;
            rightPointer++;
        }

        let windowMagnitudeSq = currentSumVector.magnitudeSquared();
        if (maxMagnitudeSq < windowMagnitudeSq) {
            maxMagnitudeSq = windowMagnitudeSq;
        }

        currentSumVector = currentSumVector.subtract(extendedVectors[leftPointer]);
    }

    return Math.sqrt(maxMagnitudeSq);
}

const calculateVectorAngle = (xCoord, yCoord) => {
    let rads = Math.atan2(yCoord, xCoord);
    let degrees = rads * 180 / Math.PI;

    if (degrees < 0) {
        degrees += 360;
    }
    return Math.round(degrees * 1e7) / 1e7;
};

class Vector {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
    }

    magnitudeSquared() {
        return this.x * this.x + this.y * this.y;
    }

    add(otherVector) {
        return new Vector(this.x + otherVector.x, this.y + otherVector.y, null);
    }

    subtract(otherVector) {
        return new Vector(this.x - otherVector.x, this.y - otherVector.y, null);
    }
}
