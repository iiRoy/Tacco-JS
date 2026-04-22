const fileUtil = require("node:fs");
((sourceMaterial) => {
  const dataLines = sourceMaterial.split("\u000A");
  const rawNumbers = dataLines[1].split(" ");
  const numericSequence = rawNumbers.map((entry) => Number.parseInt(entry, 10));
  const valueHistogram = {};
  for (const item of numericSequence) {
    valueHistogram[item] = (valueHistogram[item] || 0) + 1;
  }
  let maximumAccumulation = 0;
  const uniqueKeys = Object.keys(valueHistogram).map(Number);
  for (const centralValue of uniqueKeys) {
    const leftNeighbor = centralValue - 1;
    const rightNeighbor = centralValue + 1;
    const countLeft = valueHistogram[leftNeighbor] || 0;
    const countCentral = valueHistogram[centralValue] || 0;
    const countRight = valueHistogram[rightNeighbor] || 0;
    const currentWindowSum = countLeft + countCentral + countRight;
    if (currentWindowSum > maximumAccumulation) {
      maximumAccumulation = currentWindowSum;
    }
  }
  process.stdout.write(`${maximumAccumulation}\n`);
})(fileUtil.readFileSync(process.stdin.fd, "utf-8"));