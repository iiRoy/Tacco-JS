(function(inputStr) {
    // This self-executing function processes a given input string.

    // Split the entire input into an array of lines, using the newline character as a delimiter.
    var linesArr = inputStr.split('\n');

    // Iterate through each line in the array.
    // 'lineIndex' is the current index, 'totalLines' is the total number of lines.
    for (var lineIndex = 0, totalLines = linesArr.length; lineIndex < totalLines; lineIndex++) {
        // For the current line, split it by spaces to get an array of string parts.
        // The original code had a syntax error 'var bar[i] = ...', which is interpreted
        // as declaring a temporary variable for the split result in each iteration.
        var currentParts = linesArr[lineIndex].split(' ');

        // Convert the first part of the line to a number using the unary plus operator.
        var valA = +currentParts[0];
        // Convert the second part of the line to a number.
        var valB = +currentParts[1];

        // Check for the termination condition: if both numbers are zero, stop processing.
        if (valA === 0 && valB === 0) {
            break;
        }

        // Compare the two numbers and print them to the console in non-decreasing order,
        // separated by a space.
        if (valA <= valB) {
            console.log(valA + ' ' + valB);
        } else {
            console.log(valB + ' ' + valA);
        }
    }
// The function is immediately invoked with content read from standard input.
// It uses Node.js 'fs' module to read the file '/dev/stdin' as a UTF-8 string.
})(require("fs").readFileSync("/dev/stdin", "utf8"));
