function computeValueDifference(firstValue, secondValue) {
    if (firstValue === secondValue) {
        return firstValue;
    } else if (firstValue > secondValue) {
        return firstValue - secondValue;
    } else {
        return secondValue - firstValue;
    }
}


function executePrimaryLogic(incomingProgramData) {
    initializeInputProcessor(incomingProgramData);

    let elementCount = getSegmentInteger();
    elementCount = Math.pow(2, elementCount);
    const workingNumberCollection = [];
    for (let loopIndex = 0; loopIndex < elementCount; loopIndex++) {
        workingNumberCollection[loopIndex] = getSegmentInteger();
    }

    let currentScanPosition = 0;
    while (elementCount - currentScanPosition > 1) {
        const leftElement = workingNumberCollection[currentScanPosition];
        const rightElement = workingNumberCollection[currentScanPosition + 1];
        currentScanPosition += 2;
        workingNumberCollection[elementCount++] = computeValueDifference(leftElement, rightElement);
    }
    printResultWithNewline(workingNumberCollection[elementCount - 1]);
}


// ***********************************************************************************
var parsedInputTokens;
var tokenReadPointer;


function initiateDebugging() {
    executePrimaryLogic(document.getElementById("input").value);
}


function initializeInputProcessor(rawInputString) {
    parsedInputTokens = rawInputString.replace(/\n/g, " ");
    parsedInputTokens = parsedInputTokens.split(" ");
    tokenReadPointer = 0;
}


const outputToConsole = (textForDisplay) => {
    console.log(textForDisplay)
}


const printResultWithNewline = (textForDisplay) => {
    console.log(textForDisplay + "\n")
}


const getSegmentString = () => {
    return parsedInputTokens[tokenReadPointer++];
};


const getSegmentInteger = () => {
    return parseInt(getSegmentString(), 10);
};


const getSegmentFloat = () => {
    return parseFloat(getSegmentString());
};


// This line ensures the main program logic is executed with standard input.
executePrimaryLogic(require("fs").readFileSync("/dev/stdin", "utf8"));