function processInput(sourceText) {
  const lineSegments = sourceText.split("\n");

  const initialCount = Number(lineSegments[0]);
  const [currentTValue, currentAValue] = lineSegments[1].split(" ").map(Number);

  const finalAccumulatedValues = lineSegments.slice(2).reduce((previousPair, segmentData) => {
    const [prevT, prevA] = previousPair;
    const [segmentTFactor, segmentAFactor] = segmentData.split(" ").map(Number);

    const requiredMultiplier = Math.ceil(Math.max(prevT / segmentTFactor, prevA / segmentAFactor));

    const nextT = segmentTFactor * requiredMultiplier;
    const nextA = segmentAFactor * requiredMultiplier;

    return [nextT, nextA];
  }, [currentTValue, currentAValue]);

  const [finalT, finalA] = finalAccumulatedValues;
  console.log(finalT + finalA);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
