const entryPoint = (sourceData) => {
  const lineSegments = sourceData.trim().split('\n');
  const dimensions = lineSegments[0].split(' ');
  const gridHeight = Number(dimensions[0]);
  const gridWidth = Number(dimensions[1]);

  const visualGrid = lineSegments.slice(1).map(section => section.split(''));

  const rowOffsets = [-1, 1, 0, 0];
  const colOffsets = [0, 0, -1, 1];

  const checkNeighborhood = (rPos, cPos) => {
    return rowOffsets.some((rDelta, idx) => {
      const cDelta = colOffsets[idx];
      const nextR = rPos + rDelta;
      const nextC = cPos + cDelta;

      const inBounds = nextR >= 0 && nextR < gridHeight && nextC >= 0 && nextC < gridWidth;

      return inBounds && visualGrid[nextR][nextC] === '#';
    });
  };

  const finalVerdict = visualGrid.every((rowArray, rIndex) => {
    return rowArray.every((charElement, cIndex) => {
      return checkNeighborhood(rIndex, cIndex);
    });
  });

  console.log(finalVerdict ? "Yes" : "No");
};

entryPoint(require('fs').readFileSync('/dev/stdin', 'utf-8'));