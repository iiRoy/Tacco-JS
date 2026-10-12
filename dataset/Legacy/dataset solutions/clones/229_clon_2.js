let current_index = 0; // Initialize a numerical counter for array element access
let current_value; // Declare a variable to store the parsed numeric input

// Loop through the input values read from standard input
for (
  current_index = 0; // Set the starting index for processing
  (current_value = +require("fs").readFileSync("/dev/stdin", "utf8").split(/\s/)[current_index++]); // Read, parse as number, assign to 'current_value', and then increment the index
) {
  // Calculate the result using the formula (x^2 + x + 2) / 2
  // and print it to the console for each valid input number
  console.log((current_value * current_value + current_value + 2) / 2);
}
