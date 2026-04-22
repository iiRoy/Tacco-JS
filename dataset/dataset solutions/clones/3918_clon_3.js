// Function to acquire raw input from the standard input stream.
const obtainRawInput = () => require("fs").readFileSync("/dev/stdin", "utf8").trim();

// Function to present the final computed result to standard output.
const displayResult = (content) => {
  console.log(content);
};

// Utility function for logging diagnostic messages or errors to standard error.
const logDiagnostic = (issue) => {
  console.error(`DIAGNOSTIC: ${issue}`);
};

// Enum-like object for clarity instead of magic numbers for input processing modes.
const ProcessingModes = Object.freeze({
  AS_IS: 0,
  TO_INTEGER: 1,
  SPLIT_BY_SPACE: 2,
  SPLIT_BY_NEWLINE: 3,
  SPLIT_SPACE_TO_NUM_ARRAY: 4,
  SPLIT_NEWLINE_TO_NUM_ARRAY: 5,
  SPLIT_TO_CHARS: 6,
  SPLIT_CHARS_TO_NUM_ARRAY: 7,
});

// A versatile input parsing and transformation utility.
const processInputData = (sourceString, modeSelection) => {
  // Defensive check for invalid mode
  if (!Object.values(ProcessingModes).includes(modeSelection)) {
    logDiagnostic(`Invalid processing mode selected: ${modeSelection}. Defaulting to AS_IS.`);
    return sourceString;
  }

  let processedOutput;
  switch (modeSelection) {
    case ProcessingModes.AS_IS:
      processedOutput = sourceString;
      break;
    case ProcessingModes.TO_INTEGER:
      processedOutput = parseInt(sourceString, 10); // Explicitly specify radix
      break;
    case ProcessingModes.SPLIT_BY_SPACE:
      processedOutput = sourceString.split(" ");
      break;
    case ProcessingModes.SPLIT_BY_NEWLINE:
      processedOutput = sourceString.split("\n");
      break;
    case ProcessingModes.SPLIT_SPACE_TO_NUM_ARRAY:
      processedOutput = sourceString.split(" ").map(Number);
      break;
    case ProcessingModes.SPLIT_NEWLINE_TO_NUM_ARRAY:
      processedOutput = sourceString.split("\n").map(Number);
      break;
    case ProcessingModes.SPLIT_TO_CHARS:
      processedOutput = sourceString.split("");
      break;
    case ProcessingModes.SPLIT_CHARS_TO_NUM_ARRAY:
      processedOutput = sourceString.split("").map(Number);
      break;
    default:
      // This case should ideally not be reached due to the initial check.
      logDiagnostic(`Unhandled processing mode encountered: ${modeSelection}. Returning raw string.`);
      processedOutput = sourceString;
  }
  return processedOutput;
};

// Main execution logic for the problem.
const executeProgram = (rawProgramInput) => {
  // Parse and sort the initial numerical inputs.
  // We expect three space-separated integers.
  let numericalComponents = processInputData(rawProgramInput, ProcessingModes.SPLIT_SPACE_TO_NUM_ARRAY);

  // Validate input: ensure we have exactly three numbers.
  if (numericalComponents.length !== 3) {
    logDiagnostic("Input must consist of exactly three numerical components.");
    displayResult("Error: Invalid input count.");
    return;
  }

  // Sort them for consistent processing, ascending order.
  numericalComponents.sort((a, b) => a - b);

  // Use let as values might be modified during parity adjustment.
  let [firstVal, secondVal, thirdVal] = numericalComponents;
  let totalOperations = 0;

  // Determine parity for each number.
  const parityOfFirst = firstVal % 2;
  const parityOfSecond = secondVal % 2;
  const parityOfThird = thirdVal % 2;

  // Check if not all numbers have the same parity.
  // If their parities are not all identical, then exactly two must share a parity
  // and the third one must be different. We need to increment the two with matching parity.
  if (!(parityOfFirst === parityOfSecond && parityOfSecond === parityOfThird)) {
    // Identify the pair with matching parity and increment them.
    // This single step ensures all three numbers will then have the same parity.
    if (parityOfFirst === parityOfSecond) {
      firstVal++;
      secondVal++;
    } else if (parityOfFirst === parityOfThird) {
      firstVal++;
      thirdVal++;
    } else { // This condition implies that parityOfSecond === parityOfThird
      secondVal++;
      thirdVal++;
    }
    totalOperations++; // One operation (incrementing two numbers) performed
  }

  // At this point, all three numbers (firstVal, secondVal, thirdVal) have the same parity.
  // The next objective is to make them all equal to the current maximum value.
  // Each operation allows us to increment any two numbers by 1.
  // Since all numbers now have the same parity, the difference between any number
  // and the maximum will always be an even number.

  const currentMaximum = Math.max(firstVal, secondVal, thirdVal);

  // Calculate the differences from the maximum for each number.
  const diffFromFirst = currentMaximum - firstVal;
  const diffFromSecond = currentMaximum - secondVal;
  const diffFromThird = currentMaximum - thirdVal;

  // Since each operation increments two numbers, and each difference is even,
  // the total number of operations required is the sum of these differences divided by 2.
  totalOperations += (diffFromFirst + diffFromSecond + diffFromThird) / 2;

  displayResult(totalOperations);
};

// Initiate the program execution by obtaining input and passing it to the main logic.
executeProgram(obtainRawInput());