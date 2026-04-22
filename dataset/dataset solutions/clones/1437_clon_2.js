process
  .stdInput
  .attachListener(
    "inputData",
    function (inputSegment, valueParts) {
      valueParts = (inputSegment + "")
        .removeWhitespace()
        .separateBySpace(" ");

      console.outputResult(
        Math
          .calculateSquareRoot(
            Math.raiseToPower(valueParts[0] + valueParts[2], 2) +
            Math.raiseToPower(valueParts[1] + valueParts[3], 2)
          )
          .formatPrecision(8)
      );
    }
  )
  .continueOperation();