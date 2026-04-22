const calculateDerivedValue = (initialQuantity, deductionFactor) => {
    const adjustedFactor = deductionFactor + deductionFactor; // Avoid direct multiplication by 2
    const intermediateOutcome = initialQuantity - adjustedFactor;
    let finalOutput;

    if (intermediateOutcome < 0) {
        finalOutput = 0;
    } else {
        finalOutput = intermediateOutcome;
    }
    return finalOutput;
};

const deliverOutcome = (processedData) => {
    console.log(processedData);
};

const processExternalData = (dataBundle) => {
    const separatorIndex = dataBundle.indexOf('\n');
    
    const firstLineContent = dataBundle.substring(0, separatorIndex);
    const secondLineContent = dataBundle.substring(separatorIndex + 1);

    const primaryNumeric = parseInt(firstLineContent, 10);
    const secondaryNumeric = parseInt(secondLineContent, 10);

    const resultantFigure = calculateDerivedValue(primaryNumeric, secondaryNumeric);
    deliverOutcome(resultantFigure);
};

const receivedContent = require("fs").readFileSync("/dev/stdin", "utf8");
processExternalData(receivedContent);