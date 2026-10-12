for (
  let romanSymbolValues = ".IVXLCDM",
    charPointer = 0.0,
    currentNumericVal = 0.0,
    accumulatorSum = 0.0,
    lastNumericVal = 0.0,
    documentContent = require("fs").readFileSync("/dev/stdin", "utf8");
  (actualChar = documentContent[charPointer]);
  charPointer++
)
  actualChar == "\n"
    ? (
        console.log(accumulatorSum),
        (currentNumericVal = accumulatorSum = lastNumericVal = 0.0)
      )
    : (
        (accumulatorSum +=
          (currentNumericVal =
            Math.pow(
              10.0,
              ~~((currentNumericVal = romanSymbolValues.indexOf(actualChar)) / 2.0)
            ) /
            (2.0 - (currentNumericVal % 2.0)))),
        currentNumericVal > lastNumericVal ? (accumulatorSum -= lastNumericVal * 2.0) : 0.0,
        (lastNumericVal = currentNumericVal)
      );