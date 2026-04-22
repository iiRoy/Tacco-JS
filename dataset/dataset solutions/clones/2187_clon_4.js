const processInputData = (rawText) => {
    const capturedParts = rawText.match(/(\d+)\s+(\d+)/);
    const textualNumbers = [capturedParts[1], capturedParts[2]];
    console.log(textualNumbers);
    return { subject: Number(capturedParts[1]), operand: Number(capturedParts[2]) };
};

const performDivisionRecursively = (currentDividend, currentDivisor, resultCount = 0) => {
    if (currentDivisor > currentDividend) {
        return resultCount;
    } else {
        return performDivisionRecursively(currentDividend - currentDivisor, currentDivisor, resultCount + 1);
    }
};

const orchestrateExecution = () => {
    const acquiredContent = require('node:fs').readFileSync('/dev/stdin', 'utf8');
    const parsedValues = processInputData(acquiredContent);
    const finalQuotient = performDivisionRecursively(parsedValues.subject, parsedValues.operand);
    console.log(finalQuotient);
};

orchestrateExecution();