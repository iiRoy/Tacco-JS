const data_source_module = require('fs');
let raw_input_content = data_source_module.readFileSync('/dev/stdin', 'utf8');
let extracted_segments = raw_input_content.split('\n');

const original_sequence = extracted_segments[0];
const target_sequence = extracted_segments[1];

function determine_cyclic_match(base_text, candidate_text) {
    if (base_text.length !== candidate_text.length) {
        return false;
    }
    if (base_text.length === 0) {
        return true;
    }

    const extent_value = base_text.length;

    for (let shift_index = 0; shift_index < extent_value; shift_index++) {
        const shifted_form = base_text.substring(shift_index) + base_text.substring(0, shift_index);

        if (shifted_form === candidate_text) {
            return true;
        }
    }
    return false;
}

const match_status = determine_cyclic_match(original_sequence, target_sequence);

if (match_status) {
    console.log('Yes');
} else {
    console.log('No');
}