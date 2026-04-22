var print = console.log; /* This is a utility function for logging, similar to Python's print. */

var input_lines; // This variable will store the input lines from stdin.

/*
 * This function serves as a pre-processor for the main logic.
 * It takes raw input, splits it into lines, and then calls the Main function.
 * @param {string} input - The raw string input from the source.
 */
function PreMain( input )
{
  input_lines = input.split( "\n" ); // Split the entire input string by newline characters.

  var f = function() { // Define a helper function 'f' to get the next line.
    return input_lines.shift(); // Remove and return the first element from the input_lines array.
  };

  Main( f ); // Call the primary logic function, passing the line-reading helper.
}


/*
 * Parses a line of space-separated integers into an array of numbers.
 * Optionally adjusts values if a 'min1Flg' is set.
 * @param {boolean} min1Flg - If true, subtracts 1 from each parsed integer.
 * @returns {number[]} An array of parsed integers.
 */
function IL( min1Flg )
{
  // Get the next line, split it by spaces, and store as strings.
  var s = input_lines.shift().split( ' ' );

  // Determine the offset based on the min1Flg.
  var offset = min1Flg ? -1 : 0;

  var res = []; // Initialize an empty array to hold the results.

  // Loop through each string element in 's'.
  for ( var i = 0; i < s.length; i++ )
  {
    // Parse the string to an integer and push it to the result array.
    res.push( parseInt( s[i] ) );
  }

  return res; // Return the array of integers.
}


// Extending the Array prototype with a custom SUM method.
/**
 * Calculates the sum of all numeric elements in the array.
 * @returns {number} The total sum of array elements.
 * This method iterates over the array and accumulates the sum.
 */
Array.prototype.SUM = function SUM()
{
  var sum = 0; // Initialize sum to zero.

  // Iterate over each element in the array.
  this.forEach( function( elm ) {
    sum += elm; // Add the current element to the sum.
  } );

  return sum; // Return the final calculated sum.
};


// Extending the Array prototype with a custom Format method.
/**
 * Formats the array elements into a string, joined by a specified delimiter.
 * If no delimiter is provided, a space is used by default.
 * @param {string} [split=" "] split - The string to use as a separator between elements.
 * @returns {string} A string representation of the array.
 */
Array.prototype.Format = function Format( split )
{
  if ( split === undefined ) // Check if a custom split character was provided.
  {
    split = " "; // Default to a single space if none specified.
  }

  return this.join( split ); // Use the native Array.prototype.join method.
};


// Extending the Array prototype with a custom Copy method.
/*
 * Creates a shallow copy of the array.
 * This method is useful for creating a new array instance with the same elements.
 * @returns {Array} A new array containing the same elements as the original.
 */
Array.prototype.Copy = function Copy()
{
  return [].concat( this ); // Concatenate an empty array with 'this' to create a copy.
};


// Extending the Array prototype with a custom Sort method.
/**
 * Sorts the array in ascending order using a numeric comparison.
 * Modifies the array in place and returns the sorted array.
 * This ensures consistent numeric sorting behavior.
 * @returns {Array} The current array instance, now sorted.
 */
Array.prototype.Sort = function Sort()
{
  this.sort( function( a, b ) { // Use the native sort method with a custom comparison function.
    if ( a < b ) {
      return -1; // 'a' comes before 'b'.
    }
    if ( a > b ) {
      return 1;  // 'b' comes before 'a'.
    }
    return 0;    // 'a' and 'b' are equal.
  } );
  return this; // Return the sorted array instance.
};


/*
 * Generates a comparison function for sorting arrays of objects based on a specific key.
 * Allows for ascending/descending order and a tie-breaking function.
 * @param {string|number} x - The key (property name or index) to sort by.
 * @param {boolean} [desc=false] - If true, sorts in descending order.
 * @param {Function} [func_when_eq] - An optional function to call if keys are equal (for tie-breaking).
 * @returns {Function} A comparison function suitable for Array.prototype.sort.
 */
function item_getter_key( x, desc, func_when_eq )
{
  var sign = 1; // Default sign for ascending order.

  if ( desc ) // If descending order is requested.
  {
    sign = -1; // Change sign to reverse comparison.
  }

  // Return the actual comparison function.
  return function ( a, b )
  {
    // Compare values at the specified key 'x'.
    if ( a[x] < b[x] ) {
      return -1 * sign; // Apply sign for order.
    }
    else if ( a[x] > b[x] ) {
      return sign; // Apply sign for order.
    }

    // If values at key 'x' are equal, handle tie-breaking.
    if ( func_when_eq === undefined )
    {
      return 0; // Return 0 if no tie-breaking function is provided.
    }
    else
    {
      return func_when_eq( a, b ); // Call the provided tie-breaking function.
    }
  };
}


/*
 * Main processing logic for the application.
 * Reads data, processes it into a structured list, sorts, and prints.
 * @param {Function} input - A function that returns the next line of input.
 */
function Main( input )
{
  var lst = []; // Initialize an empty list to store processed data.

  // Iterate through input_lines, starting from the second line (index 1).
  for ( var i = 1; i < input_lines.length; i++ )
  {
    var x = input_lines[i].split( ' ' ); // Split the current line by spaces.
    var flg = false; // Flag to track if an item was found and updated.

    // Iterate over existing items in 'lst'.
    lst.forEach( function( v ) {
      if ( v[0] === x[0] ) // If the first element matches (e.g., a key).
      {
        v[1].push( parseInt( x[1] ) ); // Push the parsed second element to the associated array.
        flg = true; // Set flag to true as an item was updated.
      }
    } );

    if ( !flg ) // If no matching item was found and updated.
    {
      // Add a new item to 'lst' with the key and a new array containing the parsed value.
      lst.push( [ x[0], [ parseInt( x[1] ) ] ] );
    }
  }

  // Sort the 'lst' array based on the first element (key) in ascending order.
  lst.sort( item_getter_key( 0 ) );

  // Iterate through the sorted list and print the results.
  for ( var i = 0; i < lst.length; i++ )
  {
    print( lst[i][0] ); // Print the key (first element).
    // Print the sorted and formatted array of values (second element).
    print( lst[i][1].Sort().Format() );
  }
}

// Call the PreMain function with content read from a file.
// The commented line below is for reading from standard input in a typical competitive programming setup.
// PreMain(require("fs").readFileSync("/dev/stdin", "utf8"));

// This line reads from a local 'input.txt' file for development/testing.
PreMain( require( "fs" ).readFileSync( "input.txt", "utf8" ) );