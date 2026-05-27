const getInputFromFile = () => {
  return require("fs").readFileSync("/dev/stdin", "utf8");
};

function processInput(inputString) {
  const parsedNumber = parseInt(inputString);

  const FIRST_INITIAL_VALUE = 3;
  const SECOND_INITIAL_VALUE = 5;
  const LOOP_INITIAL_INDEX = 2;
  const ELEMENT_MULTIPLIER = 2;
  const CALCULATION_DIVISOR = 30;
  const FINAL_OFFSET_CONSTANT = 22;

  let resultArray = Array.from({ length: parsedNumber });
  resultArray[0] = FIRST_INITIAL_VALUE;
  resultArray[1] = SECOND_INITIAL_VALUE;

  let currentSum = 0;

  for (let loopCounter = LOOP_INITIAL_INDEX; loopCounter <= parsedNumber - 2; loopCounter++) {
    const computedElementValue = loopCounter * ELEMENT_MULTIPLIER;
    resultArray[loopCounter] = computedElementValue;
    currentSum += computedElementValue;
  }

  const sumRemainder = currentSum % CALCULATION_DIVISOR;
  const sumRoundedUpToMultiple = Math.ceil(currentSum / CALCULATION_DIVISOR) * CALCULATION_DIVISOR;
  
  const lastElementCalculatedValue = sumRoundedUpToMultiple - sumRemainder + FINAL_OFFSET_CONSTANT;

  resultArray[parsedNumber - 1] = lastElementCalculatedValue;

  console.log(resultArray.join(" "));
}

processInput(getInputFromFile());
