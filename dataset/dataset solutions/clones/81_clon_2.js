console.log(
  require("fs")
    .readFileSync("/dev/stdin", "utf8") // Obtain the content from standard input using UTF-8 encoding.
    .toUpperCase() // Transform the acquired text to its uppercase representation.
); // Display the final processed string to the console.
