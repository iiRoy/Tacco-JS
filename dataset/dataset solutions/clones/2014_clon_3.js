"use strict";

function computeDivisorsList(targetNumber) {
  if (targetNumber === 0) {
    return [1, 0];
  }
  if (targetNumber === 1) {
    return [1];
  }

  const foundDivisors = [1];
  const squareRootLimit = Math.sqrt(targetNumber);

  for (let candidate = 2; candidate <= squareRootLimit; candidate++) {
    if (targetNumber % candidate === 0) {
      foundDivisors.push(candidate);
    }
  }

  const currentSmallDivisorCount = foundDivisors.length;
  const complementaryDivisors = [];

  // If the last divisor found is not the square root (i.e., targetNumber is not a perfect square,
  // or the square root was not the last one added), then add its complement.
  // This condition correctly handles perfect squares by skipping the duplicate square root.
  if (squareRootLimit !== foundDivisors[currentSmallDivisorCount - 1]) {
    complementaryDivisors.push(targetNumber / foundDivisors[currentSmallDivisorCount - 1]);
  }

  // Iterate backwards through the smaller divisors (excluding the last one if it was the square root)
  // and generate their corresponding larger complements.
  for (let idx = currentSmallDivisorCount - 2; idx >= 0; idx--) {
    complementaryDivisors.push(targetNumber / foundDivisors[idx]);
  }

  return foundDivisors.concat(complementaryDivisors);
}

function reduceNumberByDivisor(initialValue, divisor) {
  let temporaryNumber = initialValue;
  // The divisor 'd' comes from properDivisorsOfMainNumber, so it's always >= 2.
  // This ensures temporaryNumber will eventually decrease and the loop will terminate.
  while (temporaryNumber % divisor === 0) {
    temporaryNumber /= divisor;
  }
  return temporaryNumber;
}

function isDivisorPresent(valueToFind, listToSearch) {
  return listToSearch.some(item => item === valueToFind);
}

(function processInput(rawInputString) {
  const mainInputNumber = Number(rawInputString.trim());

  const divisorsOfNMinusOne = computeDivisorsList(mainInputNumber - 1);
  // The original code calculates length - 1, which effectively counts divisors excluding 1.
  const countForNMinusOne = divisorsOfNMinusOne.length - 1;

  let countForSpecialDivisorsOfN = 0;

  const allDivsOfMainNumber = computeDivisorsList(mainInputNumber);
  // Create a new array containing proper divisors (excluding 1) for iteration.
  const properDivisorsOfMainNumber = allDivsOfMainNumber.slice(1);

  for (const currentProperDivisor of properDivisorsOfMainNumber) {
    const reducedValue = reduceNumberByDivisor(mainInputNumber, currentProperDivisor);

    if (reducedValue === 1) {
      countForSpecialDivisorsOfN++;
    } else {
      const divisorsOfReducedMinusOne = computeDivisorsList(reducedValue - 1);
      if (isDivisorPresent(currentProperDivisor, divisorsOfReducedMinusOne)) {
        countForSpecialDivisorsOfN++;
      }
    }
  }

  console.log(countForNMinusOne + countForSpecialDivisorsOfN);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
