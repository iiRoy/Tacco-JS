function solveAmidaPuzzle(rawData) {
  const parsedValues = rawData.split(" ").map(valStr => parseInt(valStr, 10));
  const height = parsedValues[0];
  const width = parsedValues[1];
  const targetColumn = parsedValues[2];

  const moduloValue = 1000000007;

  if (width === 1) {
    return 1;
  }

  const numPossibleBinaryStrings = Math.pow(2, width - 1);
  const intermediateBinaryStrings = [];
  for (let idx = 0; idx < numPossibleBinaryStrings; idx++) {
    let currentBinaryString = idx.toString(2);
    while (currentBinaryString.length < width - 1) {
      currentBinaryString = '0' + currentBinaryString;
    }
    intermediateBinaryStrings.push(currentBinaryString);
  }

  const permissibleLadderConfigs = [];
  for (const configStr of intermediateBinaryStrings) {
    if (!configStr.includes("11")) {
      permissibleLadderConfigs.push("0" + configStr + "0");
    }
  }

  const pathCounts = Array.from({ length: height + 1 }, () => Array(width).fill(0));

  pathCounts[0][0] = 1;

  for (let rowIdx = 1; rowIdx <= height; rowIdx++) {
    for (const currentConfig of permissibleLadderConfigs) {
      for (let colIdx = 0; colIdx < width; colIdx++) {
        const segmentKey = currentConfig[colIdx] + currentConfig[colIdx + 1];
        let sourceColumn = colIdx;

        if (segmentKey === "10") {
          sourceColumn = colIdx - 1;
        } else if (segmentKey === "01") {
          sourceColumn = colIdx + 1;
        }

        pathCounts[rowIdx][colIdx] = (pathCounts[rowIdx][colIdx] + pathCounts[rowIdx - 1][sourceColumn]) % moduloValue;
      }
    }
  }

  return pathCounts[height][targetColumn - 1];
}

if (typeof require !== 'undefined') {
  console.log(solveAmidaPuzzle(require("fs").readFileSync("/dev/stdin", "utf8")));
}
