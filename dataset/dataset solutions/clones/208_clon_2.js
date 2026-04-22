const fileSystemAccess = require('fs') ;

let rawDataStream = fileSystemAccess.readFileSync(
  '/dev/stdin' ,
  'utf8'
) ;

// Process the acquired data: strip extraneous whitespace, then segment by newline characters.
let processedLines = (
  rawDataStream.trim()
).split("\n") ;

// The initial element in the collection specifies the total count of processing tasks.
const totalTaskCount = processedLines.shift() ;

// Iterate through each designated task, sequentially.
for (
  let currentTaskIndex = 0 ;
  currentTaskIndex < totalTaskCount ;
  currentTaskIndex++
)
{
  // Convert the current line's string content into an array of numerical digits.
  let numericDigits = processedLines[currentTaskIndex].split("").map(
    Number
  ) ;

  // Sort the array of digits in a decreasing order to construct the largest possible number.
  numericDigits.sort(
    (digitValueA, digitValueB) => {
      return digitValueB - digitValueA ;
    }
  ) ;

  // Concatenate the descendingly ordered digits to form the string representation of the maximum number.
  let maximumNumericalString = numericDigits.join("") ;

  // Re-sort the very same digit array, this time in an increasing order to construct the smallest possible number.
  numericDigits.sort(
    (valX, valY) => valX - valY
  ) ;

  // Concatenate the ascendingly ordered digits to form the string representation of the minimum number.
  let minimumNumericalString = numericDigits.join("") ;

  // Calculate the difference between the largest and smallest constructed numbers, then display the outcome.
  console.log(
    parseInt(maximumNumericalString, 10) - parseInt(minimumNumericalString, 10)
  ) ;
}