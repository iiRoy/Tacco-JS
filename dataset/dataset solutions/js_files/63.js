function longestIncreasingSubsequence(numbers) {
    if (numbers.length === 0) {
        return 0;
    }

    const lengths = new Array(numbers.length).fill(1);
    let maximumLength = 1;

    for (let current = 1; current < numbers.length; current++) {
        for (let previous = 0; previous < current; previous++) {
            if (numbers[previous] < numbers[current]) {
                lengths[current] = Math.max(
                    lengths[current],
                    lengths[previous] + 1
                );
            }
        }

        maximumLength = Math.max(maximumLength, lengths[current]);
    }

    return maximumLength;
}

const values = [10, 9, 2, 5, 3, 7, 101, 18];
console.log(longestIncreasingSubsequence(values));