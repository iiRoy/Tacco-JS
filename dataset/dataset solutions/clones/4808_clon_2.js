'use strict';

/*
 *  This script is designed to parse input data
 *  and perform a series of calculations based on
 *  specified modification instructions.
 */
function ProcessInputData(rawDataStream)
{
    // The incoming raw text is first split into an array of lines.
    const dataLinesArray = rawDataStream.split('\n');

    const numberOfElements = dataLinesArray.shift(); // The first line indicates the total element count.

    // The next line contains space-separated timings for each element.
    const elementTimings = dataLinesArray
        .shift()
        .split(' ')
        .map(timeStr => parseInt(timeStr, 10))
    ;

    const modificationCount = dataLinesArray.shift(); // This line specifies the number of modification operations.

    // All subsequent lines represent individual modification instructions.
    const modificationInstructions = dataLinesArray.map(instructionLine =>
        instructionLine.split(' ').map(paramValueStr => parseInt(paramValueStr, 10))
    );


    let initialTotalDuration = 0; // Accumulator for the base total duration.
    for (const individualDuration of elementTimings) {
        initialTotalDuration = initialTotalDuration + individualDuration; // Summing up all base durations.
    }

    const outputValues = []; // Array to store the results of each adjusted calculation.

    // Process each instruction to calculate an adjusted total duration.
    for (const currentInstruction of modificationInstructions) {
        // Calculate the specific adjustment based on the instruction.
        const durationAdjustment = elementTimings[currentInstruction[0] - 1] - currentInstruction[1];

        // Apply the adjustment to the initial total duration.
        const adjustedCalculation = initialTotalDuration - durationAdjustment;

        outputValues.push(adjustedCalculation); // Record the adjusted result.
    }


    // Print each computed result to the standard output.
    for (const finalOutput of outputValues) {
        console.log(finalOutput);
    }
}

// Entry point: Read input synchronously from stdin and invoke the processing function.
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));