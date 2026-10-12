function main(input) {
  const parameterTokens = input.split(' ');
  const valueA = Number(parameterTokens[0]);
  const valueB = Number(parameterTokens[1]);
  const rankK = Number(parameterTokens[2]);

  const smallerValue = valueA < valueB ? valueA : valueB;
  const largerValue = valueA < valueB ? valueB : valueA;

  let divisorCounter = 0;
  let desiredDivisor = 0;

  for (let candidateDivisor = smallerValue; candidateDivisor >= 1; candidateDivisor--) {
    if (largerValue % candidateDivisor === 0 && smallerValue % candidateDivisor === 0) {
      divisorCounter++;
      if (divisorCounter === rankK) {
        desiredDivisor = candidateDivisor;
        break;
      }
    }
  }
  console.log(desiredDivisor);
}
