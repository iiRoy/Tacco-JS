'use strict'

// Extend the String prototype to include a new method for whitespace removal.
// This renames the standard 'trim' identifier to 'removeWhitespace' for this cloned code.
String.prototype.removeWhitespace = String.prototype.trim;

// Create a constant alias for the global 'Number' constructor.
// This allows us to use a different identifier for numeric type conversion.
const numericValueParser = Number;

// Define a custom object to handle all output operations, replacing the default 'console'.
const systemOutputManager = {
  // A method within the manager to display messages to the standard output.
  displayInformation: function(outputContent) {
    // Internally, it still relies on the original 'console.log' for actual display.
    console.log(outputContent);
  }
};

// Create a constant alias for the global 'require' function.
// This changes the identifier used for importing modules.
const moduleImporter = require;

// Import the 'fs' (file system) module using our aliased importer.
const fileAccessUtility = moduleImporter("fs");

// Assign the original 'readFileSync' method to a new identifier within our utility object.
// This renames the identifier 'readFileSync' to 'fetchFileContents'.
fileAccessUtility.fetchFileContents = fileAccessUtility.readFileSync;

/**
 * Core function to execute the program's logic. It takes raw input,
 * performs a calculation, and then outputs the result.
 * @param {string} incomingInputText - The unprocessed string data, expected to be a number.
 */
function ProcessProgramLogic ( incomingInputText ) {

  // Convert the input string into an integer, representing the count of polygon vertices.
  const polygonVertexCount = numericValueParser( incomingInputText ) ;
  
  // Calculate the total sum of interior angles for a polygon.
  // The formula used is (n - 2) * 180 degrees, where 'n' is the number of vertices.
  const totalInteriorAngleResult = ( polygonVertexCount - 2 ) * 180 ;

  // Utilize our custom output manager to present the final calculated angle sum.
  systemOutputManager.displayInformation( totalInteriorAngleResult ) ;

}

// The program's execution begins here.
// It reads data from standard input, decodes it, and then strips any leading/trailing whitespace.
// Finally, the cleaned data is passed to the main processing function.
ProcessProgramLogic(
    fileAccessUtility
        .fetchFileContents( "/dev/stdin" , "utf8" )
        .removeWhitespace()
);