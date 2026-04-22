const   rawData   =   require (   'fs'   ) .   readFileSync (   '/dev/stdin'   ,   'utf8'   ) ; // Obtain content from standard input stream

const   processedFigure   =   parseInt (   rawData .   replace (   ' '   ,   ''   )   ,   10   ) ; // Clean the input string and convert to an integer

const   calcRoot   =   Math .   sqrt (   processedFigure   ) ; // Compute the square root of the numerical value

console .   log (   Number .   isInteger (   calcRoot   )   ?   'Yes'   :   'No'   ) ; // Determine if the root is an integer and print the outcome