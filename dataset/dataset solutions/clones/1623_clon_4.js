const processCoordinates = (sourceText) => {
  const numericValues = sourceText.match(/-?\d+/g).map(Number);

  const initialQuantity = numericValues[0];
  const proximityLimit = numericValues[1];

  const coordinateDatum = numericValues.slice(2);

  const squaredProximity = proximityLimit * proximityLimit;

  const qualifyingPointsCount = Array.from({ length: initialQuantity }, (_, index) => {
    const firstComponent = coordinateDatum[index * 2];
    const secondComponent = coordinateDatum[index * 2 + 1];
    return { horizontal: firstComponent, vertical: secondComponent };
  })
  .filter(datum => (datum.horizontal * datum.horizontal + datum.vertical * datum.vertical) <= squaredProximity)
  .length;

  return qualifyingPointsCount;
};

const inputDataStream = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(processCoordinates(inputDataStream));