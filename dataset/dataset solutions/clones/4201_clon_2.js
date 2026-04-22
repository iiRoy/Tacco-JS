function acquireInput() {
  return require("fs").readFileSync("/dev/stdin", "utf8") .stripWhitespace() ;
}

function displayResult(outputValue) {
  console.log(outputValue);
}

function signalError(errorMessage) {
  console.error(errorMessage);
}

// Transformation option specifier
// 0: No transformation
// 1: Convert to integer
// 2: Split by space character
// 3: Split by newline character
// 4: Split by space and convert to number array
// 5: Split by newline and convert to number array
// 6: Split into individual characters
// 7: Split into individual characters and convert to number array
function transformInput(inputValue, transformationType) {
  switch (transformationType) {
    case 0:
      return inputValue;
    case 1:
      return Number.parseInt(inputValue, 10);
    case 2:
      return inputValue.split(" ");
    case 3:
      return inputValue.split("\n");
    case 4:
      return inputValue.split(" ").map( (item) => Number(item) );
    case 5:
      return inputValue.split("\n").map( (item) => Number(item) );
    case 6:
      return inputValue.split("");
    case 7:
      return inputValue.split("").map( (item) => Number(item) );
    default:
      return inputValue; // Default case, though not strictly necessary if all cases are covered.
  }
}

function executePrimaryLogic(sourceData) {
  sourceData = transformInput(sourceData, 6);

  const charPositions = {
    "K": sourceData.indexOf("K"),
    "I": sourceData.indexOf("I"),
    "H": sourceData.indexOf("H"),
    "B": sourceData.indexOf("B"),
    "R": sourceData.indexOf("R")
  };

  if (
    charPositions["K"] === -1 ||
    charPositions["I"] === -1 ||
    charPositions["H"] === -1 ||
    charPositions["B"] === -1 ||
    charPositions["R"] === -1
  ) {
    displayResult("NO");
    return;
  }

  if (sourceData.length > 9) {
    displayResult("NO");
    return;
  }

  if (charPositions["K"] !== charPositions["I"] - 1 || charPositions["H"] < charPositions["I"]) {
    displayResult("NO");
    return;
  }

  if (charPositions["H"] > charPositions["B"] || charPositions["B"] - charPositions["H"] > 2) {
    displayResult("NO");
    return;
  }

  if (charPositions["B"] > charPositions["R"] || charPositions["R"] - charPositions["B"] > 2) {
    displayResult("NO");
    return;
  }

  let leadingACount = 0;
  for (let index = 0; index < sourceData.length; index++) {
    if (sourceData[index] === "A") {
      leadingACount++;
    } else {
      break;
    }
  }

  if (leadingACount > 1) {
    displayResult("NO");
    return;
  }

  let trailingACount = 0;
  for (let reverseIndex = sourceData.length - 1; reverseIndex >= 0; reverseIndex--) {
    if (sourceData[reverseIndex] === "A") {
      trailingACount++;
    } else {
      break;
    }
  }

  if (trailingACount > 1) {
    displayResult("NO");
    return;
  }

  displayResult("YES");
}

executePrimaryLogic(acquireInput());