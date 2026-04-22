"use strict";

/*
 *  Utility class for parsing input streams.
 *  It handles line-by-line and token-by-token extraction.
 */
function  StreamReader ( inputContent ,  valueConverter )
{
  this . _lineSegments  =  inputContent . split ( "\n" ) ; /* Store all lines as an array */
  this . _wordPos       =  0 ; // Current position within the active line
  this . _lineIdx       =  0 ; // Current line being processed
  this . _converterFn   =  valueConverter || Number ; // Function to convert extracted tokens
}

StreamReader.prototype.fetchNextItem = function()
{
  let activeSegment = this._lineSegments[ this._lineIdx ] ; // Get the current line
  if ( ! activeSegment ) { /* If no more lines, exit */ return ; }

  let segmentParts = activeSegment.trim().split( " " ) ; // Split line into tokens
  let itemValue = segmentParts[ this._wordPos ] ; // Extract the token at current position
  this._wordPos ++ ; // Move to the next token

  if ( segmentParts.length === this._wordPos ) { // If all tokens in line processed
    this._wordPos = 0 ; // Reset token position
    this._lineIdx ++ ; // Move to the next line
  }

  return this._converterFn(itemValue) ; // Convert and return the item
};

StreamReader.prototype.processLineData = function()
{
  const activeSegment = this._lineSegments[this._lineIdx] ; // Retrieve current line
  if ( ! activeSegment ) { return ; } // No line, nothing to do

  this._wordPos = 0 ; // Reset token position for new line
  this._lineIdx ++ ; // Advance to the next line

  // Split, convert each part, and return as an array
  return activeSegment.split(" ").map( this._converterFn ) ;
};


// Function to find prime numbers up to a specified maximum value
function computePrimeNumbers ( maximumValue )
{
  const primeCheckArray = new Array( maximumValue + 1 ).fill( true ) ; // Initialize all as potentially prime
  primeCheckArray[0] = false ; // 0 is not prime
  primeCheckArray[1] = false ; // 1 is not prime

  const resultantPrimes = [] ; // List to store found primes

  // Iterate from 2 up to the maximum value
  for ( let candidateNumber = 2 ; candidateNumber <= maximumValue ; candidateNumber += 1 )
  {
    if ( true === primeCheckArray[ candidateNumber ] ) // If current number is marked as prime
    {
      resultantPrimes.push( candidateNumber ) ; // Add it to our list of primes
      let multipleIndex = candidateNumber * candidateNumber ; // Start marking multiples from square
      while ( multipleIndex <= maximumValue )
      {
        primeCheckArray[ multipleIndex ] = false ; // Mark multiples as not prime
        multipleIndex += candidateNumber ; // Move to the next multiple
      }
    }
  }
  return resultantPrimes ; // Return the list of prime numbers
}


var primeCache = computePrimeNumbers( 100000 ) ; // Pre-compute primes up to 100,000

/*
 * Main execution function that processes input and calculates the answer.
 */
function runSolution ( sourceInput )
{
  var dataParser = new StreamReader( sourceInput ) ; // Instantiate input parser

  var elementQuantity = dataParser.fetchNextItem() ; // Read the first number, which is the count
  var numericSequence = [] ; // Array to hold subsequent numbers

  // Populate the numeric sequence from input
  for ( var iterationIndex = 0 ; iterationIndex <= elementQuantity ; iterationIndex ++ )
  {
    numericSequence.push( dataParser.fetchNextItem() ) ;
  }
  numericSequence = numericSequence.reverse() ; // Reverse the sequence

  let finalGCD = numericSequence[0] ; // Initialize GCD with the first element
  // Calculate GCD of all elements in the sequence
  for ( var iterationIndex = 1 ; iterationIndex <= elementQuantity ; iterationIndex ++ )
  {
    finalGCD = computeGreatestCommonDivisor( finalGCD , numericSequence[iterationIndex] ) ;
  }

  // Divide each number in the sequence by the calculated GCD
  numericSequence = numericSequence.map( currentVal => currentVal / finalGCD ) ;

  var answerCollection = [] ; // Collection for final answers
  // Filter primes that are relevant (<= elementQuantity) and process them
  primeCache.filter( potentialFactor => potentialFactor <= elementQuantity ).forEach( activeFactor =>
  {
    // Check divisibility for the first element
    if ( numericSequence[0] % activeFactor !== 0 ) { return ; }

    // Inner loop for checking conditions based on the current prime factor
    for ( var iterationIndex = 1 ; iterationIndex < activeFactor ; iterationIndex ++ )
    {
      var innerIteration = iterationIndex ;
      var sumOfElements = 0 ;
      while ( innerIteration <= elementQuantity )
      {
        sumOfElements += numericSequence[ innerIteration ] ;
        innerIteration += activeFactor - 1 ;
      }
      if ( sumOfElements % activeFactor !== 0 ) { return ; }
    }
    answerCollection.push( activeFactor ) ; // Add prime to answers if all conditions met
  } ) ;

  var iterationIndex = 0 ; // Reset loop counter
  // Factor out remaining GCD components using primes
  while ( finalGCD > 1 && iterationIndex < primeCache.length )
  {
    if ( finalGCD % primeCache[iterationIndex] === 0 )
    {
      answerCollection.push( primeCache[iterationIndex] ) ; // Add prime factor to answers
      while ( finalGCD % primeCache[iterationIndex] === 0 )
      {
        finalGCD = finalGCD / primeCache[iterationIndex] ; // Reduce GCD
      }
    }
    iterationIndex += 1 ; // Move to next prime
  }
  if ( finalGCD > 1 ) // If GCD still greater than 1, it's a prime itself
  {
    answerCollection.push( finalGCD ) ;
  }

  // Sort the final collection of answers
  answerCollection.sort( ( firstVal , secondVal ) => firstVal - secondVal ) ;
  var priorValue ; // Variable to track previously printed value
  // Print unique answers
  for ( var iterationIndex = 0 ; iterationIndex < answerCollection.length ; iterationIndex ++ )
  {
    if ( priorValue !== answerCollection[iterationIndex] )
    {
      console.log( answerCollection[iterationIndex] ) ;
    }
    priorValue = answerCollection[iterationIndex] ;
  }
}

// Function to compute the Greatest Common Divisor (GCD) using Euclidean algorithm
function computeGreatestCommonDivisor ( firstNumber , secondNumber )
{
  if ( secondNumber === 0 ) { return firstNumber ; } // Base case
  return computeGreatestCommonDivisor( secondNumber , firstNumber % secondNumber ) ; // Recursive step
}


// Read input from standard input and execute the solution
runSolution( require("fs").readFileSync("/dev/stdin", "utf8") ) ;