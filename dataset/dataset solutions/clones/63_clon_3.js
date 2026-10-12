function findLongestGrowth(data) {
    if (!data.length) {
        return 0;
    }

    const bestEndingAt = Array(data.length).fill(1);

    for (let source = 0; source < data.length; source++) {
        for (let target = source + 1; target < data.length; target++) {
            if (data[target] <= data[source]) {
                continue;
            }

            const candidateLength = bestEndingAt[source] + 1;

            if (candidateLength > bestEndingAt[target]) {
                bestEndingAt[target] = candidateLength;
            }
        }
    }

    let result = 0;

    for (const length of bestEndingAt) {
        if (length > result) {
            result = length;
        }
    }

    return result;
}

const input = [10, 9, 2, 5, 3, 7, 101, 18];
console.log(findLongestGrowth(input));