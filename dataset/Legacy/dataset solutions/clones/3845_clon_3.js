process.stdin.setEncoding('utf-8');

function computeConditionalResult(firstOperandString, secondOperandString) {
  let finalComputedValue;

  // The original comparison (a <= b) performs a string comparison if both are strings.
  // The assignment (a) keeps it as a string, while subtraction (a - 1) forces numeric conversion.
  if (firstOperandString <= secondOperandString) {
    finalComputedValue = firstOperandString; // Assign the string value directly
  } else {
    finalComputedValue = Number(firstOperandString) - 1; // Convert to number for arithmetic
  }
  return finalComputedValue;
}

process.stdin.on('data', function (inputLine) {
  const lineParts = inputLine.split(' ');
  const valueAString = lineParts[0];
  const valueBString = lineParts[1];

  const outputValue = computeConditionalResult(valueAString, valueBString);

  console.log(outputValue);
});
