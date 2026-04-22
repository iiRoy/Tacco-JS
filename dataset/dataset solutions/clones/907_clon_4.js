let collectedInputData = [];
let currentDataPointer = 0;

const acquireNumericalValue = () => +collectedInputData[currentDataPointer++];
const acquireTextSegment = () => collectedInputData[currentDataPointer++];
const displayResult = (value) => console.log(value);

const deriveSignature = (textSegment) => {
    return Array.from(textSegment).reduce((balance, symbol) => {
        let [leftDeficit, rightSurplus] = balance;
        if (symbol === '(') {
            rightSurplus++;
        } else { // symbol is ')'
            if (rightSurplus > 0) {
                rightSurplus--;
            } else {
                leftDeficit++;
            }
        }
        return [leftDeficit, rightSurplus];
    }, [0, 0]);
};

const comparisonCriterion = (firstItem, secondItem) => {
    const firstNetBalance = firstItem[1] - firstItem[0];
    const secondNetBalance = secondItem[1] - secondItem[0];

    if (firstNetBalance !== secondNetBalance) {
        return secondNetBalance - firstNetBalance;
    }
    return secondItem[0] - firstItem[0];
};

const executeCoreLogic = () => {
    const entryCount = acquireNumericalValue();
    const sourceFragments = Array.from({ length: entryCount }).map(() => acquireTextSegment());

    let signaturesList = sourceFragments.map(deriveSignature);
    signaturesList.sort(comparisonCriterion);

    let currentOpenCount = 0;
    let sequenceCompletionPossible = true;

    for (let iterationStep = 0; iterationStep < entryCount; iterationStep++) {
        let itemProcessedInCurrentStep = false;
        
        for (let signaturePos = 0; signaturePos < entryCount; signaturePos++) {
            const currentSignature = signaturesList[signaturePos];

            if (currentSignature !== null && currentOpenCount >= currentSignature[0]) {
                currentOpenCount += (currentSignature[1] - currentSignature[0]);
                signaturesList[signaturePos] = null;
                itemProcessedInCurrentStep = true;
                break;
            }
        }

        if (!itemProcessedInCurrentStep) {
            sequenceCompletionPossible = false;
            break;
        }
    }

    displayResult(sequenceCompletionPossible && currentOpenCount === 0 ? 'Yes' : 'No');
};
 
process.stdin.resume();
process.stdin.setEncoding('utf8');
 
let rawInputBuffer = '';
process.stdin.on('data', (chunk) => {
    rawInputBuffer += chunk;
});
process.stdin.on('end', () => {
    collectedInputData = rawInputBuffer.trim().split(/\s+/);
    executeCoreLogic();
});