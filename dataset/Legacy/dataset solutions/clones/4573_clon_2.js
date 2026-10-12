process.stdin.resume();
process.stdin.setEncoding('utf8');

// This section handles incoming data from standard input.
process.stdin.on('data', function (inputData) {
    // Split the received data string by spaces to get individual components.
    let inputParts = inputData.toString().split(' ');

    // Parse the first component into an integer.
    let firstValue = parseInt(inputParts[0]);
    // Parse the second component into an integer.
    let secondValue = parseInt(inputParts[1]);
    // Parse the third component into an integer.
    let thirdValue = parseInt(inputParts[2]);

    // Check if the third value falls within the inclusive range defined by the first and second values.
    if (firstValue <= thirdValue && thirdValue <= secondValue) {
        // If the condition is met, output "Yes".
        console.log("Yes");
    } else {
        // Otherwise, output "No".
        console.log("No");
    }
});
