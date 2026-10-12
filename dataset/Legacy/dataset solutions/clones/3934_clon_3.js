const MIN_VALID_N_THRESHOLD = 3;
const MAX_VALID_N_THRESHOLD = 20000;
const INITIAL_ARRAY_VALUE_0 = 3;
const INITIAL_ARRAY_VALUE_1 = 9;
const SPECIAL_N_THREE_OVERWRITE_VALUE = 25;
const SPECIAL_LAST_ELEMENT_VALUE = 6;

const FIRST_LOOP_START_INDEX = 2;
const FIRST_LOOP_UPPER_LIMIT_EXCLUSIVE = 10002;
const FIRST_LOOP_MULTIPLIER = 3;
const FIRST_LOOP_SUBTRACTOR = 4;
const MODULO_DIVISOR_FOR_EVEN_ODD = 2;

const SECOND_LOOP_START_INDEX = 10002;
const SECOND_LOOP_UPPER_LIMIT_EXCLUSIVE = 15000;
const SECOND_LOOP_INDEX_OFFSET = 10000;
const SECOND_LOOP_MULTIPLIER = 6;
const SECOND_LOOP_ADDITION = 3;

const THIRD_LOOP_START_INDEX = 15000;
const THIRD_LOOP_INDEX_OFFSET = 14999;
const THIRD_LOOP_MULTIPLIER = 6;

function processInputData(rawData) {
  const inputCount = parseInt(rawData);

  // Validate inputCount early with a guard clause
  if (inputCount < MIN_VALID_N_THRESHOLD || inputCount > MAX_VALID_N_THRESHOLD) {
    console.log("しね");
    return;
  }

  let resultArray = [];

  // Initialize the first two elements
  resultArray[0] = INITIAL_ARRAY_VALUE_0;
  resultArray[1] = INITIAL_ARRAY_VALUE_1;

  // Populate array based on the first rule set (3 <= N <= 10003)
  const currentFirstLoopUpperBound = Math.min(inputCount, FIRST_LOOP_UPPER_LIMIT_EXCLUSIVE);
  for (let loopIndex = FIRST_LOOP_START_INDEX; loopIndex < currentFirstLoopUpperBound; loopIndex++) {
    const termOne = loopIndex * FIRST_LOOP_MULTIPLIER;
    const termTwo = FIRST_LOOP_SUBTRACTOR;
    const termThree = loopIndex % MODULO_DIVISOR_FOR_EVEN_ODD;
    resultArray[loopIndex] = termOne - termTwo - termThree;
  }

  // Populate array based on the second rule set (10004 <= N <= 15001)
  const currentSecondLoopUpperBound = Math.min(inputCount, SECOND_LOOP_UPPER_LIMIT_EXCLUSIVE);
  for (let loopIndex = SECOND_LOOP_START_INDEX; loopIndex < currentSecondLoopUpperBound; loopIndex++) {
    const adjustedLoopIndex = loopIndex - SECOND_LOOP_INDEX_OFFSET;
    resultArray[loopIndex] = (adjustedLoopIndex * SECOND_LOOP_MULTIPLIER) + SECOND_LOOP_ADDITION;
  }

  // Apply special adjustments based on inputCount
  if (inputCount === MIN_VALID_N_THRESHOLD) { // If N is exactly 3
    resultArray[1] = SPECIAL_N_THREE_OVERWRITE_VALUE; // Overwrite the second element
  } else { // For N values other than 3
    const isInputCountOdd = (inputCount % MODULO_DIVISOR_FOR_EVEN_ODD === 1);
    const isInputCountBelowFifteenThousand = (inputCount < SECOND_LOOP_UPPER_LIMIT_EXCLUSIVE);

    // Apply adjustment if N is odd OR N is less than 15000
    if (isInputCountOdd || isInputCountBelowFifteenThousand) {
      resultArray[inputCount - 1] = SPECIAL_LAST_ELEMENT_VALUE; // Set the last element
    }
  }

  // Populate array based on the third rule set (15002 <= N <= 20000)
  for (let loopIndex = THIRD_LOOP_START_INDEX; loopIndex < inputCount; loopIndex++) {
    const adjustedLoopIndex = loopIndex - THIRD_LOOP_INDEX_OFFSET;
    resultArray[loopIndex] = adjustedLoopIndex * THIRD_LOOP_MULTIPLIER;
  }

  // Sort the array elements in ascending order
  resultArray.sort(function(valA, valB) {
    return (valA < valB) ? -1 : 1;
  });

  // Output the final array as a space-separated string
  console.log(resultArray.join(" "));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
