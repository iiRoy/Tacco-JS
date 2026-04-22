const MAX_TARGET_VALUE = 100000;
const DP_INITIAL_VALUE = MAX_TARGET_VALUE + 1; // Represents infinity for integer counts

let tetrahedral_series_terms = [];
(function generateTetrahedralSequence(current_k_index) {
    const calculated_term = (current_k_index + 1) * (current_k_index + 2) * (current_k_index + 3) / 6;
    if (calculated_term <= MAX_TARGET_VALUE) {
        tetrahedral_series_terms.push(calculated_term);
        generateTetrahedralSequence(current_k_index + 1);
    }
})(0);

const min_components_total = new Array(MAX_TARGET_VALUE + 1).fill(DP_INITIAL_VALUE);
const min_odd_components = new Array(MAX_TARGET_VALUE + 1).fill(DP_INITIAL_VALUE);

min_components_total[0] = 0;
min_odd_components[0] = 0;

for (const component_value of tetrahedral_series_terms) {
    for (let current_sum_target = component_value; current_sum_target <= MAX_TARGET_VALUE; current_sum_target++) {
        min_components_total[current_sum_target] = Math.min(
            min_components_total[current_sum_target],
            min_components_total[current_sum_target - component_value] + 1
        );
    }

    if (component_value % 2 !== 0) {
        for (let current_sum_target = component_value; current_sum_target <= MAX_TARGET_VALUE; current_sum_target++) {
            min_odd_components[current_sum_target] = Math.min(
                min_odd_components[current_sum_target],
                min_odd_components[current_sum_target - component_value] + 1
            );
        }
    }
}

const file_system_module = require('fs');
const raw_input_data = file_system_module.readFileSync('/dev/stdin', 'utf8');

const parsed_queries = raw_input_data
    .split('\n')
    .map(s => Number(s.trim()))
    .filter(n => !isNaN(n));

for (const query_target of parsed_queries) {
    if (query_target === 0) {
        break;
    }
    console.log(min_components_total[query_target] + " " + min_odd_components[query_target]);
}