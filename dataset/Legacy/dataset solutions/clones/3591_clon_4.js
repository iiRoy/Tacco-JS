function Main(input) {
  const processInputData = (rawInputString) => {
    const lines = rawInputString.trim().split('\n');
    const [firstLine, secondLine] = lines;

    let [currentN, currentK] = firstLine.split(' ').map(Number);
    const initialXValues = secondLine.split(' ').map(Number);

    let originalNegativeCount = 0;
    initialXValues.forEach(val => {
      if (val < 0) {
        originalNegativeCount++;
      }
    });

    let processedXArray = [...initialXValues];

    const zeroElementIndex = processedXArray.indexOf(0);
    if (zeroElementIndex !== -1) {
      currentN--;
      currentK--;
      processedXArray.splice(zeroElementIndex, 1);
    }

    return {
      effectiveN: currentN,
      effectiveK: currentK,
      modifiedX: processedXArray,
      initialNegativeCount: originalNegativeCount
    };
  };

  const { effectiveN, effectiveK, modifiedX, initialNegativeCount } = processInputData(input);

  let finalResult = Math.pow(10, 9) + 7;

  if (modifiedX.length === 0) {
    finalResult = 0;
  } else if (effectiveN === 2) {
    finalResult = Math.min(Math.abs(modifiedX[0]), modifiedX[1]);
  } else {
    const iterationCount = Math.max(0, effectiveN - effectiveK + 1);
    const indicesToIterate = Array.from({ length: iterationCount }, (_, idx) => idx);

    finalResult = indicesToIterate.reduce((currentMin, i) => {
      const leftBoundaryValue = modifiedX[i];
      const rightBoundaryIndex = i + effectiveK - 1;
      const rightBoundaryValue = modifiedX[rightBoundaryIndex];

      let windowCost = Math.pow(10, 9) + 7;

      if (leftBoundaryValue < 0 && rightBoundaryValue > 0) {
        windowCost = Math.min(
          Math.abs(leftBoundaryValue) * 2 + rightBoundaryValue,
          Math.abs(leftBoundaryValue) + rightBoundaryValue * 2
        );
      } else if (i === initialNegativeCount - effectiveK) {
        windowCost = Math.abs(leftBoundaryValue);
      } else if (i === initialNegativeCount) {
        windowCost = rightBoundaryValue;
      }

      return Math.min(currentMin, windowCost);
    }, finalResult);
  }

  console.log(finalResult);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
