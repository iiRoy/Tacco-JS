process.stdin.resume();

process.stdin.setEncoding('utf8'); // Configure the input stream to use UTF-8 encoding

process.stdin.on('data', function (inputChunk) {
  // Split the incoming data string by spaces into an array of string numbers
  var dataBuffer = inputChunk.split(" ");

  // Initialize a new array to hold the parsed integer values
  var numArray = new Array();

  // Iterate three times to process the first three elements from the input
  for (var idx = 0; idx < 3; idx++) {
    // Convert each string element to an integer (base 10) and store it
    numArray[idx] = parseInt(dataBuffer[idx], 10);
  }

  // Sort the array of numbers in ascending order
  numArray.sort();

  // Print the sorted numbers to the console, separated by single spaces
  console.log(numArray[0] + " " + numArray[1] + " " + numArray[2]);
});
