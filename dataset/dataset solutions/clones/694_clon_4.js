const sourceStream = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataSegments = sourceStream.trim().split('\n');

const createInitialSequence = (totalQuantity) =>
    Array.from({ length: totalQuantity }, (_, currentIdx) => totalQuantity - currentIdx);

const manipulateSequence = (currentArrangement, startOriginOne, spanCount) => {
    const startOriginZero = startOriginOne - 1;
    const totalLength = currentArrangement.length;

    return Array.from({ length: totalLength }, (_, newPosition) => {
        if (newPosition < spanCount) {
            return currentArrangement[startOriginZero + newPosition];
        } else if (newPosition < spanCount + startOriginZero) {
            return currentArrangement[newPosition - spanCount];
        } else {
            return currentArrangement[startOriginZero + spanCount + (newPosition - (spanCount + startOriginZero))];
        }
    });
};

const applyActionsRecursively = (currentArrangement, actionLines, lineIndex) => {
    if (lineIndex >= actionLines.length) {
        return currentArrangement;
    }

    const actionParameters = actionLines[lineIndex].split(' ').map(Number);
    const pos = actionParameters[0];
    const num = actionParameters[1];

    const nextArrangement = manipulateSequence(currentArrangement, pos, num);
    return applyActionsRecursively(nextArrangement, actionLines, lineIndex + 1);
};

const processAllCases = (remainingInputLines, currentLineCursor = 0) => {
    const configLine = remainingInputLines[currentLineCursor];
    if (!configLine) {
        return;
    }

    const [quantityN, operationR] = configLine.split(' ').map(Number);

    if (quantityN === 0 && operationR === 0) {
        return;
    }

    const initialArrangement = createInitialSequence(quantityN);
    const operationLines = remainingInputLines.slice(currentLineCursor + 1, currentLineCursor + 1 + operationR);

    const finalArrangement = applyActionsRecursively(initialArrangement, operationLines, 0);
    console.log(finalArrangement[0]);

    processAllCases(remainingInputLines, currentLineCursor + 1 + operationR);
};

processAllCases(dataSegments);