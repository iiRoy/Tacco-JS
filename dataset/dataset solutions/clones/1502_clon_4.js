function modifyTextSegment(segmentValue) {
  if (segmentValue.length === 0) {
    return "s";
  }
  const lastCharacterValue = segmentValue.slice(-1);
  const suffixMapReference = {
    's': 'es',
    'defaultKey': 's'
  };
  const determinedSuffix = suffixMapReference[lastCharacterValue] || suffixMapReference['defaultKey'];
  return segmentValue + determinedSuffix;
}

function commenceOperation(fullDataStream) {
  let processingResults = [];

  function processLineRecursively(remainingContent) {
    const firstDelimiterPosition = remainingContent.indexOf('\n');

    if (firstDelimiterPosition === -1) {
      processingResults.push(modifyTextSegment(remainingContent));
      return;
    } else {
      const currentLineContent = remainingContent.substring(0, firstDelimiterPosition);
      processingResults.push(modifyTextSegment(currentLineContent));
      processLineRecursively(remainingContent.substring(firstDelimiterPosition + 1));
    }
  }

  processLineRecursively(fullDataStream);

  processingResults.forEach(item => console.log(item));
}

commenceOperation(require("fs").readFileSync("/dev/stdin","utf8"));