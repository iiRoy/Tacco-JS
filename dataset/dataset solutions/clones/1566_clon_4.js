async function execute_processing_routine() {
    const input_source = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });

    let collected_source_lines = [];
    for await (const current_source_line of input_source) {
        collected_source_lines.push(current_source_line);
    }

    const [dimension_rows, dimension_cols] = collected_source_lines.shift().split(/\s/).map(Number);
    const interval_definitions = collected_source_lines.slice(0, dimension_rows).map(line_string => {
        const [start_val_str, end_val_str] = line_string.split(/\s/).map(Number);
        return { start_offset: start_val_str - 1, end_offset: end_val_str - 1 };
    });

    const SENTINEL_VALUE = 1_000_000;
    const EVALUATION_THRESHOLD = 500_000;

    let initial_column_state_vector = Array(dimension_cols).fill(0);

    const transform_column_state_per_interval = (current_column_vector_snapshot, interval_index) => {
        const { start_offset, end_offset } = interval_definitions[interval_index];

        const iteration_context = {
            evolving_column_values: [...current_column_vector_snapshot],
            propagating_metric: SENTINEL_VALUE
        };

        const processed_iteration_context = Array.from({ length: dimension_cols }).reduce((context_accumulator, _, column_idx) => {
            const { evolving_column_values, propagating_metric } = context_accumulator;
            const prior_column_value = evolving_column_values[column_idx];

            let next_column_value_for_pos;
            let next_propagating_metric = propagating_metric;

            if (column_idx < start_offset || column_idx > end_offset) {
                next_column_value_for_pos = prior_column_value + 1;
                next_propagating_metric = Math.min(propagating_metric, next_column_value_for_pos);
            } else if (propagating_metric > EVALUATION_THRESHOLD) {
                next_column_value_for_pos = SENTINEL_VALUE;
            } else {
                next_propagating_metric++;
                next_column_value_for_pos = next_propagating_metric;
            }

            evolving_column_values[column_idx] = next_column_value_for_pos;
            return {
                evolving_column_values: evolving_column_values,
                propagating_metric: next_propagating_metric
            };
        }, iteration_context);

        const updated_column_vector = processed_iteration_context.evolving_column_values;

        console.log(updated_column_vector);
        if (updated_column_vector.some(val_check => val_check < EVALUATION_THRESHOLD)) {
            const minimum_achieved = updated_column_vector.reduce((min_val_acc, current_val_entry) => Math.min(min_val_acc, current_val_entry), EVALUATION_THRESHOLD);
            console.log(minimum_achieved);
        } else {
            console.log(-1);
        }

        return updated_column_vector;
    };

    Array.from({ length: dimension_rows }).reduce(transform_column_state_per_interval, initial_column_state_vector);
}

execute_processing_routine();