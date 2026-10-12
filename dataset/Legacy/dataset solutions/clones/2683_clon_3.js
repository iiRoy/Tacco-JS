function processInputData(rawInputLines) {
  const totalCount = parseInt(rawInputLines[0], 10);
  const rawHeightStrings = rawInputLines.slice(1);
  const heightValues = rawHeightStrings.map(heightString => parseInt(heightString, 10));

  let currentMaxHeight = heightValues[0];

  const calculateAdjustedHeight = (previousHeight, targetHeight) => {
    if (previousHeight === targetHeight) {
      return targetHeight;
    } else if (previousHeight <= targetHeight - 1) {
      return targetHeight - 1;
    } else {
      return null; // Sentinel value indicating an impossible adjustment
    }
  };

  for (let index = 1; index < totalCount; index++) {
    const nextTargetHeight = heightValues[index];
    const newPotentialHeight = calculateAdjustedHeight(currentMaxHeight, nextTargetHeight);

    if (newPotentialHeight === null) {
      return console.log('No');
    }
    currentMaxHeight = newPotentialHeight;
  }
  console.log('Yes');
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));
