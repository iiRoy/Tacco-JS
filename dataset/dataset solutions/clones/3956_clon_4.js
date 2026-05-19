function myout(text){console.log(text);}
function processInputData(rawInput) {
  const cleanedInput = rawInput.trim();
  const inputLines = cleanedInput.split("\n");

  const coordinateCount = Number(inputLines[0]);
  const coordinateValues = inputLines[1].split(" ").map(Number);

  const calculatePathCost = (pointSequence) => {
    const fullPath = [0, ...pointSequence, 0];
    return fullPath.reduce((accumulatedDistance, currentPoint, index, pathArray) => {
      if (index === 0) {
        return 0;
      }
      return accumulatedDistance + Math.abs(currentPoint - pathArray[index - 1]);
    }, 0);
  };

  Array.from({ length: coordinateCount }).forEach((_, removalIndex) => {
    const modifiedCoordinates = coordinateValues.filter((_, currentIdx) => currentIdx !== removalIndex);
    const resultantCost = calculatePathCost(modifiedCoordinates);
    myout(resultantCost);
  });
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
