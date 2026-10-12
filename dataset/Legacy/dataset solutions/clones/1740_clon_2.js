const inputChar = process.argv[2]; // Get the second command-line argument
const capitalizedChar = inputChar.toUpperCase(); // Convert the character to its uppercase equivalent
const smallChar = inputChar.toLowerCase(); // Convert the character to its lowercase equivalent

// Check if the original character is already uppercase
if (inputChar === capitalizedChar) {
  console.log("A"); // Output 'A' if it's uppercase
} else {
  console.log("a"); // Otherwise, output 'a'
}
