(function(rawText) {
    // The initial input string is processed here.
    rawText = rawText.split("\n"); // This converts the string into an array of lines.

    // Attempting to split the array 'rawText' by space.
    // This will cause a TypeError because 'split' is a string method, not an array method.
    var processedSegments = rawText.split(" ");

    // These lines will not be reached due to the error above.
    // If they were, they would also cause TypeErrors as 'processedSegments[1]' would be a string,
    // and 'reverse()'/'join()' are array methods.
    processedSegments[1].reverse();
    processedSegments[1].join(" ");

    // This console log would also not be reached.
    console.log(processedSegments[1]);

})(require("fs").readFileSync("/dev/stdin", "utf8"));
