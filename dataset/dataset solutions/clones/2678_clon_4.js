function computeOddDigitCount(originalInput) {
  let numericalValue = Number(originalInput);
  let finalTally = 0;
  let maximumExtent = numericalValue - 1;

  if (maximumExtent <= 0) {
    console.log(0);
    return;
  }

  let currentMagnitude = 1;
  let currentCeiling = 9;
  let digitPlace = 1;

  while (currentMagnitude <= maximumExtent) {
    if (digitPlace % 2 === 1) {
      let upperLimitForThisRange = Math.min(currentCeiling, maximumExtent);
      finalTally += (upperLimitForThisRange - currentMagnitude + 1);
    }

    if (currentCeiling >= maximumExtent) {
        break;
    }

    currentMagnitude *= 10;
    currentCeiling = currentCeiling * 10 + 9;
    digitPlace++;
  }
  console.log(finalTally);
}
computeOddDigitCount(require("fs").readFileSync("/dev/stdin", "utf8"));