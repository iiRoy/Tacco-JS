const source_material = require('node:fs').readFileSync(0, 'utf8');
const cleaned_source = source_material.trim();
const processed_data_string = cleaned_source.replace(/\s/, '');
const target_quantity = Number.parseInt(processed_data_string, 10);

let is_exact_square = false;

if (target_quantity < 0) {
    is_exact_square = false;
} else if (target_quantity === 0) {
    is_exact_square = true;
} else {
    let lower_bound = 1;
    let upper_limit = target_quantity;

    while (lower_bound <= upper_limit) {
        const pivot_point = Math.floor((lower_bound + upper_limit) / 2);
        const square_result = pivot_point * pivot_point;

        if (square_result === target_quantity) {
            is_exact_square = true;
            break;
        } else if (square_result < target_quantity) {
            lower_bound = pivot_point + 1;
        } else {
            upper_limit = pivot_point - 1;
        }
    }
}

console.log(is_exact_square ? "YES" : "No");