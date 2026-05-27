const displayPoint = (coord) => {
  console.log(coord.x.toFixed(8) + ' ' + coord.y.toFixed(8));
};

const ANGLE_RADIAN = 60 * Math.PI / 180;
const COS_VALUE = Math.cos(ANGLE_RADIAN);
const SIN_VALUE = Math.sin(ANGLE_RADIAN);

function* kochSegmentGenerator(recursionDepth, startPoint, endPoint) {
  if (recursionDepth === 0) {
    return;
  }

  const segmentDeltaX = endPoint.x - startPoint.x;
  const segmentDeltaY = endPoint.y - startPoint.y;

  const firstIntermediate = {
    x: startPoint.x + segmentDeltaX / 3,
    y: startPoint.y + segmentDeltaY / 3,
  };

  const secondIntermediate = {
    x: startPoint.x + (2 * segmentDeltaX) / 3,
    y: startPoint.y + (2 * segmentDeltaY) / 3,
  };

  const vectorComponentX = secondIntermediate.x - firstIntermediate.x;
  const vectorComponentY = secondIntermediate.y - firstIntermediate.y;

  const rotatedComponentX = vectorComponentX * COS_VALUE - vectorComponentY * SIN_VALUE;
  const rotatedComponentY = vectorComponentX * SIN_VALUE + vectorComponentY * COS_VALUE;

  const apexPoint = {
    x: firstIntermediate.x + rotatedComponentX,
    y: firstIntermediate.y + rotatedComponentY,
  };

  yield* kochSegmentGenerator(recursionDepth - 1, startPoint, firstIntermediate);
  yield firstIntermediate;
  yield* kochSegmentGenerator(recursionDepth - 1, firstIntermediate, apexPoint);
  yield apexPoint;
  yield* kochSegmentGenerator(recursionDepth - 1, apexPoint, secondIntermediate);
  yield secondIntermediate;
  yield* kochSegmentGenerator(recursionDepth - 1, secondIntermediate, endPoint);
}

(function entryPoint() {
  const inputLevel = Number(require('fs').readFileSync('/dev/stdin', 'utf8').trim());

  const initialStart = { x: 0, y: 0 };
  const initialEnd = { x: 100, y: 0 };

  displayPoint(initialStart);

  for (const point of kochSegmentGenerator(inputLevel, initialStart, initialEnd)) {
    displayPoint(point);
  }

  displayPoint(initialEnd);
})();
