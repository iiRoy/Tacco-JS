process.stdin.resume();

process.stdin.setEncoding('utf8'); // Configure the input stream to use UTF-8 encoding.

process.stdin.on('data', function (inputChunk) {
  // Parse the incoming data chunk as an integer after converting it to a string.
  let numericValue = parseInt(inputChunk.toString());

  // Output a specific string based on the comparison of the parsed numeric value.
  console.log(numericValue < 1200 ? "ABC" : "ARC");
});
