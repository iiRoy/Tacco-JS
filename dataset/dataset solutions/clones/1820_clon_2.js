function processInput( inputStr ) {
  let currentNum = BigInt(inputStr);

  if ( currentNum === 1n ) {
    return console.log('0');
  }

  let resultCounter = 0;

  const foundPrimes = [];

  candidateLoop: for ( let candidateVal = 2n; candidateVal * candidateVal <= currentNum || candidateVal === currentNum; candidateVal++ ) {
    for ( let k = 0, existingPrime; existingPrime = foundPrimes[k]; k++ ) {
      if ( existingPrime * existingPrime > currentNum ) {
        break;
      }
      else if ( candidateVal % existingPrime === 0n ) {
        continue candidateLoop;
      }
    }

    foundPrimes.push(candidateVal);

    for ( let powerVal = candidateVal; powerVal <= currentNum; powerVal *= candidateVal ) {
      if ( currentNum % powerVal === 0n ) {
        resultCounter++;
        currentNum /= powerVal;
      } else {
        break;
      }
    }
  }

  if ( resultCounter === 0 ) {
    resultCounter = 1;
  }

  console.log(resultCounter.toString());
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
