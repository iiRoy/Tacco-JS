function EntryPoint(payload) {
  const targetThreshold = parseInt(payload);
  const startingCapital = 100;

  const determineGrowthPeriods = (currentCapital, periodsCount) => {
    return currentCapital >= targetThreshold
      ? periodsCount
      : determineGrowthPeriods(
          currentCapital + Math.floor(currentCapital * 0.01),
          periodsCount + 1
        );
  };

  const totalPeriods = determineGrowthPeriods(startingCapital, 0);
  console.log(JSON.stringify(totalPeriods));
}

// Don't edit this line!
EntryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));
