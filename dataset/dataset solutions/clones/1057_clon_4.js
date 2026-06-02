const ANGLE_RAD = Math.PI / 3;
const COS_VAL = Math.cos(ANGLE_RAD);
const SIN_VAL = Math.sin(ANGLE_RAD);

const makeCoord = (cx, cy) => ({ cx, cy });

const displayCoord = (pt) => {
  console.log(pt.cx.toFixed(8) + ' ' + pt.cy.toFixed(8));
};

const computeSegmentPoints = (startPt, endPt) => {
  const deltaX = endPt.cx - startPt.cx;
  const deltaY = endPt.cy - startPt.cy;

  const pointS = makeCoord(startPt.cx + deltaX / 3, startPt.cy + deltaY / 3);

  const pointT = makeCoord(startPt.cx + deltaX * 2 / 3, startPt.cy + deltaY * 2 / 3);

  const segmentDx = pointT.cx - pointS.cx;
  const segmentDy = pointT.cy - pointS.cy;

  const rotatedX = segmentDx * COS_VAL - segmentDy * SIN_VAL;
  const rotatedY = segmentDx * SIN_VAL + segmentDy * COS_VAL;
  const pointU = makeCoord(pointS.cx + rotatedX, pointS.cy + rotatedY);

  return {
    pointS,
    pointU,
    pointT,
  };
};

function* kochPointSequence(currentDepth, startPt, endPt) {
  if (currentDepth === 0) {
    return;
  }

  const { pointS, pointU, pointT } = computeSegmentPoints(startPt, endPt);

  yield* kochPointSequence(currentDepth - 1, startPt, pointS);
  yield pointS;

  yield* kochPointSequence(currentDepth - 1, pointS, pointU);
  yield pointU;

  yield* kochPointSequence(currentDepth - 1, pointU, pointT);
  yield pointT;

  yield* kochPointSequence(currentDepth - 1, pointT, endPt);
}

(function mainExecution() {
  const inputN = Number(require('fs').readFileSync('/dev/stdin', 'utf8').trim());

  const initialA = makeCoord(0, 0);
  const initialB = makeCoord(100, 0);

  displayCoord(initialA);

  for (const currentPoint of kochPointSequence(inputN, initialA, initialB)) {
    displayCoord(currentPoint);
  }

  displayCoord(initialB);
})();
