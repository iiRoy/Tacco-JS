'use strict';
(function (inputSource) {
  let rawSegments = inputSource.toString().split('\n');
  const terminationMarker = 'STOP';
  let finalReport = (function (inputRecords) {
    let collectedMetrics = [];
    for (let idx = 0, countOfRecords = inputRecords.length; idx < countOfRecords; idx += 2) {
      collectedMetrics.push(computeStdDeviation(inputRecords[idx], inputRecords[idx + 1].split(' ').map(parseFloat)));
    }
    return collectedMetrics.join('\n');
    function computeStdDeviation(sampleSize, valueSet) {
      let averageValue = valueSet.slice(0, sampleSize)
        .reduce(function (accum, current) {
          return accum + current;
        }) / sampleSize;
      return Math.sqrt(valueSet.slice(0, sampleSize)
        .map(function (item) {
          return Math.pow(item - averageValue, 2);
        })
        .reduce(function (accum, current) {
          return accum + current;
        }) / sampleSize).toFixed(8);
    }
  }(rawSegments.slice(0, rawSegments.indexOf(terminationMarker))));
  console.log(finalReport);
}(require('fs').readFileSync('/dev/stdin', 'utf8')));