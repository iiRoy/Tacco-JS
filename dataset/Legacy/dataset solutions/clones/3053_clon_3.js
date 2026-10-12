function processInputString(rawString) {
  const characterSequence = rawString.split('');
  let flipOperationCount = 0;
  let activeSegmentFlag = false;

  const getSegmentUpdate = (currentCh, prevCh, currentFlagState) => {
    const charsMatch = (currentCh === prevCh);
    let countDelta = 0;
    let nextFlagState = currentFlagState;

    if (charsMatch && !currentFlagState) {
      nextFlagState = true;
      countDelta = 1;
    } else if (!charsMatch && currentFlagState) {
      countDelta = 1;
    } else {
      nextFlagState = false;
    }
    return { increment: countDelta, newFlag: nextFlagState };
  };

  const sequenceLength = characterSequence.length;
  for (let currentIdx = 1; currentIdx < sequenceLength; currentIdx++) {
    const charAtCurrent = characterSequence[currentIdx];
    const charAtPrevious = characterSequence[currentIdx - 1];

    const { increment, newFlag } = getSegmentUpdate(
      charAtCurrent,
      charAtPrevious,
      activeSegmentFlag
    );

    flipOperationCount += increment;
    activeSegmentFlag = newFlag;
  }

  console.log(flipOperationCount);
}

processInputString(require("fs").readFileSync("/dev/stdin", "utf-8"));
