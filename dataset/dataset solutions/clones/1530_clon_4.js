const PRIME_MODULUS = 1000000007;

function modular_exponentiation_by_squaring(base_val, exponent_val) {
    let result_accumulator = 1n;
    let current_base = BigInt(base_val);
    let current_exponent = BigInt(exponent_val);
    const modulus_bigint = BigInt(PRIME_MODULUS);

    if (current_exponent === 0n) {
        return 1;
    }

    while (current_exponent > 0n) {
        if (current_exponent % 2n === 1n) {
            result_accumulator = (result_accumulator * current_base) % modulus_bigint;
        }
        current_base = (current_base * current_base) % modulus_bigint;
        current_exponent = current_exponent / 2n;
    }
    return Number(result_accumulator);
}

function process_computation_and_output(input_payload) {
    const numeric_input = parseInt(input_payload.trim());

    const term_ten = modular_exponentiation_by_squaring(10, numeric_input);
    const term_nine = modular_exponentiation_by_squaring(9, numeric_input);
    const term_eight = modular_exponentiation_by_squaring(8, numeric_input);

    const doubled_nine = (2 * term_nine) % PRIME_MODULUS;

    let intermediate_calc_one = (term_ten - doubled_nine + PRIME_MODULUS) % PRIME_MODULUS;
    let final_result_value = (intermediate_calc_one + term_eight) % PRIME_MODULUS;
    
    final_result_value = (final_result_value + PRIME_MODULUS) % PRIME_MODULUS;

    console.log(final_result_value);
}

process_computation_and_output(require("node:fs").readFileSync(0, "utf8"));