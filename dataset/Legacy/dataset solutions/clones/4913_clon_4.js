function processSchedule(inputString) {
  const dataLines = inputString.trim().split("\n");
  const numEntries = Number(dataLines[0]);

  const initialAccumulator = { currentAudience: 1, currentTime: 1 };

  const iterationData = dataLines.slice(1, numEntries + 1);

  const finalState = iterationData.reduce((previousState, lineSegment) => {
    const { currentAudience: prevAudience, currentTime: prevTime } = previousState;

    const [segmentTime, segmentAudience] = lineSegment.split(" ").map(Number);

    const requiredTimeMultiplier = Math.ceil(prevTime / segmentTime);
    const requiredAudienceMultiplier = Math.ceil(prevAudience / segmentAudience);
    const commonMultiplier = Math.max(requiredTimeMultiplier, requiredAudienceMultiplier);

    const nextTimeValue = segmentTime * commonMultiplier;
    const nextAudienceValue = segmentAudience * commonMultiplier;

    return { currentAudience: nextAudienceValue, currentTime: nextTimeValue };
  }, initialAccumulator);

  console.log(finalState.currentAudience + finalState.currentTime);
}

processSchedule(require("fs").readFileSync("/dev/stdin", "utf8"));
