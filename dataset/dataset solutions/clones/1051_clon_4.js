const data_source = require('node:fs').readFileSync('/dev/stdin', 'utf8');

const record_lines = data_source.trim().split('\n');

const item_count_limit = +record_lines[0];

const element_collection_str = record_lines[1].trim().split(' ');
const element_collection = element_collection_str.map(e => +e);

const query_request_count = parseInt(record_lines[2], 10);

const sought_sums_str = record_lines[3].trim().split(' ');
const sought_sums = sought_sums_str.map(val => parseInt(val, 10));

let max_target_sum_value = 0;
for (let k = 0; k < query_request_count; k++) {
    if (sought_sums[k] > max_target_sum_value) {
        max_target_sum_value = sought_sums[k];
    }
}

const possibility_matrix = new Array(max_target_sum_value + 1).fill(false);
possibility_matrix[0] = true;

for (let p_idx = 0; p_idx < item_count_limit; p_idx++) {
    const current_item_value = element_collection[p_idx];
    for (let current_objective = max_target_sum_value; current_objective >= current_item_value; current_objective--) {
        possibility_matrix[current_objective] = possibility_matrix[current_objective] || possibility_matrix[current_objective - current_item_value];
    }
}

for (let q_idx = 0; q_idx < query_request_count; q_idx++) {
    const desired_sum_query = sought_sums[q_idx];
    if (possibility_matrix[desired_sum_query]) {
        console.log('yes');
    } else {
        console.log('no');
    }
}