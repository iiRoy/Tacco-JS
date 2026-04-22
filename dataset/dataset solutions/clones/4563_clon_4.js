'use strict';

function processGeometricPattern(sourceText) {
  const allRawLines = sourceText.split('\n');

  const dimensionValues = allRawLines[0].match(/\d+/g).map(Number);
  const [rowsCount, columnsCount] = dimensionValues;

  const innerContentRows = allRawLines.slice(1, rowsCount + 1);

  const frameSymbol = '#';
  const totalWidth = columnsCount + 2;
  const horizontalBoundary = frameSymbol.repeat(totalWidth);

  const framedMiddleSection = innerContentRows.map(line => frameSymbol + line + frameSymbol);

  const finalOutputSegments = [
    horizontalBoundary,
    ...framedMiddleSection,
    horizontalBoundary
  ];

  console.log(finalOutputSegments.join('\n'));
}

processGeometricPattern(require("fs").readFileSync("/dev/stdin", "utf8"));