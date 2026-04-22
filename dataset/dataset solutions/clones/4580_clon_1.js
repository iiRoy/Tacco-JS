/*
 * This JavaScript program processes town and road data from standard input.
 * It calculates the "degree" of each town, which represents the number of roads
 * connected to that town. The result is then printed to standard output.
 */

//  --- Input Reading Section ---
//  The 'fs' module is used to interact with the file system,
//  specifically to read from standard input.
var s = require("fs")
  .readFileSync(
    "/dev/stdin", // Path to standard input
    "utf8"        // Encoding for the input data
  ) //  Read the entire content of stdin.
  .split("\n"); //  Split the input string into an array of lines,
                //  where each line represents a piece of data.

//  --- Parsing N and M ---
//  The first line of input (s[0]) contains two space-separated integers:
//  N: the total number of towns.
//  M: the total number of roads.
var n_m = s[0]
  .split(" ") //  Separate the two numbers by the space character.
  .map(
    e => parseInt(e, 10) //  Convert each string part to an integer (base 10).
  );

//  --- Town Degree Array Initialization ---
//  Create an array to store the degree (number of connections) for each town.
//  The size of this array is N (n_m[0]).
//  All elements are initialized to zero, as no roads have been processed yet.
var town = new Array(n_m[0])
  .fill(0); //  Set initial degree for all towns to 0.

//  --- Road Processing Loop ---
//  Declare a variable 'roads' to temporarily hold the town IDs for each road.
var roads; //  This variable will be reassigned in each iteration of the loop.

//  Iterate through the input lines that represent road connections.
//  Road data starts from the second line (index 1) and continues for M lines.
for (
  var i = 1; //  Loop counter, starting from the first road line.
  i <= n_m[1]; //  Continue as long as 'i' is within the range of M roads.
  i++ //  Increment the counter for the next road.
) {
  //  For each road line:
  //  1. Extract the line from the input array 's'.
  //  2. Split it to get the two connected town IDs.
  //  3. Convert these IDs to numbers.
  roads = s[i]
    .split(" ") //  Split the current line by space to get two town IDs.
    .map(
      e => parseInt(e, 10) //  Parse each ID as an integer.
    );

  //  Increment the degree count for both towns involved in the current road.
  //  Town IDs in the input are 1-based, so we subtract 1 to convert them
  //  to 0-based array indices.
  town[roads[0] - 1]++; //  Increment the degree of the first connected town.
  town[roads[1] - 1]++; //  Increment the degree of the second connected town.
}

//  --- Output Section ---
//  Print the final degree counts for all towns.
//  Each town's degree should be on a new line.
console.log(
  town.join("\n") //  Join the elements of the 'town' array with newline characters.
);

//  End of program.