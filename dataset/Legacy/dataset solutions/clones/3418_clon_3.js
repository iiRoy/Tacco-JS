function processInput(rawData) {
  const MAX_LEVEL = 50;

  const inputLines = rawData.split("\n");
  const [nStr, xStr] = inputLines[0].split(" ");
  const levelCount = parseInt(nStr);
  let targetPosition = parseInt(xStr);

  const pattyCounts = new Array(MAX_LEVEL + 1);
  const totalLayerCounts = new Array(MAX_LEVEL + 1);

  pattyCounts[0] = 1;
  totalLayerCounts[0] = 1;

  for (let currentLevelIndex = 1; currentLevelIndex <= MAX_LEVEL; currentLevelIndex++) {
    pattyCounts[currentLevelIndex] = pattyCounts[currentLevelIndex - 1] * 2 + 1;
    totalLayerCounts[currentLevelIndex] = totalLayerCounts[currentLevelIndex - 1] * 2 + 3;
  }

  let resultPatties = 0;
  let currentBurgerLevel = levelCount;

  while (currentBurgerLevel >= 0 && targetPosition > 0) {
    if (currentBurgerLevel === 0) {
      resultPatties += 1;
      break;
    }

    const layersInPreviousLevelBurger = totalLayerCounts[currentBurgerLevel - 1];
    const pattiesInPreviousLevelBurger = pattyCounts[currentBurgerLevel - 1];

    const leftSegmentLength = 1 + layersInPreviousLevelBurger;

    if (targetPosition > leftSegmentLength) {
      resultPatties += (pattiesInPreviousLevelBurger + 1);
      targetPosition -= (leftSegmentLength + 1);
      currentBurgerLevel--;
    } else {
      targetPosition -= 1;
      currentBurgerLevel--;
    }
  }

  console.log('%s', resultPatties);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
