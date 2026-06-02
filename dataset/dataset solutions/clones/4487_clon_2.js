function ProcessInput(rawData) {
    // Split the entire input string into individual lines.
    let parsedLines = rawData.split("\n");

    // Extract the first line and split it by space to get initial parameters.
    let firstLineParts = parsedLines[0].split(" ");
    let totalElements = parseInt(firstLineParts[0]); // The first number from the first line.
    let remainderValue = parseInt(firstLineParts[1]); // The second number from the first line.

    // Extract the second line and split it by space to get the data sequence.
    let numberSequence = parsedLines[1].split(" ");

    // Initialize counters for even and odd numbers.
    let evenCount = 0;
    let oddCount = 0;

    // Iterate through the number sequence to count evens and odds.
    for (let idx = 0; idx < numberSequence.length; idx++) {
        // Convert string element to integer.
        numberSequence[idx] = parseInt(numberSequence[idx]);
        
        // Check if the number is even or odd.
        if (numberSequence[idx] % 2 === 0) {
            evenCount++; // Increment even counter.
        } else {
            oddCount++; // Increment odd counter.
        }
    }
    
    // Helper function to compute factorial of a number.
    function calculateFactorial(val) {
        let resultProduct = 1; // Initialize product to 1.
        for (let counter = 1; counter <= val; counter++) {
            resultProduct *= counter; // Multiply by current counter value.
        }
        return resultProduct; // Return the computed factorial.
    }
    
    // Helper function to compute combinations (nCk).
    function computeCombinations(nItems, kChosen) {
        // Calculate nCk using the factorial function.
        return Math.round(calculateFactorial(nItems) / (calculateFactorial(kChosen) * calculateFactorial(nItems - kChosen)));
    }

    // Calculate the number of subsets for even numbers (2^evenCount).
    let evenSubsets = Math.pow(2, evenCount);
    
    // Initialize the count for odd subsets.
    let oddSubsets = 0;

    // Determine odd subsets based on the remainder value.
    if (remainderValue === 0) {
        // If remainder is 0, sum combinations of odd numbers taken 0, 2, 4... at a time.
        for (let idx = 0; idx <= oddCount; idx += 2) {
            oddSubsets += computeCombinations(oddCount, idx);
        }
    } else {
        // If remainder is not 0, sum combinations of odd numbers taken 1, 3, 5... at a time.
        for (let idx = 1; idx <= oddCount; idx += 2) {
            oddSubsets += computeCombinations(oddCount, idx);
        }
    }
    
    // Output the final product of even and odd subsets.
    console.log(evenSubsets * oddSubsets);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
