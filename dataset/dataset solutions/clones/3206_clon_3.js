// Helper function to convert a numeric value or string into a reversed array of its digits.
// For example, "123" becomes [3, 2, 1]. This format simplifies arithmetic operations.
function convertToReversedDigitArray(inputVal) {
    // Convert the input to a string to ensure consistent processing.
    // Split the string into individual characters, reverse their order, and convert each character back to a number.
    return String(inputVal).split('').reverse().map(Number);
}

// Performs arbitrary-precision multiplication on two non-negative numbers represented as strings.
// This function mimics the traditional "long multiplication" method.
function stringProduct(factorOne, factorTwo) {
    // Convert input factors into reversed arrays of digits for easier arithmetic processing.
    const digitsFactorOne = convertToReversedDigitArray(factorOne);
    const digitsFactorTwo = convertToReversedDigitArray(factorTwo);

    // Handle trivial cases where either factor is zero.
    // If any input is "0", the product is "0".
    if ((digitsFactorOne.length === 1 && digitsFactorOne[0] === 0) ||
        (digitsFactorTwo.length === 1 && digitsFactorTwo[0] === 0)) {
        return "0";
    }

    // Initialize an array to store the product's digits. Its maximum possible length
    // is the sum of the lengths of the two factors. All elements are pre-filled with zero.
    const productDigits = new Array(digitsFactorOne.length + digitsFactorTwo.length).fill(0);

    // Execute the core multiplication logic. Each digit from factorOne is multiplied
    // by each digit from factorTwo, and the result is accumulated at the appropriate
    // position in the `productDigits` array.
    for (let i = 0; i < digitsFactorOne.length; i++) {
        for (let j = 0; j < digitsFactorTwo.length; j++) {
            productDigits[i + j] += digitsFactorOne[i] * digitsFactorTwo[j];
        }
    }

    // Process carries through the `productDigits` array. This loop ensures that
    // each position in the array holds only a single digit (0-9) by propagating carries.
    let currentDigitIndex = 0;
    let carryOver = 0; // Explicit variable to manage the carry value.
    while (currentDigitIndex < productDigits.length || carryOver > 0) {
        // Calculate the sum of the current digit and any carry from the previous position.
        // `productDigits[currentDigitIndex] || 0` handles cases where a position might be undefined
        // if the array needed to grow due to a carry.
        let temporarySum = (productDigits[currentDigitIndex] || 0) + carryOver;

        // Store the last digit of the `temporarySum` at the current position.
        productDigits[currentDigitIndex] = temporarySum % 10;

        // Calculate the new `carryOver` for the next position.
        carryOver = Math.floor(temporarySum / 10);

        currentDigitIndex++; // Move to the next digit position.

        // If a carry exists and we've reached the end of the current `productDigits` array,
        // extend the array to accommodate the carry.
        if (carryOver > 0 && currentDigitIndex === productDigits.length) {
            productDigits.push(0);
        }
    }

    // Remove any trailing zeros from the `productDigits` array.
    // Since the array is reversed, these correspond to leading zeros in the final number string.
    // Example: [0, 0, 1] (representing "100") should become [1] (representing "1") if it was "001".
    while (productDigits.length > 1 && productDigits[productDigits.length - 1] === 0) {
        productDigits.pop(); // Remove the trailing zero.
    }

    // Reverse the array to get the digits in their correct order and join them into a single string.
    return productDigits.reverse().join("");
}

// Performs arbitrary-precision addition on two non-negative numbers represented as strings.
// This function simulates the column-by-column addition method.
function stringSum(valueA, valueB) {
    // Convert both input values into reversed arrays of digits.
    const digitsOperandA = convertToReversedDigitArray(valueA);
    const digitsOperandB = convertToReversedDigitArray(valueB);

    const sumResultDigits = []; // This array will hold the digits of the sum, in reversed order.
    let currentCarry = 0; // Initialize the carry value to zero.

    // Determine the maximum length among the two digit arrays to ensure all positions are processed.
    const maxLength = Math.max(digitsOperandA.length, digitsOperandB.length);

    // Loop through the digit arrays from right to left (due to reversal), performing addition.
    // The loop continues as long as there are digits to process in either array or a carry remains.
    for (let position = 0; position < maxLength || currentCarry > 0; position++) {
        // Retrieve the digits at the current position from both operands, defaulting to 0 if undefined.
        const digitFromA = digitsOperandA[position] || 0;
        const digitFromB = digitsOperandB[position] || 0;

        // Calculate the sum for the current position, including any carry from the previous position.
        const currentPositionTotal = digitFromA + digitFromB + currentCarry;

        // Add the last digit of the `currentPositionTotal` to the `sumResultDigits` array.
        sumResultDigits.push(currentPositionTotal % 10);
        
        // Update the `currentCarry` for the next position.
        currentCarry = Math.floor(currentPositionTotal / 10);
    }

    // Remove any trailing zeros (which are leading zeros in the final number string) from the sum.
    while (sumResultDigits.length > 1 && sumResultDigits[sumResultDigits.length - 1] === 0) {
        sumResultDigits.pop();
    }

    // Reverse the `sumResultDigits` array to get the correct order and join into a string.
    return sumResultDigits.reverse().join("");
}

