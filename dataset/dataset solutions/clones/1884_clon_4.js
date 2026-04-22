const MODULUS_VALUE = 998244353;

// Modular multiplication using BigInt for intermediate product to prevent overflow
function multiply_mod(x_val, y_val, modulus_val) {
    return Number((BigInt(x_val) * BigInt(y_val)) % BigInt(modulus_val));
}

// Recursive binary exponentiation (power function)
function elevate_mod(base_val, exponent_val, modulus_val) {
    if (exponent_val < 0) { // Replicates original pow's behavior for negative exponents (returns 1)
        return 1;
    }
    if (exponent_val === 0) {
        return 1;
    }
    if (exponent_val % 2 === 0) {
        const half_power = elevate_mod(base_val, exponent_val / 2, modulus_val);
        return multiply_mod(half_power, half_power, modulus_val);
    } else {
        return multiply_mod(base_val, elevate_mod(base_val, exponent_val - 1, modulus_val), modulus_val);
    }
}

// Extended Euclidean Algorithm to find gcd(a, b) and x, y such that ax + by = gcd(a, b)
function extended_gcd_solver(a_val, b_val) {
    if (a_val === 0) {
        return [b_val, 0, 1];
    }
    const [common_divisor, x1_coeff, y1_coeff] = extended_gcd_solver(b_val % a_val, a_val);
    const x_coeff = y1_coeff - Math.floor(b_val / a_val) * x1_coeff;
    const y_coeff = x1_coeff;
    return [common_divisor, x_coeff, y_coeff];
}

// Modular multiplicative inverse using Extended Euclidean Algorithm
function invert_mod(number_val, modulus_val) {
    const [common_divisor, x_coeff, y_coeff] = extended_gcd_solver(number_val, modulus_val);
    if (common_divisor !== 1) {
        // Inverse does not exist (should not happen with prime modulus and non-zero number_val)
        return 0;
    }
    return (x_coeff % modulus_val + modulus_val) % modulus_val; // Ensure positive result
}

let precomputed_factorials_arr = [];
let precomputed_inv_factorials_arr = [];

// Precomputes factorials and inverse factorials up to a given limit
function prepare_combinatorics_data(max_limit, modulus_val) {
    precomputed_factorials_arr[0] = 1;
    for (let i = 1; i <= max_limit; i++) {
        precomputed_factorials_arr[i] = multiply_mod(precomputed_factorials_arr[i - 1], i, modulus_val);
    }

    precomputed_inv_factorials_arr[max_limit] = invert_mod(precomputed_factorials_arr[max_limit], modulus_val);
    for (let i = max_limit - 1; i >= 0; i--) {
        precomputed_inv_factorials_arr[i] = multiply_mod(precomputed_inv_factorials_arr[i + 1], (i + 1), modulus_val);
    }
}

// Calculates binomial coefficient C(n, k) using precomputed factorials and inverse factorials
function calculate_binomial_coefficient(n_val, k_val, modulus_val) {
    if (k_val < 0 || k_val > n_val) {
        return 0;
    }
    return multiply_mod(
        precomputed_factorials_arr[n_val],
        multiply_mod(precomputed_inv_factorials_arr[k_val], precomputed_inv_factorials_arr[n_val - k_val], modulus_val),
        modulus_val
    );
}

// Main execution block as an IIFE
((source_data_string) => {
    const processed_entries = source_data_string.split('\n');
    let [initial_N_param, initial_M_param, initial_K_param] = processed_entries[0].split(' ').map(Number);

    // Precompute factorials up to initial_N_param (as C(N-1,k) requires up to N-1)
    prepare_combinatorics_data(initial_N_param, MODULUS_VALUE);

    // Calculate the sum using functional programming (map and reduce)
    let total_accumulated_value = Array.from({ length: initial_K_param + 1 }, (_, current_k_index) => {
        const coefficient_part = calculate_binomial_coefficient(initial_N_param - 1, current_k_index, MODULUS_VALUE);
        const base_for_power = initial_M_param - 1;
        const exponent_for_power = initial_N_param - (current_k_index + 1);
        
        const powered_value = elevate_mod(base_for_power, exponent_for_power, MODULUS_VALUE);

        const term_contribution = multiply_mod(
            coefficient_part,
            multiply_mod(powered_value, initial_M_param, MODULUS_VALUE),
            MODULUS_VALUE
        );
        return term_contribution;
    }).reduce((accumulator, current_term) => (accumulator + current_term) % MODULUS_VALUE, 0);

    console.log(total_accumulated_value);
})(require("fs").readFileSync("/dev/stdin", "utf8"));