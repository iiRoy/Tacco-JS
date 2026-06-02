(function() {
  let inputLines = [];
  const inputReader = process.openStdin();
  inputReader.setEncoding('utf8');

  const performArithmeticOperation = (firstOperand, operatorSymbol, secondOperand) => {
    const numA = parseInt(firstOperand);
    const numB = parseInt(secondOperand);
    switch (operatorSymbol) {
      case '*':
        return numA * numB;
      case '/':
        return numA / numB ^ 0; // Integer division
      case '+':
        return numA + numB;
      case 'Z': // 'Z' is used to represent subtraction after preprocessing
        return numA - numB;
      default:
        throw new Error(`Unsupported operator: ${operatorSymbol}`);
    }
  };

  const evaluateExpression = function(expressionString) {
    let currentWorkingExpression = expressionString;

    // Step 1: Recursively evaluate expressions within parentheses
    let openingParenIndex = currentWorkingExpression.indexOf('(');
    while (openingParenIndex !== -1) {
      let parenNestingLevel = 1;
      let closingParenIndex = openingParenIndex + 1;
      while (parenNestingLevel > 0) {
        if (currentWorkingExpression[closingParenIndex] === '(') {
          parenNestingLevel++;
        }
        if (currentWorkingExpression[closingParenIndex] === ')') {
          parenNestingLevel--;
        }
        closingParenIndex++;
      }
      const innerExpressionContent = currentWorkingExpression.substring(openingParenIndex + 1, closingParenIndex - 1);
      const evaluatedInnerResult = evaluateExpression(innerExpressionContent);
      currentWorkingExpression = currentWorkingExpression.substring(0, openingParenIndex) + evaluatedInnerResult + currentWorkingExpression.substring(closingParenIndex);
      openingParenIndex = currentWorkingExpression.indexOf('(');
    }

    // Step 2: Handle multiplication and division operations
    let operationMatch;
    const multDivPattern = /^(.*?)(-?\d+)([*/])(-?\d+)(.*)$/;
    while ((operationMatch = multDivPattern.exec(currentWorkingExpression)) != null) {
      const preMatchSegment = operationMatch[1];
      const operandOne = operationMatch[2];
      const operatorChar = operationMatch[3];
      const operandTwo = operationMatch[4];
      const postMatchSegment = operationMatch[5];

      const calculationResult = performArithmeticOperation(operandOne, operatorChar, operandTwo);
      currentWorkingExpression = preMatchSegment + calculationResult + postMatchSegment;
    }

    // Step 3: Handle addition and subtraction operations
    const addSubPattern = /^(.*?)(-?\d+)([+Z])(-?\d+)(.*)$/;
    while ((operationMatch = addSubPattern.exec(currentWorkingExpression)) != null) {
      const preMatchSegment = operationMatch[1];
      const operandOne = operationMatch[2];
      const operatorChar = operationMatch[3];
      const operandTwo = operationMatch[4];
      const postMatchSegment = operationMatch[5];

      const calculationResult = performArithmeticOperation(operandOne, operatorChar, operandTwo);
      currentWorkingExpression = preMatchSegment + calculationResult + postMatchSegment;
    }
    return currentWorkingExpression;
  };

  inputReader.on('data', function(dataChunk) {
    const segmentsFromInput = dataChunk.split("\n");

    // This conditional logic is crucial for preserving the original behavior
    // regarding how input lines are accumulated.
    if (segmentsFromInput.length > 2 || !isNaN(segmentsFromInput[1])) {
      inputLines = segmentsFromInput;
    } else {
      inputLines.push(segmentsFromInput[0]);
    }
  });

  inputReader.on('end', function(_endEventArg) { // Argument 'z' is unused in original, renamed for clarity
    const numberOfExpressions = parseInt(inputLines[0]);

    for (let currentLineIndex = 1; currentLineIndex <= numberOfExpressions; currentLineIndex++) {
      const fullExpressionLine = inputLines[currentLineIndex];
      const equalsCharPosition = fullExpressionLine.indexOf('=');
      
      // Extract the part of the string before the '=' sign
      const expressionBeforeEquals = fullExpressionLine.substring(0, equalsCharPosition);
      
      // Replace all occurrences of '-' with 'Z' to differentiate subtraction from negative numbers
      const preprocessedExpression = expressionBeforeEquals.replace(/-/g, 'Z');
      
      // Evaluate the preprocessed expression and print the result
      console.log(evaluateExpression(preprocessedExpression));
    }
  });

}).call(this);
