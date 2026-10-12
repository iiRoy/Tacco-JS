function retrieveInputSource() {
  return require('fs').readFileSync('/dev/stdin', 'utf8');
}

function processInput(rawData) {
  const trimmedData = rawData.trim();
  const dataParts = trimmedData.split(" ");
  const targetValue = parseInt(dataParts[0], 10);

  const COEFF_A = 4;
  const COEFF_B = 7;
  const MAX_FACTOR_A = 25;
  const MAX_FACTOR_B = 15;

  const possibleSums = new Set();

  for (let factorA = 0; factorA <= MAX_FACTOR_A; factorA++) {
    for (let factorB = 0; factorB <= MAX_FACTOR_B; factorB++) {
      const currentSum = (COEFF_A * factorA) + (COEFF_B * factorB);
      possibleSums.add(currentSum);
    }
  }

  const resultMessage = possibleSums.has(targetValue) ? "Yes" : "No";
  console.log(resultMessage);
}

processInput(retrieveInputSource());
