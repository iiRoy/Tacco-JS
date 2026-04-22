function isBinaryUnit(valueToCheck) {
  return valueToCheck > 0 && (valueToCheck & (valueToCheck - 1)) === 0;
}

function processInputData(rawText) {
  const dataLines = rawText.split("\n").filter(Boolean);
  const initialNumbers = dataLines[1].split(" ").map(Number);

  const countPairsRecursively = (currentSequence, currentPairCounter) => {
    if (currentSequence.length <= 1) {
      return currentPairCounter;
    }

    const orderedNumbers = [...currentSequence].sort((a, b) => b - a);

    const largestAvailable = orderedNumbers[0];
    const remainingElements = orderedNumbers.slice(1);

    let matchFoundFlag = false;

    const updatedRemainingElements = remainingElements.reduce((accumulator, element) => {
      if (!matchFoundFlag && isBinaryUnit(largestAvailable + element)) {
        matchFoundFlag = true;
      } else {
        accumulator.push(element);
      }
      return accumulator;
    }, []);

    if (matchFoundFlag) {
      return countPairsRecursively(updatedRemainingElements, currentPairCounter + 1);
    } else {
      return countPairsRecursively(remainingElements, currentPairCounter);
    }
  };

  const finalPairCount = countPairsRecursively(initialNumbers, 0);

  console.log(finalPairCount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));