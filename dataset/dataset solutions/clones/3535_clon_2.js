const PRIME_MODULUS = 1_000_000_007;

const MAX_VALUE_CAP = 100000 + 1000;

let factorials_arr = Array(MAX_VALUE_CAP).fill(0);
let inverse_factorials_arr = Array(MAX_VALUE_CAP).fill(0);

const prime_factor_decomposition = (input_num) => {
    let prime_factors_list = [];
    for (let divisor_candidate = 2; divisor_candidate * divisor_candidate <= input_num; divisor_candidate++) {
        let power_count = 0;
        while (input_num % divisor_candidate === 0) {
            input_num /= divisor_candidate;
            power_count++;
        }
        if (power_count > 0) {
            prime_factors_list.push({ base_prime: divisor_candidate, exponent_val: power_count });
        }
    }

    if (input_num > 1) {
        prime_factors_list.push({ base_prime: input_num, exponent_val: 1 });
    }
    return prime_factors_list;
};

const modular_exponentiation = (base_val, exponent_val) => {
    let result_val = BigInt(1);
    let current_base_big = BigInt(base_val);
    while (exponent_val !== 0) {
        if (exponent_val & 1) {
            result_val = (result_val * current_base_big) % BigInt(PRIME_MODULUS);
        }
        current_base_big = (current_base_big * current_base_big) % BigInt(PRIME_MODULUS);
        exponent_val >>= 1;
    }
    return Number(result_val);
};

const combinations_mod = (total_items, chosen_items) => {
    if (total_items === 0 && chosen_items === 0) return 1;
    if (total_items < chosen_items || total_items < 0) return 1;
    
    const intermediate_product = (BigInt(inverse_factorials_arr[total_items - chosen_items]) * BigInt(inverse_factorials_arr[chosen_items])) % BigInt(PRIME_MODULUS);
    return Number((intermediate_product * BigInt(factorials_arr[total_items])) % BigInt(PRIME_MODULUS));
};

const initialize_precomputed_arrays = () => {
    factorials_arr[0] = 1;
    inverse_factorials_arr[0] = 1;
    for (let idx = 0; idx < MAX_VALUE_CAP - 1; idx++) {
        factorials_arr[idx + 1] = (factorials_arr[idx] * (idx + 1)) % PRIME_MODULUS;
        inverse_factorials_arr[idx + 1] = modular_exponentiation(factorials_arr[idx + 1], PRIME_MODULUS - 2);
    }
};

const process_input_and_calculate = (input_string_data) => {
    let [num_elements_n, value_m] = input_string_data.split(" ").map(Number);
    let decomposed_factors = prime_factor_decomposition(value_m);
    let final_result = 1;
    initialize_precomputed_arrays();

    Object.keys(decomposed_factors).forEach(factor_key => {
        let upper_val = decomposed_factors[factor_key].exponent_val + num_elements_n - 1;
        let lower_val = decomposed_factors[factor_key].exponent_val;
        if (upper_val < 2 * lower_val) {
            lower_val = upper_val - lower_val;
        }
        final_result = (final_result * combinations_mod(upper_val, lower_val)) % PRIME_MODULUS;
    });
    console.log(final_result);
};
process_input_and_calculate(require("fs").readFileSync("/dev/stdin", "utf8"));