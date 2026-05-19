'use strict';

function createTokenParser(tokenString) {
  const tokenLength = tokenString.length;
  return function (inputStr, currentPosition) {
    const matchedSubstring = inputStr.slice(currentPosition, currentPosition + tokenLength);
    if (matchedSubstring === tokenString) {
      return [true, tokenString, currentPosition + tokenLength];
    } else {
      return [false, null, currentPosition];
    }
  };
}

function createChoiceParser(...parserList) {
  return function (inputStr, currentPosition) {
    for (let parserIndex = 0; parserIndex < parserList.length; parserIndex++) {
      const parseAttemptResult = parserList[parserIndex](inputStr, currentPosition);
      if (parseAttemptResult[0]) {
        return parseAttemptResult;
      }
    }
    return [false, null, currentPosition];
  };
}

function createSequenceParser(...sequenceParsers) {
  return function (inputStr, startPosition) {
    const collectedValues = [];
    let nextParsePosition = startPosition;

    for (let parserIndex = 0; parserIndex < sequenceParsers.length; parserIndex++) {
      const parseResult = sequenceParsers[parserIndex](inputStr, nextParsePosition);
      if (!parseResult[0]) {
        return [false, null, startPosition];
      }
      collectedValues.push(parseResult[1]);
      nextParsePosition = parseResult[2];
    }
    return [true, collectedValues, nextParsePosition];
  };
}

function createLazyParser(parserFactoryFn) {
  let memoizedParserInstance;
  return function (inputString, startPosition) {
    if (!memoizedParserInstance) {
      memoizedParserInstance = parserFactoryFn();
    }
    return memoizedParserInstance(inputString, startPosition);
  };
}

function mapParserResult(baseParser, transformFunction) {
  return function (inputStr, currentPosition) {
    const baseParseResult = baseParser(inputStr, currentPosition);
    if (baseParseResult[0]) {
      const transformedValue = transformFunction(baseParseResult[1]);
      return [baseParseResult[0], transformedValue, baseParseResult[2]];
    } else {
      return baseParseResult;
    }
  };
}

function createOneOfCharParser(allowedChars) {
  const allowedCharMap = {};
  for (let i = 0; i < allowedChars.length; i++) {
    allowedCharMap[allowedChars[i]] = true;
  }

  return function (inputStr, currentPosition) {
    if (currentPosition >= inputStr.length) {
      return [false, null, currentPosition];
    }
    const charToMatch = inputStr.charAt(currentPosition);
    if (allowedCharMap[charToMatch]) {
      return [true, charToMatch, currentPosition + 1];
    } else {
      return [false, null, currentPosition];
    }
  };
}

(function (inputContent) {
  const logicalFormulaParser = createLazyParser(function () {
    const openParen = createTokenParser('(');
    const closeParen = createTokenParser(')');
    const multiplyOp = createTokenParser('*');
    const addOp = createTokenParser('+');
    const impliesOp = createTokenParser('->');
    const negateOp = createTokenParser('-');

    const andExpressionParser = mapParserResult(
      createSequenceParser(openParen, logicalFormulaParser, multiplyOp, logicalFormulaParser, closeParen),
      function (parsedComponents) {
        return { op: '*', operands: [parsedComponents[1], parsedComponents[3]] };
      }
    );

    const orExpressionParser = mapParserResult(
      createSequenceParser(openParen, logicalFormulaParser, addOp, logicalFormulaParser, closeParen),
      function (parsedComponents) {
        return { op: '+', operands: [parsedComponents[1], parsedComponents[3]] };
      }
    );

    const impliesExpressionParser = mapParserResult(
      createSequenceParser(openParen, logicalFormulaParser, impliesOp, logicalFormulaParser, closeParen),
      function (parsedComponents) {
        return { op: '->', operands: [parsedComponents[1], parsedComponents[3]] };
      }
    );

    const notExpressionParser = mapParserResult(
      createSequenceParser(negateOp, logicalFormulaParser),
      function (parsedComponents) {
        return { op: '-', operands: [parsedComponents[1]] };
      }
    );

    const atomicValueParser = mapParserResult(
      createOneOfCharParser('abcdefghijkTF'),
      function (charValue) {
        return { value: charValue, operands: [] };
      }
    );

    return createChoiceParser(andExpressionParser, orExpressionParser, impliesExpressionParser, notExpressionParser, atomicValueParser);
  });

  const equationExpressionParser = mapParserResult(
    createSequenceParser(logicalFormulaParser, createTokenParser('='), logicalFormulaParser),
    function (parsedParts) {
      return { leftSide: parsedParts[0], rightSide: parsedParts[2] };
    }
  );

  inputContent.toString().split('\n').forEach(function (inputLine) {
    if (inputLine === '#') {
      process.exit(0);
    }

    const parsingOutcome = equationExpressionParser(inputLine, 0);

    let isLineValid = true; // This variable remains true, mirroring original behavior

    const charCodeA = 'a'.charCodeAt(0);

    const evaluateCharAsBoolean = function (charIdentifier, currentTruthAssignment) {
      if (charIdentifier === 'T') return true;
      if (charIdentifier === 'F') return false;
      const charOffset = charIdentifier.charCodeAt(0) - charCodeA;
      return !!((currentTruthAssignment >> charOffset) & 1);
    };

    const evaluateLogicalFormula = function (formulaNode, currentTruthAssignment) {
      const operandCount = formulaNode.operands.length;

      if (operandCount === 0) {
        return evaluateCharAsBoolean(formulaNode.value, currentTruthAssignment);
      } else if (operandCount === 1) {
        const operandValue = evaluateLogicalFormula(formulaNode.operands[0], currentTruthAssignment);
        return !operandValue;
      } else if (operandCount === 2) {
        const leftOperandValue = evaluateLogicalFormula(formulaNode.operands[0], currentTruthAssignment);
        const rightOperandValue = evaluateLogicalFormula(formulaNode.operands[1], currentTruthAssignment);
        const operatorType = formulaNode.op;

        switch (operatorType) {
          case '*': return leftOperandValue && rightOperandValue;
          case '+': return leftOperandValue || rightOperandValue;
          case '->': return !leftOperandValue || rightOperandValue;
          default:
            throw new Error(`Unknown binary operator: ${operatorType}`);
        }
      }
      throw new Error('Invalid formula node structure.');
    };

    const maxTruthAssignments = 1 << 11;
    for (let truthAssignmentIteration = 0; truthAssignmentIteration < maxTruthAssignments; truthAssignmentIteration++) {
      // The original code had a commented-out line here that would update `isValid`.
      // To preserve exact observable behavior (always printing 'YES'), we perform
      // the computation but discard its result, ensuring `isLineValid` remains true.
      if (parsingOutcome[0]) {
        const leftSideResult = evaluateLogicalFormula(parsingOutcome[1].leftSide, truthAssignmentIteration);
        const rightSideResult = evaluateLogicalFormula(parsingOutcome[1].rightSide, truthAssignmentIteration);
        const _ = leftSideResult === rightSideResult; // Dummy assignment to ensure computation occurs
      }
    }

    console.log(isLineValid ? 'YES' : 'NO');
  });

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
