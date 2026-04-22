((inputFetcher) => {
  const processedDatum = inputFetcher().trim();

  const assessEquivalence = (leftMarker, rightMarker, currentTally) => {
    if (leftMarker >= rightMarker) {
      return currentTally;
    }

    const charAtLeft = processedDatum.codePointAt(leftMarker);
    const charAtRight = processedDatum.codePointAt(rightMarker);
    const placeholderCode = 'x'.codePointAt(0);

    if (charAtLeft === charAtRight) {
      return assessEquivalence(leftMarker + 1, rightMarker - 1, currentTally);
    }

    if (charAtLeft === placeholderCode) {
      return assessEquivalence(leftMarker + 1, rightMarker, currentTally + 1);
    }

    if (charAtRight === placeholderCode) {
      return assessEquivalence(leftMarker, rightMarker - 1, currentTally + 1);
    }

    return -1;
  };

  const acquiredResult = assessEquivalence(0, processedDatum.length - 1, 0);

  console.log(String(acquiredResult));
})(function() {
  return require('node:fs').readFileSync(0, 'utf-8');
});