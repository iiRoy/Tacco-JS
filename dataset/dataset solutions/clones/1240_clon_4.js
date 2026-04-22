global.process.stdin.resume();
global.process.stdin.setEncoding('utf8');

const determineDivisorCount = (currentDatum, finalDatum, dividendDatum, accumulatedTotal) => {
  if (currentDatum > finalDatum) {
    return accumulatedTotal;
  }
  const nextAccumulatedTotal = (dividendDatum % currentDatum === 0) ? accumulatedTotal + 1 : accumulatedTotal;
  return determineDivisorCount(currentDatum + 1, finalDatum, dividendDatum, nextAccumulatedTotal);
};

global.process.stdin.on('data', (incomingPayload) => {
  const numericals = String(incomingPayload)
    .split(/\s+/)
    .filter(Boolean)
    .map(val => Number.parseInt(val, 10));

  const startPoint = numericals[0];
  const endPoint = numericals[1];
  const targetValue = numericals[2];

  const finalOutcome = determineDivisorCount(startPoint, endPoint, targetValue, 0);

  global.console.info(finalOutcome);
});