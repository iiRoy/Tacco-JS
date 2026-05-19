const PRIME_MODULUS = 1_000_000_007; // A large prime number used for modular arithmetic operations.

// MAX_SIZE is determined by the maximum possible value for 'n' (10^5) plus the maximum exponent 'e' (approx 30 for 10^9).
const MAX_SIZE = 100_000 + 30;

let factorial_values = new Array(MAX_SIZE).fill(0); // Stores precomputed factorials modulo PRIME_MODULUS.
let inverse_factorial_values = new Array(MAX_SIZE).fill(0); // Stores precomputed modular inverse factorials.

// Custom multiplication function to prevent overflow before taking modulo, especially for large numbers.
const multiply_modulo = (first_operand, second_operand) => {
    // This uses a technique to multiply two numbers 'a' and 'b' modulo 'M'
    // by splitting 'a' into two parts: a = (a >> 16) * 2^16 + (a & 0xFFFF)
    // This helps prevent intermediate products from exceeding standard 32-bit integer limits
    // before the modulo operation, especially useful in environments where numbers might
    // implicitly be treated as 32-bit.
    const high_part_a = first_operand >>> 16; // Unsigned right shift for the higher 16 bits
    const low_part_a = first_operand & 0xFFFF; // Mask for the lower 16 bits

    // Calculate (high_part_a * second_operand * 2^16) % PRIME_MODULUS
    const term1 = (high_part_a * second_operand) % PRIME_MODULUS * 0x10000;

    // Calculate (low_part_a * second_operand) % PRIME_MODULUS
    const term2 = (low_part_a * second_operand) % PRIME_MODULUS;

    // Sum the terms and take the final modulo
    return (term1 + term2) % PRIME_MODULUS;
};

// Decomposes a given integer into its prime factors with their respective exponents.
const prime_decompose = (input_number) => {
    let prime_factors_list = []; // Array to store objects like {prime_val: p, exponent_val: e}
    let temp_num = input_number; // Use a temporary variable to modify during factorization

    // Iterate from 2 up to the square root of the number
    for (let loop_idx = 2; loop_idx * loop_idx <= temp_num; loop_idx++) {
        let power_count = 0; // Counter for the exponent of the current prime factor

        // While the current number is divisible by loop_idx, increment count and divide
        while (temp_num % loop_idx === 0) {
            temp_num /= loop_idx;
            power_count++;
        }

        // If loop_idx was a factor, add it to our list
        if (power_count > 0) {
            prime_factors_list.push({ prime_val: loop_idx, exponent_val: power_count });
        }
    }

    // If after all divisions, temp_num is still greater than 1, it means temp_num itself is a prime factor
    if (temp_num > 1) {
        prime_factors_list.push({ prime_val: temp_num, exponent_val: 1 });
    }
    return prime_factors_list;
};

// Computes (base_num ^ power_exponent) % PRIME_MODULUS using binary exponentiation (exponentiation by squaring).
const modular_power = (base_num, power_exponent) => {
    let result_val = 1; // Initialize result to 1
    let current_base = base_num; // Temporary variable for the base

    // Loop while the exponent is not zero
    while (power_exponent !== 0) {
        // If the least significant bit of the exponent is 1, multiply result by current_base
        if (power_exponent & 1) {
            result_val = multiply_modulo(result_val, current_base);
        }
        // Square the current_base and take modulo
        current_base = multiply_modulo(current_base, current_base);
        // Right shift the exponent by 1 (equivalent to dividing by 2)
        power_exponent >>>= 1; // Unsigned right shift
    }
    return result_val;
};

// Calculates combinations (nCr) modulo PRIME_MODULUS using precomputed factorials and inverse factorials.
const combinations_nCr = (num_n, num_r) => {
    // Base case: C(0, 0) is 1
    if (num_n === 0 && num_r === 0) {
        return 1;
    }
    // If r is greater than n, or n is negative, combinations are 0
    if (num_n < num_r || num_n < 0) {
        return 0;
    }
    // C(n, r) = n! / (r! * (n-r)!) = n! * (r!)^-1 * ((n-r)!)^-1 (mod P)
    const term_n_fact = factorial_values[num_n];
    const term_r_inv_fact = inverse_factorial_values[num_r];
    const term_n_minus_r_inv_fact = inverse_factorial_values[num_n - num_r];

    return multiply_modulo(term_n_fact, multiply_modulo(term_r_inv_fact, term_n_minus_r_inv_fact));
};

// Initializes the factorial_values and inverse_factorial_values arrays.
const initialize_factorials = () => {
    factorial_values[0] = 1; // 0! = 1
    inverse_factorial_values[0] = 1; // (0!)^-1 = 1

    // Precompute factorials up to MAX_SIZE - 1
    for (let loop_idx = 0; loop_idx < MAX_SIZE - 1; loop_idx++) {
        factorial_values[loop_idx + 1] = multiply_modulo(factorial_values[loop_idx], (loop_idx + 1));
        // Compute modular inverse of (i+1)! using Fermat's Little Theorem: a^(P-2) % P
        inverse_factorial_values[loop_idx + 1] = modular_power(factorial_values[loop_idx + 1], PRIME_MODULUS - 2);
    }
};

// Main execution function that processes input and calculates the final result.
const execute_program = (input_string) => {
    // Parse input: two numbers n and m
    const [num_n, num_m] = input_string.split(" ").map(Number);

    // Find prime factorization of m
    const decomposed_factors = prime_decompose(num_m);

    let final_result = 1; // Initialize the overall result

    // Precompute factorials and inverse factorials once
    initialize_factorials();

    // Iterate through each prime factor and its exponent
    // The original code uses Object.keys on an array, which returns indices as strings.
    // This is functionally equivalent to iterating through the array elements.
    Object.keys(decomposed_factors).forEach(factor_index => {
        // For each prime factor p with exponent e, we need to calculate C(e + n - 1, e)
        // This is a stars and bars problem: distributing n identical items into e distinct bins.
        // The formula is C(n + k - 1, k) where n is items, k is bins.
        // Here, it's C(exponent_val + num_n - 1, exponent_val)
        const upper_bound = decomposed_factors[factor_index].exponent_val + num_n - 1;
        const lower_bound = decomposed_factors[factor_index].exponent_val;

        // Multiply the current result by the combinations for this factor
        final_result = multiply_modulo(final_result, combinations_nCr(upper_bound, lower_bound));
    });

    // Output the final calculated answer to standard output.
    console.log(final_result);
};

// Read input from standard input and execute the program.
execute_program(require("fs").readFileSync("/dev/stdin", "utf8"));
