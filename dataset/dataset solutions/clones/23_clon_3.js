const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const fileEncoding = "utf8";
const lineSeparator = '\n';
const valueSeparator = ' ';

const rawInputContent = fileSystemModule.readFileSync(standardInputPath, fileEncoding);
const processedInputString = rawInputContent.trim();
const inputDataLines = processedInputString.split(lineSeparator);

inputDataLines.forEach(function(currentInputLine) {
    const lineValueParts = currentInputLine.split(valueSeparator);

    const stringValueOne = lineValueParts[0];
    const stringValueTwo = lineValueParts[1];

    const numericValueOne = Number(stringValueOne);
    const numericValueTwo = Number(stringValueTwo);

    const productOfValues = numericValueOne * numericValueTwo;

    let gcdCalculationVarA = numericValueOne;
    let gcdCalculationVarB = numericValueTwo;
    let currentRemainder;

    // This loop implements the Euclidean algorithm for GCD,
    // mimicking the original's behavior including NaN handling.
    while (true) {
        currentRemainder = gcdCalculationVarA % gcdCalculationVarB;
        if (isNaN(currentRemainder) || currentRemainder === 0) {
            break;
        }
        gcdCalculationVarA = gcdCalculationVarB;
        gcdCalculationVarB = currentRemainder;
    }

    const finalGreatestCommonDivisor = gcdCalculationVarB;
    const finalLeastCommonMultiple = productOfValues / finalGreatestCommonDivisor;

    console.log(finalGreatestCommonDivisor, finalLeastCommonMultiple);
});
