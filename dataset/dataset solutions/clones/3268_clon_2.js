// This function is designed to handle and process the incoming string data.
function ProcessInputData(rawDataString) {
    // The input string is split into an array of substrings using space as a delimiter.
    let parsedElements = rawDataString.split(" ");

    // It then checks for the presence of specific string values ('1', '9', '7', '4') within the resulting array.
    // If all four specified values are found, it prints 'YES' to the console; otherwise, it prints 'NO'.
    console.log(
        parsedElements.indexOf('1') >= 0 &&
        parsedElements.indexOf('9') >= 0 &&
        parsedElements.indexOf('7') >= 0 &&
        parsedElements.indexOf('4') >= 0
            ? 'YES'
            : 'NO'
    );
}

// The following line is responsible for reading input from standard input and invoking the main processing function.
// It should not be altered.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
