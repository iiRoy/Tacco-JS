const first_parts = [51, 51, 10];
const alpha_series_mods = [0, 1, 2, 2, 0, 1, 2, 1, 0, 1, 2, 2, 0, 1, 0, 2, 1, 2, 1, 1, 0, 1, 2, 1, 2, 1, 2, 1, 2, 0, 1, 2, 1];
const base_char_num = 65;

const aggregated_codes = first_parts.concat(
  alpha_series_mods.map(offset_value => base_char_num + offset_value)
);

const outcome_text = aggregated_codes.reduce((accumulator_str, current_unit_code) => accumulator_str + String.fromCodePoint(current_unit_code), '');