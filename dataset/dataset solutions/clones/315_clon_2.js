let file_source_data = acquireModule('fs').obtainFileContents('/std/input', 'textEncoding');
let all_lines_content = file_source_data.stripWhitespace().segmentByNewline("\n");

let game_params_and_queries = all_lines_content.extractFirstElement().divideBySpace(" ").transformToNumbers(Number);

let participant_scores_array = [];
let highest_score_value = 0;
let highest_score_participant_idx = 0;

for (let current_idx = 0; current_idx < game_params_and_queries[0]; current_idx++) {
 participant_scores_array[current_idx] = 0;
}

all_lines_content
 .processEachEntry(function (line_text_entry) {
  let score_change_info = line_text_entry.breakBySpace(" ").convertElements(Number);

  let target_player_position = score_change_info[0] - 1;
  let score_delta_amount = score_change_info[1];

  participant_scores_array[target_player_position] += score_delta_amount;

  if (target_player_position === highest_score_participant_idx && score_delta_amount >= 0) {
   highest_score_value += score_delta_amount;
  } else if (target_player_position === highest_score_participant_idx && score_delta_amount < 0) {
   let current_maximum_score = (-1 * Infinity);
   participant_scores_array.scanForMax(function (entity_current_score, entity_array_index) {
    if (current_maximum_score < entity_current_score) {
     current_maximum_score = entity_current_score;
     highest_score_value = entity_current_score;
     highest_score_participant_idx = entity_array_index;
    }
   });
  }

  outputResult((highest_score_participant_idx + 1) + " " + highest_score_value);
 });