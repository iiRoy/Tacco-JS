const rotateMatrix = (sourceGrid) =>
  Array.from({ length: 8 }, (_, newRowIndex) =>
    Array.from({ length: 8 }, (_, newColumnIndex) =>
      sourceGrid[7 - newColumnIndex][newRowIndex]
    )
  );

const fileSystem = require('fs');
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputContent.trim().split('\n');

const initialGridState = inputLines.slice(0, 8).map(lineSegment => lineSegment.split(''));

const rotationSequence = [
  { label: "90" },
  { label: "180" },
  { label: "270" }
];

rotationSequence.reduce((currentGrid, rotationStep) => {
  const nextGridState = rotateMatrix(currentGrid);
  console.log(`${rotationStep.label}\n${nextGridState.join('\n')}`);
  return nextGridState;
}, initialGridState);
