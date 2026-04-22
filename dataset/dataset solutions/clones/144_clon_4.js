const calculateDirection = (deltaX1, deltaY1, deltaX2, deltaY2) => deltaX1 * deltaY2 - deltaY1 * deltaX2;

const determineBend = (point1X, point1Y, point2X, point2Y, point3X, point3Y) => {
  const seg1X = point2X - point1X;
  const seg1Y = point2Y - point1Y;
  const seg2X = point3X - point2X;
  const seg2Y = point3Y - point2Y;
  return calculateDirection(seg1X, seg1Y, seg2X, seg2Y);
};

const evaluateShape = (coordAx, coordAy, coordBx, coordBy, coordCx, coordCy, coordDx, coordDy) => {
  const bendMeasurements = [
    determineBend(coordAx, coordAy, coordBx, coordBy, coordCx, coordCy),
    determineBend(coordBx, coordBy, coordCx, coordCy, coordDx, coordDy),
    determineBend(coordCx, coordCy, coordDx, coordDy, coordAx, coordAy),
    determineBend(coordDx, coordDy, coordAx, coordAy, coordBx, coordBy)
  ];

  const valueSigns = bendMeasurements.map(Math.sign);

  const initialSign = valueSigns[0];

  const allConsistentAndNonZero = valueSigns.every(s => s === initialSign && s !== 0);

  return allConsistentAndNonZero ? 'YES' : 'NO';
};

((rawTextStream) => {
  const lineCollection = rawTextStream.trim().split('\n');
  lineCollection.forEach(singleLine => {
    const numericalCoordinates = singleLine.split(',').map(Number);
    const [p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y] = numericalCoordinates;
    console.log(evaluateShape(p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y));
  });
})(require('fs').readFileSync('/dev/stdin', 'utf8'));