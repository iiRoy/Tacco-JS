global.process.stdin.resume();
global.process.stdin.setEncoding("utf8");
global.process.stdin.on("data", (payloadContent) => {
    const processedInfo = decodeStreamPayload(payloadContent);
    const ultimateOutcome = calculateSubsetSum(processedInfo.thresholdParam, processedInfo.numericSequence);
    console.log(ultimateOutcome);
});

const decodeStreamPayload = (sourceMaterial) => {
    const extractedNumbers = sourceMaterial.match(/\d+/g).map(Number);

    const initialValue = extractedNumbers[0];
    const thresholdParam = extractedNumbers[1];
    const numericSequence = extractedNumbers.slice(2);

    return {
        initialValue: initialValue,
        thresholdParam: thresholdParam,
        numericSequence: numericSequence,
    };
};

const calculateSubsetSum = (selectionCount, sourceArray) => {
    let currentSum = 0;
    const mutableCollection = [...sourceArray];

    for (let iterationIndex = 0; iterationIndex < selectionCount; iterationIndex++) {
        if (mutableCollection.length === 0) {
            break;
        }

        let minimumElement = Infinity;
        let minimumElementPosition = -1;

        for (let searchIndex = 0; searchIndex < mutableCollection.length; searchIndex++) {
            if (mutableCollection[searchIndex] < minimumElement) {
                minimumElement = mutableCollection[searchIndex];
                minimumElementPosition = searchIndex;
            }
        }

        currentSum += minimumElement;
        mutableCollection.splice(minimumElementPosition, 1);
    }

    return currentSum;
};