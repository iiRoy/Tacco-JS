function readLineAsIntegers(lineText) {
  var parts = lineText.split(' ');
  var values = [];

  for (var index = 0; index < parts.length; index++) {
    values.push(parseInt(parts[index]));
  }

  return values;
}

function extractProblemArrays(rawInput) {
  var lines = rawInput.split('\n');

  return {
    firstGroup: readLineAsIntegers(lines[1]),
    secondGroup: readLineAsIntegers(lines[2]),
    thirdGroup: readLineAsIntegers(lines[3])
  };
}

function isStrictlySmaller(leftValue, rightValue) {
  return leftValue < rightValue;
}

function countValuesBeforeMiddleValue(leftValues, middleValue) {
  var amount = 0;

  for (var leftIndex = 0; leftIndex < leftValues.length; leftIndex++) {
    if (isStrictlySmaller(leftValues[leftIndex], middleValue)) {
      amount++;
    }
  }

  return amount;
}

function createMiddleContributionTable(leftValues, middleValues) {
  var contributionTable = [];

  for (var middleIndex = 0; middleIndex < middleValues.length; middleIndex++) {
    var middleValue = middleValues[middleIndex];

    contributionTable[middleIndex] = countValuesBeforeMiddleValue(
      leftValues,
      middleValue
    );
  }

  return contributionTable;
}

function contributionForRightValue(rightValue, middleValues, contributionTable) {
  var subtotal = 0;

  for (var middleIndex = 0; middleIndex < middleValues.length; middleIndex++) {
    var middleValue = middleValues[middleIndex];

    if (isStrictlySmaller(middleValue, rightValue)) {
      subtotal += contributionTable[middleIndex];
    }
  }

  return subtotal;
}

function calculateFinalTotal(rightValues, middleValues, contributionTable) {
  var total = 0;

  for (var rightIndex = 0; rightIndex < rightValues.length; rightIndex++) {
    total += contributionForRightValue(
      rightValues[rightIndex],
      middleValues,
      contributionTable
    );
  }

  return total;
}

function Main(input) {
  var data = extractProblemArrays(input);

  var possibles = createMiddleContributionTable(
    data.firstGroup,
    data.secondGroup
  );

  console.log(possibles);

  var answer = calculateFinalTotal(
    data.thirdGroup,
    data.secondGroup,
    possibles
  );

  console.log(answer);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));