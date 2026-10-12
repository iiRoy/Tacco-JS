function main (input) {
    // This function processes an array of input strings.
    // It looks for a specific sentinel string "0 0" to determine the end of data.

    // Find the index of the "0 0" string, which marks the end of the relevant input.
    var index = input.indexOf('0 0');
    var output = []; // Initialize an array to store the processed output lines.

    // Loop through each input line until the sentinel "0 0" is encountered.
    for (var i = 0; i < index; i++) {
        // Split the current input line by space to get two numbers.
        var a = input[i].split(' ');

        // Compare the two numbers (parsed as integers).
        // If the second number is smaller than the first, swap their order.
        if (parseInt(a[1]) < parseInt(a[0])) {
            output.push(a[1] + ' ' + a[0]); // Push the numbers in ascending order.
        }
        // Otherwise, keep the original order of the numbers.
        else {
            output.push(input[i]); // Push the original line.
        }
    }
    // Join all processed output lines with newline characters and print to console.
    console.log(output.join('\n'));
}


/*// This commented-out section typically handles reading input from standard input (stdin).
  process.stdin.resume(); // Ensures the stdin stream remains open.
  var input = ''; // Accumulates all incoming data from stdin.
  process.stdin.setEncoding('utf-8'); // Sets the encoding for the input stream.
  process.stdin.on('data', function (chunk) { // Event listener for 'data' chunks.
    input += chunk; // Appends each chunk of data to the 'input' string.
  });
  process.stdin.on('end', function () { // Event listener for 'end' of input stream.
    var inputData = input.split('\n'); // Splits the accumulated input into an array of lines.
    main(inputData); // Calls the main function with the processed input data.
  });
*/
