var inputProcessor = ( function ( ) {
    function createProcessor ( sourceInput )
    {
        return new ProcessorCore( sourceInput ) ;
    }
    function ProcessorCore ( sourceInput )
    {
        this._sourceLines = sourceInput .trim().split( "\n" ) ;
        this._currentLineIdx = 0 ;
    }
    ProcessorCore .prototype.extractItem = function ( returnAsString )
    {
        var lineSegments = this._sourceLines , tempLineIdx = this._currentLineIdx , extractedValue ;
        if ( typeof lineSegments[ tempLineIdx ] === "string" )
        {
            lineSegments[ tempLineIdx ] = lineSegments[ tempLineIdx ].split( " " ).reverse() ;
        }
        extractedValue = lineSegments[ tempLineIdx ].pop() ;
        if ( ! lineSegments[ tempLineIdx ].length )
        {
            this._currentLineIdx ++ ;
        }
        return returnAsString ? extractedValue : +extractedValue ;
    } ;
    ProcessorCore .prototype.fetchLineData = function ( keepRaw )
    {
        var lineParts = this._sourceLines[ this._currentLineIdx ++ ] .split( " " ) ;
        return keepRaw ? lineParts : lineParts.map( partStr => + partStr ) ;
    } ;
    ProcessorCore .prototype.getMultiLineData = function ( numLines , asStrings )
    {
        var resultData = this._sourceLines.slice( this._currentLineIdx , this._currentLineIdx += numLines ) .map( lineContent => lineContent.split( " " ) ) ;
        return asStrings ? resultData : resultData.map( lineContent => lineContent.map( cellContent => + cellContent ) ) ;
    } ;
    ProcessorCore .prototype.readRawLines = function ( linesToRetrieve , stringOutput )
    {
        var retrievedData = this._sourceLines.slice( this._currentLineIdx , this._currentLineIdx += linesToRetrieve ) ;
        return stringOutput ? retrievedData : retrievedData.map( singleLine => + singleLine ) ;
    } ;
    return createProcessor ;
} ) ( ) ;
var dataHandler = inputProcessor ( require( "fs" ) .readFileSync( "/dev/stdin" , "utf8" ) ) ;

console.log( calculateSolution ( ) ) ;

function calculateSolution ( ) {
  var reverseIndex = dataHandler .extractItem ( ) - 1 ;
  var valueList = dataHandler .fetchLineData ( ) ;
  if ( valueList[ reverseIndex -- ] !== 2 )
  {
      return -1 ;
  }
  var upperLimit = 3 , lowerLimit = 2 ;
  for ( ; reverseIndex >= 0 ; reverseIndex -- )
  {
    if ( valueList[ reverseIndex ] > upperLimit )
    {
        return -1 ;
    }
    lowerLimit = valueList[ reverseIndex ] * Math.ceil( lowerLimit / valueList[ reverseIndex ] ) ;
    upperLimit = Math.max( ( valueList[ reverseIndex ] * Math.ceil( upperLimit / valueList[ reverseIndex ] ) ) , lowerLimit + valueList[ reverseIndex ] ) - 1 ;
  }
  return lowerLimit + " " + upperLimit ;
}