const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
let processingQueue = sourceData.trim().split("\n");

function processNextBlock() {
    const currentConfigLine = processingQueue.shift();
    const [itemCount, targetIndexRaw, penaltyPercentage] = currentConfigLine.split(" ").map(Number);

    if (itemCount === 0 && targetIndexRaw === 0 && penaltyPercentage === 0) {
        return;
    }

    const zeroBasedTargetIndex = targetIndexRaw - 1;

    const itemLines = processingQueue.splice(0, itemCount);
    const collectedValues = itemLines.map(Number);

    const accumulatedScore = collectedValues.reduce((acc, val) => acc + (val * 100), 0);

    const adjustedScore = accumulatedScore * (100 - penaltyPercentage) / 100;

    const finalOutcome = (collectedValues[zeroBasedTargetIndex] !== 0)
        ? Math.floor(adjustedScore / collectedValues[zeroBasedTargetIndex])
        : 0;

    console.log(finalOutcome);

    processNextBlock();
}

processNextBlock();
