// This script utilizes the 'readline' module to process user input from the console.
var ioInterface = require('readline').createInterface(  {
    inputStream: process.stdin,  // Assigns the standard input stream as the reading source.
    outputStream: process.stdout // Assigns the standard output stream for any output operations.
} );

// Declares a variable to store the most recently captured line of text.
var currentInput;

// Event listener to capture each line received from the input stream.
ioInterface.on(  'line',
  (capturedString) =>
  {
    currentInput = capturedString; // Stores the captured line for later processing.
  }
);

// Event listener triggered when the input stream is closed.
ioInterface.on( 'close',
  (  ) =>
  {
    // Splits the stored input string into an array of elements using space as a delimiter.
    var parsedElements = currentInput.split( ' ' );

    // Extracts the second element (index 1) and assigns it to valueX.
    var valueX = parsedElements[1];
    // Extracts the third element (index 2) and assigns it to valueY.
    var valueY = parsedElements[2];

    // Calculates the game outcome based on a specific mathematical expression.
    // The result determines if 'Alice' or 'Bolis' is the winner.
    var gameOutcome = Math.abs( valueY - valueX - 1 ) % 2  ?  'Alice'  :  'Bolis';

    // Prints the determined game outcome to the console.
    console.log(  gameOutcome  );
  }
);