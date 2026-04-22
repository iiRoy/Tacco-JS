( function ( rawData ) {

  let numberStrings = rawData.split(' ').map(Number);

  const firstOperand = numberStrings[0] ;
  var secondOperand = numberStrings[1];

  let quotientInteger = Math.floor( firstOperand / secondOperand ) ;
  const remainderValue = firstOperand % secondOperand ;
  var quotientFloat = firstOperand / secondOperand ;

  console.log( '%d %d %d' , quotientInteger , remainderValue , quotientFloat ) ;

} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;