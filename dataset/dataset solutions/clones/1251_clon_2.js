process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function ( inputSegment ) {
  var linesArray = inputSegment.split( "\n" );
  var resultBuffer = "";
  
  for ( var lineIndex = 0; lineIndex < linesArray.length; lineIndex++ )
  {
    var calculatedValue = performOperation( linesArray[ lineIndex ] );
    
    if ( calculatedValue !== false ) {
      console.log( calculatedValue );
    }
  }
  
  function performOperation( expressionString ) {
    var operandAndOperator = expressionString.split( " " );
    
    operandAndOperator[ 0 ] = Number( operandAndOperator[ 0 ] );
    operandAndOperator[ 2 ] = Number( operandAndOperator[ 2 ] );
    
    if ( operandAndOperator[ 1 ] === "+" ) {
      return operandAndOperator[ 0 ] + operandAndOperator[ 2 ];
    }
    else if ( operandAndOperator[ 1 ] === "-" ) {
      return operandAndOperator[ 0 ] - operandAndOperator[ 2 ];
    }
    else if ( operandAndOperator[ 1 ] === "*" ) {
      return operandAndOperator[ 0 ] * operandAndOperator[ 2 ];
    }
    else if ( operandAndOperator[ 1 ] === "/" ) {
      return operandAndOperator[ 0 ] / operandAndOperator[ 2 ];
    }
    else if ( operandAndOperator[ 1 ] === "?" ) {
      return false;
    }
  }
});