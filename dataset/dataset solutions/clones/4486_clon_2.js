function ProcessInput(rawData) {
    // Split the entire input string into individual lines.
    let processedLines = rawData.split("\n");
    
    // Extract and parse the first line which contains two integer values.
    const firstLineParts = processedLines[0].split(" ");
    const totalCount = parseInt(firstLineParts[0], 10); // The first number from the first line.
    const remainderVal = parseInt(firstLineParts[1], 10); // The second number from the first line.
    
    // Extract the second line and split it into an array of string representations of numbers.
    let numberStrings = processedLines[1].split(" ");
    
    // Initialize counters for even and odd numbers found in the second line.
    let evenCount = 0;
    let oddCount = 0;
    
    // Iterate through the array of number strings.
    for (let currentIdx = 0; currentIdx < numberStrings.length; currentIdx++) {
        // Convert each string to an integer.
        numberStrings[currentIdx] = parseInt(numberStrings[currentIdx], 10);
        
        // Check if the number is even or odd and increment the respective counter.
        if (numberStrings[currentIdx] % 2 === 0) {
            evenCount++; // Increment the count of even numbers.
        } else {
            oddCount++; // Increment the count of odd numbers.
        }
    }
    
    // Define a nested helper function to calculate the factorial of a given number.
    function calculateFactorial(valueForFactorial) {
        let factorialResult = 1; // Initialize the result to 1.
        // Loop from 1 up to the given value, multiplying each number.
        for (let loopCounter = 1; loopCounter <= valueForFactorial; loopCounter++) {
            factorialResult *= loopCounter;
        }
        return factorialResult; // Return the computed factorial.
    }
    
    // Define another nested helper function to calculate combinations (nCk).
    function calculateCombinations(nValue, kValue) {
        // The combination formula is n! / (k! * (n-k)!).
        // Math.round is used to handle potential floating point inaccuracies from division.
        return Math.round(calculateFactorial(nValue) / (calculateFactorial(kValue) * calculateFactorial(nValue - kValue)));
    }

    // Calculate the total combinations for even numbers, which is 2 raised to the power of evenCount.
    const evenCombinationsTotal = Math.pow(2, evenCount);
    
    // Initialize a variable to store the total combinations for odd numbers.
    let oddCombinationsTotal = 0;
    
    // Conditional logic based on the 'remainderVal' from the first line.
    if (remainderVal === 0) {
        // If remainderVal is 0, sum combinations of odd numbers taken in even groups (0, 2, 4, ...).
        for (let oddLoopVar = 0; oddLoopVar <= oddCount; oddLoopVar += 2) {
            oddCombinationsTotal += calculateCombinations(oddCount, oddLoopVar);
        }
    } else {
        // If remainderVal is not 0 (implicitly 1 in typical competitive programming contexts for this problem type),
        // sum combinations of odd numbers taken in odd groups (1, 3, 5, ...).
        for (let oddLoopVar = 1; oddLoopVar <= oddCount; oddLoopVar += 2) {
            oddCombinationsTotal += calculateCombinations(oddCount, oddLoopVar);
            // This specific console.log statement is part of the original problem's output behavior.
            console.log(calculateCombinations(oddCount, oddLoopVar));
        }
    }
    
    // Finally, print the product of the even and odd combinations totals.
    console.log(evenCombinationsTotal * oddCombinationsTotal);
}

// Read the entire content of standard input as a UTF-8 string and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
