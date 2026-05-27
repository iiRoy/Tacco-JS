const fileSystem = require('fs');

function processFinancialTransactions() {
  const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
  const inputLines = rawInputContent.split('\n');

  const coinDenominations = [10, 50, 100, 500];

  while (inputLines[0] !== '0') {
    const targetValue = +inputLines.shift();
    const initialCoinCounts = inputLines.shift().split(' ').map(Number);

    const totalAvailableValue = initialCoinCounts.reduce(
      (accumulator, count, index) => accumulator + count * coinDenominations[index],
      0
    );

    const changeToReturn = totalAvailableValue - targetValue;

    const { processedCounts: finalCoinCounts } = coinDenominations.reduceRight(
      (currentAccumulator, currentDenomination, denominationIndex) => {
        const maxCoinsFromChange = Math.floor(currentAccumulator.remainingChange / currentDenomination);
        const availableCoinsOfDenomination = currentAccumulator.processedCounts[denominationIndex];
        const coinsToDispense = Math.min(maxCoinsFromChange, availableCoinsOfDenomination);

        const updatedCounts = [...currentAccumulator.processedCounts];
        updatedCounts[denominationIndex] -= coinsToDispense;

        const updatedRemainingChange = currentAccumulator.remainingChange - coinsToDispense * currentDenomination;

        return {
          remainingChange: updatedRemainingChange,
          processedCounts: updatedCounts,
        };
      },
      { remainingChange: changeToReturn, processedCounts: [...initialCoinCounts] }
    );

    finalCoinCounts
      .map((count, index) => ({ denomination: coinDenominations[index], count }))
      .filter(coinInfo => coinInfo.count > 0)
      .forEach(coinInfo => console.log(`${coinInfo.denomination} ${coinInfo.count}`));

    console.log('');
  }
}

processFinancialTransactions();
