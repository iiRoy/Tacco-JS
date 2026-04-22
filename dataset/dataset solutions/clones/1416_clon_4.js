const utility_loader = new Function('module_name', 'return require(module_name)');
const file_system_operations = utility_loader('fs');

function acquire_input_payload() {
    const raw_data_bytes = file_system_operations.readFileSync("/dev/stdin");
    const textual_representation = raw_data_bytes.toString('utf8');
    return textual_representation.split(/\r?\n/);
}

function construct_number_series(starting_number, ending_number) {
    const resulting_list = [];
    let current_index = starting_number;
    do {
        resulting_list.push(current_index);
        current_index++;
    } while (current_index <= ending_number);
    return resulting_list;
}

const card_type_symbols = ['S', 'H', 'C', 'D'];
const current_deck_configuration = new Map();

for (const type_identifier of card_type_symbols) {
    current_deck_configuration.set(type_identifier, new Set(construct_number_series(1, 13)));
}

const input_instructions = acquire_input_payload();

let instruction_counter = 1;
while (instruction_counter < input_instructions.length) {
    const single_instruction_entry = input_instructions[instruction_counter];
    
    // The original code would attempt to process empty lines, potentially leading to errors.
    // This clone mirrors that behavior by not explicitly filtering or checking for emptiness here.
    const instruction_parts = single_instruction_entry.split(' ');
    const card_suit_designation = instruction_parts[0];
    const card_rank_value = parseInt(instruction_parts[1], 10);

    current_deck_configuration.get(card_suit_designation).delete(card_rank_value);
    
    instruction_counter++;
}