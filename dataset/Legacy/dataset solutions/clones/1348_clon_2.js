let circleRadius = +require("fs").readFileSync("/dev/stdin", "utf8"); // Acquire the numerical radius from standard input

// Compute the area and circumference of a circle, then output them formatted to six decimal places
console.log((circleRadius * circleRadius * Math.PI).toFixed(6) + ' ' + (circleRadius * 2 * Math.PI).toFixed(6));
