(function measure_aqueous_reservoirs() {
    // Input acquisition from standard input
    let raw_terrain_data = process.stdin.readFileSync(0, 'utf8').trim().split('');

    // Preliminary boundary processing to identify effective terrain for water collection
    // Find the first descending slope marker ('\') and the last ascending slope marker ('/')
    let initial_downslope_marker = raw_terrain_data.indexOf('\\');
    let final_upslope_marker = raw_terrain_data.lastIndexOf('/');

    // If no valid container boundaries are found, or they are out of order, no water can be collected.
    if (initial_downslope_marker === -1 || final_upslope_marker === -1 || initial_downslope_marker > final_upslope_marker) {
        console.log(0);
        console.log('');
        return;
    }

    // Extract the relevant segment of the terrain symbols
    let processed_terrain_symbols = raw_terrain_data.slice(initial_downslope_marker, final_upslope_marker + 1);

    // Generate a topographical profile (elevation map) from the symbols
    let topographical_profile = [0]; // Start at a normalized ground level
    let current_vertical_level = 0;

    for (let p = 0; p < processed_terrain_symbols.length; p++) {
        let feature_symbol = processed_terrain_symbols[p];
        if (feature_symbol === '\\') {
            current_vertical_level -= 1; // Descending slope
        } else if (feature_symbol === '/') {
            current_vertical_level += 1; // Ascending slope
        }
        // For flat ground ('_'), current_vertical_level remains unchanged
        topographical_profile.push(current_vertical_level);
    }

    // Helper function to find the maximum elevation within a sequence of points
    function retrieve_highest_point(level_sequence) {
        if (level_sequence.length === 0) return -Infinity;
        let peak_value = level_sequence[0];
        for (let i = 1; i < level_sequence.length; i++) {
            if (level_sequence[i] > peak_value) {
                peak_value = level_sequence[i];
            }
        }
        return peak_value;
    }

    // Recursive function to evaluate and sum trapped liquid reservoirs
    // This function processes the terrain segment by segment, identifying and calculating water pockets
    function evaluate_liquid_capacity(segment_points) {
        // Base case: A segment needs at least two points to potentially form a boundary and a drop
        if (segment_points.length < 2) {
            return { total_volume: 0, collected_pockets: [] };
        }

        let leading_edge_level = segment_points[0];
        let remaining_contour = segment_points.slice(1); // The rest of the terrain after the leading edge

        // Condition 1: Check if there's an immediate drop after the leading edge
        if (remaining_contour.length > 0 && remaining_contour[0] < leading_edge_level) {
            // Condition 2: Check if there's a subsequent point that can act as a right wall (at least as high)
            let max_in_remainder = retrieve_highest_point(remaining_contour);

            if (leading_edge_level <= max_in_remainder) {
                // A valid left boundary for a potential reservoir has been identified
                let current_pocket_fill = 0;
                let trailing_edge_index_in_remainder = -1; // Index in `remaining_contour`

                // Calculate the water trapped until a matching right wall is found
                for (let k = 0; k < remaining_contour.length; k++) {
                    if (remaining_contour[k] >= leading_edge_level) {
                        trailing_edge_index_in_remainder = k;
                        break; // Right wall found
                    }
                    current_pocket_fill += (leading_edge_level - remaining_contour[k]);
                }

                // If a right wall was found (which should always be the case given `max_in_remainder` check)
                // Recursively process the terrain from the point of the right wall onwards
                let recursive_result = evaluate_liquid_capacity(remaining_contour.slice(trailing_edge_index_in_remainder));
                if (current_pocket_fill > 0) {
                    recursive_result.total_volume += current_pocket_fill;
                    // Add the current pocket amount to the front of the list to maintain original left-to-right order
                    recursive_result.collected_pockets.unshift(current_pocket_fill);
                }
                return recursive_result;
            } else {
                // If no sufficiently high right wall exists for this `leading_edge_level`,
                // this point cannot form a valid reservoir's left boundary.
                // Recursively process the rest of the terrain, effectively skipping this point as a left boundary.
                return evaluate_liquid_capacity(remaining_contour);
            }
        } else {
            // If there's no immediate drop or the segment is too short, this point cannot start a reservoir.
            // Recursively process the rest of the terrain.
            return evaluate_liquid_capacity(remaining_contour);
        }
    }

    // Initiate the recursive calculation process
    let reservoir_calculation_outcome = evaluate_liquid_capacity(topographical_profile);

    // Output the total collected liquid volume
    console.log(reservoir_calculation_outcome.total_volume);

    // Output the count and individual volumes of collected liquid pockets
    console.log(reservoir_calculation_outcome.collected_pockets.length
        ? reservoir_calculation_outcome.collected_pockets.length + ' ' + reservoir_calculation_outcome.collected_pockets.join(' ')
        : '');
})();