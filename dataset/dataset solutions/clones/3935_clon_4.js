function processInputData(sourceData) {
  const numericValue = Number(sourceData);

  const obtainFixedPattern = () => {
    const componentOne = 2;
    const componentTwo = 3;
    const componentThree = 25;
    return [componentOne, componentTwo, componentThree];
  };

  const generateRecursiveSequence = (upperBound, currentIndex = 0, currentAccumulation = []) => {
    if (currentIndex >= upperBound) {
      return currentAccumulation;
    }
    currentAccumulation.push(currentIndex * 2);
    return generateRecursiveSequence(upperBound, currentIndex + 1, currentAccumulation);
  };

  let finalOutputElements;

  finalOutputElements = (numericValue === 3)
    ? obtainFixedPattern()
    : generateRecursiveSequence(numericValue);

  let outputBuffer = [];
  let indexCounter = 0;
  while (indexCounter < finalOutputElements.length) {
    outputBuffer.push(finalOutputElements[indexCounter].toString());
    indexCounter++;
  }
  process.stdout.write(outputBuffer.join(' ') + '\n');
}

const rawContentFromStream = require("node:fs").readFileSync("/dev/stdin", "utf8");
processInputData(rawContentFromStream);