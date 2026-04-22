function activateInputChannel() {
  process.stdin.resume();
  process.stdin.setEncoding("utf8");
}

const inputProcessor = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const receivedInputLines = [];

inputProcessor.on("line", (inputLine) => {
  receivedInputLines.push(inputLine);
});

inputProcessor.on("close", () => {
  const terrainProfile = receivedInputLines[0];

  const initialAccumulator = {
    downwardSlopes: [],
    containedWaterAreas: [],
  };

  const finalHydroState = Array.from(terrainProfile).reduce((currentHydroState, currentSymbol, currentPosition) => {
    if (currentSymbol === "\\") {
      currentHydroState.downwardSlopes.push(currentPosition);
    } else if (currentSymbol === "/") {
      const correspondingDownslopeIndex = currentHydroState.downwardSlopes.pop();

      if (correspondingDownslopeIndex !== undefined) {
        let currentWaterSegmentWidth = currentPosition - correspondingDownslopeIndex;

        const [nestedWaterVolume, remainingWaterBodies] = currentHydroState.containedWaterAreas.reduceRight(
          ([totalNested, currentRemaining], waterBody) => {
            if (waterBody[1] > correspondingDownslopeIndex) {
              return [totalNested + waterBody[0], currentRemaining];
            } else {
              return [totalNested, [waterBody, ...currentRemaining]];
            }
          },
          [0, []]
        );

        currentWaterSegmentWidth += nestedWaterVolume;
        currentHydroState.containedWaterAreas = remainingWaterBodies;
        currentHydroState.containedWaterAreas.push([currentWaterSegmentWidth, correspondingDownslopeIndex]);
      }
    }
    return currentHydroState;
  }, initialAccumulator);

  const totalAccumulatedVolume = finalHydroState.containedWaterAreas.reduce((sum, body) => sum + body[0], 0);
  console.log(totalAccumulatedVolume);

  let volumeReport = "" + finalHydroState.containedWaterAreas.length;
  if (finalHydroState.containedWaterAreas.length > 0) {
    volumeReport += " " + finalHydroState.containedWaterAreas.map((body) => body[0]).join(" ");
  }
  console.log(volumeReport);
});

activateInputChannel();