var fileSystemModule = require('fs');

const INPUT_FILE_PATH = '/dev/stdin';
const TEXT_ENCODING = 'utf8';
const END_OF_INPUT_SIGNAL = "0 0 0 0 0";

var rawInputContent = fileSystemModule.readFileSync(INPUT_FILE_PATH, TEXT_ENCODING);
var inputLineBuffer = rawInputContent.trim().split("\n");

while (true) {
    var currentDataSetString = inputLineBuffer.shift();

    if (currentDataSetString === END_OF_INPUT_SIGNAL) {
        break;
    }

    if (inputLineBuffer.length === 0) {
        console.error("Error: Insufficient input data. Expected another line of parameters.");
        break;
    }

    var combinedParameterLine = currentDataSetString + " " + inputLineBuffer.shift();
    var numericalInputs = combinedParameterLine.split(" ").map(Number);

    if (numericalInputs.length !== 8) {
        console.error("Error: Incorrect number of numerical parameters. Expected 8, but received " + numericalInputs.length + ".");
        continue;
    }

    (function(
        price_item_alpha,
        price_item_beta,
        price_single_unit,
        batch_quantity_size,
        price_per_bulk_unit,
        initial_count_alpha,
        initial_count_beta,
        total_units_needed
    ) {
        var base_cost_from_AB_items = initial_count_alpha * price_item_alpha + initial_count_beta * price_item_beta;

        // --- Calculation for Strategy 1 ---
        var total_cost_strategy_one;
        {
            var full_batch_count = Math.trunc(total_units_needed / batch_quantity_size);
            var units_from_full_batches = full_batch_count * batch_quantity_size;
            var cost_for_full_batches = units_from_full_batches * price_per_bulk_unit;

            var remaining_individual_units = total_units_needed % batch_quantity_size;
            var cost_for_remaining_units = remaining_individual_units * price_single_unit;

            total_cost_strategy_one = cost_for_full_batches + cost_for_remaining_units + base_cost_from_AB_items;
        }

        // --- Calculation for Strategy 2 ---
        var total_cost_strategy_two;
        {
            var temp_alpha_count = initial_count_alpha;
            var temp_beta_count = initial_count_beta;

            if (total_units_needed > 0 && total_units_needed < batch_quantity_size) {
                var units_to_compensate = batch_quantity_size - total_units_needed;
                var current_scenario_cost = batch_quantity_size * price_per_bulk_unit;

                var reduction_amount_remaining = units_to_compensate;

                var actual_reduction_beta = Math.min(reduction_amount_remaining, temp_beta_count);
                temp_beta_count -= actual_reduction_beta;
                reduction_amount_remaining -= actual_reduction_beta;

                if (reduction_amount_remaining > 0) {
                    temp_alpha_count = Math.max(0, temp_alpha_count - reduction_amount_remaining);
                }

                current_scenario_cost += temp_alpha_count * price_item_alpha + temp_beta_count * price_item_beta;
                total_cost_strategy_two = current_scenario_cost;
            }
            else {
                total_cost_strategy_two = base_cost_from_AB_items + total_units_needed * price_per_bulk_unit;
            }
        }

        var final_minimum_cost = Math.min(total_cost_strategy_one, total_cost_strategy_two);
        console.log(final_minimum_cost);

    }).apply(null, numericalInputs);
}