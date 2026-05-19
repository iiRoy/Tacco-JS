const rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// Immediately Invoked Function Expression to encapsulate the logic
(incomingData => {
    // Split the input string into an array of lines
    const dataRows = incomingData.split('\n');

    // Parse the first line as the target integer value
    // Using Number() for explicit type conversion
    const targetValue = Number(dataRows[0]);

    /**
     * Calculates a specific sum of squares and products for three input numbers.
     * This function implements the core mathematical operation.
     * @param {number} valA - The first integer.
     * @param {number} valB - The second integer.
     * @param {number} valC - The third integer.
     * @returns {number} The calculated sum.
     */
    const calculateSumOfSquaresAndProducts = (valA, valB, valC) => {
        return valA * valA + valB * valB + valC * valC + valA * valB + valB * valC + valA * valC;
    };

    // Initialize an array to store frequency counts.
    // The size is targetValue + 1, filled with zeros.
    const frequencyCounts = Array(targetValue + 1).fill(0);

    // Iterate through all possible combinations of three integers (1 to targetValue)
    for (let idxA = 1; idxA <= targetValue; idxA++) {
        for (let idxB = 1; idxB <= targetValue; idxB++) {
            for (let idxC = 1; idxC <= targetValue; idxC++) {
                // Calculate the sum using the defined function
                const currentSum = calculateSumOfSquaresAndProducts(idxA, idxB, idxC);

                // If the calculated sum is within the valid range (<= targetValue),
                // increment its frequency count in the array.
                if (currentSum <= targetValue) {
                    frequencyCounts[currentSum]++;
                } else {
                    // Optimization: If currentSum exceeds targetValue,
                    // further increments of idxC will also exceed it, so break.
                    break;
                }
            }
        }
    }

    // Remove the first element (index 0), as problem constraints usually start from 1.
    // This effectively shifts all elements to the left.
    frequencyCounts.shift();

    // Iterate through the remaining frequency counts and print each one.
    frequencyCounts.forEach(countEntry => {
        console.log(countEntry);
    });

})(rawData); // Pass the raw input data to the IIFE
