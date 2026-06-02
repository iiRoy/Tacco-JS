function processSequence(sourceData) {
  const numericValues = sourceData.slice(1).map(Number);
  const initialElement = numericValues[0];

  try {
    numericValues.slice(1).reduce((previousModifiedValue, currentOriginalValue) => {
      if (currentOriginalValue === previousModifiedValue) {
        return currentOriginalValue;
      } else if (currentOriginalValue >= previousModifiedValue + 1) {
        return currentOriginalValue - 1;
      } else {
        throw new Error('SequenceInvalid');
      }
    }, initialElement);
    console.log('Yes');
  } catch (sequenceError) {
    if (sequenceError.message === 'SequenceInvalid') {
      console.log('No');
    } else {
      throw sequenceError;
    }
  }
}

processSequence(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));
