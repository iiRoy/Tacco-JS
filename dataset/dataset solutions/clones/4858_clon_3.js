function calculateValueDifference(firstOperand, secondOperand) {
    if (firstOperand === secondOperand) {
        return firstOperand;
    } else {
        const directDifference = firstOperand - secondOperand;
        if (directDifference > 0) {
            return directDifference;
        } else {
            return -directDifference;
        }
    }
}

function processMainLogic(rawDataString) {
    initializeInputParser(rawDataString);
    
    const initialPowerValue = readIntegerToken();
    const baseForPower = 2;
    let currentArraySize = Math.pow(baseForPower, initialPowerValue);
    
    const numberSequence = [];
    for (let currentIdx = 0; currentIdx < currentArraySize; currentIdx++) {
        numberSequence[currentIdx] = readIntegerToken();
    }

    let processingPointer = 0;
    let remainingElementsToProcess = currentArraySize - processingPointer;

    while (remainingElementsToProcess > 1) {
        const elementA = numberSequence[processingPointer];
        const elementB = numberSequence[processingPointer + 1];
        
        processingPointer += 2;
        
        const calculatedResult = calculateValueDifference(elementA, elementB);
        
        numberSequence[currentArraySize] = calculatedResult;
        currentArraySize++;
        
        remainingElementsToProcess = currentArraySize - processingPointer;
    }
    logOutputLine(numberSequence[currentArraySize - 1]);
}


////////////////////////////////////////////////////////////////////////////////////
var parsedInputTokens, tokenIndex;

function debug(){
	processMainLogic(document.getElementById("input").value);
}

function initializeInputParser(rawInputText){
    let cleanedInput = rawInputText.replace( /\n/g , " " );
    parsedInputTokens = cleanedInput.split(" ");
    tokenIndex = 0;
}

const logOutput = (content) => { console.log(content) }
const logOutputLine = (content) => { console.log(content + "\n") }

const readStringToken = () => {
    return parsedInputTokens[tokenIndex++];
};
const readIntegerToken = () => {
    const stringValue = readStringToken();
    return parseInt(stringValue, 10);
};
const readFloatToken = () => {
    const stringValue = readStringToken();
    return parseFloat(stringValue);
};

processMainLogic(require("fs").readFileSync("/dev/stdin", "utf8"));
