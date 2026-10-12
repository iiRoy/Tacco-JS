const processInput = (rawData) => {
  const trimmedInput = rawData.trim();
  const dnaPattern = /[ATCG]+/g;
  const dnaSegments = trimmedInput.match(dnaPattern);

  const determineMaxSegmentLength = (segmentsArray) => {
    let currentMaximumLength = 0;
    if (!segmentsArray || segmentsArray.length === 0) {
      return currentMaximumLength;
    }

    for (let segmentIndex = 0; segmentIndex < segmentsArray.length; segmentIndex++) {
      const segment = segmentsArray[segmentIndex];
      currentMaximumLength = Math.max(segment.length, currentMaximumLength);
    }
    return currentMaximumLength;
  };

  const longestSegmentLength = determineMaxSegmentLength(dnaSegments);

  console.log(longestSegmentLength);
};

processInput(require('fs').readFileSync('/dev/stdin', 'UTF-8'));
