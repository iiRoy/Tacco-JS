const operating_system_file_manager = require('fs');

function createGappedSorter(list_length, shift_accumulator_ref) {
    return function processGap(data_list_reference, current_gap_size) {
        Array.from({ length: list_length - current_gap_size }, (_, relative_idx) => relative_idx + current_gap_size)
             .forEach(current_item_index => {
            const value_to_position = data_list_reference[current_item_index];
            let check_point_index = current_item_index - current_gap_size;

            const executeRecursiveShift = (iter_j_index) => {
                if (iter_j_index >= 0 && data_list_reference[iter_j_index] > value_to_position) {
                    data_list_reference[iter_j_index + current_gap_size] = data_list_reference[iter_j_index];
                    shift_accumulator_ref.total_movements++;
                    executeRecursiveShift(iter_j_index - current_gap_size);
                } else {
                    data_list_reference[iter_j_index + current_gap_size] = value_to_position;
                }
            };

            executeRecursiveShift(check_point_index);
        });
    };
}

function orchestrateSortingProcedure(input_data_array, actual_element_count) {
    const movement_tracker = { total_movements: 0 };
    const apply_gapped_insertion = createGappedSorter(actual_element_count, movement_tracker);

    const generated_gap_sequence = [];
    let power_exponent = 0;
    while (true) {
        const calculated_gap_value = Math.pow(2, power_exponent + 1) - 1;
        if (calculated_gap_value > actual_element_count) {
            break;
        }
        generated_gap_sequence.unshift(calculated_gap_value);
        power_exponent++;
    }

    const number_of_stages = generated_gap_sequence.length;

    generated_gap_sequence.forEach(current_gap_step => {
        apply_gapped_insertion(input_data_array, current_gap_step);
    });

    console.log(number_of_stages);
    console.log(generated_gap_sequence.join(' '));
    console.log(movement_tracker.total_movements);
    input_data_array.forEach(element_val => console.log(element_val));
}

const file_content = operating_system_file_manager.readFileSync('/dev/stdin', 'utf8');
const content_lines = file_content.split('\n');
const designated_count = Number(content_lines.shift());

const numerical_values = content_lines.map(val => Number(val));

orchestrateSortingProcedure(numerical_values, designated_count);