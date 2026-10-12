'use strict';
(function(inputData) {
  var inputLines = inputData.toString().split('\n');
  var endOfInputMarker = '0';
  const DECIMAL_PRECISION = 8;

  var endMarkerIndex = inputLines.indexOf(endOfInputMarker);
  var rawDataSegments = inputLines.slice(0, endMarkerIndex);

  var finalOutput = (function calculateAllStandardDeviations(segments) {
    var calculatedDeviations = [];
    var totalSegments = segments.length;

    for (var segmentIndex = 0; segmentIndex < totalSegments; segmentIndex += 2) {
      var currentCountString = segments[segmentIndex];
      var currentScoresString = segments[segmentIndex + 1];

      var actualCount = parseInt(currentCountString, 10);
      var parsedScoresArray = currentScoresString.split(' ').map(Number);

      calculatedDeviations.push(computeStandardDeviation(actualCount, parsedScoresArray));
    }
    return calculatedDeviations.join('\n');

    function computeStandardDeviation(sampleSize, scoreValues) {
      var relevantScores = scoreValues.slice(0, sampleSize);

      var sumOfRelevantScores = relevantScores.reduce(function(accumulator, currentValue) {
        return accumulator + currentValue;
      }, 0);

      var averageValue = sumOfRelevantScores / sampleSize;

      var squaredDifferences = relevantScores.map(function(scoreItem) {
        return Math.pow(scoreItem - averageValue, 2);
      });

      var sumOfSquaredDifferences = squaredDifferences.reduce(function(accumulator, currentValue) {
        return accumulator + currentValue;
      }, 0);

      var variance = sumOfSquaredDifferences / sampleSize;
      var stdDevResult = Math.sqrt(variance);

      return stdDevResult.toFixed(DECIMAL_PRECISION);
    }
  }(rawDataSegments));

  console.log(finalOutput);
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
