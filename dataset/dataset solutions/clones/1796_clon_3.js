"use strict";

// Helper function to safely parse an integer from a string
const parseNumericValue = (strValue) => {
    const parsed = Number(strValue);
    // Add a basic validation: return 0 or throw if not a number
    if (isNaN(parsed)) {
        console.error(`Warning: Could not parse "${strValue}" as a number. Using 0.`);
        return 0;
    }
    return Math.floor(parsed); // Ensure it's an integer
};

// Helper function for reading file content
const acquireSourceData = (filePath) => {
    try {
        return require('fs').readFileSync(filePath, 'utf8');
    } catch (error) {
        console.error(`Error reading input file at ${filePath}:`, error.message);
        // Provide a default or exit if file reading fails critically
        return "0 0\n0";
    }
};

// Main processing function for the light simulation
const executeLightSimulation = (rawDataPayload) => {
    // Trim whitespace and split into individual lines for processing
    const processedLines = rawDataPayload.trim().split("\n");

    // Ensure there are at least two lines for N, K and the initial array
    if (processedLines.length < 2) {
        console.error("Insufficient input data. Expected at least two lines.");
        return; // Exit if input is malformed
    }

    // Parse the first line to get array size and number of iterations
    const [sizeStr, iterationsStr] = processedLines[0].split(" ");
    const arraySize = parseNumericValue(sizeStr);
    const numIterations = parseNumericValue(iterationsStr);

    // Validate parsed values
    if (arraySize <= 0 || numIterations < 0) {
        console.warn(`Invalid array size (${arraySize}) or iterations (${numIterations}). Exiting.`);
        if (arraySize === 0) {
            console.log(""); // Output empty for zero size
            return;
        }
    }

    // Parse the initial array of light intensities
    let currentLightIntensities = processedLines[1].split(" ").map(parseNumericValue);

    // If initial array is empty or malformed for the given size
    if (currentLightIntensities.length !== arraySize) {
        console.warn(`Initial array length (${currentLightIntensities.length}) does not match declared size (${arraySize}). Adjusting.`);
        // Pad or truncate to match arraySize
        if (currentLightIntensities.length < arraySize) {
            currentLightIntensities = currentLightIntensities.concat(new Array(arraySize - currentLightIntensities.length).fill(0));
        } else if (currentLightIntensities.length > arraySize) {
            currentLightIntensities = currentLightIntensities.slice(0, arraySize);
        }
    }

    // Early exit if no iterations are needed
    if (numIterations === 0) {
        console.log(currentLightIntensities.join(" "));
        return;
    }

    // --- Core Simulation Loop ---
    // Iterate for the specified number of simulation steps
    for (let currentIteration = 0; currentIteration < numIterations; currentIteration++) {
        // Initialize a difference array (or "imos" array) for efficient range updates.
        // It's one element larger than the main array to handle right boundaries.
        const lightDifferenceAccumulator = Array.from({ length: arraySize + 1 }, () => 0);

        // First pass: Apply light intensity ranges to the difference array
        // Each element `currentLightIntensities[pos]` represents a 'light source'
        // that illuminates a range around `pos`.
        for (let position = 0; position < arraySize; position++) {
            const lightRadius = currentLightIntensities[position];

            // Calculate the effective left and right bounds of the light source's influence.
            // Left bound: max(0, current_position - light_radius)
            // Right bound: min(arraySize, current_position + light_radius + 1)
            // The +1 for the right bound is because `imos[r]--` means the effect ends *before* index `r`.
            const effectiveLeftIndex = Math.max(0, position - lightRadius);
            const effectiveRightIndex = Math.min(position + lightRadius + 1, arraySize);

            // Increment at the start of the range and decrement at the end of the range.
            // This marks the influence of the current light source.
            lightDifferenceAccumulator[effectiveLeftIndex]++;
            lightDifferenceAccumulator[effectiveRightIndex]--;
        }

        // Second pass: Convert the difference array into a prefix sum array.
        // After this, lightDifferenceAccumulator[idx] will hold the total 'light count'
        // for the element at index `idx`.
        let currentCumulativeLight = 0;
        const nextLightIntensities = []; // Store the results for the next state
        for (let idx = 0; idx < arraySize; idx++) {
            currentCumulativeLight += lightDifferenceAccumulator[idx];
            nextLightIntensities.push(currentCumulativeLight);
        }

        // Check for the "all cells lit" condition to potentially break early.
        // If all cells in the array have a light count equal to `arraySize`,
        // it means they are all fully illuminated, and further iterations
        // won't change the state.
        let isSimulationStagnant = true;
        for (let idx = 0; idx < arraySize; idx++) {
            if (nextLightIntensities[idx] !== arraySize) {
                isSimulationStagnant = false;
                break;
            }
        }

        // Update the main array for the next iteration
        currentLightIntensities = nextLightIntensities;

        // If the simulation has reached a stable state, we can stop early.
        if (isSimulationStagnant) {
            // Optional: Log that an early exit occurred
            // console.log(`Simulation stabilized after ${currentIteration + 1} iterations.`);
            break;
        }
    }

    // Output the final state of the light intensities, joined by spaces.
    console.log(currentLightIntensities.join(" "));
};

// Entry point of the script
executeLightSimulation(acquireSourceData('/dev/stdin'));