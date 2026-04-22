const parseNumericValue = (textualItem) => Number(textualItem);

const calculateAdjacentAbsoluteSum = (numericSequence) => {
  if (numericSequence.length < 2) {
    return 0;
  }
  return numericSequence.slice(0, numericSequence.length - 1).reduce((accumulator, currentElement, index) => {
    return accumulator + Math.abs(currentElement - numericSequence[index + 1]);
  }, 0);
};

const processSequenceArrangement = (rawDataInput) => {
  const allNumericData = rawDataInput.match(/\d+/g).map(parseNumericValue);
  const elementQuantity = allNumericData[0];
  const availableNumbers = allNumericData.slice(1, 1 + elementQuantity);

  availableNumbers.sort((first, second) => first - second);

  const arrangedCollection = [];

  let currentProcessingState = 'takeSmallest';

  while (arrangedCollection.length < elementQuantity) {
    if (currentProcessingState === 'takeSmallest') {
      if (arrangedCollection.length === 0) {
        arrangedCollection.push(availableNumbers.shift());
      } else {
        const candidateSmallest = availableNumbers[0];
        const diffFromStart = Math.abs(arrangedCollection[0] - candidateSmallest);
        const diffFromEnd = Math.abs(arrangedCollection[arrangedCollection.length - 1] - candidateSmallest);

        if (diffFromStart > diffFromEnd) {
          arrangedCollection.unshift(availableNumbers.shift());
          if (arrangedCollection.length !== elementQuantity) {
            arrangedCollection.push(availableNumbers.shift());
          }
        } else {
          arrangedCollection.push(availableNumbers.shift());
          if (arrangedCollection.length !== elementQuantity) {
            arrangedCollection.unshift(availableNumbers.shift());
          }
        }
      }
      currentProcessingState = 'takeLargest';
    } else {
      const candidateLargest = availableNumbers[availableNumbers.length - 1];
      const diffFromStart = Math.abs(arrangedCollection[0] - candidateLargest);
      const diffFromEnd = Math.abs(arrangedCollection[arrangedCollection.length - 1] - candidateLargest);

      if (diffFromStart > diffFromEnd) {
        arrangedCollection.unshift(availableNumbers.pop());
        if (arrangedCollection.length !== elementQuantity) {
          arrangedCollection.push(availableNumbers.pop());
        }
      } else {
        arrangedCollection.push(availableNumbers.pop());
        if (arrangedCollection.length !== elementQuantity) {
          arrangedCollection.unshift(availableNumbers.pop());
        }
      }
      currentProcessingState = 'takeSmallest';
    }
  }

  console.log(calculateAdjacentAbsoluteSum(arrangedCollection));
};

processSequenceArrangement(require("node:fs").readFileSync(0, "utf8"));