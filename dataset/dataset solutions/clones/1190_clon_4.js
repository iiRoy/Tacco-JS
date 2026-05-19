process.stdin.resume();
process.stdin.setEncoding("utf8");

const inputReader = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const receivedLines = [];

inputReader.on("line", (currentLine) => {
  receivedLines.push(currentLine);
});

inputReader.on("close", () => {
  const initialFaceNames = receivedLines[0].split(" ");

  const initialApexLabel = initialFaceNames[0];
  const initialForeLabel = initialFaceNames[1];
  const initialStarboardLabel = initialFaceNames[2];
  const initialPortLabel = initialFaceNames[3];
  const initialAftLabel = initialFaceNames[4];
  const initialBaseLabel = initialFaceNames[5];

  const ringA = [initialApexLabel, initialForeLabel, initialBaseLabel, initialAftLabel];
  const ringB = [initialApexLabel, initialStarboardLabel, initialBaseLabel, initialPortLabel];
  const ringC = [initialForeLabel, initialStarboardLabel, initialAftLabel, initialPortLabel];

  const ringSelectionMap = new Map([
    [initialApexLabel, ringC],
    [initialBaseLabel, ringC],
    [initialForeLabel, ringB],
    [initialAftLabel, ringB],
    [initialStarboardLabel, ringA],
    [initialPortLabel, ringA],
  ]);

  const clockwiseTriggers = new Set([initialApexLabel, initialStarboardLabel, initialAftLabel]);

  const operationCount = Number(receivedLines[1]);

  receivedLines.slice(2, 2 + operationCount).map(operationEntry => {
    const [targetTopLabel, targetFrontLabel] = operationEntry.split(" ");

    const activeRing = ringSelectionMap.get(targetTopLabel);
    const rotationDirection = clockwiseTriggers.has(targetTopLabel) ? 1 : -1;

    const currentFrontPosition = activeRing.indexOf(targetFrontLabel);

    const nextFrontPosition = (currentFrontPosition + rotationDirection + activeRing.length) % activeRing.length;

    console.log(activeRing[nextFrontPosition]);
  });
});
