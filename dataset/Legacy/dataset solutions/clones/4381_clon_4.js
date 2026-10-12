function processInputData(inputString) {
  const lines = inputString.split("\n");
  const elementCount = parseInt(lines[0], 10);
  const dataPoints = lines[1].split(" ").map(val => parseInt(val, 10));

  const valueFrequencies = new Map();
  let highestValueEncountered = 0;

  for (const point of dataPoints) {
    valueFrequencies.set(point, (valueFrequencies.get(point) || 0) + 1);
    if (point > highestValueEncountered) {
      highestValueEncountered = point;
    }
  }

  let maximumNeighborSum = 0;

  for (let currentNumber = 0; currentNumber <= highestValueEncountered; currentNumber++) {
    const frequencyLeft = valueFrequencies.get(currentNumber - 1) || 0;
    const frequencyCurrent = valueFrequencies.get(currentNumber) || 0;
    const frequencyRight = valueFrequencies.get(currentNumber + 1) || 0;

    const currentNeighborSum = frequencyLeft + frequencyCurrent + frequencyRight;
    
    if (currentNeighborSum > maximumNeighborSum) {
      maximumNeighborSum = currentNeighborSum;
    }
  }

  console.log(maximumNeighborSum);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
