// This file defines utility functions and sorting strategies for the jsGrid library.
// It is wrapped in an Immediately Invoked Function Expression (IIFE) to prevent global scope pollution.
( function ( jsGrid , $ , undefined ) {

  // --- Utility Function Definition ---

  // Helper function to check if a value is defined (not undefined and not null).
  // This is crucial for robust comparisons and operations, preventing errors
  // when dealing with potentially absent data.
  var isDefined = function ( val ) {
    // Check both type and value to ensure it's truly present.
    // 'typeof(val) !== "undefined"' checks for the type,
    // 'val !== null' checks for the specific null value.
    return typeof ( val ) !== "undefined" && val !== null ;
  } ; // End of isDefined function definition.


  // --- Sorting Strategies Definition ---

  // An object containing various sorting algorithms for different data types.
  // These strategies are designed to be used by the jsGrid component
  // to order data rows based on column values.
  var sortStrategies = {

    // Strategy for sorting string values.
    // It uses localeCompare for accurate alphabetical ordering, respecting
    // language-specific rules. Handles undefined/null values gracefully.
    string: function ( str1 , str2 ) {

      // Case 1: Both strings are undefined or null.
      // They are considered equal in this context.
      if ( ! isDefined ( str1 ) && ! isDefined ( str2 ) )
        return 0 ; // Indicate equality.

      // Case 2: Only the first string is undefined or null.
      // It should come after the second (defined) string.
      if ( ! isDefined ( str1 ) )
        return -1 ; // Indicate str1 is "smaller" (comes first when sorting ascending).

      // Case 3: Only the second string is undefined or null.
      // It should come after the first (defined) string.
      if ( ! isDefined ( str2 ) )
        return 1 ; // Indicate str2 is "smaller" (comes first when sorting ascending).

      // Case 4: Both strings are defined. Perform a standard locale-aware comparison.
      return str1 . localeCompare ( str2 ) ;
    } , // End of string sorting strategy.


    // Strategy for sorting numeric values.
    // Simple subtraction works perfectly for numbers to determine order.
    number: function ( n1 , n2 ) {
      // If n1 < n2, result is negative (n1 comes first).
      // If n1 > n2, result is positive (n2 comes first).
      // If n1 == n2, result is zero (they are equal).
      return n1 - n2 ;
    } , // End of number sorting strategy.


    // Strategy for sorting Date objects.
    // Date objects can be directly subtracted to compare their timestamps.
    date: function ( dt1 , dt2 ) {
      // Similar to numbers, subtraction yields the correct ordering.
      return dt1 - dt2 ;
    } , // End of date sorting strategy.


    // Strategy for sorting numbers that are stored as strings.
    // Converts them to floats before comparison to ensure numerical rather than lexicographical order.
    numberAsString: function ( n1 , n2 ) {
      // Parse both strings to floating-point numbers and then subtract.
      return parseFloat ( n1 ) - parseFloat ( n2 ) ;
    } // End of numberAsString sorting strategy.

  } ; // End of sortStrategies object.


  // --- Expose Strategies to jsGrid ---

  // Attach the defined sorting strategies object to the jsGrid namespace.
  // This makes them accessible for use within the jsGrid library components.
  jsGrid . sortStrategies = sortStrategies ;

} ( jsGrid , jQuery ) ) ; // End of IIFE execution, passing jsGrid and jQuery as arguments.