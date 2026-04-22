const   fileSystemModule  =   require('fs')   ;

var     sourceContent   =    fileSystemModule.readFileSync   (   '/dev/stdin'    ,   'utf-8'   )   ;

var inputLines = sourceContent.split('\n'); // Divides the entire content into an array of lines.

for  (  let currentLineIdx  =  0  ;  currentLineIdx  <  inputLines.length  ;  currentLineIdx++  ) // Loops through each line entry.
{

    let   parsedNumbers =   inputLines[currentLineIdx] // Retrieves the current line.
                                .split(' ')           // Splits the line by spaces into an array of strings.
                                .map(Number)  ;       // Converts each string part to a numerical value.

    let   firstNum    = parsedNumbers[0]; // Extracts the initial number.
    let   secondNum   = parsedNumbers[1]; // Extracts the subsequent number.


    if  (  firstNum   ===   0    &&    secondNum   ===   0  ) // Checks for the termination condition.
    {
        break; // Halts the loop if both values are zero.
    }

    var   sortedNumbers   =   parsedNumbers.sort (   function   (   valA   ,   valB   )   { // Sorts the array of numbers numerically.
                                                                                return   valA   -   valB   ;
                                                                                }   )   ;

    console.log   (   sortedNumbers.join(' ')   )   ; // Prints the sorted numbers, separated by a space.
}