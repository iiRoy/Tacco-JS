const PRIME_MODULUS = 10**9 + 7; // A large prime number used for modulo operations to prevent overflow and ensure distinct results.
// The upper bound for array indexing is determined by the maximum possible value of (prime_power + first_param - 1).
// Given maximum first_param (n) is 10^5, and maximum prime_power (e) is log_2(10^9) approx 30 (or log_base_p(M) is smaller), a safe estimate is around 10^5 + 30.
const UPPER_LIMIT = 10**5 + 30; 

let factorial_values = Array.from({ length: UPPER_LIMIT }).fill(0); // Stores precomputed factorial values modulo PRIME_MODULUS.
let inv_factorial_values = new Array(UPPER_LIMIT).fill(0); // Stores precomputed modular multiplicative inverses of factorial values.

// Computes the product of two numbers modulo PRIME_MODULUS, optimized for numbers up to 10^9.
const perform_multiplication = (first_operand, second_operand) => (
    ((first_operand >>> 16) * second_operand % PRIME_MODULUS * 65536 + (first_operand & 65535) * second_operand) % PRIME_MODULUS
);

// Determines the prime factors and their corresponding powers for a given integer.
const decompose_into_primes = (input_integer) => {
    let prime_factor_collection = []; // List to store objects like {prime_base: p, prime_power: e}.

    for (let current_divisor = 2; current_divisor * current_divisor <= input_integer; current_divisor++) {
        let occurrence_count = 0; // Counts how many times current_divisor divides input_integer.
        while (input_integer % current_divisor === 0) {
            input_integer /= current_divisor;
            occurrence_count++;
        }
        if (occurrence_count > 0) {
            prime_factor_collection.push({ prime_base: current_divisor, prime_power: occurrence_count });
        }
    }
    
    // If after division, input_integer is still greater than 1, it means the remaining value is a prime factor itself.
    if (input_integer !== 1) {
        prime_factor_collection.push({ prime_base: input_integer, prime_power: 1 });
    }
    return prime_factor_collection;
};

// Calculates (base_val ^ exp_val) % PRIME_MODULUS using binary exponentiation (power by squaring).
const modular_exponentiation = (base_val, exp_val) => {
    let result_accumulator = 1; // Initialize the result.
    let current_base = base_val; // Working copy of the base.

    while (exp_val !== 0) {
        if (exp_val & 1) { // Check if the least significant bit of exp_val is 1.
            result_accumulator = perform_multiplication(result_accumulator, current_base);
        }
        current_base = perform_multiplication(current_base, current_base); // Square the base.
        exp_val >>>= 1; // Right shift exp_val by 1 (equivalent to integer division by 2).
    }
    return result_accumulator;
};

// Computes the binomial coefficient "n choose k" (C(n, k)) modulo PRIME_MODULUS.
const calculate_combinations = (total_items, chosen_items) => {
    // Handle edge cases for combinations.
    if (total_items === 0 && chosen_items === 0) return 1;
    if (total_items < chosen_items || total_items < 0) return 0;
    
    // C(n, k) = n! / (k! * (n-k)!) = n! * (k!)^-1 * ((n-k)!)^-1 (mod P)
    const inverse_product_part = perform_multiplication(inv_factorial_values[total_items - chosen_items], inv_factorial_values[chosen_items]);
    return perform_multiplication(inverse_product_part, factorial_values[total_items]);
};

// Precomputes factorials and their modular inverses up to UPPER_LIMIT.
const initialize_lookup_tables = () => {
    factorial_values[0] = 1; // Base case for factorial of 0.
    inv_factorial_values[0] = 1; // Base case for inverse factorial of 0.

    for (let loop_idx = 0; loop_idx < UPPER_LIMIT - 1; loop_idx++) { // Iterate to fill up to UPPER_LIMIT-1
        factorial_values[loop_idx + 1] = perform_multiplication(factorial_values[loop_idx], (loop_idx + 1));
        // Calculate modular inverse using Fermat's Little Theorem: a^(P-2) % P
        inv_factorial_values[loop_idx + 1] = modular_exponentiation(factorial_values[loop_idx + 1], PRIME_MODULUS - 2);
    }
};

// Main function to process input and orchestrate calculations.
const execute_primary_logic = (input_string_data) => {
    // Parse input string into two numbers.
    let [num_items_n, target_value_m] = input_string_data.split(" ").map(Number);
    
    // Find the prime factorization of target_value_m.
    let prime_decomposition_result = decompose_into_primes(target_value_m);
    
    let final_computed_answer = 1; // Accumulator for the final result.
    
    initialize_lookup_tables(); // Prepare factorial and inverse factorial arrays.
    
    // Iterate through each prime factor found.
    Object.keys(prime_decomposition_result).forEach(factor_array_index => {
        // Calculate the two arguments for the combinations function: C(e + n - 1, e)
        let upper_arg_comb = prime_decomposition_result[factor_array_index].prime_power + num_items_n - 1;
        let lower_arg_comb = prime_decomposition_result[factor_array_index].prime_power;
        
        // Multiply the current answer by the combinations result for this factor.
        final_computed_answer = perform_multiplication(final_computed_answer, calculate_combinations(upper_arg_comb, lower_arg_comb));
    });
    
    console.log(final_computed_answer); // Output the final calculated value.
};

// Read input from standard input and execute the main logic.
execute_primary_logic(require("fs").readFileSync("/dev/stdin", "utf8"));