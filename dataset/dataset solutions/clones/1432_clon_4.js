function processInputData(inputLines) {
  const searchCriterion = inputLines[0];
  const dataSegments = inputLines.slice(1);

  const totalMatches = dataSegments.reduce((accumulator, currentSegment) => {
    const lexicalUnits = currentSegment.split(/\s+/);

    const segmentMatchCount = lexicalUnits.reduce((segmentAcc, unit) => {
      return unit === searchCriterion ? segmentAcc + 1 : segmentAcc;
    }, 0);

    return accumulator + segmentMatchCount;
  }, 0);

  console.log(totalMatches);
}

let receivedDataFragments = [];
process.stdin.on('data', (dataFragment) => {
  receivedDataFragments.push(dataFragment);
});
process.stdin.on('end', () => {
  const processedTextLines = receivedDataFragments.join('').split('\n');
  processInputData(processedTextLines);
});
