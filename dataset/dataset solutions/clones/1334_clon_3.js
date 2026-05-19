let inputDataBuffer = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  inputDataBuffer += chunk;
});

process.stdin.on('end', () => {
  const trimmedInput = inputDataBuffer.trim();
  const inputLines = trimmedInput.split('\n');

  const [initialStringValue, /* totalOperationsCount - unused */, ...rawOperationLines] = inputLines;

  let mutableString = initialStringValue;

  const parseOperationLine = (lineContent) => {
    const [operationKeyword, ...rawArguments] = lineContent.split(' ');

    if (operationKeyword === 'print' || operationKeyword === 'reverse') {
      const numericArgs = rawArguments.map((numStr) => parseInt(numStr, 10));
      return { operationType: operationKeyword, operationParameters: numericArgs };
    } else {
      const [firstArgStr, secondArgStr, replacementString] = rawArguments;
      const numericFirstArg = parseInt(firstArgStr, 10);
      const numericSecondArg = parseInt(secondArgStr, 10);
      return {
        operationType: operationKeyword,
        operationParameters: [numericFirstArg, numericSecondArg, replacementString],
      };
    }
  };

  const processedOperations = rawOperationLines.map(parseOperationLine);

  processedOperations.forEach(({ operationType, operationParameters }) => {
    switch (operationType) {
      case 'print': {
        const startIndex = operationParameters[0];
        const endIndex = operationParameters[1];
        const substringToPrint = mutableString.slice(startIndex, endIndex + 1);
        console.log(substringToPrint);
        break;
      }
      case 'reverse': {
        mutableString = applyReverseTransformation(mutableString, ...operationParameters);
        break;
      }
      case 'replace': {
        mutableString = applyReplaceTransformation(mutableString, ...operationParameters);
        break;
      }
    }
  });
});

const applyReverseTransformation = (sourceString, startIdx, endIdx) => {
  const prefixSegment = sourceString.slice(0, startIdx);
  const middleSegmentToReverse = sourceString.slice(startIdx, endIdx + 1);
  const reversedMiddle = middleSegmentToReverse.split('').reverse().join('');
  const suffixSegment = sourceString.slice(endIdx + 1);

  return prefixSegment + reversedMiddle + suffixSegment;
};

const applyReplaceTransformation = (sourceString, startIdx, endIdx, newContent) => {
  const prefixSegment = sourceString.slice(0, startIdx);
  const suffixSegment = sourceString.slice(endIdx + 1);

  return prefixSegment + newContent + suffixSegment;
};
