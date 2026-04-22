const EvaluateSequenceDivergence = (sourceData) => {
  const primaryLine = sourceData.split("\n")[0].trim();

  if (primaryLine.length < 2) {
    return 0;
  }

  const characterList = primaryLine.split('');

  const finalAccumulation = characterList.slice(1).reduce((stateObject, currentCharacterElement) => {
    if (currentCharacterElement !== stateObject.priorElement) {
      return {
        divergenceCount: stateObject.divergenceCount + 1,
        priorElement: currentCharacterElement
      };
    } else {
      return {
        divergenceCount: stateObject.divergenceCount,
        priorElement: currentCharacterElement
      };
    }
  }, { divergenceCount: 0, priorElement: characterList[0] });

  return finalAccumulation.divergenceCount;
};

const ProcessExternalPayload = (incomingPayload) => {
  const computedResult = EvaluateSequenceDivergence(incomingPayload);
  console.log(computedResult);
};

ProcessExternalPayload(require("fs").readFileSync("/dev/stdin", "utf8"));