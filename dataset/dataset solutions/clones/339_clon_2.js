let rawData = require('node:fs').readFileSync('/dev/stdin', 'utf-8'); // Obtain raw input data from standard input

// Process the raw input: trim whitespace and split into individual lines
const lineSegments = (rawData.trim()).split('\n');

// Initialize a data structure to store grouped information, mapping primary keys to their associated secondary values
let groupedDataMap = {};

// Iterate through each line segment to populate the grouped data map
for ( let lineIndex = 0; lineIndex < lineSegments.length; lineIndex ++ ) {
   // Split the current line into two parts based on space delimiter
   const currentPair = lineSegments[lineIndex].split(' ');

   // Extract the first part as the primary key
   const primaryKey = currentPair[0];

   // Extract the second part as the secondary value
   const secondaryValue = currentPair[1];

   // Check if the primary key already exists in the grouped data map
   if (primaryKey in groupedDataMap) {
      // If it exists, append the new secondary value, separated by a space
      groupedDataMap[primaryKey] += (' ' + secondaryValue);
   }
   // If the primary key does not exist
   else {
      // Initialize it with the current secondary value
      groupedDataMap[primaryKey] = secondaryValue;
   }
}

// Prepare an array to hold all the unique primary keys from the map
let mapKeys = [];

// Iterate over each key-value entry in the grouped data map
for ( const currentKey in groupedDataMap ) {
   // Add the current primary key to our list of keys
   mapKeys.push(currentKey);

   // For each key, process its associated string of secondary values:
   groupedDataMap[currentKey] = groupedDataMap[currentKey]
      .split(' ') // Split the string of values into an array of string values
      .map( ( valString ) => parseInt( valString, 10 ) ) // Convert each string value to an integer (base 10)
      .sort( ( valA, valB ) => valA - valB ) // Sort these numerical values in ascending order
      .join(' '); // Rejoin the sorted numbers back into a single space-separated string
}

// Sort the collected primary keys alphabetically
mapKeys.sort();

// Iterate through the sorted primary keys to print the final output
for ( let keyIterator = 0; keyIterator < mapKeys.length; keyIterator++ ) {
   // Retrieve the current key
   const currentKeyToDisplay = mapKeys[keyIterator];

   // Print the current key, followed by a newline, and then its processed (sorted) secondary values
   console.log(`${currentKeyToDisplay}\n${groupedDataMap[currentKeyToDisplay]}`);
}