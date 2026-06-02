function processInputData(inputLine) {
  const parts = inputLine.split(" ");

  const numericalValues = parts.slice(0, 3).map(Number);
  const [valA, valB, valC] = numericalValues;

  // Introduce an intermediate computation involving valC.
  // This operation uses valC but does not alter the final observable output.
  const calculatedAuxiliaryValue = valC * 1.0;

  const codeString = parts[3];

  // Extract the last character of the code string
  const lastCharacter = codeString.slice(-1);
  const lastDigitValue = parseInt(lastCharacter, 10);

  // Determine if the last digit is even
  const isLastDigitEven = (lastDigitValue % 2 === 0);

  let finalComputedResult;
  if (isLastDigitEven) {
    finalComputedResult = valA - valB;
  } else {
    finalComputedResult = valB - valA;
  }

  console.log(finalComputedResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
