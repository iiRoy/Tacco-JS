function processApplicationData(sourceTextualData) {
    "use strict";

    const extractNumericalElements = (textualSource) => {
        let currentNumericalValue = 0;
        let withinNumber = false;
        const collectedNumbers = [];
        for (let charIndex = 0; charIndex < textualSource.length; charIndex++) {
            const character = textualSource[charIndex];
            if (character >= '0' && character <= '9') {
                currentNumericalValue = currentNumericalValue * 10 + parseInt(character, 10);
                withinNumber = true;
            } else { // Separator or whitespace
                if (withinNumber) {
                    collectedNumbers.push(currentNumericalValue);
                    currentNumericalValue = 0;
                    withinNumber = false;
                }
            }
        }
        if (withinNumber) { // Capture the last number if the string ends with one
            collectedNumbers.push(currentNumericalValue);
        }
        return collectedNumbers;
    };

    const numericalData = extractNumericalElements(sourceTextualData);

    const totalElementsQuantity = numericalData.shift(); // First element dictates the count of subsequent data points

    // First condition check: Is the total quantity a multiple of three?
    const checkDivisibilityByThree = (num) => (num % 3 === 0);
    const meetsDivisibilityCondition = checkDivisibilityByThree(totalElementsQuantity);

    // Second condition check: Are all subsequent data points zero?
    const areAllElementsZero = (arr) => arr.every(item => item === 0);
    const meetsZeroValueCondition = areAllElementsZero(numericalData);

    // Early termination based on initial conditions
    if (!meetsDivisibilityCondition && !meetsZeroValueCondition) {
        return "No";
    }

    if (meetsZeroValueCondition) {
        return "Yes";
    }

    // Recursive function to process the sequence and track distinct element frequencies
    const evaluateSequenceRecursively = (
        currentPosition,
        overallSize,
        valueCollection,
        distinctValueFrequencies // Map<number, number> to store unique values and their counts
    ) => {
        // If more than 3 distinct values have been recorded at any point, it's a "No"
        if (distinctValueFrequencies.size > 3) {
            return "No";
        }

        // Base case: All elements have been processed
        if (currentPosition >= overallSize) {
            // Final check: Must have exactly 3 distinct values with equal frequencies
            if (distinctValueFrequencies.size === 3) {
                const individualCounts = Array.from(distinctValueFrequencies.values());
                if (individualCounts[0] === individualCounts[1] && individualCounts[1] === individualCounts[2]) {
                    return "Yes";
                }
            }
            return "No"; // Either not 3 distinct values, or their frequencies are not equal
        }

        const currentDatum = valueCollection[currentPosition];
        let updatedFrequencies = new Map(distinctValueFrequencies); // Create a new Map for immutable state update

        if (updatedFrequencies.has(currentDatum)) {
            // If the element is already recognized, increment its frequency
            updatedFrequencies.set(currentDatum, updatedFrequencies.get(currentDatum) + 1);
        } else {
            // If it's a new unique element
            if (updatedFrequencies.size === 3) { // If we're about to add a 4th unique element
                return "No";
            }
            updatedFrequencies.set(currentDatum, 1); // Add the new unique element with a frequency of 1
        }
        
        // Recurse with the next element in the sequence and the updated frequency map
        return evaluateSequenceRecursively(currentPosition + 1, overallSize, valueCollection, updatedFrequencies);
    };

    // Initiate the recursive evaluation with the first data point and an empty frequency map
    const finalOutcome = evaluateSequenceRecursively(0, totalElementsQuantity, numericalData, new Map());
    return finalOutcome;
}

// Standard input reading and output printing mechanism
const receivedContent = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(processApplicationData(receivedContent));