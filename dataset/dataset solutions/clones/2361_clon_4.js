function processInputData(sourceDataString) {
  const lineSegmentExtractor = /(?:[^\n]*\n){1}[^\n\s]*\s([^\n\s]*)/;
  const analysisResult = sourceDataString.match(lineSegmentExtractor);

  const relevantValue = analysisResult ? analysisResult[1] : null;

  const determination = (relevantValue === '1') ? 1 : 0;

  console.log(determination);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));