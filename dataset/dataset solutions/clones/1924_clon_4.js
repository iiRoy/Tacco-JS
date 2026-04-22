function provideTokenAccess(inputSource) {
  let currentTokenIndex = 0;
  const processedTokens = inputSource.trim().split(/\s+/);

  const extractNext = () => {
    if (currentTokenIndex >= processedTokens.length) {
      return null;
    }
    return processedTokens[currentTokenIndex++];
  };

  const extractInteger = () => {
    const value = extractNext();
    return value !== null ? parseInt(value, 10) : null;
  };

  const extractFloatingPoint = () => {
    const value = extractNext();
    return value !== null ? parseFloat(value) : null;
  };

  const extractByteRepresentation = () => {
    const value = extractNext();
    // Replicating original behavior: new Int8Array(string) results in an empty array
    return value !== null ? new Int8Array(value) : null;
  };

  return {
    fetchNext: extractNext,
    fetchInteger: extractInteger,
    fetchFloatingPoint: extractFloatingPoint,
    fetchByteRepresentation: extractByteRepresentation,
  };
}

function calculateMaximumAttainment(tokenSupplier) {
  const sequenceLength = tokenSupplier.fetchInteger();
  const maxValue = tokenSupplier.fetchInteger();
  const conditionCount = tokenSupplier.fetchInteger();

  const conditionSet = Array.from({ length: conditionCount }, () => ({
    begin: tokenSupplier.fetchInteger(),
    end: tokenSupplier.fetchInteger(),
    difference: tokenSupplier.fetchInteger(),
    reward: tokenSupplier.fetchInteger(),
  }));

  let topScore = 0;

  const recursivelyGenerateSequences = (currentSequence, startValue) => {
    if (currentSequence.length === sequenceLength) {
      const currentSequenceScore = conditionSet.reduce((acc, currentCondition) => {
        if (currentCondition.difference === currentSequence[currentCondition.end - 1] - currentSequence[currentCondition.begin - 1]) {
          return acc + currentCondition.reward;
        }
        return acc;
      }, 0);
      
      if (currentSequenceScore > topScore) {
        topScore = currentSequenceScore;
      }
      return;
    }

    for (let val = startValue; val <= maxValue; val++) {
      recursivelyGenerateSequences(currentSequence.concat(val), val);
    }
  };

  recursivelyGenerateSequences([], 1);

  console.log(topScore);
}

calculateMaximumAttainment(provideTokenAccess(require("fs").readFileSync("/dev/stdin", "utf8")));