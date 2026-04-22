var deckBuilder = function()
{
  var generatedCards = [ ] ;
  const cardSuits = [ 'Spades', 'Hearts', 'Clubs', 'Diamonds' ] ;
  let cardRanks = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13 ] ;

  for ( let suitIndex = 0 ; suitIndex < cardSuits.length ; suitIndex++ )
  {
    for ( let rankIndex = 0 ; rankIndex < cardRanks.length ; rankIndex++ )
    {
      generatedCards.push( cardSuits[suitIndex].charAt(0) + ' ' + cardRanks[rankIndex].toString() ) ;
    }
  }

  return generatedCards ;
} ;

var readExternalData = function ( )
{
  return require('fs').readFileSync( '/dev/stdin', 'utf8' ).split('\n') ;
} ;

var displayResult = function ( outputValue )
{
  console.log( outputValue ) ;
  return outputValue ;
} ;

let receivedLines = readExternalData() ;

deckBuilder()
  .filter( ( itemToProcess ) =>
  {
    return receivedLines.indexOf( itemToProcess ) === -1 ;
  } )
  .forEach( displayResult ) ;