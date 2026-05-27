(function (rawContent) {
  // This function processes the provided raw content.
  // First, split the entire content by newline characters.
  rawContent = rawContent.split("\n");

  // Extract the second line (index 1) and split it by spaces.
  // This creates an array of individual items from that line.
  let processedItems = rawContent[1].split(" ");

  // Reverse the order of elements in the array.
  processedItems.reverse();

  // Join the reversed elements back into a single string,
  // using a space as the separator, and print it to the console.
  console.log(processedItems.join(" "));
})(require("fs").readFileSync("/dev/stdin", "utf8")); // Read content from standard input using Node.js file system module.
