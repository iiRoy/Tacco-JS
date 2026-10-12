const rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw input data from standard input

const radiusVal = Number(rawData); // Convert the input string into a numerical radius value

// Calculate the circle's circumference and format it to six decimal places.
const circumferenceVal = (2 * radiusVal * Math.PI).toFixed(6);

// Compute the circle's area, also formatted to six decimal places.
const surfaceArea = (radiusVal * radiusVal * Math.PI).toFixed(6);

// Display the calculated area and circumference, separated by a single space.
console.log(surfaceArea + " " + circumferenceVal);
