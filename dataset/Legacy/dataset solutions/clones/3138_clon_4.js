const processInput = (sourceData) => {
  const lineSegments = sourceData.split('\n');

  const firstLineElements = lineSegments[0].split(' ');

  const coefficientArray = lineSegments[1].split(' ');

  const dataRows = lineSegments.slice(2);

  let positiveSumCount = 0;

  for (let rowIndex = 0; rowIndex < dataRows.length; rowIndex++) {
    const currentRowString = dataRows[rowIndex];
    const currentValues = currentRowString.split(' ');

    let rowWeightedSum = 0;

    for (let valIndex = 0; valIndex < currentValues.length; valIndex++) {
      rowWeightedSum += Number(currentValues[valIndex]) * Number(coefficientArray[valIndex]);
    }

    if (rowWeightedSum > 0) {
      positiveSumCount++;
    }
  }

  console.log(positiveSumCount);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
