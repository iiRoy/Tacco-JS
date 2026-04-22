const textInputInterface = require('readline').createInterface({
  input: process.stdin,
  terminal: false
});

const wordTransformations = new Map([
  ['apple', 'peach'],
  ['peach', 'apple']
]);

const substitutePhrases = (originalSentence) => {
  let reconstructedSegments = [];
  let currentPoint = 0;
  const phraseLength = 5; // Both 'apple' and 'peach' are 5 characters

  while (currentPoint < originalSentence.length) {
    let matchFound = false;
    const potentialMatch = originalSentence.substring(currentPoint, currentPoint + phraseLength);

    if (wordTransformations.has(potentialMatch)) {
      reconstructedSegments.push(wordTransformations.get(potentialMatch));
      currentPoint += phraseLength;
      matchFound = true;
    }

    if (!matchFound) {
      reconstructedSegments.push(originalSentence[currentPoint]);
      currentPoint++;
    }
  }
  return reconstructedSegments.join('');
};

const processAllInput = async () => {
  for await (const segment of textInputInterface) {
    const modifiedSegment = substitutePhrases(segment);
    process.stdout.write(modifiedSegment + '\n');
  }
};

processAllInput();