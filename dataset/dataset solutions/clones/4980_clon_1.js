process.stdin.resume(); /* Ensures the standard input stream remains open. */

process.stdin.setEncoding('ascii'); // Sets the encoding for input data to ASCII.

var input_stdin = ""; // Accumulates raw input data as a string.
var input_stdin_array = ""; // Stores input lines after splitting.
var input_currentline = 0;  // Tracks the current line being read from input_stdin_array.

// Event listener for incoming data on standard input.
process.stdin.on(
  'data',                                   // Event name: 'data'
  function (data)                           // Callback function to handle data chunks
  {
    input_stdin += data;                    // Appends received data to the input_stdin string.
  }
);

// Event listener for SIGINT signal (e.g., Ctrl+C).
process.on(
  'SIGINT',                                 // Event name: 'SIGINT'
  function()                                // Callback function for SIGINT
  {
    input_stdin_array = input_stdin.split("\n"); // Splits the accumulated input into an array of lines.
    main();                                 // Calls the main logic function.
    process.exit();                         // Exits the process after execution.
  }
);


// Event listener for the 'end' of standard input stream.
process.stdin.on(
  'end',                                    // Event name: 'end'
  function ()                               // Callback function for end of input
  {
    input_stdin_array = input_stdin.split("\n"); // Splits the input into an array of lines.
    main();                                 // Initiates the main program execution.
  }
);

/*
 * Function to read a single line from the processed input array.
 * Increments the line counter for subsequent calls.
 */
function readLine()
{
  return input_stdin_array[input_currentline++]; // Returns the current line and then increments the counter.
}

/////////////////////////////////////////////////////////////////////////////
// The code above this line handles input/output and should not be modified.
/////////////////////////////////////////////////////////////////////////////

/*
 * The main function containing the core logic of the program.
 * It processes grid dimensions and calculates frequencies of 'covered' cells.
 */
function main()
{
  var map={}; // Initializes an empty object to act as a frequency map.

  // Reads the first line of input, splits it by space, and stores it in 's'.
  var s = readLine().split(" ");
  
  // Parses H, W, and N from the split string array.
  var H=parseInt(s[0]), W=parseInt(s[1]), N=parseInt(s[2]);

  // Loop N times, processing each given coordinate.
  for (var p=0; p < N; p++)
  {
    s = readLine().split(" "); // Reads the next line, containing coordinates for 'a' and 'b'.
    
    // Parses 'a' and 'b' from the current line.
    var a=parseInt(s[0]);
    var b=parseInt(s[1]);

    // Inner loops to iterate over a 3x3 square centered around (a,b).
    // The range for 'i' is [a-2, a].
    for (var i=a-2; i <= a; i++)
    {
      // Check if 'i' is within the valid grid boundaries (1 to H-2).
      if (i>=1 && i <= H-2)
      {
        // The range for 'j' is [b-2, b].
        for (var j=b-2; j <= b; j++)
        {
          // Check if 'j' is within the valid grid boundaries (1 to W-2).
          if (j>=1 && j <= W-2)
          {
            // Creates a unique string identifier for the 3x3 square's top-left corner.
            var attrib = "a"+i.toString()+"_"+j.toString();

            // Checks if the attribute already exists in the map.
            if (map[attrib] == undefined)
            {
              map[attrib] = 1; // If not, initialize its count to 1.
            }
            else
            {
              map[attrib]++;   // If it exists, increment its count.
            }
          }
        }
      }
    }
  }

  // Initializes an array 'ans' to store frequencies of counts (0 to 9).
  var ans = [];
  
  // Fills 'ans' with 10 zeros.
  for (var i=0; i < 10; i++)
  {
    ans.push(0);
  }

  // Calculate the total number of 3x3 squares that can exist in the grid.
  ans[0] = (H-2)*(W-2);

  // Iterates through the frequency map 'map'.
  for (key in map)
  {
    ans[0]--;             // Decrements the count of squares with 0 overlaps.
    ans[map[key]]++;      // Increments the count for squares with map[key] overlaps.
  }

  // Prints the final results to the console.
  for (var i=0; i < 10; i++)
  {
    console.log(ans[i].toString()); // Outputs each frequency count as a string.
  }
}