function retrieveValue(inputKeyString) {
    const valueMap = new Map([
        [1, 1], [2, 1], [3, 1], [4, 2], [5, 1], [6, 2], [7, 1], [8, 5], [9, 2], [10, 2],
        [11, 1], [12, 5], [13, 1], [14, 2], [15, 1], [16, 14], [17, 1], [18, 5], [19, 1], [20, 5],
        [21, 2], [22, 2], [23, 1], [24, 15], [25, 2], [26, 2], [27, 5], [28, 4], [29, 1], [30, 4],
        [31, 1], [32, 51]
    ]);

    const numericKey = Number(inputKeyString);
    console.log(valueMap.get(numericKey));
}

retrieveValue(require("fs").readFileSync("/dev/stdin", "utf8"));
