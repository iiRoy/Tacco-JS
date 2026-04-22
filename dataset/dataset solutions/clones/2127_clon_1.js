/* This is a Type I clone of a JavaScript program.
 * It processes a series of queries on a string.
 *
 * The program first reads the input, which consists of:
 * - N: The length of the string S.
 * - S: The string itself.
 * - Q: The number of queries.
 * - Q lines, each describing a query.
 *
 * There are two types of queries:
 * Type 1: Update a character at a specific index in the string.
 *   Format: "1 index char"
 *   'index' is 1-based.
 * Type 2: Count the number of distinct characters within a given range.
 *   Format: "2 left right"
 *   'left' and 'right' are 1-based indices.
 *
 * This cloned version maintains exact lexical identity (identifiers, operators, expressions)
 * while extensively modifying whitespace and comments to achieve visual difference.
 */

function Main( input )
{
  // Split the entire input string into an array of lines.
  input = input.split("\n");

  // Parse the length of the string S from the first line.
  var N = parseInt(input[0] , 10);
  // Get the string S itself from the second line.
  var S = input[1];

  // Parse the number of queries Q from the third line.
  var Q = parseInt(input[2] , 10 );

  // Initialize a variable to track the starting line number for queries.
  var nextInputnum = 3;

  // Declare an array to store all query strings.
  var Querys = [];

  // Declare an array to store the characters of string S, allowing for modifications.
  var S_arr = [];

  // Populate S_arr with characters from S. This makes S mutable.
  for ( var i = 0 ; i < N ; i++ ) { S_arr.push(S[i]); }

  // Read all query strings from the input and store them in the Querys array.
  for ( var i = 0 ; i < Q ; i++ )
  { Querys[i] = input[(nextInputnum + i)]; }

  // Iterate over each query in the Querys array.
  for ( var qry of Querys )
  {
    // Split the current query string by space to get its components.
    qry = qry.split(" ");
    // Parse the first component as the query type.
    var type = parseInt(qry[0] , 10);

    // Use a switch statement to handle different query types.
    switch ( type )
    {
      // Case 1: Update a character in the string.
      case 1 :
        // Parse the index (1-based) for the character to be updated.
        var iq = parseInt(qry[1] , 10);
        // Get the new character value.
        var c = qry[2];
        // If the character at the specified index is different, update it.
        if ( S_arr[iq - 1] !== c ) { S_arr[iq - 1] = c; }
        // End of case 1.
        break;

      // Case 2: Count distinct characters within a range.
      case 2 :
        // Parse the left bound (1-based) of the range.
        var l = parseInt(qry[1] , 10);
        // Parse the right bound (1-based) of the range.
        var r = parseInt(qry[2] , 10);
        // Create an empty object to store distinct characters encountered.
        // Using an object's keys ensures uniqueness.
        var result = {};
        // Iterate from the left bound to the right bound (inclusive).
        for ( l ; l <= r ; l++ )
        {
          // Add the character at the current index (0-based) to the result object as a key.
          // The value can be anything, 'null' is used here.
          result[S_arr[(l - 1)]] = null;
        }
        // Print the number of unique keys (distinct characters) found in the result object.
        // A newline character is also printed as specified by the original format.
        console.log("%d\n" , Object.keys(result).length);
        // End of case 2.
        break;
    } // End of switch statement.

  } // End of loop through queries.

} // End of Main function definition.

// Call the Main function, reading input from standard input.
// The 'require("fs").readFileSync("/dev/stdin", "utf8")' part is specific
// to competitive programming environments for reading input.
Main( require("fs").readFileSync("/dev/stdin", "utf8") );