let product_total_sum = 0, item_value_sum = 0;
const file_api = require("fs"),
    parsed_numbers = file_api.readFileSync("/dev/stdin", "utf8").split(/[\s,]+/);

let max_initial_idx, loop_iterator_idx;

for (max_initial_idx = loop_iterator_idx = parsed_numbers.length - 1; loop_iterator_idx--;) {
    let temporary_parsed_value;
    item_value_sum += (temporary_parsed_value = parseFloat(parsed_numbers[loop_iterator_idx--])),
    product_total_sum += temporary_parsed_value * parseFloat(parsed_numbers[loop_iterator_idx]);
}

console.log(product_total_sum + '\n' + Math.floor(item_value_sum / (max_initial_idx * 2) + 0.5));