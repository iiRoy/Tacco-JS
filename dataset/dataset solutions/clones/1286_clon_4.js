const streamProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let lineCounter = 0;
let firstDimension = 0;
let secondDimension = 0;
let numericalGrid = [];
let scalarSequence = [];
let currentOperationPhase = 'determine_sizes';

streamProcessor.on('line', (textualLine) => {
  lineCounter++;

  if (currentOperationPhase === 'determine_sizes') {
    const parsedValues = textualLine.split(' ').map(Number);
    firstDimension = parsedValues[0];
    secondDimension = parsedValues[1];
    currentOperationPhase = 'populate_grid';
    return;
  }

  if (currentOperationPhase === 'populate_grid') {
    const gridRowContent = textualLine.split(' ').map(Number);
    numericalGrid.push(gridRowContent);
    if (numericalGrid.length === firstDimension) {
      currentOperationPhase = 'populate_sequence';
    }
    return;
  }

  if (currentOperationPhase === 'populate_sequence') {
    const singleScalarValue = Number(textualLine.trim());
    scalarSequence.push(singleScalarValue);
    if (scalarSequence.length === secondDimension) {
      streamProcessor.close();
    }
    return;
  }
});

streamProcessor.on('close', () => {
  const computedResultCollection = numericalGrid.map(eachGridRow => {
    const rowAccumulation = eachGridRow.reduce((totalSum, gridCellEntry, entryIndex) => {
      return totalSum + (gridCellEntry * scalarSequence[entryIndex]);
    }, 0);
    return rowAccumulation;
  });

  computedResultCollection.forEach(finalOutputValue => {
    console.log(finalOutputValue);
  });
});