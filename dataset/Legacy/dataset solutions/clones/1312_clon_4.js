let inputChunks = [];
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', segment => {
  inputChunks.push(segment);
});

process.stdin.on('end', () => {
  const fullText = inputChunks.join('');
  const trimmedText = fullText.trim();

  const initialSegments = trimmedText.split('\n');
  
  const processedSegments = [];
  let segmentIndex = 0;
  while (segmentIndex < initialSegments.length - 1) {
    processedSegments.push(initialSegments[segmentIndex]);
    segmentIndex++;
  }

  const calculatedResults = [];
  
  for (const numericString of processedSegments) {
    let digitAccumulator = 0;
    let charPosition = 0;
    while (charPosition < numericString.length) {
      digitAccumulator += Number(numericString[charPosition]);
      charPosition++;
    }
    calculatedResults.push(digitAccumulator);
  }

  console.log(calculatedResults.join('\n'));
});
