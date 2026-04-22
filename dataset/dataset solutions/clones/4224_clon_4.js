const processNumericalSequence = (incomingRawData) => {
  const parsedDigits = incomingRawData.split('').map(Number);
  const targetSumValue = 7;
  const operatorSymbols = ['+', '-']; // 0 maps to '+', 1 maps to '-'

  const digitCount = parsedDigits.length; // Assumed to be 4
  const symbolCount = digitCount - 1;   // Assumed to be 3

  // Iterate through all possible combinations of operators
  // There are 2^(symbolCount) combinations (e.g., 2^3 = 8 for 3 operators)
  for (let combinationIndex = 0; combinationIndex < Math.pow(2, symbolCount); combinationIndex++) {
    const currentSymbolSet = [];
    let tempCombo = combinationIndex;

    // Extract operator choices from the binary representation of combinationIndex
    // The most significant bit corresponds to the first operator (between parsedDigits[0] and parsedDigits[1])
    // The least significant bit corresponds to the last operator (between parsedDigits[symbolCount-1] and parsedDigits[symbolCount])
    for (let symbolPosition = 0; symbolPosition < symbolCount; symbolPosition++) {
      const symbolBit = (tempCombo >> (symbolCount - 1 - symbolPosition)) & 1;
      currentSymbolSet.push(operatorSymbols[symbolBit]);
    }

    // Calculate the total for the current combination
    let evaluatedTotal = parsedDigits[0];
    for (let loopIterator = 0; loopIterator < symbolCount; loopIterator++) {
      if (currentSymbolSet[loopIterator] === '+') {
        evaluatedTotal += parsedDigits[loopIterator + 1];
      } else { // '-'
        evaluatedTotal -= parsedDigits[loopIterator + 1];
      }
    }

    // Check if the target sum is achieved
    if (evaluatedTotal === targetSumValue) {
      // Construct the output string in the specified format
      let outputFormat = String(parsedDigits[0]);
      for (let loopIterator = 0; loopIterator < symbolCount; loopIterator++) {
        outputFormat += currentSymbolSet[loopIterator] + String(parsedDigits[loopIterator + 1]);
      }
      console.log(`${outputFormat}=${targetSumValue}`);
      return; // Found a solution, exit the function
    }
  }

  // If no solution is found after checking all combinations
  console.log("program error");
};

processNumericalSequence(require('fs').readFileSync('/dev/stdin','utf8'));