// This module handles processing sequences of numbers to find the shortest possible version
// after removing specific repeating patterns.

// Defines a routine to reduce a given string by eliminating consecutive repeating digits.
function sequenceReducer ( targetSequence )
{
  // Continuously remove patterns of four or more identical digits (1s, 2s, or 3s)
  while ( /1{4,}|2{4,}|3{4,}/.test( targetSequence ) )
  {
    targetSequence = targetSequence.replace( /1{4,}|2{4,}|3{4,}/g , "" ) ;
  }
  // After reduction, update the globally tracked minimum length if this sequence is shorter
  shortestLength = Math.min( shortestLength , targetSequence.length ) ;
}


// Obtain the entire content from the standard input stream
var sourceData = require('fs').readFileSync( '/dev/stdin' , 'utf8' ) ;

// Prepare the input: remove leading/trailing whitespace and split into an array of lines
var rawLines = ( sourceData.trim() ).split( "\n" ) ;

// The very first line specifies the number of subsequent data elements
var initialSize = rawLines.shift() - 0 ; // Convert the string to a number

// Initialize an array to hold the numeric data items
var dataItems = [] ;

// Populate the dataItems array by converting each remaining line to a number
for ( var loopIndex = 0 ; loopIndex < initialSize ; loopIndex ++ )
{
  var element = rawLines.shift() - 0 ;
  dataItems.push( element ) ;
}

// Initialize a global variable to store the absolute minimum sequence length found,
// starting with an infinitely large value
var shortestLength = Infinity ;

// Join the initial array of numbers into a single string.
// This variable is created but not directly used for reduction in the original logic.
var originalCombination = dataItems.join( "" ) ;


// Iterate through each position in the dataItems array to generate modified sequences
for ( var modifyIndex = 0 ; modifyIndex < initialSize ; modifyIndex ++ )
{
  // Create two separate copies of the original data array for distinct modifications
  var tempArrayOne = dataItems.slice() ;
  var tempArrayTwo = dataItems.slice() ;

  // For the first copy: if not at the last element, replace the current element with the next one
  if ( modifyIndex < initialSize - 1 )
  {
    tempArrayOne[ modifyIndex ] = tempArrayOne[ modifyIndex + 1 ] ;
  }

  // For the second copy: if not at the first element, replace the current element with the previous one
  if ( modifyIndex > 0 )
  {
    tempArrayTwo[ modifyIndex ] = tempArrayTwo[ modifyIndex - 1 ] ;
  }

  // Join the elements of the first modified array into a string and process it
  sequenceReducer( tempArrayOne.join( "" ) ) ;

  // Join the elements of the second modified array into a string and process it
  sequenceReducer( tempArrayTwo.join( "" ) ) ;
}

// Output the smallest sequence length achieved after all modifications and reductions
console.log( shortestLength ) ;