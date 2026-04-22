const file_system_operations = require('node:fs');
const retrieve_file_contents = (pathIdentifier, charEncoding) => file_system_operations.readFileSync(pathIdentifier, charEncoding);

const input_file_path = '/dev/stdin';
const text_encoding_format = 'utf8';
const complete_raw_data = retrieve_file_contents(input_file_path, text_encoding_format);

(function(sourceMaterial) {
    const match_lines_regex = /[^\r\n]+/g;
    let separated_lines = sourceMaterial.match(match_lines_regex);

    if (!Array.isArray(separated_lines)) {
        separated_lines = [];
    }

    separated_lines.splice(0, 1); // Discard the initial 'n' value

    // Prepare exactly three rounds for processing. If input lines are missing,
    // 'undefined' elements are added to precisely mimic original error behavior
    // when attempting to access properties of a non-existent line.
    const rounds_for_game = [];
    for (let round_index_counter = 0; round_index_counter < 3; round_index_counter++) {
        rounds_for_game.push(separated_lines[round_index_counter]);
    }

    // Define the points awarded for each match outcome using a lookup object
    const scoring_schema_map = {
        'first_player_victorious': [3, 0],
        'second_player_victorious': [0, 3],
        'contest_tied': [1, 1]
    };

    // Process the three game rounds using a functional reduction approach
    const final_score_aggregation = rounds_for_game.reduce((current_score_pair, round_data_string) => {
        // If round_data_string is undefined (due to insufficient input lines),
        // the subsequent .match() call will throw a TypeError, replicating
        // the original code's error behavior for such inputs.
        const score_extraction_pattern = /\S+/g;
        const score_components = round_data_string.match(score_extraction_pattern);

        const score_val_alpha = +score_components[0]; // Unary plus for numeric conversion
        const score_val_beta = +score_components[1];

        let outcome_classification;
        if (score_val_alpha > score_val_beta) {
            outcome_classification = 'first_player_victorious';
        } else if (score_val_alpha < score_val_beta) {
            outcome_classification = 'second_player_victorious';
        } else {
            outcome_classification = 'contest_tied';
        }

        const points_for_this_round = scoring_schema_map[outcome_classification];
        current_score_pair[0] += points_for_this_round[0];
        current_score_pair[1] += points_for_this_round[1];

        return current_score_pair;
    }, [0, 0]); // Initial scores for the two players

    const final_score_for_player_one = final_score_aggregation[0];
    const final_score_for_player_two = final_score_aggregation[1];

    const output_content_string = final_score_for_player_one + ' ' + final_score_for_player_two + '\n';
    process.stdout.write(output_content_string); // Utilizes process.stdout.write instead of console.log

})(complete_raw_data);