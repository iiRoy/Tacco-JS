const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');

sourceData.split('\n')
  .filter(lineSegment => lineSegment.trim() !== '' && lineSegment !== '0 0')
  .forEach(dimensionString => {
    const numericDimensions = dimensionString.split(' ').map(Number);
    const gridHeight = numericDimensions[0];
    const gridWidth = numericDimensions[1];

    Array.from({ length: gridHeight }, (_, rowIdentifier) => {
      return Array.from({ length: gridWidth }, (_, colIdentifier) => {
        return (rowIdentifier % 2) === (colIdentifier % 2) ? '#' : '.';
      }).join('');
    }).forEach(constructedLine => {
      console.log(constructedLine);
    });

    console.log();
  });
