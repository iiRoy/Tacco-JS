'use strict';

// Utility function to cast a value into its numerical representation.
function convertToNumber( valInput )
{
  return Number( valInput );
}

// Utility function to break a string into an array of substrings.
function divideString( entireText, separatorCharacter )
{
  return entireText.split( separatorCharacter );
}

// Object responsible for handling output operations.
const outputDisplayManager = {
  // Method to present content to the user.
  presentContent: function( contentToDisplay )
  {
    console.log( contentToDisplay ); // Assuming 'console' is an allowed host-environment global.
  }
};

/**
 * Main application logic to process input data.
 * This function calculates a specific probability based on two numerical inputs.
 * @param {string} rawInputData - The raw string input containing space-separated numbers.
 */
function ProcessInputData( rawInputData )
{
  // Split the incoming data string by space to get individual numerical parts.
  const dataParts = divideString( rawInputData, " " );

  // Extract the total number of items from the first part of the split data.
  const totalItemCount = convertToNumber( dataParts[ 0 ] );

  // Extract the specific threshold value from the second part of the split data.
  const thresholdValue = convertToNumber( dataParts[ 1 ] );

  // Initialize a variable to store the accumulated probability sum.
  let accumulatedProbabilitySum = 0.0;

  // Loop through each item from one up to the total item count.
  for ( let currentItemIndex = 1; currentItemIndex <= totalItemCount; currentItemIndex++ )
  {
    // Check if the current item already meets or exceeds the defined threshold.
    if ( currentItemIndex >= thresholdValue )
    {
      accumulatedProbabilitySum++; // If so, add a full unit of probability.
      continue; // Skip to the next iteration.
    }

    // Initialize a temporary value starting with the current item's index.
    let temporaryValue = currentItemIndex;

    // Initialize the probability fraction for this item.
    let probabilityFraction = 1.0;

    // Continue multiplying the temporary value by two until it reaches or surpasses the threshold.
    while ( temporaryValue < thresholdValue )
    {
      temporaryValue *= 2;        // Double the temporary value.
      probabilityFraction /= 2;   // Halve the probability fraction accordingly.
    }

    // Add the calculated probability fraction for this item to the overall sum.
    accumulatedProbabilitySum += probabilityFraction;
  }

  // Calculate the final average probability and present it.
  outputDisplayManager.presentContent( accumulatedProbabilitySum / totalItemCount );
}

// Utility function to dynamically load a required module.
function obtainModule( moduleNameString )
{
  return require( moduleNameString ); // Assuming 'require' is an allowed host-environment global.
}

// Acquire the file system module.
const fileSystemInterface = obtainModule( "fs" );

// Utility function to read the entire content of a text file synchronously.
function retrieveFileContents( filePathIdentifier, fileEncodingFormat )
{
  return fileSystemInterface.readFileSync( filePathIdentifier, fileEncodingFormat );
}

// Utility function to remove leading and trailing whitespace characters from a string.
function stripWhitespace( textContent )
{
  return textContent.trim();
}

// Define the standard input stream path.
const standardInputSourcePath = "/dev/stdin";

// Define the character encoding for input data.
const inputCharacterEncoding = "utf8";

// Read the input from the standard source, remove whitespace, and then process the data.
ProcessInputData(
  stripWhitespace(
    retrieveFileContents( standardInputSourcePath, inputCharacterEncoding )
  )
);