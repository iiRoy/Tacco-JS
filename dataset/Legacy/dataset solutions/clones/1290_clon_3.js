'use strict';
(function(inputSource) {
  function evaluateThirdComponent(componentCScore) {
    if (componentCScore >= 50) {
      return 'C';
    } else {
      return 'D';
    }
  }

  function calculateFinalAssessment(componentScores) {
    const firstScore = componentScores[0];
    const secondScore = componentScores[1];

    if (firstScore === -1 || secondScore === -1) {
      return 'F';
    }

    const cumulativeScore = firstScore + secondScore;

    const scoreBoundaries = [80, 65, 50, 30, 0];
    
    const thirdComponentGrade = evaluateThirdComponent(componentScores[2]);
    
    const gradeDesignations = ['A', 'B', 'C', thirdComponentGrade, 'F'];

    for (let boundaryIndex = 0; boundaryIndex < scoreBoundaries.length; boundaryIndex++) {
      if (cumulativeScore >= scoreBoundaries[boundaryIndex]) {
        return gradeDesignations[boundaryIndex];
      }
    }
    return 'F';
  }

  const parseScoreLine = (inputLine) => {
    return inputLine.split(' ').map(Number);
  };

  const rawInputContent = inputSource.toString().trim();
  const rawInputLines = rawInputContent.split('\n');

  const sentinelValue = '-1 -1 -1';
  let endMarkerIndex = rawInputLines.indexOf(sentinelValue);
  if (endMarkerIndex === -1) {
      endMarkerIndex = rawInputLines.length;
  }

  const scoreLinesToProcess = rawInputLines.slice(0, endMarkerIndex);
  const parsedScoreSets = scoreLinesToProcess.map(parseScoreLine);

  console.log(parsedScoreSets.map(calculateFinalAssessment).join('\n'));
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
