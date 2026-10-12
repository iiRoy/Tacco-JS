const sq = (val) => val * val;

const calculateSquaredDistance = (pA, pB) => sq(pA.x - pB.x) + sq(pA.y - pB.y);

const getMidpoint = (pA, pB) => ({
  x: (pA.x + pB.x) / 2,
  y: (pA.y + pB.y) / 2,
});

const isPointWithinCircle = (point, circleCenter, circleRadiusSq, tolerance) =>
  calculateSquaredDistance(point, circleCenter) <= circleRadiusSq + tolerance;

const checkAllPointsEnclosed = (allPoints, circleCenter, circleRadiusSq, tolerance) =>
  allPoints.every((p) => isPointWithinCircle(p, circleCenter, circleRadiusSq, tolerance));

const determineCircleFromDiameter = (pA, pB) => {
  const center = getMidpoint(pA, pB);
  const radiusSq = calculateSquaredDistance(pA, center);
  return { center, radiusSq };
};

const determineCircumcircle = (pI, pJ, pK) => {
  const xi = pI.x, yi = pI.y;
  const xj = pJ.x, yj = pJ.y;
  const xk = pK.x, yk = pK.y;

  const denom = 2 * ((xk - xi) * (yi - yj) - (xj - xi) * (yi - yk));

  const cyNumerator = (xk - xi) * (sq(xi) + sq(yi) - sq(xj) - sq(yj)) - (xj - xi) * (sq(xi) + sq(yi) - sq(xk) - sq(yk));
  const cy = cyNumerator / denom;

  let cx;
  if (xi !== xj) {
    cx = (2 * (yi - yj) * cy - sq(xi) - sq(yi) + sq(xj) + sq(yj)) / (2 * (xj - xi));
  } else {
    cx = (2 * (yi - yk) * cy - sq(xi) - sq(yi) + sq(xk) + sq(yk)) / (2 * (xk - xi));
  }

  const center = { x: cx, y: cy };
  const radiusSq = calculateSquaredDistance(pI, center);
  return { center, radiusSq };
};

function* getIndexCombinations(n, k) {
  const indices = Array.from({ length: n }, (_, i) => i);
  function* generate(startIdx, currentCombo) {
    if (currentCombo.length === k) {
      yield currentCombo;
      return;
    }
    for (let i = startIdx; i < n; i++) {
      yield* generate(i + 1, [...currentCombo, indices[i]]);
    }
  }
  yield* generate(0, []);
}

function solveMEC(inputString) {
  const lines = inputString.split("\n");
  const pointCount = parseInt(lines[0]);
  const allPoints = lines.slice(1, pointCount + 1).map((line) => {
    const coords = line.split(" ").map(Number);
    return { x: coords[0], y: coords[1] };
  });

  const TOLERANCE = 0.000001;

  if (pointCount === 2) {
    const p1 = allPoints[0];
    const p2 = allPoints[1];
    const circle = determineCircleFromDiameter(p1, p2);
    return Math.sqrt(circle.radiusSq);
  }

  let minimumEnclosingRadius = 0;

  for (const [idxI, idxJ, idxK] of getIndexCombinations(pointCount, 3)) {
    const pI = allPoints[idxI];
    const pJ = allPoints[idxJ];
    const pK = allPoints[idxK];

    const dIJ_sq = calculateSquaredDistance(pI, pJ);
    const dIK_sq = calculateSquaredDistance(pI, pK);
    const dJK_sq = calculateSquaredDistance(pJ, pK);

    const edges = [
      { distSq: dIJ_sq, p1: pI, p2: pJ },
      { distSq: dIK_sq, p1: pI, p2: pK },
      { distSq: dJK_sq, p1: pJ, p2: pK },
    ];
    edges.sort((a, b) => b.distSq - a.distSq);

    let candidateCircle;
    if (edges[0].distSq > edges[1].distSq + edges[2].distSq + TOLERANCE) {
      candidateCircle = determineCircleFromDiameter(edges[0].p1, edges[0].p2);
    } else {
      candidateCircle = determineCircumcircle(pI, pJ, pK);
    }

    if (checkAllPointsEnclosed(allPoints, candidateCircle.center, candidateCircle.radiusSq, TOLERANCE)) {
      minimumEnclosingRadius = Math.sqrt(candidateCircle.radiusSq);
      break;
    }
  }

  return minimumEnclosingRadius;
}

function Main(input) {
  const result = solveMEC(input);
  console.log('%s', result);
  return result;
}

function debug(n){
  var input = document.getElementById("input"+n).value;
  var ans=Main(input);
  var result="WA";
  if(ans==document.getElementById("output"+n).value.split("\n")[0]){
    result="AC";
  }
  document.getElementById("result"+n).innerHTML=result;
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
