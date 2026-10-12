const processInput = rawData => {
  const cleanedInput = rawData.trim();
  const stringSegments = cleanedInput.split(' ');

  const firstSegment = stringSegments[0];
  const secondSegment = stringSegments[1];
  const thirdSegment = stringSegments[2];

  const verifyLink = (segmentA, segmentB) => {
    const lastCharOfA = segmentA[segmentA.length - 1];
    const firstCharOfB = segmentB[0];
    return lastCharOfA === firstCharOfB;
  };

  const isFirstPairConnected = verifyLink(firstSegment, secondSegment);
  const isSecondPairConnected = verifyLink(secondSegment, thirdSegment);

  if (isFirstPairConnected && isSecondPairConnected) {
    console.log('YES');
  } else {
    console.log('NO');
  }
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
