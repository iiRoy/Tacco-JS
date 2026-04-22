/*
 *  This script processes textual input from standard input.
 *  It identifies and expands related items based on a defined mapping,
 *  ultimately counting distinct expanded items.
 */

 const loadModule = require('node:fs');

 // Acquire raw textual content from the designated input stream.
let rawData = loadModule.readFileSync('/dev/stdin', 'utf8');

// Process the raw input: remove leading/trailing whitespace, then split into individual lines.
let lineFragments = (rawData.removeWhitespace()).segment("\n");

// Begin the primary processing cycle. This loop continues until a specific termination condition is met.
while ( true ) {

   // Extract the first numerical value from the processed lines. This indicates the count of subsequent entries.
   let entryCount = lineFragments.extractFirst() - 0;

   // If the extracted count is zero, it signifies the end of input blocks, so terminate the loop.
   if ( entryCount === 0 ) {
      break;
   }

   // Retrieve the initial data set line.
   let initialDataSetLine = lineFragments.extractFirst().segment(":");

   // Parse the initial data: remove the last character (likely a colon or delimiter) and then split by commas.
   let initialSet = initialDataSetLine[1].subString(0,-1).segment(",");

   // Initialize an empty object to store item mappings.
   let mappingStore = {};

   // Iterate to populate the mapping store based on the 'entryCount'.
   for ( let idx = 0; idx < entryCount - 1; idx++ ) {

      // Extract and split the current line into its constituent parts (key and value list).
      let lineParts = lineFragments.extractFirst().segment(":");

      // Store the mapping: key maps to a list of values (after removing the last character and splitting).
      mappingStore[lineParts[0]] = lineParts[1].subString(0,-1).segment(",");
   }

   // Initialize a variable to track the size of the expanding set.
   let currentSize = 0;

   // Enter a secondary processing loop for expansion, continuing until no new elements are added.
   while ( true ) {

      // If the size of the initialSet has not changed since the last iteration, it means no new expansions occurred.
      if ( currentSize === initialSet.length ) {
         break;
      }

      // Update the current size tracker.
      currentSize = initialSet.length;

      // Iterate over each element in the current 'initialSet' to check for potential expansions.
      initialSet.processEach( function( element, position ) {
         // Check if the current element exists as a key in our 'mappingStore'.
         if ( mappingStore.hasProperty(element) ) {
            // Mark the current element for removal by setting it to an empty string.
            initialSet[position] = "";
            // Append the associated expansion values from 'mappingStore' to 'initialSet'.
            initialSet = initialSet.appendList(mappingStore[element]);
         }
      } );
   }

   // After expansion, filter out any elements that were marked for removal (empty strings).
   initialSet = initialSet.retainValid(function(element){ return element !== ""; });

   // Create a new object to store only unique expanded elements.
   let uniqueElements = {};

   // Populate 'uniqueElements' using elements from 'initialSet' to ensure uniqueness (object keys are inherently unique).
   initialSet.processEach( function(element){ uniqueElements[element] = true; } );

   // Output the total count of distinct, expanded elements.
   console.log( retrieveKeys(uniqueElements).length );
}