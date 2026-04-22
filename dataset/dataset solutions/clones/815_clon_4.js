global.process.stdin.resume();
global.process.stdin.setEncoding("utf8");
global.process.stdin.on("data", function (input_payload) {
    const complete_input_text = String(input_payload).trim();
    const input_lines_collection = complete_input_text.split("\n");

    function process_all_scenarios(source_lines_array, current_position) {
        if (current_position >= source_lines_array.length) {
            return;
        }

        const current_scenario_dimensions_str = source_lines_array[current_position];
        const parsed_dimensions = current_scenario_dimensions_str.split(/\s+/).map(Number);
        const item_quantity = parsed_dimensions[0];
        const operation_count = parsed_dimensions[1];

        if (item_quantity === 0 && operation_count === 0) {
            return;
        }

        let next_position_for_reading = current_position + 1;

        const unaffected_items_set = new Set([0]); // Item with index 0 is initially unaffected

        const ordered_operations_list = [];
        for (let operation_iterator = 0; operation_iterator < operation_count; ++operation_iterator) {
            const operation_line_content = source_lines_array[next_position_for_reading + operation_iterator];
            const operation_components = operation_line_content.split(/\s+/).map(Number);
            ordered_operations_list.push({
                timestamp: operation_components[0],
                source_item_id: operation_components[1] - 1,
                target_item_id: operation_components[2] - 1
            });
        }
        next_position_for_reading += operation_count;

        ordered_operations_list.sort((op_a, op_b) => {
            if (op_a.timestamp !== op_b.timestamp) {
                return op_a.timestamp - op_b.timestamp;
            }
            if (op_a.source_item_id !== op_b.source_item_id) {
                return op_a.source_item_id - op_b.source_item_id;
            }
            return op_a.target_item_id - op_b.target_item_id;
        });

        ordered_operations_list.forEach(single_operation => {
            if (unaffected_items_set.has(single_operation.source_item_id)) {
                unaffected_items_set.add(single_operation.target_item_id);
            }
        });

        const final_unaffected_count = unaffected_items_set.size;

        global.console.log(final_unaffected_count);

        process_all_scenarios(source_lines_array, next_position_for_reading);
    }

    process_all_scenarios(input_lines_collection, 0);
});