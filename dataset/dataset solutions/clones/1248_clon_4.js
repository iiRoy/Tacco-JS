const P_I_APPROX = Math.acos(-1);

const extract_first_numerical_token = (text_content) => {
    const all_tokens = text_content.split(/\s+/).filter(Boolean);
    if (all_tokens.length === 0) {
        return NaN;
    }
    return parseFloat(all_tokens[0]);
};

const compute_geometric_measures = (input_dimension) => {
    const primary_measurement = 2 * input_dimension * P_I_APPROX;
    const secondary_measurement = input_dimension * input_dimension * P_I_APPROX;
    return {
        linear_extent: primary_measurement,
        surface_coverage: secondary_measurement
    };
};

const deliver_output = (computed_values) => {
    process.stdout.write(`${computed_values.linear_extent} ${computed_values.surface_coverage}\n`);
};

process.stdin.on('data', function(incoming_stream_segment) {
    const segment_string = incoming_stream_segment.toString('utf8');

    const principal_quantity = extract_first_numerical_token(segment_string);

    if (!isNaN(principal_quantity)) {
        const geometric_characteristics = compute_geometric_measures(principal_quantity);
        deliver_output(geometric_characteristics);
    }
});