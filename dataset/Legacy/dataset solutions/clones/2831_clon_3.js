const getModSum = (valA, valB, valC, modulus) => {
  let intermediateSum = (valA + valB) % modulus;
  if (valC !== undefined) {
    intermediateSum = (intermediateSum + (modulus - valC)) % modulus;
  }
  return intermediateSum;
};

function processInputData(rawDataContent) {
  const inputLines = rawDataContent.split("\n");

  const parseDimensions = (lineContent) => {
    const parts = lineContent.split(" ");
    return {
      lengthOne: parseInt(parts[0], 10),
      lengthTwo: parseInt(parts[1], 10)
    };
  };

  const problemDimensions = parseDimensions(inputLines[0]);
  const firstSequenceLength = problemDimensions.lengthOne;
  const secondSequenceLength = problemDimensions.lengthTwo;

  const sequenceA = inputLines[1].split(" ").map(Number);
  const sequenceB = inputLines[2].split(" ").map(Number);

  const moduloConstant = 1000000007;

  const dpTable = Array.from({ length: firstSequenceLength + 1 }, () =>
    new Array(secondSequenceLength + 1).fill(0)
  );

  for (let currentIdxA = 0; currentIdxA < firstSequenceLength; currentIdxA++) {
    for (let currentIdxB = 0; currentIdxB < secondSequenceLength; currentIdxB++) {
      const valueA = sequenceA[currentIdxA];
      const valueB = sequenceB[currentIdxB];

      const dpValueAbove = dpTable[currentIdxA][currentIdxB + 1];
      const dpValueLeft = dpTable[currentIdxA + 1][currentIdxB];
      const dpValueDiagonal = dpTable[currentIdxA][currentIdxB];

      let calculatedCellResult;

      if (valueA === valueB) {
        calculatedCellResult = getModSum(dpValueAbove, dpValueLeft, undefined, moduloConstant);
        calculatedCellResult = (calculatedCellResult + 1) % moduloConstant;
      } else {
        calculatedCellResult = getModSum(dpValueAbove, dpValueLeft, dpValueDiagonal, moduloConstant);
      }
      dpTable[currentIdxA + 1][currentIdxB + 1] = calculatedCellResult;
    }
  }

  const finalAnswer = dpTable[firstSequenceLength][secondSequenceLength] + 1;

  console.log('%s', finalAnswer);
  return finalAnswer;
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
