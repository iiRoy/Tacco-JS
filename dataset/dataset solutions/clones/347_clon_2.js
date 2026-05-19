/* This file processes mathematical expressions from standard input. */
(function() {
  // A dynamic array to store input lines.
  let dataStore = [];
  // Obtain a readable stream for standard input.
  const inputSource = process.openStdin();
  // Ensure input data is treated as UTF-8 text.
  inputSource.setEncoding('utf8');

  // Function to recursively evaluate a mathematical expression string.
  const evaluateExpression = function(currentExpression) {
    let openParenIndex, parenBalance, closeParenIndex, matchResult;

    // Handle nested parentheses first.
    openParenIndex = currentExpression.indexOf(String.fromCharCode(40)); // '('
    while (openParenIndex !== -1) {
      parenBalance = 1;
      closeParenIndex = openParenIndex + 1;
      // Find the matching closing parenthesis.
      while (parenBalance > 0) {
        if (currentExpression[closeParenIndex] === String.fromCharCode(40)) { // '('
          parenBalance++;
        }
        if (currentExpression[closeParenIndex] === String.fromCharCode(41)) { // ')'
          parenBalance--;
        }
        closeParenIndex++;
      }
      // Recursively evaluate the sub-expression and substitute it back.
      currentExpression = currentExpression.substring(0, openParenIndex) +
                          evaluateExpression(currentExpression.substring(openParenIndex + 1, closeParenIndex - 1)) +
                          currentExpression.substring(closeParenIndex);
      // Look for the next opening parenthesis.
      openParenIndex = currentExpression.indexOf(String.fromCharCode(40)); // '('
    }

    // Process multiplication and division operations.
    // Regex: (anything)(number)(* or /)(number)(anything)
    while ((matchResult = /^(.*?)(-?\d+)([*/])(-?\d+)(.*)$/.exec(currentExpression)) != null) {
      if (matchResult[3] === String.fromCharCode(42)) { // '*'
        currentExpression = matchResult[1] + (parseInt(matchResult[2], 10) * parseInt(matchResult[4], 10)) + matchResult[5];
      } else { // '/'
        // Integer division using bitwise OR 0.
        currentExpression = matchResult[1] + (parseInt(matchResult[2], 10) / parseInt(matchResult[4], 10) | 0) + matchResult[5];
      }
    }

    // Process addition and subtraction operations.
    // Note: 'Z' is a placeholder for '-' after initial processing.
    // Regex: (anything)(number)(+ or Z)(number)(anything)
    while ((matchResult = /^(.*?)(-?\d+)([+Z])(-?\d+)(.*)$/.exec(currentExpression)) != null) {
      if (matchResult[3] === String.fromCharCode(43)) { // '+'
        currentExpression = matchResult[1] + (parseInt(matchResult[2], 10) + parseInt(matchResult[4], 10)) + matchResult[5];
      } else { // 'Z' (originally '-')
        currentExpression = matchResult[1] + (parseInt(matchResult[2], 10) - parseInt(matchResult[4], 10)) + matchResult[5];
      }
    }
    return currentExpression;
  };

  // Event listener for incoming data chunks from standard input.
  inputSource.on('data', function(receivedData) {
    let lineSegment, processedLines;
    // Split the received data by newline characters.
    processedLines = (function() {
      let idx, totalLen, sourceLines, collectedSegments;
      sourceLines = receivedData.split("\n");
      collectedSegments = [];
      for (idx = 0, totalLen = sourceLines.length; idx < totalLen; idx++) {
        lineSegment = sourceLines[idx];
        collectedSegments.push(lineSegment);
      }
      return collectedSegments;
    })();

    // Determine how to store the processed lines.
    // If there are more than 2 lines or the second line is a number,
    // replace the entire data store. Otherwise, append the first line.
    if (processedLines.length > 2 || !Number.isNaN(parseInt(processedLines[1], 10))) {
      return dataStore = processedLines;
    } else {
      return dataStore.push(processedLines[0]);
    }
  });

  // Event listener for the end of standard input stream.
  inputSource.on('end', function(endEventArg) {
    let loopCounter, numExpressions, rawExpression;
    let outputResults = []; // Mimicking CoffeeScript's _results array.

    // Parse the number of expressions from the first line of stored data.
    numExpressions = parseInt(dataStore[0], 10);

    // Iterate through the stored expressions, starting from the second line.
    for (loopCounter = 1; loopCounter <= numExpressions; loopCounter++) {
      // Extract the expression part before '=' and replace all '-' with 'Z'.
      rawExpression = dataStore[loopCounter].substring(0, dataStore[loopCounter].indexOf(String.fromCharCode(61))).replace(/-/g, String.fromCharCode(90)); // '=' and 'Z'
      // Evaluate the expression and log the result to console.
      outputResults.push(console.log(evaluateExpression(rawExpression)));
    }
    return outputResults; // Return the array of undefineds from console.log calls.
  });

}).call(this); // Invoke the immediately-invoked function expression.
