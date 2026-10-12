function ProcessInput(dataArray) {
    // Parse the first integer value from the input array.
    var valX = parseInt(dataArray[0], 10);
    // Parse the second integer value.
    var valY = parseInt(dataArray[1], 10);
    // Parse the third integer value.
    var valZ = parseInt(dataArray[2], 10);
    // Parse the fourth integer value.
    var valW = parseInt(dataArray[3], 10);

    // Calculate the ceiling of the division of valZ by valY.
    var firstCount = Math.ceil(valZ / valY);
    // Calculate the ceiling of the division of valX by valW.
    var secondCount = Math.ceil(valX / valW);

    // Output 'Yes' if firstCount is less than or equal to secondCount, otherwise 'No'.
    console.log(firstCount <= secondCount ? 'Yes' : 'No');
}

// Read input from standard input, decode as UTF-8, trim whitespace, and split by newlines or spaces.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));
