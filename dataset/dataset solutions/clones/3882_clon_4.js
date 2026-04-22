'use strict';

const expedition_manager = (initial_data_string) => {
    const parse_numeric_sequence = (raw_text) => raw_text.trim().split(/\s+/).map(Number);

    const numerical_components = parse_numeric_sequence(initial_data_string);
    const stop_count = numerical_components.shift();
    const circuit_length = numerical_components.shift();

    const waypoint_catalog = [];
    for (let i = 0; i < stop_count; ++i) {
        waypoint_catalog.push({
            position: numerical_components[2 * i],
            yield: numerical_components[2 * i + 1]
        });
    }

    // --- Phase 1: Clockwise (Forward) Journey Segment Calculations ---
    let current_accumulated_yield_forward = 0;
    const forward_journey_segments = waypoint_catalog.map(point => {
        current_accumulated_yield_forward += point.yield;
        return {
            location_on_track: point.position,
            cumulative_gain_forward: current_accumulated_yield_forward,
            net_profit_straight_forward: current_accumulated_yield_forward - point.position
        };
    });

    const max_forward_profit_prefix = forward_journey_segments.reduce((acc, segment) => {
        const current_max = acc.length > 0 ? Math.max(acc[acc.length - 1], segment.net_profit_straight_forward) : segment.net_profit_straight_forward;
        acc.push(current_max);
        return acc;
    }, []);

    // --- Phase 2: Counter-Clockwise (Backward) Journey Segment Calculations ---
    const total_global_yield = current_accumulated_yield_forward; // Total yield from all waypoints

    const backward_journey_segments = waypoint_catalog.map((point, index) => {
        const previous_forward_yield_sum = (index === 0) ? 0 : forward_journey_segments[index - 1].cumulative_gain_forward;
        const cumulative_gain_backward_from_here = total_global_yield - previous_forward_yield_sum;
        const backward_distance_to_location = circuit_length - point.position;
        return {
            location_on_track: point.position,
            distance_travelled_backward: backward_distance_to_location,
            cumulative_gain_backward: cumulative_gain_backward_from_here,
            net_profit_straight_backward: cumulative_gain_backward_from_here - backward_distance_to_location
        };
    });

    const max_backward_profit_suffix = backward_journey_segments.reduceRight((acc, segment) => {
        const current_max = acc.length > 0 ? Math.max(acc[0], segment.net_profit_straight_backward) : segment.net_profit_straight_backward;
        acc.unshift(current_max);
        return acc;
    }, []);

    // --- Phase 3: Combined Path Calculations (Forward then Backward) ---
    const forward_then_backward_profit_options = forward_journey_segments.map((fw_segment, idx) => {
        const initial_forward_net = fw_segment.net_profit_straight_forward;
        const cost_to_retrace_to_origin = fw_segment.location_on_track;
        const subsequent_max_backward_net = (idx + 1 < stop_count) ? max_backward_profit_suffix[idx + 1] : 0;
        return initial_forward_net - cost_to_retrace_to_origin + subsequent_max_backward_net;
    });

    // --- Phase 4: Combined Path Calculations (Backward then Forward) ---
    const backward_then_forward_profit_options = backward_journey_segments.map((bw_segment, idx) => {
        if (idx === 0) return -Infinity; // Cannot go forward 'before' the initial backward stop.
        const initial_backward_net = bw_segment.net_profit_straight_backward;
        const cost_to_retrace_to_origin = bw_segment.distance_travelled_backward;
        const subsequent_max_forward_net = max_forward_profit_prefix[idx - 1];
        return initial_backward_net - cost_to_retrace_to_origin + subsequent_max_forward_net;
    });

    // --- Phase 5: Determine Overall Maximum Value ---
    const all_potential_outcomes = [0]; // Option to undertake no journey (0 profit)
    all_potential_outcomes.push(...max_forward_profit_prefix);
    all_potential_outcomes.push(...max_backward_profit_suffix);
    all_potential_outcomes.push(...forward_then_backward_profit_options);
    all_potential_outcomes.push(...backward_then_forward_profit_options);

    const ultimate_expedition_value = Math.max(...all_potential_outcomes);
    console.log(ultimate_expedition_value);
};

expedition_manager(require('fs').readFileSync('/dev/stdin', 'utf8'));