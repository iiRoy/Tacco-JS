let  sourceContent  = require('fs')
    .readFileSync('/dev/stdin' ,
    'UTF-8'
    )
;
// Read raw input data from standard input stream.

const firstValue = Number(sourceContent.split(' ')[0]);
// Convert the first segment of the input to a number.
const secondValue = Number(sourceContent.split(' ')[1]);
// Convert the second segment of the input to a number.
const thirdValue = Number(sourceContent.split(' ')[2]);
// Convert the third segment of the input to a number.

/*
 * Check if the three numeric values are in strictly ascending order.
 * That is, if the first is less than the second, AND the second is less than the third.
 */
if (
    firstValue < secondValue &&
    secondValue < thirdValue
) {
    console.log('Yes'); // Output 'Yes' if the condition holds true.
}
else {
    console.log('No');  // Otherwise, output 'No'.
}
// End of program logic.