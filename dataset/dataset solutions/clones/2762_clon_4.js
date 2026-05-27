const entryPoint = (sourceText) => {
  const parseInputData = (rawInputContent) => {
    const lines = rawInputContent.split("\n");
    const [pointCountStr, dimensionCountStr] = lines[0].split(" ");
    const pointCount = Number(pointCountStr);
    const dimensionCount = Number(dimensionCountStr);

    const coordinateSets = lines.slice(1, pointCount + 1).map((line) =>
      line.split(" ").map(Number)
    );

    return { pointCount, dimensionCount, coordinateSets };
  };

  const calculateDistanceBetweenPoints = (firstPoint, secondPoint) => {
    const squaredDifferencesSum = firstPoint.reduce(
      (accumulator, currentCoordinate, index) =>
        accumulator + Math.pow(currentCoordinate - secondPoint[index], 2),
      0
    );
    return Math.sqrt(squaredDifferencesSum);
  };

  const processGeometricData = (inputDetails) => {
    const { pointCount, coordinateSets } = inputDetails;
    let integerDistanceCounter = 0;

    const allUniqueIndexPairs = Array.from({ length: pointCount }, (_, i) =>
      Array.from({ length: pointCount - (i + 1) }, (_, k) => [i, i + 1 + k])
    ).flat();

    allUniqueIndexPairs.forEach(([idxA, idxB]) => {
      const pointA = coordinateSets[idxA];
      const pointB = coordinateSets[idxB];
      const currentDistance = calculateDistanceBetweenPoints(pointA, pointB);

      if (Number.isInteger(currentDistance)) {
        integerDistanceCounter++;
      }
    });

    return integerDistanceCounter;
  };

  const parsedData = parseInputData(sourceText);
  const finalResult = processGeometricData(parsedData);
  console.log(finalResult);
};

entryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));
