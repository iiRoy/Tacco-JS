let inputSourceContent = require('fs').readFileSync('/dev/stdin', 'utf8');
let processedLines = (inputSourceContent.trim()).split("\n");
while ( true ) {
  let itemQuantity = parseInt( processedLines.shift() );
  if ( itemQuantity === 0 ) break;
  let validationState = "GOOD";
  let collectedDataItems = [ ];
  for ( let primaryIdx = 0; primaryIdx < itemQuantity; primaryIdx++ ) {
    let currentRecord = ( processedLines.shift() )
                                .split(" ")
                                .map( val => parseInt(val, 10) );
    collectedDataItems.push( currentRecord );
  }
  validationState = "GOOD";
  for ( let mainScanIdx = 0; mainScanIdx < itemQuantity; mainScanIdx++ ) {
    if ( validationState === "FAIL" ) break;
    let mainItemWeight = collectedDataItems[mainScanIdx][0];
    let mainItemStart = collectedDataItems[mainScanIdx][1];
    let mainItemEnd = collectedDataItems[mainScanIdx][2];
    for ( let secondaryScanIdx = 0; secondaryScanIdx < itemQuantity; secondaryScanIdx++ ) {
      if ( mainScanIdx === secondaryScanIdx ) continue;
      let secondaryItemWeight = collectedDataItems[secondaryScanIdx][0];
      let secondaryItemStart = collectedDataItems[secondaryScanIdx][1];
      let secondaryItemEnd = collectedDataItems[secondaryScanIdx][2];
      if ( mainItemStart <= secondaryItemEnd && mainItemEnd >= secondaryItemStart ) {
        mainItemWeight += secondaryItemWeight;
      }
      if ( mainItemWeight > 150 ) {
        validationState = "FAIL";
      }
    }
  }
  console.log( validationState );
}