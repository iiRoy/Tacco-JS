const PRIME_MODULUS = 1_000_000_007;

// The maximum index required for factorial calculations.
// This value is derived from the maximum possible argument to the combination function,
// which is (exponent + n - 1). Given max(n)=10^5 and max(exponent) approx 21,
// the maximum value for this argument is 21 + 10^5 - 1 = 100020.
// The original code's 'N' was 10^5+21 = 100021, and its 'init' loop calculates up to fac[N].
// Therefore, we need to store factorials up to index 100021.
const MAX_FACTORIAL_INDEX = 100_021;

// Arrays to store precomputed factorial values and their modular inverses.
// Sized to MAX_FACTORIAL_INDEX + 1 to accommodate indices from 0 up to MAX_FACTORIAL_INDEX.
let factorial_values = new Array(MAX_FACTORIAL_INDEX + 1).fill(0);
let inv_factorial_values = new Array(MAX_FACTORIAL_INDEX + 1).fill(0);

/**
 * Performs modular multiplication of two numbers, ensuring the result stays within the prime modulus.
 * This implementation uses a technique to avoid overflow for large intermediate products by splitting
 * one operand into 16-bit parts.
 * @param {number} first_operand - The first number to multiply.
 * @param {number} second_operand - The second number to multiply.
 * @returns {number} The product of first_operand and second_operand, modulo PRIME_MODULUS.
 */
const mod_multiply = (first_operand, second_operand) => {
    // Split the first_operand into its high 16 bits and low 16 bits.
    const high_part = first_operand >>> 16; // Unsigned right shift to get the high part.
    const low_part = first_operand & 0xFFFF; // Bitwise AND to get the low part (0xFFFF is 65535).

    // Calculate (high_part * second_operand * 2^16 + low_part * second_operand) % PRIME_MODULUS.
    // 0x10000 is 2^16.
    return (high_part * second_operand % PRIME_MODULUS * 0x10000 + low_part * second_operand) % PRIME_MODULUS;
};

/**
 * Decomposes a given positive integer into its prime factors and their corresponding exponents.
 * @param {number} input_number - The integer to factorize.
 * @returns {Array<Object>} An array of objects, where each object has a 'prime_val' (the prime factor)
 *                          and an 'exp_count' (its exponent in the factorization).
 */
const prime_decompose = (input_number) => {
    let prime_factors_list = []; // Stores the prime factors and their exponents.
    let temp_num = input_number; // A temporary variable to perform divisions.

    // Iterate from 2 up to the square root of the current number.
    for (let current_divisor = 2; current_divisor * current_divisor <= temp_num; current_divisor++) {
        let current_exponent = 0; // Counter for the exponent of the current prime factor.
        while (temp_num % current_divisor === 0) {
            temp_num /= current_divisor; // Divide temp_num by current_divisor.
            current_exponent++; // Increment the exponent.
        }
        if (current_exponent > 0) {
            // If current_divisor was a factor, add it to our list.
            prime_factors_list.push({ prime_val: current_divisor, exp_count: current_exponent });
        }
    }

    // If temp_num is still greater than 1 after the loop, it means the remaining temp_num is a prime factor itself.
    if (temp_num !== 1) {
        prime_factors_list.push({ prime_val: temp_num, exp_count: 1 });
    }
    return prime_factors_list;
};

/**
 * Calculates (base_val ^ power_val) modulo PRIME_MODULUS using the method of binary exponentiation (exponentiation by squaring).
 * @param {number} base_val - The base number.
 * @param {number} power_val - The exponent.
 * @returns {number} The result of (base_val ^ power_val) % PRIME_MODULUS.
 */
const mod_power = (base_val, power_val) => {
    let result_val = 1; // Initialize the result to 1.
    let current_base = base_val; // A temporary variable for the base, which will be squared in each step.

    // Loop while the exponent is not zero.
    while (power_val !== 0) {
        if (power_val & 1) { // Check if the least significant bit of power_val is 1 (i.e., power_val is odd).
            result_val = mod_multiply(result_val, current_base); // If odd, multiply result by current_base.
        }
        current_base = mod_multiply(current_base, current_base); // Square the current_base.
        power_val = power_val >>> 1; // Right shift power_val by 1 (integer division by 2).
    }
    return result_val;
};

