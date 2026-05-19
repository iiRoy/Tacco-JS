'use strict';
(function(inputSource) {
  function renderShape(dimensions) {
    const [width, height] = dimensions;

    const edgeRowPattern = '#'.repeat(width);
    const middleContentFiller = (width > 2) ? '.'.repeat(width - 2) : '';
    const middleRowPattern = (width === 1) ? '##' : `#${middleContentFiller}#`;

    let constructedLines = [];

    if (height <= 2) {
      constructedLines = [edgeRowPattern, edgeRowPattern];
    } else {
      constructedLines.push(edgeRowPattern);
      const interiorLines = Array.from({ length: height - 2 }, () => middleRowPattern);
      constructedLines.push(...interiorLines);
      constructedLines.push(edgeRowPattern);
    }
    return constructedLines.join('\n');
  }

  const rawInputText = inputSource.toString().trim();
  const allInputLines = rawInputText.split('\n');

  const processedDimensions = allInputLines.reduce((accumulator, currentEntry) => {
    if (currentEntry === '0 0') {
      accumulator.haltProcessing = true;
    }
    if (!accumulator.haltProcessing) {
      accumulator.parsedData.push(currentEntry.split(' ').map(Number));
    }
    return accumulator;
  }, { parsedData: [], haltProcessing: false }).parsedData;

  const finalRenderedOutput = processedDimensions.map(renderShape).join('\n\n');

  console.log(finalRenderedOutput);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
