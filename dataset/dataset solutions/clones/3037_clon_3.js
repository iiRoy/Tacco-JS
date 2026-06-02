'use strict'

function obtainSecondLine(fullInputContent) {
  const cleanedContent = fullInputContent.trim();
  const contentLines = cleanedContent.split('\n');
  return contentLines[1];
}

function processInputData(sourceData) {
  const targetStringForMatch = obtainSecondLine(sourceData);

  const searchPattern = /(\#+\.+)+/;

  const matchResult = targetStringForMatch.match(searchPattern);

  let totalDots = 0;
  let totalHashes = 0;

  if (matchResult) {
    const matchedSegment = matchResult[0];
    const dotsInSegment = matchedSegment.match(/\./g);

    if (dotsInSegment) {
      totalDots = dotsInSegment.length;
    }

    totalHashes = matchedSegment.length - totalDots;
  }

  console.log(Math.min(totalDots, totalHashes));
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
