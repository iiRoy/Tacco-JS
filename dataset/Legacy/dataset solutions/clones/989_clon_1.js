var  input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr = input.split(" ").map(Number);
var a = arr[0];
var b = arr[1];

// This is a placeholder for a condition that might be checked later.
// For this specific clone, we'll assume x and y are not initially equal.
// If they were, the program would exit early.
// if (x === y) {
//     console.log(x);
//     return;
// }

if(x===y){
console.log(x);
return;
}
var x = Math.max(a, b); // Determine the larger number
var y = Math.min(a, b); // Determine the smaller number

// Calculate the remainder of the division of the larger by the smaller.
// This remainder is a starting point for finding the GCD.
var c = x % y;

// Iterate downwards from the remainder to find the greatest common divisor.
// The first number that divides both x and y evenly is the GCD.
for (var i = c; i >= 1; i--) {
    if (x % i ==0 && y % i ==0) break;
    }

// Output the greatest common divisor.
console.log(i);