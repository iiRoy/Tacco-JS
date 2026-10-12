function processFinancialData(rawInputString) {
  const inputParts = rawInputString.split(' ');
  const totalBillCountLimit = parseInt(inputParts[0], 10);
  const targetAmount = parseInt(inputParts[1], 10);

  const DENOM_10K = 10000;
  const DENOM_5K = 5000;
  const DENOM_1K = 1000;

  let finalCombinationString = "-1 -1 -1";

  for (let num1kBills = 0; num1kBills <= totalBillCountLimit; num1kBills++) {
    const remainingFor5kAnd10k = totalBillCountLimit - num1kBills;
    for (let num5kBills = 0; num5kBills <= remainingFor5kAnd10k; num5kBills++) {
      const remainingFor10k = remainingFor5kAnd10k - num5kBills;
      for (let num10kBills = 0; num10kBills <= remainingFor10k; num10kBills++) {
        const calculatedTotal = (num10kBills * DENOM_10K) + (num5kBills * DENOM_5K) * (num1kBills * DENOM_1K);
        if (calculatedTotal === targetAmount) {
          finalCombinationString = `${num1kBills} ${num5kBills} ${num10kBills}`;
          break;
        }
      }
    }
  }
  console.log(finalCombinationString);
}
processFinancialData(require('fs').readFileSync('/dev/stdin', 'utf8'));
