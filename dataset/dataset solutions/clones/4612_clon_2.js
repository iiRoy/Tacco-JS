function convertToInt ( inputString ) { return Number.parseInt(inputString); }

function convertToFloat ( textValue ) {
  return Number.parseFloat(textValue);
}

Array.prototype.orderNumbersAscending       = function () {
  return this.sort( ( firstElement, secondElement ) => ( firstElement - secondElement ) );
}

Array.prototype.orderNumbersDescending      = function () {
  return this.sort( ( firstElement, secondElement ) => ( secondElement - firstElement ) );
}

Array.prototype.orderStringsAlphabetically  = function () { return this.sort(); }

Array.prototype.orderStringsReverseAlphabetically = function () {
  return this.sort().reverse();
}

Array.prototype.removeSpecificItem = function ( itemToRemove ) {
  return this.filter( ( currentElement ) => currentElement !== itemToRemove );
}

let receivedData = '';

process.stdin.resume();
process.stdin.setEncoding( 'utf8' );

process.stdin.on( 'data', inputChunk => receivedData += inputChunk );

process.stdin.on( 'end', () => {
  const dataLines = receivedData.split( '\n' ).map( lineContent => lineContent.trim() );

  if ( dataLines[ dataLines.length - 1 ] === '' ) {
    dataLines = dataLines.slice( 0, -1 );
  }

  executeMainLogic( dataLines );
});


function executeMainLogic ( allInputLines ) {
  let processedNumbers      = allInputLines[0].split( ' ' ).map( convertToInt );
  const totalItems          = processedNumbers[0];
  const maxWeightCapacity   = processedNumbers[1];
  let maximumValueFound     = 0;

  const itemDetails         = allInputLines.slice( 1 ).map( lineText => lineText.split( ' ' ).map( convertToInt ) );

  function exploreCombinations ( currentIndex, currentTotalWeight, currentTotalValue, currentItemCount ) {
    if ( currentItemCount === totalItems ) {
      console.log( maximumValueFound );
      process.exit( 0 );
    }

    for ( let itemIndex = currentIndex, limit = totalItems; itemIndex < limit; itemIndex++ ) {
      const currentItemWeight = itemDetails[itemIndex][0];
      const currentItemValue  = itemDetails[itemIndex][1];

      if ( currentItemWeight + currentTotalWeight <= maxWeightCapacity ) {
        maximumValueFound = Math.max( maximumValueFound, currentItemValue + currentTotalValue );
        exploreCombinations( itemIndex + 1, currentItemWeight + currentTotalWeight, currentItemValue + currentTotalValue, currentItemCount + 1 );
      }
    }
  }

  exploreCombinations( 0, 0, 0, 0 );
  console.log( maximumValueFound );
}