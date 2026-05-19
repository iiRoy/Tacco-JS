function solveProblem(inputData) {
  const parts = inputData.split(' ');
  const upperBound = parseInt(parts[0], 10);
  const modulusValue = parseInt(parts[1], 10);

  let validCombinations = [];

  const evaluateTripletCondition = (firstVal, secondVal, thirdVal, divisor) => {
    const sumOneTwo = firstVal + secondVal;
    const sumTwoThree = secondVal + thirdVal;
    const sumThreeOne = thirdVal + firstVal;

    const conditionOne = sumOneTwo % divisor === 0;
    const conditionTwo = sumTwoThree % divisor === 0;
    const conditionThree = sumThreeOne % divisor === 0;

    return conditionOne && conditionTwo && conditionThree;
  };

  for (let valA = 1; valA <= upperBound; valA++) {
    for (let valB = 1; valB <= upperBound; valB++) {
      for (let valC = 1; valC <= upperBound; valC++) {
        const currentCombination = [valA, valB, valC];

        if (evaluateTripletCondition(currentCombination[0], currentCombination[1], currentCombination[2], modulusValue)) {
          validCombinations.push(currentCombination);
        }
      }
    }
  }

  console.log(validCombinations.length);
}

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
