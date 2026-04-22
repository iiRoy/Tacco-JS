const obtainTextContent = () => {
  return require("node:fs").readFileSync("/dev/stdin", "utf8");
};

const processInputData = (incomingText) => {
  const normalizedText = incomingText.replace(/^\s+|\s+$/g, ''); // Equivalent to .trim()
  const numericalSegments = [];
  let currentSegmentAccumulator = '';

  if (normalizedText.length === 0) {
    numericalSegments.push(''); // Mimic "".split(' ') behavior
  } else {
    for (let charIndex = 0; charIndex < normalizedText.length; charIndex++) {
      const currentCharacter = normalizedText[charIndex];
      if (currentCharacter === ' ') {
        numericalSegments.push(currentSegmentAccumulator);
        currentSegmentAccumulator = '';
      } else {
        currentSegmentAccumulator += currentCharacter;
      }
    }
    numericalSegments.push(currentSegmentAccumulator); // Push the final segment
  }

  const zeroOccurrences = numericalSegments.reduce((accumulatorArray, segmentValue, position) => {
    if (Number(segmentValue) === 0) { // Number() handles "" -> 0, consistent with original
      accumulatorArray.push(position + 1);
    }
    return accumulatorArray;
  }, []);

  return zeroOccurrences.join('\n');
};

const displayResult = (processedContent) => {
  console.log(processedContent);
};

displayResult(processInputData(obtainTextContent()));