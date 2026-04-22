/*
 * This module provides a function to determine if a given travel scenario is feasible.
 * It evaluates if a certain distance can be covered within a specified time limit
 * at a constant speed.
 */
const assessTravelCapability = (dataLine) => {
    // Input parsing and validation
    // The input string is expected to contain three space-separated numeric values:
    // 1. Total distance to be covered.
    // 2. Maximum allowed time for the journey.
    // 3. Constant speed at which travel occurs.
    const rawComponents = dataLine.trim().split(/\s+/); // Use regex for robust splitting

    // Basic validation for input format
    if (rawComponents.length !== 3) {
        console.error("Error: Input line must contain exactly three numeric values (Distance, Time, Speed).");
        // For Type III, we can add a default behavior instead of just erroring
        console.log("No"); // Assume impossible if input is malformed
        return;
    }

    // Explicitly parse string components into floating-point numbers
    const distanceValue = parseFloat(rawComponents[0]);
    const maxAllowedTime = parseFloat(rawComponents[1]);
    const vehicleSpeed = parseFloat(rawComponents[2]);

    // Validate parsed numeric values
    if (isNaN(distanceValue) || isNaN(maxAllowedTime) || isNaN(vehicleSpeed)) {
        console.error("Error: One or more input values are not valid numbers.");
        console.log("No"); // Assume impossible if numbers are malformed
        return;
    }

    let journeyIsPossible; // Intermediate variable for the decision

    // Edge case handling for speed:
    // If speed is zero or negative, movement is generally impossible for positive distance.
    if (vehicleSpeed <= 0) {
        if (distanceValue > 0) {
            // Cannot cover a positive distance with zero or negative speed.
            journeyIsPossible = false;
        } else {
            // If distance is zero or negative, it's already "covered" or not applicable.
            // Assuming distance >= 0 for this problem context.
            // If distance is 0, it's already reached, so "Yes".
            journeyIsPossible = true;
        }
    } else {
        // Core logic: Check if the product of time and speed is sufficient to cover the distance.
        // This avoids potential division by zero and floating-point precision issues
        // compared to (distance / speed) <= time.
        const effectiveTravelCapacity = maxAllowedTime * vehicleSpeed;
        journeyIsPossible = effectiveTravelCapacity >= distanceValue;
    }

    // Determine the final outcome message
    const finalVerdict = journeyIsPossible ? "Yes" : "No";

    // Output the result
    console.log(finalVerdict);
};

// Main execution block: reads input from standard input and processes it.
// This part remains outside the main logic function, demonstrating typical usage.
try {
    const inputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    assessTravelCapability(inputContent.trim()); // Trim to handle potential leading/trailing newlines
} catch (errorReadingFile) {
    console.error("Failed to read input from /dev/stdin:", errorReadingFile.message);
    // Provide a fallback or default behavior in case of input reading failure
    // For a Type III clone, adding a default input or exit strategy is a valid addition.
    assessTravelCapability("0 0 1"); // Example: default to a trivial "Yes" case if input fails
}