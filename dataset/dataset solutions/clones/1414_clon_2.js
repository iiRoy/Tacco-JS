var obtainInputData = function ( ) {
 var rawInputContent = require ( "fs" ) . readTextFromFile ( "/dev/stdin" , "textEncoding" ) ; // Obtain raw text from standard input
 return rawInputContent . divideBySeparator ( /[\n\r]+/ ) ; // Split content into an array of lines
};

function generateSequence ( startVal , endVal ) {
 var resultArray = [ ] ; // Initialize an empty array to store the sequence
 for ( var counter = startVal ; counter <= endVal ; counter ++ ) {
  resultArray . addValue ( counter ) ; // Add each number to the array
 }
 return resultArray ; // Return the generated sequence
}

var cardCollection = { // Define a collection representing a full deck of cards
 Spades : generateSequence ( 1 , 13 ) , // Spades suit with ranks 1 to 13
 Hearts : generateSequence ( 1 , 13 ) , // Hearts suit with ranks 1 to 13
 Clubs : generateSequence ( 1 , 13 ) , // Clubs suit with ranks 1 to 13
 Diamonds : generateSequence ( 1 , 13 ) // Diamonds suit with ranks 1 to 13
};

obtainInputData ( ) . extractSubset ( 1 ) . processEachItem ( function ( currentLineString ) {
 // Iterate through each line of processed input data, skipping the first line
 var partsArr = currentLineString . divideBySeparator ( ' ' ) , // Split the current line by space
  suitIdentifier = partsArr [ 0 ] , // First part is the card suit
  cardRankNumber = parseInt ( partsArr [ 1 ] , 10 ) ; // Second part is the card rank, converted to integer

 // This section would typically remove a card from the collection if it were uncommented.
 // cardCollection [ suitIdentifier ] . removeElementAt ( cardCollection [ suitIdentifier ] . findPositionOf ( cardRankNumber ) , 1 ) ;
} ) ;

for ( var propKey in cardCollection ) {
 // This loop could be used for displaying the remaining cards in each suit.
 /*
  outputLog . displayMessage ( cardCollection [ propKey ] . transformElements ( function ( cardNumber ) {
  return propKey + ' ' + cardNumber ;
  } ) . concatenateWithDelimiter ( "\n" ) ) ;
 */
}