function bitwiseXor(valA, valB) {
  const modulusVal = 10000000;

  const getPart = (num, divisor, isUpper) => isUpper ? Math.floor(num / divisor) : num % divisor;

  const upperA = getPart(valA, modulusVal, true);
  const upperB = getPart(valB, modulusVal, true);
  const lowerA = getPart(valA, modulusVal, false);
  const lowerB = getPart(valB, modulusVal, false);

  const currentLowerXor = lowerA ^ lowerB;

  if (valA < modulusVal && valB < modulusVal) {
    return currentLowerXor;
  }

  let finalUpperPartXor;
  if (valA < modulusVal) {
    // If valA is less than modulusVal, its upper part is effectively 0.
    // The XOR operation becomes (0 ^ upperB) * modulusVal.
    finalUpperPartXor = (0 ^ upperB) * modulusVal;
  } else if (valB < modulusVal) {
    // If valB is less than modulusVal, its upper part is effectively 0.
    // The XOR operation becomes (upperA ^ 0) * modulusVal.
    finalUpperPartXor = (upperA ^ 0) * modulusVal;
  } else {
    // Both valA and valB are greater than or equal to modulusVal.
    finalUpperPartXor = (upperA ^ upperB) * modulusVal;
  }

  return currentLowerXor + finalUpperPartXor;
}

function processInput(rawData) {
  const parsedLines = rawData.split('\n');
  const firstLineParts = parsedLines[0].split(' ');
  const startVal = Math.floor(Number(firstLineParts[0]));
  const endVal = Math.floor(Number(firstLineParts[1]));
  const rangeSize = endVal - startVal + 1;

  const isRangeSizeEven = (rangeSize % 2 === 0);
  const isStartValEven = (startVal % 2 === 0);

  if (isRangeSizeEven) {
    if (isStartValEven) {
      const halfRangeModTwo = Math.floor(rangeSize / 2) % 2;
      console.log(halfRangeModTwo === 0 ? 0 : 1);
    } else { // startVal is odd
      let xorAccumulator;
      if (rangeSize === 2) {
        xorAccumulator = 0;
      } else {
        xorAccumulator = Math.floor((rangeSize - 2) / 2) % 2;
      }
      console.log(bitwiseXor(bitwiseXor(startVal, endVal), xorAccumulator));
    }
  } else { // rangeSize is odd
    if (isStartValEven) {
      let xorAccumulator;
      if (rangeSize === 1) {
        xorAccumulator = 0;
      } else {
        xorAccumulator = Math.floor((rangeSize - 1) / 2) % 2;
      }
      console.log(bitwiseXor(endVal, xorAccumulator));
    } else { // startVal is odd
      const xorAccumulator = Math.floor((rangeSize - 1) / 2) % 2;
      console.log(bitwiseXor(startVal, xorAccumulator));
    }
  }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
