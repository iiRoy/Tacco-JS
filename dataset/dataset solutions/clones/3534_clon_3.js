const MODULO_CONST = 1_000_000_007;

// This constant defines the maximum size for precomputed factorial arrays.
// It's derived from the maximum possible value of (exponent + N - 1) in the combination formula.
// Given N_max = 10^5 and max_exponent_for_10^9_plus_7 is approximately 30,
// MAX_VAL_SIZE = 10^5 + 30.
const MAX_VAL_SIZE = 100030;

// Global arrays to store precomputed factorial values and their modular inverses.
// These are essential for efficient calculation of combinations modulo a prime.
let factorial_values = new Array(MAX_VAL_SIZE).fill(0);
let inverse_factorials = new Array(MAX_VAL_SIZE).fill(0);

/**
 * Performs modular multiplication of two numbers, ensuring the result stays within the modulo.
 * Uses BigInts for intermediate products to prevent overflow issues before applying the modulo,
 * especially when inputs might be large (e.g., close to MODULO_CONST).
 *
 * @param {number} operand1 - The first number to multiply.
 * @param {number} operand2 - The second number to multiply.
 * @returns {BigInt} The product (operand1 * operand2) modulo MODULO_CONST.
 */
const perform_modular_multiplication = (operand1, operand2) => {
    // Basic type and value validation for robustness.
    if (typeof operand1 !== 'number' || typeof operand2 !== 'number' || operand1 < 0 || operand2 < 0) {
        console.error("Error: Invalid numeric input for modular multiplication. Expected non-negative numbers.");
        return 0n; // Return BigInt zero on error
    }
    // Convert numbers to BigInts, perform multiplication, and then apply modulo.
    return (BigInt(operand1) * BigInt(operand2)) % BigInt(MODULO_CONST);
};

/**
 * Decomposes a given positive integer into its prime factors along with their exponents.
 * For example, calling this with 12 would return [{ prime: 2, count: 2 }, { prime: 3, count: 1 }].
 *
 * @param {number} target_number - The integer to factorize. Must be a positive integer.
 * @returns {Array<Object>} An array of objects, where each object contains a 'prime' factor
 *                          and its 'count' (exponent). Returns an empty array for numbers less than 2.
 */
const get_prime_factors_decomposition = (target_number) => {
    // Prime factorization is typically defined for integers greater than or equal to 2.
    if (target_number < 2) {
        return [];
    }

    let factors_list = [];
    let number_to_factor = target_number; // Use a mutable copy for factorization process.

    // Iterate through potential divisors starting from 2 up to the square root of the remaining number.
    // This is an efficient way to find prime factors.
    for (let current_divisor = 2; current_divisor * current_divisor <= number_to_factor; ++current_divisor) {
        let exponent_count = 0; // Initialize the exponent for the current prime factor.

        // Continuously divide by current_divisor as long as it's a factor.
        while (number_to_factor % current_divisor === 0) {
            number_to_factor /= current_divisor;
            exponent_count++;
        }

        // If the current_divisor was indeed a factor, add it to our list.
        if (exponent_count > 0) {
            factors_list.push({ prime: current_divisor, count: exponent_count });
        }
    }

    // If, after the loop, number_to_factor is still greater than 1, it means the remaining
    // number is itself a prime factor (larger than any previous factors found).
    if (number_to_factor > 1) {
        factors_list.push({ prime: number_to_factor, count: 1 });
    }

    return factors_list;
};

/**
 * Computes (base ^ exponent) modulo MODULO_CONST using the binary exponentiation (exponentiation by squaring) algorithm.
 * This method is efficient for large exponents.
 *
 * @param {number} base_value - The base of the exponentiation.
 * @param {number} exponent_power - The exponent.
 * @returns {BigInt} The result of (base_value ^ exponent_power) % MODULO_CONST.
 */
const compute_modular_power = (base_value, exponent_power) => {
    // Handle edge case: any number to the power of 0 is 1.
    if (exponent_power === 0) {
        return 1n;
    }
    // Handle invalid negative exponents (not typically used in this context for modular arithmetic,
    // as modular inverse is handled by Fermat's Little Theorem with a positive exponent).
    if (exponent_power < 0) {
        console.warn("Warning: Negative exponent encountered in modular power function. Expected non-negative.");
        return 0n; // Or throw error depending on strictness.
    }

    let current_result = 1n;
    let current_base = BigInt(base_value) % BigInt(MODULO_CONST); // Ensure base is within modulo range.

    // Loop while the exponent is greater than zero.
    while (exponent_power > 0) {
        // If the least significant bit of the exponent is 1 (i.e., exponent_power is odd).
        if (exponent_power & 1) {
            current_result = perform_modular_multiplication(current_result, current_base);
        }
        // Square the base and right-shift the exponent (equivalent to dividing by 2).
        current_base = perform_modular_multiplication(current_base, current_base);
        exponent_power >>= 1;
    }
    return current_result;
};

