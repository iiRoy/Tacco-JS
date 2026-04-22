function ProcessData(rawData) {
  let linesArray = rawData.split("\n");

  const firstLineTokens = linesArray[0].split(" ");

  const squareCount = Number(firstLineTokens[0]);
  const feeQuantity = Number(firstLineTokens[1]);
  const initialThreshold = Number(firstLineTokens[2]);

  let feeValuesString = linesArray[1].split(" ");

  let higherCount = 0;
  let lowerCount = 0;

  feeValuesString.forEach(
    function (currentItemValue) {
      if (currentItemValue > initialThreshold) {
        higherCount++;
      } else {
        lowerCount++;
      }
    }
  );

  if (higherCount > lowerCount) {
    console.log(lowerCount);
  } else {
    console.log(higherCount);
  }
}

ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));