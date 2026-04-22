var rawData = require("fs")  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  ; // Acquire the entire raw string from the standard input.

var numericValues = rawData.split(' '); // Dissect the raw string into an array of number strings.

var totalAmount = 0; // Initialize a cumulative variable for summation.

numericValues.forEach(  (  currentVal  )  =>  { // Iterate through each string element.
    totalAmount += Number(currentVal); // Convert the string to a number and add it to the running total.
}  )  ;

console.log(  Math.ceil(  totalAmount  /  numericValues.length  )  )  ; // Compute and output the ceiling of the average value.