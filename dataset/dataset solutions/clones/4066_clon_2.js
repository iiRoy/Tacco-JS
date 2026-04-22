// This function receives the entire input string.
function ProcessInputData( rawData ) {

  let parsedValues = rawData.split( ' ' );
  const firstNum = Number( parsedValues[0] );
  const secondNum = Number( parsedValues[1] );

  if ( ( firstNum * secondNum ) % 2 === 1 ) {
    console.log( 'Odd' );
  }
  else {
    console.log( 'Even' );
  }

}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
ProcessInputData( require("fs").readFileSync("/dev/stdin", "utf8") );