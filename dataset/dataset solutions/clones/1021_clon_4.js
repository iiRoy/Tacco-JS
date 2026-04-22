const gatherAllInput = () => {
    return new Promise(resolveCallback => {
        let entire_input_stream_content = '';
        const system_input_channel = global.process.stdin;
        system_input_channel.resume();
        system_input_channel.setEncoding('utf8');
        system_input_channel.on('data', received_data_chunk => {
            entire_input_stream_content += received_data_chunk;
        });
        system_input_channel.on('end', () => {
            resolveCallback(entire_input_stream_content);
        });
    });
};

const analyzeInputText = (raw_data_block) => {
    const cleansed_block = raw_data_block.trim();
    const textual_segments = [];
    let current_segment_start_idx = 0;
    for (let i = 0; i < cleansed_block.length; i++) {
        if (cleansed_block[i] === '\n') {
            textual_segments.push(cleansed_block.substring(current_segment_start_idx, i));
            current_segment_start_idx = i + 1;
        }
    }
    if (current_segment_start_idx < cleansed_block.length) {
        textual_segments.push(cleansed_block.substring(current_segment_start_idx));
    }

    const first_instruction_line = textual_segments[0];
    const space_delimiter_pos = first_instruction_line.indexOf(' ');
    const schedule_duration_value = parseInt(first_instruction_line.substring(space_delimiter_pos + 1), 10);

    const initial_workload_tasks = [];
    for (let i = 1; i < textual_segments.length; i++) {
        const current_text_line = textual_segments[i];
        const line_space_pos = current_text_line.indexOf(' ');
        const task_designation = current_text_line.substring(0, line_space_pos);
        const required_execution_units = parseInt(current_text_line.substring(line_space_pos + 1), 10);
        initial_workload_tasks.push({
            designation: task_designation,
            units_remaining: required_execution_units,
            original_units: required_execution_units
        });
    }

    return {
        interval_length: schedule_duration_value,
        pending_operations: initial_workload_tasks
    };
};

const determineMinimumValue = (val_a, val_b) => (val_a < val_b ? val_a : val_b);

const processWorkCycle = (
    current_time_point,
    operational_queue_items,
    finalized_results_collection,
    allocated_interval_duration
) => {
    if (operational_queue_items.length === 0) {
        return finalized_results_collection;
    }

    const current_operation_handle = operational_queue_items[0];
    const remaining_queue_elements = operational_queue_items.slice(1);

    const execution_span_for_this_turn = determineMinimumValue(
        current_operation_handle.units_remaining,
        allocated_interval_duration
    );

    const next_time_point = current_time_point + execution_span_for_this_turn;

    const updated_operation_handle = {
        ...current_operation_handle,
        units_remaining: current_operation_handle.units_remaining - execution_span_for_this_turn
    };

    if (updated_operation_handle.units_remaining > 0) {
        const updated_operational_queue = remaining_queue_elements.concat(updated_operation_handle);
        return processWorkCycle(
            next_time_point,
            updated_operational_queue,
            finalized_results_collection,
            allocated_interval_duration
        );
    } else {
        const completed_operation_record = {
            ...updated_operation_handle,
            completion_moment: next_time_point
        };
        const updated_finalized_results = finalized_results_collection.concat(completed_operation_record);
        return processWorkCycle(
            next_time_point,
            remaining_queue_elements,
            updated_finalized_results,
            allocated_interval_duration
        );
    }
};

const presentFinalOutcomes = (outcomes_list) => {
    for (const record of outcomes_list) {
        global.console.log(record.designation, record.completion_moment);
    }
};

gatherAllInput()
    .then(raw_content_string => {
        const parsed_data = analyzeInputText(raw_content_string);
        const final_scheduled_events = processWorkCycle(
            0,
            parsed_data.pending_operations,
            [],
            parsed_data.interval_length
        );
        presentFinalOutcomes(final_scheduled_events);
    })
    .catch(error_message => {
        global.console.error('An issue occurred:', error_message);
    });