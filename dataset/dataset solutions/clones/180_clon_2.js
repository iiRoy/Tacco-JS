// This module provides utilities for number theory operations.
function checkPrimality(test_val) {
  // Handle edge cases for small numbers.
  if (test_val === 2 || test_val === 3) return true;
  // Numbers less than 2, or even, or divisible by 3 (excluding 2, 3) are not prime.
  if (test_val < 2 || test_val % 2 === 0 || test_val % 3 === 0) return false;

  // Calculate the upper bound for divisor checking.
  // We only need to check divisors up to the square root of the number.
  const upper_bound = Math.round(Math.sqrt(test_val));

  let search_index = 1; // Initialize the loop counter for the 6k +/- 1 optimization.
  // Loop using the 6k +/- 1 optimization for efficiency.
  while (search_index * 6 - 1 <= upper_bound) {
    // Check divisibility by (6k - 1) and (6k + 1).
    if (test_val % (search_index * 6 - 1) === 0 || test_val % (search_index * 6 + 1) === 0) return false;
    search_index++; // Increment the search index.
  }
  return true; // If no divisors found, the number is prime.
}


// Main program execution begins here.
// Acquire the file system module for reading input.
const file_system_module = require('fs');
// Read all input from standard input as a UTF-8 string.
let incoming_text_data = file_system_module.readFileSync('/dev/stdin', 'utf8');
// Trim whitespace and split the input into individual lines.
let processed_entries_list = incoming_text_data.trim().split('\n');

let current_data_line; // Variable to hold the current line being processed.
// Loop through each line of input until no more lines are available.
while (current_data_line = processed_entries_list.shift()) {
  // Convert the current line string to a numeric value.
  const query_number = +current_data_line;

  let lower_prime_neighbor; // Variable to store the prime number immediately less than query_number.
  let upper_prime_neighbor; // Variable to store the prime number immediately greater than query_number.

  // Special handling for the number 3, as its lower prime neighbor is 2.
  if (query_number === 3) {
    lower_prime_neighbor = 2;
  }

  // Initialize the search counter for finding prime neighbors.
  let prime_finder_iterator = 3; // Start searching from 3, as 2 is handled or part of the loop logic.
  // Infinite loop to find the prime neighbors.
  while (true) {
    // Check if the current iterator value is prime and less than the query_number.
    if (checkPrimality(prime_finder_iterator) && prime_finder_iterator < query_number) {
      lower_prime_neighbor = prime_finder_iterator; // Update the lower prime neighbor.
    }
    // Check if the current iterator value is prime and greater than the query_number.
    if (checkPrimality(prime_finder_iterator) && prime_finder_iterator > query_number) {
      upper_prime_neighbor = prime_finder_iterator; // Update the upper prime neighbor.
      break; // Found the upper neighbor, so exit the loop.
    }
    prime_finder_iterator += 2; // Increment by 2 to check only odd numbers (optimization).
  }
  // Output the found prime neighbors to the console.
  console.log(lower_prime_neighbor, upper_prime_neighbor);
}