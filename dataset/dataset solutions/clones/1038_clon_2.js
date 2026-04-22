const findValueInSortedArray = (targetValue, arraySize, sortedNumbers) => {
  let lowIndex = 0;
  let highIndex = arraySize;
  while (lowIndex < highIndex) {
    const middleIndex = Math.floor((lowIndex + highIndex) / 2);
    if (sortedNumbers[middleIndex] === targetValue) {
      return true;
    } else if (targetValue < sortedNumbers[middleIndex]) {
      highIndex = middleIndex;
    } else {
      lowIndex = middleIndex + 1;
    }
  }
  return false;
};

( function ( inputData ) {
  const inputLines = ( inputData.trim() ) .split ( '\n' ) ;
  const sourceNumbers = inputLines[1] .split ( " " ) .map ( Number ) ;
  const targetNumbers = inputLines[3] .split ( " " ) .map ( Number ) ;

  let foundCount = 0 ;
  for ( let counter = 0 ; counter < targetNumbers.length ; counter++ ) {
    foundCount += findValueInSortedArray ( targetNumbers[counter], sourceNumbers.length, sourceNumbers ) ;
  }
  console.log ( foundCount ) ;
} ) ( require ( 'fs' ) .readFileSync ( '/dev/stdin', 'utf8' ) ) ;