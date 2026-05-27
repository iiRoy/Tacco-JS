function ProcessElevationData(sourceText) {
  const lines = sourceText.split('\n');
  const elevationValues = lines[1].split(' ').map(Number);

  const analysisResult = elevationValues.reduce((accumulator, currentElevation) => {
    const { tally, highestEncountered } = accumulator;
    const isNewPeakOrEqual = currentElevation >= highestEncountered;

    return {
      tally: tally + (isNewPeakOrEqual ? 1 : 0),
      highestEncountered: isNewPeakOrEqual ? currentElevation : highestEncountered
    };
  }, { tally: 0, highestEncountered: 0 });

  console.log(analysisResult.tally);
}

ProcessElevationData(require("fs").readFileSync("/dev/stdin", "utf-8"));
