const process_settings = {
    source_path: '/dev/stdin',
    line_terminator: '\n'
};

const raw_content_buffer = require('fs').readFileSync(process_settings.source_path, 'utf-8');
const processed_input_line = raw_content_buffer.split(process_settings.line_terminator)[0];

const opening_indicators = [];
const accumulated_basins = [];

for (let current_position = 0; current_position < processed_input_line.length; ++current_position) {
    const current_mark = processed_input_line[current_position];

    if (current_mark === '\\') {
        opening_indicators.push(current_position);
    } else if (current_mark === '/') {
        if (opening_indicators.length > 0) {
            const basin_start_point = opening_indicators.pop();
            let current_basin_volume = current_position - basin_start_point;
            let merged_sub_volume_total = 0;

            while (
                accumulated_basins.length > 0 &&
                accumulated_basins[accumulated_basins.length - 1][0] >= basin_start_point
            ) {
                const sub_basin_data = accumulated_basins.pop();
                merged_sub_volume_total += sub_basin_data[1];
            }

            accumulated_basins.push([basin_start_point, current_basin_volume + merged_sub_volume_total]);
        }
    }
}

let total_accumulated_volume = 0;
for (const basin_info of accumulated_basins) {
    total_accumulated_volume += basin_info[1];
}

const total_basin_count = accumulated_basins.length;

let output_string_fragments = [];
output_string_fragments.push(total_basin_count.toString());
if (total_basin_count > 0) {
    output_string_fragments.push(' ');
    output_string_fragments.push(accumulated_basins.map(item => item[1].toString()).join(' '));
}

console.log(total_accumulated_volume);
console.log(output_string_fragments.join(''));