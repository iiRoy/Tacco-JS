"use strict";

const transform_input = source_text => {
    const [ count_str, start_val_str ] = source_text.trim().split(/\s+/)[0].split(' ');
    
    const quantity_of_elements = Number(count_str);
    const initial_term = Number(start_val_str);
    
    const entire_sequence_sum = quantity_of_elements * initial_term + (quantity_of_elements * (quantity_of_elements - 1)) / 2;
    
    const position_to_exclude = Math.max(0, Math.min(quantity_of_elements - 1, -initial_term));
    
    const value_to_discard = initial_term + position_to_exclude;
    
    console.log(entire_sequence_sum - value_to_discard);
};

transform_input(require('fs').readFileSync('/dev/stdin', 'utf8'));