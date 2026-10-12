function processRawData(rawData) {
  const extractedElements = [];

  rawData.split('\n').forEach(lineSegment => {
    const segmentParts = lineSegment.split(' ');
    segmentParts.forEach(elementValue => extractedElements.push(elementValue));
  });

  return extractedElements;
}

function acquireSourceData() {
  return processRawData(require('fs').readFileSync('/dev/stdin', 'utf8'));
}

(function executePrimaryLogic() {
  const processedData = acquireSourceData();
  const firstNumericValue = +processedData[0];
  const secondNumericValue = +processedData[1];

  const finalOutcome = secondNumericValue + 100 * (10 - firstNumericValue);
  console.log(finalOutcome);
})();
