function processData(inputContent) {
  const dataLines = inputContent.split('\n');
  const iterationLimit = Number(dataLines[0]);
  const sourceString = dataLines[1];

  const relevantSegment = sourceString.slice(0, iterationLimit);

  const foundMatches = relevantSegment.match(/ABC/g);

  const finalCount = foundMatches ? foundMatches.length : 0;

  console.log(finalCount);
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
