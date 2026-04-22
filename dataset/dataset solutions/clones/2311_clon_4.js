const retrieveOutcome = (parameters) => {
  const [limit, firstCoord, secondCoord] = parameters.map(Number);

  const difference = secondCoord - firstCoord;
  const tablesBetween = difference - 1;

  const leftBoundaryDistance = firstCoord - 1;
  const rightBoundaryDistance = limit - secondCoord;
  const isLeftCloser = leftBoundaryDistance <= rightBoundaryDistance;

  const decisionPathways = [
    (d, tb, lbd, rbd, lc) => (d === 2) ? 1 : null,
    (d, tb, lbd, rbd, lc) => (tb % 2 !== 0) ? Math.abs(firstCoord - secondCoord) / 2 : null,
    (d, tb, lbd, rbd, lc) => (lc && tb >= 4) ? secondCoord - 3 : null,
    (d, tb, lbd, rbd, lc) => (lc && tb === 2) ? firstCoord + 1 : null,
    (d, tb, lbd, rbd, lc) => (lc && tb === 0) ? secondCoord - 1 : null,
    (d, tb, lbd, rbd, lc) => (!lc && tb >= 4) ? limit - firstCoord - 2 : null,
    (d, tb, lbd, rbd, lc) => (!lc && tb === 2) ? limit - secondCoord + 2 : null,
    (d, tb, lbd, rbd, lc) => (!lc && tb === 0) ? limit - firstCoord : null,
  ];

  for (const path of decisionPathways) {
    const result = path(difference, tablesBetween, leftBoundaryDistance, rightBoundaryDistance, isLeftCloser);
    if (result !== null) {
      return result;
    }
  }
  return null;
};

const rawInput = process.argv.slice(2);
const processedResult = retrieveOutcome(rawInput);
console.log(processedResult);