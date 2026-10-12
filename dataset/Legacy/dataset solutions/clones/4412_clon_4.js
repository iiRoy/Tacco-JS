function inputProcessor(rawInput) {
    const lines = rawInput.trim().split("\n");
    let currentLineIndex = 0;

    const reader = {
        getNextValue: function(asString) {
            if (currentLineIndex >= lines.length) return undefined;

            let lineContent = lines[currentLineIndex];
            if (typeof lineContent === "string") {
                lines[currentLineIndex] = lineContent.split(" ").reverse();
                lineContent = lines[currentLineIndex];
            }

            const extracted = lineContent.pop();
            if (lineContent.length === 0) {
                currentLineIndex++;
            }
            return asString ? extracted : +extracted;
        },

        getEntireLine: function(asString) {
            if (currentLineIndex >= lines.length) return undefined;

            const line = lines[currentLineIndex];
            currentLineIndex++;
            const parts = line.split(" ");
            return asString ? parts : parts.map(Number);
        },

        getMatrixData: function(rowCount, asString) {
            const collectedRows = [];
            for (let k = 0; k < rowCount; k++) {
                if (currentLineIndex + k >= lines.length) break;
                const line = lines[currentLineIndex + k];
                collectedRows.push(line.split(" "));
            }
            currentLineIndex += rowCount;
            return asString ? collectedRows : collectedRows.map(row => row.map(Number));
        },

        getRawLines: function(count, asString) {
            const collectedLines = [];
            for (let k = 0; k < count; k++) {
                if (currentLineIndex + k >= lines.length) break;
                const line = lines[currentLineIndex + k];
                collectedLines.push(line);
            }
            currentLineIndex += count;
            return asString ? collectedLines : collectedLines.map(Number);
        }
    };
    return reader;
}
function createZeroMatrix(heightDim, widthDim) {
    const matrix = [];
    for (let r = 0; r < heightDim; r++) {
        const row = Array.from({ length: widthDim }, () => 0);
        matrix.push(row);
    }
    return matrix;
}
var inputReader = inputProcessor(require("fs").readFileSync("/dev/stdin","utf8"));
var moduloConstant = 1e9+7;

console.log(computeResult());

function calculateCombinations(currentPosition, previousWasDifferent, currentProduct, totalSize, stringA, stringB, modulus) {
    if (currentPosition >= totalSize) {
        return currentProduct;
    }

    const currentCharsDiffer = (stringA[currentPosition] !== stringB[currentPosition]);
    let nextProduct = currentProduct;
    let nextPosition = currentPosition + 1;
    let nextPreviousWasDifferent;

    if (currentCharsDiffer) {
        nextPosition++;
        if (previousWasDifferent) {
            nextProduct = (nextProduct * 3) % modulus;
        } else {
            nextProduct = (nextProduct * 2) % modulus;
        }
        nextPreviousWasDifferent = true;
    } else {
        if (!previousWasDifferent) {
            nextProduct = (nextProduct * 2) % modulus;
        }
        nextPreviousWasDifferent = false;
    }

    return calculateCombinations(nextPosition, nextPreviousWasDifferent, nextProduct, totalSize, stringA, stringB, modulus);
}

function computeResult(){
    const totalLength = inputReader.getNextValue();
    const firstString = inputReader.getNextValue(true);
    const secondString = inputReader.getNextValue(true);

    if (totalLength === 0) {
        return 3;
    }

    let initialCount, initialLastSegmentDifferent, initialIndex;

    if (firstString[0] !== secondString[0]) {
        initialCount = 6;
        initialLastSegmentDifferent = true;
        initialIndex = 2;
    } else {
        initialCount = 3;
        initialLastSegmentDifferent = false;
        initialIndex = 1;
    }
    return calculateCombinations(initialIndex, initialLastSegmentDifferent, initialCount, totalLength, firstString, secondString, moduloConstant);
}
