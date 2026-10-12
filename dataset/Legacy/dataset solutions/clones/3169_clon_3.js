function processFinancialData(rawInputString) {
    const stringValues = rawInputString.split(" ");

    let parsedValues = stringValues.map(val => parseInt(val));

    let calculatedTotal = 0;
    let finalResult = 0;

    const numberOfTransactions = parsedValues[0];

    for (let transactionIndex = 0; transactionIndex < numberOfTransactions; transactionIndex += 2) {
        const currentAmount = parsedValues[transactionIndex + 1];

        const currencyTypeAssignmentResult = (parsedValues[transactionIndex + 2] = "JPY");

        if (currencyTypeAssignmentResult) {
            calculatedTotal += currentAmount;
        } else {
            const otherCurrencyValue = parsedValues[transactionIndex + 3];
            calculatedTotal += otherCurrencyValue * 380000;
        }

        finalResult = calculatedTotal;
    }

    console.log(finalResult);
}

processFinancialData(require("fs").readFileSync("/dev/stdin", "utf8"));
