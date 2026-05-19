function ProcessInput(rawData) {
  // Remove any leading or trailing whitespace from the received data.
  rawData = rawData.trim();

  // Calculate the ASCII value of the initial character and increment it.
  const nextCharAscii = rawData.charCodeAt(0) + 1;

  // Display the character that corresponds to the newly computed ASCII value.
  console.log(String.fromCharCode(nextCharAscii));
}

// Obtain the content from the standard input stream and then execute the primary processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
