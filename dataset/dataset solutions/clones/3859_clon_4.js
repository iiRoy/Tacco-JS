console.log((number_of_elements_to_find => {
    const prime_candidate_validator = (potential_value) => {
        if (potential_value < 2) return false;
        if (potential_value === 2 || potential_value === 3) return true;
        if (potential_value % 2 === 0 || potential_value % 3 === 0) return false;
        for (let check_divisor = 5; check_divisor * check_divisor <= potential_value; check_divisor += 6) {
            if (potential_value % check_divisor === 0 || potential_value % (check_divisor + 2) === 0) return false;
        }
        return true;
    };

    const qualifying_numbers = [];
    let current_test_number = 2;
    const search_limit = 55555;

    while (qualifying_numbers.length < number_of_elements_to_find && current_test_number < search_limit) {
        if (prime_candidate_validator(current_test_number)) {
            if ((current_test_number - 1) % 5 === 0) {
                qualifying_numbers.push(current_test_number);
            }
        }
        current_test_number++;
    }

    return qualifying_numbers.join(' ');

})(parseInt(require('fs').readFileSync('/dev/stdin', 'utf8'), 10)));