/*
 * This is a self-executing anonymous function.
 * It encapsulates the entire application logic to prevent
 * polluting the global namespace.
 */
( function ( ) {
  // Declare a variable 'input' to store all incoming data.
  // It is initialized as an empty string.
  var input = '';

  /**
   * The primary function of the application.
   * It processes the collected input data.
   */
  function main ( ) {
    // Declare several local variables for use within this function.
    // 'i' will serve as a loop counter.
    // 'inputLen' will store the length of the input array.
    // 'inputContent' will hold parts of a line after splitting.
    // 'BookIndex' will be an object acting as a hash map (dictionary).
    var i,
      inputLen,
      inputContent,
      BookIndex = { }; // Initialize BookIndex as an empty object.

    /*
     * Calculate the effective length of the input array.
     * We subtract 1 because the last line might be empty or a trailing newline.
     */
    inputLen = input.length - 1;

    // Loop through each line of the input, excluding the last one.
    for ( i = 0; i < inputLen; i += 1 ) {
      // Split the current input line by spaces.
      // This assumes each line contains at least two parts: a key and a value.
      inputContent = input[i].split( ' ' );

      // Check if the BookIndex already has a property corresponding to the first part of the inputContent.
      if ( BookIndex.hasOwnProperty( inputContent[0] ) ) {
        // If the property exists, push the second part of the inputContent into the existing array.
        BookIndex[inputContent[0]].push( inputContent[1] );
        // After adding, sort the array numerically.
        BookIndex[inputContent[0]].sort( sortNum );
      } // End of 'if' block.
      else {
        // If the property does not exist, create a new empty array for it.
        BookIndex[inputContent[0]] = [ ];
        // Then, push the second part of the inputContent into this newly created array.
        BookIndex[inputContent[0]].push( inputContent[1] );
      } // End of 'else' block.
    } // End of the main processing loop.

    // After populating, sort the entire BookIndex hash map by its keys alphabetically.
    BookIndex = sortHash( BookIndex );

    // Iterate over each property (key) in the now sorted BookIndex.
    for ( var prop in BookIndex ) {
      // Print the current property (key) to the console.
      console.log( prop );
      // Print the concatenated elements of the array associated with the current property.
      console.log( concatenateArrayElem( BookIndex[prop] ) );
    } // End of 'for...in' loop.
  } // End of 'main' function definition.

  /*
   * Helper function: sortNum
   * This function is used as a comparator for Array.prototype.sort()
   * to sort numbers in ascending order.
   * @param {number} a - The first number for comparison.
   * @param {number} b - The second number for comparison.
   * @returns {number} - A negative value if 'a' should come before 'b',
   *                     a positive value if 'b' should come before 'a',
   *                     or zero if they are equal.
   */
  function sortNum ( a, b ) {
    return a - b; // Standard numerical ascending sort.
  } // End of 'sortNum' function.

  /*
   * Helper function: sortHash
   * Sorts the properties (keys) of a given hash map (object) alphabetically.
   * Creates a new hash map with keys in sorted order.
   * @param {Object} hash - The input hash map to be sorted.
   * @returns {Object} - A new hash map with keys sorted alphabetically.
   */
  function sortHash ( hash ) {
    // Declare local variables.
    var i,
      keysLen,
      keys = [ ], // Array to store all keys from the input hash.
      sortedHash = { }; // The new object to hold sorted key-value pairs.

    // Extract all keys from the input hash map.
    for ( var k in hash ) {
      keys.push( k ); // Add each key to the 'keys' array.
    } // End of key extraction loop.

    // Sort the collected keys alphabetically.
    keys.sort( );
    // Store the length of the sorted keys array for efficient looping.
    keysLen = keys.length;

    // Iterate through the sorted keys.
    for ( i = 0; i < keysLen; i += 1 ) {
      // Assign the value from the original hash to the new sortedHash,
      // using the sorted key order.
      sortedHash[keys[i]] = hash[keys[i]];
    } // End of key re-assignment loop.

    return sortedHash; // Return the new hash with sorted keys.
  } // End of 'sortHash' function.

  /*
   * Helper function: concatenateArrayElem
   * Joins the elements of an array into a single string,
   * separated by spaces.
   * @param {Array} ary - The input array whose elements are to be concatenated.
   * @returns {string} - A string containing all array elements joined by spaces.
   */
  function concatenateArrayElem ( ary ) {
    // Declare local variables.
    var i,
      resultStr = '', // Initialize an empty string to build the result.
      len = ary.length; // Store array length for loop efficiency.

    // Loop through each element of the array.
    for ( i = 0; i < len; i += 1 ) {
      // Append the current array element to the result string.
      resultStr += ary[i];

      // If it's not the last element, append a space.
      if ( i != len - 1 ) {
        resultStr += ' ';
      } // End of 'if' condition.
    } // End of concatenation loop.

    return resultStr; // Return the final concatenated string.
  } // End of 'concatenateArrayElem' function.

  // --- Input Handling Section ---

  // Resume the standard input stream.
  process.stdin.resume( );
  // Set the encoding for the standard input stream to UTF-8.
  process.stdin.setEncoding( 'utf8' );

  // Register an event listener for 'data' events on the standard input.
  // This callback function appends chunks of data to the 'input' variable.
  process.stdin.on( 'data', function ( chunk ) {
    input += chunk; // Accumulate incoming data.
  } ); // End of 'data' event listener.

  // Register an event listener for the 'end' event on the standard input.
  // This callback function is executed once all input has been received.
  process.stdin.on( 'end', function ( ) {
    // Split the accumulated input string into an array of lines.
    input = input.split( '\n' );
    // Call the main processing function to start the application logic.
    main( );
  } ); // End of 'end' event listener.

} ( ) ); // Immediately invoke the anonymous function.