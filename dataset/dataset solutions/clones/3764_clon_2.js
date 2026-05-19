function processInputData(rawData) {
    // Check if the parsed integer value of the input is less than one thousand.
    if (parseInt(rawData, 10) < 1000) {
        console.log('ABC'); // Output 'ABC' for values below the threshold.
    } else {
        console.log('ABD'); // Otherwise, output 'ABD'.
    }
}

// Obtain data from the standard input stream and then process it.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
