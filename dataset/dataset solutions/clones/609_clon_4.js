const inputHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let receivedSegments = [];
let segmentIndex = 0;
let totalPatternContainers;
let searchString;

inputHandler.on('line', (currentSegment) => {
  receivedSegments.push(currentSegment);

  if (segmentIndex === 0) {
    totalPatternContainers = parseInt(currentSegment, 10);
  } else if (segmentIndex === 1) {
    searchString = currentSegment;
  }

  if (segmentIndex === totalPatternContainers + 1) {
    inputHandler.close();
  }
  segmentIndex++;
});

inputHandler.on('close', () => {
  const allContainers = receivedSegments.slice(2);

  const matchCounter = allContainers.filter(containerContent => {
    const patternElements = [...searchString];
    const containerSize = containerContent.length;
    const patternSize = patternElements.length;

    if (patternSize === 0) return true;

    const potentialSteps = Array.from({ length: containerSize }, (_, sIdx) => sIdx + 1);

    return potentialSteps.some(currentStepValue => {
      return patternElements.every((pElement, pElementIndex) => {
        const targetIndex = pElementIndex * currentStepValue;
        if (targetIndex >= containerSize) return false;
        return containerContent[targetIndex] === pElement;
      });
    });
  }).length;

  console.log(matchCounter);
});