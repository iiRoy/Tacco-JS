console.log((inputData => {
  // This function processes input data to calculate a specific value.
  // It reads a string containing a number N and a character sequence S.
  const [countStr, charSequence] = inputData.trim().split('\n');

  // Convert the character sequence into an array of 0-indexed character codes (a=0, b=1, etc.).
  const charIndices = charSequence.split('').map(charVal => charVal.charCodeAt(0) - 97);

  // Initialize an array to store frequencies, starting each count at 1.
  // This is for calculating combinations later.
  const frequencyArray = Array(26).fill(1);

  // Define a modulo constant for arithmetic operations.
  const moduloVal = 1000000007; // Equivalent to 1e9+7

  // Helper function for modular multiplication to prevent overflow.
  // It splits the first operand into two 16-bit parts.
  const modMultiply = (valA, valB) => (
    ( (valA >>> 16) * valB % moduloVal * 65536 ) +
    ( (valA & 65535) * valB )
  ) % moduloVal;

  // Iterate through the character indices up to N (parsed from countStr).
  // Increment the frequency for each encountered character.
  for (let idx = 0; idx < countStr; idx++) {
    frequencyArray[charIndices[idx]]++;
  }

  // Calculate the product of all frequencies using modular multiplication,
  // then subtract 1 from the final result.
  // The result is converted to a string before being logged.
  return `${frequencyArray.reduce(modMultiply) - 1}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
