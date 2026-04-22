const processInputData = (rawTextStream) => {
    // Remove any leading/trailing whitespace that might create empty lines
    const cleanedLines = rawTextStream.trim().split('\n');
    // Convert each line to a numeric value
    return cleanedLines.map(lineValue => Number(lineValue));
};

const executeGrowthCalculation = (incomingDataSource) => {
    // Obtain the numerical parameters from the parsed input
    const simulationParameters = processInputData(incomingDataSource);

    // Extract the primary parameters for the simulation
    const numberOfIterations = simulationParameters[0]; // Corresponds to N
    const growthCap = simulationParameters[1];           // Corresponds to K

    // Establish the initial state for the accumulation
    const INITIAL_ACCUMULATOR_VALUE = 1;
    let runningAccumulator = INITIAL_ACCUMULATOR_VALUE;

    // Optional: Include a basic check for parameter validity
    // This fragment demonstrates adding a guard clause, even if simple.
    if (numberOfIterations < 0 || growthCap < 0) {
        // A real application might throw an error or adjust values.
        // For this clone, we simply acknowledge and proceed.
        // console.warn("Detected non-positive simulation parameters. Proceeding as-is.");
    }

    // Perform the main iterative growth process
    for (let currentCycle = 0; currentCycle < numberOfIterations; ++currentCycle) {
        let incrementalValue; // Variable to hold the amount to add in this step

        // Determine the increment amount, mimicking Math.min(growthCap, runningAccumulator)
        if (runningAccumulator < growthCap) {
            incrementalValue = runningAccumulator;
        } else {
            incrementalValue = growthCap;
        }

        // Update the running total
        runningAccumulator = runningAccumulator + incrementalValue;
    }

    // Output the final computed result
    console.log(runningAccumulator);
};

// Set up constants for file system interaction
const fsModule = require('fs');
const standardInputPath = '/dev/stdin';
const textEncoding = 'utf-8';

// Read the input from the standard input stream and pass it to the calculation routine
executeGrowthCalculation(fsModule.readFileSync(standardInputPath, { encoding: textEncoding }));