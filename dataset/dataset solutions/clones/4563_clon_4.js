'use strict'

function processGridData(rawData) {
  const allLines = rawData.split('\n');

  const [dimHStr, dimWStr] = allLines[0].split(' ');
  const actualHeight = parseInt(dimHStr, 10);
  const actualWidth = parseInt(dimWStr, 10);

  const frameSymbol = '#';
  const totalRowLength = actualWidth + 2;

  const frameLine = frameSymbol.repeat(totalRowLength);

  const contentSegments = allLines.slice(1, actualHeight + 1).map(segment => {
    return frameSymbol + segment + frameSymbol;
  });

  const assembledOutput = [frameLine, ...contentSegments, frameLine].join('\n');

  console.log(assembledOutput);
}

processGridData(require("fs").readFileSync("/dev/stdin", "utf8"));
