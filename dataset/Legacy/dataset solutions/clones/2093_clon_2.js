// This function is designed to process a given input string.
function ProcessInput(inputString) {
  // Convert the entire input string into an array of individual characters.
  let characterArray = inputString.split("");

  // Evaluate if the first three characters in the array are identical.
  if (characterArray[0] === characterArray[1] && characterArray[0] === characterArray[2]) {
    // If all three characters are the same, print "No" to the console.
    console.log("No");
  } else {
    // Otherwise, if they are not all identical, print "Yes" to the console.
    console.log("Yes");
  }
}

// Retrieve the content from standard input and then pass it to our processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
