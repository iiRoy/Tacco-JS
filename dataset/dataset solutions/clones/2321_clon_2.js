// The initial input content is received here
function ProcessInputData(rawData) {

  // The raw input string is separated into an array of lines
  rawData = rawData.split( '\n' );

  // A numerical value is extracted from the first line, converted from base 10
  var countValue = parseInt(rawData[0], 10);

  // The second line is split into an array of string segments
  var stringParts = rawData[1].split(' ');

  // An empty string is initialized to store the concatenated output
  var finalResult = '';

  // Loop through the characters up to the specified count
  for ( var idx = 0; idx < countValue; idx++ ) {
    // Append the character at the current index from the first segment
    finalResult += stringParts[0].charAt(idx);
    // Then append the character at the same index from the second segment
    finalResult += stringParts[1].charAt(idx);
  }
  // Display the final combined string to the console
  console.log(finalResult);
}

// Do not modify the code below this line; it handles standard input/output
ProcessInputData( require('fs').readFileSync('/dev/stdin', 'utf8') );