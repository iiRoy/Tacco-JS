var inputReader = initializeInput ( ) ;
executeProgram ( ) ;
function retrieveInteger ( ) { return transformData ( getNextLine ( ) , 1 ) ; }
function retrieveStringArray ( ) { return transformData ( getNextLine ( ) , 2 ) ; } // Divides by single spaces
function retrieveIntArray ( ) { return transformData ( getNextLine ( ) , 4 ) ; } // Splits by space and converts to numbers
function retrieveCharacterArray ( ) { return transformData ( getNextLine ( ) , 6 ) ; } // Splits into individual characters
function getNextLine ( ) { return inputReader . next ( ) ; }
function hasMoreLines ( ) { return inputReader . hasNext ( ) ; }
function readInputFile ( ) { return require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) . split ( "\n" ) ; }
function initializeInput ( ) {
  var inputLines = readInputFile ( ) ;
  var readerObject = {
    "lineBuffer" : inputLines ,
    "currentLineIndex" : 0 ,
    "totalLines" : inputLines . length ,
    "hasNext" : function ( ) { return ( this . currentLineIndex < this . totalLines ) ; } ,
    "next" : function ( ) {
      if ( ! this . hasNext ( ) ) {
        throw "InputOutOfBoundsException No more lines to read" ;
      } else {
        var currentLineContent = this . lineBuffer [ this . currentLineIndex ] ;
        this . currentLineIndex ++ ;
        return currentLineContent ;
      }
    }
  } ;
  return readerObject ;
}
function printOutput ( content ) { console . log ( content ) ; } // Outputs to standard console
function printError ( message ) { console . error ( message ) ; } // Outputs to error console
// Handling of [transformType] parameter. Numeric values.
// Unknown/error: return as-is. 1: Convert to integer.
// 2: Split by space. 4: Split by space and convert to number array.
// 6: Split by character. 7: Split by character and convert to number array.
// 8: Join with space. 9: Join with newline. 0: Join without separator.
function transformData ( inputValue , transformType ) {
  try {
    switch ( transformType ) {
      case 1 :
        return parseInt ( inputValue ) ;
      case 2 :
        return inputValue . split ( " " ) ;
      case 4 :
        return inputValue . split ( " " ) . map ( ( element ) => Number ( element ) ) ;
      case 6 :
        return inputValue . split ( "" ) ;
      case 7 :
        return inputValue . split ( "" ) . map ( ( element ) => Number ( element ) ) ;
      case 8 :
        return inputValue . join ( " " ) ;
      case 9 :
        return inputValue . join ( "\n" ) ;
      case 0 :
        return inputValue . join ( "" ) ;
      default :
        return inputValue ;
    }
  } catch ( processingError ) {
    return inputValue ;
  }
}
function executeProgram ( ) {
  var firstLineData = retrieveIntArray ( ) ;
  var targetHealth = firstLineData [ 0 ] ;
  var numSpells = firstLineData [ 1 ] ;
  var spellList = new Array ( numSpells ) ;
  for ( var spellIndex = 0 ; spellIndex < numSpells ; spellIndex ++ ) {
    var currentSpellData = retrieveIntArray ( ) ;
    spellList [ spellIndex ] = {
      "attackPower" : currentSpellData [ 0 ] ,
      "manaCost" : currentSpellData [ 1 ]
    } ;
  }
  var maxHealthBoundary = 100000 ;
  var minManaCostDP = new Array ( maxHealthBoundary ) ;
  minManaCostDP [ 0 ] = 0 ;
  for ( var i = 0 ; i < numSpells ; i ++ ) {
    for ( var currentHealth = 0 ; currentHealth < targetHealth ; currentHealth ++ ) {
      if ( minManaCostDP [ currentHealth ] != null ) {
        if ( ! minManaCostDP [ currentHealth + spellList [ i ] [ "attackPower" ] ] ) {
          minManaCostDP [ currentHealth + spellList [ i ] [ "attackPower" ] ] = minManaCostDP [ currentHealth ] + spellList [ i ] [ "manaCost" ] ;
        } else {
          minManaCostDP [ currentHealth + spellList [ i ] [ "attackPower" ] ] = Math . min ( minManaCostDP [ currentHealth + spellList [ i ] [ "attackPower" ] ] , minManaCostDP [ currentHealth ] + spellList [ i ] [ "manaCost" ] ) ;
        }
      }
    }
  }
  var infiniteValue = 1000000007 ;
  if ( ! minManaCostDP [ maxHealthBoundary ] ) {
    minManaCostDP [ maxHealthBoundary ] = infiniteValue ;
  }
  // printError(minManaCostDP); // Debugging line
  for ( var healthValue = maxHealthBoundary - 1 ; healthValue >= 0 ; healthValue -- ) {
    if ( minManaCostDP [ healthValue ] ) {
      minManaCostDP [ healthValue ] = Math . min ( minManaCostDP [ healthValue ] , minManaCostDP [ healthValue + 1 ] ) ;
    } else {
      minManaCostDP [ healthValue ] = minManaCostDP [ healthValue + 1 ] ;
    }
  }
  printOutput ( minManaCostDP [ targetHealth ] ) ;
}