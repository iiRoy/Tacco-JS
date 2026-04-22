const PRIME_MODULUS = 1000000007;

// This constant defines an upper limit for array sizes, accommodating maximum values for N and prime exponents.
const MAX_VAL_PLUS_OFFSET = 100000 + 30;

let factorial_values = [ ...new Array(MAX_VAL_PLUS_OFFSET) ].fill(0);
let inverse_factorial_values = [ ...new Array(MAX_VAL_PLUS_OFFSET) ].fill(0);

const perform_multiplication = (val_a, val_b) => ( ( (val_a >>> 16) * val_b % PRIME_MODULUS * 65536 ) + ( (val_a & 65535) * val_b ) ) % PRIME_MODULUS;

const get_prime_decomposition = (input_number) => {
    let prime_factors_list = [ ];

    for ( let divisor_candidate = 2; divisor_candidate * divisor_candidate <= input_number; divisor_candidate++ ) {
        let power_count = 0;
        while ( input_number % divisor_candidate === 0 ) {
            input_number /= divisor_candidate;
            power_count++;
        }
        if ( power_count ) {
            prime_factors_list.push( { base_prime: divisor_candidate, prime_exponent: power_count } );
        }
    }
    
    if ( input_number !== 1 ) {
        prime_factors_list.push( { base_prime: input_number, prime_exponent: 1 } );
    }

    return prime_factors_list;
};

const modular_exponentiation = (base_val, power_val) => {
    let result_accumulator = 1;
    let current_base = base_val;

    while ( power_val !== 0 ) {
        if ( power_val & 1 ) {
            result_accumulator = perform_multiplication(result_accumulator, current_base);
        }
        current_base = perform_multiplication(current_base, current_base);
        power_val = power_val >>> 1;
    }
    return result_accumulator;
};

const calculate_combinations = (total_items, selected_items) => {
    if ( total_items === 0 && selected_items === 0 ) return 1;
    if ( total_items < selected_items || total_items < 0 ) return 0;

    return perform_multiplication( inverse_factorial_values[total_items], perform_multiplication( factorial_values[selected_items], inverse_factorial_values[total_items - selected_items] ) );
};

const initialize_combinatorics_arrays = () => {
    factorial_values[0] = 1;
    inverse_factorial_values[0] = 1;

    for ( let current_index = 0; current_index < MAX_VAL_PLUS_OFFSET - 1; current_index++ ) {
        factorial_values[current_index + 1] = perform_multiplication( factorial_values[current_index], (current_index + 1) );
        inverse_factorial_values[current_index + 1] = modular_exponentiation( factorial_values[current_index + 1], PRIME_MODULUS - 2 );
    }
};

const process_input_and_calculate = (input_string_data) => {
    let [ first_param, second_param ] = input_string_data.split(" ").map(Number);

    let prime_components = get_prime_decomposition(second_param);
    let final_result = 1;

    initialize_combinatorics_arrays();

    Object.keys(prime_components).forEach( factor_index => {
        let num_items_total = prime_components[factor_index].prime_exponent + first_param - 1;
        let num_items_select = prime_components[factor_index].prime_exponent;
        final_result = perform_multiplication( final_result, calculate_combinations(num_items_total, num_items_select) );
    } );

    console.log(final_result);
};

process_input_and_calculate( require("fs").readFileSync("/dev/stdin", "utf8") );