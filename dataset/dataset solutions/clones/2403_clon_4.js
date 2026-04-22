// inputに入力データ全体が入る
function processInputData(input_data) {
    const data_lines = input_data.split("\n");
    const first_line_values = data_lines[0].split(" ").map(Number);
    const total_path_length = first_line_values[0];
    const maximum_leap = first_line_values[1];
    const terrain_map = data_lines[1];

    if (total_path_length <= maximum_leap) {
        console.log(total_path_length);
        return;
    }

    const exploration_queue = [];
    const discovered_points = new Set();

    exploration_queue.push([total_path_length, []]);
    discovered_points.add(total_path_length);

    let ultimate_segment = null;

    while (exploration_queue.length > 0) {
        const [current_position_marker, current_segment_trace] = exploration_queue.shift();

        for (let leap_span = 1; leap_span <= maximum_leap; leap_span++) {
            const next_position_marker = current_position_marker - leap_span;

            if (next_position_marker <= 0) {
                if (next_position_marker === 0) {
                    ultimate_segment = [...current_segment_trace, leap_span];
                    break;
                }
                continue;
            }

            if (terrain_map[next_position_marker - 1] === '0' && !discovered_points.has(next_position_marker)) {
                discovered_points.add(next_position_marker);
                exploration_queue.push([next_position_marker, [...current_segment_trace, leap_span]]);
            }
        }
        if (ultimate_segment !== null) {
            break;
        }
    }

    if (ultimate_segment === null) {
        console.log("-1");
    } else {
        console.log(ultimate_segment.join(" "));
    }
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));