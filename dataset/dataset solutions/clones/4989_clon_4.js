'use strict';

const calculateTransactionValue = (sourceData) => {
  const [totalUnits, firstTierLimit, firstTierPrice, subsequentTierPrice] = sourceData
    .split('\n')
    .slice(0, 4) // Ensure we only process the first four lines even if there's an empty line at the end
    .map(entry => Number(entry));

  const accruedValue = totalUnits <= firstTierPrice
    ? totalUnits * firstTierPrice
    : (firstTierLimit * firstTierPrice) + ((totalUnits - firstTierLimit) * subsequentTierPrice);

  process.stdout.write(String(accruedValue) + '\n');
};

calculateTransactionValue(require("node:fs").readFileSync("/dev/stdin", "utf8"));