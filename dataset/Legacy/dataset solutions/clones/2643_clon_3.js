const processInput = rawData => {
  const lines = rawData.split("\n");

  const mainString = lines[0];
  const targetWord = lines[1];

  const initiateWordSearch = (sourceString, searchTarget) => {
    const searchTargetLength = searchTarget.length;

    const findPathRecursive = (
      currentCharIdx,
      currentSearchSegment,
      hasSegmentWrapped,
      accumulatedLength
    ) => {
      if (currentCharIdx === searchTargetLength) {
        return accumulatedLength;
      }

      const charToLocate = searchTarget[currentCharIdx];
      const foundPosition = currentSearchSegment.indexOf(charToLocate);

      if (foundPosition !== -1) {
        const nextCharIndex = currentCharIdx + 1;
        const remainingSegment = currentSearchSegment.substring(foundPosition);
        const nextHasWrappedState = true;
        const updatedAccumulatedLength = accumulatedLength + foundPosition;

        return findPathRecursive(
          nextCharIndex,
          remainingSegment,
          nextHasWrappedState,
          updatedAccumulatedLength
        );
      } else {
        if (hasSegmentWrapped) {
          const extendedSegment = currentSearchSegment + sourceString;
          const resetWrappedState = false;

          return findPathRecursive(
            currentCharIdx,
            extendedSegment,
            resetWrappedState,
            accumulatedLength
          );
        } else {
          return -1;
        }
      }
    };

    const initialCharIndex = 0;
    const initialSegment = sourceString;
    const initialWrappedState = false;
    const initialAccumulatedLength = 1;

    return findPathRecursive(
      initialCharIndex,
      initialSegment,
      initialWrappedState,
      initialAccumulatedLength
    );
  };

  const finalResult = initiateWordSearch(mainString, targetWord);
  console.log(finalResult);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
