function processInput(rawData) {
  const textSegments = rawData.split("\n");
  const firstString = textSegments[0];
  const secondString = textSegments[1];

  const matchCount = Array.from(firstString).reduce((currentTally, charFromFirst, charIndex) => {
    return currentTally + (charFromFirst === secondString[charIndex] ? 1 : 0);
  }, 0);

  console.log(matchCount);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
