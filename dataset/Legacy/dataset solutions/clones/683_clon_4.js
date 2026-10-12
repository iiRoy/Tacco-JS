function* caseProcessor(lines) {
    let lineIndex = 0;
    while (true) {
        const currentCaseParams = lines[lineIndex++].split(" ").map(Number);
        const currentN = currentCaseParams[0];
        const currentSumLimit = currentCaseParams[1];

        if (currentN === 0 && currentSumLimit === 0) {
            return;
        }

        const numbersCollection = [];
        for (let k = 0; k < currentN; k++) {
            numbersCollection.push(Number(lines[lineIndex++]));
        }
        yield { countElements: currentN, sumTarget: currentSumLimit, elementData: numbersCollection };
    }
}

const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputContent.trim().split("\n");
const testCaseIterator = caseProcessor(inputLines);

for (const currentTest of testCaseIterator) {
    const currentN = currentTest.countElements;
    const currentSumLimit = currentTest.sumTarget;
    const numbersCollection = currentTest.elementData;

    numbersCollection.sort((first, second) => first - second);

    let totalValidPairs = 0;
    for (let i = 0; i < currentN - 1; i++) {
        const requiredMinimumValue = currentSumLimit - numbersCollection[i];
        let lowBound = i + 1;
        let highBound = currentN - 1;
        let firstSuitableIndex = currentN;

        while (lowBound <= highBound) {
            const midPoint = Math.floor((lowBound + highBound) / 2);
            if (numbersCollection[midPoint] > requiredMinimumValue) {
                firstSuitableIndex = midPoint;
                highBound = midPoint - 1;
            } else {
                lowBound = midPoint + 1;
            }
        }

        if (firstSuitableIndex < currentN) {
            totalValidPairs += (currentN - firstSuitableIndex);
        }
    }
    console.log(totalValidPairs);
}
