//  This module handles the evaluation of mathematical expressions provided via standard input.
//  It supports basic arithmetic operations within parentheses.

( function () {

  let dataLines = [ ] ; //  Container for all input lines received.

  const inputStream = process.openStdin ( ) ; //  Acquires the standard input stream.
  inputStream.setEncoding ( 'utf8' ) ; //  Ensures input is read as UTF-8 text.


  /**
   *  Recursively evaluates a mathematical expression string.
   *  Handles parentheses, then multiplication/division, then addition/subtraction.
   *
   *  @param {string} currentExpression - The mathematical string to evaluate.
   *  @returns {string} The result of the evaluation as a string.
   */
  const evaluateMathString = ( currentExpression ) => {
    let openParenPosition, parenDepth, closeParenPosition, regexMatch;

    //  First pass: Handle nested parentheses recursively.
    openParenPosition = currentExpression.indexOf('(');
    while (openParenPosition !== -1) {
      parenDepth = 1;
      closeParenPosition = openParenPosition + 1;

      //  Iterate to find the matching closing parenthesis.
      while (parenDepth > 0) {
        if (currentExpression[closeParenPosition] === '(') {
          parenDepth++;
        }
        if (currentExpression[closeParenPosition] === ')') {
          parenDepth--;
        }
        closeParenPosition++;
      }

      //  Recursively evaluate the content within the parentheses and substitute the result.
      currentExpression = currentExpression.substring(0, openParenPosition) +
                          evaluateMathString(currentExpression.substring(openParenPosition + 1, closeParenPosition - 1)) +
                          currentExpression.substring(closeParenPosition);
      openParenPosition = currentExpression.indexOf('('); //  Search for the next opening parenthesis.
    }

    //  Second pass: Process multiplication and division operations.
    //  The regular expression captures an optional prefix, the first number, the operator (* or /),
    //  the second number, and an optional suffix.
    while ((regexMatch = /^(.*?)(-?\d+)([*/])(-?\d+)(.*)$/.exec(currentExpression)) !== null) {
      const operand1 = parseInt(regexMatch[2], 10);
      const operand2 = parseInt(regexMatch[4], 10);
      let calculationResult;

      if (regexMatch[3] === '*') {
        calculationResult = operand1 * operand2;
      } else {
        //  Perform integer division by using bitwise OR with 0 for truncation.
        calculationResult = (operand1 / operand2) | 0;
      }
      //  Replace the matched arithmetic operation with its computed result.
      currentExpression = regexMatch[1] + calculationResult + regexMatch[5];
    }

    //  Third pass: Process addition and subtraction operations.
    //  The regular expression identifies an optional prefix, the first number, the operator (+ or 'Z' for subtraction),
    //  the second number, and an optional suffix.
    while ((regexMatch = /^(.*?)(-?\d+)([+Z])(-?\d+)(.*)$/.exec(currentExpression)) !== null) {
      const operand1 = parseInt(regexMatch[2], 10);
      const operand2 = parseInt(regexMatch[4], 10);
      let calculationResult;

      if (regexMatch[3] === '+') {
        calculationResult = operand1 + operand2;
      } else { //  'Z' is a placeholder for '-' after initial string modification.
        calculationResult = operand1 - operand2;
      }
      //  Substitute the matched operation with its calculated value.
      currentExpression = regexMatch[1] + calculationResult + regexMatch[5];
    }

    return currentExpression; //  Returns the final evaluated string, which should be a numerical value.
  };


  //  Event handler for receiving data chunks from standard input.
  inputStream.on( 'data', ( incomingBuffer ) => {
    let singleLine, parsedInputLines;

    //  This immediately invoked function expression (IIFE) processes the incoming buffer,
    //  splitting it into an array of individual lines. This structure mirrors CoffeeScript's array comprehension.
    parsedInputLines = (function () {
      const sourceData = incomingBuffer.split('\n');
      const transformedResults = [];
      for (let idx = 0, totalLength = sourceData.length; idx < totalLength; idx++) {
        singleLine = sourceData[idx];
        transformedResults.push(singleLine);
      }
      return transformedResults;
    })();

    //  Checks if the received input block is the initial set of expressions (more than 2 lines
    //  or the second line is not a number, implying the first line is the count).
    //  Otherwise, it appends the first line of the block to the existing data.
    if (parsedInputLines.length > 2 || !isNaN(parsedInputLines[1])) {
      dataLines = parsedInputLines;
    } else {
      dataLines.push(parsedInputLines[0]);
    }
  });


  //  Event handler triggered when the standard input stream ends.
  inputStream.on( 'end', ( endSignal ) => {
    let loopIndex, numberOfEntries, currentInputString;
    const evaluationOutputs = []; //  An array to capture the results of console.log calls.

    //  The very first line of input is parsed as the total number of expressions to evaluate.
    numberOfEntries = parseInt(dataLines[0], 10);

    //  Iterate through each expression, starting from the second line of the input data.
    for (loopIndex = 1; loopIndex <= numberOfEntries; loopIndex = loopIndex + 1) {
      //  Extract the part of the string before the '=' sign and replace all '-' characters with 'Z'.
      //  'Z' acts as a temporary placeholder for subtraction to distinguish it from negative numbers
      //  during regex matching for operators.
      currentInputString = dataLines[loopIndex].substring(0, dataLines[loopIndex].indexOf('='))
                                                .replace(/-/g, 'Z');
      //  Evaluate the pre-processed string and output the final numerical result to the console.
      evaluationOutputs.push(console.log(evaluateMathString(currentInputString)));
    }
    return evaluationOutputs; //  Returns an array of `undefined` values (results of `console.log`).
  });

} ).call( this ) ; //  Invokes the anonymous function immediately, ensuring 'this' refers to the global object.