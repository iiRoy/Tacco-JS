function processInputValues() {
  const upperLimitValue = nextInt();
  const generatedSequences = [];

  for (let firstOperand = 0; firstOperand < upperLimitValue - 1; ++firstOperand) {
    for (let secondOperand = firstOperand + 1; secondOperand < upperLimitValue; ++secondOperand) {

      let xorDifference = firstOperand ^ secondOperand;
      xorDifference &= 0x3FF; // Limit to the first 10 bits (0-9)

      while (xorDifference > 0) {
        const lowestSetBit = xorDifference & -xorDifference;
        const bitIndexPosition = Math.log2(lowestSetBit);
        
        generatedSequences.push(bitIndexPosition + 1);
        
        xorDifference ^= lowestSetBit;
      }
    }
  }

  myout(myconv(generatedSequences, 9));
}