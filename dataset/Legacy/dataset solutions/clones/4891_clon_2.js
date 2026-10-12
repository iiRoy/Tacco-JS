ProcessInput(readInputData());

function readInputData() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function printOutput(resultValue) {
  console.log(resultValue);
}

function logError(errorMessage) {
  console.error(errorMessage);
}

// This utility function handles various data transformations based on the specified type.
// Conversion Types:
// 1: Convert to integer
// 2: Split by space
// 3: Split by newline
// 4: Split by space and convert to number array
// 5: Split by newline and convert to number array
// 6: Split into individual characters
// 7: Split into individual characters and convert to number array
// 8: Join array elements with space
// 9: Join array elements with newline
// 0: Join array elements without separator
// Default: Return input as is
function transformData(inputItem, conversionType) {
  switch (conversionType) {
    case 1:
      return parseInt(inputItem);
    case 2:
      return inputItem.split(" ");
    case 3:
      return inputItem.split("\n");
    case 4:
      return inputItem.split(" ").map((val) => Number(val));
    case 5:
      return inputItem.split("\n").map((val) => Number(val));
    case 6:
      return inputItem.split("");
    case 7:
      return inputItem.split("").map((val) => Number(val));
    case 8:
      return inputItem.join(" ");
    case 9:
      return inputItem.join("\n");
    case 0:
      return inputItem.join("");
    default:
      return inputItem;
  }
}

function ProcessInput(rawData) {
  rawData = transformData(rawData, 3);

  var numChars = transformData(rawData[0], 1);
  var strA = rawData[1];
  var strB = rawData[2];

  if (strA === strB) {
    printOutput(numChars);
  } else {
    for (var idx = 1; idx <= numChars; idx++) {
      var subStrA = strA.slice(idx);
      var subStrB = strB.slice(0, numChars - idx);
      logError(subStrA + " " + subStrB);

      if (subStrA === subStrB) {
        printOutput(numChars + idx);
        return;
      }
    }
    // Note: The variable 'undefinedVar' is not defined in this scope,
    // preserving the original code's potential ReferenceError.
    printOutput(undefinedVar.length);
  }
}
