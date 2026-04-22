const fileSystem = require('node:fs');

const extractData = () => {
    const inputBuffer = fileSystem.readFileSync(0); 
    const rawLines = inputBuffer.toString().trim().split('\n');
    let currentLineIndex = 0;

    const dimensions = rawLines[currentLineIndex++].split(' ').map(Number);
    const countA = dimensions[0]; 
    const countB = dimensions[1]; 

    const collectionA = [];
    for (let i = 0; i < countA; ++i) {
        collectionA.push(Number(rawLines[currentLineIndex++]));
    }

    const collectionB = [];
    for (let i = 0; i < countB; ++i) {
        collectionB.push(Number(rawLines[currentLineIndex++]));
    }

    return { countA, countB, collectionA, collectionB };
};

const processedInput = extractData();
const limitA = processedInput.countA;
const limitB = processedInput.countB;
const listA = processedInput.collectionA;
const listB = processedInput.collectionB;

const memoTable = new Array(limitB + 1).fill(null).map(() => new Array(limitA + 1).fill(undefined));

const calculateOptimalValue = (bCurrentIndex, aProcessedCount) => {
    if (aProcessedCount === limitA) {
        return 0; // All elements from listA have been processed
    }
    if (bCurrentIndex === limitB) {
        return Number.MAX_SAFE_INTEGER; // No more elements in listB, but listA elements remain
    }

    if (memoTable[bCurrentIndex][aProcessedCount] !== undefined) {
        return memoTable[bCurrentIndex][aProcessedCount];
    }

    let minCost = Number.MAX_SAFE_INTEGER;

    // Option 1: Skip the current element from listB (listB[bCurrentIndex])
    // This corresponds to dp[i+1][j] = Math.min(dp[i+1][j], dp[i][j])
    const costIfSkipped = calculateOptimalValue(bCurrentIndex + 1, aProcessedCount);
    minCost = Math.min(minCost, costIfSkipped);

    // Option 2: Use the current element from listB (listB[bCurrentIndex]) to process
    // the next element from listA (listA[aProcessedCount])
    // This corresponds to dp[i+k][j+1] = Math.min(dp[i+k][j+1], dp[i][j] + C*D)
    const currentBElement = listB[bCurrentIndex];
    const currentAElement = listA[aProcessedCount];

    // The 'k' loop in the original code allows skipping subsequent B elements
    // The condition `i+k+n-j+1 <= m` means `m - (i+k) >= n - j - 1`
    // Which translates to `remainingBItems >= remainingAItems + 2` (where remainingAItems is `n - (j+1)`)
    for (let bSkipSteps = 1; bCurrentIndex + bSkipSteps <= limitB; ++bSkipSteps) {
        const remainingBItems = limitB - (bCurrentIndex + bSkipSteps);
        const remainingAItems = limitA - (aProcessedCount + 1);

        if (remainingBItems >= remainingAItems + 2) {
            const costToUse = currentBElement * currentAElement + 
                              calculateOptimalValue(bCurrentIndex + bSkipSteps, aProcessedCount + 1);
            minCost = Math.min(minCost, costToUse);
        }
    }

    return (memoTable[bCurrentIndex][aProcessedCount] = minCost);
};

const finalResult = calculateOptimalValue(0, 0);
console.log(finalResult);