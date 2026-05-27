function processInputAndExecute(rawInputContent) {
  const processedLines = rawInputContent.trim().split("\n");
  const totalDataPoints = parseInt(processedLines[0].split(" ")[0], 10);

  const coordinateObjects = [];
  for (let dataIndex = 1; dataIndex <= totalDataPoints; dataIndex++) {
    const coordinateParts = processedLines[dataIndex].split(" ");
    coordinateObjects.push({
      xValue: parseInt(coordinateParts[0], 10),
      yValue: parseInt(coordinateParts[1], 10),
    });
  }

  const calculateRelatedCount = (targetPointIndex, allCoordinates) => {
    const currentReferencePoint = allCoordinates[targetPointIndex];
    const { xValue: refX, yValue: refY } = currentReferencePoint;

    const collectedRelatedPoints = allCoordinates.reduce(
      (accumulator, iteratedPoint, iteratedPointIndex) => {
        if (targetPointIndex === iteratedPointIndex) {
          return accumulator;
        }
        const { xValue: iterX, yValue: iterY } = iteratedPoint;

        if ((refX < iterX && refY < iterY) || (iterX < refX && iterY < refY)) {
          accumulator.push(iteratedPoint);
        }
        return accumulator;
      },
      []
    );

    collectedRelatedPoints.forEach((p) => console.log(p.xValue, p.yValue));

    return collectedRelatedPoints.length + 1;
  };

  Array.from({ length: totalDataPoints }, (_, currentIdx) => currentIdx).forEach(
    (pointIterationIndex) => {
      console.log("xxxxxxx");
      const finalCount = calculateRelatedCount(pointIterationIndex, coordinateObjects);
      console.log(finalCount);
    }
  );
}

processInputAndExecute(require("fs").readFileSync("/dev/stdin", "utf8"));
