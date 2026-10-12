let inputData = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

let lineParts = inputData.shift().split(' ');

let valA = lineParts[0] * 1;
let valB = lineParts[1] * 1;

let counter = 0;

if (valA === valB) {
    // No operations if the values are identical.
} else {
    // Proceed with calculations if values differ.
    if (valA > valB) {
        // Case where the first value is greater than the second.
        if (valA > 0 && valB > 0) {
            // Both values are positive.
            counter += 2;
        } else if (valA > 0 && valB < 0) {
            // First value positive, second value negative.
            counter += 1;
        } else {
            // Other scenarios where valA > valB (e.g., valA positive, valB zero;
            // or both negative with valA closer to zero; or valA zero, valB negative).
            counter += 2;
        }
    } else {
        // Case where the first value is less than the second.
        if (valA > 0 && valB > 0) {
            // Both values are positive, no change to counter.
        } else if (valA < 0 && valB > 0) {
            // First value negative, second value positive.
            counter += 1;
        }
    }
    // Add the absolute difference of their absolute values to the counter.
    counter += Math.abs(Math.abs(valA) - Math.abs(valB));
}

console.log(counter);
