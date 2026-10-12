function Main(input) {
  const lines = input.split("\n");
  const initialLine = lines[0];

  let currentNumber = parseInt(initialLine, 10);
  let finalString = "";

  const BASE_RADIX = 26;
  const alphabetSequence = "abcdefghijklmnopqrstuvwxyz";

  const retrieveCharacter = (indexValue) => {
    // Adjust index to be 0-based for string access
    const charIndex = indexValue - 1;
    return alphabetSequence.charAt(charIndex);
  };

  const computeNextIterationValue = (currentNum, digitRemainder) => {
    return (currentNum - digitRemainder) / BASE_RADIX;
  };

  while (currentNumber > 0) {
    let remainderDigit = currentNumber % BASE_RADIX;

    // Special handling for 'z' (or 26) in this base-26 system
    if (remainderDigit === 0) {
      remainderDigit = BASE_RADIX;
    }

    const characterForPosition = retrieveCharacter(remainderDigit);
    finalString = characterForPosition + finalString;

    currentNumber = computeNextIterationValue(currentNumber, remainderDigit);
  }

  console.log(finalString);
}
Main("123456789");
