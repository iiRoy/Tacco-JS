accumulatedValue = totalQuantitySum = processedEntryCount = 0,
  require("node:fs")
    .readFileSync(
      "/dev/stdin",
      "utf8"
    )
    .trim()
    .split('\n')
    .map(
      (currentLineString) => {
        let lineDataComponents = currentLineString.split(',');
        accumulatedValue += lineDataComponents[0] * lineDataComponents[1];
        totalQuantitySum += +lineDataComponents[1];
        processedEntryCount++;
      }
    ),
  console.info(
    accumulatedValue +
      '\n' +
      Math.round(totalQuantitySum / processedEntryCount)
  );