// Performs arbitrary-precision subtraction for non-negative numbers represented as strings.
// This function calculates `minuendValue - subtrahendValue`, assuming `minuendValue >= subtrahendValue`.
function stringDifference(minuendValue, subtrahendValue) {
    // Convert both input values into reversed arrays of digits.
    const minuendDigits = convertToReversedDigitArray(minuendValue);
    const subtrahendDigits = convertToReversedDigitArray(subtrahendValue);

    const differenceDigits = []; // This array will hold the digits of the difference, in reversed order.
    let currentBorrow = 0; // Initialize the borrow value to zero.

    // Determine the maximum length to ensure all digits are processed.
    const commonProcessedLength = Math.max(minuendDigits.length, subtrahendDigits.length);

    // Loop through the digit arrays from right to left (due to reversal), performing subtraction.
    for (let position = 0; position < commonProcessedLength; position++) {
        // Retrieve the digits at the current position from both numbers, defaulting to 0 if undefined.
        const digitFromMinuend = minuendDigits[position] || 0;
        const digitFromSubtrahend = subtrahendDigits[position] || 0;

        // Calculate the difference for the current position, accounting for any borrow.
        let currentPositionDifference = digitFromMinuend - digitFromSubtrahend - currentBorrow;

        // If the `currentPositionDifference` is negative, a borrow is required from the next higher place value.
        if (currentPositionDifference < 0) {
            currentPositionDifference += 10; // Add 10 to make the current digit positive.
            currentBorrow = 1; // Set `currentBorrow` to 1 for the next position.
        } else {
            currentBorrow = 0; // No borrow needed for the next position.
        }
        differenceDigits.push(currentPositionDifference); // Add the calculated digit to the result.
    }

    // Remove any trailing zeros (which are leading zeros in the final number string) from the difference.
    // For example, "005" should become "5".
    while (differenceDigits.length > 1 && differenceDigits[differenceDigits.length - 1] === 0) {
        differenceDigits.pop();
    }

    // Reverse the `differenceDigits` array to get the correct order and join into a string.
    return differenceDigits.reverse().join("");
}

// Main function to calculate the total number of biscuits based on specific rules and input.
function determineTotalBiscuits(rawInputData) {
    // Guard clause: Check for missing or invalid input data.
    if (!rawInputData || typeof rawInputData !== 'string') {
        console.error("Error: Input data is missing or not a string.");
        return "0"; // Return "0" as a default or error indicator.
    }

    // Process the raw input string: trim whitespace, split by space, and convert segments to numbers.
    const parsedNumericInputs = rawInputData.trim().split(' ').map(Number);

    // Validate if the expected number of parameters (3) were successfully parsed and are valid numbers.
    if (parsedNumericInputs.length < 3 || parsedNumericInputs.some(isNaN)) {
        console.error("Error: Expected three valid numeric parameters for biscuit calculation. Received:", parsedNumericInputs);
        return "0";
    }

    // Assign parsed values to more descriptive variable names for clarity.
    const targetDayCount = parsedNumericInputs[0];  // Corresponds to 'K' in the original problem.
    const initialBiscuitCount = parsedNumericInputs[1]; // Corresponds to 'A' in the original problem.
    const tradeRateValue = parsedNumericInputs[2]; // Corresponds to 'B' in the original problem.

    // Calculate intermediate values using the arbitrary-precision string arithmetic functions.
    // Note: While these values might be small enough for regular numbers, using string arithmetic
    // here maintains consistency with the helper functions' design.
    const netGainPerTrade = stringDifference(tradeRateValue, initialBiscuitCount); // Equivalent to B - A.
    const daysAvailableForTrade = stringDifference(targetDayCount, initialBiscuitCount); // Equivalent to K - A.

    let finalBiscuitResult = "0"; // Initialize the result as a string.

    // Convert string representations of intermediate values back to numbers for conditional checks.
    // This is necessary because the original problem's conditions use numeric comparisons.
    const numericDaysForTrade = Number(daysAvailableForTrade);
    const numericNetGain = Number(netGainPerTrade);

    // Apply the problem's specific conditional logic for biscuit calculation.
    if (numericDaysForTrade < 2 || numericNetGain < 3) {
        // Scenario 1: Insufficient days for trading or very low net gain.
        // In this case, the total biscuits are simply the target day count plus one.
        finalBiscuitResult = stringSum(targetDayCount, "1");
    } else if (numericDaysForTrade % 2 === 0) {
        // Scenario 2: An even number of trading days are available.
        // Calculate the profit from trading: (daysAvailableForTrade / 2) * netGainPerTrade.
        // Perform numeric division for half days, then convert back to string for `stringProduct`.
        const halfTradingDays = String(numericDaysForTrade / 2);
        const tradingProfit = stringProduct(halfTradingDays, netGainPerTrade);
        
        // The final result involves adding the initial biscuits, the trading profit, and an additional 1.
        finalBiscuitResult = stringSum(stringSum(tradingProfit, initialBiscuitCount), "1");
    } else {
        // Scenario 3: An odd number of trading days are available.
        // Calculate the profit from trading: ((daysAvailableForTrade + 1) / 2) * netGainPerTrade.
        // Perform numeric division for adjusted half days, then convert to string.
        const adjustedHalfTradingDays = String((numericDaysForTrade + 1) / 2);
        const tradingProfit = stringProduct(adjustedHalfTradingDays, netGainPerTrade);
        
        // The final result is the sum of initial biscuits and the calculated trading profit.
        finalBiscuitResult = stringSum(tradingProfit, initialBiscuitCount);
    }

    // Output the final calculated biscuit count to the console.
    console.log(finalBiscuitResult);
    return finalBiscuitResult; // Also return the result for potential external use or testing.
}

// Entry point: Read input from standard input and pass it to the main calculation function.
// A try-catch block is used to gracefully handle potential file reading errors.
try {
    const inputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    determineTotalBiscuits(inputContent);
} catch (readError) {
    console.error("An error occurred while reading input or processing data:", readError.message);
}