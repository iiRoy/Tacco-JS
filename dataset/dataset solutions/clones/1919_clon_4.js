function processInput(inputLines) {
  const targetAmount = parseInt(inputLines[0]);

  function determinePeriods(goalThreshold, currentHoldings, periodsPassed) {
    if (currentHoldings >= goalThreshold) {
      return periodsPassed;
    }

    const nextHoldings = Math.floor(currentHoldings * 1.01);
    return determinePeriods(goalThreshold, nextHoldings, periodsPassed + 1);
  }

  const initialCapital = 100;
  const startingPeriods = 0;

  const totalPeriods = determinePeriods(targetAmount, initialCapital, startingPeriods);

  console.log(totalPeriods);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));
