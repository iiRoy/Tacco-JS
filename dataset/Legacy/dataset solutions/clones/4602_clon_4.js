const processInput = (sourceText) => {
  const lineSegments = sourceText.trim().split('\n');
  const [firstVal, secondVal, thirdVal] = lineSegments[0].split(' ').map(Number);

  const determineOutcome = (currentIterationValue) => {
    if (currentIterationValue > 10000) {
      return false;
    }
    if (currentIterationValue % secondVal === thirdVal) {
      return true;
    }
    return determineOutcome(currentIterationValue + firstVal);
  };

  const finalResult = determineOutcome(firstVal);

  if (finalResult) {
    console.log('YES');
  } else {
    console.log('NO');
  }
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
