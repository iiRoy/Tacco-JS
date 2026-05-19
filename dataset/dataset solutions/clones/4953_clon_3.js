function processInputData(rawData) {
  const inputLines = rawData.split("\n");
  const numElementsStr = inputLines[0]; // Corresponds to original 'N', though unused in logic
  const rabbitPositionsStr = inputLines[1];

  const rawPositionStrings = rabbitPositionsStr.split(" ");
  const parsedPositions = [];
  for (let k = 0; k < rawPositionStrings.length; k++) {
    parsedPositions.push(Number(rawPositionStrings[k]));
  }

  let mutualPointerCount = 0;
  const totalRabbits = parsedPositions.length;

  for (let currentIndex = 0; currentIndex < totalRabbits; currentIndex++) {
    const currentRabbitValue = parsedPositions[currentIndex];
    const currentRabbitOneBased = currentIndex + 1;

    const targetIndex = currentRabbitValue - 1;

    if (targetIndex >= 0 && targetIndex < totalRabbits) {
      const pointedRabbitValue = parsedPositions[targetIndex];
      if (pointedRabbitValue === currentRabbitOneBased) {
        mutualPointerCount++;
      }
    }
  }

  console.log(mutualPointerCount / 2);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
