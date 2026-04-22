(function()   {
  // This variable stores all incoming data from standard input.
  let receivedText = '';


  // Primary function to parse and process the collected data.
  function processInputData() {
    let loopVar,
        dataLinesCount,
        currentLineParts,
        entryCatalog = {}; // Main data structure to store entries

    // Determine the number of valid data lines, excluding a potential trailing newline.
    dataLinesCount = receivedText.length - 1;

    // Iterate through each line of the input data.
    for (loopVar = 0; loopVar < dataLinesCount; loopVar += 1) {
      // Split the current line into parts based on space.
      currentLineParts = receivedText[loopVar].split(' ');

      // Check if the first part (key) already exists in our catalog.
      if (entryCatalog.hasOwnProperty(currentLineParts[0])) {
        // If it exists, add the second part (value) to the existing array.
        entryCatalog[currentLineParts[0]].push(currentLineParts[1]);
        // Then, sort the array of values numerically.
        entryCatalog[currentLineParts[0]].sort(numericOrder);
      } else {
        // If the key does not exist, initialize a new array for it.
        entryCatalog[currentLineParts[0]] = [];
        // And add the second part (value) to this new array.
        entryCatalog[currentLineParts[0]].push(currentLineParts[1]);
      }
    }

    // Sort the entire catalog by its keys alphabetically.
    entryCatalog = orderMapByKeys(entryCatalog);

    // Iterate through the sorted entries of the catalog.
    for (const mapEntry in entryCatalog) {
      // Output the current key.
      console.log(mapEntry);
      // Output the concatenated values associated with the current key.
      console.log(composeStringFromList(entryCatalog[mapEntry]));
    }
  }

  // A comparison function used by Array.prototype.sort for ascending numerical order.
  function numericOrder(valA, valB) {
    return valA - valB;
  }

  // Function to sort an object (associative array) by its keys in alphabetical order.
  function orderMapByKeys(sourceMap) {
    let  counter,
         keyCount,
         objectKeys = [],
         orderedMap = {};

    // Extract all keys from the input map.
    for (const mapKey in sourceMap) {
      objectKeys.push(mapKey);
    }

    // Sort the collected keys alphabetically.
    objectKeys.sort();
    // Get the total number of sorted keys.
    keyCount = objectKeys.length;

    // Iterate through the sorted keys to build the new ordered map.
    for (counter = 0; counter < keyCount; counter += 1) {
      // Assign values to the new map in the sorted key order.
      orderedMap[objectKeys[counter]] = sourceMap[objectKeys[counter]];
    }

    // Return the new map with keys sorted alphabetically.
    return orderedMap;
  }

  // Function to join elements of an array into a single string, separated by spaces.
  function composeStringFromList(elementList) {
    let  counter,
         finalString = '',
         listLength = elementList.length;

    // Loop through each element in the provided list.
    for (counter = 0; counter < listLength; counter += 1) {
      // Append the current element to the accumulating string.
      finalString += elementList[counter];

      // If it's not the last element, add a space.
      if (counter !== listLength - 1) {
        finalString += ' ';
      }
    }

    // Return the final concatenated string.
    return finalString;
  }


  // Ensure the standard input stream stays open.
  process.stdin.resume();
  // Set the encoding for incoming data to UTF-8.
  process.stdin.setEncoding('utf8');
  // Event listener for incoming data chunks.
  process.stdin.on('data', function(chunkOfData) {
    // Append the received chunk to our global text buffer.
    receivedText += chunkOfData;
  });

  // Event listener for the end of the input stream.
  process.stdin.on('end', function() {
    // Once all data is received, split the entire text into an array of lines.
    receivedText = receivedText.split('\n');
    // Then, kick off the main processing function.
    processInputData();
  });
}());