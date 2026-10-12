function calculateFlooredInterest(currentBalance, interestRate) {
  return Math.floor(currentBalance * interestRate);
}

function processFinancialGrowth(targetValueString) {
  const initialAccountBalance = 100;
  let accountBalance = initialAccountBalance;

  const desiredThreshold = Number.parseInt(targetValueString, 10);

  let growthPeriods = 0;

  if (desiredThreshold <= initialAccountBalance) {
    console.log(String(growthPeriods));
    return;
  }

  const annualInterestRate = 0.01;

  while (accountBalance < desiredThreshold) {
    const periodInterest = calculateFlooredInterest(accountBalance, annualInterestRate);
    accountBalance += periodInterest;
    growthPeriods++;
  }

  console.log(String(growthPeriods));
}

processFinancialGrowth(require("fs").readFileSync("/dev/stdin", "utf8"));
