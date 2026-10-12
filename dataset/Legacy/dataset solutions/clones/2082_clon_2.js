// This function processes a given string to determine a specific pattern.
function ProcessInput(dataString) {
  // Check if the length of the input string is odd.
  // If the length is even, it immediately prints "No" and exits.
  if ( ( dataString.length % 2 ) === 0 ) {
    console.log("No");
    return;
  }

  // Initialize a flag to "Yes", assuming the pattern is found until proven otherwise.
  let resultFlag = "Yes";

  // Iterate through the string, checking every other character.
  // The loop increment is by 2 to skip characters.
  for ( let idx = 0; idx < dataString.length; idx += 2 ) {
    // Search for the substring "hi" starting from the current index.
    // If "hi" is found, it means the pattern is not met.
    if ( dataString.indexOf("hi", idx) !== -1 ) {
      resultFlag = "No"; // Set the flag to "No"
      break; // Exit the loop early as the condition is already violated.
    }
  }

  // Output the final determination.
  console.log(resultFlag);
}

// Read the input from standard input asynchronously and pass it to the processing function.
ProcessInput( require("fs").readFileSync("/dev/stdin", "utf8") );
