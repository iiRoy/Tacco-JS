const addValues = ( firstOperand , secondOperand ) =>
{
  return firstOperand + secondOperand ;
};

const fileContent = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;
const numberCollection = ( fileContent . trim ( ) ) . split ( '\n' ) . map ( Number ) ;
let accumulatorVar = 0 ;

console . log ( numberCollection . reduce ( addValues ) ) ;