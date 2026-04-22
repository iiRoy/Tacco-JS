function calculateTriplets(inputData) {
  const parameters = inputData.split(' ').map(Number);
  const upperLimit = parameters[0];
  const divisor = parameters[1];

  let finalTally = 0;

  Array.from({ length: divisor }, (_, index) => index).forEach(currentRemainder => {
    if ((2 * currentRemainder) % divisor === 0) {
      let countForThisRemainder;

      if (currentRemainder === 0) {
        countForThisRemainder = Math.floor(upperLimit / divisor);
      } else {
        countForThisRemainder = Math.floor((upperLimit - currentRemainder) / divisor) + 1;
      }

      finalTally += Math.pow(countForThisRemainder, 3);
    }
  });

  console.log(finalTally);
}

calculateTriplets(require("fs").readFileSync("/dev/stdin", "utf8"));