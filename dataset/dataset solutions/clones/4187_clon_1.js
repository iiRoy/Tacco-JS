function main(input) {
  // Remove leading/trailing whitespace
  input = input.trim();

  // Split the input string by spaces and convert each part to a number
  const a = input.split(" ").map(Number);

  // Calculate the minimum of the product of the first two numbers and the third number
  // and print it to the console.
  console.log(Math.min(a[0] * a[1], a[2]);
}

// Read input from stdin and call the main function
main(require('fs').readFileSync('/dev/stdin', 'utf8'));