console.log((inputData => {
  const processString = (currentString, startIdx, endIdx, xCounter) => {
    if (startIdx >= endIdx) {
      return { count: xCounter, possible: true };
    }

    const charA = currentString[startIdx];
    const charB = currentString[endIdx];

    if (charA === charB) {
      return processString(currentString, startIdx + 1, endIdx - 1, xCounter);
    } else {
      if (charA === 'x') {
        return processString(currentString, startIdx + 1, endIdx, xCounter + 1);
      } else if (charB === 'x') {
        return processString(currentString, startIdx, endIdx - 1, xCounter + 1);
      } else {
        return { count: -1, possible: false };
      }
    }
  };

  const trimmedInput = inputData.trim();
  const finalResult = processString(trimmedInput, 0, trimmedInput.length - 1, 0);

  return finalResult.possible ? `${finalResult.count}` : '-1';
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