/**
 * Calculates the number of combinations "n choose r" (C(n, r)) modulo PRIME_MODULUS.
 * This function relies on precomputed factorial_values and inv_factorial_values.
 * C(n, r) = n! / (r! * (n-r)!) = n! * (r!)^-1 * ((n-r)!)^-1 (mod P).
 * @param {number} total_items - The total number of items (n).
 * @param {number} chosen_items - The number of items to choose (r).
 * @returns {number} The result of C(total_items, chosen_items) % PRIME_MODULUS.
 */
const calculate_combinations = (total_items, chosen_items) => {
    // Handle edge cases for combinations.
    if (total_items === 0 && chosen_items === 0) return 1;
    if (total_items < chosen_items || total_items < 0) return 0;

    // Calculate the product of inverse factorials for r! and (n-r)!.
    const temp_product = mod_multiply(inv_factorial_values[total_items - chosen_items], inv_factorial_values[chosen_items]);
    // Multiply by n! to get the final combination value.
    return mod_multiply(temp_product, factorial_values[total_items]);
};

/**
 * Initializes the global factorial_values and inv_factorial_values arrays.
 * This function must be called once before any calls to calculate_combinations.
 * It precomputes factorials and their modular inverses up to MAX_FACTORIAL_INDEX.
 */
const initialize_factorials = () => {
    factorial_values[0] = 1; // 0! is 1.
    inv_factorial_values[0] = 1; // The modular inverse of 0! is 1.

    // Loop to compute factorials and inverse factorials iteratively.
    // The loop runs from i=0 up to MAX_FACTORIAL_INDEX - 1.
    // This populates factorial_values[1] through factorial_values[MAX_FACTORIAL_INDEX].
    for (let i = 0; i < MAX_FACTORIAL_INDEX; i++) {
        factorial_values[i + 1] = mod_multiply(factorial_values[i], (i + 1)); // (i+1)! = i! * (i+1)
        // Calculate the modular inverse using Fermat's Little Theorem: a^(P-2) % P = a^-1 % P.
        inv_factorial_values[i + 1] = mod_power(factorial_values[i + 1], PRIME_MODULUS - 2);
    }
};

/**
 * The main function that processes the input, performs the required calculations, and prints the result.
 * It calculates the number of ways to distribute 'n' identical items into 'm' distinct bins,
 * where 'm' is factorized into its prime components.
 * @param {string} input_string - A string containing two space-separated integers, 'n' and 'm'.
 */
const process_input_and_calculate = (input_string) => {
    // Parse the input string to extract the two numbers.
    let [num_n, num_m] = input_string.split(" ").map(Number);

    // Obtain the prime factorization of 'num_m'.
    let decomposed_factors = prime_decompose(num_m);

    let final_answer = 1; // Initialize the final result.

    // Ensure factorial and inverse factorial arrays are initialized.
    initialize_factorials();

    // Iterate through each prime factor found in 'decomposed_factors'.
    // Object.keys is used to iterate over the numeric indices of the array.
    Object.keys(decomposed_factors).forEach(factor_idx => {
        // For each prime factor 'p' with exponent 'e' (decomposed_factors[factor_idx].exp_count),
        // we need to calculate C(e + n - 1, e). This is a stars and bars problem.
        let upper_val = decomposed_factors[factor_idx].exp_count + num_n - 1;
        let lower_val = decomposed_factors[factor_idx].exp_count;
        // Multiply the current final_answer by the combinations for this factor.
        final_answer = mod_multiply(final_answer, calculate_combinations(upper_val, lower_val));
    });

    // Print the final calculated answer to standard output.
    console.log(final_answer);
};

// Read the input from standard input (typically /dev/stdin in competitive programming environments)
// and pass it to the main processing function.
process_input_and_calculate(require("fs").readFileSync("/dev/stdin", "utf8"));
