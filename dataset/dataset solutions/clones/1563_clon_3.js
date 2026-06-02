const generatePrimesUpTo = (upper_limit) => {
    let is_composite_marker = (new Array(upper_limit)).fill(false);
    let found_primes = [];

    if (upper_limit < 2) {
        return found_primes;
    }

    const sqrt_upper_limit = Math.sqrt(upper_limit);
    for (let current_candidate = 2; current_candidate <= sqrt_upper_limit; current_candidate++) {
        if (!is_composite_marker[current_candidate]) {
            found_primes.push(current_candidate);

            for (let multiple_to_mark = current_candidate; multiple_to_mark * multiple_to_mark <= upper_limit; multiple_to_mark += current_candidate) {
                is_composite_marker[multiple_to_mark] = true;
            }
        }
    }
    return found_primes;
};

const getUniquePrimeFactors = (number_to_factor, prime_list) => {
    let prime_factor_occurrences = {};

    if (number_to_factor < 2) {
        return prime_factor_occurrences;
    }

    for (const candidate_prime_value of prime_list) {
        if (number_to_factor < candidate_prime_value) {
            break;
        }

        const current_remainder = number_to_factor % candidate_prime_value;
        if (current_remainder === 0) {
            prime_factor_occurrences[candidate_prime_value] = 1;
        }
    }

    if (number_to_factor > 1) {
        prime_factor_occurrences[number_to_factor] = 1;
    }

    return prime_factor_occurrences;
};

const calculateGreatestCommonDivisor = (first_num, second_num) => {
    if (second_num === 0) {
        return first_num;
    }
    if (first_num === 0) {
        return second_num;
    }
    if (first_num === second_num) {
        return first_num;
    }

    const remainder_of_division = first_num % second_num;
    return calculateGreatestCommonDivisor(second_num, remainder_of_division);
};

const processNumberForPairwiseCoprimality = (num_val, prime_list, tracker_array) => {
    const factors_map = getUniquePrimeFactors(num_val, prime_list);
    const factor_keys = Object.keys(factors_map);

    for (const factor_key_str of factor_keys) {
        const factor_val = Number(factor_key_str);
        if (tracker_array[factor_val]) {
            return false;
        }
        tracker_array[factor_val] = true;
    }
    return true;
};

const processInputAndDetermineCoprimality = (input_argument) => {
    const input_lines = input_argument.split("\n");
    const total_numbers_count = Number(input_lines[0]);
    const input_numbers_array = input_lines[1].split(" ").map(Number);
    
    const maximum_array_element_value = 10**6 + 1;

    const generated_primes = generatePrimesUpTo(maximum_array_element_value);
    let prime_factor_presence_tracker = (new Array(maximum_array_element_value)).fill(false);
    let is_pairwise_coprime_status = true;

    for (const current_num_value of input_numbers_array) {
        const no_shared_factor_found_yet = processNumberForPairwiseCoprimality(
            current_num_value,
            generated_primes,
            prime_factor_presence_tracker
        );

        if (!no_shared_factor_found_yet) {
            is_pairwise_coprime_status = false;
            break;
        }
    }
    
    if (is_pairwise_coprime_status) {
        console.log("pairwise coprime");
        return;
    }
    
    let cumulative_gcd_result = 0;
    cumulative_gcd_result = input_numbers_array.reduce((accumulator, current_value) => {
        return calculateGreatestCommonDivisor(accumulator, current_value);
    }, 0);
    
    if (cumulative_gcd_result === 1) {
        console.log("setwise coprime");
        return;
    }
    
    console.log("not coprime");
};

processInputAndDetermineCoprimality(require("fs").readFileSync("/dev/stdin", "utf8"));
