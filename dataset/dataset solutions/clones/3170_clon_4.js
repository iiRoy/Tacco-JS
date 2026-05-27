function displayOutcome(finalValue) {
  console.log(finalValue);
}

function calculatePortfolioValue(sourceData) {
  const dataLines = sourceData.trim().split('\n');

  const currencyProcessors = {
    'JPY': (amountString) => parseInt(amountString, 10),
    'BTC': (amountString) => parseFloat(amountString) * 380000,
    'DEFAULT': (amountString) => parseFloat(amountString) * 380000
  };

  const cumulativeWorth = dataLines.slice(1).reduce((currentTotal, lineEntry) => {
    const transactionParts = lineEntry.split(' ');
    const amountString = transactionParts[0];
    const currencyIdentifier = transactionParts[1];

    const processor = currencyProcessors[currencyIdentifier] || currencyProcessors['DEFAULT'];

    return currentTotal + processor(amountString);
  }, 0);

  displayOutcome(cumulativeWorth);
}

calculatePortfolioValue(require("fs").readFileSync("/dev/stdin", "utf8").trim());
