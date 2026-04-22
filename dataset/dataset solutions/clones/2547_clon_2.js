"use strict";


const file_system_module = require('fs'); // Obtain the module for file system operations


const input_content = file_system_module.readFileSync('/dev/stdin', 'UTF-8'); // Read all data from standard input


const input_lines = input_content.split('\n'); // Break the full input into an array of individual lines


const first_line_parts = input_lines[0].split(' '); // Separate the components of the initial line


const source_elements = input_lines[1].split(' '); // Divide the subsequent line into its constituent elements


const total_count = parseInt(first_line_parts[0]); // Convert the first numerical part into an integer


const segment_size = parseInt(first_line_parts[1]); // Convert the second numerical part into an integer


let unique_permutations = {}; // Initialize an empty object to store distinct arrangements


let iteration_index = 0; // Set up a counter for the looping process


while (true) { // Begin an indefinite loop
  if (iteration_index + segment_size > source_elements.length) { // Check if the current window exceeds bounds
    break; // Exit the loop if no more full segments can be processed
  }


  const prefix_segment = source_elements.slice(0, iteration_index); // Extract the elements preceding the current window


  const middle_sorted_segment = source_elements.slice(iteration_index, iteration_index + segment_size).sort((element_a, element_b) => element_a > element_b); // Get the current window elements and sort them


  const suffix_segment = source_elements.slice(iteration_index + segment_size); // Obtain the elements following the current window


  const current_arrangement = prefix_segment.concat(middle_sorted_segment).concat(suffix_segment); // Combine the three parts into a complete arrangement


  unique_permutations[current_arrangement] = true; // Record this arrangement as encountered (its value doesn't matter)


  iteration_index++; // Advance the counter for the next iteration
}


console.log(Object.keys(unique_permutations).length); // Output the total number of unique arrangements found