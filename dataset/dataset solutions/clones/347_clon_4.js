const rdr = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let lineBuffer = [];

const operatorWeights = {
  '*': 2,
  '/': 2,
  '+': 1,
  'S': 1 // 'S' stands for Subtraction, replacing 'Z' from original, which replaced '-'
};

const operationExecutors = {
  '*': (op1, op2) => op1 * op2,
  '/': (op1, op2) => Math.trunc(op1 / op2), // Integer division
  '+': (op1, op2) => op1 + op2,
  'S': (op1, op2) => op1 - op2
};

// Function to break an expression string into tokens (numbers, operators, parentheses)
function extractTokens(expressionSegment) {
  const tokenList = [];
  let currentNumAccum = '';
  const binaryOperators = ['*', '/', '+', 'S']; // 'S' for Subtraction
  const bracketSymbols = ['(', ')'];

  for (let charIndex = 0; charIndex < expressionSegment.length; charIndex++) {
    const symbol = expressionSegment[charIndex];

    if (/\d/.test(symbol)) {
      currentNumAccum += symbol;
    } else if (symbol === '-' && (charIndex === 0 || bracketSymbols.includes(expressionSegment[charIndex - 1]) || binaryOperators.includes(expressionSegment[charIndex - 1]) || expressionSegment[charIndex - 1] === ' ')) {
      // This is a unary minus, part of a number (e.g., -5, 10*(-3)).
      // It won't be from the initial '-' -> 'S' replacement.
      if (currentNumAccum !== '') {
        tokenList.push(parseInt(currentNumAccum, 10));
        currentNumAccum = '';
      }
      currentNumAccum += symbol; // Start accumulating a negative number
    } else { // Operator, parenthesis, or space
      if (currentNumAccum !== '') {
        tokenList.push(parseInt(currentNumAccum, 10));
        currentNumAccum = '';
      }
      if (symbol === ' ') {
        continue;
      } else if (binaryOperators.includes(symbol) || bracketSymbols.includes(symbol)) {
        tokenList.push(symbol);
      } else {
        // Encountered an unexpected character.
        // The original would likely return the unprocessed string.
        // This tokenization should not fail, but subsequent RPN conversion/evaluation might.
        // For now, push it as a string token, let later stages handle failure.
        tokenList.push(symbol);
      }
    }
  }
  if (currentNumAccum !== '') {
    tokenList.push(parseInt(currentNumAccum, 10));
  }
  return tokenList;
}

// Converts infix token stream to Reverse Polish Notation (RPN) using Shunting-yard algorithm
function convertToPostfixNotation(tokenStream) {
  const rpnOutput = [];
  const operatorHoldingStack = [];

  for (const item of tokenStream) {
    if (typeof item === 'number') {
      rpnOutput.push(item);
    } else if (item === '(') {
      operatorHoldingStack.push(item);
    } else if (item === ')') {
      while (operatorHoldingStack.length > 0 && operatorHoldingStack[operatorHoldingStack.length - 1] !== '(') {
        rpnOutput.push(operatorHoldingStack.pop());
      }
      if (operatorHoldingStack.length === 0 || operatorHoldingStack[operatorHoldingStack.length - 1] !== '(') {
        // Mismatched parentheses (closing without opening)
        return null; // Indicates a parsing error, similar to original returning unprocessed string
      }
      operatorHoldingStack.pop(); // Pop the '('
    } else if (['*', '/', '+', 'S'].includes(item)) {
      while (
        operatorHoldingStack.length > 0 &&
        ['*', '/', '+', 'S'].includes(operatorHoldingStack[operatorHoldingStack.length - 1]) &&
        operatorWeights[operatorHoldingStack[operatorHoldingStack.length - 1]] >= operatorWeights[item]
      ) {
        rpnOutput.push(operatorHoldingStack.pop());
      }
      operatorHoldingStack.push(item);
    } else {
      // Unknown token (e.g., an invalid character that wasn't filtered)
      return null;
    }
  }

  while (operatorHoldingStack.length > 0) {
    if (operatorHoldingStack[operatorHoldingStack.length - 1] === '(') {
      // Unmatched opening parenthesis
      return null; // Indicates a parsing error
    }
    rpnOutput.push(operatorHoldingStack.pop());
  }

  return rpnOutput;
}

