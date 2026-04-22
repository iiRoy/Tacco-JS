let outputPrinter = console.log;

if( typeof executionEnv !== "undefined" ){ // Check if running in a Node.js-like environment

  let receivedData = ""; // Initialize an empty string to accumulate input

  executionEnv.stdin.resume();

  executionEnv.stdin.setEncoding('utf8');

  executionEnv.stdin.on( 'data', function(dataSegment) {
    receivedData += dataSegment;
  } );

  executionEnv.stdin.on( 'end', () => { // When input stream ends
    const dataRows = receivedData.split( "\n" ); // Split accumulated data into lines
    executeProgram( dataRows ); // Pass parsed lines to the main processing function
  });

}

const divisorConstant = 1000000007; // A large prime number used for modulo operations

function calculatePowerMod( baseVal, exponentVal ) {

  if ( exponentVal <= 3 ) { // Base cases for small exponents
    return Math.pow( baseVal, exponentVal ) % divisorConstant;
  }

  if ( exponentVal % 2 === 0 ) { // If exponent is even
    let tempResult = calculatePowerMod( baseVal, exponentVal / 2 );
    return ( tempResult * tempResult ) % divisorConstant; // (x^(n/2))^2 = x^n
  }

  else { // If exponent is odd
    let partialResult = calculatePowerMod( baseVal, ( exponentVal - 1 ) / 2 );
    return ( partialResult * partialResult * baseVal ) % divisorConstant; // (x^((n-1)/2))^2 * x = x^n
  }

}

function executeProgram( dataRows ) {

  const firstLine = dataRows[0]; // Get the first line of input

  const numericValues = firstLine.split( " " ).map( (elementStr) => {
    return Number(elementStr);
  } ); // Parse space-separated numbers

  outputPrinter( calculatePowerMod( numericValues[0], numericValues[1] ) ); // Print the final computed result

}