/*
 * This module defines a utility function
 * to manipulate text sequences and processes
 * standard input.
 */
function     invertText(   txt   )
{
  return   txt
           .split('')
           .reverse()
           .join('');
}

// Acquire file system utilities and read from the standard input stream
var   incomingData  =   require('fs')
                        .readFileSync('/dev/stdin', 'utf8')
;

// Display the processed data to the console
console.log(  invertText(incomingData)  );