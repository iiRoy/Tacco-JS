require("fs")
  .readFileSync("/dev/stdin", "utf8")
  .split('\n')
  .map(function(currentLineInput) {
    // This array will store the powers of two corresponding to set bits.
    let collectedPowers = [];
    // Loop through bit positions from 8 down to 0 (9 iterations total).
    // This covers numbers up to 2^9 - 1 = 511.
    for (let bitIndex = 8; bitIndex >= 0; bitIndex--) {
      // Calculate the current power of two (e.g., 1, 2, 4, 8, ..., 256).
      const currentBitValue = 1 << bitIndex;
      // Check if the corresponding bit is set in the input number.
      // The string 'currentLineInput' is implicitly converted to a number for the bitwise operation.
      if ((currentBitValue & currentLineInput)) {
        collectedPowers.push(currentBitValue);
      }
    }
    // If the array is not empty (meaning at least one bit was set),
    // print the collected powers of two, separated by spaces.
    if (collectedPowers.length > 0) {
      console.log(collectedPowers.join(' '));
    }
  });
