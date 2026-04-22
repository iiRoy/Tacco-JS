var DATA_PARSER = ( function ( ) {
  function createParser( sourceString ) {
    return new InputProcessor( sourceString ) ;
  }

  function InputProcessor( sourceString ) {
    this . _lineData = sourceString . trim ( ) . split ( '\n' ) ;
  }

  InputProcessor . prototype . getSingleLine = function ( lineIdx ) {
    return this . _lineData[ lineIdx ] ;
  } ;

  InputProcessor . prototype . getLineAsNumbers = function ( lineIdx ) {
    return this . convertToNumberArray ( this . _lineData[ lineIdx ] ) ;
  } ;

  InputProcessor . prototype . extractRange = function ( startIndex , itemCount ) {
    return this . _lineData . slice ( startIndex , + itemCount + startIndex || undefined ) . map (
      lineVal => this . convertToNumericOrString ( lineVal )
    ) ;
  } ;

  InputProcessor . prototype . extractRangeAsNumbers = function ( startIndex , itemCount ) {
    return this . _lineData . slice ( startIndex , + itemCount + startIndex || undefined ) . map (
      lineVal => this . convertToNumberArray ( lineVal )
    ) ;
  } ;

  InputProcessor . prototype . convertToNumberArray = function ( inputString ) {
    return inputString . split ( ' ' ) . map (
      valItem => this . convertToNumericOrString ( valItem )
    ) ;
  } ;

  InputProcessor . prototype . convertToNumericOrString = function ( inputVal ) {
    var parsedValue = + inputVal ;
    return ( parsedValue === parsedValue ) ? parsedValue : inputVal ;
  } ;

  return createParser ;
} ) ( ) ;

var inputReader = DATA_PARSER ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;

console . log ( executeSolution ( ) ) ;

function executeSolution ( ) {
  var firstLineData = inputReader . getLineAsNumbers ( 0 ) ;
  var totalItems = firstLineData[ 0 ] ;
  var numConditions = firstLineData[ 1 ] ;

  var conditionData = inputReader . extractRangeAsNumbers ( 1 ) ;
  var processedConditions = [ ] ;
  var targetMask = 0 ;

  for ( var itemCounter = totalItems ; itemCounter > 0 ; itemCounter -- ) {
    targetMask += 1 << itemCounter ;
  }

  for ( var dataIndex = 0 ; numConditions * 2 > dataIndex ; dataIndex = dataIndex + 2 ) {
    processedConditions . push ( {
      cost : conditionData[ dataIndex ][ 0 ] ,
      mask : conditionData[ dataIndex + 1 ] . reduce ( function ( accumulator , currentBit ) {
        return accumulator | 1 << currentBit ;
      } , 0 )
    } ) ;
  }

  var possibleCosts = calculateCombinations ( targetMask , processedConditions ) ;
  if ( possibleCosts . length === 0 ) {
    return -1 ;
  }

  var sortedResults = possibleCosts . sort ( function ( costA , costB ) {
    return costA - costB ;
  } ) ;

  return sortedResults[ 0 ] ;
}

function calculateCombinations ( desiredMask , availableConditions , currentCombination ) {
  var currentAccumulation = {
    accumulatedCost : !! currentCombination ? currentCombination . cost : 0 ,
    accumulatedMask : !! currentCombination ? currentCombination . mask : 0
  } ;

  var foundCosts = [ ] ;
  for ( var conditionIndex = 0 ; availableConditions . length > conditionIndex ; conditionIndex ++ ) {
    var singleCondition = availableConditions[ conditionIndex ] ;
    var nextCombination = {
      accumulatedCost : currentAccumulation . accumulatedCost + singleCondition . cost ,
      accumulatedMask : currentAccumulation . accumulatedMask | singleCondition . mask
    } ;

    if ( nextCombination . accumulatedMask === desiredMask ) {
      foundCosts . push ( nextCombination . accumulatedCost ) ;
    }

    foundCosts = foundCosts . concat (
      calculateCombinations ( desiredMask , availableConditions . slice ( 1 ) , nextCombination )
    ) ;
  }

  return foundCosts ;
}