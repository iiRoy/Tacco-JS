"use strict";

function readCoordinatePairs(dataParser, numItems) {
    let coordinateList = new Array(numItems);
    for (let currentIdx = 0; currentIdx < numItems; currentIdx++) {
        coordinateList[currentIdx] = [dataParser.getNextInt(), dataParser.getNextInt()];
    }
    return coordinateList;
}

function canFormPair(redPointData, bluePointData) {
    return redPointData[0] < bluePointData[0] && redPointData[1] < bluePointData[1];
}

function ProcessData(sourceInput) {
    let dataReader = new InputProcessor(sourceInput);
    let itemCount = dataReader.getNextInt();

    let redCoords = readCoordinatePairs(dataReader, itemCount);
    let blueCoords = readCoordinatePairs(dataReader, itemCount);

    const pointComparator = (coordA, coordB) => {
        if (coordA[0] === coordB[0]) {
            return coordA[1] - coordB[1];
        }
        return coordA[0] - coordB[0];
    };

    redCoords.sort(pointComparator);
    blueCoords.sort(pointComparator);

    let totalMatches = 0;

    const MARKER_UNAVAILABLE = undefined;

    for (let currentRedIdx = 0; currentRedIdx < itemCount; currentRedIdx++) {
        let currentRedPoint = redCoords[currentRedIdx];
        if (currentRedPoint === MARKER_UNAVAILABLE) {
            continue;
        }

        for (let currentBlueIdx = 0; currentBlueIdx < itemCount; currentBlueIdx++) {
            let currentBluePoint = blueCoords[currentBlueIdx];
            if (currentBluePoint === MARKER_UNAVAILABLE) {
                continue;
            }

            if (canFormPair(currentRedPoint, currentBluePoint)) {
                blueCoords[currentBlueIdx] = MARKER_UNAVAILABLE;
                redCoords[currentRedIdx] = MARKER_UNAVAILABLE;
                totalMatches++;
                break;
            }
        }
    }
    console.log(totalMatches);
}

class InputProcessor {
    constructor(inputStringContent) {
        if (typeof inputStringContent === 'undefined') {
            throw new Error('Argument (stdin) cannot be omitted!');
        }
        this.readIndex = 0;
        this.tokenizedInput = inputStringContent.split(/\n|\s/);
    }

    getNextInt() {
        return parseInt(this.tokenizedInput[this.readIndex++], 10);
    }

    getIntegerArray(arraySize) {
        if (typeof arraySize === 'undefined' || arraySize < 1) {
            throw new Error('Argument (1 or more) cannot be omitted!');
        }
        let resultArr = new Array(arraySize);
        for (let idx = 0; idx < arraySize; idx++) {
            resultArr[idx] = this.getNextInt();
        }
        return resultArr;
    }

    getNextString() {
        return this.tokenizedInput[this.readIndex++];
    }

    getStringArray(arrayLength) {
        if (typeof arrayLength === 'undefined' || arrayLength < 1) {
            throw new Error('Argument (1 or more) cannot be omitted!');
        }
        let stringResultArr = new Array(arrayLength);
        for (let idx = 0; idx < arrayLength; idx++) {
            stringResultArr[idx] = this.getNextString();
        }
        return stringResultArr;
    }
}

if (typeof window === "undefined") {
    ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
}
