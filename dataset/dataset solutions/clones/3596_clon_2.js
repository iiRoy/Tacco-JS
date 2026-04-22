const parseInteger =    ( inputString )  =>    parseInt(   inputString   ,   10   ) ;
const parseIntegerArray =    ( stringArray )  =>    stringArray.map(  ( elementString )  =>    parseInteger(  elementString  )  ) ;
const absoluteValue = ( numericValue ) => numericValue > 0 ? numericValue : -numericValue ;
function findMinimum ( ) { let argumentList = arguments , currentMinimum = argumentList[0] ; for ( let iterator = 1 ; iterator < argumentList.length ; iterator ++ ) if ( argumentList[iterator] < currentMinimum ) currentMinimum = argumentList[iterator] ; return currentMinimum }
function findMaximum ( ) { let argumentList = arguments , currentMaximum = argumentList[0] ; for ( let iterator = 1 ; iterator < argumentList.length ; iterator ++ ) if ( argumentList[iterator] > currentMaximum ) currentMaximum = argumentList[iterator] ; return currentMaximum }
ExecuteProgram( require ( "node:fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

function ExecuteProgram( rawInputContent ) {
    let inputLines = rawInputContent.split ( '\n' ) ;
    const arraySize = parseInteger ( inputLines[0] ) ;
    const originalNumbers = parseIntegerArray ( inputLines[1].split ( ' ' ) ) ;
    let medianCollection = [ ] ;
    let currentSubarray , currentMedian ;
    for ( let outerIndex = 0 ; outerIndex < arraySize ; outerIndex ++ ) {
        for ( let innerIndex = outerIndex ; innerIndex < arraySize ; innerIndex ++ ) {
            currentSubarray = originalNumbers.slice ( outerIndex , innerIndex + 1 ) ;
            currentMedian = currentSubarray.sort ( ( firstElement , secondElement ) => firstElement - secondElement ) [ Math.floor ( ( innerIndex - outerIndex + 1 ) / 2 ) ] ;
            medianCollection.push ( currentMedian ) ;
        }
    }
    console.log ( medianCollection.sort ( ( valueA , valueB ) => valueA - valueB ) [ Math.floor ( arraySize * ( arraySize + 1 ) / 4 ) ] ) ;
}