function logOutput(message) {
    console.log(message);
}

const BITCOIN_EXCHANGE_RATE = 380000;
const JAPANESE_YEN_CODE = "JPY";

// Helper function to calculate the value of a single financial entry
function calculateEntryValue(entryLineString) {
    const entryComponents = entryLineString.split(" ");
    const amountString = entryComponents[0];
    const currencySymbol = entryComponents[1];

    let calculatedValueForEntry;
    if (currencySymbol === JAPANESE_YEN_CODE) {
        calculatedValueForEntry = Number.parseInt(amountString, 10);
    } else {
        calculatedValueForEntry = Number.parseFloat(amountString) * BITCOIN_EXCHANGE_RATE;
    }
    return calculatedValueForEntry;
}

function processFinancialData(rawInputContent) {
    const dataLines = rawInputContent.trim().split("\n");
    const totalNumberOfEntries = Number.parseInt(dataLines[0], 10);

    let cumulativeSum = 0;

    // Loop through each financial entry, starting from the second line (index 1)
    for (let entryIndex = 1; entryIndex <= totalNumberOfEntries; entryIndex++) {
        const currentEntryLine = dataLines[entryIndex];
        const valueFromEntry = calculateEntryValue(currentEntryLine);
        cumulativeSum += valueFromEntry;
    }

    logOutput(cumulativeSum);
}

// Read input from stdin and pass it to the main processing function
const fileData = require("fs").readFileSync("/dev/stdin", "utf8").trim();
processFinancialData(fileData);
