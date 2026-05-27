var sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
var initialSequence = sourceData.trim();

var targetPattern = "AIZUNYAN";
var sortedTargetPattern = Array.from(targetPattern).sort().join('');
var patternLength = 8;

var transformSequence = (sourceText) => {
  var { finalResult: processedOutput } = Array.from({ length: sourceText.length + patternLength - 1 }).reduce(
    ({ finalResult, currentPosition }, _, __) => {
      if (currentPosition >= sourceText.length) {
        return { finalResult, currentPosition };
      }

      if (currentPosition > sourceText.length - patternLength) {
        return {
          finalResult: finalResult + sourceText.substring(currentPosition),
          currentPosition: sourceText.length,
        };
      }

      var segment = sourceText.substring(currentPosition, currentPosition + patternLength);

      if (segment === targetPattern) {
        return {
          finalResult: finalResult + targetPattern,
          currentPosition: currentPosition + patternLength,
        };
      }

      var sortedSegment = Array.from(segment).sort().join('');
      if (sortedSegment === sortedTargetPattern) {
        return {
          finalResult: finalResult + targetPattern,
          currentPosition: currentPosition + patternLength,
        };
      }

      return {
        finalResult: finalResult + sourceText[currentPosition],
        currentPosition: currentPosition + 1,
      };
    },
    { finalResult: '', currentPosition: 0 }
  );
  return processedOutput;
};

console.log(transformSequence(initialSequence));
