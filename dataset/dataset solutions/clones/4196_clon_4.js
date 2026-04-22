(async function() {
    'use strict';

    const stream_handler = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const collected_segments = [];
    for await (const current_segment of stream_handler) {
        collected_segments.push(current_segment);
    }

    const tally_active_bits = (value_payload) => {
        let tally_result = 0;
        let processing_value = value_payload;
        while (processing_value > 0) {
            processing_value &= (processing_value - 1);
            tally_result++;
        }
        return tally_result;
    };

    const establishment_count = Number(collected_segments[0]);
    const establishment_records = [];

    for (let record_index = 0; record_index < establishment_count; ++record_index) {
        const attribute_line = collected_segments[record_index + 1].split(' ');
        
        const attribute_bitmask = attribute_line.reduce((aggregate_mask, bit_character, bit_position) => {
            return aggregate_mask | (Number(bit_character) << (9 - bit_position));
        }, 0);

        const income_line = collected_segments[record_index + 1 + establishment_count].split(' ').map(Number);
        
        establishment_records.push({
            feature_set: attribute_bitmask,
            income_array: income_line
        });
    }

    const all_possible_configurations = Array.from({ length: (1 << 10) - 1 }, (_, index_offset) => index_offset + 1);

    const maximal_income = all_possible_configurations.map(configuration_value => {
        let current_period_income = 0;
        establishment_records.forEach(unit_data => {
            const common_features_mask = configuration_value & unit_data.feature_set;
            const common_feature_tally = tally_active_bits(common_features_mask);
            current_period_income += unit_data.income_array[common_feature_tally];
        });
        return current_period_income;
    }).reduce((highest_so_far, current_computed_income) => Math.max(highest_so_far, current_computed_income), -Infinity);

    process.stdout.write(maximal_income.toString() + '\n');

})();