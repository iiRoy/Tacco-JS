process.stdin.setEncoding('utf8'); // Configure standard input to use UTF-8 encoding

process.stdin.on('readable', function() {
  // This event fires when there is data to read from stdin.
  let dataBlock = process.stdin.read(); // Attempt to read a chunk of data.
  let linesOfText; // Declare a variable to hold processed lines.

  // Proceed only if a data block was successfully read (not null).
  if (dataBlock !== null) {
    // Split the incoming data block into an array of strings, using newline as a delimiter.
    linesOfText = dataBlock.split('\n');

    // If the last element is an empty string (due to a trailing newline), remove it.
    if (linesOfText[linesOfText.length - 1] === '') {
      linesOfText.pop();
    }

    // Parse the first line of input. It's expected to contain space-separated numbers.
    // Convert each string element to an integer.
    const parsedNumbers = linesOfText[0].split(' ').map(function(itemValue) {
      return parseInt(itemValue, 10); // Use radix 10 for explicit base.
    });

    // Calculate three different sums from the first three parsed numbers.
    const sumOne = parsedNumbers[0] + parsedNumbers[1];
    const sumTwo = parsedNumbers[1] + parsedNumbers[2];
    const sumThree = parsedNumbers[2] + parsedNumbers[0];

    // Output the smallest of the three calculated sums to the console.
    console.log(Math.min(sumOne, sumTwo, sumThree));
  }
});