/**
 * Calculates the number of combinations (nCr) modulo MODULO_CONST.
 * This function relies on precomputed factorials and inverse factorials.
 * The formula used is nCr = n! * (r!)^(-1) * ((n-r)!)^(-1) (mod P), where (X)^(-1) is the modular multiplicative inverse.
 *
 * @param {number} total_n_items - The total number of items available (n).
 * @param {number} selected_r_items - The number of items to choose (r).
 * @returns {BigInt} The value of C(n, r) modulo MODULO_CONST.
 */
const calculate_combinations_mod_p = (total_n_items, selected_r_items) => {
    // Special case: C(0, 0) is universally defined as 1.
    if (total_n_items === 0 && selected_r_items === 0) {
        return 1n;
    }
    // Invalid conditions for combinations: r < 0 or r > n.
    if (selected_r_items < 0 || selected_r_items > total_n_items) {
        return 0n;
    }

    // Precalculate (n - r) for clarity and efficiency.
    const difference_n_r = total_n_items - selected_r_items;

    // Retrieve precomputed factorial and inverse factorial values.
    const n_factorial = factorial_values[total_n_items];
    const r_factorial_inverse = inverse_factorials[selected_r_items];
    const n_r_factorial_inverse = inverse_factorials[difference_n_r];

    // Perform the multiplications step-by-step to apply modulo at each stage.
    let intermediate_product = perform_modular_multiplication(n_factorial, r_factorial_inverse);
    let final_combination_result = perform_modular_multiplication(intermediate_product, n_r_factorial_inverse);

    return final_combination_result;
};

/**
 * Initializes the global arrays `factorial_values` and `inverse_factorials`.
 * This function must be called exactly once before any combination calculations are performed.
 * It precomputes factorials up to MAX_VAL_SIZE and their modular inverses using Fermat's Little Theorem.
 */
const initialize_combinatorics_data = () => {
    // Base cases: 0! = 1, and the modular inverse of 1 is 1.
    factorial_values[0] = 1;
    inverse_factorials[0] = 1;

    // Loop to fill the factorial and inverse factorial arrays.
    for (let current_idx = 0; current_idx < MAX_VAL_SIZE - 1; ++current_idx) {
        // Calculate (idx + 1)! = idx! * (idx + 1)
        factorial_values[current_idx + 1] = perform_modular_multiplication(factorial_values[current_idx], (current_idx + 1));
        
        // Calculate the modular inverse of (idx + 1)! using Fermat's Little Theorem: a^(P-2) mod P.
        inverse_factorials[current_idx + 1] = compute_modular_power(factorial_values[current_idx + 1], MODULO_CONST - 2);
    }
};

/**
 * The main execution logic of the program.
 * It reads input, performs prime factorization, calculates combinations for each factor,
 * and outputs the final product modulo MODULO_CONST.
 *
 * @param {string} input_string_data - The raw input string, expected to contain two space-separated numbers N and M.
 */
const execute_problem_solution = (input_string_data) => {
    // Validate input data type and content.
    if (typeof input_string_data !== 'string' || !input_string_data.trim()) {
        console.error("Error: Invalid or empty input string provided.");
        return;
    }

    const cleaned_input_parts = input_string_data.trim().split(/\s+/);
    if (cleaned_input_parts.length !== 2) {
        console.error("Error: Input string must contain exactly two space-separated numbers (N and M).");
        return;
    }

    const N_value = Number(cleaned_input_parts[0]);
    const M_value = Number(cleaned_input_parts[1]);

    // Validate parsed numeric values.
    if (isNaN(N_value) || isNaN(M_value) || N_value < 0 || M_value < 0) {
        console.error("Error: Invalid numeric values for N or M. Both must be non-negative integers.");
        return;
    }

    // Initialize precomputed data for combinations. This must be done once.
    initialize_combinatorics_data();

    // Perform prime factorization on M.
    const M_prime_factors = get_prime_factors_decomposition(M_value);

    let aggregated_result = 1n; // Initialize result as BigInt 1 for multiplicative accumulation.

    // Iterate through each unique prime factor and its count (exponent) found in M.
    // For each (prime^exponent), we need to calculate C(N + exponent - 1, exponent).
    // This represents distributing N identical items into 'exponent' distinct bins (representing
    // the 'exponent' occurrences of the prime factor in M's decomposition).
    for (const factor_details of M_prime_factors) {
        const factor_exponent = factor_details.count;

        // The 'n' for C(n, r) in this specific problem is (N_value + factor_exponent - 1).
        const combinations_n_val = N_value + factor_exponent - 1;
        // The 'r' for C(n, r) is the factor's exponent.
        const combinations_r_val = factor_exponent;

        // Calculate combinations for the current prime factor.
        const current_factor_combinations = calculate_combinations_mod_p(combinations_n_val, combinations_r_val);
        
        // Multiply the current combination result into the aggregated total.
        aggregated_result = perform_modular_multiplication(aggregated_result, current_factor_combinations);
    }

    // Output the final result. Convert BigInt back to Number for console output.
    console.log(Number(aggregated_result));
};

// Read input from standard input and execute the solution.
execute_problem_solution(require("fs").readFileSync("/dev/stdin", "utf8"));