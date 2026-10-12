process.stdin.resume();

process.stdin.setEncoding("utf-8"); // Set the character encoding for incoming data

process.stdin.on("data", function (dataBlock) {
  // Process the received data chunk
  var inputParts = dataBlock.replace("\n", "").split(" "), idx; // Split the input string into parts
  
  // Assign the parsed values to distinct variables
  var valA = inputParts[0];
  var valB = inputParts[1];
  var valC = inputParts[2];

  // Evaluate conditions to determine the number of unique values
  if (valA !== valB && valA !== valC && valB !== valC) {
    process.stdout.write("3"); // All three values are unique
  }
  
  if (valA === valB && valA !== valC) {
    process.stdout.write("2"); // Two values are identical, one is different
  }
  
  if (valB === valC && valA !== valC) {
    process.stdout.write("2"); // Two values are identical, one is different
  }
  
  if (valC === valA && valA !== valB) {
    process.stdout.write("2"); // Two values are identical, one is different
  }
  
  if (valA === valB && valA === valC) {
    process.stdout.write("1"); // All three values are identical
  }
});
