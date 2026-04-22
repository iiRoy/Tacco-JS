let receivedTextContent = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (incomingDataChunk) => {
  receivedTextContent += incomingDataChunk;
});

process.stdin.on('end', () => {
  const allInputLines = receivedTextContent.split('\n');
  processInputSeries(allInputLines);
});

function processInputSeries(seriesOfLines) {
  for (const singleLine of seriesOfLines) {
    const trimmedLine = singleLine.trim();

    if (trimmedLine === '0 0 0 0' || trimmedLine.length === 0) {
      continue;
    }

    const numericValues = trimmedLine.split(' ').map(Number);

    if (numericValues.length !== 4 || numericValues.some(isNaN)) {
      continue;
    }

    const resultExpression = findEquationForTen(numericValues);
    console.log(resultExpression);
  }
}

const makeValueNode = (val) => ({ kind: 'value', content: val });
const makeOperationNode = (opSymbol, leftBranch, rightBranch) => ({
  kind: 'operation',
  operator: opSymbol,
  left: leftBranch,
  right: rightBranch,
});

function computeTreeResult(nodeElement) {
  if (nodeElement.kind === 'value') {
    return nodeElement.content;
  }
  const leftComputed = computeTreeResult(nodeElement.left);
  const rightComputed = computeTreeResult(nodeElement.right);
  switch (nodeElement.operator) {
    case '+': return leftComputed + rightComputed;
    case '-': return leftComputed - rightComputed;
    case '*': return leftComputed * rightComputed;
    default: throw new Error('Unrecognized operator in tree: ' + nodeElement.operator);
  }
}

function formatTreeToString(nodeElement) {
  if (nodeElement.kind === 'value') {
    return String(nodeElement.content);
  }
  const leftString = formatTreeToString(nodeElement.left);
  const rightString = formatTreeToString(nodeElement.right);
  return `(${leftString}${nodeElement.operator}${rightString})`;
}

function* generatePermutationsOfNumbers(collection) {
  if (collection.length === 1) {
    yield collection;
    return;
  }
  for (let i = 0; i < collection.length; i++) {
    const head = collection[i];
    const tail = [...collection.slice(0, i), ...collection.slice(i + 1)];
    for (const tailPermutation of generatePermutationsOfNumbers(tail)) {
      yield [head, ...tailPermutation];
    }
  }
}

const possibleOperators = ['+', '-', '*'];
function* generateOperatorCombinations(countNeeded) {
  if (countNeeded === 0) {
    yield [];
    return;
  }
  for (const chosenOp of possibleOperators) {
    for (const remainingOps of generateOperatorCombinations(countNeeded - 1)) {
      yield [chosenOp, ...remainingOps];
    }
  }
}

function* constructAllExpressionTrees(numbersAsValues, operatorsAsSymbols) {
  const [v1, v2, v3, v4] = numbersAsValues.map(makeValueNode);
  const [op1, op2, op3] = operatorsAsSymbols;

  yield makeOperationNode(op3,
    makeOperationNode(op2,
      makeOperationNode(op1, v1, v2),
      v3
    ),
    v4
  );

  yield makeOperationNode(op3,
    makeOperationNode(op1,
      v1,
      makeOperationNode(op2, v2, v3)
    ),
    v4
  );

  yield makeOperationNode(op2,
    makeOperationNode(op1, v1, v2),
    makeOperationNode(op3, v3, v4)
  );

  yield makeOperationNode(op1,
    v1,
    makeOperationNode(op3,
      makeOperationNode(op2, v2, v3),
      v4
    )
  );

  yield makeOperationNode(op1,
    v1,
    makeOperationNode(op2,
      v2,
      makeOperationNode(op3, v3, v4)
    )
  );
}

function findEquationForTen(fourNumericInputs) {
  const targetValue = 10;
  const floatTolerance = 1e-9;

  for (const numPermutation of generatePermutationsOfNumbers(fourNumericInputs)) {
    for (const opCombination of generateOperatorCombinations(3)) {
      for (const exprTree of constructAllExpressionTrees(numPermutation, opCombination)) {
        const calculatedResult = computeTreeResult(exprTree);
        if (Math.abs(calculatedResult - targetValue) < floatTolerance) {
          return formatTreeToString(exprTree);
        }
      }
    }
  }
  return 0;
}