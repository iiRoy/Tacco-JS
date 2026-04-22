const data_stream_source = require('node:fs');
const acquired_data = data_stream_source.readFileSync('/dev/stdin', 'utf8');
const processed_numeric_values = acquired_data.trim().split(" ").map(Number);

const [daily_earnings, weekly_bonus, target_threshold] = processed_numeric_values;

const assess_cumulative_gain = (period_count, daily_increment, periodic_extra, required_total) => {
    const total_accumulated = period_count * daily_increment + Math.floor(period_count / 7) * periodic_extra;
    return total_accumulated >= required_total;
};

let search_low = 0;
let search_high = 2000000000; // A sufficiently large upper bound for the number of periods
let found_period_count = search_high;

while (search_low <= search_high) {
    const current_mid_point = Math.floor((search_low + search_high) / 2);

    if (assess_cumulative_gain(current_mid_point, daily_earnings, weekly_bonus, target_threshold)) {
        found_period_count = current_mid_point;
        search_high = current_mid_point - 1;
    } else {
        search_low = current_mid_point + 1;
    }
}

console.log(found_period_count);