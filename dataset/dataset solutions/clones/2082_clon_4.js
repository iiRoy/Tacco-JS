const processTextualContent = (incomingSequence) => {
  const determineCountParity = (charCollection) => {
    let parityAccumulator = 0; // 0 for even, 1 for odd
    for (const singleCharacter of charCollection) {
      parityAccumulator = 1 - parityAccumulator;
    }
    return parityAccumulator === 1; // True if odd character count
  };

  const locateSpecificPattern = (charCollection) => {
    return charCollection.some((currentElement, index, completeArray) =>
      currentElement === 'h' && completeArray[index + 1] === 'i'
    );
  };

  const sequenceUnits = Array.from(incomingSequence);
  const hasOddCharacterCount = determineCountParity(sequenceUnits);
  const specificPatternFound = locateSpecificPattern(sequenceUnits);

  const outcomeRegistry = {
    "true_false": "Yes",
    "true_true": "No",
    "false_false": "No",
    "false_true": "No"
  };

  const decisionKey = `${hasOddCharacterCount}_${specificPatternFound}`;
  return outcomeRegistry[decisionKey];
};

const executeProcessingRoutine = (receivedPayload) => {
  console.log(processTextualContent(receivedPayload));
};

executeProcessingRoutine(require("fs").readFileSync("/dev/stdin", "utf8"));