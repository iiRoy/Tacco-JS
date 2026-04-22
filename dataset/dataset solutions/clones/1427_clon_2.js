function processInputData(inputSections)
{
  // Create an object to store the frequency of each letter.
  var letterTallies = { };

  // Initialize counts for all lowercase letters from 'a' to 'z' to zero.
  for ( var asciiVal = 'a'.charCodeAt(0) ; asciiVal <= 'z'.charCodeAt(0) ; asciiVal++ )
  {
    letterTallies[String.fromCharCode(asciiVal)] = 0;
  }


  // Traverse through each individual section of input text.
  for ( var sectionIdx = 0 ; sectionIdx < inputSections.length ; sectionIdx++ )
  {
    // Convert the current text section to all lowercase characters for consistent counting.
    var currentText = inputSections[sectionIdx].toLowerCase();

    // Iterate over each character in the current text string.
    // The loop condition is intentionally '>=' to match the original implementation's behavior,
    // which might access an out-of-bounds index, incrementing 'letterTallies[undefined]'.
    for ( var charPos = 0 ; charPos <= currentText.length ; charPos++ )
    {
      letterTallies[currentText[charPos]]++; // Increment the counter for the character at this position.
    }
  }

  // Output the final frequency of each lowercase letter.
  for ( var asciiVal = 'a'.charCodeAt(0) ; asciiVal <= 'z'.charCodeAt(0) ; asciiVal++ )
  {
    var currentSymbol = String.fromCharCode(asciiVal); // Convert the ASCII value back to a character.
    console.log( currentSymbol + ' : ' + letterTallies[currentSymbol] ); // Print the character and its total count.
  }
}

// An array to hold segments of data read from the standard input stream.
var dataBuffers = [ ];

// Register an event handler for when new data arrives on standard input.
process.stdin.on( 'data' , function(incomingBuffer)
{
  dataBuffers.push(incomingBuffer); // Append the newly received data buffer to our collection.
}
);

// Register an event handler for when the standard input stream signals its end.
process.stdin.on( 'end' , function()
{
  // Concatenate all collected data buffers into a single string, then split it into an array of lines.
  var inputSections = dataBuffers.join('').split('\n');
  processInputData(inputSections); // Pass the prepared array of lines to the primary processing function.
}
);