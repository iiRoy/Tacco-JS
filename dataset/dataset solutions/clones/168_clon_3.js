const operators = ['+', '-', '*'];
const expressionTemplates = [
  '(@%@)%(@%@)',
  '@%(@%@)%@',
  '@%@%@%@',
  '(@%(@%@))%@'
];

function formatExpression(templateString, values, ops) {
  let valueIndex = 0;
  let operatorIndex = 0;

  const replaceValuePlaceholder = () => {
    const currentValue = values[valueIndex];
    valueIndex++;
    return currentValue;
  };

  const replaceOperatorPlaceholder = () => {
    const currentOperator = ops[operatorIndex];
    operatorIndex++;
    return currentOperator;
  };

  let partiallyFormatted = templateString.replace(/@/g, replaceValuePlaceholder);
  let fullyFormatted = partiallyFormatted.replace(/%/g, replaceOperatorPlaceholder);

  return fullyFormatted;
}

function generatePermutations(sourceArray) {
  const arrayLength = sourceArray.length;
  let resultPermutations = [];

  if (arrayLength === 0) {
    return [
      []
    ];
  }

  for (let i = 0; i < arrayLength; i++) {
    let remainingElements = [...sourceArray];
    const currentElement = remainingElements.splice(i, 1)[0];

    const subPermutations = generatePermutations(remainingElements);

    const permutationsWithCurrent = subPermutations.map(function(subPermutation) {
      subPermutation.unshift(currentElement);
      return subPermutation;
    });

    resultPermutations = resultPermutations.concat(permutationsWithCurrent);
  }
  return resultPermutations;
}

function checkExpressionForTen(expressionString) {
  try {
    return eval(expressionString) === 10;
  } catch (e) {
    return false;
  }
}

function findTenExpression(initialNumbers) {
  const allNumberPermutations = generatePermutations(initialNumbers);

  const NUM_PERMUTATIONS = allNumberPermutations.length;
  const NUM_OPERATORS = operators.length;
  const NUM_TEMPLATES = expressionTemplates.length;

  for (let permIdx = 0; permIdx < NUM_PERMUTATIONS; permIdx++) {
    const currentNumberSet = allNumberPermutations[permIdx];

    for (let op1Idx = 0; op1Idx < NUM_OPERATORS; op1Idx++) {
      for (let op2Idx = 0; op2Idx < NUM_OPERATORS; op2Idx++) {
        for (let op3Idx = 0; op3Idx < NUM_OPERATORS; op3Idx++) {
          const currentOperators = [
            operators[op1Idx],
            operators[op2Idx],
            operators[op3Idx]
          ];

          for (let templateIdx = 0; templateIdx < NUM_TEMPLATES; templateIdx++) {
            const currentTemplate = expressionTemplates[templateIdx];

            const currentExpression = formatExpression(
              currentTemplate,
              currentNumberSet,
              currentOperators
            );

            if (checkExpressionForTen(currentExpression)) {
              return currentExpression;
            }
          }
        }
      }
    }
  }
  return 0;
}

function parseAndValidateLine(lineData) {
  const parsedNumbers = lineData.split(' ').map(parseFloat);

  const isTerminationCondition = lineData.trim() === '0 0 0 0';
  const hasCorrectLength = parsedNumbers.length === 4;
  const allAreValidNumbers = parsedNumbers.every(num => !isNaN(num));

  if (isTerminationCondition) {
    return null;
  }

  if (!hasCorrectLength || !allAreValidNumbers) {
    return null;
  }

  return parsedNumbers;
}

function processInput() {
  for (const lineData of rawDataBuffer) {
    const numbersToProcess = parseAndValidateLine(lineData);

    if (numbersToProcess === null) {
      if (lineData.trim() === '0 0 0 0') {
        return;
      }
      continue;
    }

    const resultExpression = findTenExpression(numbersToProcess);
    console.log(resultExpression);
  }
}

let rawDataBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  rawDataBuffer += chunk;
});
process.stdin.on('end', function() {
  rawDataBuffer = rawDataBuffer.split('\n');
  processInput();
});
