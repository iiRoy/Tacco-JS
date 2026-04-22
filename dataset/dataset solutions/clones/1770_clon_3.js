// This script evaluates a hypothetical scenario
// involving creatures with either two or four limbs.

function analyzeCreatureCounts(inputStringData) {
    // Basic input validation: ensure data is a string and not empty
    if (typeof inputStringData !== 'string' || inputStringData.trim().length === 0) {
        console.error("Error: Invalid or empty input data provided.");
        return;
    }

    // Prepare the raw input for parsing
    const processedInput = inputStringData.trim();
    const dataSegments = processedInput.split(" ");

    // Further validation: ensure we have exactly two numeric segments
    if (dataSegments.length !== 2) {
        console.error("Error: Input format incorrect. Expected two numbers separated by a space.");
        return;
    }

    // Convert string segments to numerical values
    // Using Number() constructor for type conversion, slightly different from parseInt
    const creatureCount = Number(dataSegments[0]);
    const totalLegsObserved = Number(dataSegments[1]);

    // Validate parsed numbers are actual numbers and non-negative
    if (isNaN(creatureCount) || isNaN(totalLegsObserved) || creatureCount < 0 || totalLegsObserved < 0) {
        console.error("Error: Invalid numerical values detected. Counts must be non-negative integers.");
        return;
    }

    // Calculate the minimum and maximum possible leg counts for 'creatureCount' animals
    // assuming they are all 2-legged or all 4-legged, respectively.
    const minimumPossibleLegs = creatureCount * 2;
    const maximumPossibleLegs = creatureCount * 4;

    // Introduce an intermediate variable for leg difference, which must be even.
    const legDifferenceFromMin = totalLegsObserved - minimumPossibleLegs;

    // Determine if the observed total legs fall within the possible range AND
    // if the 'extra' legs (beyond the 2-legged minimum) can be formed by adding 2 legs per 4-legged creature.
    const isScenarioPlausible =
        (totalLegsObserved >= minimumPossibleLegs) &&
        (totalLegsObserved <= maximumPossibleLegs) &&
        (legDifferenceFromMin % 2 === 0);

    // Output the result using a ternary operator for conciseness
    console.log(isScenarioPlausible ? "Yes, this is a possible configuration." : "No, this scenario is not possible.");
}

// Entry point: Read input from standard input and pass to the main processing function.
// This part remains mostly the same as it's environment-specific I/O.
const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const encodingType = "utf8";

try {
    const rawInputData = fileSystemModule.readFileSync(standardInputPath, encodingType);
    analyzeCreatureCounts(rawInputData);
} catch (error) {
    console.error(`Failed to read from stdin: ${error.message}`);
}