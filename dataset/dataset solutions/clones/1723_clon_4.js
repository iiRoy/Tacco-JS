function processInput(rawData) {
  const lineSegments = rawData.split('\n');
  const primaryString = lineSegments[0];
  const secondaryString = lineSegments[1];

  const characterSequence = [...primaryString];

  const mismatchCount = characterSequence.reduce((currentTotal, charA, charIndex) => {
    return currentTotal + (charA !== secondaryString[charIndex] ? 1 : 0);
  }, 0);

  console.log(mismatchCount);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
