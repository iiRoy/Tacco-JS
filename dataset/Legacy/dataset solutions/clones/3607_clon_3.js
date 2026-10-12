function determineParityOutput(valueToCheck) {
  const PARITY_DIVISOR = 2;
  const currentRemainder = valueToCheck % PARITY_DIVISOR;
  const isValueEven = (currentRemainder === 0);
  const finalResult = isValueEven ? 1 : 0;
  return finalResult;
}

const ioInterfaceModule = require('readline');

const inputOutputHandler = ioInterfaceModule.createInterface({
  input: process.stdin,
  output: process.stdout
});

const DECIMAL_RADIX = 10;
const USER_PROMPT_TEXT = "Input a number: ";
const INVALID_INPUT_ERROR_MESSAGE = "Invalid input. Please enter a number.";

inputOutputHandler.question(USER_PROMPT_TEXT, (receivedInputString) => {
  const processedNumber = parseInt(receivedInputString, DECIMAL_RADIX);

  if (Number.isNaN(processedNumber)) {
    console.error(INVALID_INPUT_ERROR_MESSAGE);
    inputOutputHandler.close();
    return;
  }

  const calculatedOutput = determineParityOutput(processedNumber);

  console.log(calculatedOutput);

  inputOutputHandler.close();
});
