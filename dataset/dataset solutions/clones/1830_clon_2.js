const   dataSource = require ( 'fs' )
  . readFileSync ( '/dev/stdin' ,
                   'utf8' )
  . split ( '\n' )
; // Reads the entire input from standard input, then splits it into an array of lines.

const targetString = dataSource [ 0 ] ; // Retrieves the very first line of the input for processing.

const patternToFind = / [ ? | P ] [ ? | D ] /g ; // Sets up a global regular expression to match '?' or 'P' followed by '?' or 'D'.

console . log ( targetString . replace ( patternToFind , 'PD' ) ) ; // Replaces all occurrences of the defined pattern with "PD" in the target string and prints the final result.