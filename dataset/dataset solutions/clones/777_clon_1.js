// This script is designed to process input from the standard input stream (stdin).
// It simulates a T9-like keypad input mechanism to decode messages.

process.stdin.resume(); // Ensure the standard input stream remains open and active.

// Set the character encoding for the incoming data to UTF-8.
process.stdin.setEncoding("utf8");

/*
 * This is an event listener for the 'data' event on the standard input.
 * The provided callback function will be executed whenever data is received.
 * The 'chunk' parameter contains the incoming data as a string.
 */
process.stdin.on("data", function (chunk)
{
  // First, clean up the input chunk: trim leading/trailing whitespace
  // and then split the chunk into an array of strings based on newline characters.
  var input = chunk.trim().split("\n");

  // The first element of the 'input' array represents the number of test cases (n).
  // Use .shift() to remove it from the array and assign its value to 'n'.
  var n = input.shift();

  // Define the mapping of numbers to characters, simulating a phone keypad.
  // Index 0 is empty, then 1 for ".,!? ", 2 for "abc", and so on.
  var button = ["", ".,!? ", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"];

  // Transform the 'button' array:
  // Each string of characters is split into an array of individual characters.
  button = button.map(function (key)
  {
    return key.split("");
  });


  // Iterate through each of the 'n' test cases provided in the input.
  for (var i = 0; i < n; i++)
  {
    // For the current test case, take the corresponding input line,
    // split it into individual characters, and then convert each character
    // back into its numerical representation using the Number constructor.
    var data = input[i].split("").map(Number);

    // Initialize variables needed for decoding the message.
    var message   =   ""        ; // Accumulates the final decoded message.
    var character =   ""        ; // Stores the character currently being selected.
    var count     =   0         ; // Tracks consecutive presses of the same button.

    // Process each number (button press) in the current test case's data.
    data.forEach(function (key)
    {
      if (key > 0) // If the pressed key is a digit from 1 to 9 (not 0).
      {
        // Select the character from the corresponding button's character set.
        // The '% button[key].length' ensures cycling through the characters.
        character = button[key][count % button[key].length];
        count++; // Increment the counter for consecutive presses.
      }
      else // If the pressed key is 0.
      {
        // A '0' key press signifies the completion of a character selection.
        // Append the currently selected 'character' to the 'message'.
        message += character;

        // Reset 'character' and 'count' for the next character selection.
        character = "";
        count = 0;
      }
    });

    // After processing all button presses for the current test case,
    // print the fully decoded message to the console.
    console.log(message);
  }
});
// End of the script's main execution block.