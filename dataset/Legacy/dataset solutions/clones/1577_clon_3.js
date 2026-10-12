function processInputData(inputString) {
  const inputLines = inputString.split('\n');
  const elementCount = parseInt(inputLines[0], 10);
  const numericValues = inputLines[1].split(' ').map(Number);
  let accumulatedDifference = 0;

  const iterationUpperLimit = elementCount - 1;

  for (let currentIdx = 0; currentIdx < iterationUpperLimit; currentIdx++) {
    const currentElement = numericValues[currentIdx];
    const nextElement = numericValues[currentIdx + 1];

    if (currentElement >= nextElement) {
      const requiredAdjustment = currentElement - nextElement;
      accumulatedDifference += requiredAdjustment;
      numericValues[currentIdx + 1] = currentElement;
    }
  }
  console.log(accumulatedDifference);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
