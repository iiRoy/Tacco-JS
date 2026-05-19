"use strict";
process.stdin.resume();
process.stdin.setEncoding("utf-8");

function outputResult(x) {
  console.log(x);
}

let rawDataBuffer = "";
let lineIndex = 0;

process.stdin.on("data", inputChunk => {
  rawDataBuffer += inputChunk;
});
process.stdin.on("end", () => {
  rawDataBuffer = rawDataBuffer.split("\n");
  executeProcessing();
});
function fetchLine() {
  return rawDataBuffer[lineIndex++];
}

// ************************ Ignore above this Line ******************************
// **************************** Main Code Start *********************************

function executeProcessing() {

  const inputLine = fetchLine();
  const SPACE_DELIMITER = " ";

  // Helper function to parse a string into an integer with explicit radix
  const parseNumericValue = (str) => parseInt(str, 10);

  // Split the input line into string tokens
  const stringTokens = inputLine.split(SPACE_DELIMITER);

  // Parse the individual numeric values
  const firstVal = parseNumericValue(stringTokens[0]);
  const secondVal = parseNumericValue(stringTokens[1]);

  // Introduce a helper function for the core arithmetic logic
  const calculateDerivedValue = (valA, valB) => {
    const currentMax = Math.max(valA, valB);
    const currentMin = Math.min(valA, valB);

    // Use bitwise OR ( | 0 ) as an equivalent for Math.floor for positive numbers
    const quotientResult = (currentMax / currentMin) | 0;
    const productResult = (currentMax * currentMin) | 0;

    // Introduce an intermediate variable for the final division step
    const finalDivisionStep = productResult / quotientResult;
    
    // Apply floor again to the final result
    return finalDivisionStep | 0;
  };

  const finalComputedValue = calculateDerivedValue(firstVal, secondVal);

  outputResult(finalComputedValue);
  
}
