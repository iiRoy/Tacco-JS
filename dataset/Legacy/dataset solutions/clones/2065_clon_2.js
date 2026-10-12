function ProcessInput(dataString) {
    // This string contains a predefined sequence of numbers, comma-separated.
    var numberSequenceString = "1, 1, 1, 2, 1, 2, 1, 5, 2, 2, 1, 5, 1, 2, 1, 14, 1, 5, 1, 5, 2, 2, 1, 15, 2, 2, 5, 4, 1, 4, 1, 51";

    // We split the sequence string into an array of string representations of numbers.
    var splitNumberArray = numberSequenceString.split(",");

    // The 'dataString' parameter is expected to be a 1-based index.
    // We convert the corresponding array element to an integer and print it.
    console.log(parseInt(splitNumberArray[dataString - 1]));
}

// The main execution point: read input from standard input and pass it to our processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
