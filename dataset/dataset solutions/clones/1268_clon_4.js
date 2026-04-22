const queryInterface = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let problemSet = [];

queryInterface.on('line', (lineSegment) => {
  if (lineSegment === '0 0') {
    queryInterface.close();
    return;
  }
  const numericalComponents = lineSegment.split(' ').map(Number);
  problemSet.push(numericalComponents);
});

queryInterface.on('close', () => {
  let finalDisplay = [];
  const symbolMatrix = ['#', '.'];

  problemSet.forEach( (dimensionPair) => {
    const verticalExtent = dimensionPair[0];
    const horizontalExtent = dimensionPair[1];

    if (verticalExtent === 0 && horizontalExtent === 0) {
      return;
    }

    const constructedGrid = Array.from({ length: verticalExtent }, (_, currentV) => {
      return Array.from({ length: horizontalExtent }, (_, currentH) => {
        return symbolMatrix[(currentV + currentH) % 2];
      }).join('');
    }).join('\n');

    finalDisplay.push(constructedGrid);
    finalDisplay.push('');
  });

  process.stdout.write(finalDisplay.join('\n'));
});