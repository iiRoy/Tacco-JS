(function(inputStr) {
  const [parsedN, parsedX, parsedY] = inputStr.split(' ').map(Number);

  const determineDistance = (pointAlpha, pointBeta) => {
    return Math.min(pointBeta - pointAlpha, Math.abs(parsedX - pointAlpha) + Math.abs(parsedY - pointBeta) + 1);
  };

  Array.from({ length: parsedN - 1 }, (_, iterationIndex) => iterationIndex + 1)
    .forEach(currentIterationValue => {
      const totalMatches = Array.from({ length: parsedN - 1 }, (_, alphaIndex) => alphaIndex + 1)
        .flatMap(alphaValue =>
          Array.from({ length: parsedN - alphaValue }, (_, betaIndex) => alphaValue + 1 + betaIndex)
            .filter(betaValue => determineDistance(alphaValue, betaValue) === currentIterationValue)
        ).length;

      console.log(totalMatches);
    });

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
