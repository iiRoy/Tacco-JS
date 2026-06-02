const processInput = (sourceText) => {
    let lineBuffer = sourceText.split("\n");
    let currentLineIndex = 0;
    let cachedTokens = null;

    const retrieveAtomicValue = (returnAsString) => {
        if (cachedTokens === null) {
            if (currentLineIndex >= lineBuffer.length) return undefined;
            cachedTokens = lineBuffer[currentLineIndex].split(" ").reverse();
        }
        const token = cachedTokens.pop();
        if (cachedTokens.length === 0) {
            currentLineIndex++;
            cachedTokens = null;
        }
        return returnAsString ? token : Number(token);
    };

    const retrieveFullLine = (returnAsStrings) => {
        if (currentLineIndex >= lineBuffer.length) return undefined;
        cachedTokens = null; // Invalidate atom cache as a full line is consumed
        const tokens = lineBuffer[currentLineIndex].split(" ");
        currentLineIndex++;
        return returnAsStrings ? tokens : tokens.map(Number);
    };

    const retrieveMultipleLines = (count, returnAsStrings) => {
        const collectedLines = [];
        for (let k = 0; k < count; k++) {
            if (currentLineIndex >= lineBuffer.length) break;
            cachedTokens = null; // Invalidate atom cache for each line
            const tokens = lineBuffer[currentLineIndex].split(" ");
            collectedLines.push(returnAsStrings ? tokens : tokens.map(Number));
            currentLineIndex++;
        }
        return collectedLines;
    };

    return {
        getAtom: retrieveAtomicValue,
        getLine: retrieveFullLine,
        getMatrix: retrieveMultipleLines,
    };
};

const inputSource = require("fs").readFileSync("/dev/stdin", "utf8");
const inputReader = processInput(inputSource);

console.log(calculatePathSolution());

function calculatePathSolution() {
    const coordinateCount = inputReader.getAtom();
    const coordinateSet = inputReader.getMatrix(coordinateCount);

    const firstPairSumParity = (coordinateSet[0][0] + coordinateSet[0][1]) & 1;

    const allPairsMatchParity = coordinateSet.every(pair => {
        return ((pair[0] + pair[1]) & 1) === firstPairSumParity;
    });

    if (!allPairsMatchParity) {
        return -1;
    }

    const pathDimension = 32 - firstPairSumParity;

    const stepMagnitudes = Array.from({ length: 31 }, (_, idx) => 1 << (30 - idx));
    if (firstPairSumParity === 0) {
        stepMagnitudes.push(1);
    }

    const generatedPaths = coordinateSet.map(originalCoords => {
        let currentX = originalCoords[0];
        let currentY = originalCoords[1];

        return stepMagnitudes.reduce((pathAccumulator, currentStepValue) => {
            const absCurrentX = Math.abs(currentX);
            const absCurrentY = Math.abs(currentY);

            let moveChar;
            if (absCurrentX > absCurrentY) {
                moveChar = currentX > 0 ? 'R' : 'L';
                currentX += (currentX > 0 ? -1 : 1) * currentStepValue;
            } else {
                moveChar = currentY > 0 ? 'U' : 'D';
                currentY += (currentY > 0 ? -1 : 1) * currentStepValue;
            }
            return pathAccumulator + moveChar;
        }, "");
    });

    return `${pathDimension}\n${stepMagnitudes.join(" ")}\n${generatedPaths.join("\n")}`;
}
