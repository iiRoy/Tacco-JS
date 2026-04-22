function displayOutcome(message) {
    console.log(message);
}

function analyzeStreamData(dataArray) {
    const requiredMinimumDataPoints = 6;

    if (!Array.isArray(dataArray)) {
        displayOutcome("Error: Provided input is not an array-like structure. Processing aborted.");
        return;
    }

    if (dataArray.length < requiredMinimumDataPoints) {
        displayOutcome("Error: Insufficient data entries for full comparison. Expected at least " + requiredMinimumDataPoints + ".");
        return;
    }

    const datumAtPositionTwo   = dataArray[2];
    const datumAtPositionThree = dataArray[3];
    const datumAtPositionFour  = dataArray[4];
    const datumAtPositionFive  = dataArray[5];

    const doFirstPairMatch = (datumAtPositionTwo === datumAtPositionThree);
    const doSecondPairMatch = (datumAtPositionFour === datumAtPositionFive);

    let finalDecisionState = false;

    if (doFirstPairMatch && doSecondPairMatch) {
        finalDecisionState = true;
    }

    let outcomeMessage;

    if (finalDecisionState) {
        outcomeMessage = "Affirmative";
    } else {
        outcomeMessage = "Negative";
    }

    displayOutcome(outcomeMessage);
}

(function initializeAndExecuteProcessing() {
    const fileSystemModuleReference = require("fs");
    const standardInputSourcePath = "/dev/stdin";

    let rawInputBufferContent;

    try {
        rawInputBufferContent = fileSystemModuleReference.readFileSync(standardInputSourcePath, "utf8");
    } catch (inputReadError) {
        console.error(`ERROR: Failed to retrieve data from ${standardInputSourcePath}. Details: ${inputReadError.message}`);
        rawInputBufferContent = "";
    }

    const processedLinesArray = rawInputBufferContent.split(/\r?\n/);

    analyzeStreamData(processedLinesArray);
})();