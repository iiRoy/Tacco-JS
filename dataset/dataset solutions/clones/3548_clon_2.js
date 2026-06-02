function ProcessInput(dataString) {
  // Remove leading/trailing whitespace from the raw input string
  dataString = dataString.trim();

  // Divide the input string into an array of substrings using space as a delimiter
  dataString = dataString.split(" ");

  // Calculate the product of the first two numbers and check if it's an even number
  // If the product is evenly divisible by 2 (i.e., it's even), output "No"
  if ((dataString[0] * dataString[1]) % 2 === 0) {
    console.log("No");
  }
  // Otherwise (if the product is odd), output "Yes"
  else {
    console.log("Yes");
  }
}

// Read the entire content of standard input, decode it as UTF-8,
// and then pass it to our main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
