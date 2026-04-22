const rawSource = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const numericalItems = rawSource.match(/-?\d+(\.\d+)?/g);
const numericalElements = numericalItems.map(Number);

const divideIntoBlocks = (sourceArray, blockSize) =>
  sourceArray.reduce((accumulatedBlocks, currentElement, index) => {
    const blockIndex = Math.floor(index / blockSize);
    if (!accumulatedBlocks[blockIndex]) {
      accumulatedBlocks[blockIndex] = [];
    }
    accumulatedBlocks[blockIndex].push(currentElement);
    return accumulatedBlocks;
  }, []);

const groupedParameters = divideIntoBlocks(numericalElements, 6);

const computeSolutions = (coefficientArray) => {
  const [p1, p2, p3, p4, p5, p6] = coefficientArray;

  const resultCoordY = (p3 * p4 - p1 * p6) / (p2 * p4 - p1 * p5);
  const resultCoordX = (p3 - p2 * resultCoordY) / p1;

  const finalSolutionX = Math.round(resultCoordX * 1000) / 1000;
  const finalSolutionY = Math.round(resultCoordY * 1000) / 1000;

  return { coordX: finalSolutionX, coordY: finalSolutionY };
};

const outputCollection = groupedParameters.map(group => {
  const { coordX, coordY } = computeSolutions(group);
  return `${coordX.toFixed(3)} ${coordY.toFixed(3)}`;
});

console.log(outputCollection.join('\n'));