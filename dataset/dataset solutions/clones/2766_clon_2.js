function ProcessData(rawData) {

  let linesArray = rawData.split("\n");
  let numStrings = linesArray[0].split(" ");

  let leftBound = Number.parseInt(numStrings[0]);
  let rightBound = Number.parseInt(numStrings[1]);

  let emptyList = []; // This list is not utilized in the current logic.

  let minimumRemainder = leftBound;

  if (leftBound * rightBound > 2019) {
    if (rightBound - leftBound < 2019) {
      for (let firstIndex = leftBound; firstIndex < rightBound; firstIndex++) {
        for (let secondIndex = firstIndex + 1; secondIndex < rightBound + 1; secondIndex++) {
          let currentProductRemainder = (firstIndex * secondIndex) % 2019;
          if (currentProductRemainder === 0) {
            minimumRemainder = currentProductRemainder;
            break;
          } else {
            minimumRemainder = currentProductRemainder < minimumRemainder ? currentProductRemainder : minimumRemainder;
          }
        }
      }
      console.log(minimumRemainder);
    } else {
      console.log(0);
    }
  } else {
    // If the product of the bounds does not exceed 2019, a simpler calculation is applied.
    console.log(leftBound * (leftBound + 1));
  }
}

ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));