let currentInputString;
let currentPosition;

function advanceBy(quantity) {
  currentPosition += quantity;
}

function examineChar(offset = 0) {
  if (currentPosition + offset >= currentInputString.length) {
    return null;
  }
  return currentInputString.charAt(currentPosition + offset);
}

function verifyAndConsume(expectedPattern) {
  const patternLength = expectedPattern.length;
  if (currentPosition + patternLength > currentInputString.length) {
    return false;
  }
  if (currentInputString.substring(currentPosition, currentPosition + patternLength) === expectedPattern) {
    advanceBy(patternLength);
    return true;
  }
  return false;
}

function isAlphaNumericChar(char) {
  return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || (char >= '0' && char <= '9');
}

const FormulaNodeType = {
  EQUALITY_CHECK: 'EQ',
  BINARY_EXPRESSION: 'BIN',
  UNARY_EXPRESSION: 'UN',
  VARIABLE_REFERENCE: 'VAR'
};

function parseSingleVariable() {
  let initialChar = examineChar();
  if (initialChar && (isAlphaNumericChar(initialChar) || initialChar === 'T' || initialChar === 'F')) {
    advanceBy(1);
    return { kind: FormulaNodeType.VARIABLE_REFERENCE, identifier: initialChar };
  }
  return null;
}

function parseLogicFormula() {
  let initialChar = examineChar();

  if (initialChar === '(') {
    advanceBy(1);
    let leftSideNode = parseLogicFormula();
    if (!leftSideNode) throw new Error("Expected formula after opening parenthesis.");

    let operatorToken = examineChar();
    let operatorValue = null;
    let tokenLength = 0;

    if (operatorToken === '*') {
      operatorValue = '*';
      tokenLength = 1;
    } else if (operatorToken === '+') {
      operatorValue = '+';
      tokenLength = 1;
    } else if (operatorToken === '-') {
      if (examineChar(1) === '>') {
        operatorValue = '->';
        tokenLength = 2;
      }
    }

    if (operatorValue) {
      advanceBy(tokenLength);
      let rightSideNode = parseLogicFormula();
      if (!rightSideNode) throw new Error("Expected formula after operator.");
      if (!verifyAndConsume(')')) {
        throw new Error("Expected ')' after binary operation.");
      }
      return { kind: FormulaNodeType.BINARY_EXPRESSION, operator: operatorValue, left: leftSideNode, right: rightSideNode };
    } else {
      throw new Error("Expected binary operator or closing parenthesis after formula in parentheses.");
    }
  }

  if (initialChar === '-') {
    advanceBy(1);
    let operandNode = parseLogicFormula();
    if (!operandNode) throw new Error("Expected formula after unary operator.");
    return { kind: FormulaNodeType.UNARY_EXPRESSION, operator: '-', operand: operandNode };
  }

  let variableNode = parseSingleVariable();
  if (variableNode) {
    return variableNode;
  }

  throw new Error("Unexpected character at " + currentPosition + ": '" + initialChar + "'. Expected '(', '-', or a variable.");
}

function parseEquationStatement() {
  currentPosition = 0;
  let firstFormula = parseLogicFormula();
  if (!firstFormula) throw new Error("Expected formula for left side of equation.");
  if (!verifyAndConsume('=')) {
    throw new Error("Expected '=' token.");
  }
  let secondFormula = parseLogicFormula();
  if (!secondFormula) throw new Error("Expected formula for right side of equation.");
  if (currentPosition < currentInputString.length) {
    throw new Error("Unexpected characters after equation: " + currentInputString.substring(currentPosition));
  }
  return { kind: FormulaNodeType.EQUALITY_CHECK, first: firstFormula, second: secondFormula };
}

function processAllInput(inputSource) {
  inputSource.toString().split('\n').forEach(inputLine => {
    if (inputLine === '#') process.exit(0);

    let parsedSyntaxTree = null;
    let parsingSuccessful = true;
    try {
      currentInputString = inputLine;
      parsedSyntaxTree = parseEquationStatement();
    } catch (error) {
      parsingSuccessful = false;
    }

    // This replicates the bug in the original code where `isValid` is never updated.
    // If parsing fails, the original code still prints 'YES'.
    // If parsing succeeds, `overallCorrectness` is initialized to true and never changed.
    if (!parsingSuccessful) {
      console.log('YES');
      return;
    }

    let overallCorrectness = true;

    for (let iterationCounter = 0; iterationCounter < (1 << 11); iterationCounter++) {
      const retrieveVariableValue = (charIdentifier) => {
        if (charIdentifier === 'T') return true;
        if (charIdentifier === 'F') return false;
        const charCodeDifference = charIdentifier.charCodeAt(0) - 'a'.charCodeAt(0);
        return !!((iterationCounter >> charCodeDifference) & 1);
      };

      const computeNodeResult = (node) => {
        switch (node.kind) {
          case FormulaNodeType.VARIABLE_REFERENCE:
            return retrieveVariableValue(node.identifier);
          case FormulaNodeType.UNARY_EXPRESSION:
            if (node.operator === '-') {
              return !computeNodeResult(node.operand);
            }
            break;
          case FormulaNodeType.BINARY_EXPRESSION:
            const leftResult = computeNodeResult(node.left);
            const rightResult = computeNodeResult(node.right);
            if (node.operator === '*') return leftResult && rightResult;
            if (node.operator === '+') return leftResult || rightResult;
            if (node.operator === '->') return !leftResult || rightResult;
            break;
        }
        return false;
      };

      // The original code's `isValid &= ...` line is commented out.
      // Therefore, this check is omitted to exactly match the original's output.
      // If it were implemented to fix the bug, it would look like this:
      // const leftFormulaResult = computeNodeResult(parsedSyntaxTree.first);
      // const rightFormulaResult = computeNodeResult(parsedSyntaxTree.second);
      // if (leftFormulaResult !== rightFormulaResult) {
      //   overallCorrectness = false;
      //   break;
      // }
    }
    console.log(overallCorrectness ? 'YES' : 'NO');
  });
}

processAllInput(require('fs').readFileSync('/dev/stdin', 'utf8'));