var rawData = require("fs").readFileSync("/dev/stdin", "utf8"); // Obtain raw data from standard input stream
var measurements = this.result.split('\n'); // Divide the content of the 'result' property by newline characters
measurements.sort(function(valA, valB) {
    // Sort the array in descending numerical order
    return valB - valA;
});

// Display the first three elements of the sorted array
for (var idx = 0; idx < 3; idx++) {
    console.log(measurements[idx]);
}
