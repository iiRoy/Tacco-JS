function ProcessInputData(rawData) {
  const processedLines = rawData.trim().split('\n');
  const initialCount = Number(processedLines[0]);
  const numericElements = processedLines[1].split(' ').map(Number);

  const searchLimit = 100;

  const existingValues = new Set(numericElements);

  const optimalCost = Array.from({ length: searchLimit }, (_, idx) => idx + 1)
    .reduce((currentMinimum, targetPoint) => {
      if (!existingValues.has(targetPoint)) {
        const calculatedSum = numericElements.reduce((accumulator, elementValue) => {
          const difference = elementValue - targetPoint;
          return accumulator + difference * difference;
        }, 0);
        return Math.min(currentMinimum, calculatedSum);
      }
      return currentMinimum;
    }, Infinity);

  console.log(optimalCost);
}

ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
