function printToConsole( messageContent ) {
  console.log(messageContent);
}

function ProcessInputData( initialDataString ) {

  let numericValue = parseInt(initialDataString);
  // This line converts the input string to an integer.
  // Other potential input parsing methods, currently inactive:
  // numericValue = initialDataString.split(" ");
  // numericValue = initialDataString.split("\n");
  // numericValue = initialDataString.split(" ").map((element)=>Number(element));
  // numericValue = initialDataString.split("\n").map((element)=>Number(element));

  if ( numericValue === 1 ) {
    printToConsole("1");
    return;
  }

  const factorCollection = retrieveDivisors(numericValue);
  // Debugging line to view the collected factors (currently commented).
  // printToConsole(factorCollection);

  let minimumDigitCount = 20;

  for ( let loopIndex = 0 ; loopIndex < factorCollection.length / 2 ; loopIndex++ ) {
    const firstFactor = factorCollection[loopIndex];
    const secondFactor = factorCollection[ factorCollection.length - ( loopIndex + 1 ) ];
    // Another debugging line, showing factor pairs (currently commented).
    // printToConsole(firstFactor + ":" + secondFactor);
    minimumDigitCount = Math.min( minimumDigitCount , calculateMaxDigits(firstFactor, secondFactor) );
  }

  printToConsole(minimumDigitCount);
}

function calculateMaxDigits( valueOne , valueTwo ) {
  return Math.max( valueOne.toString().length , valueTwo.toString().length );
}

// This function efficiently computes all positive divisors for a given number.
function retrieveDivisors( targetNumber ) {

  const divisorList = [];

  for ( let currentCandidate = 1 ; currentCandidate * currentCandidate <= targetNumber ; currentCandidate++ ) {
    if ( targetNumber % currentCandidate === 0 ) {
      divisorList.push(currentCandidate);
      if ( currentCandidate * currentCandidate !== targetNumber ) {
        divisorList.push(targetNumber / currentCandidate);
      }
    }
  }

  divisorList.sort( ( itemA , itemB ) => {
    return itemA - itemB;
  });

  return divisorList;
}

// Initiates the program by reading input from the standard input stream.
ProcessInputData( require("fs").readFileSync("/dev/stdin", "utf8").trim() );