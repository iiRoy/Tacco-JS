function calculateOutcome(payload) {
  const lines = payload.split('\n');

  const itemQuantity = Number(lines[0]);
  
  const [durationLimitStr, baseValueStr] = lines[1].split(' ');
  const durationLimit = Number(durationLimitStr);
  const baseValue = Number(baseValueStr);

  const consumptionRates = lines.slice(2, 2 + itemQuantity);

  const cumulativeConsumption = consumptionRates.reduce((acc, currentRateStr) => {
    const currentRate = Number(currentRateStr);
    return acc + Math.ceil(durationLimit / currentRate);
  }, 0);

  console.log(cumulativeConsumption + baseValue);
}

calculateOutcome(require('fs').readFileSync('/dev/stdin', 'utf8'));