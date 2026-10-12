"use strict";

class Die {
    constructor(initialFaceValues) {
        this.faceValues = initialFaceValues;
    }

    _normalizeRotationCount(numRotations) {
        let normalized = numRotations % 4;
        if (normalized < 0) {
            normalized += 4;
        }
        return normalized;
    }

    _applyCyclicRotation(indicesToShift, rotationAmount) {
        const actualRotations = this._normalizeRotationCount(rotationAmount);
        const currentValuesAtIndices = indicesToShift.map(idx => this.faceValues[idx]);
        const numIndices = indicesToShift.length;

        const shiftedValues = new Array(numIndices);
        for (let i = 0; i < numIndices; i++) {
            shiftedValues[i] = currentValuesAtIndices[(i + actualRotations) % numIndices];
        }

        for (let i = 0; i < numIndices; i++) {
            this.faceValues[indicesToShift[i]] = shiftedValues[i];
        }
    }

    alignFaces(desiredTop, desiredFront) {
        const currentTopFaceIndex = this.faceValues.indexOf(desiredTop);

        const topAlignmentRotations = {
            1: { method: 'rotateNorthSouth', count: 1 },
            2: { method: 'rotateWestEast', count: 1 },
            3: { method: 'rotateWestEast', count: -1 },
            4: { method: 'rotateNorthSouth', count: -1 },
            5: { method: 'rotateNorthSouth', count: 2 }
        };

        const rotationInstruction = topAlignmentRotations[currentTopFaceIndex];
        if (rotationInstruction) {
            this[rotationInstruction.method](rotationInstruction.count);
        }

        while (this.faceValues[1] !== desiredFront) {
            this.rotateAroundVertical(1);
        }
    }

    rotateAroundVertical(numRotations) {
        const verticalIndices = [1, 2, 4, 3];
        this._applyCyclicRotation(verticalIndices, numRotations);
    }

    rotateNorthSouth(numRotations) {
        const northSouthIndices = [0, 1, 5, 4];
        this._applyCyclicRotation(northSouthIndices, numRotations);
    }

    rotateWestEast(numRotations) {
        const westEastIndices = [0, 2, 5, 3];
        this._applyCyclicRotation(westEastIndices, numRotations);
    }
}


new Promise(function (resolve, reject) {
    let inputBuffer = "";
    process.stdin.on("data", inputChunk => { inputBuffer += inputChunk; });
    process.stdin.on("end", () => { resolve([inputBuffer, process.stdout]); });
}).then(function([inputContent, outputStream]) {
    const lines = inputContent.split("\n");
    const initialFaceConfiguration = lines[0];
    const numberOfQueriesStr = lines[1];
    const queryDataLines = lines.slice(2);

    const dieInstance = new Die(initialFaceConfiguration.split(" "));
    const totalQueries = parseInt(numberOfQueriesStr, 10);

    for (let i = 0; i < totalQueries; i++) {
        const currentQueryLine = queryDataLines[i];
        if (!currentQueryLine) continue;
        const [queryTopValue, queryFrontValue] = currentQueryLine.split(" ");
        
        dieInstance.alignFaces(queryTopValue, queryFrontValue);
        outputStream.write(`${dieInstance.faceValues[2]}\n`);
    }
});
