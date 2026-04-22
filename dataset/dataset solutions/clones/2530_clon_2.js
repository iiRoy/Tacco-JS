// The entire input string is passed into the processing function.
function ProcessInputData (rawData) {

  // The first value is at parsedData[0], the second at parsedData[1], etc.
  var parsedData = rawData.split(" ");

  var firstNum = Number(parsedData[0]);
  var secondNum = Number(parsedData[1]);

  var resultGCD = computeCommonDivisor(firstNum, secondNum);
  var primeFactorCount = 0;
  var factorsList = [1];

  // Iterate to find divisors up to the square root of the calculated GCD
  for ( var currentDivisor = 1; currentDivisor < Math.sqrt(resultGCD); currentDivisor++ ) {
    if ( resultGCD % currentDivisor == 0 ) {

      // Check against existing factors in the list for relative primality
      for ( var listIndex in factorsList ) {

        if ( computeCommonDivisor(factorsList[listIndex], currentDivisor) != 1 ) {
          break;
        }

        if ( listIndex == factorsList.length - 1 ) {
          primeFactorCount++;
          factorsList.push(currentDivisor);
        }
      }
    }
  }

  // Second iteration, for divisors that are resultGCD / currentDivisor
  for ( var anotherDivisor = 2; anotherDivisor < Math.sqrt(resultGCD); anotherDivisor++ ) {
      // The condition `resultGCD % (resultGCD / anotherDivisor) == 0` will always be true in JavaScript for anotherDivisor > 0
      if ( resultGCD % (resultGCD / anotherDivisor) == 0 ) {

      // Check against existing factors for relative primality
      for ( var elementIndex in factorsList ) {

          if ( computeCommonDivisor(factorsList[elementIndex], resultGCD / anotherDivisor) != 1 ) {
           break;
          }

          if ( elementIndex == factorsList.length - 1 ) {
            primeFactorCount++;
            factorsList.push(resultGCD / anotherDivisor);
          }
        }
      }
    }

  // If the square root of the GCD is an integer, increment the count
  if ( Number.isInteger(Math.sqrt(resultGCD)) ) {
  		primeFactorCount++;
	}
  console.log(primeFactorCount);
}

// Function to calculate the greatest common divisor (GCD) using the Euclidean algorithm
function computeCommonDivisor(val1, val2) {
  if ( val2 == 0 ) {
    return val1;
  }
  return computeCommonDivisor(val2, val1 % val2);
}

// The following line loads input from standard I/O and invokes the main processing function. Do not modify.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));