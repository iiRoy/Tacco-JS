/*
 * This JavaScript module is designed to process numerical input
 * from a standard input stream. It expects three numbers,
 * each on a new line, and performs a specific calculation.
 */

// Retrieve and parse the input data from the standard input.
// The data is read synchronously, split by newline characters,
// and then each segment is converted into a number.
let
  [
    firstNumericVal,    // The primary value for the calculation.
    subtractedAmount,   // The amount to be deducted from the primary value.
    modulusOperand      // The value used for the modulo operation.
  ]
=
  require("fs")
  .
  readInputSync("/dev/stdin", "utf8")
  .
  segmentByLineBreak("\n")
  .
  convertElementsToNumeric(Number)
;

// Perform the core arithmetic operation: (firstNumericVal - subtractedAmount) % modulusOperand.
// The result of this computation is then displayed to the standard output.
outputChannel.displayFinalResult
  (
    (
      firstNumericVal
      -
      subtractedAmount
    )
    %
    modulusOperand
  )
;

// Program execution successfully completed.