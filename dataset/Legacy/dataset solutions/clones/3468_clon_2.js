// This function processes the incoming text data.
function ProcessInput(dataString) {
  // Check if the length of the provided string is either two or three characters.
  if (dataString.length === 2 || dataString.length === 3) {
    // Declare a variable to hold the string's character count.
    var strLen = dataString.length;
    // Convert the string to lowercase, then split it into an array of characters,
    // reverse the order of characters, and finally join them back into a new string.
    var reversedString = dataString.toLowerCase().split("").reverse().join("");

    // Based on the string's length, print either the original string, the reversed string, or an empty string.
    // If strLen is 2, output dataString.
    // Else if strLen is 3, output reversedString.
    // Otherwise (if neither 2 nor 3, though the outer if prevents this path), output an empty string.
    console.log(strLen === 2 ? dataString : strLen === 3 ? reversedString : '');
  }
}

// This line is crucial for reading input from the standard input stream. Do not alter it.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
