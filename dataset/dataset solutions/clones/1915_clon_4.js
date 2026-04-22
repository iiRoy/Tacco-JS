function financialSimulator(goalAmountStr) {
  const initialSum = 100;
  const desiredBalance = parseInt(goalAmountStr);

  function computeGrowthPeriods(currentBalance, currentPeriods) {
    if (currentBalance >= desiredBalance) {
      return currentPeriods;
    } else {
      const interestEarned = Math.floor(currentBalance * 0.01);
      const nextBalance = currentBalance + interestEarned;
      return computeGrowthPeriods(nextBalance, currentPeriods + 1);
    }
  }

  const totalPeriods = computeGrowthPeriods(initialSum, 0);
  console.log(JSON.stringify(totalPeriods));
}

financialSimulator(require("node:fs").readFileSync("/dev/stdin", "utf8"));