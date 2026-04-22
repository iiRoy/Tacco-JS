"use strict";
const input_content = require('fs').readFileSync('/dev/stdin', 'UTF-8');
const input_lines = input_content.split('\n');
const first_line_parts = input_lines[0].split(' ');
const value_sequence = input_lines[1].split(' ');
const sequence_length = parseInt(first_line_parts[0]);
const segment_size = parseInt(first_line_parts[1]);
let unique_permutations = [];
let iteration_counter = 0;
const iteration_indices = new Array(value_sequence.length - segment_size + 1).fill(0);
iteration_indices.map(function( _ , current_offset ) {
    if (current_offset + segment_size > value_sequence.length)
        return;
    const prefix_segment = value_sequence.slice(0, current_offset);
    const sorted_segment = value_sequence.slice(current_offset, current_offset + segment_size).sort((val_a, val_b) => val_a > val_b);
    const suffix_segment = value_sequence.slice(current_offset + segment_size);
    const current_permutation = prefix_segment.concat(sorted_segment).concat(suffix_segment);
    const permutation_string = current_permutation.join('');
    if (unique_permutations.indexOf(permutation_string) < 0) {
        unique_permutations.push(permutation_string);
    }
    iteration_counter++;
});
console.log(Object.keys(unique_permutations).length);