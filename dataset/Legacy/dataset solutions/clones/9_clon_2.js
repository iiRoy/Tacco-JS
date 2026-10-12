process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (inputChunk) {
    // Convert the incoming data chunk to a string format
    let inputBuffer = inputChunk.toString();

    // Split the entire string into an array of lines, using newline as a delimiter
    let inputLines = inputBuffer.split("\n");

    // Remove the last element from the array, which is often an empty string
    // if the input ends with a newline character.
    inputLines.pop();

    // Iterate through each line received from the standard input
    for (let lineIndex in inputLines) {
        // Split the current line by space to separate the two numbers
        let currentLineParts = inputLines[lineIndex].split(" ");

        // Convert the first part of the line to a Number object
        let firstNumber = new Number(currentLineParts[0]);

        // Convert the second part of the line to a Number object
        let secondNumber = new Number(currentLineParts[1]);

        // Calculate the sum of the two numbers
        let sumResult = firstNumber + secondNumber;

        // Convert the sum to a string and then get the length of that string,
        // finally printing it to the console.
        console.log(String(sumResult).length);
    }
});
