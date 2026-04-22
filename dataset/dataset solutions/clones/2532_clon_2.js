function checkPrimality (integerVal) {
  // Verifies if the supplied integer is a prime number.
  if ( integerVal === 1 ) {
    return false;
  } else if ( integerVal === 2 ) {
    return true;
  } else if ( integerVal % 2 === 0 ) {
    return false;
  } else if ( integerVal !== 3 && integerVal % 3 === 0 ) {
    return false;
  } else if ( integerVal !== 5 && integerVal % 5 === 0 ) {
    return false;
  } else if ( integerVal !== 7 && integerVal % 7 === 0 ) {
    return false;
  }

  // Iteratively check for divisibility by odd numbers.
  for ( let loopVar = 3 ; loopVar <= Math.sqrt(integerVal) ; loopVar += 2 ) {
    if ( integerVal % loopVar === 0 ) {
      return false;
    }
  }
  return true;
}

// This routine computes the greatest common divisor of two numerical inputs.
function getHighestCommonFactor (firstNum, secondNum) {
    if ( secondNum === 0 ) {
        return firstNum;
    }
    return getHighestCommonFactor(secondNum, firstNum % secondNum);
}

function PerformCalculations (incomingText) {
  incomingText = incomingText.split("\n");
  let splitInputLine = incomingText[0].split(" ");
  const firstOperand = Number.parseInt(splitInputLine[0]);
  const secondOperand = Number.parseInt(splitInputLine[1]);
  const resultHCF = getHighestCommonFactor(firstOperand, secondOperand);
      
  // Collections for factors and a temporary array.
  const factorCollection = [];
  const placeholderArr = [];
  // Discover all divisors of the calculated HCF.
  for ( let loopCounter = 1 ; loopCounter <= resultHCF ; loopCounter++ ) {
    if ( resultHCF % loopCounter === 0 ) {
      factorCollection.push(loopCounter);
      placeholderArr.push(0);
    }
  }
  
  // Assess primality for each found factor.
  let totalPrimesFound = 0;
  for ( let loopCounter = 1 ; loopCounter <= factorCollection.length ; loopCounter++ ) {
    if ( checkPrimality(factorCollection[loopCounter]) === true ) {
      totalPrimesFound += 1;
    }
  }
  // Emit the total count of prime factors.
  console.log(totalPrimesFound);
}
PerformCalculations(require("fs").readFileSync("/dev/stdin", "utf8"));