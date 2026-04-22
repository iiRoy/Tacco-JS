// Obtain the raw content from the standard input stream
var   dataStream = require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;

// Process the acquired text: remove leading/trailing whitespace, split by space, and convert to numeric values
var   valueContainer  = dataStream . trim ( ) . split ( " " ) . map ( Number ) ;

// Compute the average of the first two processed numbers and output the result
console . log ( (  valueContainer [ 0 ]   +   valueContainer [ 1 ]  )  /  2  ) ;