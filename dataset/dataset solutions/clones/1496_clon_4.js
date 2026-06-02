function processInputAndGenerateOutput(rawText) {
  const lineSegments = rawText.split("\n");

  const pointQuantity = Number(lineSegments[0].split(" ")[0]);

  const pointCollection = lineSegments.slice(1, pointQuantity + 1).map(line =>
    line.split(" ").map(Number)
  );

  const computeRelatedCount = (idxA, allPoints) => {
    const [coordAX, coordAY] = allPoints[idxA];

    const relatedTally = allPoints.reduce((accumulator, currentPoint, idxB) => {
      if (idxA === idxB) {
        return accumulator;
      }

      const [coordBX, coordBY] = currentPoint;

      if ((coordAX < coordBX && coordAY < coordBY) || (coordBX < coordAX && coordBY < coordAY)) {
        return accumulator + 1;
      }
      return accumulator;
    }, 1);

    return relatedTally;
  };

  const allResults = Array.from({ length: pointQuantity }, (_, currentIdx) =>
    computeRelatedCount(currentIdx, pointCollection)
  );

  allResults.forEach(res => console.log(res));
}

processInputAndGenerateOutput(require("fs").readFileSync("/dev/stdin", "utf8"));
