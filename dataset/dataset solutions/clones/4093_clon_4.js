const global_file_system = require('fs');

const extractData = (stream_descriptor_id, encoding_type) => {
    const buffer_capacity = 1024 * 1024; // 1MB buffer
    const content_buffer = Buffer.alloc(buffer_capacity);
    let bytes_read_count = 0;
    try {
        bytes_read_count = global_file_system.readSync(stream_descriptor_id, content_buffer, 0, buffer_capacity, 0);
    } catch (reading_error) {
        // Fallback for non-standard stdin or for testing environments
        return global_file_system.readFileSync('/dev/stdin', 'utf8');
    }
    return content_buffer.toString(encoding_type, 0, bytes_read_count);
};

const processOperation = (incoming_text) => {
    const textual_segments = incoming_text.split('\n').filter(Boolean);
    if (textual_segments.length < 2) {
        return '-1';
    }

    const operation_count_match = textual_segments[0].match(/\d+/);
    const operation_count_val = operation_count_match ? Number(operation_count_match[0]) : 0;

    const divisor_sequence_str = textual_segments[1].split(' ');
    const divisor_collection = divisor_sequence_str.map(val => Number(val));

    const terminal_divisor_idx = operation_count_val - 1;
    const terminal_divisor_value = divisor_collection[terminal_divisor_idx];

    if (terminal_divisor_value === undefined || terminal_divisor_value > 2) {
        return '-1';
    }
    
    const current_interval_state = {
        lower_limit: 2,
        upper_limit: 3,
        has_error: false
    };

    const relevant_divisors = divisor_collection.slice(0, terminal_divisor_idx);

    const calculated_range = relevant_divisors.reduceRight((current_bounds, current_factor) => {
        if (current_bounds.has_error) {
            return current_bounds;
        }

        const ceiling_func = Math.ceil;
        const floor_func = Math.floor;

        const prospective_lower = ceiling_func(current_bounds.lower_limit / current_factor) * current_factor;
        const prospective_upper = floor_func(current_bounds.upper_limit / current_factor) * current_factor + current_factor - 1;

        if (prospective_upper < current_factor || prospective_lower > prospective_upper) {
            return { lower_limit: 0, upper_limit: 0, has_error: true };
        }

        return {
            lower_limit: prospective_lower,
            upper_limit: prospective_upper,
            has_error: false
        };
    }, current_interval_state);

    if (calculated_range.has_error) {
        return '-1';
    } else {
        return `${calculated_range.lower_limit} ${calculated_range.upper_limit}`;
    }
};

console.log(processOperation(extractData(process.stdin.fd, 'utf8')));