const printResult = (finalValue) => {
    // Outputs the calculated result to the console.
    console.log(finalValue);
};

/**
 * Calculates the sum of all digits in a given number.
 * For example, sumDigits(123) returns 6.
 * @param {number} numToProcess The number whose digits are to be summed.
 * @returns {number} The total sum of the digits.
 */
const sumDigits = (numToProcess) => {
    let digitSum = 0;
    // Process the number by repeatedly extracting its last digit
    // and dividing by 10 until it becomes zero.
    let workingNumber = Math.abs(numToProcess); // Ensure positive for summation logic
    while (workingNumber > 0) {
        digitSum += workingNumber % 10; // Add the last digit
        workingNumber = Math.floor(workingNumber / 10); // Remove the last digit
    }
    return digitSum;
};

/**
 * Orchestrates the main computational logic.
 * It takes a string input, parses it, and then performs a series of calculations
 * to find the minimum sum of digits for products of the input number.
 * @param {string} rawInputString The raw string data received as input.
 */
const executeMainProcess = (rawInputString) => {
    // Attempt to convert the input string into a base-10 integer.
    let baseNumber = parseInt(rawInputString, 10);

    // Input validation: Ensure the parsed number is a positive integer.
    // If not, log an error and exit the function.
    if (isNaN(baseNumber) || baseNumber <= 0) {
        console.error("Error: Provided input is not a valid positive integer.");
        return; // Terminate execution for invalid input
    }

    // Define the upper boundary for the multiplier iterations as a constant.
    const MAX_ITERATION_MULTIPLIER = 100000;

    // Initialize the variable to store the smallest digit sum found.
    // We calculate the sum for the first product (baseNumber * 1) to set an initial benchmark.
    let minimumOverallDigitSum = sumDigits(baseNumber);

    // Loop through multipliers starting from 2 up to the defined limit.
    // The first iteration (multiplier 1) has already been used for initialization.
    for (let currentMultiplier = 2; currentMultiplier <= MAX_ITERATION_MULTIPLIER; currentMultiplier++) {
        // Calculate the product of the base number and the current multiplier.
        let productResult = baseNumber * currentMultiplier;
        
        // Compute the sum of digits for this specific product.
        let currentProductDigitSum = sumDigits(productResult);
        
        // Update the minimum overall digit sum if the current one is smaller.
        minimumOverallDigitSum = Math.min(minimumOverallDigitSum, currentProductDigitSum);
    }
    
    // Output the final minimum sum of digits found.
    printResult(minimumOverallDigitSum);
};

// Entry point: Read input from standard input, trim any whitespace,
// and pass it to the main processing function.
executeMainProcess(require("fs").readFileSync("/dev/stdin", "utf8").trim());