const getMirroredChar = (charToMirror) => {
  const mirrorLookupTable = {
    "b": "d",
    "d": "b",
    "p": "q",
    "q": "p"
  };
  return mirrorLookupTable[charToMirror];
};

function processInput(rawData) {
  const characterSequence = rawData.split("");
  const sequenceLength = characterSequence.length;

  if (sequenceLength % 2 !== 0) {
    console.log("No");
    return;
  }

  const midPoint = sequenceLength / 2;
  const firstSegment = characterSequence.slice(0, midPoint);
  const secondSegment = characterSequence.slice(midPoint, sequenceLength);

  const transformedSecondSegment = secondSegment.reverse().map(getMirroredChar).join("");
  const firstSegmentString = firstSegment.join("");

  const areSegmentsSymmetric = firstSegmentString === transformedSecondSegment;

  if (areSegmentsSymmetric) {
    console.log("Yes");
  } else {
    console.log("No");
  }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
