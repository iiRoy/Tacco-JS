console.log((inputData => {
  const processInputStrings = (rawInput) => {
    const [src, trg] = rawInput.trim().split('\n');
    return { srcStr: src, trgStr: trg };
  };

  const { srcStr: sourceString, trgStr: targetString } = processInputStrings(inputData);

  const sourceLength = sourceString.length;
  const targetLength = targetString.length;

  if (targetLength === 0) {
    return '0';
  }

  let lastFoundIndex = -1;
  let cycleCount = 0;

  const searchFromBeginningIndex = 0;

  for (let targetCharIndex = 0; targetCharIndex < targetLength; targetCharIndex++) {
    const charToLocate = targetString[targetCharIndex];

    let currentSearchStartPoint = lastFoundIndex + 1;
    let foundPositionInSource = sourceString.indexOf(charToLocate, currentSearchStartPoint);

    if (foundPositionInSource !== -1) {
      lastFoundIndex = foundPositionInSource;
    } else {
      if (lastFoundIndex === -1 && sourceString.indexOf(charToLocate, searchFromBeginningIndex) === -1) {
        return '-1';
      }

      cycleCount++;
      lastFoundIndex = -1;
      targetCharIndex--;
    }
  }

  const finalCalculatedPosition = cycleCount * sourceLength + lastFoundIndex + 1;
  return `${finalCalculatedPosition}`;

})(require('fs').readFileSync('/dev/stdin', 'utf8')));
