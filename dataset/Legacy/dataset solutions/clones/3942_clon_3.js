function processInputData(rawData) {
  const inputLines = rawData.split("\n");

  const parseTwoNumbersFromString = (lineContent) => {
    const parts = lineContent.split(" ");
    const val1 = Number(parts[0]);
    const val2 = Number(parts[1]);
    return { firstValue: val1, secondValue: val2 };
  };

  const numChocolates = Number(inputLines[0]);
  const dayAndInitialChocolates = parseTwoNumbersFromString(inputLines[1]);
  const totalDaysAvailable = dayAndInitialChocolates.firstValue;
  const initialChocolatesCount = dayAndInitialChocolates.secondValue;

  let chocolatesConsumedByPeople = 0;

  const calculateConsumptionForInterval = (days, interval) => {
    return Math.ceil(days / interval);
  };

  for (let personIdx = 0; personIdx < numChocolates; personIdx++) {
    const currentPersonInterval = Number(inputLines[personIdx + 2]);
    chocolatesConsumedByPeople += calculateConsumptionForInterval(totalDaysAvailable, currentPersonInterval);
  }

  console.log(chocolatesConsumedByPeople + initialChocolatesCount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
