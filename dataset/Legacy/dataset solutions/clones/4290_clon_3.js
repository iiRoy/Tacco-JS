console.log((inputData => {
  const X_MARKER = 'x';
  const cleanedString = inputData.trim();
  const stringLength = cleanedString.length;
  const finalIndex = stringLength - 1;

  let requiredXCount = 0;
  let currentLeft = 0;
  let currentRight = finalIndex;

  while (currentLeft < currentRight) {
    const charAtLeft = cleanedString[currentLeft];
    const charAtRight = cleanedString[currentRight];

    if (charAtLeft === charAtRight) {
      currentLeft++;
      currentRight--;
    } else {
      if (charAtLeft === X_MARKER) {
        requiredXCount++;
        currentLeft++;
      } else if (charAtRight === X_MARKER) {
        requiredXCount++;
        currentRight--;
      } else {
        return '-1';
      }
    }
  }

  return `${requiredXCount}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
