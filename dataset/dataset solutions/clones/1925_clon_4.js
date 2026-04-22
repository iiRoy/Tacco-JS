const processSourceData = (raw_data_string) => {
    const numeric_chunks = raw_data_string.match(/\d+/g).map(Number);

    const parameter_alpha = numeric_chunks[0];
    const parameter_beta = numeric_chunks[1];
    const parameter_gamma = numeric_chunks[2];

    const calculate_term_val = (iteration_index) => {
        if (iteration_index <= 0) {
            return 0;
        }
        const modulo_result = iteration_index % parameter_beta;
        const product_val = parameter_alpha * modulo_result;
        return (product_val - (product_val % parameter_beta)) / parameter_beta;
    };

    const recurse_for_max_val = (current_idx, remaining_iterations_limit) => {
        if (current_idx <= 0 || remaining_iterations_limit <= 0) {
            return 0;
        }

        const current_calculated_value = calculate_term_val(current_idx);

        if (current_calculated_value > 0) {
            return current_calculated_value;
        } else {
            return recurse_for_max_val(current_idx - 1, remaining_iterations_limit - 1);
        }
    };

    const final_computed_result = recurse_for_max_val(parameter_gamma, 31);

    process.stdout.write(final_computed_result.toString() + '\n');
};

processSourceData(require("fs").readFileSync("/dev/stdin", "utf8"));