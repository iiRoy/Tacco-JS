(function () {
  var rawData = ''; // Stores all incoming data from stdin
  
  // Main processing function
  function processData () {
    var idx, // Loop counter for iterating through input lines
        dataLength, // Total number of input lines to process
        lineParts, // Array to hold parts of a split input line
        documentMap = {}; // Object to store indexed data, mapping keys to arrays of values

    // Determine the number of lines to process, excluding the last empty line if present
    dataLength = rawData.length - 1;
    
    // Iterate through each line of the input data
    for (idx = 0; idx < dataLength; idx += 1) {
      // Split the current line by space to get its components
      lineParts = rawData[idx].split(' ');

      // Check if the first part (key) already exists in our document map
      if (documentMap.hasOwnProperty(lineParts[0])) {
        // If it exists, add the second part (value) to its corresponding array
        documentMap[lineParts[0]].push(lineParts[1]);
        // Sort the array of values numerically in ascending order
        documentMap[lineParts[0]].sort(compareNumbers);
      } else {
        // If the key does not exist, create a new array for it
        documentMap[lineParts[0]] = [];
        // Add the second part (value) to this new array
        documentMap[lineParts[0]].push(lineParts[1]);
      }
    }

    // Sort the keys of the document map alphabetically
    documentMap = orderObjectKeys(documentMap);

    // Iterate over the sorted keys of the document map
    for (var keyName in documentMap) {
      // Output the current key
      console.log(keyName);
      // Output the concatenated elements of the array associated with the key
      console.log(joinArrayElements(documentMap[keyName]));
    }
  }

  // Comparison function for Array.prototype.sort to achieve numeric ascending order
  function compareNumbers (valA, valB) {
    return valA - valB;
  }

  // Function to sort an object's keys alphabetically and return a new ordered object
  function orderObjectKeys (inputObject) {
    var idx, // Loop counter
        numKeys, // Number of keys in the object
        objectKeys = [], // Array to hold object keys
        orderedObject = {}; // New object to store data with sorted keys
    
    // Extract all keys from the input object
    for (var objKey in inputObject) {
      objectKeys.push(objKey);
    }
    
    // Sort the extracted keys alphabetically
    objectKeys.sort();
    numKeys = objectKeys.length;

    // Populate the new object with values corresponding to the sorted keys
    for (idx = 0; idx < numKeys; idx += 1) {
      orderedObject[objectKeys[idx]] = inputObject[objectKeys[idx]];
    }

    return orderedObject;
  }
  
  // Function to concatenate elements of an array into a single space-separated string
  function joinArrayElements(inputArray) {
    var idx, // Loop counter
        outputString = '', // String to build the concatenated result
        arrayLength = inputArray.length; // Total number of elements in the array

    // Iterate through each element of the array
    for (idx = 0; idx < arrayLength; idx += 1) {
      outputString += inputArray[idx]; // Append the current element

      // If it's not the last element, append a space
      if (idx !== arrayLength - 1) {
        outputString += ' ';
      }
    }

    return outputString;
  }

  // Set up standard input handling
  process.stdin.resume(); // Keep the process alive for input
  process.stdin.setEncoding('utf8'); // Set encoding for input data
  process.stdin.on('data', function (chunk) {
    rawData += chunk; // Append incoming data chunks to rawData
  });

  // Event listener for when all input data has been received
  process.stdin.on('end', function () {
    rawData = rawData.split('\n'); // Split the accumulated rawData into an array of lines
    processData(); // Call the main processing function
  });
}());
