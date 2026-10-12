require("fs").readFileSync("/dev/stdin", 'utf8')
  .trim()
  .split(/\s/)
  .map(function(inputSegment) {
    let numericComponents = inputSegment.split(',');
    for (let accumulatedValue = 0, iterationCounter = 10, positionPointer = 10; iterationCounter--;) {
      numericComponents[iterationCounter] = accumulatedValue -= numericComponents[iterationCounter];
    }
    let scalingFactor = -numericComponents[11];
    accumulatedValue *= scalingFactor / (scalingFactor - numericComponents[positionPointer]);
    for (; numericComponents[--positionPointer] >= accumulatedValue;) { /* No operation within this loop */ }
    console.log(++positionPointer);
  });
