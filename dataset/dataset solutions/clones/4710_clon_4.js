function determineOutcome(gameData) {
  const contentUntilNewline = gameData.indexOf('\n');
  const activeLine = contentUntilNewline !== -1 ? gameData.substring(0, contentUntilNewline) : gameData;

  const spaceSeparator = activeLine.indexOf(' ');

  const firstNumeralString = activeLine.substring(0, spaceSeparator);
  const secondNumeralString = activeLine.substring(spaceSeparator + 1);

  const initialScoreAlpha = parseInt(firstNumeralString, 10);
  const initialScoreBeta = parseInt(secondNumeralString, 10);

  const transformNumericValue = (val) => val === 1 ? val + 13 : val;

  const processedScoreAlpha = transformNumericValue(initialScoreAlpha);
  const processedScoreBeta = transformNumericValue(initialScoreBeta);

  const resultMapping = new Map([
    [1, 'Alice'],
    [-1, 'Bob'],
    [0, 'Draw']
  ]);

  const comparisonIndicator = Math.sign(processedScoreAlpha - processedScoreBeta);
  const finalResultPhrase = resultMapping.get(comparisonIndicator);

  process.stdout.write(finalResultPhrase + '\n');
}