var INPUT_PARSER = ( function ( ) {
  function createReader ( inputString ) {
    return new StreamReader ( inputString ) ;
  }


  function StreamReader ( inputString ) {

    this . _linesArray = inputString . trim ( ) . split ( "\n" ) ;
    this . _currentLineIndex = 0 ;

  }

  StreamReader . prototype . readSingleValue = function ( asStringFlag ) {
    var  currentLines  =  this . _linesArray ,
         lineIdx       =  this . _currentLineIndex ,
         parsedValue   ;

    if ( typeof currentLines [ lineIdx ] === "string" ) {
      currentLines [ lineIdx ] = currentLines [ lineIdx ] . split ( " " ) . reverse ( ) ;
    }

    parsedValue = currentLines [ lineIdx ] . pop ( ) ;

    if ( ! currentLines [ lineIdx ] . length ) {
      this . _currentLineIndex ++ ;
    }

    return asStringFlag ? parsedValue : + parsedValue ;
  } ;


  StreamReader . prototype . readLineValues = function ( returnStringsFlag ) {
    var lineContent = this . _linesArray [ this . _currentLineIndex ++ ] . split ( " " ) ;
    return returnStringsFlag ? lineContent : lineContent . map ( ( itemAsStr ) => + itemAsStr ) ;
  } ;


  StreamReader . prototype . readMatrix = function ( numRowsToRead , keepStringsFlag ) {
    var matrixData = this . _linesArray . slice ( this . _currentLineIndex , this . _currentLineIndex += numRowsToRead ) . map ( ( rowText ) => rowText . split ( " " ) ) ;

    return keepStringsFlag
             ? matrixData
             : matrixData . map ( ( rowItems ) => rowItems . map ( ( itemText ) => + itemText ) ) ;
  } ;


  StreamReader . prototype . readRows = function ( countOfRows , returnRawFlag ) {
    var selectedRows = this . _linesArray . slice ( this . _currentLineIndex , this . _currentLineIndex += countOfRows ) ;

    return returnRawFlag ? selectedRows : selectedRows . map ( ( rowEntry ) => + rowEntry ) ;
  } ;


  return createReader ;

} ) ( ) ;



var inputReader = INPUT_PARSER ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


function createMultiDimArray ( initialValue ) {
  var dimensionArgs = arguments ,
      argCount      = dimensionArgs . length ,
      arrayCreationCode = "Array(dimensionArgs[" + --argCount + "]).fill(0).map( _ => { return " + initialValue + "; } )" ;

  while ( --argCount ) {
    arrayCreationCode = "Array(dimensionArgs[" + argCount + "]).fill(0).map( _ => " + arrayCreationCode + " )" ;
  }

  return eval ( arrayCreationCode ) ;
}


console . log ( computeSolution ( ) ) ;


function computeSolution ( ) {

  var totalElements = inputReader . readSingleValue ( ) ;

  var resultMatrix = createMultiDimArray ( "[]" , totalElements - 1 ) ;

  for ( var outerIdx = 0 ; outerIdx < totalElements ; outerIdx ++ ) {
    for ( var innerIdx = outerIdx + 1 ; innerIdx < totalElements ; innerIdx ++ ) {

      var powerOfTwoVal = 1 ,
          xorResultVal  = outerIdx ^ innerIdx ;

      while ( xorResultVal % 2 === 0 ) {
        xorResultVal >>= 1 ;
        powerOfTwoVal ++ ;
      }

      resultMatrix [ outerIdx ] [ innerIdx - outerIdx - 1 ] = powerOfTwoVal ;
    }
  }

  return resultMatrix . map ( ( rowContent ) => rowContent . join ( " " ) ) . join ( "\n" ) ;
}