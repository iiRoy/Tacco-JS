const flipColor = (originalColor) => originalColor === "B" ? "W" : "B";

const retrievePatternColor = (baseColor, unitSize, coordI, coordJ) => {
  const iModuloTwoUnit = coordI % (2 * unitSize);
  const jModuloTwoUnit = coordJ % (2 * unitSize);

  const rowSegment = Math.floor(iModuloTwoUnit / unitSize);
  const colSegment = Math.floor(jModuloTwoUnit / unitSize);

  const patternGrid = [
    [baseColor, flipColor(baseColor)],
    [baseColor, baseColor]
  ];

  return patternGrid[rowSegment][colSegment];
};

const normalizeInputPoint = (initialX, initialY, initialColor, unitSize) => {
  const xBlockIndex = Math.floor(initialX / unitSize);
  const yBlockIndex = Math.floor(initialY / unitSize);

  const blockParityMismatch = (xBlockIndex % 2) !== (yBlockIndex % 2);
  const effectiveColor = blockParityMismatch ? flipColor(initialColor) : initialColor;

  let finalX = initialX % unitSize;
  const finalY = initialY % unitSize;

  if (effectiveColor === "W") {
    finalX += unitSize;
  }

  return [finalX, finalY];
};

const processInputData = (rawInput) => {
  const lines = rawInput.split("\n");
  const [totalPointsStr, currentUnitSizeStr] = lines[0].split(" ");
  const totalPoints = parseInt(totalPointsStr, 10);
  const currentUnitSize = parseInt(currentUnitSizeStr, 10);

  const processedPoints = lines.slice(1, totalPoints + 1).map(line => {
    const [xStr, yStr, cChar] = line.split(" ");
    return normalizeInputPoint(parseInt(xStr, 10), parseInt(yStr, 10), cChar, currentUnitSize);
  });

  const offsetCoordinates = Array.from({ length: 2 * currentUnitSize }, (_, ox) =>
    Array.from({ length: 2 * currentUnitSize }, (_, oy) => [ox, oy])
  ).flat();

  const maximumMatches = offsetCoordinates.reduce((currentMax, [offsetX, offsetY]) => {
    if (currentMax === totalPoints) {
      return currentMax;
    }

    const matchedCountForOffset = processedPoints.filter(([pointX, pointY]) =>
      retrievePatternColor("B", currentUnitSize, offsetX + pointX, offsetY + pointY) === "B"
    ).length;

    return Math.max(currentMax, matchedCountForOffset);
  }, 0);

  console.log(maximumMatches.toString());
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
