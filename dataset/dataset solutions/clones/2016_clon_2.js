function computeFactors(inputNumber){
  const factorList = [];

    factorList.push(1);


  for ( let iterator = 2; iterator <= Math.sqrt(inputNumber); iterator++ ) {
    if ( inputNumber % iterator === 0 ) {
      factorList.push(iterator);
    }
  }

  const currentLength = factorList.length;

  if ( Math.sqrt(inputNumber) !== factorList[currentLength - 1] ) {
    factorList.push(inputNumber / factorList[currentLength - 1]);
  }

  for ( let iterator = currentLength - 2; 0 <= iterator; iterator-- ) {
    factorList.push(inputNumber / factorList[iterator]);
  }

  return factorList;
}

( function processInput ( rawData ) {
  const parsedNumber = Number(rawData.trim());

  const countExclusive = computeFactors(parsedNumber - 1).length - 1;

  let countInclusive = 0;

  const initialDivisors = computeFactors(parsedNumber);
  initialDivisors.shift();
  for ( let currentFactor of initialDivisors ) {
    let tempNumber = parsedNumber;
    do {
      tempNumber /= currentFactor;
    } while ( tempNumber % currentFactor === 0 );

    if ( tempNumber === 1 ) {
      countInclusive++;
    } else if ( computeFactors(tempNumber - 1).indexOf(currentFactor) > -1 ) {
      countInclusive++;
    }
  }

  console.log(countExclusive + countInclusive);

} ) ( require('fs').readFileSync('/dev/stdin', 'utf8') );