// Function to determine if a given integer is a prime number.
function is_prime_number(value_to_check) {
  // Handle base cases for small numbers.
  if (value_to_check === 1) {
    return false; // The number 1 is not considered prime.
  } else if (value_to_check === 2) {
    return true; // The number 2 is the smallest and only even prime.
  } else if (value_to_check % 2 === 0) {
    return false; // Any other even number is not prime.
  }
  // Apply specific checks for small odd primes (3, 5, 7) as an optimization.
  else if (value_to_check !== 3 && value_to_check % 3 === 0) {
    return false;
  } else if (value_to_check !== 5 && value_to_check % 5 === 0) {
    return false;
  } else if (value_to_check !== 7 && value_to_check % 7 === 0) {
    return false;
  }

  // Iterate through odd numbers starting from 3 up to the square root of the value.
  // If any divisor is found, the number is not prime.
  for (let divisor_candidate = 3; divisor_candidate <= Math.sqrt(value_to_check); divisor_candidate += 2) {
    if (value_to_check % divisor_candidate === 0) {
      return false; // Found a factor, so it's not prime.
    }
  }
  return true; // If no factors were found, the number is prime.
}

// Recursive function to compute the greatest common divisor (GCD) of two numbers.
function calculate_greatest_common_divisor(first_number, second_number) {
  if (second_number === 0) {
    return first_number; // Base case: GCD(N, 0) is N.
  }
  // Apply the Euclidean algorithm: GCD(A, B) = GCD(B, A mod B).
  return calculate_greatest_common_divisor(second_number, first_number % second_number);
}

// Main processing function for handling the program's input.
function ProcessInput(raw_input_data) {
  // Split the entire input string into an array of lines.
  let processed_lines = raw_input_data.split("\n");
  // Take the first line and split it by spaces to get the two number strings.
  let number_strings = processed_lines[0].split(" ");

  // Convert the string representations of numbers into actual integers.
  const first_operand = Number.parseInt(number_strings[0], 10);
  const second_operand = Number.parseInt(number_strings[1], 10);

  // Compute the greatest common divisor of the two parsed numbers.
  const common_divisor_result = calculate_greatest_common_divisor(first_operand, second_operand);

  // Initialize arrays to store divisors and a temporary, unused array.
  let divisors_list = []; // This array will hold all divisors of the GCD.
  let placeholder_array = []; // This array is populated but its values are not used later.

  // Find all positive divisors of the calculated GCD.
  for (let current_divisor_check = 1; current_divisor_check <= common_divisor_result; current_divisor_check++) {
    if (common_divisor_result % current_divisor_check === 0) {
      divisors_list.push(current_divisor_check); // Add the current number to the list of divisors.
      placeholder_array.push(0); // Add a zero to the placeholder array (maintains original behavior).
    }
  }

  // Count how many of the identified divisors are prime numbers.
  let prime_divisor_count = 0;
  for (let divisor_index = 0; divisor_index < divisors_list.length; divisor_index++) {
    // Use the helper function to check if each divisor is prime.
    if (is_prime_number(divisors_list[divisor_index]) === true) {
      prime_divisor_count += 1; // Increment the counter if the divisor is prime.
    }
  }

  // Output the final tally of prime divisors to the console.
  console.log(prime_divisor_count);
}

// Read the entire content of standard input as a UTF-8 string and pass it to the main function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
