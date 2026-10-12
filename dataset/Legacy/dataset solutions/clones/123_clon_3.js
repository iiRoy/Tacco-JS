function computeCombinations(currentSum, startDigit, targetLength, targetSum, currentDepth) {
    if (currentDepth === targetLength - 1) {
        const remainingSum = targetSum - currentSum;
        if (startDigit <= remainingSum && remainingSum <= 9) {
            return 1;
        }
        return 0;
    }

    let resultCount = 0;
    for (let digit = startDigit; digit <= 9; digit++) {
        const nextSum = currentSum + digit;
        if (nextSum > targetSum) {
            break;
        }
        resultCount += computeCombinations(nextSum, digit + 1, targetLength, targetSum, currentDepth + 1);
    }
    return resultCount;
}

setupInputProcessing(function(fullInputString) {
    const inputLines = fullInputString.trim().split('\n');

    for (const currentLine of inputLines) {
        const [nStr, sStr] = currentLine.split(' ');

        const numN = Number(nStr);
        const numS = Number(sStr);

        if (numN === 0 && numS === 0) {
            continue;
        }

        console.log(computeCombinations(0, 0, numN, numS, 0));
    }
});

function setupInputProcessing(processInputCallback) {
    let accumulatedInput = '';

    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', function(inputChunk) {
        accumulatedInput += inputChunk;
    });

    process.stdin.on('end', function() {
        processInputCallback(accumulatedInput);
    });
}
