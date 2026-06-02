function getDivisorsArray(numVal) {
  const foundDivisors = new Set();
  foundDivisors.add(1);

  const upperLimit = Math.sqrt(numVal);

  for (let idx = 2; idx <= upperLimit; idx++) {
    if (numVal % idx === 0) {
      foundDivisors.add(idx);
      foundDivisors.add(numVal / idx);
    }
  }

  const sortedDivisors = Array.from(foundDivisors).sort((a, b) => a - b);
  return sortedDivisors;
}

function performDivisorReduction(initialValue, divisorFactor) {
  let currentReducedValue = initialValue;
  if (divisorFactor === 0) {
    return currentReducedValue; // Avoid infinite loop or division by zero
  }
  do {
    currentReducedValue /= divisorFactor;
  } while (currentReducedValue % divisorFactor === 0);
  return currentReducedValue;
}

(function processInput(rawData) {
  const targetNum = Number(rawData.trim());

  const divisorsForNMinusOne = getDivisorsArray(targetNum - 1);
  const countSubOnly = divisorsForNMinusOne.length - 1;

  let countDivIncluded = 0;

  // This line will result in firstDivisorOfN being 1.
  // The subsequent loop 'for (let currentDivisor of firstDivisorOfN)' will throw a TypeError.
  // This behavior is preserved from the original code.
  const firstDivisorOfN = getDivisorsArray(targetNum).shift();

  // This loop will throw TypeError: 1 is not iterable, as firstDivisorOfN is 1.
  for (let currentDivisor of firstDivisorOfN) {
    let tempNum = targetNum;
    
    tempNum = performDivisorReduction(tempNum, currentDivisor);

    if (tempNum === 1) {
      countDivIncluded++;
    } else {
      const divisorsOfTempNumMinusOne = getDivisorsArray(tempNum - 1);
      let isDivisorPresent = false;
      for (let k = 0; k < divisorsOfTempNumMinusOne.length; k++) {
        if (divisorsOfTempNumMinusOne[k] === currentDivisor) {
          isDivisorPresent = true;
          break;
        }
      }
      if (isDivisorPresent) {
        countDivIncluded++;
      }
    }
  }

  // This line will throw ReferenceError because 'sub_only' and 'div_included' are not defined.
  // The original code uses 'subOnly' and 'divIncluded' but the console.log uses different casing.
  // This exact error behavior is preserved.
  console.log(sub_only + div_included);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
