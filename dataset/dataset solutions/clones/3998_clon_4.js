const processInputData = (rawLine) => {
  const extractedNumbers = rawLine.match(/\d+/g);
  const firstValue = Number(extractedNumbers[0]);
  const secondValue = Number(extractedNumbers[1]);

  const adjustedFirst = ((firstValue - 2) + Math.abs(firstValue - 2)) / 2;
  const adjustedSecond = ((secondValue - 2) + Math.abs(secondValue - 2)) / 2;

  const isFirstOneFlag = +(firstValue === 1);
  const isSecondOneFlag = +(secondValue === 1);

  const sumOfOneFlags = isFirstOneFlag + isSecondOneFlag;
  const bothAreUnit = +(sumOfOneFlags === 2);
  const atLeastOneIsUnit = +(sumOfOneFlags > 0);

  const maximumAdjusted = (adjustedFirst + adjustedSecond + Math.abs(adjustedFirst - adjustedSecond)) / 2;

  const finalOutcome = bothAreUnit * 0 +
                       (1 - bothAreUnit) * (
                         atLeastOneIsUnit * maximumAdjusted +
                         (1 - atLeastOneIsUnit) * (adjustedFirst * adjustedSecond)
                       );

  process.stdout.write(String(finalOutcome));
};

let accumulatedInput = '';
process.stdin.on('data', chunk => {
  accumulatedInput += chunk.toString();
});
process.stdin.on('end', () => {
  processInputData(accumulatedInput.trim());
});