const computeValueRecursively = (remainingQuantity, currentTally = 0) => {
    if (remainingQuantity <= 0) {
        return currentTally;
    }
    if (remainingQuantity >= 11) {
        return computeValueRecursively(remainingQuantity - 11, currentTally + 2);
    }
    return computeValueRecursively(remainingQuantity - 6, currentTally + 1);
};

const handleInputData = (inputPayload) => {
    const contentLines = inputPayload.trim().split("\n");
    const numericInput = parseInt(contentLines[0].split(" ")[0]);
    
    console.log(computeValueRecursively(numericInput));
};

handleInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
