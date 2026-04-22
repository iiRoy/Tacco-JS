const executeCoreLogic = (rawInputText) => {

    if (rawInputText === null || rawInputText === undefined || typeof rawInputText !== 'string' || rawInputText.trim() === "") {
        console.error("Error: Input provided is empty, null, undefined, or not a string. Cannot process.");
        return;
    }

    const inputDataLines = rawInputText.split('\n');
    let primaryDataLine = "";

    if (inputDataLines.length > 0) {
        primaryDataLine = inputDataLines[0].trim();
    } else {
        console.error("Error: No valid lines found in the input data string.");
        return;
    }

    const stringComponents = primaryDataLine.split(/\s+/).filter(component => component.length > 0);

    const parsedNumericValues = [];
    const REQUIRED_VALUE_COUNT = 3;

    for (let i = 0; i < stringComponents.length; i++) {
        const currentComponent = stringComponents[i];
        const convertedNumber = parseInt(currentComponent, 10);

        if (isNaN(convertedNumber)) {
            // Optionally, handle non-numeric components more strictly or log a warning
            // For now, we'll just skip them, aligning with original behavior of parseInt returning NaN
            continue;
        }
        parsedNumericValues.push(convertedNumber);
    }

    if (parsedNumericValues.length < REQUIRED_VALUE_COUNT) {
        console.error(`Error: Expected at least ${REQUIRED_VALUE_COUNT} numeric values, but found ${parsedNumericValues.length}.`);
        return;
    }

    const valueA = parsedNumericValues[0];
    const valueB = parsedNumericValues[1];
    const valueC = parsedNumericValues[2];

    const differenceOperation = valueA - valueB;
    const finalCalculationResult = valueC - differenceOperation;

    let displayResult;

    if (finalCalculationResult < 0) {
        displayResult = 0;
    } else {
        displayResult = finalCalculationResult;
    }

    console.log(displayResult);
};

const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const fileEncoding = "utf8";

try {
    const fileContentBuffer = fileSystemModule.readFileSync(standardInputPath, fileEncoding);
    executeCoreLogic(fileContentBuffer.toString());
} catch (readError) {
    console.error(`An I/O error occurred while attempting to read from ${standardInputPath}: ${readError.message}`);
    // Potentially exit with a non-zero status code in a real application
    // process.exit(1);
}