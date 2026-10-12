function findCommonDivisor(x, y) {
  return y === 0 ? x : findCommonDivisor(y, x % y);
}

function solveProblem(inputData) {
  const [firstLine, sourceStringA, sourceStringB] = inputData.split('\n');
  const [lengthA, lengthB] = firstLine.split(' ').map(Number);

  const commonDivisor = findCommonDivisor(lengthA, lengthB);
  const leastCommonMultiple = (lengthA * lengthB) / commonDivisor;

  const strideA = lengthA / commonDivisor;
  const strideB = lengthB / commonDivisor;

  const allMatch = Array.from({ length: commonDivisor }, (_, index) => index).every(idx => {
    return sourceStringA[idx * strideA] === sourceStringB[idx * strideB];
  });

  return allMatch ? leastCommonMultiple : -1;
}

console.log(solveProblem(require("fs").readFileSync("/dev/stdin", "utf8")));
