function* pathDeviationProcessor(output_sink, input_source) {
    const sequence_length = Number(yield input_source());

    const captured_values = [];
    for (let point_index = 0; point_index < sequence_length; ++point_index) {
        captured_values.push(Number(yield input_source()));
    }

    const full_numerical_path = [0, ...captured_values, 0];

    const overall_path_magnitude = full_numerical_path.slice(1).reduce((current_summation, current_point, idx_in_slice) => {
        const preceding_point = full_numerical_path[idx_in_slice];
        return current_summation + Math.abs(preceding_point - current_point);
    }, 0);

    const resulting_sequence_parts = Array.from({ length: sequence_length }, (_, segment_index) => {
        const first_node = full_numerical_path[segment_index];
        const intermediate_node = full_numerical_path[segment_index + 1];
        const last_node = full_numerical_path[segment_index + 2];

        const modification_factor = Math.abs(first_node - last_node) -
                                    (Math.abs(first_node - intermediate_node) + Math.abs(intermediate_node - last_node));

        return overall_path_magnitude + modification_factor;
    });

    output_sink(resulting_sequence_parts.join(''));
}