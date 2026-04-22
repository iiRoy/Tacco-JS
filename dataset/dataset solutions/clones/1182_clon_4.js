const retrieveInputData = require("node:fs").readFileSync("/dev/stdin", "utf8");

const adjustAndSegmentText = (sourceText) => {
    let modifiedText = sourceText;

    // Custom removal of trailing newline(s)
    if (modifiedText.length > 0) {
        if (modifiedText.endsWith('\r\n')) {
            modifiedText = modifiedText.slice(0, -2);
        } else if (modifiedText.endsWith('\n')) {
            modifiedText = modifiedText.slice(0, -1);
        }
    }

    // Custom splitting into lines, handling carriage returns
    const interimLines = modifiedText.split('\n');
    const finalProcessedLines = [];
    let currentLineIndex = 0;
    const totalLineCount = interimLines.length;
    while (currentLineIndex < totalLineCount) {
        finalProcessedLines.push(interimLines[currentLineIndex].replace('\r', ''));
        currentLineIndex++;
    }
    return finalProcessedLines;
};

const processAllCalculations = (inputLinesCollection) => {

    const parseNumericSequence = (textLine) => {
        const partsArray = textLine.split(" ");
        const numericResults = [];
        let itemCounter = 0;
        const totalItems = partsArray.length;
        while (itemCounter < totalItems) {
            numericResults.push(Number(partsArray[itemCounter]));
            itemCounter++;
        }
        return numericResults;
    };

    const vectorOne = parseNumericSequence(inputLinesCollection[1]);
    const vectorTwo = parseNumericSequence(inputLinesCollection[2]);

    const findAbsoluteValue = (val) => {
        return val < 0 ? -val : val;
    };

    const calculateIntegerPower = (baseVal, exponentVal) => {
        if (exponentVal === 0) return 1;
        let resultProduct = 1;
        let powerIteration = 0;
        while (powerIteration < exponentVal) {
            resultProduct *= baseVal;
            powerIteration++;
        }
        return resultProduct;
    };

    const computeNthRoot = (baseVal, rootVal) => {
        return baseVal ** (1 / rootVal);
    };

    const determineVectorNorm = (firstVec, secondVec, exponentFactor) => {
        let sumOfPowers = 0;
        let elementIndex = 0;
        const vectorLength = firstVec.length;
        while (elementIndex < vectorLength) {
            const elementDifference = firstVec[elementIndex] - secondVec[elementIndex];
            sumOfPowers += calculateIntegerPower(findAbsoluteValue(elementDifference), exponentFactor);
            elementIndex++;
        }
        return computeNthRoot(sumOfPowers, exponentFactor);
    };

    const calculateMaximumDifference = (firstVec, secondVec) => {
        let largestDifference = 0;
        let elementIdx = 0;
        const vecLen = firstVec.length;
        while (elementIdx < vecLen) {
            const currentDiff = findAbsoluteValue(firstVec[elementIdx] - secondVec[elementIdx]);
            if (currentDiff > largestDifference) {
                largestDifference = currentDiff;
            }
            elementIdx++;
        }
        return largestDifference;
    };

    console.log(determineVectorNorm(vectorOne, vectorTwo, 1));
    console.log(determineVectorNorm(vectorOne, vectorTwo, 2));
    console.log(determineVectorNorm(vectorOne, vectorTwo, 3));
    console.log(calculateMaximumDifference(vectorOne, vectorTwo));
};

const finalInputData = adjustAndSegmentText(retrieveInputData);
processAllCalculations(finalInputData);