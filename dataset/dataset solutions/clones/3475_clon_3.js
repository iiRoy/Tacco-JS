function parseInteger(inputString) {
  return Number(inputString);
}

function calculateAbsoluteDifferencesSum(numericSequence) {
  if (numericSequence.length < 2) {
    return 0;
  }

  let totalDifference = 0;
  const sequenceLastIndex = numericSequence.length - 1;

  for (let i = 0; i < sequenceLastIndex; i++) {
    totalDifference += Math.abs(numericSequence[i] - numericSequence[i + 1]);
  }
  return totalDifference;
}

function constructAlternatingSequence(currentTurn, sourceNumbers, sequenceLength) {
  const generatedSequence = [];

  const takeFromSource = () => {
    return (currentTurn === 'min') ? sourceNumbers.shift() : sourceNumbers.pop();
  };

  while (generatedSequence.length < sequenceLength) {
    let primaryValueToAdd;
    let secondaryValueToAdd;

    if (generatedSequence.length === 0) {
      primaryValueToAdd = takeFromSource();
      generatedSequence.push(primaryValueToAdd);
    } else {
      primaryValueToAdd = takeFromSource();

      const willNeedSecondValue = (generatedSequence.length + 1 < sequenceLength);
      if (willNeedSecondValue) {
        secondaryValueToAdd = takeFromSource();
      }

      const currentFirstInGenerated = generatedSequence[0];
      const currentLastInGenerated = generatedSequence[generatedSequence.length - 1];

      const distToFirstEnd = Math.abs(currentFirstInGenerated - primaryValueToAdd);
      const distToLastEnd = Math.abs(currentLastInGenerated - primaryValueToAdd);

      if (distToFirstEnd > distToLastEnd) {
        generatedSequence.unshift(primaryValueToAdd);
        if (willNeedSecondValue) {
          generatedSequence.push(secondaryValueToAdd);
        }
      } else {
        generatedSequence.push(primaryValueToAdd);
        if (willNeedSecondValue) {
          generatedSequence.unshift(secondaryValueToAdd);
        }
      }
    }

    currentTurn = (currentTurn === 'min') ? 'max' : 'min';
  }
  return generatedSequence;
}

function processInputData(rawInputString) {
  const parsedNumbers = rawInputString.split("\n").map(parseInteger);
  const totalCount = parsedNumbers[0];

  const initialNumbers = parsedNumbers.slice(1, totalCount + 1);
  initialNumbers.sort((a, b) => a - b);

  const diffSumMinStart = calculateAbsoluteDifferencesSum(constructAlternatingSequence('min', [...initialNumbers], totalCount));
  const diffSumMaxStart = calculateAbsoluteDifferencesSum(constructAlternatingSequence('max', [...initialNumbers], totalCount));

  if (diffSumMinStart > diffSumMaxStart) {
    console.log(diffSumMinStart);
  } else {
    console.log(diffSumMaxStart);
  }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
