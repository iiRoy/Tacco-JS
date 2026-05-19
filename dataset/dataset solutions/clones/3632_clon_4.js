function Main(sourceInput) {
  const inputLines = sourceInput.split('\n');

  const [countElements, modulusDivisor] = inputLines[0].split(' ').map(strVal => parseInt(strVal, 10));
  const numberSequence = inputLines[1].split(' ').map(strVal => parseInt(strVal, 10));

  let totalDivisibleSubarrays = 0;
  const remainderCounts = new Map();

  // Initialize the map with a count of 1 for the remainder 0.
  // This accounts for the "empty prefix sum" before the first element,
  // allowing subarrays starting from index 0 to be counted correctly.
  remainderCounts.set(0, 1);

  let currentAccumulatedRemainder = 0;

  // Process each number in the sequence
  numberSequence.forEach(itemValue => {
    // Update the running sum modulo the divisor
    currentAccumulatedRemainder = (currentAccumulatedRemainder + itemValue) % modulusDivisor;

    // Retrieve the number of times this remainder has been seen before
    const priorOccurrences = remainderCounts.get(currentAccumulatedRemainder) || 0;

    // Each prior occurrence of this remainder signifies a subarray
    // ending at the current position whose sum is divisible by modulusDivisor.
    totalDivisibleSubarrays += priorOccurrences;

    // Increment the count for the current remainder in the map
    remainderCounts.set(currentAccumulatedRemainder, priorOccurrences + 1);
  });

  console.log(totalDivisibleSubarrays);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
