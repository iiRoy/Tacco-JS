function processInput(rawData){
  // Extract dimensions from the first line of the raw input string
  const dimensionsStringArray = rawData.split('\n')[0].split(' ');
  const heightValue = stringToInteger(dimensionsStringArray[0]); // Height of the grid
  const widthValue = stringToInteger(dimensionsStringArray[1]); // Width of the grid

  // Special case: If width is 1, the condition is always met
  if (widthValue === 1) return console.log('Yes');

  // Process the grid characters (from the second line onwards)
  // Flatten all characters into a single string and count their occurrences
  const characterFrequencyMap = rawData
    .split('\n')
    .slice(1)
    .join('')
    .split('')
    .reduce(function(frequencyMap, currentChar) {
      if (frequencyMap[currentChar] === undefined) {
        frequencyMap[currentChar] = 0;
      }
      frequencyMap[currentChar]++;
      return frequencyMap;
    }, {});


  // Condition for even height and even width
  if (heightValue % 2 === 0 && widthValue % 2 === 0) {
    // Count characters whose frequencies are not multiples of 4
    const nonQuadrupleCount = Object.keys(characterFrequencyMap).filter(function(charKey) {
      return characterFrequencyMap[charKey] % 4 !== 0;
    }).length;

    // If all character frequencies are multiples of 4, it's a 'Yes'
    if (nonQuadrupleCount === 0) {
      return console.log('Yes');
    } else {
      return console.log('No');
    }
  }

  // Condition for odd height and odd width
  if (heightValue % 2 !== 0 && widthValue % 2 !== 0) {
    // Sum up the frequencies of characters that are not multiples of 4
    const totalOddRemainderSum = Object.keys(characterFrequencyMap).filter(function(keyIdentifier) {
      return characterFrequencyMap[keyIdentifier] % 4 !== 0;
    }).reduce(function(currentAccumulator, mapKey) {
      return currentAccumulator + stringToInteger(characterFrequencyMap[mapKey]);
    }, 0);

    // If the sum of these non-quadruple frequencies is odd, it's a 'Yes'
    if (totalOddRemainderSum % 2 === 1) {
      return console.log('Yes');
    } else {
      return console.log('No');
    }
  }

  // Condition for mixed parity (one even, one odd dimension)
  // Calculate the sum of character frequencies that are not multiples of 4
  const finalRemainderSum = Object.keys(characterFrequencyMap).filter(function(charLabel) {
    return characterFrequencyMap[charLabel] % 4 !== 0;
  }).reduce(function(runningTotal, currentLabel) {
    return runningTotal + stringToInteger(characterFrequencyMap[currentLabel]);
  }, 0);

  // If this sum is zero, it's a 'Yes'
  if (finalRemainderSum === 0) {
    return console.log('Yes');
  } else {
    return console.log('No');
  }
}

// Helper function to convert a string to an integer with base 10
function stringToInteger(strValue) {
  return parseInt(strValue, 10);
}

// Read input from standard input and pass to the main processing function
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));