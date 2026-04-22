let ingressAccumulator = '';
const sourceStream = process.stdin;
sourceStream.resume();
sourceStream.setEncoding('utf8');

sourceStream.on('data', (pieceOfData) => {
  ingressAccumulator += pieceOfData;
});

sourceStream.on('end', () => {
  const completeTextSegments = ingressAccumulator.trim().split('\n');

  const dimensionParameters = completeTextSegments[0].split(' ').map(Number);
  const columnCount = dimensionParameters[1];

  const dataInputSegments = completeTextSegments.slice(1);

  const processingContext = {
    compiledOutputUnits: [],
    columnTotals: Array(columnCount).fill(0),
    absoluteGrandTotal: 0,
  };

  const finalSummaryState = dataInputSegments.reduce((currentContext, currentSegmentString) => {
    const numericEntities = currentSegmentString.split(' ').map(Number);
    const lineItemSum = numericEntities.reduce((aggregator, value) => aggregator + value, 0);

    numericEntities.forEach((value, index) => {
      currentContext.columnTotals[index] += value;
    });

    currentContext.absoluteGrandTotal += lineItemSum;

    const currentLineResult = [...numericEntities, lineItemSum].join(' ');
    currentContext.compiledOutputUnits.push(currentLineResult);

    return currentContext;
  }, processingContext);

  const finalColumnAndGrandTotalRow = [...finalSummaryState.columnTotals, finalSummaryState.absoluteGrandTotal];
  const finalSummaryDisplay = finalColumnAndGrandTotalRow.join(' ');
  finalSummaryState.compiledOutputUnits.push(finalSummaryDisplay);

  console.log(finalSummaryState.compiledOutputUnits.join('\n'));
});