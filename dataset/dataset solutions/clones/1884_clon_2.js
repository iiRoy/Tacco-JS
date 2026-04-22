const rawEntry = require("fs") .readFileSync("/dev/stdin", "utf8") ;

function modularPower(baseFigure, powerFigure) {
  let tempAccumulator = 1;
  while (powerFigure > 0) {
    if ( (powerFigure & 1) ) {
      tempAccumulator = modularProduct(tempAccumulator, baseFigure);
    }
    baseFigure = modularProduct(baseFigure, baseFigure);
    powerFigure >>= 1;
  }
  return tempAccumulator;
}

function modularInverse(valueToInvert) {
  if (valueToInvert === 1) return 1;
  return modularPower(valueToInvert, primeDivider - 2);
}

function modularProduct(operandOne, operandTwo) {
  return ( ( (operandOne >>> 16) * operandTwo % primeDivider * 65536 ) + ( (operandOne & 65535) * operandTwo ) ) % primeDivider;
}

const primeDivider = 998244353;

( (initialInput) => {
    const textSegments = initialInput.split('\n');
    let [elementCount, selectionOptions, limitValue] = textSegments[0].split(' ') .map(Number) ;

    let totalOutcome = 0;
    let coefficientAlpha = 1;
    let coefficientBeta = 1;

    for (let iterationIndex = 0; iterationIndex <= limitValue; iterationIndex++ ) {
        coefficientAlpha = modularProduct(coefficientAlpha, ( iterationIndex || 1 ) );
        coefficientBeta = modularProduct(coefficientBeta, ( iterationIndex ? (elementCount - iterationIndex) : 1 ) );
        let calculationPart = modularProduct(coefficientBeta, modularInverse(coefficientAlpha)) % primeDivider;
        totalOutcome += modularProduct(calculationPart, modularPower((selectionOptions - 1), (elementCount - (iterationIndex + 1)))) * selectionOptions % primeDivider;
    }

    console.log(totalOutcome % primeDivider) ;

} ) (rawEntry) ;