// Evaluates an RPN token stream
function calculatePostfix(rpnSequence) {
  const operandPile = [];
  for (const element of rpnSequence) {
    if (typeof element === 'number') {
      operandPile.push(element);
    } else if (['*', '/', '+', 'S'].includes(element)) {
      const operand2 = operandPile.pop();
      const operand1 = operandPile.pop();
      if (operand1 === undefined || operand2 === undefined) {
        return NaN; // Malformed RPN: not enough operands
      }
      const executor = operationExecutors[element];
      operandPile.push(executor(operand1, operand2));
    } else {
      return NaN; // Unknown operator in RPN sequence
    }
  }
  if (operandPile.length !== 1) {
    return NaN; // Malformed RPN: too many or too few operands/operators
  }
  return operandPile.pop();
}

// Main expression evaluation function, recursively handling parentheses
function evaluateComplexExpression(expressionText) {
  let currentEvaluationText = expressionText;
  let openParenPosition;

  // Process parentheses recursively, mimicking the original's approach
  while ((openParenPosition = currentEvaluationText.indexOf('(')) !== -1) {
    let parenDepth = 1;
    let closeParenPosition = openParenPosition + 1;

    while (parenDepth > 0 && closeParenPosition < currentEvaluationText.length) {
      if (currentEvaluationText[closeParenPosition] === '(') {
        parenDepth++;
      } else if (currentEvaluationText[closeParenPosition] === ')') {
        parenDepth--;
      }
      closeParenPosition++;
    }

    // If parentheses are mismatched (no closing paren found), `closeParenPosition` will be `length`.
    // The substring will be `(openParenPosition + 1, length - 1)`, replicating original's behavior.
    if (parenDepth !== 0) {
      closeParenPosition = currentEvaluationText.length;
    }

    const enclosedExpression = currentEvaluationText.substring(openParenPosition + 1, closeParenPosition - 1);
    const evaluatedEnclosed = evaluateComplexExpression(enclosedExpression); // Recursive call

    // Splice the evaluated result back into the string
    currentEvaluationText = currentEvaluationText.substring(0, openParenPosition) + evaluatedEnclosed + currentEvaluationText.substring(closeParenPosition);
  }

  // After all parentheses are resolved, evaluate the flat expression using RPN
  const flatTokens = extractTokens(currentEvaluationText);

  // If the result is a single number, return it as a string
  if (flatTokens.length === 1 && typeof flatTokens[0] === 'number') {
    return flatTokens[0].toString();
  }

  const rpnForm = convertToPostfixNotation(flatTokens);

  if (rpnForm === null) {
    // RPN conversion failed (e.g., mismatched parentheses or invalid tokens)
    return currentEvaluationText; // Return the unprocessed string, matching original's implicit failure
  }

  const finalResult = calculatePostfix(rpnForm);

  if (isNaN(finalResult)) {
    // RPN calculation failed (e.g., division by zero, malformed RPN)
    return currentEvaluationText; // Return the unprocessed string
  }

  return finalResult.toString();
}

rdr.on('line', (individualLine) => {
  lineBuffer.push(individualLine);
});

rdr.on('close', () => {
  const expressionCount = parseInt(lineBuffer[0], 10);

  for (let currentStatementIndex = 1; currentStatementIndex <= expressionCount; currentStatementIndex++) {
    const fullStatement = lineBuffer[currentStatementIndex];
    const computationPart = fullStatement.substring(0, fullStatement.indexOf('='));

    // Replace all original hyphens with 'S' (mimicking original's 'Z' replacement for '-')
    // This replacement happens only once for the initial input string, before recursion.
    const modifiedComputationPart = computationPart.replace(/-/g, 'S');

    const finalOutput = evaluateComplexExpression(modifiedComputationPart);
    console.log(finalOutput);
  }
});