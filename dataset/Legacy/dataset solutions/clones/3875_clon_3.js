'use strict';

// A small utility function to ensure consistent numeric parsing.
// This replaces the `~~` operator with a more explicit conversion.
const convertToNumber = (stringValue) => {
    return Number(stringValue);
};

// A helper function to compute the sum of an array of numbers.
const computeArraySum = (numericArray) => {
    // Initialize accumulator with 0 to handle empty arrays gracefully,
    // though problem context implies non-empty arrays.
    return numericArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
};

function processInputData(rawDataString) {
    // Step 1: Parse the raw input string into an array of string tokens.
    // The original regex `/\n|\s/` handles both newlines and spaces as delimiters.
    const stringSegments = rawDataString.split(/\n|\s/);

    // Step 2: Convert each string segment into its numeric representation.
    // This uses the `convertToNumber` helper for clarity and consistency.
    const numericDataPoints = stringSegments.map(convertToNumber);

    // The second element in the parsed input represents the target quantity.
    const desiredTotalQuantity = numericDataPoints[1];

    // The remaining elements (from index 2 onwards) are the initial recipe components.
    const initialRecipeComponents = numericDataPoints.slice(2);

    // Sort the recipe components in ascending order.
    // This is crucial for identifying the smallest component later.
    const orderedRecipeComponents = initialRecipeComponents.sort((componentA, componentB) => componentA - componentB);

    // Calculate the sum of all currently available recipe components.
    // This uses the `computeArraySum` helper function.
    const currentComponentsTotalSum = computeArraySum(orderedRecipeComponents);

    // Identify the smallest component value. This will be the first element
    // after sorting.
    const smallestComponentUnit = orderedRecipeComponents[0];

    // Determine the number of components already present in the recipe.
    const existingComponentCount = orderedRecipeComponents.length;

    // Calculate the quantity that still needs to be covered after using
    // all existing components.
    const remainingQuantityNeeded = desiredTotalQuantity - currentComponentsTotalSum;

    // If the remaining quantity is positive, calculate how many additional
    // smallest components can be added to reach or exceed the desired total.
    // Math.floor ensures we only count whole components.
    const additionalUnitsPossible = Math.floor(remainingQuantityNeeded / smallestComponentUnit);

    // The final answer is the sum of existing components and the additional
    // components that can be added.
    const finalCalculatedResult = additionalUnitsPossible + existingComponentCount;

    // Output the final result to the console.
    console.log(finalCalculatedResult);
}

// Read the input from standard input and pass it to the processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
