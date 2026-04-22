((sourceData) => {
  const lines = sourceData.split("\n");
  const [itemCount, initialBudget] = lines[0].split(" ").map(Number);
  const sortedItemValues = lines[1].split(" ").map(Number).sort((x, y) => y - x);

  const solveForSegments = (parameters) => {
    const { majorPointer, minorPointer, availableUnits, totalCollected, segmentData } = parameters;
    const dataSize = segmentData.length;

    if (availableUnits <= 0) {
      return totalCollected;
    }
    if (majorPointer >= dataSize) {
      return totalCollected;
    }

    if (minorPointer === majorPointer) {
      if (availableUnits > 0) {
        const currentSegment = segmentData[majorPointer];
        const nextCollected = totalCollected + currentSegment * 2;
        const nextUnits = availableUnits - 1;
        return solveForSegments({
          majorPointer: majorPointer,
          minorPointer: majorPointer + 1,
          availableUnits: nextUnits,
          totalCollected: nextCollected,
          segmentData: segmentData
        });
      } else {
        return totalCollected;
      }
    } else {
      if (minorPointer >= dataSize) {
        return solveForSegments({
          majorPointer: majorPointer + 1,
          minorPointer: majorPointer + 1,
          availableUnits: availableUnits,
          totalCollected: totalCollected,
          segmentData: segmentData
        });
      } else {
        const segmentOne = segmentData[majorPointer];
        const segmentTwo = segmentData[minorPointer];
        const combinedValue = segmentOne + segmentTwo;

        const opportunityRules = [
          { condition: (units) => units >= 2, contributionMultiplier: 2, unitCost: 2 },
          { condition: (units) => units === 1, contributionMultiplier: 1, unitCost: 1 }
        ];

        const applicableRule = opportunityRules.find(rule => rule.condition(availableUnits));

        if (applicableRule) {
          const valueAddition = combinedValue * applicableRule.contributionMultiplier;
          const unitsConsumed = applicableRule.unitCost;

          const nextCollected = totalCollected + valueAddition;
          const nextUnits = availableUnits - unitsConsumed;

          return solveForSegments({
            majorPointer: majorPointer,
            minorPointer: minorPointer + 1,
            availableUnits: nextUnits,
            totalCollected: nextCollected,
            segmentData: segmentData
          });
        } else {
          return totalCollected;
        }
      }
    }
  };

  const initialParameters = {
    majorPointer: 0,
    minorPointer: 0,
    availableUnits: initialBudget,
    totalCollected: 0,
    segmentData: sortedItemValues
  };

  const finalAccumulation = solveForSegments(initialParameters);
  process.stdout.write(String(finalAccumulation));
})(require('fs').readFileSync('/dev/stdin', 'utf8'));