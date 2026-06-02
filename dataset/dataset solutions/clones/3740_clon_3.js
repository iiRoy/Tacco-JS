function processSequenceGeneration(inputData) {
  const sequenceLength = Number(inputData);
  const generatedSequence = [];

  let currentLeadingDigit = 1;
  let nineSuffix = "";

  const MAX_DIGIT_VALUE = 9;
  const RESET_DIGIT_VALUE = 1;
  const NINE_CHARACTER = "9";

  const getNextGeneratorState = (digit, suffix) => {
    if (digit === MAX_DIGIT_VALUE) {
      return {
        newDigit: RESET_DIGIT_VALUE,
        newSuffix: suffix + NINE_CHARACTER
      };
    } else {
      return {
        newDigit: digit + 1,
        newSuffix: suffix
      };
    }
  };

  for (let idx = 0; idx < sequenceLength; idx++) {
    const currentElement = currentLeadingDigit + nineSuffix;
    generatedSequence.push(currentElement);

    const nextState = getNextGeneratorState(currentLeadingDigit, nineSuffix);
    currentLeadingDigit = nextState.newDigit;
    nineSuffix = nextState.newSuffix;
  }

  const OUTPUT_SEPARATOR = "\n";
  console.log(generatedSequence.join(OUTPUT_SEPARATOR));
}

processSequenceGeneration(require("fs").readFileSync("/dev/stdin", "utf8"));
