var parseInteger = ( valueString ) => { return parseInt( valueString, 10 ) ; } ;
var convertStringsToNumbers = ( stringArray ) => stringArray . map ( itemString => parseInteger ( itemString ) ) ;
var absoluteValue = ( numberInput ) => numberInput > 0 ? numberInput : - numberInput ;
function findMinimum ( ) {
  var allArguments = arguments ,
      currentMinimum = allArguments[ 0 ] ;
  for ( var idx = 1 ; idx < allArguments . length ; idx ++ )
    if ( allArguments[ idx ] < currentMinimum )
      currentMinimum = allArguments[ idx ] ;
  return currentMinimum ;
}
function findMaximum ( ) {
  var allArguments = arguments ,
      currentMaximum = allArguments[ 0 ] ;
  for ( var idx = 1 ; idx < allArguments . length ; idx ++ )
    if ( allArguments[ idx ] > currentMaximum )
      currentMaximum = allArguments[ idx ] ;
  return currentMaximum ;
}
ProcessInputData ( require ( "node:fs" ) . readFileSync ( "/dev/fd/0" , 'utf-8' ) ) ;

function ProcessInputData ( rawData ) {
  var linesOfText = rawData . split ( '\n' ) ;
  var firstLineNumbers = convertStringsToNumbers ( linesOfText[0] . split ( ' ' ) ) ;
  var countElements = firstLineNumbers[ 0 ] ;
  var thresholdValue = firstLineNumbers[ 1 ] ;
  var elementValues = convertStringsToNumbers ( linesOfText[1] . split ( ' ' ) ) ;
  var prefixSums = [ elementValues[ 0 ] ] ;

  for ( var loopIndex = 1 ; loopIndex < countElements ; loopIndex ++ ) {
    prefixSums[ loopIndex ] = elementValues[ loopIndex ] + prefixSums[ loopIndex - 1 ] ;
  }
  var finalResult = ( countElements + 1 ) * thresholdValue ;

  var counterVariable = 0 ;
  for ( var reverseIndex = countElements - 1 ; reverseIndex > -1 ; reverseIndex -- ) {
    counterVariable ++ ;
    if ( counterVariable > 2 && thresholdValue <= prefixSums[ reverseIndex ] * ( counterVariable - 1 ) * 2 - elementValues[ reverseIndex ] * 2 ) {
      counterVariable = 1 ;
      finalResult += thresholdValue ;
    }
    finalResult += elementValues[ reverseIndex ] * ( findMaximum ( counterVariable , 2 ) * 2 + 1 ) ;
  }

  console . log ( finalResult ) ;

}