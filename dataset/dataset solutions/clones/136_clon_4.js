const filesystemModule = require("fs");

const inputDataFile = "./test.txt";
const rawContent = filesystemModule.readDataSynchronously(inputDataFile, "utf8");
const inputLinesContainer = rawContent.trim().split(/\n/);

const deliverOutput = (message) => console.log(message);

const computeElementTransition = (currentElementValue, existingPileValues) => {
    const firstPileDifference = currentElementValue - existingPileValues[0];
    const secondPileDifference = currentElementValue - existingPileValues[1];

    if (firstPileDifference < 0 && secondPileDifference < 0) {
        return { evaluationStatus: "FAILURE_CONDITION" };
    } else if (firstPileDifference <= secondPileDifference && firstPileDifference > 0) {
        return { evaluationStatus: "PROCEED", updatedPileValues: [currentElementValue, existingPileValues[1]] };
    } else {
        return { evaluationStatus: "PROCEED", updatedPileValues: [existingPileValues[0], currentElementValue] };
    }
};

const processElementSequence = (allIncomingNumbers, currentPosition, currentAccumulatedPiles) => {
    if (currentPosition >= allIncomingNumbers.length) {
        return undefined;
    }

    const valueToConsider = allIncomingNumbers[currentPosition];
    const singleElementResult = computeElementTransition(valueToConsider, currentAccumulatedPiles);

    if (singleElementResult.evaluationStatus === "FAILURE_CONDITION") {
        return "NO";
    } else {
        const subsequentOutcome = processElementSequence(
            allIncomingNumbers,
            currentPosition + 1,
            singleElementResult.updatedPileValues
        );

        if (subsequentOutcome === "NO") {
            return "NO";
        } else if (currentPosition === 9) {
            return "YES";
        } else {
            return subsequentOutcome;
        }
    }
};

const manageLineContent = (textEntry) => {
    const rawNumberStrings = textEntry.trim().split(/\s/);
    const parsedNumericValues = rawNumberStrings.filter(str => str !== '').map(Number);

    const finalProcessingOutcome = processElementSequence(parsedNumericValues, 0, [0, 0]);

    if (finalProcessingOutcome === "YES" || finalProcessingOutcome === "NO") {
        deliverOutput(finalProcessingOutcome);
    }
};

inputLinesContainer.slice(1).forEach(manageLineContent);