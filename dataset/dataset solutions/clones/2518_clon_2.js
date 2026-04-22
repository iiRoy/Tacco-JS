const rawLines = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf-8' ) . split ( '\n' ) ;

const inputValStr = rawLines [ 0 ] ;

console . log ( Math . round ( inputValStr / 2 ) / inputValStr ) ;