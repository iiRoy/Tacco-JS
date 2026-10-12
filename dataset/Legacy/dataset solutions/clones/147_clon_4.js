(function(rawInput) {
  const inputBlocks = rawInput.replace(/\n$/, '').split('\n\n');

  inputBlocks.forEach(blockContent => {
    const currentGrid = blockContent.split('\n').map(rowString =>
      rowString.split('').map(Number)
    );
    console.log(identifyStructure(currentGrid));
  });

})(require('fs').readFileSync('/dev/stdin', 'utf8'));

const isCoordinateValid = (xCoord, yCoord) => {
  return !(xCoord < 0 || xCoord > 8 || yCoord < 0 || yCoord > 8);
};

const shapeDefinitions = [
  { id: 'A', relativeOffsets: [[1, 0], [0, 1], [1, 1]] },
  { id: 'B', relativeOffsets: [[0, 1], [0, 2], [0, 3]] },
  { id: 'C', relativeOffsets: [[1, 0], [2, 0], [3, 0]] },
  { id: 'D', relativeOffsets: [[0, 1], [-1, 1], [-1, 2]] },
  { id: 'E', relativeOffsets: [[1, 0], [1, 1], [2, 1]] },
  { id: 'F', relativeOffsets: [[0, 1], [1, 1], [1, 2]] },
  { id: 'G', relativeOffsets: [[1, 0], [0, 1], [-1, 1]] },
];

const identifyStructure = (gridData) => {
  let foundOrigin = null;

  gridData.some((row, yIndex) =>
    row.some((cellValue, xIndex) => {
      if (cellValue === 1) {
        foundOrigin = { x: xIndex, y: yIndex };
        return true;
      }
      return false;
    })
  );

  if (foundOrigin) {
    return determineShapeAtOrigin(foundOrigin.x, foundOrigin.y);
  }
  return undefined;
};

const determineShapeAtOrigin = (originX, originY) => {
  for (const currentShape of shapeDefinitions) {
    const allOffsetsAreValid = currentShape.relativeOffsets.every(offsetPair => {
      const targetX = originX + offsetPair[0];
      const targetY = originY + offsetPair[1];
      return isCoordinateValid(targetX, targetY);
    });

    if (allOffsetsAreValid) {
      return currentShape.id;
    }
  }
  return undefined;
};
