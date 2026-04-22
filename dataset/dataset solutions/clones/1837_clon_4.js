function perpetual_cycle(initial_number, factor_alpha, factor_beta, factor_gamma, factor_delta) {
    let quotient_two_count = 0;
    let quotient_three_count = 0;
    let quotient_five_count = 0;

    while (initial_number % 2 === 0) {
        const halved_divisor = initial_number / 2;
        quotient_two_count++;
        perpetual_cycle(halved_divisor, factor_alpha, factor_beta, factor_gamma, factor_delta);
    }
    while (initial_number % 3 === 0) {
        const thirded_divisor = initial_number / 3;
        quotient_three_count++;
        perpetual_cycle(thirded_divisor, factor_alpha, factor_beta, factor_gamma, factor_delta);
    }
    while (initial_number % 5 === 0) {
        const fifthed_divisor = initial_number / 5;
        quotient_five_count++;
        perpetual_cycle(fifthed_divisor, factor_alpha, factor_beta, factor_gamma, factor_delta);
    }

    if (quotient_two_count === 0 && quotient_three_count === 0 && quotient_five_count === 0) {
        return Math.min(
            perpetual_cycle(initial_number + 1, factor_alpha, factor_beta, factor_gamma, factor_delta),
            perpetual_cycle(initial_number - 1, factor_alpha, factor_beta, factor_gamma, factor_delta)
        );
    }
}

function process_data(incoming_text_stream) {
    const all_lines = incoming_text_stream.split('\n');
    const data_rows = all_lines.slice(1);

    const processed_numerical_arrays = data_rows.map(line_content =>
        line_content.split(' ').map(Number)
    );

    const calculation_results = [];

    for (let record_idx = 0; record_idx < processed_numerical_arrays.length; record_idx++) {
        const current_record = processed_numerical_arrays[record_idx];
        const primary_number = current_record[0];
        const secondary_number = current_record[1];
        const tertiary_number = current_record[2];
        const quaternary_number = current_record[3];
        const quinary_number = current_record[4];

        calculation_results[record_idx] = perpetual_cycle(
            primary_number,
            secondary_number,
            tertiary_number,
            quaternary_number,
            quinary_number
        );
    }
}

process_data(require("fs").readFileSync("/dev/stdin", "utf8"));