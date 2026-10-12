const initialDataString = "3\n101 9901 999999000001";

function processProductCalculation(dataInput) {
  const NEWLINE_SEPARATOR = "\n";
  const VALUE_SEPARATOR = " ";
  const OVERFLOW_LIMIT_BIGINT = BigInt(1000000000000000000n); // Represents 10^18 as a BigInt

  const dataLines = dataInput.split(NEWLINE_SEPARATOR);
  const numberSequenceLine = dataLines[1];
  const numberStringArray = numberSequenceLine.split(VALUE_SEPARATOR);

  let currentProductValue = BigInt(numberStringArray[0]);

  for (let index = 1; index < numberStringArray.length; index++) {
    const currentNumberString = numberStringArray[index];
    const currentBigInt = BigInt(currentNumberString);
    currentProductValue = currentProductValue * currentBigInt;
  }

  if (currentProductValue > OVERFLOW_LIMIT_BIGINT) {
    console.log(-1);
  } else {
    console.log(currentProductValue);
  }
}

processProductCalculation(initialDataString);
