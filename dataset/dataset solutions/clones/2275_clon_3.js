/*
 * This module provides core functionality to assess a simple financial transaction.
 * It determines if a received payment covers the estimated cost of a given quantity of items.
 */
function evaluateTransaction(inputString) {
    // Define a constant for the unit price of each item.
    const ITEM_UNIT_VALUE = 500; // Value in monetary units.

    // Validate input string presence and type.
    // If input is invalid or empty, we cannot process meaningfully.
    // The original code might result in NaN comparisons, typically leading to 'no'.
    if (!inputString || typeof inputString !== 'string' || inputString.trim().length === 0) {
        console.log('no');
        return;
    }

    // Split the input string into constituent parts, allowing for one or more spaces.
    // The .filter(Boolean) removes any empty strings that might result from multiple spaces.
    let inputComponents = inputString.split(/\s+/).filter(Boolean);

    // Ensure we have at least two components: quantity and payment.
    if (inputComponents.length < 2) {
        console.log('no'); // Not enough data to complete the transaction assessment.
        return;
    }

    // Parse the quantity of items ordered from the first component.
    // The unary plus operator (+) is used for concise string-to-number conversion.
    let quantityOrdered = +inputComponents[0];

    // Parse the payment amount received from the second component.
    let paymentReceived = +inputComponents[1];

    // Validate if the parsed values are actual numbers.
    // If parsing results in NaN for either value, it indicates invalid numeric input.
    if (isNaN(quantityOrdered) || isNaN(paymentReceived)) {
        console.log('no'); // Invalid numeric input prevents a proper calculation.
        return;
    }

    // Calculate the total estimated cost for the ordered quantity.
    let estimatedTotal = ITEM_UNIT_VALUE * quantityOrdered;

    // Determine if the payment received is sufficient to cover the estimated total.
    let isPaymentSufficient = paymentReceived >= estimatedTotal;

    // Output the result based on the sufficiency check using a ternary operator for brevity.
    console.log(isPaymentSufficient ? 'yes' : 'no');
}

// The following code block is responsible for environment-specific input handling.
// It reads data from standard input and passes it to the main processing function.
// Please refrain from altering this section to maintain compatibility with the execution environment.
evaluateTransaction(require("fs").readFileSync("/dev/stdin", "utf8"));