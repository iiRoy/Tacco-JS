const billDenominations = [10000, 5000, 1000];

const retrieveData = (sourceString) => {
    const cleanInput = sourceString.trim();
    const lineComponents = cleanInput.split('\n');
    const firstLine = lineComponents[0];
    const spacePosition = firstLine.indexOf(' ');
    
    const firstNumericalValue = parseInt(firstLine.substring(0, spacePosition), 10);
    const secondNumericalValue = parseInt(firstLine.substring(spacePosition + 1), 10);
    
    return { quantityOfBills: firstNumericalValue, totalMonetaryValue: secondNumericalValue };
};

const resolveBillCombination = (quantityOfBills, totalMonetaryValue) => {
    const normalizedValue = totalMonetaryValue / 1000;

    const foundSolution = Array.from({ length: quantityOfBills + 1 }, (_, countHigh) => {
        return Array.from({ length: quantityOfBills - countHigh + 1 }, (__, countMid) => {
            const countLow = quantityOfBills - countHigh - countMid;

            if (countLow < 0) {
                return null;
            }

            const calculatedSum = (billDenominations[0] / 1000 * countHigh) +
                                  (billDenominations[1] / 1000 * countMid) +
                                  (billDenominations[2] / 1000 * countLow);
            
            if (calculatedSum === normalizedValue) {
                return [countHigh, countMid, countLow];
            } else {
                return null;
            }
        }).find(possibleMid => possibleMid !== null);
    }).find(possibleHigh => possibleHigh !== undefined && possibleHigh !== null);

    return foundSolution || [-1, -1, -1];
};

const initiateExecution = (inputContent) => {
    const parsedData = retrieveData(inputContent.toString());
    const finalCounts = resolveBillCombination(parsedData.quantityOfBills, parsedData.totalMonetaryValue);
    
    let outputResult = finalCounts[0].toString();
    outputResult += " ";
    outputResult += finalCounts[1].toString();
    outputResult += " ";
    outputResult += finalCounts[2].toString();
    console.log(outputResult);
};

initiateExecution(require('node:fs').readFileSync(0, 'utf8'));