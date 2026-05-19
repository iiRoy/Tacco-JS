const processSequence = sequenceData => {
  let totalWhiteChars = 0;
  for (const char of sequenceData) {
    if (char === 'W') {
      totalWhiteChars++;
    }
  }

  let cumulativeDisplacements = 0;
  let currentWhiteCharsToRight = totalWhiteChars;

  for (const char of sequenceData) {
    if (char === 'W') {
      currentWhiteCharsToRight--;
    } else if (char === 'B') {
      cumulativeDisplacements += currentWhiteCharsToRight;
    }
  }

  console.log(cumulativeDisplacements);
};

processSequence(require("fs").readFileSync("/dev/stdin", "utf8"));
