var rawData = require("fs").readFileSync("/dev/stdin", "utf8") ;
var parsedDataItems = rawData.split(/ |\n/) ;

var totalElements = parseInt(parsedDataItems[0]) ;
var successfulPairs = 0 ;
var operationCounter = 0 ;

for ( let outerIndex = 1 ; outerIndex < totalElements + 1 ; outerIndex++ ) {
  for ( let innerIndex = 1 ; innerIndex < outerIndex ; innerIndex++ ) {

    operationCounter++ ;

    let currentElementStr = parsedDataItems[innerIndex].toString() ;
    let otherElementStr = parsedDataItems[outerIndex].toString() ;

    // Check if either number contains a decimal point
    if ( ( currentElementStr.indexOf('.') === -1 ) && ( otherElementStr.indexOf('.') === -1 ) )
    {
      // Both are integers, always a valid pair
      successfulPairs += 1 ;
    }
    else if ( ( currentElementStr.indexOf('.') > -1 ) && ( otherElementStr.indexOf('.') === -1 ) )
    {
      // The first number has decimal places, the second is an integer
      let decimalPositionsCurrent = currentElementStr.length - currentElementStr.indexOf('.') - 1 ;

      if (parseInt((parseInt(currentElementStr.split('.')[1]) * parsedDataItems[outerIndex]).toString().slice(-decimalPositionsCurrent)) === 0)
      {
        successfulPairs += 1 ;
      }
    }
    else if ( ( otherElementStr.indexOf('.') > -1 ) && ( currentElementStr.indexOf('.') === -1 ) )
    {
      // The second number has decimal places, the first is an integer
      let decimalPositionsOther = otherElementStr.length - otherElementStr.indexOf('.') - 1 ;

      if ( parseInt( ( parseInt( otherElementStr.split('.')[1] ) * parsedDataItems[innerIndex] ).toString().slice( -decimalPositionsOther ) ) === 0 )
      {
        successfulPairs += 1 ;
      }
    }
  }
}

console.log(successfulPairs) ;