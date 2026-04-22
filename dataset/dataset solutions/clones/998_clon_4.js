const inputSource = 0; // Standard input file descriptor (stdin)
const dataStorageCapacity = 1048576; // 1 MB buffer
const dataBuffer = Buffer.alloc(dataStorageCapacity);
let bytesAcquired = 0;
let completeDataString = '';

try {
    bytesAcquired = require('fs').readSync(inputSource, dataBuffer, 0, dataStorageCapacity, 0);
    completeDataString = dataBuffer.toString('utf-8', 0, bytesAcquired);
} catch (error) {
    // In scenarios like competitive programming, this might occur if stdin is empty or closed prematurely.
    // For this problem, it's assumed stdin will provide valid data.
}

const separatedFragments = [];
let lastDelimiterPosition = 0;
for (let charIndex = 0; charIndex < completeDataString.length; charIndex++) {
    if (completeDataString[charIndex] === '\n') {
        separatedFragments.push(completeDataString.substring(lastDelimiterPosition, charIndex));
        lastDelimiterPosition = charIndex + 1;
    }
}
if (lastDelimiterPosition < completeDataString.length) {
    separatedFragments.push(completeDataString.substring(lastDelimiterPosition, completeDataString.length));
}

const numericalSequence = [];
for (let fragmentIndex = 1; fragmentIndex < separatedFragments.length - 1; fragmentIndex++) {
    const cleanFragment = separatedFragments[fragmentIndex].trim();
    if (cleanFragment.length > 0) {
        numericalSequence.push(parseInt(cleanFragment, 10));
    }
}

let ultimateProfit = -Infinity;
let lowestObservedPrice;

if (numericalSequence.length > 0) {
    lowestObservedPrice = numericalSequence[0];
    for (let currentItemIndex = 1; currentItemIndex < numericalSequence.length; currentItemIndex++) {
        const currentItemValue = numericalSequence[currentItemIndex];
        ultimateProfit = Math.max(ultimateProfit, currentItemValue - lowestObservedPrice);
        lowestObservedPrice = Math.min(lowestObservedPrice, currentItemValue);
    }
}

console.log(ultimateProfit);