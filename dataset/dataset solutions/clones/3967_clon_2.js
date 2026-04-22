'use strict'
// This function is designed to process an input string,
// perform some calculations, and then display the result.
function handleDataProcessing ( rawInputString ) {

  // First, parse the entire input by splitting it into distinct lines.
  rawInputString = rawInputString.split( '\n' ) ;

  // The very first line contains a number that dictates the size of a segment.
  const numericalIndicator = Number( rawInputString[0] ) ;

  // Extract the primary collection of strings based on the numerical indicator.
  const firstCollection = rawInputString.slice( 1, 1 + numericalIndicator ) ;

  // Extract the secondary collection of strings, skipping a few lines.
  const secondCollection = rawInputString.slice( numericalIndicator + 2, -1 ) ;

  // Initialize an array to store aggregated item counts.
  const itemAggregates = [ ] ;

  // Iterate through each element in the primary collection.
  firstCollection.forEach( ( currentElement, elementIndex, completeList ) => {
    // If this is the first time we encounter this specific element,
    // add it to our aggregates with an initial count of one.
    if ( completeList.indexOf( currentElement ) === elementIndex ) {
      itemAggregates.push( { itemIdentifier: currentElement, currentTally: 1 } ) ;
    }
    // Otherwise, locate the existing aggregate record for this element
    // and increment its count.
    else {
      itemAggregates.forEach( ( existingAggregate ) => {
        if ( currentElement === existingAggregate.itemIdentifier ) existingAggregate.currentTally += 1
      } ) ;
    }
  } ) ;

  // Now, iterate through each element in the secondary collection.
  secondCollection.forEach( ( elementToDecrement ) => {
    // For each element, find its corresponding aggregate record
    // and reduce its count by one.
    itemAggregates.forEach( ( aggregateToModify ) => {
      if ( elementToDecrement === aggregateToModify.itemIdentifier ) aggregateToModify.currentTally -= 1
    } ) ;
  } ) ;

  // Sort the aggregate records in descending order based on their tallies.
  itemAggregates.sort( ( entryOne, entryTwo ) => entryTwo.currentTally - entryOne.currentTally ) ;

  // Calculate the final answer: it's either the highest tally if it's non-negative,
  // or zero if the highest tally is negative.
  const ultimateAnswer = ( itemAggregates[0].currentTally >= 0 ) ? itemAggregates[0].currentTally : 0 ;
  // Display the computed ultimate answer.
  console.log( ultimateAnswer ) ;
}

// Initiate the data processing by reading content from standard input.
handleDataProcessing( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;