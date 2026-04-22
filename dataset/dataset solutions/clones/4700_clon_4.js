"use strict";
let collected_data_segments = [];
let data_processor_instance;
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(portion) {
    collected_data_segments.push(portion);
});
process.stdin.on('end', function() {
    const combined_raw_text = collected_data_segments.join('').trim();
    const structured_lines = combined_raw_text.split('\n');
    class InputManager {
        constructor(records) {
            this.data_records = records;
            this.current_position_marker = 0;
            this.total_record_count = records.length;
        }
        has_more_records() {
            return this.current_position_marker < this.total_record_count;
        }
        fetch_next_record() {
            if (!this.has_more_records()) {
                throw new Error("End of input reached unexpectedly.");
            }
            return this.data_records[this.current_position_marker++];
        }
    }
    data_processor_instance = new InputManager(structured_lines);
    const get_next_line = () => data_processor_instance.fetch_next_record();
    const convert_to_integer = (val_str) => +val_str;
    const get_integer_array = () => get_next_line().match(/\S+/g).map(convert_to_integer);
    const emit_output = (...values) => console.log(...values);
    const run_main_logic = () => {
        const [value_alpha, value_beta] = get_integer_array();
        let final_outcome;
        final_outcome = (value_beta <= (2 * value_alpha)) * Math.floor(value_beta / 2) +
                        (value_beta > (2 * value_alpha)) * Math.floor((2 * value_alpha + value_beta) / 4);
        emit_output(final_outcome);
    };
    run_main_logic();
});