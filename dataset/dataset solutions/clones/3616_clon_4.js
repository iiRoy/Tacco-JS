"use strict";

class DataFeed {
    constructor(sourceText) {
        this.currentPosition = 0;
        this.tokens = sourceText.split(/\s+/);
        if (this.tokens[this.tokens.length - 1] === '') {
            this.tokens.pop();
        }
    }

    retrieveNumber() {
        return +this.tokens[this.currentPosition++];
    }
}

class FenwickTree2D {
    constructor(sizeX, sizeY) {
        this.maxDimX = sizeX;
        this.maxDimY = sizeY;
        this.tree = Array(sizeX + 1).fill(0).map(() => Array(sizeY + 1).fill(0));
    }

    adjust(x, y, val) {
        for (let i = x; i <= this.maxDimX; i += i & -i) {
            for (let j = y; j <= this.maxDimY; j += j & -j) {
                this.tree[i][j] += val;
            }
        }
    }

    sumRange(x, y) {
        let currentSum = 0;
        for (let i = x; i > 0; i -= i & -i) {
            for (let j = y; j > 0; j -= j & -j) {
                currentSum += this.tree[i][j];
            }
        }
        return currentSum;
    }
}

function executeProcessing(dataStream) {
    let source = new DataFeed(dataStream);
    let dimensionSize = source.retrieveNumber();
    let incidentCount = source.retrieveNumber();
    let requestCount = source.retrieveNumber();

    let cumulativeGrid = new FenwickTree2D(dimensionSize, dimensionSize);

    for (let idxIncident = 0; idxIncident < incidentCount; idxIncident++) {
        let startCoord = source.retrieveNumber();
        let endCoord = source.retrieveNumber();
        cumulativeGrid.adjust(startCoord, endCoord, 1);
    }

    for (let idxRequest = 0; idxRequest < requestCount; idxRequest++) {
        let lowerBound = source.retrieveNumber();
        let upperBound = source.retrieveNumber();
        
        let result = cumulativeGrid.sumRange(upperBound, upperBound) - cumulativeGrid.sumRange(lowerBound - 1, upperBound);
        console.log(result);
    }
}

if (typeof globalThis.process === "object" && typeof globalThis.process.versions === "object" && globalThis.process.versions.node) {
    executeProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));
}