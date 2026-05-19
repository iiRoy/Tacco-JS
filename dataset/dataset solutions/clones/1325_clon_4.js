let inputBuffer = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  inputBuffer += chunk;
});

process.stdin.on('end', () => {
  const allInputSegments = inputBuffer.trim().split('\n');

  if (allInputSegments.length === 0 || (allInputSegments.length === 1 && allInputSegments[0] === '')) {
    console.log('');
    return;
  }

  const firstSequence = allInputSegments[0];
  const dataSegments = allInputSegments.slice(1);

  const finalOutputs = processInputData(dataSegments, firstSequence, []);

  console.log(finalOutputs.join('\n'));
});

const rotateString = (inputStr, shiftAmount) => {
  if (inputStr.length === 0) {
    return '';
  }
  const effectiveShift = shiftAmount % inputStr.length;
  if (effectiveShift === 0) {
    return inputStr;
  }
  const partToMove = inputStr.substring(0, effectiveShift);
  const remainingPart = inputStr.substring(effectiveShift);
  return remainingPart + partToMove;
};

const processInputData = (remainingTokens, activeString, collectedStrings) => {
  if (remainingTokens.length === 0) {
    return collectedStrings;
  }

  const [currentToken, ...subsequentTokens] = remainingTokens;
  const parsedNumericValue = parseInt(currentToken, 10);

  if (!Number.isNaN(parsedNumericValue)) {
    const transformedString = rotateString(activeString, parsedNumericValue);
    return processInputData(subsequentTokens, transformedString, collectedStrings);
  } else {
    const updatedCollection = [...collectedStrings, activeString];
    const nextActiveString = currentToken;
    const tokensAfterBypass = subsequentTokens.slice(1);
    return processInputData(tokensAfterBypass, nextActiveString, updatedCollection);
  }
};
