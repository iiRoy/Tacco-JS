const inputHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputHandler.on('line', (currentInputLine) => {
  const coordinateValues = currentInputLine.split(' ').map(strVal => parseInt(strVal, 10));
  const [firstX, firstY, secondX, secondY] = coordinateValues;
  const xDifference = firstX - secondX;
  const yDifference = firstY - secondY;
  const computedDistance = Math.hypot(xDifference, yDifference);
  console.log(computedDistance.toFixed(8));
  process.exit();
});
