function convertToInteger( txtInput ) {  return  parseInt( txtInput );  }

function convertToFloat( txtInput )
{
  return parseFloat( txtInput );
}

Array.prototype.orderNumericAscending = function()
{
  return this.sort( ( valA, valB ) => ( valA - valB ) );
};

Array.prototype.orderNumericDescending = function()
{
  return this.sort( ( valA, valB ) => ( valB - valA ) );
};

Array.prototype.orderLexicographicallyAscending = function()
{
  return this.sort();
};

Array.prototype.orderLexicographicallyDescending = function()
{
  return this.sort().reverse();
};

Array.prototype.removeItemMatching = function( itemToExclude )
{
  return this.filter( ( currentElement ) => currentElement !== itemToExclude );
};

let dataBuffer = '';

process.stdin.resume();

process.stdin.setEncoding( 'utf8' );

process.stdin.on( 'data', ( dataSegment ) => {
  dataBuffer += dataSegment;
} );

process.stdin.on( 'end', () =>
{
  let textLines = dataBuffer.split('\n').map( ( currentLineItem ) => currentLineItem.trim() );
  if ( textLines[textLines.length - 1] === '' )
  {
    textLines = textLines.slice( 0, -1 );
  }
  executeProgram( textLines );
} );

function executeProgram( processedLines )
{
  let [ firstWord, secondWord, thirdWord ] = processedLines[0].split( ' ' ).map( ( segment ) => segment.trim() );

  console.log(
    ( firstWord[firstWord.length - 1] === secondWord[0] &&
      secondWord[secondWord.length - 1] === thirdWord[0] )
      ? "YES"
      : "NO"
  );
}