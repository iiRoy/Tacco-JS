const parseAndAnalyze = (sourceData) => {
  const inputLines = sourceData.trim().split("\n");
  const entityCount = parseInt(inputLines[0], 10);

  const pointRepresentations = inputLines.slice(1, entityCount + 1).map((coordinateString) => {
    const numericParts = coordinateString.split(" ").map(Number);
    return { horizontalComponent: numericParts[0], verticalComponent: numericParts[1] };
  });

  const allPairings = Array.from({ length: entityCount }, (_, i) => i)
    .flatMap((idxA) => 
      Array.from({ length: entityCount - (idxA + 1) }, (_, j) => j + idxA + 1)
        .map((idxB) => [pointRepresentations[idxA], pointRepresentations[idxB]])
    );

  const calculateCanonicalVectors = (pairOfPoints) => {
    const pointOne = pairOfPoints[0];
    const pointTwo = pairOfPoints[1];

    const dX = pointTwo.horizontalComponent - pointOne.horizontalComponent;
    const dY = pointTwo.verticalComponent - pointOne.verticalComponent;

    if (dX < 0 || (dX === 0 && dY < 0)) {
      return `${-dX},${-dY}`;
    }
    return `${dX},${dY}`;
  };

  const vectorOccurrences = allPairings
    .map(calculateCanonicalVectors)
    .reduce((counts, vectorKey) => {
      counts.set(vectorKey, (counts.get(vectorKey) || 0) + 1);
      return counts;
    }, new Map());

  const maximumFrequency = vectorOccurrences.size > 0
    ? Math.max(...Array.from(vectorOccurrences.values()))
    : 0;

  console.log(entityCount - maximumFrequency);
};

parseAndAnalyze(require("fs").readFileSync("/dev/stdin", "utf8"));