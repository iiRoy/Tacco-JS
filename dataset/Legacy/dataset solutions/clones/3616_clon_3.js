"use strict";

function ProcessInput(rawData) {
    let dataParser = new DataParser(rawData);

    let numStations = dataParser.readInteger();
    let numTrains = dataParser.readInteger();
    let numQueries = dataParser.readInteger();

    let cumulativeTrainCounts = Array.from({ length: numStations + 1 }, () =>
        Array(numStations + 1).fill(0)
    );

    for (let trainIndex = 0; trainIndex < numTrains; trainIndex++) {
        let leftStation = dataParser.readInteger();
        let rightStation = dataParser.readInteger();
        cumulativeTrainCounts[leftStation][rightStation]++;
    }

    const computeCumulativeSums = (matrix, size) => {
        for (let rowIdx = 1; rowIdx <= size; rowIdx++) {
            for (let colIdx = 1; colIdx <= size; colIdx++) {
                let valAbove = matrix[rowIdx - 1][colIdx];
                let valLeft = matrix[rowIdx][colIdx - 1];
                let valDiagonal = matrix[rowIdx - 1][colIdx - 1];
                matrix[rowIdx][colIdx] += (valAbove + valLeft - valDiagonal);
            }
        }
    };

    computeCumulativeSums(cumulativeTrainCounts, numStations);

    const getQueryRangeCount = (matrix, startStation, endStation) => {
        let totalUpToEndStation = matrix[endStation][endStation];
        let totalBeforeStartStation = matrix[startStation - 1][endStation];
        return totalUpToEndStation - totalBeforeStartStation;
    };

    for (let queryIndex = 0; queryIndex < numQueries; queryIndex++) {
        let queryStart = dataParser.readInteger();
        let queryEnd = dataParser.readInteger();
        console.log(getQueryRangeCount(cumulativeTrainCounts, queryStart, queryEnd));
    }
}

class DataParser {
    constructor (rawData) {
        this.currentIndex = 0;
        this.parsedTokens = rawData.split(/\n|\s/);
    }

    readInteger() {
        return parseInt(this.parsedTokens[this.currentIndex++], 10);
    }

    readIntegerArray(count) {
        let resultArray = new Array(count);
        for (let i = 0; i < count; i++) {
            resultArray[i] = this.readInteger();
        }
        return resultArray;
    }

    readString() {
        return this.parsedTokens[this.currentIndex++];
    }

    readStringArray(count) {
        let resultArray = new Array(count);
        for (let i = 0; i < count; i++) {
            resultArray[i] = this.readString();
        }
        return resultArray;
    }
}

if (typeof window == "undefined") {
    ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
}
