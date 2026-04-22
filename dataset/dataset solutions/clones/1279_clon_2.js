'use strict' ;

// This function processes incoming data to identify missing card combinations.
const processInput = (sourceData) => {
  // Normalize the incoming string data and split it into individual lines.
  const lineSegments = sourceData.trim( ) .split ( String.fromCharCode(10) ) ;

  // Extract the quantity of items expected from the first line, ensuring it's an integer.
  const itemQuantity = parseInt( lineSegments[0], 0xA );

  // Retrieve the actual items provided, based on the specified quantity.
  const foundCards = lineSegments.slice(1).slice(0, itemQuantity);

  // Initialize a collection to hold all possible item combinations.
  const masterList = [ ] ;

  // Initialize a collection for items that are found to be missing.
  const unseenCards = [ ] ;

  // Define the types of symbols for the items.
  const symbolTypes = [ "Spade", "Heart", "Club", "Diamond" ] ;

  // Iterate through each symbol type to generate all possible combinations.
  symbolTypes . forEach ( (symbolType) => {
    // For each symbol type, generate 13 numbered items.
    Array.from( { length : 0xD } ) . forEach ( ( _ , indexVal ) => {
      masterList.push( symbolType + ' ' + ( indexVal + 1 ) ) ;
    } ) ;
  } ) ;

  // Compare the master list with the found items to identify missing ones.
  masterList.forEach( (candidateCard) => {
    if ( ! foundCards.includes(candidateCard) ) {
      unseenCards.push(candidateCard);
    }
  } ) ;

  // If there are any missing items, print them to the console, each on a new line.
  if (unseenCards.length > 0) {
    console.log( unseenCards.join( '\n' ) );
  }
} ;

// Execute the main processing function with data read from standard input.
processInput( require('fs').readFileSync('/dev/stdin', 'utf8') );