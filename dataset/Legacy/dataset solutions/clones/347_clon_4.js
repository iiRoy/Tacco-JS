(() => {
  let inputAccumulator = [];
  const inputReader = process.openStdin();
  inputReader.setEncoding('utf8');

  const operatorPrecedence = {
    '+': 1,
    'Z': 1, // 'Z' represents subtraction, as per original code's replacement
    '*': 2,
    '/': 2,
  };

  const isOperatorToken = (token) => operatorPrecedence.hasOwnProperty(token);
  const isNumberToken = (token) => typeof token === 'number';

  // Converts an arithmetic expression string into an array of tokens.
  // Handles numbers (including negative results from operations), operators, and parentheses.
  const lexExpression = (expressionString) => {
    const tokens = [];
    let currentNumericString = '';

    for (let i = 0; i < expressionString.length; i++) {
      const char = expressionString[i];

      if (/\d/.test(char)) {
        currentNumericString += char;
      } else {
        if (currentNumericString !== '') {
          tokens.push(Number.parseInt(currentNumericString));
          currentNumericString = '';
        }

        // Handle negative numbers that are results of previous operations (e.g., "-3")
        // The original code's regex `(-?\d+)` would match these.
        // All original hyphens are replaced by 'Z', so '-' only appears as a sign for a number result.
        if (char === '-' && /\d/.test(expressionString[i + 1])) {
          currentNumericString += char; // Start building a negative number
        } else if (char === '(' || char === ')') {
          tokens.push(char);
        } else if (isOperatorToken(char)) { // This includes '+', 'Z', '*', '/'
          tokens.push(char);
        }
        // Any other character is ignored (original code implicitly ignores non-matching parts)
      }
    }

    if (currentNumericString !== '') {
      tokens.push(Number.parseInt(currentNumericString));
    }
    return tokens;
  };

  // Implements the Shunting-yard algorithm to convert infix tokens to Reverse Polish Notation (RPN).
  const transformToRPN = (infixTokens) => {
    const outputQueue = [];
    const operatorStack = [];

    for (const token of infixTokens) {
      if (isNumberToken(token)) {
        outputQueue.push(token);
      } else if (token === '(') {
        operatorStack.push(token);
      } else if (token === ')') {
        while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
          outputQueue.push(operatorStack.pop());
        }
        // Pop the '(' from the stack. Assuming balanced parentheses for valid input.
        if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] === '(') {
          operatorStack.pop();
        }
      } else if (isOperatorToken(token)) {
        while (
          operatorStack.length > 0 &&
          isOperatorToken(operatorStack[operatorStack.length - 1]) &&
          operatorPrecedence[operatorStack[operatorStack.length - 1]] >= operatorPrecedence[token]
        ) {
          outputQueue.push(operatorStack.pop());
        }
        operatorStack.push(token);
      }
    }

    while (operatorStack.length > 0) {
      outputQueue.push(operatorStack.pop());
    }
    return outputQueue;
  };

  // Evaluates an expression in Reverse Polish Notation (RPN) using a stack.
  const computeRPN = (rpnTokens) => {
    const valueStack = [];

    for (const token of rpnTokens) {
      if (isNumberToken(token)) {
        valueStack.push(token);
      } else if (isOperatorToken(token)) {
        const operand2 = valueStack.pop();
        const operand1 = valueStack.pop();

        let calculationResult;
        switch (token) {
          case '+':
            calculationResult = operand1 + operand2;
            break;
          case 'Z': // Subtraction
            calculationResult = operand1 - operand2;
            break;
          case '*':
            calculationResult = operand1 * operand2;
            break;
          case '/':
            // Integer division truncating towards zero, matching original `^ 0` behavior
            calculationResult = (operand1 / operand2) | 0;
            break;
          default:
            // Should not be reached with valid operators
            throw new Error(`Unrecognized operator: ${token}`);
        }
        valueStack.push(calculationResult);
      }
    }
    return valueStack.pop();
  };

  // Main expression evaluation function, replacing the original 'proc'
  const evaluateArithmeticExpression = (expressionInput) => {
    const tokens = lexExpression(expressionInput);
    const rpn = transformToRPN(tokens);
    return computeRPN(rpn);
  };

  // Input data handler - preserving original's peculiar logic for 'a'
  inputReader.on('data', (incomingChunk) => {
    const chunkLines = incomingChunk.split("\n");
    // This condition replicates the original's behavior:
    // If chunkLines has more than 2 elements, or if chunkLines[1] is not NaN (i.e., it's an empty string or a number),
    // then 'inputAccumulator' is replaced. Otherwise, only the first line is pushed.
    // This means 'inputAccumulator' is typically overwritten by the last chunk if it contains a newline.
    if (chunkLines.length > 2 || !Number.isNaN(chunkLines[1])) {
      inputAccumulator = chunkLines;
    } else {
      inputAccumulator.push(chunkLines[0]);
    }
  });

  // End of input handler
  inputReader.on('end', () => {
    const totalExpressions = Number.parseInt(inputAccumulator[0]);
    for (let currentLineIndex = 1; currentLineIndex <= totalExpressions; ++currentLineIndex) {
      // Extract the expression part before '=' and replace all '-' with 'Z'
      const processedLine = inputAccumulator[currentLineIndex].slice(0, inputAccumulator[currentLineIndex].indexOf('=')).replaceAll('-', 'Z');
      console.log(evaluateArithmeticExpression(processedLine));
    }
  });

})();
