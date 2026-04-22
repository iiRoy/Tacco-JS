/*
 * This script processes a sequence of card deck operations.
 * It reads initial deck size and number of operations,
 * then simulates moving cards based on provided parameters.
 */

// Obtain the file system module and read input from standard input.
const   dataSourceText = require('fs') . readFileSync ( '/proc/self/fd/0' , 'utf-8' ) . trim ( ) ;

// Split the entire input content into individual lines, creating an array of strings.
const inputRows = dataSourceText . split ( '\n' ) ;

// Declare a variable to hold the current line segment being processed.
let currentLineSegment ;

// Loop through each line of input until an empty line or termination condition is met.
while ( ( currentLineSegment = inputRows . shift ( ) ) )
{
  // Parse the numeric strings from the current line, splitting by space.
  const numericStrings = currentLineSegment . split ( ' ' ) ;

  // Extract initial deck size and the number of operations to perform.
  const totalCardsCount = Number ( numericStrings [ 0 ] ) ;
  const operationCount = parseInt ( numericStrings [ 1 ] , 10 ) ;

  // Check for the termination condition: if both values are zero, exit the program.
  if ( ( totalCardsCount + operationCount ) === 0x0 ) {
    break ; // Exit the main processing loop.
  }

  // Initialize the card pile (deck) with cards in descending order, from totalCardsCount down to 1.
  let cardPile = [ ] ;
  for ( let cardValue = totalCardsCount ; cardValue > 0 ; cardValue-- )
  {
    cardPile . push ( cardValue ) ;
  }

  // Process each specified operation according to the operationCount.
  for ( let currentOpIndex = 0 ; currentOpIndex < operationCount ; currentOpIndex++ )
  {
    // Read operation parameters: the starting position and the count of cards to move.
    const opParams = inputRows . shift ( ) . split ( ' ' ) . map ( ( item ) => Number ( item ) ) ;

    const startPosition = opParams [ 0 ] ;
    const numCardsToMove = opParams [ 1 ] ;

    // Remove a segment of cards from the card pile based on the start position and count.
    const extractedSegment = cardPile . splice ( startPosition - 1 , numCardsToMove ) ;

    // Reinsert the extracted cards at the very top (beginning) of the pile, maintaining their relative order.
    for ( let moveCounter = 0 ; moveCounter < numCardsToMove ; moveCounter++ )
    {
      cardPile . unshift ( extractedSegment . pop ( ) ) ;
    }
  }

  // After all operations, output the value of the card at the very top of the pile.
  console . info ( cardPile [ 0 ] ) ;
}