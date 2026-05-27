process.stdin.resume();
process.stdin.setEncoding("utf8");

const inputHandler = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const inputLines = [];

inputHandler.on("line", (currentLine) => {
  inputLines.push(currentLine);
});

inputHandler.on("close", () => {
  const terrainMap = inputLines[0];

  const leftSlopeIndices = [];
  const waterBodies = [];
  const mapLength = terrainMap.length;

  const LEFT_SLOPE_CHAR = "\\";
  const RIGHT_SLOPE_CHAR = "/";

  for (let currentIndex = 0; currentIndex < mapLength; currentIndex++) {
    const currentSymbol = terrainMap[currentIndex];

    if (currentSymbol === LEFT_SLOPE_CHAR) {
      leftSlopeIndices.push(currentIndex);
    } else if (currentSymbol === RIGHT_SLOPE_CHAR) {
      const lastLeftSlopeIndex = leftSlopeIndices.pop();

      if (lastLeftSlopeIndex !== undefined) {
        let currentArea = currentIndex - lastLeftSlopeIndex;
        let accumulatedPond = waterBodies.pop();

        let tempPondToProcess = accumulatedPond;

        while (tempPondToProcess) {
          if (tempPondToProcess.first > lastLeftSlopeIndex) {
            currentArea += tempPondToProcess.area;
            tempPondToProcess = waterBodies.pop();
          } else {
            waterBodies.push(tempPondToProcess);
            break;
          }
        }
        const newWaterBody = { area: currentArea, first: lastLeftSlopeIndex };
        waterBodies.push(newWaterBody);
      }
    }
  }

  const totalPondArea = waterBodies.reduce((totalAreaAccumulator, pondElement) => totalAreaAccumulator + pondElement.area, 0);
  console.log(totalPondArea);

  const outputParts = [];
  outputParts.push(waterBodies.length.toString());

  if (waterBodies.length > 0) {
    const individualAreas = waterBodies.map((pondElement) => pondElement.area);
    outputParts.push(individualAreas.join(" "));
  }
  const outputMessage = outputParts.join(" ");
  console.log(outputMessage);
});
