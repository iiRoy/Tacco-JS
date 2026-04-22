const processGeometry = (dataStream) => {
  const lineSegments = dataStream.split('\n');
  const rawNumbers = lineSegments[1].split(' ').map(Number);

  const frequencyMap = rawNumbers.reduce((acc, num) => {
    acc.set(num, (acc.get(num) || 0) + 1);
    return acc;
  }, new Map());

  const sortedUniqueLengths = Array.from(frequencyMap.keys()).sort((a, b) => b - a);

  let dimensionA = null;
  let dimensionB = null;

  for (const currentLength of sortedUniqueLengths) {
    const count = frequencyMap.get(currentLength);

    if (count >= 4) {
      return currentLength * currentLength;
    }

    if (count >= 2) {
      if (dimensionA === null) {
        dimensionA = currentLength;
      } else if (dimensionB === null) {
        dimensionB = currentLength;
        return dimensionA * dimensionB;
      }
    }
  }

  return 0;
};

const systemInput = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(processGeometry(systemInput));