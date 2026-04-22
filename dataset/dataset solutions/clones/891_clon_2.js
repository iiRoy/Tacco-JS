/*
 * Problem Source: Shipura
 * (Reference: http://judge.u-aizu.ac.jp/onlinejudge/description.jsp?id=2570)
 *
 * Current State:
 *
 * Remarks:
 *
 */
const output = console.log;
if (typeof globalThis.process !== "undefined") {
  let dataBuffer = "";
  globalThis.process.stdin.resume();
  globalThis.process.stdin.setEncoding("utf8");
  globalThis.process.stdin.on('data', function (dataPortion) {
    dataBuffer += dataPortion;
  });
  globalThis.process.stdin.on('end', function () {
    const inputRows = dataBuffer.split("\n");
    executeProgram(inputRows);
  });
}


function executeProgram(inputRows) {
  inputRows.forEach(function (currentRow) {
    if (currentRow !== "#") {
      processInputRow(currentRow);
    }
  });
  output("");
}

function recursiveCalculation(arg1, arg2) {
  const moduloVal = 1000000007;
  if (arg1 > 90000000 && arg2 > 1) {
    const remainder = arg2 % 2;
    const halfVal = Math.floor(arg2 / 2);
    const intermediateResult = recursiveCalculation(arg1, halfVal);
    let currentSum;
    if (remainder) {
      currentSum = (2 * intermediateResult + arg1) % moduloVal;
    } else {
      currentSum = (2 * intermediateResult) % moduloVal;
    }
    return currentSum % moduloVal;
  }
  return (arg1 * arg2) % moduloVal;
}


// Computes S(x), which is x raised to the power of x under specific modular arithmetic.
function computeSquarePower(valueInput) {
  return recursiveCalculation(valueInput, valueInput);
}
// Performs a right bit-shift like division (x >> y in concept).
function shiftRightDivision(dividend, shifter) {
  return Math.floor(dividend / Math.pow(2, shifter));
}

// Cleans up an input string by removing all whitespace and 'S' characters.
function cleanString(sourceString) {
  return sourceString.replace(/\s|S/g, '');
}

// Checks if a given input string represents a valid numeric value.
function isNumericToken(tokenCandidate) {
  const numericValue = Number(tokenCandidate);
  const stringifiedValue = numericValue.toString();
  // Returns true if the conversion did not result in NaN.
  return Boolean(stringifiedValue !== "NaN");
}

// Segments the input string into tokens, distinguishing between numbers and symbols like '<' and '>'.
function parseTokens(sourceExpression) {
  let charArray = sourceExpression.split('');
  const lengthOfRow = charArray.length;
  let startIndex = 0;
  let endIndex = 0;
  let tokenList = [];
  let inNumberSequence = false;

  for (let idx = 0; idx < lengthOfRow; idx++) {
    const element = charArray[idx];
    if (!inNumberSequence && isNumericToken(element)) {
      // If we encounter a number after a non-number, mark the start of a number sequence.
      startIndex = idx;
      inNumberSequence = true;
    } else if (inNumberSequence && !isNumericToken(element)) {
      // If we were in a number sequence and now encounter a non-number, the number sequence has ended.
      endIndex = idx;
      inNumberSequence = false;
      // Extract and push the parsed number.
      const slicedPart = charArray.slice(startIndex, endIndex);
      const joinedString = slicedPart.join('');
      const parsedNumber = Number(joinedString);
      tokenList.push(parsedNumber);
    }
    if (!isNumericToken(element)) {
      // Always push non-numeric elements as individual tokens.
      tokenList.push(element);
    }
  }

  // After the loop, if we were still in a number sequence, process the last number.
  if (inNumberSequence) {
    endIndex = lengthOfRow;
    const slicedPart = charArray.slice(startIndex, endIndex);
    const joinedString = slicedPart.join('');
    const parsedNumber = Number(joinedString);
    tokenList.push(parsedNumber);
  }
  return tokenList;
}

// Determines if a '>' character is a simple closing bracket 'q' or part of a '>>' operator 't'.
function isClosingBracket(index, expressionArray) {
  let isSimpleClose = true;
  if (expressionArray[index + 1] === '>') {
    if (isNumericToken(expressionArray[index + 2]) || expressionArray[index + 2] === '<') {
      // It's part of a '>>' operator if followed by a number or '<'.
      isSimpleClose = false;
    }
  }
  return isSimpleClose;
}

// Converts parsed tokens into a simplified token stream, mapping '<' to 'p', '>' to 'q', and '>>' to 't'.
// Example output: [p, p, p, 10, q, t, 10, q, t, 10, q]
function tokenizeInput(tokenizedExpression) {
  // closeBracketStart and closeBracketEnd are unused in the original, so keep them for structural similarity.
  let closeBracketStart = 0;
  let closeBracketEnd = 0;

  // The resulting stream of processed tokens.
  let processedStream = [];

  const streamLength = tokenizedExpression.length;
  for (let currentIdx = 0; currentIdx < streamLength; currentIdx++) {
    const currentToken = tokenizedExpression[currentIdx];
    if (isNumericToken(currentToken)) {
      processedStream.push(currentToken);
    } else if (currentToken === '<') {
      processedStream.push('p');
    } else if (currentToken === '>') {
      // Check if it's a simple closing bracket or a shift operator.
      if (isClosingBracket(currentIdx, tokenizedExpression)) {
        // It's a 'q' token.
        processedStream.push('q');
      } else {
        processedStream.push('t');
        currentIdx += 1; // Advance past the second '>' of the '>>' operator.
      }
    }
  }

  return processedStream;
}

// Constructs an expression tree by reducing tokens based on operator precedence.
function buildExpressionTree(expressionTokens) {
  const tokenCount = expressionTokens.length; // Unused, but structurally similar
  let currentPos = 0;

  while (expressionTokens.length > 1) {
    const currentElement = expressionTokens[currentPos];

    if (isNumericToken(currentElement)) {
      if (currentPos > 0 && expressionTokens[currentPos - 1] === 't') {
        expressionTokens[currentPos - 2] = shiftRightDivision(expressionTokens[currentPos - 2], expressionTokens[currentPos]);
        expressionTokens.splice(currentPos - 1, 2);
        currentPos = currentPos - 3;
      }
    } else if (currentElement === 'p') {
      // 'p' tokens are placeholders and don't trigger immediate reduction here.
    } else if (currentElement === 'q') {
      expressionTokens[currentPos - 2] = computeSquarePower(expressionTokens[currentPos - 1]);
      expressionTokens.splice(currentPos - 1, 2);
      currentPos = currentPos - 3;
    } else if (currentElement === 't') {
      // 't' tokens are handled when a number follows them.
    }
    currentPos++;
    // output(expressionTokens);
  }
  return expressionTokens;
}

function processInputRow(rawRow) {
  let processedRow = cleanString(rawRow);
  if (!processedRow) {
    output("");
    return;
  }

  processedRow = parseTokens(processedRow);
  if (!processedRow) {
    output("");
    return;
  }

  processedRow = tokenizeInput(processedRow);
  if (!processedRow) {
    output("");
    return;
  }

  processedRow = buildExpressionTree(processedRow);
  if (!processedRow) {
    output("");
    return;
  }

  processedRow = processedRow[0];
  output(processedRow);
}