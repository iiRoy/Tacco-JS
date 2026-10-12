function Main(inputString) {
  const parsedInput = inputString.split(' ');
  const limitValue = parseInt(parsedInput[0]);
  const divisorValue = parseInt(parsedInput[1]);

  let totalValidTriplets = 0;

  for (let remainderCandidate = 0; remainderCandidate < divisorValue; remainderCandidate++) {
    // The problem conditions (i+j)%K=0, (j+k)%K=0, (k+i)%K=0
    // imply that i%K = j%K = k%K. Let this common remainder be 'r'.
    // Then, (r+r)%K must be 0, which simplifies to (2*r)%K === 0.
    if ((2 * remainderCandidate) % divisorValue === 0) {
      let countForCurrentRemainder;

      if (remainderCandidate === 0) {
        // If the remainder is 0, numbers are K, 2K, ..., floor(N/K)*K
        // The count is simply floor(N/K).
        countForCurrentRemainder = Math.floor(limitValue / divisorValue);
      } else {
        // If the remainder is not 0, numbers are r, r+K, r+2K, ...
        // The smallest number is 'remainderCandidate'.
        // The largest number is 'remainderCandidate + m * divisorValue' such that it's <= 'limitValue'.
        // So, m * divisorValue <= limitValue - remainderCandidate
        // m <= (limitValue - remainderCandidate) / divisorValue
        // The number of such 'm' (starting from m=0) is floor((limitValue - remainderCandidate) / divisorValue) + 1.
        // This formula correctly yields 0 if remainderCandidate > limitValue.
        countForCurrentRemainder = Math.floor((limitValue - remainderCandidate) / divisorValue) + 1;
      }

      // For each valid remainder 'r', if there are 'C' numbers in [1, N] that have this remainder,
      // then there are C*C*C ways to choose i, j, and k such that they all have this remainder.
      // Each such triplet (i, j, k) will satisfy the original conditions.
      totalValidTriplets += Math.pow(countForCurrentRemainder, 3);
    }
  }

  console.log(totalValidTriplets);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
