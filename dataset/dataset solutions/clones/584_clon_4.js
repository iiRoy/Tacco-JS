const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = fileContent.trim().split("\n");

let linePointer = 0;

const processNextCase = () => {
    const dimensions = inputLines[linePointer++].split(" ").map(Number);
    const countN = dimensions[0];
    const limitM = dimensions[1];

    if (countN === 0 && limitM === 0) {
        return false;
    }

    const valueList = Array.from({ length: countN }, (_, idx) => Number(inputLines[linePointer + idx]));
    linePointer += countN;
    valueList.push(0);

    const potentialSums = valueList.flatMap((valX, idxX) =>
        valueList.slice(idxX).map(valY => valX + valY)
    ).filter(s => s <= limitM);

    potentialSums.sort((a, b) => a - b);

    let maximumAchievedSum = 0;

    for (let idxP1 = 0; idxP1 < potentialSums.length; idxP1++) {
        const currentP1 = potentialSums[idxP1];
        const remainingTarget = limitM - currentP1;

        let lowIdx = 0;
        let highIdx = potentialSums.length - 1;
        let bestMatchIdxForP2 = -1;

        while (lowIdx <= highIdx) {
            const midIdx = Math.floor((lowIdx + highIdx) / 2);
            if (potentialSums[midIdx] <= remainingTarget) {
                bestMatchIdxForP2 = midIdx;
                lowIdx = midIdx + 1;
            } else {
                highIdx = midIdx - 1;
            }
        }

        if (bestMatchIdxForP2 !== -1) {
            maximumAchievedSum = Math.max(maximumAchievedSum, currentP1 + potentialSums[bestMatchIdxForP2]);
        }
    }

    console.log(maximumAchievedSum);
    return true;
};

while (processNextCase()) {
    // Continue processing cases until processNextCase returns false
}
