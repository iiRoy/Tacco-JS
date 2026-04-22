'use strict';

const calculateOptimalRoute = (raw_data_stream) => {
    const input_lines = raw_data_stream.split(String.fromCharCode(10));

    const configuration_elements = input_lines[0].split(' ').map(Number);
    const overall_quantity = configuration_elements[0];
    const desired_span = configuration_elements[1];

    const positional_markers = input_lines[1].split(' ').map(Number);

    const journey_expenditures = Array.from({ length: overall_quantity - desired_span + 1 }, (_, position_iterator) => {
        const initial_boundary = positional_markers[position_iterator];
        const terminal_boundary = positional_markers[position_iterator + desired_span - 1];

        const extent_of_segment = terminal_boundary - initial_boundary;

        const approach_from_origin = Math.abs(initial_boundary) + extent_of_segment;
        const approach_from_destination = Math.abs(terminal_boundary) + extent_of_segment;
        
        return Math.min(approach_from_origin, approach_from_destination);
    });

    const minimal_path_cost = journey_expenditures.reduce((current_minimum, current_value) => {
        return current_value < current_minimum ? current_value : current_minimum;
    }, Number.MAX_SAFE_INTEGER);

    console.log(minimal_path_cost);
};

calculateOptimalRoute(require('fs').readFileSync('/dev/stdin', 'utf-8'));