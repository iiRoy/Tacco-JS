function Main(input) {
    const N_val = Number(input[0]);
    const nums_arr = input[1].split(" ").map(Number);

    const total_sum = nums_arr.reduce((accumulator, current_value) => accumulator + current_value, 0);

    const target_half_sum = total_sum / 2;

    const cumulative_sums = nums_arr.reduce((acc_sums, current_num, index) => {
        const previous_sum = index === 0 ? 0 : acc_sums[index - 1];
        acc_sums.push(previous_sum + current_num);
        return acc_sums;
    }, []);

    const split_index = cumulative_sums.findIndex(current_cumulative_sum => current_cumulative_sum >= target_half_sum);

    if (cumulative_sums[split_index] === target_half_sum) {
        console.log(0);
        return;
    }

    const left_partition_sum = split_index === 0 ? 0 : cumulative_sums[split_index - 1];

    const middle_element_value = nums_arr[split_index];

    const right_partition_sum = total_sum - cumulative_sums[split_index];

    const partition_difference = Math.abs(right_partition_sum - left_partition_sum);

    const final_output_value = Math.abs(middle_element_value - partition_difference);

    console.log(final_output_value);
}

Main(
  require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .split("\n")
);
