function processData(rawInputString) {
  const inputLines = rawInputString.split("\n");

  const firstLineContent = inputLines[0];
  const firstLineSegments = firstLineContent.split(" ");
  const elementCount = parseInt(firstLineSegments[0], 10);

  const secondLineContent = inputLines[1];
  const secondLineSegments = secondLineContent.split(" ");

  const numericValues = new Array(elementCount);
  let maximumDifference = 0;
  let occurrenceCount = 0;
  let minimumValue = 0;

  for (let currentIndex = 0; currentIndex < elementCount; currentIndex++) {
    const currentElement = parseInt(secondLineSegments[currentIndex], 10);
    numericValues[currentIndex] = currentElement;

    const isFirstIteration = currentIndex === 0;
    if (minimumValue > currentElement || isFirstIteration) {
      minimumValue = currentElement;
    }

    const calculatedDifference = currentElement - minimumValue;

    if (maximumDifference === calculatedDifference) {
      occurrenceCount++;
    } else if (maximumDifference < calculatedDifference) {
      occurrenceCount = 1;
      maximumDifference = calculatedDifference;
    }
  }

  console.log('%s', occurrenceCount);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
