'use strict';
(function(inputSource) {
  var rawData = inputSource.toString();

  var contentSegment = rawData.split('END_OF_TEXT');
  var relevantTextPart = contentSegment[0];
  var cleanedText = relevantTextPart.trim();
  var lineArrayForProcessing = cleanedText.split('\n');

  function calculateWordFrequency(processedLines) {
    var firstLineContent = processedLines.splice(0, 1)[0];
    var searchTargetWord = firstLineContent.toLowerCase();

    var remainingTextCombined = processedLines.join('');
    var individualWords = remainingTextCombined.split(' ');

    function isMatchingWord(candidateWord, target) {
      return candidateWord.toLowerCase() === target;
    }

    var matchingWordsArray = individualWords.filter(function(currentWord) {
      return isMatchingWord(currentWord, searchTargetWord);
    });

    var finalCount = matchingWordsArray.length;
    return finalCount;
  }

  var finalResult = calculateWordFrequency(lineArrayForProcessing);
  console.log(finalResult);

}(require('fs').readFileSync('/dev/stdin', 'utf8')));
