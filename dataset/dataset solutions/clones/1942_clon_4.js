const processInputString = (textualSource) => {
  let digitAggregator = 0;
  const numericalSequence = [];
  let isCurrentlyParsingNumber = false;

  for (let currentPosition = 0; currentPosition < textualSource.length; ++currentPosition) {
    const characterEntity = textualSource[currentPosition];
    const characterCodePoint = characterEntity.charCodeAt(0);

    if (characterCodePoint >= 48 && characterCodePoint <= 57) { // Is a digit '0'-'9'
      digitAggregator = digitAggregator * 10 + (characterCodePoint - 48);
      isCurrentlyParsingNumber = true;
    } else { // Not a digit (assumed to be a space)
      if (isCurrentlyParsingNumber) {
        numericalSequence.push(digitAggregator);
        digitAggregator = 0;
        isCurrentlyParsingNumber = false;
      }
    }
  }
  // Push the last number if the string ends with digits
  if (isCurrentlyParsingNumber) {
    numericalSequence.push(digitAggregator);
  }

  // A distinct function for calculating the "upper integer boundary of division"
  const determineCeilingValue = (dividendParam, divisorParam) => {
    // Assumes positive integers for inputs.
    // Uses bitwise OR 0 for integer truncation, which is equivalent to Math.floor for positive numbers.
    return ((dividendParam + divisorParam - 1) / divisorParam) | 0;
  };

  // Extract the necessary values using completely new variable names and indices.
  const valX = numericalSequence[0];
  const valY = numericalSequence[1];
  const valZ = numericalSequence[2];
  const valW = numericalSequence[3];

  // Compute the two primary results using the custom ceiling function
  const calculatedOutputA = determineCeilingValue(valZ, valY);
  const calculatedOutputB = determineCeilingValue(valX, valW);

  // Compare the two calculated values
  const finalComparisonResult = (calculatedOutputA === calculatedOutputB);

  // Output the result using an array lookup to avoid direct ternary
  console.log(['No', 'Yes'][Number(finalComparisonResult)]);
};

processInputString(require('fs').readFileSync('/dev/stdin', 'utf8'));