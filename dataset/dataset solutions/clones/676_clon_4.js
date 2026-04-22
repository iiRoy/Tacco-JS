const operation_set_union = (current_state) => {
    if (current_state.v1 >= 1 && current_state.v2 >= 1 && current_state.v3 >= 1) {
        return { v1: current_state.v1 - 1, v2: current_state.v2 - 1, v3: current_state.v3 - 1, points: 1 };
    }
    return { ...current_state, points: 0 };
};

const operation_deduct_v1 = (current_state) => {
    if (current_state.v1 >= 3) {
        return { v1: current_state.v1 - 3, v2: current_state.v2, v3: current_state.v3, points: 1 };
    }
    return { ...current_state, points: 0 };
};

const operation_deduct_v2 = (current_state) => {
    if (current_state.v2 >= 3) {
        return { v1: current_state.v1, v2: current_state.v2 - 3, v3: current_state.v3, points: 1 };
    }
    return { ...current_state, points: 0 };
};

const operation_deduct_v3 = (current_state) => {
    if (current_state.v3 >= 3) {
        return { v1: current_state.v1, v2: current_state.v2, v3: current_state.v3 - 3, points: 1 };
    }
    return { ...current_state, points: 0 };
};

const sequence_model_one = [operation_set_union, operation_deduct_v1, operation_deduct_v2, operation_deduct_v3];
const sequence_model_two = [operation_set_union, operation_set_union, operation_deduct_v1, operation_deduct_v2, operation_deduct_v3];
const sequence_model_three = [operation_deduct_v1, operation_deduct_v2, operation_deduct_v3, operation_set_union];

const calculate_model_outcome = (initial_v1, initial_v2, initial_v3, operation_plan) => {
    let current_v1 = initial_v1;
    let current_v2 = initial_v2;
    let current_v3 = initial_v3;
    let total_accumulated_points = 0;

    let cycle_performed_action;
    do {
        cycle_performed_action = false;
        for (const op_func of operation_plan) {
            const operation_result = op_func({ v1: current_v1, v2: current_v2, v3: current_v3 });
            if (operation_result.points > 0) {
                current_v1 = operation_result.v1;
                current_v2 = operation_result.v2;
                current_v3 = operation_result.v3;
                total_accumulated_points += operation_result.points;
                cycle_performed_action = true;
            }
        }
    } while (cycle_performed_action);

    return total_accumulated_points;
};

const obtain_score_model_one = (val1, val2, val3) => calculate_model_outcome(val1, val2, val3, sequence_model_one);
const obtain_score_model_two = (val1, val2, val3) => calculate_model_outcome(val1, val2, val3, sequence_model_two);
const obtain_score_model_three = (val1, val2, val3) => calculate_model_outcome(val1, val2, val3, sequence_model_three);

const prepare_resource_for_models = (initial_quantity) => {
    const base_triples = Math.floor(initial_quantity / 3);
    const remainder = initial_quantity % 3;

    if (base_triples > 0) {
        return { initial_points_contribution: base_triples - 1, quantity_for_model: remainder + 3 };
    } else {
        return { initial_points_contribution: 0, quantity_for_model: initial_quantity };
    }
};

const process_input_line_data = (valA, valB, valC, valD, valE, valF) => {
    const combined_valA = valA + valD;
    const combined_valB = valB + valE;
    const combined_valC = valC + valF;

    let final_point_total = 0;

    const prep_A = prepare_resource_for_models(combined_valA);
    const prep_B = prepare_resource_for_models(combined_valB);
    const prep_C = prepare_resource_for_models(combined_valC);

    final_point_total += prep_A.initial_points_contribution;
    final_point_total += prep_B.initial_points_contribution;
    final_point_total += prep_C.initial_points_contribution;

    const model_input_A = prep_A.quantity_for_model;
    const model_input_B = prep_B.quantity_for_model;
    const model_input_C = prep_C.quantity_for_model;

    const result_one = obtain_score_model_one(model_input_A, model_input_B, model_input_C);
    const result_two = obtain_score_model_two(model_input_A, model_input_B, model_input_C);
    const result_three = obtain_score_model_three(model_input_A, model_input_B, model_input_C);

    final_point_total += Math.max(result_one, result_two, result_three);

    return final_point_total;
};

const acquired_raw_data = require('fs').readFileSync('/dev/stdin', 'utf8');
const processed_data_lines = acquired_raw_data.trim().split("\n");

const iterate_and_compute_results = (data_segments) => {
    if (data_segments.length === 0) {
        return;
    }
    const current_segment_string = data_segments[0];
    if (current_segment_string === "0 0 0 0 0 0") {
        return;
    }

    const numerical_payload = current_segment_string.split(" ").map(Number);
    const computed_outcome = process_input_line_data(...numerical_payload);
    console.log(computed_outcome);

    iterate_and_compute_results(data_segments.slice(1));
};

iterate_and_compute_results(processed_data_lines);