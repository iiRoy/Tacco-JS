process.stdin.on('data', function(inputBuffer) {
  const sourceText = inputBuffer.toString();

  const delimiterPositions = [-1];
  for (let charIndex = 0; charIndex < sourceText.length; charIndex++) {
    if (sourceText[charIndex] === ' ') {
      delimiterPositions.push(charIndex);
    }
  }
  delimiterPositions.push(sourceText.length);

  const parsedSegments = [];
  for (let i = 0; i < delimiterPositions.length - 1; i++) {
    const segmentStart = delimiterPositions[i] + 1;
    const segmentEnd = delimiterPositions[i + 1];
    parsedSegments.push(sourceText.substring(segmentStart, segmentEnd));
  }

  const segmentCount = parsedSegments.length;
  for (let i = 1; i < segmentCount; i++) {
    let currentSegment = parsedSegments[i];
    let currentNumericValue = Number(currentSegment);
    let j = i - 1;
    while (j >= 0 && Number(parsedSegments[j]) > currentNumericValue) {
      parsedSegments[j + 1] = parsedSegments[j];
      j--;
    }
    parsedSegments[j + 1] = currentSegment;
  }

  let finalOutput = '';
  if (segmentCount > 0) {
    finalOutput += parsedSegments[0];
    for (let k = 1; k < segmentCount; k++) {
      finalOutput += ' ' + parsedSegments[k];
    }
  }

  console.log(finalOutput);
});
