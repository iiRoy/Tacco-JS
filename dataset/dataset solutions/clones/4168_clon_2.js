"use strict"; // This directive ensures strict mode parsing and error handling for the script.

// Define a constant to alias the global 'require' function for module loading.
const   loadUtility   =   require  ;

/**
 * Executes the primary data processing workflow.
 * This function takes raw text input, processes it, and outputs a specific count.
 *
 * @param {string} sourceText - The entire raw text content that needs to be analyzed.
 */
function   executeProcessing   (   sourceText   )   {
  // First, remove any leading or trailing whitespace from the text input.
  // Then, break the cleaned string into an array of individual characters.
  // Finally, filter this array to keep only those characters that are exactly the string '1'.
  const   onesCollection   =   sourceText
    .trim   (  )
    .split   (  ''  )
    .filter   (   (   characterItem   )   =>   characterItem   ===   '1'   )  ;

  // Establish a new identifier for the standard console logging function.
  const   displayResult   =   console . log  ;

  // Output the total number of '1's found in the processed collection.
  displayResult   (   onesCollection . length   )  ;
}

// Begin the application's execution flow.
// Obtain the file system module using our aliased utility function.
const   diskIO   =   loadUtility   (   'node:fs'   )  ;

// Read the content from a specified input file synchronously.
// The file path and encoding type are provided as arguments.
// Pass this fetched content to the main processing function.
executeProcessing   (
  diskIO . fetchContentSynchronously   (   '/var/data/input_file.txt'   ,   'latin1'   )
)  ;