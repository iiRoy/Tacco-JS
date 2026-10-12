function processInput(inputLines) {
  // This object will store the frequency of each lowercase letter.
  var letterFrequencies = {};

  // Initialize counts for all lowercase letters from 'a' to 'z' to zero.
  for (var charCode = 'a'.charCodeAt(0); charCode <= 'z'.charCodeAt(0); charCode++) {
    letterFrequencies[String.fromCharCode(charCode)] = 0;
  }

  // Iterate through each line provided in the input.
  for (var lineIndex = 0; lineIndex < inputLines.length; lineIndex++) {
    // Convert the current line to lowercase for case-insensitive counting.
    var processedLine = inputLines[lineIndex].toLowerCase();
    // Loop through each character in the processed line.
    // Note: The loop condition 'charIndex <= processedLine.length' will cause an
    // attempt to access 'processedLine[processedLine.length]', which is undefined.
    // This behavior is preserved from the original code.
    for (var charIndex = 0; charIndex <= processedLine.length; charIndex++) {
      // Increment the frequency for the current character.
      // If processedLine[charIndex] is undefined, letterFrequencies[undefined] will be incremented.
      letterFrequencies[processedLine[charIndex]]++;
    }
  }

  // After processing all lines, print the frequency of each letter.
  for (var charCode = 'a'.charCodeAt(0); charCode <= 'z'.charCodeAt(0); charCode++) {
    var currentLetter = String.fromCharCode(charCode);
    console.log(currentLetter + ' : ' + letterFrequencies[currentLetter]);
  }
}

// Array to accumulate data chunks from standard input.
var dataSegments = [];
// Event listener for incoming data chunks.
process.stdin.on('data', function(segment) {
  dataSegments.push(segment);
});
// Event listener for the end of standard input.
process.stdin.on('end', function() {
  // Join all data segments into a single string and split by newline to get an array of lines.
  var inputLines = dataSegments.join('').split('\n');
  // Call the main processing function with the collected lines.
  processInput(inputLines);
});
