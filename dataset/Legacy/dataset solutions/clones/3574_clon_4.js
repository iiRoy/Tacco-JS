function Main(inputData) {
  const [upperBound, modulusValue] = inputData.split(' ').map(Number);

  let countForZeroRemainder = Math.floor(upperBound / modulusValue);
  let countForHalfModulusRemainder = 0;

  if (modulusValue % 2 === 0) {
    const targetRemainder = modulusValue / 2;
    // Calculate how many numbers 'x' in [1, upperBound] satisfy x % modulusValue === targetRemainder
    // These numbers are targetRemainder, targetRemainder + modulusValue, targetRemainder + 2*modulusValue, ...
    // The count is floor((upperBound - targetRemainder) / modulusValue) + 1
    // This formula correctly handles cases where targetRemainder > upperBound, resulting in 0.
    countForHalfModulusRemainder = Math.floor((upperBound - targetRemainder) / modulusValue) + 1;
  }

  let finalTally = 0;

  // If all three numbers (a, b, c) have a remainder of 0 when divided by modulusValue,
  // then (a+b)%M=0, (b+c)%M=0, (c+a)%M=0 are all satisfied.
  finalTally += Math.pow(countForZeroRemainder, 3);

  // If modulusValue is even, and all three numbers (a, b, c) have a remainder of modulusValue/2,
  // then (a+b)%M = (M/2 + M/2)%M = M%M = 0.
  // Similarly for (b+c)%M and (c+a)%M.
  finalTally += Math.pow(countForHalfModulusRemainder, 3);

  console.log(finalTally);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
