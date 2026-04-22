const identify_problematic_positions = (element_sequence) => {
    const frequency_map = element_sequence.reduce((acc, item) => {
        acc.set(item, (acc.get(item) || 0) + 1);
        return acc;
    }, new Map());

    const repeated_elements = new Set(
        Array.from(frequency_map.entries())
             .filter(([, count]) => count >= 2)
             .map(([item,]) => item)
    );

    const positions_to_flag = element_sequence.reduce((acc, item, index) => {
        if (repeated_elements.has(item)) {
            acc.push(index);
        }
        return acc;
    }, []);

    return positions_to_flag;
};

var file_content = require('fs').readFileSync('/dev/stdin', 'utf8');
var processed_lines = file_content.trim().split('\n');

var number_of_grids = parseInt(processed_lines.shift(), 10);

Array.from({ length: number_of_grids }).forEach(() => {
    var current_grid_values = Array.from({ length: 9 }).map(() =>
        processed_lines.shift().split(' ').map(Number)
    );

    var cell_markers = new Set();

    Array.from({ length: 9 }).forEach((_, row_idx) => {
        const row_elements = current_grid_values[row_idx];
        const indices_to_update = identify_problematic_positions(row_elements);
        indices_to_update.forEach(col_idx => {
            cell_markers.add(`${row_idx},${col_idx}`);
        });
    });

    Array.from({ length: 9 }).forEach((_, col_idx) => {
        const column_elements = Array.from({ length: 9 }).map((_, row_idx) =>
            current_grid_values[row_idx][col_idx]
        );
        const indices_to_update = identify_problematic_positions(column_elements);
        indices_to_update.forEach(row_of_column_elements_idx => {
            cell_markers.add(`${row_of_column_elements_idx},${col_idx}`);
        });
    });

    Array.from({ length: 3 }).forEach((_, block_row_offset_multiplier) => {
        Array.from({ length: 3 }).forEach((_, block_col_offset_multiplier) => {
            const current_block_top_row = block_row_offset_multiplier * 3;
            const current_block_left_col = block_col_offset_multiplier * 3;

            const block_elements_and_coords = [];
            Array.from({ length: 3 }).forEach((_, r_offset) => {
                Array.from({ length: 3 }).forEach((_, c_offset) => {
                    const abs_row = current_block_top_row + r_offset;
                    const abs_col = current_block_left_col + c_offset;
                    block_elements_and_coords.push({
                        value: current_grid_values[abs_row][abs_col],
                        coordinates: `${abs_row},${abs_col}`
                    });
                });
            });

            const block_values = block_elements_and_coords.map(entry => entry.value);
            const indices_to_update = identify_problematic_positions(block_values);

            indices_to_update.forEach(block_element_idx => {
                cell_markers.add(block_elements_and_coords[block_element_idx].coordinates);
            });
        });
    });

    const output_grid_lines = current_grid_values.map((row_array, row_idx) => {
        return row_array.map((cell_value, col_idx) => {
            const marker_key = `${row_idx},${col_idx}`;
            return cell_markers.has(marker_key) ? `*${cell_value}` : ` ${cell_value}`;
        }).join('');
    });

    console.log(output_grid_lines.join('\n'));
});