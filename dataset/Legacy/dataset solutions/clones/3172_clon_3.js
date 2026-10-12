function parseEntryLine(lineContent) {
    const contentParts = lineContent.split(' ');
    const valueString = contentParts[0];
    const currencyCode = contentParts[1];
    return { amount: valueString, currency: currencyCode };
}

function processFinancialData(rawInputString) {
    const inputLines = rawInputString.split("\n");

    const JPY_CURRENCY_IDENTIFIER = 'JPY';
    const BTC_CURRENCY_IDENTIFIER = 'BTC';
    const BTC_TO_JPY_EXCHANGE_RATE = 380000.0;

    const totalEntryCount = Number.parseInt(inputLines[0], 10);

    let accumulatedJPY = 0;
    let accumulatedBTC = 0.0;

    for (let entryIndex = 1; entryIndex <= totalEntryCount; entryIndex++) {
        const currentEntryData = parseEntryLine(inputLines[entryIndex]);
        const amountValue = currentEntryData.amount;
        const currencyType = currentEntryData.currency;

        if (currencyType === JPY_CURRENCY_IDENTIFIER) {
            accumulatedJPY += Number.parseInt(amountValue, 10);
        } else if (currencyType === BTC_CURRENCY_IDENTIFIER) {
            accumulatedBTC += Number.parseFloat(amountValue);
        }
    }

    const convertedBTCToJPY = accumulatedBTC * BTC_TO_JPY_EXCHANGE_RATE;
    const finalTotalSum = accumulatedJPY + convertedBTCToJPY;

    console.log(finalTotalSum);
}

processFinancialData(require("fs").readFileSync("/dev/stdin", "utf8"));
