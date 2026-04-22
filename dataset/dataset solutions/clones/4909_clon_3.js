process.stdin.resume();
process.stdin.setEncoding('utf8');

let incomingDataSegments = [];

const inputCoordinator = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout // Including output stream, though not directly used for writing here.
});

inputCoordinator.on('line', (currentInputLine) => {
  incomingDataSegments.push(currentInputLine);
});

inputCoordinator.on('close', () => {
    // Verify that input was actually provided.
    if (incomingDataSegments.length === 0) {
        console.error("Program terminated: No input lines were received.");
        return; // Exit early if no data.
    }

    // Extract the first line which should contain our primary data.
    const initialRawInput = incomingDataSegments[0];

    // Split the input string into potential numerical components.
    const numericStringComponents = initialRawInput.split(" ");

    // Validate that we have at least two parts for our calculation.
    if (numericStringComponents.length < 2) {
        console.error("Program terminated: Insufficient numerical components in the first input line. Expected at least two.");
        return; // Exit early if input is malformed.
    }

    // Explicitly parse the first two components as integers.
    const firstInputNumber = parseInt(numericStringComponents[0], 10);
    const secondInputNumber = parseInt(numericStringComponents[1], 10);

    // Validate that parsing resulted in valid numbers.
    if (Number.isNaN(firstInputNumber) || Number.isNaN(secondInputNumber)) {
        console.error("Program terminated: One or both input components could not be parsed as valid integers.");
        return; // Exit early on invalid numerical input.
    }

    // Introduce intermediate variables for the calculation logic.
    const baseValueForPower = secondInputNumber - 1;
    const exponentValueForPower = firstInputNumber - 1;

    // An optional check for the exponent, adding robustness.
    if (exponentValueForPower < 0 && baseValueForPower === 0) {
        // 0 to a negative power is undefined or infinity depending on context, handle as error.
        console.error("Program terminated: Cannot calculate 0 raised to a negative power.");
        return;
    }

    // Perform the power calculation.
    const calculatedPowerResult = Math.pow(baseValueForPower, exponentValueForPower);

    // Compute the final product.
    const finalComputationOutcome = calculatedPowerResult * secondInputNumber;

    // Output the final result to the console.
    console.log(finalComputationOutcome);

    // Optional: Log a message indicating successful completion.
    // console.log("Calculation successfully completed and result displayed.");
});

// The previous 'min' utility function has been deliberately removed as part of Type III cloning,
// as it was not essential to the core functionality demonstrated and thus constitutes a valid deletion.