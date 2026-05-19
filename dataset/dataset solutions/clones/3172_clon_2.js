// This module processes financial transaction data from a raw input string.
function ProcessInput(rawData) {
    // The input string is first split into individual lines for easier parsing.
    let dataLines = rawData.split("\n");

    // The first line indicates the total count of subsequent data entries.
    let entryCount = parseInt(dataLines[0]);

    // Initialize variables to accumulate monetary values.
    let totalLocalCurrency = 0; // Accumulates integer values (e.g., JPY).
    let totalDigitalCurrency = 0.0; // Accumulates floating-point values (e.g., BTC).

    // Iterate through each data entry, starting from the second line of the input.
    for (let currentIdx = 1; currentIdx <= entryCount; currentIdx++) {
        // Each data line contains an amount and a currency type, separated by a space.
        let transactionDetails = dataLines[currentIdx].split(' ');
        let valueString = transactionDetails[0]; // The numerical value as a string.
        let currencyIdentifier = transactionDetails[1]; // The currency code.

        // Conditionally add the value to the appropriate accumulator based on currency type.
        if (currencyIdentifier === 'JPY') {
            totalLocalCurrency += parseInt(valueString); // Parse as integer for JPY.
        } else if (currencyIdentifier === 'BTC') {
            totalDigitalCurrency += parseFloat(valueString); // Parse as float for BTC.
        }
    }

    // Calculate the final sum by converting digital currency to local currency
    // using a predefined exchange rate, then adding it to the accumulated local currency.
    console.log(totalLocalCurrency + (totalDigitalCurrency * 380000.0));
}

// This section handles reading input from the standard input stream and invoking the main processing function.
// It is crucial for the execution environment and must remain unchanged.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
