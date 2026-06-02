'use strict';

function matchString(targetStr) {
  const targetLen = targetStr.length;
  return (inputSource, currentPosition) => {
    return inputSource.startsWith(targetStr, currentPosition)
      ? [true, targetStr, currentPosition + targetLen]
      : [false, null, currentPosition];
  };
}

function select(...parserOptions) {
  return (inputSource, currentPosition) => {
    for (const currentParser of parserOptions) {
      const parseResult = currentParser(inputSource, currentPosition);
      if (parseResult[0]) {
        return parseResult;
      }
    }
    return [false, null, currentPosition];
  };
}

function sequence(...parserSteps) {
  return (inputSource, currentPosition) => {
    const collectedValues = [];
    let nextPosition = currentPosition;

    const finalState = parserSteps.reduce((accumulator, currentParser) => {
      if (!accumulator.success) return accumulator;

      const parseResult = currentParser(inputSource, accumulator.nextPosition);
      if (!parseResult[0]) {
        return { success: false, nextPosition: currentPosition };
      }
      accumulator.values.push(parseResult[1]);
      accumulator.nextPosition = parseResult[2];
      return accumulator;
    }, { success: true, values: collectedValues, nextPosition: currentPosition });

    return finalState.success
      ? [true, finalState.values, finalState.nextPosition]
      : [false, null, currentPosition];
  };
}

function defer(parserFactory) {
  let memoizedParser = null;
  return (inputSource, currentPosition) => {
    if (!memoizedParser) {
      memoizedParser = parserFactory();
    }
    return memoizedParser(inputSource, currentPosition);
  };
}

function transform(baseParser, resultMapper) {
  return (inputSource, currentPosition) => {
    const parseResult = baseParser(inputSource, currentPosition);
    return parseResult[0]
      ? [parseResult[0], resultMapper(parseResult[1]), parseResult[2]]
      : parseResult;
  };
}

function charFrom(allowedChars) {
  const charSet = new Set(allowedChars);
  return (inputSource, currentPosition) => {
    const char = inputSource[currentPosition];
    return charSet.has(char)
      ? [true, char, currentPosition + 1]
      : [false, null, currentPosition];
  };
}

const logicalFormulaParser = defer(() => {
  const andOperationParser = transform(
    sequence(matchString('('), logicalFormulaParser, matchString('*'), logicalFormulaParser, matchString(')')),
    (parts) => ({ kind: 'AND', operands: [parts[1], parts[3]] })
  );
  const orOperationParser = transform(
    sequence(matchString('('), logicalFormulaParser, matchString('+'), logicalFormulaParser, matchString(')')),
    (parts) => ({ kind: 'OR', operands: [parts[1], parts[3]] })
  );
  const impliesOperationParser = transform(
    sequence(matchString('('), logicalFormulaParser, matchString('->'), logicalFormulaParser, matchString(')')),
    (parts) => ({ kind: 'IMPLIES', operands: [parts[1], parts[3]] })
  );
  const notOperationParser = transform(
    sequence(matchString('-'), logicalFormulaParser),
    (parts) => ({ kind: 'NOT', operands: [parts[1]] })
  );
  const literalValueParser = transform(
    charFrom('abcdefghijkTF'),
    (charVal) => ({ kind: 'LITERAL', value: charVal })
  );
  return select(andOperationParser, orOperationParser, impliesOperationParser, notOperationParser, literalValueParser);
});

const equationStatementParser = transform(
  sequence(logicalFormulaParser, matchString('='), logicalFormulaParser),
  (parts) => ({ leftSide: parts[0], rightSide: parts[2] })
);

const variableIdentifiers = 'abcdefghijk';

function* generateAllTruthAssignments() {
  const numVariables = variableIdentifiers.length;
  for (let assignmentIndex = 0; assignmentIndex < (1 << numVariables); assignmentIndex++) {
    const currentAssignmentMap = new Map();
    for (let varIdx = 0; varIdx < numVariables; varIdx++) {
      const variableChar = variableIdentifiers[varIdx];
      currentAssignmentMap.set(variableChar, !!((assignmentIndex >> varIdx) & 1));
    }
    yield currentAssignmentMap;
  }
}

const logicalOperationEvaluators = {
  'AND': (operands, assignment) => evaluateLogicalExpression(operands[0], assignment) && evaluateLogicalExpression(operands[1], assignment),
  'OR': (operands, assignment) => evaluateLogicalExpression(operands[0], assignment) || evaluateLogicalExpression(operands[1], assignment),
  'IMPLIES': (operands, assignment) => !evaluateLogicalExpression(operands[0], assignment) || evaluateLogicalExpression(operands[1], assignment),
  'NOT': (operands, assignment) => !evaluateLogicalExpression(operands[0], assignment),
};

function evaluateLogicalExpression(astNode, currentAssignment) {
  if (astNode.kind === 'LITERAL') {
    const literalValue = astNode.value;
    if (literalValue === 'T') return true;
    if (literalValue === 'F') return false;
    return currentAssignment.get(literalValue);
  } else {
    return logicalOperationEvaluators[astNode.kind](astNode.operands, currentAssignment);
  }
}

(function (inputContent) {
  inputContent.toString().split('\n').forEach(function (inputLine) {
    if (inputLine === '#') process.exit(0);

    const parsedEquation = equationStatementParser(inputLine, 0);

    let allAssignmentsConsistent = true;

    for (const assignmentMap of generateAllTruthAssignments()) {
      const leftResult = evaluateLogicalExpression(parsedEquation[1].leftSide, assignmentMap);
      const rightResult = evaluateLogicalExpression(parsedEquation[1].rightSide, assignmentMap);
    }

    console.log(allAssignmentsConsistent ? 'YES' : 'NO');
  });
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
