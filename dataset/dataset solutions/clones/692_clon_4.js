const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const createDescendingSequence = (startPoint, endPoint) =>
  Array.from({ length: startPoint - endPoint + 1 }, (_, index) => startPoint - index);

const numericInputs = fileContent
  .trim()
  .split('\n')
  .map(Number)
  .filter(val => val !== 0);

numericInputs.forEach(currentValue => {
  const cubeOfCurrent = currentValue * currentValue * currentValue;

  const potentialDifferences = createDescendingSequence(currentValue - 1, 1)
    .flatMap(firstFactor =>
      createDescendingSequence(firstFactor, 1)
        .map(secondFactor =>
          cubeOfCurrent - (firstFactor * firstFactor * firstFactor) - (secondFactor * secondFactor * secondFactor)
        )
    )
    .filter(diffValue => diffValue > 0);

  console.log(Math.min(...potentialDifferences));
});
