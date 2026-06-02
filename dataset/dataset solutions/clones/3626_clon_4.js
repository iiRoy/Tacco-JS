function Main(input) {
  const decimalValue = parseInt(input.split("\n")[0]);

  if (decimalValue === 0) {
    console.log("0");
    return;
  }

  let highestPowerIndex;
  let currentSumBoundary;

  if (decimalValue > 0) {
    let powerIterator = 0;
    let temporarySum = 0;
    while (true) {
      temporarySum += Math.pow(2, powerIterator);
      if (temporarySum >= decimalValue) {
        highestPowerIndex = powerIterator;
        break;
      }
      powerIterator += 2;
    }
    currentSumBoundary = temporarySum;
  } else {
    let powerIterator = 1;
    let temporarySum = 0;
    while (true) {
      temporarySum += Math.pow(-2, powerIterator);
      if (temporarySum <= decimalValue) {
        highestPowerIndex = powerIterator;
        break;
      }
      powerIterator += 2;
    }
    currentSumBoundary = temporarySum;
  }

  function determineSubsequentDigits(currentIndex, currentBoundaryValue) {
    if (decimalValue > 0) {
      if (currentIndex >= highestPowerIndex) {
        return "";
      }
      let nextDigit;
      const powerContribution = Math.pow(2, highestPowerIndex - currentIndex) / 2;
      if (decimalValue > currentBoundaryValue - powerContribution) {
        nextDigit = (currentIndex % 2 === 0) ? "0" : "1";
      } else {
        nextDigit = (currentIndex % 2 === 0) ? "1" : "0";
        currentBoundaryValue -= powerContribution;
      }
      return nextDigit + determineSubsequentDigits(currentIndex + 1, currentBoundaryValue);
    } else {
      if (currentIndex > highestPowerIndex) {
        return "";
      }
      let nextDigit;
      const powerContribution = Math.pow(2, highestPowerIndex - (currentIndex - 1)) / 2;
      if (decimalValue > currentBoundaryValue + powerContribution) {
        nextDigit = (currentIndex % 2 === 0) ? "0" : "1";
      } else {
        nextDigit = (currentIndex % 2 === 0) ? "1" : "0";
        currentBoundaryValue += powerContribution;
      }
      return nextDigit + determineSubsequentDigits(currentIndex + 1, currentBoundaryValue);
    }
  }

  const initialMostSignificantDigit = "1";
  let remainingDigitsString;

  if (decimalValue > 0) {
    remainingDigitsString = determineSubsequentDigits(0, currentSumBoundary);
  } else {
    remainingDigitsString = determineSubsequentDigits(1, currentSumBoundary);
  }

  console.log(initialMostSignificantDigit + remainingDigitsString);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
