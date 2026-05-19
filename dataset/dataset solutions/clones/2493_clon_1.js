function Main(input) {
  // Trim whitespace and split input into lines
  var tmp = input.trim().split('\n');
  // Parse the first line as the number of elements
  var N = Number(tmp[0]);
  // Split the second line into an array of characters
  var strs = tmp[1].split('');
  // Initialize a counter
  var cnt = 0;
  // Increment counter if N is positive
  if (N > 0) {
    cnt++;
  }
  // Iterate through the characters
  for (var i = 0; i <= N; i++) {
    // If adjacent characters are different, increment counter
    if (strs[i] !== strs[i + 1]) {
      cnt++;
    }
  }
  // Output the final count minus one
  console.log(cnt - 1);
}

/*
// Example usage with a predefined input string
var input = `20
xxzaffeeeeddfkkkkllq`;
Main(input);
*/

// Read input from standard input and execute Main function
Main(require("fs").readFileSync("/dev/stdin", "utf8"));*/