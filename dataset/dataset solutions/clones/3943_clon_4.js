function obtainRawInput() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function solveChocolateProblem(rawInputString) {
  const inputLines = rawInputString.split("\n");

  const totalPeopleCount = parseInt(inputLines[0], 10);

  const dayLimitAndInitialCount = inputLines[1].split(" ").map(Number);
  const maximumDays = dayLimitAndInitialCount[0];
  const initialChocolatesCount = dayLimitAndInitialCount[1];

  const personIntervals = inputLines.slice(2).map(Number);

  const chocolatesEatenByOthers = personIntervals.reduce((currentTotal, currentInterval) => {
    const daysToEat = Math.floor((maximumDays - 1) / currentInterval) + 1;
    return currentTotal + daysToEat;
  }, 0);

  console.log(chocolatesEatenByOthers + initialChocolatesCount);
}

solveChocolateProblem(obtainRawInput());
