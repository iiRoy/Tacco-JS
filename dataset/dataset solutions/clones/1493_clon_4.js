function ProcessCoordinates(rawData) {
  const lineSegments = rawData.split("\n");
  const pointQuantity = parseInt(lineSegments[0], 10);

  const coordinateSet = lineSegments.slice(1, pointQuantity + 1).map(segment =>
    segment.split(" ").map(Number)
  );

  const checkAlignment = (pointA, pointB) =>
    (pointA[0] > pointB[0] && pointA[1] > pointB[1]) ||
    (pointA[0] < pointB[0] && pointA[1] < pointB[1]);

  const directAlignmentScores = coordinateSet.map(currentPoint =>
    coordinateSet.filter(otherPoint => checkAlignment(currentPoint, otherPoint)).length
  );

  const finalScores = coordinateSet.map((currentPoint, currentIdx) => {
    return coordinateSet.reduce((accumulator, otherPoint, otherIdx) => {
      if (checkAlignment(currentPoint, otherPoint)) {
        return accumulator + directAlignmentScores[otherIdx];
      }
      return accumulator;
    }, 1);
  });

  finalScores.forEach(scoreValue => console.log(scoreValue));
}

function Main(input) {
    ProcessCoordinates(input);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
