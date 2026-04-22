const fileSystem = require('fs');
const readInput = () => fileSystem.readFileSync('/dev/stdin', 'utf8').split('\n');
const prime_divisor = 1_000_000_007;

const adjustMapEntry = (data_map, key_value) => {
    data_map.set(key_value, (data_map.get(key_value) || 0) + 1);
};

const calculateCombinationsOfTwo = (count_value) => {
    if (count_value < 2) return 0;
    return (count_value * (count_value - 1)) / 2;
};

const mainProcess = () => {
    const raw_input_lines = readInput();
    const element_quantity = Number(raw_input_lines.shift());
    const value_list = raw_input_lines.slice(0, element_quantity).map(Number);
    const segment_frequencies = new Map();

    const termination_flags = Array(element_quantity).fill(false);
    if (element_quantity > 0) {
        termination_flags[element_quantity - 1] = true;
    }

    for (let current_position = 0; current_position < element_quantity - 1; ++current_position) {
        if (value_list[current_position] !== value_list[current_position + 1]) {
            termination_flags[current_position] = true;
        }
    }

    value_list.forEach((val_item, index_pos) => {
        if (termination_flags[index_pos]) {
            adjustMapEntry(segment_frequencies, val_item);
        }
    });

    let cumulative_sum = Array.from(segment_frequencies.values()).reduce((accum, freq_val) => {
        const pairs_for_this_value = calculateCombinationsOfTwo(freq_val);
        return (accum + pairs_for_this_value) % prime_divisor;
    }, 0);

    process.stdout.write((cumulative_sum + 1) + '\n');
};

mainProcess();