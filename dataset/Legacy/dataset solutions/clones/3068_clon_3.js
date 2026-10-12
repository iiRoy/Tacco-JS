function calculateTotal(rawInput) {
    // Parse the input string into an array of numbers.
    // This step is extracted into a separate constant for clarity.
    const parsedLines = rawInput.split("\n").map(Number);

    // Initialize the array of numbers to be processed.
    // Using slice(0, 5) explicitly takes the first five elements,
    // which is a structural modification from direct indexing.
    const inputNumbers = parsedLines.slice(0, 5);

    // Define a small helper function to encapsulate the custom modulo logic
    // used for sorting. This is a Type III addition.
    const getEffectiveRemainder = (value) => {
        const remainder = value % 10;
        // If the remainder is 0, treat it as 10 for sorting purposes.
        return remainder === 0 ? 10 : remainder;
    };

    // Sort the numbers based on their effective remainder in descending order.
    // Identifier names for comparator arguments are changed for clarity.
    inputNumbers.sort((valA, valB) => {
        const modA = getEffectiveRemainder(valA);
        const modB = getEffectiveRemainder(valB);
        // The original's Number() casts are redundant and removed.
        return modB - modA;
    });

    let finalSum = 0;
    // Introduce a helper constant for the array length to improve readability
    // and avoid repeated property access.
    const numCount = inputNumbers.length;

    // This loop structure is a Type III modification.
    // Instead of a single loop with an if/else for the last element,
    // we sum the first (numCount - 1) elements using the rounded-up logic.
    for (let currentIndex = 0; currentIndex < numCount - 1; currentIndex++) {
        const currentNumber = inputNumbers[currentIndex];
        // Calculate the value as per the original logic: ceil(num / 10) * 10.
        finalSum += Math.ceil(currentNumber / 10) * 10;
    }

    // After the loop, add the last element directly if the array is not empty.
    // This separates the special handling for the last element from the main loop.
    if (numCount > 0) {
        finalSum += inputNumbers[numCount - 1];
    }

    // Output the final calculated sum.
    console.log(finalSum);
}

// The input reading mechanism remains identical to preserve external contracts.
calculateTotal(require('fs').readFileSync('/dev/stdin', 'utf8'));
