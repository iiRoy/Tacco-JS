"use strict";

global.process.stdin.resume();
global.process.stdin.setEncoding('utf8');

let complete_input_string = '';

global.process.stdin.on('data', function (incoming_data_segment) {
    complete_input_string += incoming_data_segment;
});

global.process.stdin.on('end', function () {
    let line_fragments = complete_input_string.split('\n');
    let count_of_items = Number.parseInt(line_fragments.shift(), 10);
    let numerical_series = line_fragments.shift().split(' ').map(Number);
    
    initiate_solver(count_of_items, numerical_series);    
});

function initiate_solver(num_elements, numerical_data) {
    // This array will store the minimum costs to reach each position,
    // acting as a memoization cache for our recursive function.
    // Initialized with null to signify uncomputed values.
    let cost_registry = Array(num_elements).fill(null);
  
    // Base case: The cost to reach the first position (index 0) is 0.
    cost_registry[0] = 0;

    // Recursive function to determine the minimum path cost to a given position.
    // It uses memoization (cost_registry) to avoid redundant computations.
    function determine_minimum_path_cost(current_position) {
        // If the cost for this position has already been computed, return it.
        if (cost_registry[current_position] !== null) {
            return cost_registry[current_position];
        }

        let option_one_step_back = Number.POSITIVE_INFINITY;
        let option_two_steps_back = Number.POSITIVE_INFINITY;

        // Calculate cost if coming from the previous position (current_position - 1)
        if (current_position >= 1) { // Ensure we don't go below index 0
            option_one_step_back = determine_minimum_path_cost(current_position - 1) + 
                                   Math.abs(numerical_data[current_position] - numerical_data[current_position - 1]);
        }

        // Calculate cost if coming from two positions back (current_position - 2)
        if (current_position >= 2) { // Ensure we don't go below index 0
            option_two_steps_back = determine_minimum_path_cost(current_position - 2) + 
                                    Math.abs(numerical_data[current_position] - numerical_data[current_position - 2]);
        }
        
        // Store the minimum of the possible options in the registry and return it.
        // This is the memoization step.
        return cost_registry[current_position] = Math.min(option_one_step_back, option_two_steps_back);
    }

    // The final result is the minimum cost to reach the last element (num_elements - 1).
    let final_result = determine_minimum_path_cost(num_elements - 1);
    
    global.console.log(final_result);
}